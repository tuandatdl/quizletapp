import { loadConfig } from "../config.js";
import { Database } from "./database.js";

const config = loadConfig();
const db = new Database(config.databaseUrl, config.databaseBusyTimeoutMs);
db.migrate();
db.assertMigrationsApplied();
db.close();
console.log("Database migrations applied");
