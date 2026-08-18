import { afterEach, describe, expect, it } from "vitest";
import { parseQuickVocabularyInput } from "../src/core/vocabulary-bulk.js";
import type { VocabularyEnrichmentService } from "../src/core/vocabulary-enrichment.js";
import { StaticTranslationService, type PronunciationService, type TranslationService, type TTSService } from "../src/core/providers.js";
import { errors } from "../src/shared/errors.js";
import { buildRequestHeaders } from "../src/shared/http.js";
import { testContext } from "./helpers.js";

const contexts:Array<Awaited<ReturnType<typeof testContext>>>=[];
afterEach(async()=>{while(contexts.length)await contexts.pop()!.close();});

const configuredPronunciation:PronunciationService={
  configured:true,
  provider:"test-pronunciation",
  async assess(){return{status:"READY",overallScore:80,pronunciationScore:80,fluencyScore:80,words:[]};}
};

const configuredTts:TTSService={
  configured:true,
  provider:"test-tts",
  async synthesize(){return{status:"READY",mode:"audio",audioUrl:"https://example.test/audio.mp3",durationMs:12_345,provider:"test-tts"};}
};

const failingTranslation:TranslationService={
  configured:true,
  provider:"test-translation",
  async translate(){throw errors.external("translation");}
};

const configuredEnrichment:VocabularyEnrichmentService={
  configured:true,
  provider:"test-dictionary",
  async enrich({term}){return{term,ipa:"/ɡəʊ/",partOfSpeech:"verb",meaningVi:"đi",synonyms:["move"],example:"I go home.",exampleTranslation:"Tôi về nhà.",cefr:"A1",senses:[{partOfSpeech:"verb",meaningVi:"đi",synonyms:["move"]}]};}
};

const failingEnrichment:VocabularyEnrichmentService={
  configured:true,
  provider:"test-dictionary",
  async enrich(){throw errors.external("vocabulary enrichment");}
};

describe("post-acceptance feature fix R1",()=>{
  it("omits JSON content type for bodyless requests and adds it for JSON bodies",()=>{
    expect(buildRequestHeaders(undefined,false)).toEqual({});
    expect(buildRequestHeaders({"Content-Type":"application/json","X-Test":"yes"},false)).toEqual({"X-Test":"yes"});
    expect(buildRequestHeaders(undefined,true)).toEqual({"Content-Type":"application/json"});
  });

  it("accepts a bodyless full-reading translation request and reaches the provider",async()=>{const c=await testContext({translation:new StaticTranslationService(text=>`vi:${text}`)});contexts.push(c);
    const reading=(await c.app.inject({method:"POST",url:"/api/readings",headers:c.headers,payload:{language:"en",title:"Translate",content:"Read this passage."}})).json().data;
    const translated=await c.app.inject({method:"POST",url:`/api/readings/${reading.id}/translate`,headers:c.headers});
    expect(translated.statusCode).toBe(200);expect(translated.json().data).toMatchObject({passageId:reading.id,translation:"vi:Read this passage."});
    const malformed=await c.app.inject({method:"POST",url:`/api/readings/${reading.id}/translate`,headers:{...c.headers,"content-type":"application/json"}});
    expect(malformed.statusCode).toBe(400);expect(malformed.json().error.code).toBe("VALIDATION_ERROR");
  });

  it("separates translation availability from unconfigured and malformed requests",async()=>{const c=await testContext();contexts.push(c);
    expect((await c.app.inject({method:"GET",url:"/api/translation/availability",headers:c.headers})).json().data).toEqual({configured:false,provider:null});
    const reading=(await c.app.inject({method:"POST",url:"/api/readings",headers:c.headers,payload:{language:"en",title:"Unavailable",content:"No fake translation."}})).json().data;
    const unavailable=await c.app.inject({method:"POST",url:`/api/readings/${reading.id}/translate`,headers:c.headers});
    expect(unavailable.statusCode).toBe(503);expect(unavailable.json().error).toMatchObject({code:"SERVICE_NOT_CONFIGURED",details:{service:"translation"}});
    const configured=await testContext({translation:new StaticTranslationService(text=>text)});contexts.push(configured);
    expect((await configured.app.inject({method:"GET",url:"/api/translation/availability",headers:configured.headers})).json().data).toEqual({configured:true,provider:"static-test"});
    const failing=await testContext({translation:failingTranslation});contexts.push(failing);
    const failingReading=(await failing.app.inject({method:"POST",url:"/api/readings",headers:failing.headers,payload:{language:"en",title:"External",content:"Provider failure."}})).json().data;
    const external=await failing.app.inject({method:"POST",url:`/api/readings/${failingReading.id}/translate`,headers:failing.headers});
    expect(external.statusCode).toBe(502);expect(external.json().error.code).toBe("EXTERNAL_SERVICE_ERROR");
  });

  it("parses comma, newline and semicolon input while preserving phrases and first display form",()=>{
    expect(parseQuickVocabularyInput("go, car; live\ntotal","en")).toEqual(["go","car","live","total"]);
    expect(parseQuickVocabularyInput("give up\nlook forward to","en")).toEqual(["give up","look forward to"]);
    expect(parseQuickVocabularyInput(" Go , go, GO ","en")).toEqual(["Go"]);
    expect(()=>parseQuickVocabularyInput(Array.from({length:101},(_,i)=>`word-${i}`).join(","),"en")).toThrow("at most 100 terms");
  });

  it("returns an honest enrichment-unavailable preview and detects existing vocabulary",async()=>{const c=await testContext();contexts.push(c);
    await c.app.inject({method:"POST",url:"/api/vocabulary",headers:c.headers,payload:{language:"en",term:"go",meaningVi:"đi",source:"MANUAL",metadata:{}}});
    const preview=await c.app.inject({method:"POST",url:"/api/vocabulary/bulk-preview",headers:c.headers,payload:{language:"en",input:"GO, car, give up"}});
    expect(preview.statusCode).toBe(200);const data=preview.json().data;
    expect(data.enrichment).toEqual({configured:false,provider:null});
    expect(data.items[0]).toMatchObject({term:"GO",normalizedTerm:"go",duplicate:true,status:"EXISTS"});
    expect(data.items[1]).toMatchObject({term:"car",duplicate:false,status:"NEEDS_ENRICHMENT",suggestion:{meaningVi:null,ipa:null,synonyms:[],senses:[]}});
    expect(JSON.stringify(data.items[1].suggestion)).not.toContain("car");
  });

  it("maps configured enrichment into preview without saving it",async()=>{const c=await testContext({vocabularyEnrichment:configuredEnrichment});contexts.push(c);
    const preview=await c.app.inject({method:"POST",url:"/api/vocabulary/bulk-preview",headers:c.headers,payload:{language:"en",input:"go"}});
    expect(preview.json().data).toMatchObject({enrichment:{configured:true,provider:"test-dictionary"},items:[{term:"go",status:"READY",suggestion:{ipa:"/ɡəʊ/",meaningVi:"đi",senses:[{meaningVi:"đi"}]}}]});
    expect(c.db.get<{count:number}>("SELECT COUNT(*) count FROM vocabulary_items")?.count).toBe(0);
    const failing=await testContext({vocabularyEnrichment:failingEnrichment});contexts.push(failing);
    const failedPreview=(await failing.app.inject({method:"POST",url:"/api/vocabulary/bulk-preview",headers:failing.headers,payload:{language:"en",input:"go"}})).json().data;
    expect(failedPreview.items[0]).toMatchObject({status:"NEEDS_ENRICHMENT",suggestion:{meaningVi:null,ipa:null},error:{code:"EXTERNAL_SERVICE_ERROR"}});
    expect(failing.db.get<{count:number}>("SELECT COUNT(*) count FROM vocabulary_items")?.count).toBe(0);
  });

  it("bulk creates valid approved items while reporting existing and invalid items",async()=>{const c=await testContext();contexts.push(c);
    await c.app.inject({method:"POST",url:"/api/vocabulary",headers:c.headers,payload:{language:"en",term:"go",meaningVi:"đi",source:"MANUAL",metadata:{}}});
    const response=await c.app.inject({method:"POST",url:"/api/vocabulary/bulk",headers:c.headers,payload:{language:"en",items:[
      {term:"GO",meaningVi:"đi"},
      {term:"car",meaningVi:"xe hơi",ipa:"/kɑːr/",partOfSpeech:"noun",synonyms:["automobile"],cefr:"A1",senses:[{partOfSpeech:"noun",meaningVi:"xe hơi",synonyms:["automobile"]}]},
      {term:"live"},
      {term:"total",meaningVi:"tổng cộng",partOfSpeech:"adjective"},
      {term:"TOTAL",meaningVi:"tổng"}
    ]}});
    expect(response.statusCode).toBe(200);const result=response.json().data;
    expect(result.mode).toBe("PARTIAL");expect(result.created.map((item:{term:string})=>item.term)).toEqual(["car","total"]);
    expect(result.existing.map((item:{term:string;normalizedTerm:string})=>item.normalizedTerm)).toEqual(["go","total"]);
    expect(result.failed).toMatchObject([{index:2,term:"live",code:"VALIDATION_ERROR"}]);
    expect(result.created[0]).toMatchObject({pronunciation:"/kɑːr/",level:"A1",source:"IMPORT",metadata:{ipa:"/kɑːr/",cefr:"A1",synonyms:["automobile"],senses:[{meaningVi:"xe hơi"}]}});
    expect(c.db.get<{count:number}>("SELECT COUNT(*) count FROM vocabulary_items WHERE user_id=?",c.userId)?.count).toBe(3);
  });

  it("rejects invalid bulk envelopes without writing data",async()=>{const c=await testContext();contexts.push(c);
    const response=await c.app.inject({method:"POST",url:"/api/vocabulary/bulk",headers:c.headers,payload:{language:"en",items:[]}});
    expect(response.statusCode).toBe(400);expect(response.json().error.code).toBe("VALIDATION_ERROR");
    expect(c.db.get<{count:number}>("SELECT COUNT(*) count FROM vocabulary_items")?.count).toBe(0);
  });

  it("keeps the bulk path language-aware for Chinese metadata and normalization",async()=>{const c=await testContext();contexts.push(c);
    const response=await c.app.inject({method:"POST",url:"/api/vocabulary/bulk",headers:c.headers,payload:{language:"zh",items:[{term:"学习",meaningVi:"học tập",pinyin:"xuéxí",simplified:"学习",traditional:"學習",hskLevel:1,toneData:[2,2]}]}});
    expect(response.json().data.created[0]).toMatchObject({language:"zh",term:"学习",pronunciation:"xuéxí",level:"HSK1",metadata:{simplified:"学习",traditional:"學習",pinyin:"xuéxí",hskLevel:1,toneData:[2,2]}});
    const preview=(await c.app.inject({method:"POST",url:"/api/vocabulary/bulk-preview",headers:c.headers,payload:{language:"zh",input:"学 习"}})).json().data;
    expect(preview.items[0]).toMatchObject({normalizedTerm:"学习",duplicate:true,status:"EXISTS"});
  });

  it("exposes actionable pronunciation availability without invoking assessment",async()=>{const c=await testContext();contexts.push(c);
    expect((await c.app.inject({method:"GET",url:"/api/pronunciation/availability",headers:c.headers})).json().data).toEqual({status:"NOT_CONFIGURED",configured:false,provider:null,assessmentAvailable:false});
    const configured=await testContext({pronunciation:configuredPronunciation});contexts.push(configured);
    expect((await configured.app.inject({method:"GET",url:"/api/pronunciation/availability",headers:configured.headers})).json().data).toEqual({status:"AVAILABLE",configured:true,provider:"test-pronunciation",assessmentAvailable:true});
  });

  it("keeps reading sentence IDs ordered and supports the real-audio TTS mode contract",async()=>{const c=await testContext({tts:configuredTts});contexts.push(c);
    const reading=(await c.app.inject({method:"POST",url:"/api/readings",headers:c.headers,payload:{language:"en",title:"Playback",content:"First. Second? Third!"}})).json().data;
    const reloaded=(await c.app.inject({method:"GET",url:`/api/readings/${reading.id}`,headers:c.headers})).json().data;
    expect(reloaded.sentences.map((sentence:{order:number})=>sentence.order)).toEqual([0,1,2]);
    expect(new Set(reloaded.sentences.map((sentence:{id:string})=>sentence.id)).size).toBe(3);
    const tts=await c.app.inject({method:"POST",url:"/api/tts",headers:c.headers,payload:{text:reloaded.content,language:"en",speed:1}});
    expect(tts.json().data).toEqual({status:"READY",mode:"audio",audioUrl:"https://example.test/audio.mp3",durationMs:12_345,provider:"test-tts"});
  });
});
