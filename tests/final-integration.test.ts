import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";
import type { PronunciationService } from "../src/core/providers.js";
import { classifySelection, splitSentences } from "../src/core/reading.js";
import { VocabularyService } from "../src/core/vocabulary.js";
import { vocabularyQuerySchema } from "../src/shared/schemas.js";
import { testContext } from "./helpers.js";

const contexts:Array<Awaited<ReturnType<typeof testContext>>>=[];
afterEach(async()=>{while(contexts.length)await contexts.pop()!.close();});

const provider:PronunciationService={configured:true,provider:"test-pronunciation",async assess(){return{status:"READY",overallScore:84,pronunciationScore:86,fluencyScore:81,rhythmScore:82,toneAccuracy:79,words:[{word:"practice",score:84,status:"good"}]};}};
type TestMethod="GET"|"POST"|"PATCH"|"PUT"|"DELETE";
const request=(c:Awaited<ReturnType<typeof testContext>>,method:TestMethod,url:string,payload?:Record<string,unknown>,token=c.token)=>c.app.inject({method,url,headers:{authorization:`Bearer ${token}`,...(payload?{"content-type":"application/json"}:{})},payload});

describe("final integration contract",()=>{
  it("covers auth lifecycle, duplicate registration, invalid login and revoked sessions",async()=>{const c=await testContext();contexts.push(c);
    expect((await c.app.inject({method:"POST",url:"/api/auth/register",payload:{name:"Duplicate",email:"TEST@example.com",password:"password123"}})).statusCode).toBe(409);
    expect((await c.app.inject({method:"POST",url:"/api/auth/register",payload:{name:"Bad",email:"invalid",password:"short"}})).statusCode).toBe(400);
    expect((await c.app.inject({method:"POST",url:"/api/auth/login",payload:{email:"test@example.com",password:"wrong-password"}})).statusCode).toBe(401);
    expect((await request(c,"GET","/api/me")).json().data.email).toBe("test@example.com");
    expect((await request(c,"POST","/api/auth/logout")).statusCode).toBe(200);
    expect((await request(c,"GET","/api/me")).statusCode).toBe(401);
  });

  it("parses explicit false query booleans without coercing them to true",()=>{
    expect(vocabularyQuerySchema.parse({due:"false",random:"false"})).toMatchObject({due:false,random:false});
    expect(()=>vocabularyQuerySchema.parse({due:"yes"})).toThrow();
  });

  it("persists settings with runtime boolean shapes",async()=>{const c=await testContext();contexts.push(c);
    const patched=await request(c,"PATCH","/api/settings",{currentLearningLanguage:"zh",dailyGoal:42,showTranslation:false,showPinyin:false,themePreference:"dark",audioSpeed:0.75,autoPlayAudio:true,englishNewWordsTarget:7,chineseNewWordsTarget:8,reviewTarget:9,quizTarget:10,shadowingTarget:11});
    expect(patched.json().data).toMatchObject({currentLearningLanguage:"zh",dailyGoal:42,showTranslation:false,showPinyin:false,themePreference:"dark",audioSpeed:0.75,autoPlayAudio:true,englishNewWordsTarget:7,chineseNewWordsTarget:8,reviewTarget:9,quizTarget:10,shadowingTarget:11});
    const loaded=(await request(c,"GET","/api/settings")).json().data;
    expect(loaded.showTranslation).toBe(false);expect(typeof loaded.showTranslation).toBe("boolean");expect(loaded.dailyGoal).toBe(42);
    expect((await request(c,"GET","/api/today-plan")).json().data).toMatchObject({english:{newWords:{target:7},dueReviews:{target:9},quiz:{target:10},shadowing:{targetMinutes:11}},chinese:{newWords:{target:8},dueReviews:{target:9},quiz:{target:10},shadowing:{targetMinutes:11},pinyin:{target:10}}});
    await request(c,"POST","/api/activity",{readingMinutes:6,shadowingMinutes:4,studySeconds:120});
    expect((await request(c,"GET","/api/progress/dashboard")).json().data.global).toMatchObject({todayGoal:42,todayCompleted:10,totalStudyTimeSeconds:120});
  });

  it("rejects invalid numeric environment configuration before startup",()=>{
    expect(()=>loadConfig({PORT:"NaN"})).toThrow("PORT must be a positive integer");
    expect(()=>loadConfig({PORT:"3000.5"})).toThrow("PORT must be a positive integer");
    expect(()=>loadConfig({SESSION_TTL_DAYS:"0"})).toThrow("SESSION_TTL_DAYS must be a positive number");
  });

  it("runs English and Chinese vocabulary CRUD, duplicate, favorite and review contracts",async()=>{const c=await testContext();contexts.push(c);
    const englishPayload={language:"en",term:"resilience",meaningVi:"khả năng phục hồi",pronunciation:"/rɪˈzɪliəns/",level:"B2",topic:"TOEIC",source:"MANUAL",metadata:{ipa:"/rɪˈzɪliəns/",cefr:"B2",toeicLevel:"785-900",synonyms:["toughness"]}};
    const englishResponse=await request(c,"POST","/api/vocabulary",englishPayload);
    expect(englishResponse.statusCode).toBe(201);const english=englishResponse.json().data.item;
    expect(english.metadata).toMatchObject({cefr:"B2",toeicLevel:"785-900"});
    const duplicate=await request(c,"POST","/api/vocabulary",{...englishPayload,term:"  RESILIENCE  "});
    expect(duplicate.statusCode).toBe(200);expect(duplicate.json().data).toMatchObject({duplicate:true,item:{id:english.id}});
    const crossLanguage=await request(c,"POST","/api/vocabulary",{language:"zh",term:"resilience",meaningVi:"không va chạm khác ngôn ngữ",source:"MANUAL",metadata:{}});
    expect(crossLanguage.statusCode).toBe(201);expect(crossLanguage.json().data.item.id).not.toBe(english.id);
    const chinese=(await request(c,"POST","/api/vocabulary",{language:"zh",term:"学习",meaningVi:"học tập",pronunciation:"xuéxí",level:"HSK1",source:"MANUAL",metadata:{simplified:"学习",traditional:"學習",pinyin:"xuéxí",toneData:[2,2],hskLevel:1}})).json().data.item;
    expect(chinese.metadata).toMatchObject({traditional:"學習",pinyin:"xuéxí",toneData:[2,2],hskLevel:1});
    expect((await request(c,"GET","/api/vocabulary?language=en&due=false&random=false")).json().data.some((item:{id:string})=>item.id===english.id)).toBe(true);
    expect((await request(c,"PATCH",`/api/vocabulary/${english.id}`,{meaningVi:"sức bật",note:"verified",metadata:{...english.metadata,cefr:"C1"}})).json().data).toMatchObject({meaningVi:"sức bật",note:"verified",metadata:{cefr:"C1",toeicLevel:"785-900"}});
    expect((await request(c,"PUT",`/api/vocabulary/${english.id}/favorite`,{favorite:true})).json().data.favorite).toBe(true);
    const reviewed=(await request(c,"POST",`/api/vocabulary/${english.id}/review`,{action:"GOOD"})).json().data;
    expect(reviewed.progress).toMatchObject({status:"LEARNING",repetitions:1,intervalDays:1,correctCount:1,incorrectCount:0});expect(Date.parse(reviewed.progress.nextReviewAt)).toBeGreaterThan(Date.parse(reviewed.progress.lastReviewedAt));
    expect((await request(c,"DELETE",`/api/vocabulary/${chinese.id}`)).statusCode).toBe(204);
    expect((await request(c,"GET",`/api/vocabulary/${chinese.id}`)).statusCode).toBe(404);
  });

  it("persists all four flashcard actions with valid SRS outcomes",async()=>{const c=await testContext();contexts.push(c);
    const outcomes:Record<string,{intervalDays:number;repetitions:number;correctCount:number;incorrectCount:number}>={AGAIN:{intervalDays:1,repetitions:0,correctCount:0,incorrectCount:1},HARD:{intervalDays:1,repetitions:1,correctCount:1,incorrectCount:0},GOOD:{intervalDays:1,repetitions:1,correctCount:1,incorrectCount:0},EASY:{intervalDays:4,repetitions:1,correctCount:1,incorrectCount:0}};
    for(const [index,action] of Object.keys(outcomes).entries()){
      const item=(await request(c,"POST","/api/vocabulary",{language:"en",term:`card-${index}`,meaningVi:`thẻ ${index}`,source:"MANUAL",metadata:{}})).json().data.item;
      const answered=(await request(c,"POST",`/api/flashcards/${item.id}/answer`,{action})).json().data;
      expect(answered.progress).toMatchObject({status:"LEARNING",...outcomes[action]});
      expect(Number.isNaN(Date.parse(answered.progress.nextReviewAt))).toBe(false);
      expect((await request(c,"GET",`/api/vocabulary/${item.id}`)).json().data.progress).toEqual(answered.progress);
    }
  });

  it("supports normal, due, random, empty, English and Chinese flashcard decks",async()=>{const c=await testContext();contexts.push(c);
    expect((await request(c,"GET","/api/flashcards?language=en")).json()).toMatchObject({state:"empty",data:[]});
    const english=(await request(c,"POST","/api/vocabulary",{language:"en",term:"deck-en",meaningVi:"Anh",source:"MANUAL",metadata:{}})).json().data.item;
    const chinese=(await request(c,"POST","/api/vocabulary",{language:"zh",term:"卡片",meaningVi:"thẻ",source:"MANUAL",metadata:{pinyin:"kǎpiàn"}})).json().data.item;
    expect((await request(c,"GET","/api/flashcards?language=en")).json().data.map((item:{id:string})=>item.id)).toEqual([english.id]);
    expect((await request(c,"GET","/api/flashcards?language=zh&random=true&limit=1")).json().data.map((item:{id:string})=>item.id)).toEqual([chinese.id]);
    c.db.run("UPDATE vocabulary_progress SET next_review_at=? WHERE vocabulary_id=?","2000-01-01T00:00:00.000Z",english.id);
    expect((await request(c,"GET","/api/flashcards?language=en&due=true")).json().data.map((item:{id:string})=>item.id)).toEqual([english.id]);
    expect((await request(c,"GET","/api/flashcards?language=zh&due=true")).json()).toMatchObject({state:"empty",data:[]});
  });

  it("creates, reloads, updates and deletes English and Chinese readings",async()=>{const c=await testContext();contexts.push(c);
    const en=(await request(c,"POST","/api/readings",{language:"en",title:"Runtime English",content:"Dr. Smith studies.\nDoes he practice? Yes!",topic:"Test",level:"A2"})).json().data;
    expect(en.sentences.map((s:{text:string})=>s.text)).toEqual(["Dr. Smith studies.","Does he practice?","Yes!"]);
    const zh=(await request(c,"POST","/api/readings",{language:"zh",title:"运行测试",content:"你好！你学习汉语吗？我每天学习。",topic:"测试",level:"HSK1"})).json().data;
    expect(zh.sentences).toHaveLength(3);expect(zh.sentences.flatMap((s:{tokens:unknown[]})=>s.tokens).length).toBeGreaterThan(3);
    expect((await request(c,"GET",`/api/readings/${en.id}`)).json().data.content).toContain("Smith");
    expect((await request(c,"PATCH",`/api/readings/${en.id}`,{title:"Updated"})).json().data.title).toBe("Updated");
    expect((await request(c,"DELETE",`/api/readings/${zh.id}`)).statusCode).toBe(204);
    expect((await request(c,"GET",`/api/readings/${zh.id}`)).statusCode).toBe(404);
  });

  it("fails closed when a selection references another user's reading",async()=>{const c=await testContext();contexts.push(c);
    const reading=(await request(c,"POST","/api/readings",{language:"en",title:"Private",content:"Private sentence."})).json().data;
    const other=(await c.app.inject({method:"POST",url:"/api/auth/register",payload:{name:"Other",email:"other-owner@example.com",password:"password123"}})).json().data;
    const response=await request(c,"POST","/api/vocabulary/from-selection",{text:"Private",sourceLanguage:"en",targetLanguage:"vi",readingId:reading.id,meaningVi:"riêng tư"},other.token);
    expect(response.statusCode).toBe(404);
    expect(c.db.get<{count:number}>("SELECT COUNT(*) count FROM vocabulary_items WHERE user_id=?",other.user.id)?.count).toBe(0);
  });

  it("enforces ownership across mutable and session resources",async()=>{const c=await testContext();contexts.push(c);
    const first=(await request(c,"POST","/api/vocabulary",{language:"en",term:"owner-one",meaningVi:"một",source:"MANUAL",metadata:{}})).json().data.item;
    await request(c,"POST","/api/vocabulary",{language:"en",term:"owner-two",meaningVi:"hai",source:"MANUAL",metadata:{}});
    const reading=(await request(c,"POST","/api/readings",{language:"en",title:"Owner reading",content:"One sentence. Another sentence."})).json().data;
    const shadow=(await request(c,"POST","/api/shadowing",{readingId:reading.id})).json().data;
    const quiz=(await request(c,"POST","/api/quizzes",{language:"en",type:"TERM_TO_MEANING",count:1})).json().data;
    const game=(await request(c,"POST","/api/games",{language:"en",type:"MATCHING",count:2})).json().data;
    const other=(await c.app.inject({method:"POST",url:"/api/auth/register",payload:{name:"Other",email:"other-matrix@example.com",password:"password123"}})).json().data;
    const foreignRequests=[
      request(c,"GET",`/api/vocabulary/${first.id}`,undefined,other.token),request(c,"PATCH",`/api/vocabulary/${first.id}`,{note:"hijack"},other.token),request(c,"DELETE",`/api/vocabulary/${first.id}`,undefined,other.token),request(c,"POST",`/api/vocabulary/${first.id}/review`,{action:"GOOD"},other.token),request(c,"PUT",`/api/vocabulary/${first.id}/favorite`,{favorite:true},other.token),
      request(c,"GET",`/api/readings/${reading.id}`,undefined,other.token),request(c,"PATCH",`/api/readings/${reading.id}`,{title:"hijack"},other.token),request(c,"DELETE",`/api/readings/${reading.id}`,undefined,other.token),request(c,"POST",`/api/readings/${reading.id}/translate`,{},other.token),
      request(c,"GET",`/api/shadowing/${shadow.id}`,undefined,other.token),request(c,"POST",`/api/shadowing/${shadow.id}/advance`,{attemptId:"00000000-0000-4000-8000-000000000001"},other.token),
      request(c,"POST",`/api/quizzes/${quiz.id}/answer`,{answer:"one"},other.token),request(c,"GET",`/api/games/${game.id}`,undefined,other.token),request(c,"POST",`/api/games/${game.id}/answer`,{itemId:"foreign",answer:"one"},other.token)
    ];
    for(const response of await Promise.all(foreignRequests)){expect(response.statusCode).toBe(404);expect(response.json().error.code).toBe("NOT_FOUND");}
    expect((await request(c,"GET",`/api/vocabulary/${first.id}`)).json().data.note).toBeNull();
    expect((await request(c,"GET",`/api/readings/${reading.id}`)).json().data.title).toBe("Owner reading");
  });

  it("returns graceful unconfigured provider errors without writing pronunciation data",async()=>{const c=await testContext();contexts.push(c);
    expect((await request(c,"POST","/api/translate-selection",{text:"hello",sourceLanguage:"en",targetLanguage:"vi"})).json().error.code).toBe("SERVICE_NOT_CONFIGURED");
    expect((await request(c,"POST","/api/tts",{text:"hello",language:"en",speed:1})).json().error.code).toBe("SERVICE_NOT_CONFIGURED");
    const pronunciation=await request(c,"POST","/api/pronunciation/assess",{expectedText:"hello",language:"en",audioBase64:"ZmFrZQ==",audioMimeType:"audio/webm"});
    expect(pronunciation.statusCode).toBe(503);expect(pronunciation.json().error.code).toBe("SERVICE_NOT_CONFIGURED");
    expect(c.db.get<{count:number}>("SELECT COUNT(*) count FROM pronunciation_attempts")?.count).toBe(0);
  });

  it("rejects malformed pronunciation payload and foreign reading ownership",async()=>{const c=await testContext({pronunciation:provider});contexts.push(c);
    expect((await request(c,"POST","/api/pronunciation/assess",{expectedText:"hello",language:"en",audioBase64:"not-base64!",audioMimeType:"text/plain"})).statusCode).toBe(400);
    const reading=(await request(c,"POST","/api/readings",{language:"en",title:"Owned",content:"Practice now."})).json().data;
    const other=(await c.app.inject({method:"POST",url:"/api/auth/register",payload:{name:"Other",email:"other-pron@example.com",password:"password123"}})).json().data;
    const foreign=await request(c,"POST","/api/pronunciation/assess",{expectedText:"Practice now.",language:"en",audioBase64:"ZmFrZQ==",audioMimeType:"audio/webm",readingId:reading.id,sentenceId:reading.sentences[0].id},other.token);
    expect(foreign.statusCode).toBe(404);
  });

  it("enforces the complete shadowing attempt state machine",async()=>{const c=await testContext({pronunciation:provider});contexts.push(c);
    const reading=(await request(c,"POST","/api/readings",{language:"en",title:"Shadow",content:"First line. Second line."})).json().data;
    const session=(await request(c,"POST","/api/shadowing",{readingId:reading.id})).json().data;
    const secondAttempt=(await request(c,"POST","/api/pronunciation/assess",{expectedText:reading.sentences[1].text,language:"en",audioBase64:"ZmFrZQ==",audioMimeType:"audio/webm",readingId:reading.id,sentenceId:reading.sentences[1].id})).json().data;
    expect((await request(c,"POST",`/api/shadowing/${session.id}/advance`,{attemptId:secondAttempt.attemptId})).statusCode).toBe(400);
    const firstAttempt=(await request(c,"POST","/api/pronunciation/assess",{expectedText:reading.sentences[0].text,language:"en",audioBase64:"ZmFrZQ==",audioMimeType:"audio/webm",readingId:reading.id,sentenceId:reading.sentences[0].id})).json().data;
    const next=(await request(c,"POST",`/api/shadowing/${session.id}/advance`,{attemptId:firstAttempt.attemptId})).json().data;
    expect(next.current_sentence).toBe(1);expect(next.completed_count).toBe(1);
    expect((await request(c,"POST",`/api/shadowing/${session.id}/advance`,{attemptId:firstAttempt.attemptId})).statusCode).toBe(400);
    const finalAttempt=(await request(c,"POST","/api/pronunciation/assess",{expectedText:reading.sentences[1].text,language:"en",audioBase64:"ZmFrZQ==",audioMimeType:"audio/webm",readingId:reading.id,sentenceId:reading.sentences[1].id})).json().data;
    const completed=(await request(c,"POST",`/api/shadowing/${session.id}/advance`,{attemptId:finalAttempt.attemptId})).json().data;
    expect(completed.status).toBe("COMPLETED");expect(completed.average_score).toBe(84);
    expect((await request(c,"POST",`/api/shadowing/${session.id}/advance`,{attemptId:finalAttempt.attemptId})).statusCode).toBe(409);
  });

  it("runs required English and Chinese quiz contracts without leaking answers",async()=>{const c=await testContext();contexts.push(c);const vocab=new VocabularyService(c.db);
    for(const [term,meaningVi] of [["patience","sự kiên nhẫn"],["routine","thói quen"],["review","ôn tập"],["abundant","dồi dào"]] as const)vocab.create(c.userId,{language:"en",term,meaningVi,pronunciation:"/peɪʃəns/",source:"MANUAL",metadata:{ipa:"/peɪʃəns/"}});
    vocab.create(c.userId,{language:"zh",term:"朋友",meaningVi:"bạn bè",pronunciation:"péngyou",source:"MANUAL",metadata:{pinyin:"péngyou",toneData:[2,0]}});
    for(const [language,type] of [["en","TERM_TO_MEANING"],["en","MEANING_TO_TERM"],["en","LISTENING"],["zh","HANZI_TO_MEANING"],["zh","HANZI_TO_PINYIN"],["zh","TONE_SELECTION"]] as const){
      const started=(await request(c,"POST","/api/quizzes",{language,type,count:1})).json().data;
      expect(started.currentQuestion).not.toHaveProperty("answer");
      if(type==="LISTENING"){expect(started.currentQuestion.prompt).toContain("Nghe");expect(started.currentQuestion.audioText).toBeTruthy();expect(started.currentQuestion).not.toHaveProperty("feedback");}
      const stored=c.db.get<{questions_json:string}>("SELECT questions_json FROM quiz_sessions WHERE id=?",started.id)!;
      const expected=(JSON.parse(stored.questions_json) as Array<{answer:string}>)[0]!.answer;
      expect(expected).not.toBe("");
      const answered=(await request(c,"POST",`/api/quizzes/${started.id}/answer`,{answer:expected})).json().data;
      expect(answered.session).toMatchObject({status:"COMPLETED",correct:1,incorrect:0,score:100});
    }
  });

  it("returns meaningful empty-data errors for quiz and game starts",async()=>{const c=await testContext();contexts.push(c);
    for(const response of [await request(c,"POST","/api/quizzes",{language:"en",type:"TERM_TO_MEANING",count:10}),await request(c,"POST","/api/games",{language:"zh",type:"MATCHING",count:10})]){
      expect(response.statusCode).toBe(400);expect(response.json().error).toMatchObject({code:"VALIDATION_ERROR"});expect(response.json().error.message.length).toBeGreaterThan(10);
    }
  });

  it("runs all five game types with server-owned state and no answer leakage",async()=>{const c=await testContext();contexts.push(c);const vocab=new VocabularyService(c.db);
    vocab.create(c.userId,{language:"en",term:"one",meaningVi:"một",source:"MANUAL",metadata:{}});vocab.create(c.userId,{language:"en",term:"two",meaningVi:"hai",source:"MANUAL",metadata:{}});
    for(const type of ["MATCHING","MEMORY","LISTENING_CHOICE","FILL_WORD","SPEED_CHALLENGE"] as const){
      let session=(await request(c,"POST","/api/games",{language:"en",type,count:2,timerSeconds:30})).json().data;
      expect(session.currentItem).not.toHaveProperty("answer");
      if(type==="LISTENING_CHOICE")expect(session.currentItem.audioText).toBeTruthy();
      while(session.status==="ACTIVE"){
        const stored=c.db.get<{state_json:string}>("SELECT state_json FROM game_sessions WHERE id=?",session.id)!;
        const state=JSON.parse(stored.state_json) as {items:Array<{id:string;answer:string}>;currentIndex:number};const item=state.items[state.currentIndex]!;
        session=(await request(c,"POST",`/api/games/${session.id}/answer`,{itemId:item.id,answer:item.answer})).json().data.session;
      }
      expect(session).toMatchObject({status:"COMPLETED",score:20,completedCount:2});
    }
  });

  it("uses unified errors for invalid inputs and unknown API routes",async()=>{const c=await testContext();contexts.push(c);
    for(const response of [
      await request(c,"POST","/api/vocabulary",{language:"xx",term:"",meaningVi:""}),
      await request(c,"POST","/api/vocabulary",{language:"en",term:"x".repeat(201),meaningVi:"too long"}),
      await request(c,"POST","/api/readings",{language:"en",title:"",content:""}),
      await request(c,"POST","/api/readings",{language:"en",title:"Huge",content:"x".repeat(50_001)}),
      await request(c,"POST","/api/quizzes",{language:"en",type:"INVALID",count:1}),
      await request(c,"POST","/api/games",{language:"en",type:"INVALID",count:2}),
      await request(c,"POST","/api/translate-selection",{text:"hello",sourceLanguage:"en",targetLanguage:"en"}),
      await request(c,"POST","/api/flashcards/00000000-0000-4000-8000-000000000001/answer",{action:"PERFECT"}),
      await request(c,"GET","/api/vocabulary/not-a-uuid"),
      await request(c,"GET","/api/does-not-exist")
    ]){expect([400,404]).toContain(response.statusCode);expect(response.json()).toHaveProperty("error.code");}
  });

  it("keeps sentence splitting stable across punctuation, newlines and common abbreviations",()=>{
    expect(splitSentences("Dr. Smith works.\nReally? Yes!","en")).toEqual(["Dr. Smith works.","Really?","Yes!"]);
    expect(splitSentences("你好。\n你好吗？很好！","zh")).toEqual(["你好。","你好吗？","很好！"]);
  });

  it("classifies trimmed word, phrase and sentence selections",()=>{
    expect(classifySelection("  patience  ","en")).toBe("word");
    expect(classifySelection("takes time","en")).toBe("phrase");
    expect(classifySelection("Learning a language takes time.","en")).toBe("sentence");
    expect(classifySelection("朋友","zh")).toBe("word");
    expect(classifySelection("学习 汉语","zh")).toBe("phrase");
    expect(classifySelection("我每天认真学习汉语。","zh")).toBe("sentence");
  });
});
