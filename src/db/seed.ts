import { AuthService } from "../core/auth.js";
import { ReadingService } from "../core/reading.js";
import { UnconfiguredTranslationService } from "../core/providers.js";
import { VocabularyService } from "../core/vocabulary.js";
import { loadConfig } from "../config.js";
import { Database } from "./database.js";

const config=loadConfig();
if(config.appEnv==="production"&&!config.allowDemoSeed)throw new Error("Demo seed is disabled in production; set ALLOW_DEMO_SEED=true only for an intentional private demo");
const db=new Database(config.databaseUrl,config.databaseBusyTimeoutMs);db.migrate();
const auth=new AuthService(db,30);
let user=db.get<{id:string}>("SELECT id FROM users WHERE email=?","demo@tutrinhlanguage.local");
if(!user){auth.register({name:"Demo Learner",email:"demo@tutrinhlanguage.local",password:"Demo123!"});user=db.get<{id:string}>("SELECT id FROM users WHERE email=?","demo@tutrinhlanguage.local")!;}
const readings=new ReadingService(db,new UnconfiguredTranslationService());
if(!db.get("SELECT id FROM readings WHERE user_id=? AND title=?",user.id,"My Daily Routine"))readings.create(user.id,{language:"en",title:"My Daily Routine",topic:"Daily life",level:"A2",content:"I wake up at six every morning. I make breakfast and study English before work. In the evening, I review new words and read a short story.",translationVi:"Tôi thức dậy lúc sáu giờ mỗi sáng. Tôi làm bữa sáng và học tiếng Anh trước khi làm việc. Buổi tối, tôi ôn từ mới và đọc một truyện ngắn."});
if(!db.get("SELECT id FROM readings WHERE user_id=? AND title=?",user.id,"我的朋友"))readings.create(user.id,{language:"zh",title:"我的朋友",topic:"Friends",level:"HSK1",content:"我的朋友叫小明。他喜欢学习汉语，也喜欢喝茶。我们每天一起学习。",translationVi:"Bạn tôi tên là Tiểu Minh. Cậu ấy thích học tiếng Trung và cũng thích uống trà. Chúng tôi học cùng nhau mỗi ngày."});
const vocabulary=new VocabularyService(db);
const items=[
  {language:"en" as const,term:"routine",pronunciation:"/ruːˈtiːn/",meaningVi:"thói quen; lịch trình",partOfSpeech:"noun",example:"My routine starts at six.",topic:"Daily life",level:"A2",metadata:{ipa:"/ruːˈtiːn/",cefr:"A2"}},
  {language:"en" as const,term:"review",pronunciation:"/rɪˈvjuː/",meaningVi:"ôn tập",partOfSpeech:"verb",example:"I review new words.",topic:"Study",level:"A2",metadata:{ipa:"/rɪˈvjuː/",cefr:"A2"}},
  {language:"zh" as const,term:"朋友",pronunciation:"péngyou",meaningVi:"bạn bè",partOfSpeech:"noun",example:"他是我的朋友。",topic:"Friends",level:"HSK1",metadata:{simplified:"朋友",traditional:"朋友",pinyin:"péngyou",toneData:[2,0],hskLevel:1}},
  {language:"zh" as const,term:"学习",pronunciation:"xuéxí",meaningVi:"học tập",partOfSpeech:"verb",example:"我们学习汉语。",topic:"Study",level:"HSK1",metadata:{simplified:"学习",traditional:"學習",pinyin:"xuéxí",toneData:[2,2],hskLevel:1}}
];
for(const item of items)vocabulary.create(user.id,{...item,source:"MANUAL"});
db.close();console.log("Demo seeded: demo@tutrinhlanguage.local / Demo123!");
