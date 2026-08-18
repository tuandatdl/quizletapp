import { afterEach,describe,expect,it } from "vitest";
import { ProgressService,isActiveDay } from "../src/core/progress.js";
import { scoreAnswer } from "../src/core/quiz.js";
import { VocabularyService } from "../src/core/vocabulary.js";
import { testContext } from "./helpers.js";
const contexts:Array<Awaited<ReturnType<typeof testContext>>>=[];afterEach(async()=>{while(contexts.length)await contexts.pop()!.close();});
describe("quiz and progress",()=>{
  it("scores normalized answers",()=>{expect(scoreAnswer(" Patience ","patience")).toBe(true);expect(scoreAnswer("friend","enemy")).toBe(false);});
  it("runs a quiz and aggregates progress",async()=>{const c=await testContext();contexts.push(c);new VocabularyService(c.db).create(c.userId,{language:"en",term:"friend",meaningVi:"bạn",source:"MANUAL",metadata:{}});const start=await c.app.inject({method:"POST",url:"/api/quizzes",headers:c.headers,payload:{language:"en",type:"TERM_TO_MEANING",count:1}});const session=start.json().data;const answer=await c.app.inject({method:"POST",url:`/api/quizzes/${session.id}/answer`,headers:c.headers,payload:{answer:"bạn"}});expect(answer.json().data.session).toMatchObject({status:"COMPLETED",score:100});expect(new ProgressService(c.db).dashboard(c.userId).languages.en.quizAccuracy).toBe(100);});
  it("computes streak from qualifying real activity",async()=>{const c=await testContext();contexts.push(c);c.db.run("INSERT INTO study_activities(user_id,activity_date,vocabulary_reviews) VALUES(?,?,?)",c.userId,"2026-01-03",1);c.db.run("INSERT INTO study_activities(user_id,activity_date,reading_minutes) VALUES(?,?,?)",c.userId,"2026-01-02",5);c.db.run("INSERT INTO study_activities(user_id,activity_date,reading_minutes) VALUES(?,?,?)",c.userId,"2026-01-01",1);expect(new ProgressService(c.db).streak(c.userId,new Date("2026-01-03T12:00:00Z"))).toBe(2);expect(isActiveDay({vocabularyReviews:0,quizzes:0,readingMinutes:4,shadowingMinutes:0,pronunciationAttempts:0})).toBe(false);});
});
