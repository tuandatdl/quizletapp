import { randomUUID } from "node:crypto";
import type { Database, SqlValue } from "../db/database.js";
import { errors } from "../shared/errors.js";
import type { Language } from "../shared/schemas.js";
import type { TranslationService } from "./providers.js";

interface ReadingRow extends Record<string, SqlValue> { id:string;user_id:string;language:Language;title:string;content:string;translation_vi:string|null;topic:string|null;level:string|null;word_count:number;created_at:string;updated_at:string }
interface SentenceRow extends Record<string, SqlValue> { id:string;passage_id:string;sentence_order:number;text:string;translation_vi:string|null;audio_url:string|null }

export function splitSentences(content: string, language: Language): string[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) return [];
  const pattern = language === "zh" ? /[^。！？!?；;\n]+[。！？!?；;]?/gu : /[^.!?\n]+(?:[.!?]+["'”’)]*)?|[^.!?\n]+$/gu;
  const protectedText = language === "en"
    ? normalized.replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc)\./giu, (value) => `${value.slice(0, -1)}\uE000`)
    : normalized;
  return (protectedText.match(pattern) ?? [protectedText]).map((sentence) => sentence.replaceAll("\uE000", ".").trim()).filter(Boolean);
}

export function tokenize(text: string, language: Language): Array<{ text: string; type: "word" | "punctuation" | "space"; clickable: boolean }> {
  if (language === "en") return (text.match(/[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*|\s+|[^\p{L}\p{M}\s]/gu) ?? []).map((part) => ({ text:part, type:/^\s+$/u.test(part)?"space":/^\p{L}/u.test(part)?"word":"punctuation", clickable:/^\p{L}/u.test(part) }));
  // Phase-one fallback groups contiguous Han characters in pairs. The contract exposes boundaries so a segmentation provider can replace it later.
  const pieces = text.match(/[\p{Script=Han}]{1,2}|[A-Za-z0-9]+|\s+|./gu) ?? [];
  return pieces.map((part) => ({ text:part, type:/^\s+$/u.test(part)?"space":/^[\p{Script=Han}A-Za-z0-9]/u.test(part)?"word":"punctuation", clickable:/^[\p{Script=Han}A-Za-z0-9]/u.test(part) }));
}

function wordCount(text:string, language:Language): number { return tokenize(text,language).filter((token)=>token.type==="word").length; }

export class ReadingService {
  constructor(private readonly db:Database, private readonly translation:TranslationService) {}

  create(userId:string,input:{language:Language;title:string;content:string;translationVi?:string|null;topic?:string|null;level?:string|null}) {
    const id=randomUUID(),now=new Date().toISOString(),sentences=splitSentences(input.content,input.language);
    this.db.transaction(()=>{
      this.db.run("INSERT INTO readings(id,user_id,language,title,content,translation_vi,topic,level,word_count,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",id,userId,input.language,input.title,input.content,input.translationVi??null,input.topic??null,input.level??null,wordCount(input.content,input.language),now,now);
      sentences.forEach((text,index)=>this.db.run("INSERT INTO reading_sentences(id,passage_id,sentence_order,text) VALUES(?,?,?,?)",randomUUID(),id,index,text));
    });
    return this.get(userId,id);
  }

  get(userId:string,id:string) {
    const row=this.db.get<ReadingRow>("SELECT * FROM readings WHERE id=? AND user_id=?",id,userId);
    if(!row) throw errors.notFound("Reading passage");
    const sentences=this.db.all<SentenceRow>("SELECT * FROM reading_sentences WHERE passage_id=? ORDER BY sentence_order",id).map(s=>({id:s.id,passageId:s.passage_id,order:s.sentence_order,text:s.text,translationVi:s.translation_vi,audioUrl:s.audio_url,tokens:tokenize(s.text,row.language)}));
    return {id:row.id,userId:row.user_id,language:row.language,title:row.title,content:row.content,translationVi:row.translation_vi,topic:row.topic,level:row.level,wordCount:row.word_count,createdAt:row.created_at,updatedAt:row.updated_at,sentences};
  }
  list(userId:string,language?:Language){const rows=this.db.all<ReadingRow>(`SELECT * FROM readings WHERE user_id=?${language?" AND language=?":""} ORDER BY updated_at DESC`,...(language?[userId,language]:[userId]));return rows.map(r=>({id:r.id,language:r.language,title:r.title,translationVi:r.translation_vi,topic:r.topic,level:r.level,wordCount:r.word_count,createdAt:r.created_at,updatedAt:r.updated_at}));}
  update(userId:string,id:string,input:{language?:Language;title?:string;content?:string;translationVi?:string|null;topic?:string|null;level?:string|null}){
    const old=this.get(userId,id),language=input.language??old.language,content=input.content??old.content;
    this.db.transaction(()=>{this.db.run("UPDATE readings SET language=?,title=?,content=?,translation_vi=?,topic=?,level=?,word_count=?,updated_at=? WHERE id=? AND user_id=?",language,input.title??old.title,content,input.translationVi===undefined?old.translationVi:input.translationVi,input.topic===undefined?old.topic:input.topic,input.level===undefined?old.level:input.level,wordCount(content,language),new Date().toISOString(),id,userId);if(input.content!==undefined||input.language!==undefined){this.db.run("DELETE FROM reading_sentences WHERE passage_id=?",id);splitSentences(content,language).forEach((text,index)=>this.db.run("INSERT INTO reading_sentences(id,passage_id,sentence_order,text) VALUES(?,?,?,?)",randomUUID(),id,index,text));}});return this.get(userId,id);
  }
  remove(userId:string,id:string){if(!this.db.run("DELETE FROM readings WHERE id=? AND user_id=?",id,userId).changes)throw errors.notFound("Reading passage");}
  async translatePassage(userId:string,id:string){const passage=this.get(userId,id);const result=await this.translation.translate(passage.content,passage.language,"vi");this.db.run("UPDATE readings SET translation_vi=?,updated_at=? WHERE id=?",result.translation,new Date().toISOString(),id);return {passageId:id,...result};}
  async translateSelection(userId:string,input:{text:string;sourceLanguage:Language;targetLanguage:"vi";readingId?:string}){if(input.readingId)this.get(userId,input.readingId);const translated=await this.translation.translate(input.text,input.sourceLanguage,"vi");const type=classifySelection(input.text,input.sourceLanguage);return {...translated,type};}
}

export function classifySelection(text:string,language:Language):"word"|"phrase"|"sentence"{
  const trimmed=text.trim();
  if(/[.!?。！？]$/u.test(trimmed))return"sentence";
  const count=language==="en"?(trimmed.match(/[\p{L}\p{M}]+/gu)?.length??0):tokenize(trimmed,"zh").filter(t=>t.type==="word").length;
  return count<=1?"word":count<=8?"phrase":"sentence";
}
