var p={A1:"Basic, very simple vocabulary, present tense, short sentence structure (< 8 words).",A2:"Simple routine situations, basic connectors (and, but, because), daily life context.",B1:"Intermediate, everyday work/school/travel context, modal verbs, compound sentences.",B2:"Upper-intermediate, professional/academic nuances, idiomatic usage, complex clauses.",C1:"Advanced, formal/sophisticated tone, abstract ideas, nuanced collocations, varied sentence structure.",C2:"Mastery level, highly idiomatic, literary or specialized precision, complex stylistic nuance."},C=()=>{try{const e=typeof localStorage<"u"?localStorage.getItem("lexis_gemini_api_key"):null;if(e&&e.trim())return e.trim()}catch{}return null},S=async e=>{const{term:m,language:h,level:d="B1",partOfSpeech:y="",meaningVi:f="",apiKey:s}=e,o=s!==void 0?s:C();if(!o)throw new Error("Vui lòng cấu hình Gemini API Key trong phần Cài đặt để sử dụng tính năng tạo ví dụ AI.");const v=h==="zh"?"Chinese (Mandarin with Pinyin)":"English",r=(d||"B1").toUpperCase(),w=p[r]||p.B1,x=`You are an expert language educator.
Generate exactly 2 realistic, high-quality contextual example sentences for the following vocabulary word:
- Word: "${m}"
- Target Language: ${v}
- Part of Speech: ${y||"Not specified"}
- Meaning in Vietnamese: ${f||"Not specified"}
- Target CEFR Level: ${r}
- CEFR Guideline: ${w}

Requirements:
1. Sentences must naturally demonstrate the core meaning and proper grammatical usage of the word.
2. The complexity of grammar and surrounding vocabulary must strictly match the CEFR ${r} guideline.
3. Provide an accurate, natural Vietnamese translation for each sentence.
4. Return ONLY a valid JSON array matching this exact schema:
[
  { "sentence": "Example sentence 1", "translation": "Bản dịch tiếng Việt 1" },
  { "sentence": "Example sentence 2", "translation": "Bản dịch tiếng Việt 2" }
]`,c=o.trim(),l=["gemini-flash-latest","gemini-3.0-flash"],u=async(t=0)=>{const E=`https://generativelanguage.googleapis.com/v1beta/models/${l[t]||"gemini-flash-latest"}:generateContent?key=${c}`,n=await fetch(E,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":c},body:JSON.stringify({contents:[{parts:[{text:x}]}],generationConfig:{responseMimeType:"application/json",temperature:.4}})});return(n.status===404||n.status===400||n.status===503||n.status===429)&&t+1<l.length?u(t+1):n},a=await u();if(!a.ok){const t=await a.json().catch(()=>({}));throw new Error(t?.error?.message||`Gemini API error: ${a.status}`)}const g=(await a.json())?.candidates?.[0]?.content?.parts?.[0]?.text;if(!g)throw new Error("Không nhận được phản hồi từ AI Gemini.");const i=JSON.parse(g);if(!Array.isArray(i)||i.length===0)throw new Error("Định dạng dữ liệu trả về từ AI không hợp lệ.");return i};export{C as n,S as t};
