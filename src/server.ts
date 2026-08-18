import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { Database } from "./db/database.js";
import { assertStaticBuild } from "./production/static.js";

process.umask(0o077);
const config=loadConfig();
if(config.appEnv==="production")assertStaticBuild(config.staticDir);
const db=new Database(config.databaseUrl,config.databaseBusyTimeoutMs);
db.assertMigrationsApplied();
const app=buildApp({db,config});
let shuttingDown=false;
const shutdown=async(signal:string)=>{
  if(shuttingDown)return;
  shuttingDown=true;
  app.log.info({signal},"graceful shutdown started");
  const timeout=setTimeout(()=>{app.log.error("graceful shutdown timed out");process.exit(1);},config.shutdownTimeoutMs);
  timeout.unref();
  try{await app.close();db.checkpoint();db.close();clearTimeout(timeout);process.exit(0);}
  catch(error){app.log.error({err:error},"graceful shutdown failed");process.exit(1);}
};
process.once("SIGINT",()=>void shutdown("SIGINT"));process.once("SIGTERM",()=>void shutdown("SIGTERM"));
try{await app.listen({host:config.host,port:config.port});}catch(error){app.log.error({err:error},"server startup failed");db.close();process.exit(1);}
