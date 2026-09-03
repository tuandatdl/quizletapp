import{r as b}from"./rolldown-runtime-CXHxssQy.js";import{g,t as c}from"./vendor-react-COcI53Ed.js";var u=b(g(),1),i=c(),h=({state:e,volumeLevel:s=0,size:n=160,className:l="",customLabel:d})=>{const p=e==="listening"?1+Math.min(.35,s*.7):1;let r="#6366f1",t="#8b5cf6",a="rgba(99, 102, 241, 0.4)",o="Sẵn sàng";return e==="disconnected"?(r="#64748b",t="#94a3b8",a="rgba(100, 116, 139, 0.2)",o="Chưa kết nối"):e==="connecting"?(r="#3b82f6",t="#60a5fa",a="rgba(59, 130, 246, 0.35)",o="Đang kết nối..."):e==="listening"?(r="#6366f1",t="#a855f7",a=`rgba(99, 102, 241, ${.35+s*.4})`,o=s>.08?"Đang lắng nghe...":"Đang chờ bạn nói"):e==="speaking"?(r="#10b981",t="#06b6d4",a="rgba(16, 185, 129, 0.45)",o="Gemini đang nói..."):e==="interrupted"&&(r="#f59e0b",t="#fbbf24",a="rgba(245, 158, 11, 0.5)",o="Đã ngắt lời!"),d&&(o=d),(0,i.jsxs)("div",{className:`live-pulsing-orb-root ${l}`,style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",padding:"20px"},children:[(0,i.jsx)("style",{children:`
        @keyframes orbPulseBreathing {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }
        @keyframes orbAuraRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbWaveRipples {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.45);
            opacity: 0;
          }
        }
      `}),(e==="speaking"||e==="listening"&&s>.15)&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("div",{style:{position:"absolute",width:`${n}px`,height:`${n}px`,borderRadius:"50%",border:`2px solid ${r}`,animation:"orbWaveRipples 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite",pointerEvents:"none"}}),(0,i.jsx)("div",{style:{position:"absolute",width:`${n}px`,height:`${n}px`,borderRadius:"50%",border:`2px solid ${t}`,animation:"orbWaveRipples 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite",animationDelay:"0.6s",pointerEvents:"none"}})]}),(0,i.jsx)("div",{style:{position:"absolute",width:`${n+24}px`,height:`${n+24}px`,borderRadius:"50%",background:`conic-gradient(from 0deg, transparent 0%, ${a} 50%, transparent 100%)`,animation:e==="speaking"?"orbAuraRotate 3s linear infinite":"orbAuraRotate 8s linear infinite",pointerEvents:"none",filter:"blur(6px)"}}),(0,i.jsx)("div",{style:{width:`${n}px`,height:`${n}px`,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%, #ffffff 0%, ${t} 45%, ${r} 100%)`,boxShadow:`0 0 32px ${a}, 0 0 64px ${a}`,transform:`scale(${p})`,transition:"transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease",animation:e==="speaking"?"orbPulseBreathing 1.2s ease-in-out infinite":"orbPulseBreathing 3.5s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center",cursor:"default",zIndex:2},children:(0,i.jsx)("div",{style:{width:"60%",height:"60%",borderRadius:"50%",background:"radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)",pointerEvents:"none"}})}),(0,i.jsxs)("div",{style:{marginTop:"16px",padding:"4px 14px",borderRadius:"var(--radius-full, 9999px)",backgroundColor:"var(--bg-surface)",border:"1px solid var(--border-default)",boxShadow:"var(--shadow-xs)",fontSize:"var(--text-xs)",fontWeight:700,color:r,display:"inline-flex",alignItems:"center",gap:"6px",zIndex:3},children:[(0,i.jsx)("span",{style:{width:"8px",height:"8px",borderRadius:"50%",backgroundColor:r,boxShadow:`0 0 8px ${r}`}}),(0,i.jsx)("span",{children:o})]})]})};export{h as t};
