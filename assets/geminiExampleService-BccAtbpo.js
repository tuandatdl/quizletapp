var e={A1:`Basic, very simple vocabulary, present tense, short sentence structure (< 8 words).`,A2:`Simple routine situations, basic connectors (and, but, because), daily life context.`,B1:`Intermediate, everyday work/school/travel context, modal verbs, compound sentences.`,B2:`Upper-intermediate, professional/academic nuances, idiomatic usage, complex clauses.`,C1:`Advanced, formal/sophisticated tone, abstract ideas, nuanced collocations, varied sentence structure.`,C2:`Mastery level, highly idiomatic, literary or specialized precision, complex stylistic nuance.`},t=()=>{try{let e=typeof localStorage<`u`?localStorage.getItem(`lexis_gemini_api_key`):null;if(e&&e.trim())return e.trim()}catch{}return null},n=async n=>{let{term:r,language:i,level:a=`B1`,partOfSpeech:o=``,meaningVi:s=``,apiKey:c}=n,l=c===void 0?t():c;if(!l)throw Error(`Vui lòng cấu hình Gemini API Key trong phần Cài đặt để sử dụng tính năng tạo ví dụ AI.`);let u=i===`zh`?`Chinese (Mandarin with Pinyin)`:`English`,d=(a||`B1`).toUpperCase(),f=e[d]||e.B1,p=`You are an expert language educator.
Generate exactly 2 realistic, high-quality contextual example sentences for the following vocabulary word:
- Word: "${r}"
- Target Language: ${u}
- Part of Speech: ${o||`Not specified`}
- Meaning in Vietnamese: ${s||`Not specified`}
- Target CEFR Level: ${d}
- CEFR Guideline: ${f}

Requirements:
1. Sentences must naturally demonstrate the core meaning and proper grammatical usage of the word.
2. The complexity of grammar and surrounding vocabulary must strictly match the CEFR ${d} guideline.
3. Provide an accurate, natural Vietnamese translation for each sentence.
4. Return ONLY a valid JSON array matching this exact schema:
[
  { "sentence": "Example sentence 1", "translation": "Bản dịch tiếng Việt 1" },
  { "sentence": "Example sentence 2", "translation": "Bản dịch tiếng Việt 2" }
]`,m=l.trim(),h=[`gemini-flash-latest`,`gemini-2.0-flash`,`gemini-1.5-flash`,`gemini-2.5-flash`,`gemini-3.7-flash`],g=async(e=0)=>{let t=`https://generativelanguage.googleapis.com/v1beta/models/${h[e]||`gemini-flash-latest`}:generateContent?key=${m}`,n=await fetch(t,{method:`POST`,headers:{"Content-Type":`application/json`,"x-goog-api-key":m},body:JSON.stringify({contents:[{parts:[{text:p}]}],generationConfig:{responseMimeType:`application/json`,temperature:.4}})});return(n.status===404||n.status===400||n.status===503||n.status===429)&&e+1<h.length?g(e+1):n},_=await g();if(!_.ok){let e=await _.json().catch(()=>({}));throw Error(e?.error?.message||`Gemini API error: ${_.status}`)}let v=(await _.json())?.candidates?.[0]?.content?.parts?.[0]?.text;if(!v)throw Error(`Không nhận được phản hồi từ AI Gemini.`);let y=JSON.parse(v);if(!Array.isArray(y)||y.length===0)throw Error(`Định dạng dữ liệu trả về từ AI không hợp lệ.`);return y};export{t as n,n as t};