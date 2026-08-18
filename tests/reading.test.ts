import { afterEach,describe,expect,it } from "vitest";
import { splitSentences,tokenize } from "../src/core/reading.js";
import { StaticTranslationService } from "../src/core/providers.js";
import { testContext } from "./helpers.js";
const contexts:Array<Awaited<ReturnType<typeof testContext>>>=[];afterEach(async()=>{while(contexts.length)await contexts.pop()!.close();});
describe("reading",()=>{
  it("splits English and Chinese sentences",()=>{expect(splitSentences("Hello world. How are you?","en")).toEqual(["Hello world.","How are you?"]);expect(splitSentences("你好！我很好。一起学习吧。","zh")).toEqual(["你好！","我很好。","一起学习吧。"]);expect(tokenize("学习汉语","zh").filter(t=>t.clickable).length).toBeGreaterThan(1);});
  it("creates a passage with ordered tokenized sentences",async()=>{const c=await testContext();contexts.push(c);const response=await c.app.inject({method:"POST",url:"/api/readings",headers:c.headers,payload:{language:"en",title:"Sample",content:"First sentence. Second sentence!"}});expect(response.statusCode).toBe(201);expect(response.json().data.sentences).toHaveLength(2);expect(response.json().data.wordCount).toBe(4);});
  it("translates selections and classifies their type",async()=>{const c=await testContext({translation:new StaticTranslationService(()=>"cần thời gian")});contexts.push(c);const response=await c.app.inject({method:"POST",url:"/api/translate-selection",headers:c.headers,payload:{text:"takes time",sourceLanguage:"en",targetLanguage:"vi"}});expect(response.json().data).toMatchObject({translation:"cần thời gian",type:"phrase"});});
  it("rejects oversized selected text",async()=>{const c=await testContext();contexts.push(c);const response=await c.app.inject({method:"POST",url:"/api/translate-selection",headers:c.headers,payload:{text:"a".repeat(1001),sourceLanguage:"en",targetLanguage:"vi"}});expect(response.statusCode).toBe(400);expect(response.json().error.code).toBe("VALIDATION_ERROR");});
});
