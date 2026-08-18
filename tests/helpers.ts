import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { loadConfig, type AppConfig } from "../src/config.js";
import type { PronunciationService, TranslationService, TTSService } from "../src/core/providers.js";
import type { VocabularyEnrichmentService } from "../src/core/vocabulary-enrichment.js";
import { Database } from "../src/db/database.js";

export async function testContext(overrides:{translation?:TranslationService;pronunciation?:PronunciationService;tts?:TTSService;vocabularyEnrichment?:VocabularyEnrichmentService;config?:Partial<AppConfig>}={}){
  const db=new Database(":memory:");db.migrate();
  const {config:configOverride,...providers}=overrides;
  const app=buildApp({db,config:{...loadConfig({APP_ENV:"test",DATABASE_URL:":memory:"}),...configOverride},...providers});
  const response=await app.inject({method:"POST",url:"/api/auth/register",payload:{name:"Test User",email:"test@example.com",password:"password123"}});
  const body=response.json() as {data:{token:string;user:{id:string}}};
  return{db,app,token:body.data.token,userId:body.data.user.id,headers:{authorization:`Bearer ${body.data.token}`},async close(){await app.close();db.close();}};
}
export const authPost=(app:FastifyInstance,token:string,url:string,payload:Record<string,unknown>)=>app.inject({method:"POST",url,headers:{authorization:`Bearer ${token}`},payload});
