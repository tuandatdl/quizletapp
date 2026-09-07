var g={A1:"Basic, very simple vocabulary, present tense, short sentence structure (< 8 words).",A2:"Simple routine situations, basic connectors (and, but, because), daily life context.",B1:"Intermediate, everyday work/school/travel context, modal verbs, compound sentences.",B2:"Upper-intermediate, professional/academic nuances, idiomatic usage, complex clauses.",C1:"Advanced, formal/sophisticated tone, abstract ideas, nuanced collocations, varied sentence structure.",C2:"Mastery level, highly idiomatic, literary or specialized precision, complex stylistic nuance."},C=()=>{try{const t=typeof localStorage<"u"?localStorage.getItem("lexis_gemini_api_key"):null;if(t&&t.trim())return t.trim()}catch{}return null},S=async t=>{const{term:m,language:h,level:d="B1",partOfSpeech:y="",meaningVi:f="",apiKey:o}=t,c=o!==void 0?o:C();if(!c)throw new Error("Vui lòng cấu hình Gemini API Key trong phần Cài đặt để sử dụng tính năng tạo ví dụ AI.");const v=h==="zh"?"Chinese (Mandarin with Pinyin)":"English",i=(d||"B1").toUpperCase(),w=g[i]||g.B1,x=`You are an expert language educator.
Generate exactly 2 realistic, high-quality contextual example sentences for the following vocabulary word:
- Word: "${m}"
- Target Language: ${v}
- Part of Speech: ${y||"Not specified"}
- Meaning in Vietnamese: ${f||"Not specified"}
- Target CEFR Level: ${i}
- CEFR Guideline: ${w}

Requirements:
1. Sentences must naturally demonstrate the core meaning and proper grammatical usage of the word.
2. The complexity of grammar and surrounding vocabulary must strictly match the CEFR ${i} guideline.
3. Provide an accurate, natural Vietnamese translation for each sentence.
4. Return ONLY a valid JSON array matching this exact schema:
[
  { "sentence": "Example sentence 1", "translation": "Bản dịch tiếng Việt 1" },
  { "sentence": "Example sentence 2", "translation": "Bản dịch tiếng Việt 2" }
]`,l=c.trim(),p=["gemini-3.8-flash","gemini-3.5-flash-lite","gemini-3.1-pro"],u=async(e=0)=>{const E=`https://generativelanguage.googleapis.com/v1beta/models/${p[e]||"gemini-3.8-flash"}:generateContent?key=${l}`,a=await fetch(E,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":l},body:JSON.stringify({contents:[{parts:[{text:x}]}],generationConfig:{responseMimeType:"application/json",temperature:.4}})});return(a.status===404||a.status===400||a.status===503||a.status===429)&&e+1<p.length?u(e+1):a},r=await u();if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message||`Gemini API error: ${r.status}`)}const s=(await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text;if(!s)throw new Error("Không nhận được phản hồi từ AI Gemini.");let n=[];try{const e=s.replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/,"").trim();n=JSON.parse(e)}catch(e){console.error("[Gemini] JSON.parse failed for example response:",e,{rawText:s}),n=[]}if(!Array.isArray(n)||n.length===0)throw new Error("Định dạng dữ liệu trả về từ AI không hợp lệ.");return n};export{C as n,S as t};
