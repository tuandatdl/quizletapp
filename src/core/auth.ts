import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import type { Database } from "../db/database.js";
import { errors } from "../shared/errors.js";
import type { AuthUser } from "../shared/schemas.js";

interface UserRow { id: string; name: string; email: string; avatar: string | null; password_hash: string }

function passwordHash(password: string, salt = randomBytes(16).toString("hex")): string {
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function passwordMatches(password: string, stored: string): boolean {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

const publicUser = (row: UserRow): AuthUser => ({ id: row.id, name: row.name, email: row.email, avatar: row.avatar });

export class AuthService {
  constructor(private readonly db: Database, private readonly sessionTtlDays: number) {}

  cleanupExpiredSessions(now = new Date().toISOString()): number {
    return this.db.run("DELETE FROM sessions WHERE expires_at<=?", now).changes;
  }

  register(input: { name: string; email: string; password: string }): { user: AuthUser; token: string } {
    const email = input.email.toLowerCase();
    if (this.db.get("SELECT id FROM users WHERE email = ?", email)) throw errors.conflict("Email is already registered");
    const id = randomUUID();
    const now = new Date().toISOString();
    this.db.transaction(() => {
      this.db.run("INSERT INTO users(id,name,email,password_hash,created_at,updated_at) VALUES(?,?,?,?,?,?)", id, input.name, email, passwordHash(input.password), now, now);
      this.db.run("INSERT INTO user_settings(user_id) VALUES(?)", id);
    });
    const user = this.db.get<UserRow>("SELECT id,name,email,avatar,password_hash FROM users WHERE id = ?", id)!;
    return { user: publicUser(user), token: this.issueSession(id) };
  }

  login(input: { email: string; password: string }): { user: AuthUser; token: string } {
    const row = this.db.get<UserRow>("SELECT id,name,email,avatar,password_hash FROM users WHERE email = ?", input.email.toLowerCase());
    if (!row || !passwordMatches(input.password, row.password_hash)) throw errors.unauthorized("Invalid email or password");
    return { user: publicUser(row), token: this.issueSession(row.id) };
  }

  authenticate(token: string | undefined): AuthUser {
    if (!token) throw errors.unauthorized();
    const row = this.db.get<UserRow>(`SELECT u.id,u.name,u.email,u.avatar,u.password_hash FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?`, createHash("sha256").update(token).digest("hex"), new Date().toISOString());
    if (!row) throw errors.unauthorized("Session is invalid or expired");
    return publicUser(row);
  }

  logout(token: string): void {
    this.db.run("DELETE FROM sessions WHERE token_hash=?", createHash("sha256").update(token).digest("hex"));
  }

  private issueSession(userId: string): string {
    this.cleanupExpiredSessions();
    const token = randomBytes(32).toString("base64url");
    const expires = new Date(Date.now() + this.sessionTtlDays * 86_400_000).toISOString();
    this.db.run("INSERT INTO sessions(id,user_id,token_hash,expires_at,created_at) VALUES(?,?,?,?,?)", randomUUID(), userId, createHash("sha256").update(token).digest("hex"), expires, new Date().toISOString());
    return token;
  }
}
