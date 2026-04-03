import { useState } from "react";

const HC = ["#1a237e","#b71c1c","#1b5e20","#e65100","#4a148c","#006064"];

function parse(text) {
  return text.split("\n").map(line => {
    const t = line.trim();
    if (!t) return { type:"space" };
    const isH = t.startsWith("##") || (t.startsWith("**")&&t.endsWith("**")) ||
      (t===t.toUpperCase()&&t.length>3&&/[A-Z]/.test(t)&&!/^\d/.test(t)) ||
      (t.endsWith(":")&&t.length<70&&!t.startsWith("-"));
    if (isH) return { type:"h", text:t.replace(/^#+\s*/,"").replace(/\*\*/g,"").replace(/:$/,"") };
    if (/^[\d]+[.)]\s/.test(t)||/^[-•*]\s/.test(t)) return { type:"li", text:t };
    return { type:"p", text:t };
  });
}

export default function App() {
  const [inp, setInp] = useState("");
  const [topic, setTopic] = useState("");
  const [subj, setSubj] = useState("");
  const [name, setName] = useState("");
  const [cls, setCls] = useState("");
  const [ai, setAi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");

  const today = new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});

  const go = async () => {
    setErr("");
    if (ai) {
      if (!topic.trim()) { setErr("Topic zaroor likhein"); return; }
      setLoading(true);
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514", max_tokens:1000,
            messages:[{ role:"user", content:`Generate a well-structured school homework on: "${topic}"${subj?` (Subject: ${subj})`:""}.\nRules:\n- First line: MAIN TITLE IN ALL CAPS\n- Sections with headings ending in ':'\n- 4-6 educational sections\n- 4-5 questions at end\n- 350-500 words` }]
          })
        });
        const d = await r.json();
        setContent(d.content[0].text);
      } catch { setErr("Generation failed. Dobara try karein."); }
      setLoading(false);
    } else {
      if (!inp.trim()) { setErr("Text paste karein"); return; }
      setContent(inp);
    }
  };

  const secs = content ? parse(content) : [];
  let hi = 0;

  return (
    <div style={{fontFamily:"'Times New Roman',serif",background:"#eceff1",minHeight:"100vh",padding:20}}>
      <style>{`
        *{box-sizing:border-box}
        @media print{.nop{display:none!important}body{background:white}.a4p{box-shadow:none!important;margin:0!important;page-break-after:always}}
        @page{size:A4;margin:0}
        .inp{width:100%;padding:9px 12px;border:1px solid #cfd8dc;border-radius:6px;font-size:14px;outline:none;font-family:sans-serif;color:#222;background:#fafafa;transition:border .2s}
        .inp:focus{border-color:#1a237e;background:white}
        .ta{width:100%;padding:9px 12px;border:1px solid #cfd8dc;border-radius:6px;font-size:14px;outline:none;font-family:sans-serif;color:#222;background:#fafafa;min-height:130px;resize:vertical}
        .ta:focus{border-color:#1a237e;background:white}
        .btn{padding:11px 0;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;width:100%;letter-spacing:.3px}
        .btn:disabled{opacity:.6;cursor:not-allowed}
      `}</style>

      {/* Controls */}
      <div className="nop" style={{maxWidth:820,margin:"0 auto 28px"}}>
        <div style={{background:"white",borderRadius:14,padding:"24px 28px",boxShadow:"0 2px 16px rgba(0,0,0,.1)"}}>
          <div style={{textAlign:"center",marginBottom:22}}>
            <div style={{display:"inline-block",background:"#1a237e",color:"white",padding:"8px 28px",borderRadius:8,fontWeight:800,fontSize:22,letterSpacing:3,fontFamily:"sans-serif"}}>APEX LEARNING</div>
            <p style={{margin:"6px 0 0",color:"#666",fontSize:13,fontFamily:"sans-serif"}}>Homework Formatter — A4 PDF Generator</p>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            <input className="inp" placeholder="Student Name" value={name} onChange={e=>setName(e.target.value)}/>
            <input className="inp" placeholder="Class / Section" value={cls} onChange={e=>setCls(e.target.value)}/>
            <input className="inp" placeholder="Subject (optional)" value={subj} onChange={e=>setSubj(e.target.value)}/>
          </div>

          <div style={{background:"#e8eaf6",borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:14,fontFamily:"sans-serif"}}>
            <div onClick={()=>setAi(v=>!v)} style={{width:48,height:26,borderRadius:13,background:ai?"#1a237e":"#b0bec5",position:"relative",cursor:"pointer",transition:"background .3s",flexShrink:0}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"white",position:"absolute",top:3,left:ai?25:3,transition:"left .3s"}}/>
            </div>
            <div>
              <div style={{fontWeight:700,color:"#1a237e",fontSize:14}}>AI Mode {ai?"ON ✦":"OFF"}</div>
              <div style={{fontSize:12,color:"#555",marginTop:2}}>{ai?"AI topic se homework generate karega":"Apna text paste karo — auto format hoga"}</div>
            </div>
          </div>

          {ai
            ? <input className="inp" placeholder="Topic likhein (e.g. Water Cycle, Mughal Empire, Photosynthesis...)" value={topic} onChange={e=>setTopic(e.target.value)} style={{marginBottom:12}}/>
            : <textarea className="ta" placeholder={"Homework text yahan paste karein...\n\nTips:\n• ALL CAPS line → Heading banti hai\n• 'Section Name:' → Heading\n• ## se shuru karo → Heading"} value={inp} onChange={e=>setInp(e.target.value)} style={{marginBottom:12}}/>
          }

          {err && <p style={{color:"#c62828",fontFamily:"sans-serif",fontSize:13,margin:"0 0 10px"}}>{err}</p>}

          <div style={{display:"flex",gap:10}}>
            <button className="btn" onClick={go} disabled={loading} style={{background:"#1a237e",color:"white"}}>
              {loading?"⏳ Generating...":ai?"✦ AI se Generate Karo":"📄 Format Karo"}
            </button>
            {content && <button className="btn" onClick={()=>window.print()} style={{background:"#b71c1c",color:"white"}}>⬇ PDF Download</button>}
          </div>
        </div>
      </div>

      {/* A4 Page */}
      {content && (
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <p className="nop" style={{fontFamily:"sans-serif",fontSize:12,color:"#888",textAlign:"center",marginBottom:10}}>↓ Preview — Print / PDF ke liye upar button dabayein</p>
          <div className="a4p" style={{width:794,minHeight:1123,background:"white",border:"7px solid #1a237e",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 8px 40px rgba(0,0,0,.18)"}}>

            {/* Watermark */}
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%) rotate(-42deg)",fontSize:76,fontWeight:900,color:"rgba(26,35,126,0.055)",whiteSpace:"nowrap",pointerEvents:"none",zIndex:0,letterSpacing:10,userSelect:"none",fontFamily:"Georgia,serif"}}>Apex Learning</div>

            {/* Inner border */}
            <div style={{position:"absolute",inset:12,border:"1.5px solid #c5cae9",pointerEvents:"none",zIndex:1}}/>

            {/* Header Strip */}
            <div style={{background:"#1a237e",padding:"15px 32px",textAlign:"center",position:"relative",zIndex:2,flexShrink:0}}>
              <div style={{color:"white",fontWeight:900,fontSize:25,letterSpacing:5,fontFamily:"Georgia,serif"}}>APEX LEARNING</div>
              <div style={{color:"rgba(255,255,255,.72)",fontSize:11,letterSpacing:2,marginTop:3,fontFamily:"sans-serif"}}>EXCELLENCE IN EDUCATION</div>
            </div>

            {/* Meta */}
            <div style={{padding:"7px 30px",borderBottom:"1px solid #e8eaf6",display:"flex",justifyContent:"space-between",fontSize:11.5,color:"#444",fontFamily:"sans-serif",zIndex:2,flexShrink:0}}>
              <div>
                {name&&<span><b>Name:</b> {name}&emsp;</span>}
                {cls&&<span><b>Class:</b> {cls}&emsp;</span>}
                {subj&&<span><b>Subject:</b> {subj}</span>}
              </div>
              <div><b>Date:</b> {today}</div>
            </div>

            {/* Content */}
            <div style={{padding:"16px 38px 12px",flex:1,position:"relative",zIndex:2}}>
              {secs.map((s,i)=>{
                if(s.type==="space") return <div key={i} style={{height:10}}/>;
                if(s.type==="h"){
                  const c=HC[hi%HC.length]; hi++;
                  return <div key={i} style={{margin:"16px 0 7px",paddingLeft:10,borderLeft:`4px solid ${c}`}}>
                    <div style={{color:c,fontWeight:700,fontSize:14.5,letterSpacing:.5,textTransform:"uppercase",fontFamily:"Georgia,serif"}}>{s.text}</div>
                  </div>;
                }
                if(s.type==="li") return <p key={i} style={{margin:"4px 0 4px 20px",fontSize:13,lineHeight:1.78,color:"#2c2c2c"}}>{s.text}</p>;
                return <p key={i} style={{margin:"5px 0",fontSize:13,lineHeight:1.85,color:"#1a1a1a",textAlign:"justify"}}>{s.text}</p>;
              })}
            </div>

            {/* Footer */}
            <div style={{background:"#1a237e",padding:"10px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",color:"white",fontSize:11.5,fontFamily:"sans-serif",fontWeight:600,zIndex:2,flexShrink:0,letterSpacing:.3}}>
              <span>📍 Address: Baluaa Road, Bariyarpur</span>
              <span>📱 Mob.: 6306598593</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
