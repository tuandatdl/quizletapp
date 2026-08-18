import { randomUUID } from "node:crypto";
import type { Database } from "../db/database.js";
import { errors } from "../shared/errors.js";
import type { Language } from "../shared/schemas.js";
import type { PronunciationResult, PronunciationService } from "./providers.js";

export class PronunciationCore {
  constructor(private readonly db:Database,private readonly provider:PronunciationService){}
  availability(){return {
    status:this.provider.configured?"AVAILABLE" as const:"NOT_CONFIGURED" as const,
    configured:this.provider.configured,
    provider:this.provider.provider,
    assessmentAvailable:this.provider.configured
  };}
  async assess(userId:string,input:{expectedText:string;language:Language;audioBase64:string;audioMimeType?:string;readingId?:string;sentenceId?:string}){
    if(!this.provider.configured)throw errors.notConfigured("pronunciation");
    if(input.readingId&&!this.db.get("SELECT id FROM readings WHERE id=? AND user_id=?",input.readingId,userId))throw errors.notFound("Reading passage");
    if(input.sentenceId&&!this.db.get("SELECT s.id FROM reading_sentences s JOIN readings r ON r.id=s.passage_id WHERE s.id=? AND s.passage_id=? AND r.user_id=?",input.sentenceId,input.readingId??"",userId))throw errors.notFound("Reading sentence");
    const result=await this.provider.assess(input);return this.save(userId,input,result);
  }
  save(userId:string,input:{expectedText:string;language:Language;readingId?:string;sentenceId?:string},result:PronunciationResult){
    const id=randomUUID(),now=new Date().toISOString();
    this.db.transaction(()=>{this.db.run("INSERT INTO pronunciation_attempts(id,user_id,language,reading_id,sentence_id,text,score,pronunciation_score,fluency_score,rhythm_score,tone_accuracy,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",id,userId,input.language,input.readingId??null,input.sentenceId??null,input.expectedText,result.overallScore,result.pronunciationScore,result.fluencyScore,result.rhythmScore??null,result.toneAccuracy??null,now);result.words.forEach(w=>this.db.run("INSERT INTO pronunciation_word_results(id,attempt_id,word,score,status) VALUES(?,?,?,?,?)",randomUUID(),id,w.word,w.score,w.status));const date=now.slice(0,10);this.db.run("INSERT INTO study_activities(user_id,activity_date,pronunciation_attempts) VALUES(?,?,1) ON CONFLICT(user_id,activity_date) DO UPDATE SET pronunciation_attempts=pronunciation_attempts+1",userId,date);});
    return {attemptId:id,createdAt:now,...result};
  }
  recent(userId:string,limit=20){return this.db.all("SELECT id,language,reading_id AS readingId,sentence_id AS sentenceId,text,score,pronunciation_score AS pronunciationScore,fluency_score AS fluencyScore,rhythm_score AS rhythmScore,tone_accuracy AS toneAccuracy,created_at AS createdAt FROM pronunciation_attempts WHERE user_id=? ORDER BY created_at DESC LIMIT ?",userId,limit);}
  weakest(userId:string,limit=20){return this.db.all("SELECT r.word,ROUND(AVG(r.score),1) AS averageScore,COUNT(*) AS attempts FROM pronunciation_word_results r JOIN pronunciation_attempts a ON a.id=r.attempt_id WHERE a.user_id=? GROUP BY LOWER(r.word) HAVING AVG(r.score)<75 ORDER BY averageScore ASC,attempts DESC LIMIT ?",userId,limit);}
}

export class ShadowingService {
  constructor(private readonly db:Database){}
  start(userId:string,readingId:string){const reading=this.db.get<{language:string}>("SELECT language FROM readings WHERE id=? AND user_id=?",readingId,userId);if(!reading)throw errors.notFound("Reading passage");const count=this.db.get<{count:number}>("SELECT COUNT(*) count FROM reading_sentences WHERE passage_id=?",readingId)?.count??0;if(!count)throw errors.validation("Reading has no sentences");const id=randomUUID(),createdAt=new Date().toISOString();this.db.run("INSERT INTO shadowing_sessions(id,user_id,reading_id,language,created_at) VALUES(?,?,?,?,?)",id,userId,readingId,reading.language,createdAt);return this.get(userId,id);}
  get(userId:string,id:string){const row=this.db.get<{id:string;user_id:string;reading_id:string;language:string;current_sentence:number;completed_count:number;score_total:number;average_score:number;status:string;created_at:string;completed_at:string|null}>("SELECT * FROM shadowing_sessions WHERE id=? AND user_id=?",id,userId);if(!row)throw errors.notFound("Shadowing session");const sentence=this.db.get("SELECT id,sentence_order AS `order`,text,translation_vi AS translationVi,audio_url AS audioUrl FROM reading_sentences WHERE passage_id=? AND sentence_order=?",row.reading_id,row.current_sentence);return {...row,currentSentenceData:sentence??null};}
  advance(userId:string,id:string,attemptId:string){const session=this.get(userId,id);if(session.status!=="ACTIVE")throw errors.conflict("Shadowing session is already completed");const current=session.currentSentenceData as {id:string}|null;if(!current)throw errors.conflict("Shadowing session has no current sentence");const attempt=this.db.get<{score:number}>("SELECT score FROM pronunciation_attempts WHERE id=? AND user_id=? AND reading_id=? AND sentence_id=?",attemptId,userId,session.reading_id,current.id);if(!attempt)throw errors.validation("Pronunciation attempt must belong to the current shadowing sentence");const total=this.db.get<{count:number}>("SELECT COUNT(*) count FROM reading_sentences WHERE passage_id=?",session.reading_id)!.count;const completed=session.completed_count+1,next=session.current_sentence+1,scoreTotal=session.score_total+attempt.score,done=next>=total;this.db.transaction(()=>{this.db.run("UPDATE shadowing_sessions SET current_sentence=?,completed_count=?,score_total=?,average_score=?,status=?,completed_at=? WHERE id=?",next,completed,scoreTotal,Number((scoreTotal/completed).toFixed(1)),done?"COMPLETED":"ACTIVE",done?new Date().toISOString():null,id);const date=new Date().toISOString().slice(0,10);this.db.run("INSERT INTO study_activities(user_id,activity_date,shadowing_minutes) VALUES(?,?,1) ON CONFLICT(user_id,activity_date) DO UPDATE SET shadowing_minutes=shadowing_minutes+1",userId,date);});return this.get(userId,id);}
}
