import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

export type SqlValue = string | number | bigint | null | Uint8Array;

export class Database {
  readonly sqlite: DatabaseSync;
  readonly path: string;

  constructor(path: string, busyTimeoutMs = 5_000) {
    this.path = path;
    if (path !== ":memory:") {
      mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    }
    this.sqlite = new DatabaseSync(path);
    this.sqlite.exec(`PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = ${busyTimeoutMs};`);
    if (path !== ":memory:" && existsSync(path)) chmodSync(path, 0o600);
  }

  migrate(migrationsPath = resolve("migrations")): void {
    this.sqlite.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
    const files = this.migrationFiles(migrationsPath);
    const checksumColumn = this.hasMigrationChecksum();
    const applied = new Map(this.all<{ version: string; checksum?: string | null }>(`SELECT version${checksumColumn ? ", checksum" : ""} FROM schema_migrations`).map((row) => [row.version, row.checksum]));
    for (const migration of files) {
      if (applied.has(migration.version)) {
        const recorded = applied.get(migration.version);
        if (recorded && recorded !== migration.checksum) throw new Error(`Migration checksum mismatch: ${migration.version}`);
        continue;
      }
      this.sqlite.exec("BEGIN IMMEDIATE");
      try {
        this.sqlite.exec(migration.sql);
        if (this.hasMigrationChecksum()) {
          this.run("INSERT INTO schema_migrations(version, applied_at, checksum) VALUES (?, ?, ?)", migration.version, new Date().toISOString(), migration.checksum);
        } else {
          this.run("INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)", migration.version, new Date().toISOString());
        }
        this.sqlite.exec("COMMIT");
      } catch (error) {
        this.sqlite.exec("ROLLBACK");
        throw error;
      }
    }
    if (this.hasMigrationChecksum()) {
      for (const migration of files) this.run("UPDATE schema_migrations SET checksum=? WHERE version=? AND checksum IS NULL", migration.checksum, migration.version);
    }
  }

  assertMigrationsApplied(migrationsPath = resolve("migrations")): void {
    const table = this.get<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'");
    if (!table) throw new Error("Database migrations have not been applied");
    if (!this.hasMigrationChecksum()) throw new Error("Database migration metadata is outdated");
    const applied = new Map(this.all<{ version: string; checksum: string | null }>("SELECT version,checksum FROM schema_migrations").map((row) => [row.version, row.checksum]));
    for (const migration of this.migrationFiles(migrationsPath)) {
      if (!applied.has(migration.version)) throw new Error(`Pending database migration: ${migration.version}`);
      if (applied.get(migration.version) !== migration.checksum) throw new Error(`Migration checksum mismatch: ${migration.version}`);
    }
    this.get("SELECT 1");
  }

  checkpoint(): void { this.sqlite.exec("PRAGMA wal_checkpoint(PASSIVE)"); }

  run(sql: string, ...params: SqlValue[]): { changes: number; lastInsertRowid: number | bigint } {
    const result = this.sqlite.prepare(sql).run(...params);
    return { changes: Number(result.changes), lastInsertRowid: result.lastInsertRowid };
  }

  get<T>(sql: string, ...params: SqlValue[]): T | undefined {
    return this.sqlite.prepare(sql).get(...params) as T | undefined;
  }

  all<T>(sql: string, ...params: SqlValue[]): T[] {
    return this.sqlite.prepare(sql).all(...params) as T[];
  }

  transaction<T>(operation: () => T): T {
    this.sqlite.exec("BEGIN");
    try {
      const result = operation();
      this.sqlite.exec("COMMIT");
      return result;
    } catch (error) {
      this.sqlite.exec("ROLLBACK");
      throw error;
    }
  }

  close(): void { this.sqlite.close(); }

  private hasMigrationChecksum(): boolean {
    return this.all<{ name: string }>("PRAGMA table_info(schema_migrations)").some((column) => column.name === "checksum");
  }

  private migrationFiles(migrationsPath: string): Array<{ version: string; sql: string; checksum: string }> {
    return readdirSync(migrationsPath).filter((name) => name.endsWith(".sql")).sort().map((version) => {
      const sql = readFileSync(resolve(migrationsPath, version), "utf8");
      return { version, sql, checksum: createHash("sha256").update(sql).digest("hex") };
    });
  }
}
