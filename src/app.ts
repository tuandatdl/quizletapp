import Fastify, { type FastifyRequest } from "fastify";
import { ZodError, z } from "zod";
import type { AppConfig } from "./config.js";
import { AuthService } from "./core/auth.js";
import { GameService, QuizService } from "./core/quiz.js";
import { PronunciationCore, ShadowingService } from "./core/pronunciation.js";
import { ProgressService } from "./core/progress.js";
import type { PronunciationService, TranslationService, TTSService } from "./core/providers.js";
import { UnconfiguredPronunciationService, UnconfiguredTranslationService, UnconfiguredTTSService } from "./core/providers.js";
import { ReadingService } from "./core/reading.js";
import { VocabularyService } from "./core/vocabulary.js";
import { VocabularyBulkService } from "./core/vocabulary-bulk.js";
import type { VocabularyEnrichmentService, VocabularyEnrichmentSuggestion } from "./core/vocabulary-enrichment.js";
import { UnconfiguredVocabularyEnrichmentService } from "./core/vocabulary-enrichment.js";
import type { Database } from "./db/database.js";
import { RequestRateLimiter } from "./production/rate-limit.js";
import { applySecurityHeaders, enforceOrigin } from "./production/security.js";
import { sendStaticOrSpa } from "./production/static.js";
import { AppError, errorBody, errors } from "./shared/errors.js";
import { bulkPreviewSchema, bulkVocabularySchema, enrichContextSchema, gameAnswerSchema, gameStartSchema, languageSchema, loginSchema, pronunciationRequestSchema, quizAnswerSchema, quizStartSchema, readingInputSchema, readingPatchSchema, registerSchema, reviewActionSchema, saveSelectionSchema, translationSelectionSchema, ttsRequestSchema, vocabularyInputSchema, vocabularyPatchSchema, vocabularyQuerySchema } from "./shared/schemas.js";

interface Dependencies { db:Database;config:AppConfig;translation?:TranslationService;tts?:TTSService;pronunciation?:PronunciationService;vocabularyEnrichment?:VocabularyEnrichmentService }
const idParam=z.object({id:z.string().uuid()});
const readingParam=z.object({id:z.string().uuid()});
const favoriteSchema=z.object({favorite:z.boolean()});
const shadowingAdvanceSchema=z.object({attemptId:z.string().uuid()});

const bearer=(request:FastifyRequest)=>{const header=request.headers.authorization;return header?.startsWith("Bearer ")?header.slice(7):undefined;};
const resource=<T>(data:T)=>({state:Array.isArray(data)&&data.length===0?"empty":"success",data});

export function buildApp(deps:Dependencies){
  const app=Fastify({
    logger:deps.config.appEnv==="test"?false:{
      level:deps.config.logLevel,
      redact:{paths:["req.headers.authorization","req.headers.cookie","headers.authorization","password","audioBase64"],censor:"[REDACTED]"}
    },
    bodyLimit:deps.config.bodyLimitBytes,
    trustProxy:deps.config.trustProxy
  });
  const auth=new AuthService(deps.db,deps.config.sessionTtlDays),vocab=new VocabularyService(deps.db);
  auth.cleanupExpiredSessions();
  const translation=deps.translation??new UnconfiguredTranslationService(),tts=deps.tts??new UnconfiguredTTSService(),pronunciationProvider=deps.pronunciation??new UnconfiguredPronunciationService();
  const vocabularyEnrichment=deps.vocabularyEnrichment??new UnconfiguredVocabularyEnrichmentService();
  const bulkVocabulary=new VocabularyBulkService(vocab,vocabularyEnrichment),reading=new ReadingService(deps.db,translation),pronunciation=new PronunciationCore(deps.db,pronunciationProvider),shadowing=new ShadowingService(deps.db),quiz=new QuizService(deps.db),games=new GameService(deps.db),progress=new ProgressService(deps.db);
  const rateLimiter=new RequestRateLimiter(deps.config);
  const selectionRate=new Map<string,{start:number;count:number}>();
  const getSettings=(uid:string)=>{const row=deps.db.get<Record<string,string|number|boolean>>("SELECT native_language AS nativeLanguage,current_learning_language AS currentLearningLanguage,english_enabled AS englishEnabled,chinese_enabled AS chineseEnabled,daily_goal AS dailyGoal,audio_speed AS audioSpeed,auto_play_audio AS autoPlayAudio,show_translation AS showTranslation,show_pinyin AS showPinyin,show_hanzi AS showHanzi,show_vietnamese AS showVietnamese,theme_preference AS themePreference,english_new_words_target AS englishNewWordsTarget,chinese_new_words_target AS chineseNewWordsTarget,review_target AS reviewTarget,quiz_target AS quizTarget,shadowing_target AS shadowingTarget FROM user_settings WHERE user_id=?",uid);if(!row)throw errors.notFound("User settings");for(const key of ["englishEnabled","chineseEnabled","autoPlayAudio","showTranslation","showPinyin","showHanzi","showVietnamese"])row[key]=Boolean(row[key]);return row;};

  app.addHook("onRequest",async(request,reply)=>{enforceOrigin(request,reply,deps.config);rateLimiter.check(request,reply);});
  app.addHook("onSend",async(request,reply,payload)=>{applySecurityHeaders(request,reply,deps.config);return payload;});
  app.options("/*",async(_request,reply)=>reply.status(204).send());
  app.setErrorHandler((error,request,reply)=>{const transportStatus=typeof (error as {statusCode?:unknown}).statusCode==="number"?(error as {statusCode:number}).statusCode:undefined;const normalized=!(error instanceof ZodError)&&!(error instanceof AppError)&&transportStatus===413?errors.payloadTooLarge():!(error instanceof ZodError)&&!(error instanceof AppError)&&transportStatus===400?errors.validation(error instanceof Error?error.message:"Request validation failed"):error;const status=normalized instanceof ZodError?400:normalized instanceof AppError?normalized.statusCode:500;if(status>=500&&deps.config.appEnv!=="test")request.log.error({err:error},"request failed");reply.status(status).send(errorBody(normalized,deps.config.appEnv!=="production"));});
  app.setNotFoundHandler((request,reply)=>{if(deps.config.appEnv==="production"&&!request.url.startsWith("/api/")&&sendStaticOrSpa(request,reply,deps.config.staticDir))return;const error=errors.notFound(request.url.startsWith("/api/")?"API route":"Route");reply.status(error.statusCode).send(errorBody(error));});
  app.get("/health",async()=>({status:"ok",service:"tu-trinh-language-core",version:"0.9.0",environment:deps.config.appEnv,providers:{translation:translation.configured,tts:tts.configured,pronunciation:pronunciationProvider.configured,vocabularyEnrichment:vocabularyEnrichment.configured}}));
  app.get("/ready",async(request)=>{try{deps.db.assertMigrationsApplied();return{status:"ready",service:"tu-trinh-language-core",version:"0.9.0"};}catch(error){request.log.error({err:error},"readiness check failed");throw errors.unavailable();}});
  app.post("/api/auth/register",async req=>resource(auth.register(registerSchema.parse(req.body))));
  app.post("/api/auth/login",async req=>resource(auth.login(loginSchema.parse(req.body))));
  app.post("/api/auth/logout",async req=>{const token=bearer(req);auth.authenticate(token);auth.logout(token!);return{state:"success",data:{loggedOut:true}};});

  app.addHook("preHandler",async(request)=>{if(request.method==="OPTIONS"||!request.routeOptions.url||!request.url.startsWith("/api/")||request.url.startsWith("/api/auth/"))return;(request as FastifyRequest&{authUser?:ReturnType<typeof auth.authenticate>}).authUser=auth.authenticate(bearer(request));});
  const userId=(req:FastifyRequest)=>(req as FastifyRequest&{authUser:ReturnType<typeof auth.authenticate>}).authUser.id;

  app.get("/api/me",async req=>resource((req as FastifyRequest&{authUser:unknown}).authUser));
  app.get("/api/settings",async req=>resource(getSettings(userId(req))));
  app.patch("/api/settings",async req=>{const input=z.object({nativeLanguage:z.literal("vi").optional(),currentLearningLanguage:languageSchema.optional(),englishEnabled:z.boolean().optional(),chineseEnabled:z.boolean().optional(),dailyGoal:z.number().int().min(1).max(300).optional(),audioSpeed:z.union([z.literal(.75),z.literal(1),z.literal(1.25)]).optional(),autoPlayAudio:z.boolean().optional(),showTranslation:z.boolean().optional(),showPinyin:z.boolean().optional(),showHanzi:z.boolean().optional(),showVietnamese:z.boolean().optional(),themePreference:z.enum(["light","dark","system"]).optional(),englishNewWordsTarget:z.number().int().min(0).max(100).optional(),chineseNewWordsTarget:z.number().int().min(0).max(100).optional(),reviewTarget:z.number().int().min(0).max(200).optional(),quizTarget:z.number().int().min(0).max(100).optional(),shadowingTarget:z.number().int().min(0).max(120).optional()}).parse(req.body);const map:Record<string,string>={nativeLanguage:"native_language",currentLearningLanguage:"current_learning_language",englishEnabled:"english_enabled",chineseEnabled:"chinese_enabled",dailyGoal:"daily_goal",audioSpeed:"audio_speed",autoPlayAudio:"auto_play_audio",showTranslation:"show_translation",showPinyin:"show_pinyin",showHanzi:"show_hanzi",showVietnamese:"show_vietnamese",themePreference:"theme_preference",englishNewWordsTarget:"english_new_words_target",chineseNewWordsTarget:"chinese_new_words_target",reviewTarget:"review_target",quizTarget:"quiz_target",shadowingTarget:"shadowing_target"};const entries=Object.entries(input).filter(([,value])=>value!==undefined);if(entries.length)deps.db.run(`UPDATE user_settings SET ${entries.map(([k])=>`${map[k]}=?`).join(",")} WHERE user_id=?`,...entries.map(([,v])=>typeof v==="boolean"?(v?1:0):v as string|number),userId(req));return resource(getSettings(userId(req)));});

  app.post("/api/vocabulary",async(req,reply)=>{const result=vocab.create(userId(req),vocabularyInputSchema.parse(req.body));reply.status(result.duplicate?200:201);return resource(result);});
  app.get("/api/vocabulary",async req=>resource(vocab.list(userId(req),vocabularyQuerySchema.parse(req.query))));
  app.post("/api/vocabulary/bulk-preview",async req=>{const input=bulkPreviewSchema.parse(req.body);return resource(await bulkVocabulary.preview(userId(req),input.language,input.input));});
  app.post("/api/vocabulary/bulk",async req=>{const input=bulkVocabularySchema.parse(req.body);return resource(bulkVocabulary.create(userId(req),input.language,input.items));});
  app.get("/api/vocabulary/:id",async req=>resource(vocab.get(userId(req),idParam.parse(req.params).id)));
  app.patch("/api/vocabulary/:id",async req=>resource(vocab.update(userId(req),idParam.parse(req.params).id,vocabularyPatchSchema.parse(req.body))));
  app.delete("/api/vocabulary/:id",async(req,reply)=>{vocab.remove(userId(req),idParam.parse(req.params).id);reply.status(204).send();});
  app.post("/api/vocabulary/:id/review",async req=>resource(vocab.review(userId(req),idParam.parse(req.params).id,z.object({action:reviewActionSchema}).parse(req.body).action)));
  app.put("/api/vocabulary/:id/favorite",async req=>resource(vocab.favorite(userId(req),idParam.parse(req.params).id,favoriteSchema.parse(req.body).favorite)));
  app.get("/api/flashcards",async req=>resource(vocab.list(userId(req),vocabularyQuerySchema.parse(req.query))));
  app.post("/api/flashcards/:id/answer",async req=>resource(vocab.review(userId(req),idParam.parse(req.params).id,z.object({action:reviewActionSchema}).parse(req.body).action)));

  app.post("/api/readings",async(req,reply)=>{const result=reading.create(userId(req),readingInputSchema.parse(req.body));reply.status(201);return resource(result);});
  app.get("/api/readings",async req=>resource(reading.list(userId(req),z.object({language:languageSchema.optional()}).parse(req.query).language)));
  app.get("/api/readings/:id",async req=>resource(reading.get(userId(req),readingParam.parse(req.params).id)));
  app.patch("/api/readings/:id",async req=>resource(reading.update(userId(req),readingParam.parse(req.params).id,readingPatchSchema.parse(req.body))));
  app.delete("/api/readings/:id",async(req,reply)=>{reading.remove(userId(req),readingParam.parse(req.params).id);reply.status(204).send();});
  app.post("/api/readings/:id/translate",async req=>resource(await reading.translatePassage(userId(req),readingParam.parse(req.params).id)));
  app.get("/api/translation/availability",async()=>resource({configured:translation.configured,provider:translation.provider}));
  app.post("/api/translate-selection",async req=>{const uid=userId(req),now=Date.now(),record=selectionRate.get(uid);if(!record||now-record.start>=60_000)selectionRate.set(uid,{start:now,count:1});else if(record.count>=30)throw errors.rateLimited();else record.count++;return resource(await reading.translateSelection(uid,translationSelectionSchema.parse(req.body)));});
  app.post("/api/vocabulary/enrich-context",async req=>{const input=enrichContextSchema.parse(req.body);if(!vocabularyEnrichment.configured)return resource(null);try{const enriched=await vocabularyEnrichment.enrich({language:input.language,term:input.term,nativeLanguage:"vi",context:{sentence:input.sentence,previousSentence:input.previousSentence,nextSentence:input.nextSentence}});return resource(enriched);}catch{return resource(null);}});
  app.post("/api/vocabulary/from-selection",async(req,reply)=>{const input=saveSelectionSchema.parse(req.body);if(input.readingId)reading.get(userId(req),input.readingId);let enriched:VocabularyEnrichmentSuggestion|undefined;if(vocabularyEnrichment.configured){try{if(input.context)enriched=await vocabularyEnrichment.enrich({language:input.sourceLanguage,term:input.text,nativeLanguage:"vi",context:input.context});}catch{}}const sourceContext=input.context?{sentence:input.context.sentence,previousSentence:input.context.previousSentence,nextSentence:input.context.nextSentence}:undefined;const metadata:Record<string,unknown>=enriched?{synonyms:enriched.synonyms??[],senses:enriched.senses??[],ipa:enriched.ipa,pinyin:enriched.pinyin,...(input.context?{sourceContext,contextAware:true}:{})}:(input.context?{sourceContext,contextAware:true}:{});const result=vocab.create(userId(req),{language:input.sourceLanguage,term:input.text,meaningVi:input.meaningVi||enriched?.meaningVi||"",pronunciation:input.pronunciation||enriched?.pronunciation||enriched?.ipa||enriched?.pinyin,partOfSpeech:input.partOfSpeech||enriched?.partOfSpeech,example:enriched?.example,exampleTranslation:enriched?.exampleTranslation,source:"READING_SELECTION",sourceReadingId:input.readingId,metadata});reply.status(result.duplicate?200:201);if(result.duplicate&&enriched)return resource({...result,contextualSense:enriched});return resource(result);});
  app.post("/api/tts",async req=>{const input=ttsRequestSchema.parse(req.body);return resource(await tts.synthesize(input));});

  app.get("/api/pronunciation/availability",async()=>resource(pronunciation.availability()));
  app.post("/api/pronunciation/assess",{bodyLimit:deps.config.audioBodyLimitBytes},async req=>resource(await pronunciation.assess(userId(req),pronunciationRequestSchema.parse(req.body))));
  app.get("/api/pronunciation/recent",async req=>resource(pronunciation.recent(userId(req),z.object({limit:z.coerce.number().int().min(1).max(100).default(20)}).parse(req.query).limit)));
  app.get("/api/pronunciation/weakest",async req=>resource(pronunciation.weakest(userId(req),z.object({limit:z.coerce.number().int().min(1).max(100).default(20)}).parse(req.query).limit)));
  app.post("/api/shadowing",async(req,reply)=>{const result=shadowing.start(userId(req),z.object({readingId:z.string().uuid()}).parse(req.body).readingId);reply.status(201);return resource(result);});
  app.get("/api/shadowing/:id",async req=>resource(shadowing.get(userId(req),idParam.parse(req.params).id)));
  app.post("/api/shadowing/:id/advance",async req=>resource(shadowing.advance(userId(req),idParam.parse(req.params).id,shadowingAdvanceSchema.parse(req.body).attemptId)));

  app.post("/api/quizzes",async(req,reply)=>{const result=quiz.start(userId(req),quizStartSchema.parse(req.body));reply.status(201);return resource(result);});
  app.post("/api/quizzes/:id/answer",async req=>resource(quiz.answer(userId(req),idParam.parse(req.params).id,quizAnswerSchema.parse(req.body).answer)));
  app.post("/api/games",async(req,reply)=>{const result=games.start(userId(req),gameStartSchema.parse(req.body));reply.status(201);return resource(result);});
  app.get("/api/games/:id",async req=>resource(games.get(userId(req),idParam.parse(req.params).id)));
  app.post("/api/games/:id/answer",async req=>{const input=gameAnswerSchema.parse(req.body);return resource(games.answer(userId(req),idParam.parse(req.params).id,input.itemId,input.answer));});
  app.get("/api/progress/dashboard",async req=>resource(progress.dashboard(userId(req))));
  app.get("/api/progress/streak",async req=>resource({streak:progress.streak(userId(req))}));
  app.get("/api/today-plan",async req=>resource(progress.todayPlan(userId(req))));
  app.post("/api/activity",async req=>{const input=z.object({readingMinutes:z.number().int().min(0).max(1440).default(0),shadowingMinutes:z.number().int().min(0).max(1440).default(0),studySeconds:z.number().int().min(0).max(86400).default(0)}).refine(v=>v.readingMinutes+v.shadowingMinutes+v.studySeconds>0,"At least one activity value is required").parse(req.body),date=new Date().toISOString().slice(0,10);deps.db.run("INSERT INTO study_activities(user_id,activity_date,reading_minutes,shadowing_minutes,study_seconds) VALUES(?,?,?,?,?) ON CONFLICT(user_id,activity_date) DO UPDATE SET reading_minutes=reading_minutes+excluded.reading_minutes,shadowing_minutes=shadowing_minutes+excluded.shadowing_minutes,study_seconds=study_seconds+excluded.study_seconds",userId(req),date,input.readingMinutes,input.shadowingMinutes,input.studySeconds);return resource({date,...input});});
  return app;
}
