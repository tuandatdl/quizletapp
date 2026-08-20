import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function readDirRecursive(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== "dist") {
        results = results.concat(readDirRecursive(filePath));
      }
    } else {
      results.push(filePath);
    }
  }
  return results;
}

describe("Security Hardening & Regression Suite", () => {
  describe("1. Frontend Secret Absence", () => {
    const frontendFiles = readDirRecursive(path.join(root, "src/frontend"));

    it("ensures no service_role key or reference exists in frontend code", () => {
      for (const file of frontendFiles) {
        const content = fs.readFileSync(file, "utf-8");
        expect(content).not.toMatch(/service_role/i);
        expect(content).not.toMatch(/SUPABASE_SERVICE_ROLE/i);
      }
    });

    it("ensures no raw API keys or private keys are embedded in frontend source", () => {
      const secretPatterns = [
        /AIza[0-9A-Za-z-_]{35}/,
        /sk-[a-zA-Z0-9]{20,}/,
        /ghp_[a-zA-Z0-9]{36}/,
        /github_pat_[a-zA-Z0-9_]{50,}/,
        /-----BEGIN (?:RSA )?PRIVATE KEY-----/,
      ];

      for (const file of frontendFiles) {
        const content = fs.readFileSync(file, "utf-8");
        for (const pattern of secretPatterns) {
          expect(content).not.toMatch(pattern);
        }
      }
    });
  });

  describe("2. XSS and Browser Security", () => {
    const frontendFiles = readDirRecursive(path.join(root, "src/frontend"));

    it("ensures no dangerouslySetInnerHTML, innerHTML, or eval in frontend", () => {
      for (const file of frontendFiles) {
        const content = fs.readFileSync(file, "utf-8");
        expect(content).not.toContain("dangerouslySetInnerHTML");
        expect(content).not.toContain(".innerHTML");
        expect(content).not.toMatch(/\beval\s*\(/);
        expect(content).not.toMatch(/new\s+Function\s*\(/);
        expect(content).not.toContain("document.write");
      }
    });

    it("configures strict referrer policy in index.html", () => {
      const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf-8");
      expect(indexHtml).toContain('<meta name="referrer" content="strict-origin-when-cross-origin" />');
    });
  });

  describe("3. Cloudflare Worker Security Boundary", () => {
    const workerSrcDir = path.join(root, "cloudflare/worker/src");
    const workerFiles = readDirRecursive(workerSrcDir);

    it("ensures Worker source code does not hardcode API keys", () => {
      for (const file of workerFiles) {
        const content = fs.readFileSync(file, "utf-8");
        expect(content).not.toMatch(/AIza[0-9A-Za-z-_]{35}/);
        expect(content).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
      }
    });

    it("ensures Worker wrangler.toml contains no secrets", () => {
      const wranglerPath = path.join(root, "cloudflare/worker/wrangler.toml");
      const wrangler = fs.readFileSync(wranglerPath, "utf-8");
      expect(wrangler).not.toContain("GEMINI_API_KEY");
      expect(wrangler).not.toContain("API_KEY");
      expect(wrangler).not.toContain("SECRET");
    });

    it("defines strict payload limits and timeouts in Worker", () => {
      const indexTs = fs.readFileSync(path.join(workerSrcDir, "index.ts"), "utf-8");
      expect(indexTs).toContain("MAX_BODY_BYTES");
      expect(indexTs).toContain("MAX_TERMS");
      expect(indexTs).toContain("MAX_TERM_LENGTH");
      expect(indexTs).toContain("MAX_TRANSLATION_LENGTH");
      expect(indexTs).toContain("MAX_TTS_TEXT_LENGTH");
      expect(indexTs).toContain("allowedOrigin");
      expect(indexTs).toContain("RATE_LIMITED");
    });
  });

  describe("4. Supabase Migration Security & RLS Integrity", () => {
    const migrationsDir = path.join(root, "supabase/migrations");
    const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));

    it("verifies RLS is enabled on all tables in cloud sync migrations", () => {
      const initialMigration = fs.readFileSync(path.join(migrationsDir, "20260819000000_cloud_sync.sql"), "utf-8");
      expect(initialMigration).toContain("ALTER TABLE public.user_sync_records ENABLE ROW LEVEL SECURITY;");
      expect(initialMigration).toContain("ALTER TABLE public.user_sync_state ENABLE ROW LEVEL SECURITY;");
      expect(initialMigration).toContain("auth.uid() = user_id");
      expect(initialMigration).not.toContain("USING (true)");
      expect(initialMigration).not.toContain("WITH CHECK (true)");
    });

    it("verifies server trigger function uses SECURITY DEFINER with fixed search_path", () => {
      const cursorMigration = fs.readFileSync(path.join(migrationsDir, "20260820000000_cloud_sync_server_cursor.sql"), "utf-8");
      expect(cursorMigration).toContain("SECURITY DEFINER");
      expect(cursorMigration).toContain("SET search_path = public, pg_temp");
    });

    it("verifies function execution permissions are revoked from untrusted roles", () => {
      const permMigration = fs.readFileSync(path.join(migrationsDir, "20260820010000_cloud_sync_trigger_function_permissions.sql"), "utf-8");
      expect(permMigration).toContain("REVOKE ALL ON FUNCTION public.prepare_user_sync_record() FROM PUBLIC;");
      expect(permMigration).toContain("REVOKE ALL ON FUNCTION public.prepare_user_sync_record() FROM anon;");
      expect(permMigration).toContain("REVOKE ALL ON FUNCTION public.prepare_user_sync_record() FROM authenticated;");
    });
  });

  describe("5. CI and GitHub Actions Security", () => {
    const workflowsDir = path.join(root, ".github/workflows");
    const ciYml = fs.readFileSync(path.join(workflowsDir, "ci.yml"), "utf-8");
    const pagesYml = fs.readFileSync(path.join(workflowsDir, "pages.yml"), "utf-8");
    const dependabotYml = fs.readFileSync(path.join(root, ".github/dependabot.yml"), "utf-8");
    const codeqlYml = fs.readFileSync(path.join(workflowsDir, "codeql.yml"), "utf-8");
    const gitleaksYml = fs.readFileSync(path.join(workflowsDir, "gitleaks.yml"), "utf-8");

    it("ensures CI has least privilege read permissions", () => {
      expect(ciYml).toContain("permissions:\n  contents: read");
    });

    it("ensures Pages workflow has least privilege permissions", () => {
      expect(pagesYml).toContain("contents: read");
      expect(pagesYml).toContain("pages: write");
      expect(pagesYml).toContain("id-token: write");
    });

    it("pins actions to full 40-character commit SHAs", () => {
      const shaRegex = /uses:\s+[a-zA-Z0-9_\-\/]+@[a-f0-9]{40}/;
      expect(ciYml).toMatch(shaRegex);
      expect(pagesYml).toMatch(shaRegex);
      expect(codeqlYml).toMatch(shaRegex);
      expect(gitleaksYml).toMatch(shaRegex);
    });

    it("configures Dependabot for root, worker, and github-actions", () => {
      expect(dependabotYml).toContain('directory: "/"');
      expect(dependabotYml).toContain('directory: "/cloudflare/worker"');
      expect(dependabotYml).toContain('package-ecosystem: "github-actions"');
      expect(dependabotYml).toContain('interval: "weekly"');
    });
  });
});
