"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const STEPS = {
  WELCOME: "welcome",
  RESUME: "resume",
  RAMBLE: "ramble",
  PROFILE_COMPLETE: "profile_complete",
  GENERATE: "generate",
  PITCH_VOICE: "pitch_voice",
  LOADING: "loading",
  RESULT: "result",
};

const OUTPUT_TYPES = [
  { id: "cold_email", label: "Cold Email", icon: "✉️", desc: "Sharp, research-backed outreach that gets replies" },
  { id: "linkedin_dm", label: "LinkedIn DM", icon: "💬", desc: "A punchy hook + CTA in under 200 characters" },
  { id: "cover_letter", label: "Cover Letter", icon: "📄", desc: "Hyper-specific letter proving you did your homework" },
  { id: "interview_prep", label: "Interview Prep", icon: "🎯", desc: "Full research dossier with questions + talking points" },
  { id: "elevator_pitch", label: "Elevator Pitch", icon: "🎤", desc: "A memorable 30-second intro designed to be spoken" },
];

const TARGET_ROLES = [
  "CEO / Founder", "C-Suite (COO, CMO, CRO, CTO)", "VP / SVP", "Director",
  "Head of Department", "Hiring Manager", "HR / People Ops / Recruiter", "Other",
];

const c = {
  bg: "#FAFAF7", surface: "#FFFFFF", surfaceAlt: "#F3F3EE",
  border: "#E2E0DA", borderLight: "#EDECE8", text: "#1A1A18",
  textSecondary: "#5C5B56", textMuted: "#9C9A94",
  accent: "#2D5A45", accentLight: "#3A7359",
  accentGlow: "rgba(45,90,69,0.18)", accentSoft: "rgba(45,90,69,0.08)",
  accentSofter: "rgba(45,90,69,0.04)", dark: "#1A2E24", white: "#FFFFFF",
  success: "#2D8A55", successSoft: "rgba(45,138,85,0.1)",
};

const fonts = {
  display: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', 'Helvetica Neue', sans-serif",
};

function loadProfile() { try { const d = localStorage.getItem("pt_profile"); return d ? JSON.parse(d) : null; } catch { return null; } }
function saveProfileLS(p) { try { localStorage.setItem("pt_profile", JSON.stringify(p)); } catch {} }
function loadHistory() { try { const d = localStorage.getItem("pt_history"); return d ? JSON.parse(d) : []; } catch { return []; } }
function saveHistoryLS(h) { try { localStorage.setItem("pt_history", JSON.stringify(h)); } catch {} }

function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const finalRef = useRef("");
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported. Use Chrome, Safari, or Edge."); return; }
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = "en-US"; finalRef.current = "";
    r.onresult = (e) => { let interim = ""; for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) finalRef.current += e.results[i][0].transcript + " "; else interim += e.results[i][0].transcript; } setTranscript(finalRef.current + interim); };
    r.onerror = (e) => { if (e.error !== "no-speech") console.error("Speech error:", e.error); };
    r.onend = () => { if (recognitionRef.current) { try { r.start(); } catch {} } };
    recognitionRef.current = r; r.start(); setIsListening(true); setElapsed(0); setTranscript("");
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
  }, []);
  const stopListening = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); recognitionRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } setIsListening(false);
  }, []);
  useEffect(() => () => { if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); } if (timerRef.current) clearInterval(timerRef.current); }, []);
  return { isListening, transcript, setTranscript, elapsed, startListening, stopListening };
}

function MicButton({ isListening, onClick, size = 80, disabled = false }) {
  const [h, setH] = useState(false);
  return (<button onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
    width: size, height: size, borderRadius: "50%", border: "none",
    background: isListening ? `radial-gradient(circle, ${c.accent} 0%, ${c.dark} 100%)` : `radial-gradient(circle, ${c.accentLight} 0%, ${c.accent} 100%)`,
    boxShadow: isListening ? `0 0 0 8px ${c.accentGlow}, 0 0 40px ${c.accentGlow}` : h && !disabled ? `0 0 0 6px ${c.accentGlow}, 0 6px 30px rgba(0,0,0,0.12)` : `0 0 0 4px ${c.accentGlow}, 0 4px 24px rgba(0,0,0,0.08)`,
    cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", opacity: disabled ? 0.5 : 1,
    transform: h && !disabled && !isListening ? "scale(1.06)" : "scale(1)",
    animation: isListening ? "micPulse 2s ease-in-out infinite" : "none", flexShrink: 0,
  }}><svg width={size*0.38} height={size*0.38} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {isListening ? <rect x="6" y="6" width="12" height="12" rx="2" fill="white" stroke="none"/> : <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="white" stroke="none"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>}
  </svg></button>);
}

function TimerRing({ elapsed, minimum, size = 130 }) {
  const progress = Math.min(elapsed / minimum, 1); const circ = 2 * Math.PI * 54; const offset = circ * (1 - progress); const hit = elapsed >= minimum;
  return (<div style={{ position: "relative", width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="65" cy="65" r="54" fill="none" stroke={c.borderLight} strokeWidth="3"/>
      <circle cx="65" cy="65" r="54" fill="none" stroke={hit ? c.success : c.accent} strokeWidth="3" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}/>
    </svg>
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: fonts.body, fontSize: 32, fontWeight: 600, color: c.text }}>{elapsed}s</span>
      <span style={{ fontFamily: fonts.body, fontSize: 11, color: hit ? c.success : c.textMuted, marginTop: 2, fontWeight: 500 }}>{hit ? "Stop whenever" : `${minimum - elapsed}s minimum`}</span>
    </div>
  </div>);
}

function AnimatedPromptBase({ elapsed, prompts }) {
  const current = [...prompts].reverse().find(p => elapsed >= p.time);
  const [vis, setVis] = useState(true);
  const [text, setText] = useState(current?.text || "");
  const prev = useRef(current?.text);
  useEffect(() => { if (current?.text !== prev.current) { setVis(false); const t = setTimeout(() => { setText(current?.text || ""); setVis(true); prev.current = current?.text; }, 400); return () => clearTimeout(t); } }, [current?.text]);
  return (<div style={{ fontFamily: fonts.body, fontSize: 14, color: c.accent, fontWeight: 500, minHeight: 32, textAlign: "center", maxWidth: 380, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)", padding: "10px 20px", borderRadius: 100, background: c.accentSofter, border: "1px solid rgba(45,90,69,0.06)" }}>{text}</div>);
}

function AnimatedPrompt({ elapsed }) {
  return <AnimatedPromptBase elapsed={elapsed} prompts={[
    { time: 0, text: "Start by telling us what you do..." }, { time: 8, text: "What industries do you know best?" },
    { time: 16, text: "What's your superpower — what do clients love about you?" }, { time: 24, text: "What's your dream client or long-term goal?" },
    { time: 32, text: "Anything else? Stop whenever you're ready." },
  ]} />;
}

function AnimatedPitchPrompt({ elapsed }) {
  return <AnimatedPromptBase elapsed={elapsed} prompts={[
    { time: 0, text: "What service or skill are you offering them?" }, { time: 7, text: "Why this company? What caught your eye?" },
    { time: 14, text: "Any job posting, product launch, or gap you noticed?" }, { time: 21, text: "What result or outcome could you deliver?" },
    { time: 28, text: "Any mutual connections or common thread?" }, { time: 35, text: "Anything else? Stop whenever you're ready." },
  ]} />;
}

function StepIndicator({ current, total }) {
  return (<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ fontSize: 11, color: c.accent, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: fonts.body }}>Step {current} of {total}</span>
    <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>{Array.from({ length: total }, (_, i) => (<div key={i} style={{ width: i+1 <= current ? 20 : 8, height: 4, borderRadius: 2, background: i+1 <= current ? c.accent : c.border, transition: "all 0.3s ease" }}/>))}</div>
  </div>);
}

function LoadingDots() {
  return (<div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
    {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c.accent, animation: `loadDot 1.4s ease-in-out ${i*0.16}s infinite` }}/>)}
  </div>);
}

function Btn({ children, primary, disabled, onClick, style: sx = {} }) {
  const [h, setH] = useState(false);
  return (<button onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
    background: primary ? (disabled ? c.border : c.accent) : c.surfaceAlt, color: primary ? c.white : c.text,
    border: primary ? "none" : `1px solid ${c.border}`, padding: "14px 36px", borderRadius: 12, fontSize: 15, fontWeight: 600,
    fontFamily: fonts.body, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
    transform: h && !disabled ? "translateY(-2px)" : "translateY(0)",
    boxShadow: primary && !disabled ? `0 4px 20px ${c.accentGlow}` : "none",
    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", ...sx,
  }}>{children}</button>);
}

function ProfileButton({ name, onClick }) {
  const [h, setH] = useState(false);
  return (<button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
    position: "fixed", top: 20, right: 20, zIndex: 100, width: 42, height: 42, borderRadius: "50%",
    background: h ? c.accentLight : c.accent, border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: c.white, fontFamily: fonts.body, fontSize: 16, fontWeight: 700,
    boxShadow: `0 2px 12px ${c.accentGlow}`, transition: "all 0.2s ease", transform: h ? "scale(1.08)" : "scale(1)",
  }}>{name?.[0]?.toUpperCase() || "?"}</button>);
}

function ProfilePanel({ profile, history, onClose, onReupload, onAddVoice, onViewPitch }) {
  const [tab, setTab] = useState("overview");
  const addV = useVoiceInput();
  const [adding, setAdding] = useState(false);
  return (<div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}/>
    <div style={{ position: "relative", width: "100%", maxWidth: 440, height: "100%", background: c.bg, boxShadow: "-8px 0 40px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", animation: "slideIn 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden" }}>
      <div style={{ padding: "24px 24px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: c.text }}>Your Profile</h3>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: c.surfaceAlt, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: c.textMuted }}>×</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", color: c.white, fontFamily: fonts.body, fontSize: 20, fontWeight: 700 }}>{profile.name?.[0]?.toUpperCase() || "?"}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: c.text }}>{profile.name || "No name"}</div>
            <div style={{ fontSize: 13, color: c.textMuted }}>{profile.resumeFileName ? `📎 ${profile.resumeFileName}` : "No resume uploaded"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${c.border}` }}>
          {[{ id: "overview", label: "Overview" }, { id: "history", label: `Past Pitches (${history.length})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", padding: "10px 20px", fontSize: 14, fontWeight: tab === t.id ? 600 : 400, fontFamily: fonts.body, color: tab === t.id ? c.accent : c.textMuted, cursor: "pointer", borderBottom: tab === t.id ? `2px solid ${c.accent}` : "2px solid transparent", marginBottom: -1 }}>{t.label}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {tab === "overview" && (<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {profile.bullets?.length > 0 && (<div>
            <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fonts.body, marginBottom: 10, display: "block" }}>About You</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {profile.bullets.map((b, i) => (<div key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: c.text, lineHeight: 1.6, padding: "10px 14px", borderRadius: 12, background: c.surface, border: `1px solid ${c.borderLight}` }}><span style={{ color: c.accent, flexShrink: 0 }}>•</span>{b}</div>))}
            </div>
          </div>)}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fonts.body }}>Update Profile</label>
            <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, border: `1px solid ${c.border}`, background: c.surface, cursor: "pointer" }}>
              <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={onReupload} style={{ display: "none" }}/>
              <span style={{ fontSize: 20 }}>📎</span>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>Upload New Resume</div><div style={{ fontSize: 12, color: c.textMuted }}>Replace your current resume</div></div>
            </label>
            <button onClick={() => setAdding(!adding)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, border: `1px solid ${c.border}`, background: c.surface, cursor: "pointer", textAlign: "left", fontFamily: fonts.body }}>
              <span style={{ fontSize: 20 }}>🎙️</span>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>Add More About You</div><div style={{ fontSize: 12, color: c.textMuted }}>Record or type additional context</div></div>
            </button>
            {adding && (<div style={{ padding: 20, borderRadius: 14, border: `1px solid ${c.borderLight}`, background: c.surface, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, animation: "fadeUp 0.3s ease" }}>
              {!addV.isListening && !addV.transcript && <><MicButton isListening={false} onClick={() => addV.startListening()} size={56}/><span style={{ fontSize: 13, color: c.textSecondary }}>Tap to add more details</span></>}
              {addV.isListening && <><MicButton isListening={true} onClick={() => addV.stopListening()} size={56}/><span style={{ fontSize: 12, color: c.accent }}>Listening ({addV.elapsed}s)</span>{addV.transcript && <div style={{ fontSize: 13, color: c.text, lineHeight: 1.6, width: "100%", padding: 12, background: c.bg, borderRadius: 10 }}>{addV.transcript}<span style={{ animation: "blink 1s step-end infinite", color: c.accent }}>|</span></div>}</>}
              {!addV.isListening && addV.transcript && <><div style={{ fontSize: 13, color: c.text, lineHeight: 1.6, width: "100%", padding: 12, background: c.bg, borderRadius: 10 }}>{addV.transcript}</div><Btn primary onClick={() => { onAddVoice(addV.transcript); addV.setTranscript(""); setAdding(false); }} style={{ padding: "10px 24px", fontSize: 13 }}>Save to Profile</Btn></>}
            </div>)}
          </div>
        </div>)}
        {tab === "history" && (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {history.length === 0 ? <div style={{ textAlign: "center", padding: "40px 0", color: c.textMuted, fontSize: 14 }}>No pitches yet. Generate your first one!</div>
          : history.slice().reverse().map((item, i) => (
            <button key={i} onClick={() => onViewPitch(item)} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: 16, borderRadius: 14, border: `1px solid ${c.borderLight}`, background: c.surface, cursor: "pointer", textAlign: "left", fontFamily: fonts.body, width: "100%", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = c.borderLight; }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{OUTPUT_TYPES.find(t => t.id === item.type)?.icon || "📄"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{OUTPUT_TYPES.find(t => t.id === item.type)?.label || item.type}</div>
                <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{item.companyUrl?.replace(/https?:\/\//, "").replace(/\/$/, "") || "Unknown"}</div>
                <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.textMuted} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 4 }}><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          ))}
        </div>)}
      </div>
    </div>
  </div>);
}

const outputTypePrompts = {
  cold_email: `a cold outreach email. This is the highest-stakes output. It must feel like a real human wrote it after 60 seconds of actual research, not like AI or a template.\n\nTHE 2-SECOND SKIM TEST: When the recipient skims this in 2 seconds, they should think "wait, how'd they know that?" If this email could be sent to 100 other companies with the name swapped, REWRITE IT. Specificity is the entire game.\n\nSTRUCTURE:\n- Subject line: benefit-focused or curiosity-driven, references something specific to them. Never clickbait. Never generic. Lowercase is fine.\n- Body: 3-4 sentences MAX. Under 150 words total. Should read like a text to a friend who happens to need what the sender offers.\n- Sentence 1 (HOOK): A specific observation about THEIR company — something only someone who actually looked at their site/news/posts would notice. A recent launch, a hiring signal, a product detail, a gap, a quote from their founder. NEVER starts with "I". Starts with them.\n- Sentence 2 (INSIGHT): The hypothesis. What does this observation mean? Connect it to a real pain point they probably have. Talk about THEIR problem, not the sender's services.\n- Sentence 3 (PROOF): One sharp social-proof line. A specific result with a number, a comparable case in under 10 words, or a credibility signal. No vague claims like "proven track record".\n- Sentence 4 (CTA): ONE specific, low-friction ask. A real question they can answer yes/no in one line. NEVER "pick your brain", NEVER "hop on a quick call sometime", NEVER multiple options.\n\nTONE:\n- Confident peer offering value. Not a salesperson. Not a job seeker. Not a fan.\n- Sounds like a human who happens to be useful, not someone running a sequence.\n- Ugly and short beats polished and long. Every sentence earns its place.\n- Direct. No hedging. No "just" or "maybe" or "I was wondering if".\n\nHARD BANS — these instantly make it read as AI/spam/template:\n- "I hope this finds you well" / "Hope you're doing well" / any wellness greeting\n- "I came across", "I noticed", "I'd love to", "just wanted to", "reaching out because", "I was wondering"\n- "pick your brain", "hop on a quick call", "grab 15 minutes", "jump on a call"\n- Em-dashes (—). Use periods or commas. NEVER em-dashes.\n- More than one CTA. More than one link. Avoid links entirely if possible.\n- Pricing. Attachments. Walls of text. Long dense paragraphs.\n- Hype words: "game-changing", "revolutionary", "10x", "unlock", "supercharge", "leverage", "synergy"\n- Making it about the sender. Every sentence should serve the recipient.\n- Signature blocks. End on the CTA. No "Best,", no "Thanks,", no name.\n- Anything that pattern-matches to "AI wrote this".`,
  linkedin_dm: `a LinkedIn direct message. Same philosophy as cold email but stricter: shorter, more casual, mobile-first. The 2-second skim test applies even harder here.\n\nSTRUCTURE:\n- Under 300 characters total. Two short sentences, max three.\n- Sentence 1 (HOOK): Reference something specific to THEM — a recent post they wrote, a role change, company news, a mutual connection, something on their profile. Must pass "wait, how'd they know that?"\n- Sentence 2 (ASK): One clear, low-friction question. Conversational, not transactional. Goal is to start a conversation, not close a deal.\n\nTONE:\n- Reads like a text to a friend, not a sales DM\n- Casual. Lowercase is fine. Contractions encouraged.\n- Sounds like a human typing on their phone, not an AI generating outreach\n\nHARD BANS:\n- Greetings ("Hi [name]!", "Hello", "Hope you're well")\n- Pitching services or products of any kind\n- "I'd love to connect", "I'd love to chat", "I'd love to learn more about"\n- "pick your brain", "quick call", "15 minutes of your time", "hop on a call"\n- Links, attachments, calendar links\n- Em-dashes (—). NEVER.\n- Multiple questions. ONE ask only.\n- Sign-offs ("Best", "Thanks", "Cheers", name)\n- Hype words and corporate language\n- Anything that sounds remotely like a template or AI`,
  cover_letter: `a cover letter. The point of a cover letter is NOT to repeat the resume. The resume lists what someone has done. The cover letter explains WHY IT MATTERS and WHO THEY ARE. The best cover letters are MEMORABLE, not just qualified-sounding.\n\nTHE TEST: After reading this, the hiring manager should feel like they know something about this person they couldn't have learned from the resume. If every line could be lifted from the resume, REWRITE IT. If it sounds like every other cover letter, REWRITE IT.\n\nCORE PRINCIPLES:\n- Make it about THEIR problem, not the candidate's past. The resume is evidence. The cover letter is meaning, context, and intent.\n- Show personality. A real human voice. Not corporate. Not "professional-speak." Real.\n- Translate experience into FUTURE impact, not past credentials.\n- Do the research. Reference something specific about this company that proves the writer actually looked — recent moves, leadership POV, product priorities, a quote.\n- Confidence without desperation. Never beg, never grovel, never thank them for "considering" the application.\n- Stop the market from filling in the blanks with bias. Position deliberately.\n\nSTRUCTURE — 3 tight paragraphs, one page max:\n\nP1 (THE HOOK): Open with energy and specificity. NEVER "I'm writing to apply for..." or "I'm excited to apply for...". Lead with why this role + why this person + why now. Reference something hyper-specific about the company in the first 2 sentences. The reader should feel pulled in, not bored.\n\nP2 (THE BRIDGE): Connect 2-3 specific things the company actually needs to specific things this person has done. Use real numbers and proof. But frame it as "here's how I'd solve your problem," not "here's what I did at my last job." Translate past experience into future impact they'd get from hiring this person.\n\nP3 (THE WHY): The part the resume CAN'T show. Personal motivation, a brief story, a perspective, an opinion, a glimpse of who this person actually is. NOT a summary. NOT a thank-you. Something memorable enough that the hiring manager remembers this person tomorrow. End on forward momentum — what the writer wants to build or do, not gratitude for being considered.\n\nTONE:\n- Sounds like a real human wrote it. Personality on the page.\n- Confident peer, not eager applicant.\n- Specific over general. Always.\n- Tight. Clear thinking beats more words.\n\nHARD BANS — these instantly make it forgettable corporate filler:\n- "I'm writing to apply for", "I'm excited to apply", "I'm thrilled to submit", "I'd like to express my interest"\n- "I believe I'd be a great fit", "I'm confident I can", "I would be a valuable addition"\n- "I'm passionate about", "I have a passion for", "I have always been drawn to"\n- "results-driven", "detail-oriented", "self-starter", "team player", "proven track record", "highly motivated"\n- "experienced professional", "strong communicator", "results-driven leader", "dynamic"\n- "Please find my resume attached" / any meta-reference to the application materials\n- "Thank you for your consideration" / "I appreciate your time" / any begging close\n- Repeating bullet points from the resume verbatim\n- Em-dashes (—). NEVER. Use periods or commas.\n- Generic enthusiasm ("I would love the opportunity to...")\n- Anything that sounds like a template or AI-generated filler`,
  interview_prep: `an internal interview preparation cheat sheet FOR THE CANDIDATE THEMSELVES. This is NOT a doc they share. It is a quick-reference cheat sheet they will scan right before an interview to feel sharp, prepared, and ready to tell their story.\n\nCORE PHILOSOPHY:\n- The resume got them the call. Its job is done. The interview is where the PERSON behind the resume shows up.\n- The best candidates are not the ones with memorized resumes. They are the ones who can talk about their work like they actually lived it: with specifics, with honesty, with a point of view.\n- Do not help them memorize facts. Help them be ready to TELL STORIES that connect their past to the company's future.\n- Average candidates talk about what they have done. Great candidates connect the dots between their experience and the employer's specific problems.\n- Surface-level prep is useless. Every line of this cheat sheet must reference the candidate's actual background AND this specific company's actual situation.\n\nFORMAT — clean section headers, scannable, zero filler:\n\n═══ THE COMPANY IN 60 SECONDS ═══\n4-5 punchy facts: what they do, who they serve, a recent move or priority, key context. Just enough to sound informed in the first 30 seconds of conversation. NOT a wall of text.\n\n═══ THE REAL PROBLEM THEY'RE HIRING FOR ═══\n1-2 sentences naming the actual pain point behind the job description. Not the bullet points. The WHY. What is broken or unbuilt that this hire is supposed to fix? This is the most important section of the cheat sheet.\n\n═══ YOUR THREE STORIES ═══\nThree specific stories from the candidate's background that map directly to the company's needs. These are the stories to be ready to drop into ANY question. They are the spine of the interview. Each story formatted as:\n- THE SITUATION: (1 line, specific)\n- WHAT YOU DECIDED: (1 line — the call you made, the trade-off, the bet)\n- WHAT HAPPENED: (1 line — outcome with a number if possible)\n- WHY IT LANDS HERE: (1 line — explicit bridge to this company's specific situation)\n\n═══ LIKELY QUESTIONS + YOUR ANGLE ═══\n6-7 questions tailored to this specific role and company (not generic). Each with:\n- Q: [the question]\n- ANGLE: [a 1-line hook, not a script. The story to reach for or the point to land. Reference one of the three stories above when it fits.]\n\n═══ QUESTIONS TO ASK THEM ═══\n5 smart, researched questions that prove the candidate did the work. NO generic questions. Each question must reference something specific about this company, this role, or this team and demonstrate strategic thinking. One per line.\n\n═══ BRIDGE PHRASES ═══\n3-4 short phrases the candidate can drop verbatim to connect their experience to the employer's exact language from the job description or company materials. Format: "You mentioned [specific thing from JD or company] — here's how I [specific thing the candidate did]..."\n\n═══ DON'T FORGET ═══\n2-3 final tactical reminders. A recent company priority to reference, a value to weave in, an interviewer fact if known, or something the candidate tends to underplay that they should lean into in this specific room.\n\nTONE:\n- Direct and tactical. This is a cheat sheet, not an essay.\n- Use "you" — speaking directly to the candidate.\n- Confident and sharp, not coddling.\n- No filler. Every line earns its place.\n\nHARD BANS:\n- Generic interview advice ("dress professionally", "make eye contact", "arrive early", "research the company")\n- Generic questions to ask ("what's the team culture like?", "what does success look like in this role?", "what's a typical day?")\n- Walls of text. Long paragraphs. Anything that can't be scanned in 90 seconds.\n- Anything the candidate already knows from a basic Google search\n- Em-dashes (—). Use periods, commas, or colons.\n- "Tell me about yourself" without a tailored angle that uses this candidate's actual background\n- Hypothetical stories. Every story must come from the candidate's actual resume or voice context.\n- Surface-level prep that could apply to any candidate at any company`,
  elevator_pitch: `a 30-second elevator pitch designed to be SPOKEN aloud, not read. The ONLY job of an elevator pitch is to create CURIOSITY — to make the listener say "tell me more." If it tells the whole story, it has failed. Leave room for follow-up questions.\n\nTHE TEST: Read it aloud. If it sounds fake, scripted, or like a LinkedIn headline, REWRITE IT. It should sound exactly like how this person would actually talk to a smart friend in line at a coffee shop.\n\nCORE PRINCIPLES:\n- Create curiosity, not completeness. Leave room for "how?" and "why?" — don't answer them yet.\n- Specificity is the entire game. "I help small e-commerce brands cut customer support response times by 90%" destroys "I'm a customer success leader."\n- Lead with OUTCOMES, not titles. What changes in the world because of this person? Never lead with a job title or years of experience.\n- Hint at a before/after. Even one phrase of transformation makes a pitch land harder than ten facts.\n- Sound like a human in conversation, not a press release.\n\nSTRUCTURE — 3-4 sentences max, designed for breath and rhythm when spoken:\n\nS1 (THE HEADLINE): What this person actually does, framed as an outcome the listener would care about. NEVER lead with a title. NEVER lead with "I'm a [X] with [Y] years of experience." Lead with the result they create.\n\nS2 (THE PROOF): One sharp, specific proof point. A real number, a real outcome, a real story in under 15 words. Should make the listener pause. "I cut X by Y%" or "I built X that did Y." Concrete, not vague.\n\nS3 (THE INTRIGUE): Either a transformation hint ("before us, X. now, Y") OR something unexpected that makes them want to ask a follow-up. This is where curiosity lives. Hint, don't explain.\n\nS4 (THE BRIDGE — optional): A natural conversational handoff. NOT a hard ask. A line that invites the other person in. Something like "right now I'm looking at [specific kind of] roles, which is actually why I'm here."\n\nTONE:\n- Spoken, not written. Contractions. Natural rhythm. Read it aloud in your head as you write.\n- Confident, not bragging. Specific, not abstract.\n- Sounds like talking to a smart friend, not delivering a TED talk.\n- Short sentences. Breath room between them.\n\nHARD BANS — these instantly turn it into buzzword soup:\n- Lazy comparisons ("the Uber for X", "the Airbnb for Y", "the [famous brand] of [thing]")\n- Jargon: "leverage", "synergy", "innovative", "cutting-edge", "best-in-class", "scalable", "robust", "world-class", "holistic"\n- Buzzword soup: "AI-powered", "data-driven", "results-driven", "passion-led", "multi-stakeholder", "purpose-driven", "mission-driven"\n- Vague titles: "thought leader", "change agent", "transformation expert", "strategic partner", "trusted advisor"\n- Generic outcomes: "drive growth", "deliver value", "make an impact", "move the needle", "create change"\n- "I'm passionate about", "I have a passion for", "I'm driven by", "I love helping"\n- "Years of experience" framing. Show the impact, not the tenure.\n- Em-dashes (—). NEVER. This is being spoken aloud. Use commas and periods.\n- Listing features, skills, or credentials instead of outcomes\n- Anything that reads like a LinkedIn About section or a corporate bio\n- Anything that answers every possible question instead of leaving curiosity open`,
};

export default function PitchTool() {
  const [step, setStep] = useState(STEPS.WELCOME);
  const [profile, setProfile] = useState({ name: "", resumeText: "", rambleText: "", resumeFileName: "", bullets: [] });
  const [companyUrl, setCompanyUrl] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("cold_email");
  const [voiceContext, setVoiceContext] = useState("");
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState("");
  const [history, setHistory] = useState([]);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [buildingProfile, setBuildingProfile] = useState(false);
  const voice = useVoiceInput();
  const briefVoice = useVoiceInput();

  useEffect(() => {
    const saved = loadProfile();
    if (saved && saved.name) { setProfile(saved); setStep(STEPS.GENERATE); }
    setHistory(loadHistory());
    setProfileLoaded(true);
  }, []);

  useEffect(() => { if (profileLoaded && profile.name) saveProfileLS(profile); }, [profile, profileLoaded]);

  const loadingMessages = ["Pulling up the company profile...", "Reading between the lines of their website...", "Cross-referencing with your background...", "Crafting something worth sending..."];
  useEffect(() => { if (step !== STEPS.LOADING) return; let i = 0; setLoadingText(loadingMessages[0]); const iv = setInterval(() => { i = (i+1) % loadingMessages.length; setLoadingText(loadingMessages[i]); }, 2800); return () => clearInterval(iv); }, [step]);

  const buildProfileSummary = async (resumeText, rambleText) => {
    setBuildingProfile(true);
    try {
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: "Extract structured data. Return ONLY valid JSON, no markdown, no backticks.",
          messages: [{ role: "user", content: `From resume and description, extract:\n1. First name\n2. 4-5 bullet points (under 15 words each) on key strengths and goals\n\nResume: ${resumeText || "Not provided"}\nDescription: ${rambleText || "Not provided"}\n\nReturn ONLY: {"name":"FirstName","bullets":["b1","b2","b3","b4"]}` }] }) });
      const d = await r.json();
      const t = d.content?.map(b => b.text || "").join("") || "";
      return JSON.parse(t.replace(/```json|```/g, "").trim());
    } catch (e) { console.error("Profile error:", e); return { name: "", bullets: ["Profile summary could not be generated"] }; }
    finally { setBuildingProfile(false); }
  };

  const generateOutput = async () => {
    setStep(STEPS.LOADING);
    try {
      let companyData = `Company website: ${companyUrl}`;
      try { const sr = await fetch("/api/scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: companyUrl }) }); const sd = await sr.json(); if (sd.text) companyData = sd.text; } catch {}
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: "You are an elite career strategist and copywriter. Surgical precision. No filler, no cliches. Deep company knowledge. Confident, sharp, human tone. Follow formatting EXACTLY.",
          messages: [{ role: "user", content: `Generate ${outputTypePrompts[selectedOutput]}\n\nABOUT THE PERSON (resume):\n${profile.resumeText || "Not provided"}\n\nABOUT THE PERSON (their words):\n${profile.rambleText || "Not provided"}\n\nTARGET COMPANY:\n${companyData}\n\nTARGET ROLE: ${targetRole || "Decision maker"}\n\nADDITIONAL CONTEXT:\n${voiceContext || "None"}\n\nWrite ONLY the deliverable. No preamble.` }] }) });
      const d = await r.json();
      const text = d.error ? d.error : (d.content?.map(b => b.text || "").join("\n") || "Error. Try again.");
      setResult(text);
      const entry = { id: Date.now(), type: selectedOutput, companyUrl, targetRole, voiceContext, result: text, date: new Date().toISOString() };
      const nh = [...history, entry]; setHistory(nh); saveHistoryLS(nh);
      setStep(STEPS.RESULT);
    } catch (e) { console.error(e); setResult("Something went wrong."); setStep(STEPS.RESULT); }
  };

  const processResumeFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    const cleaned = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
    setProfile(p => ({ ...p, resumeText: cleaned.length > 50 ? cleaned : `[${file.name} uploaded]`, resumeFileName: file.name }));
  };
  const handleResumeUpload = (e) => processResumeFile(e.target.files?.[0]);
  const handleResumeDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); processResumeFile(e.dataTransfer.files?.[0]); };

  const handleProfileReupload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const cleaned = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
    const np = { ...profile, resumeText: cleaned.length > 50 ? cleaned : `[${file.name} uploaded]`, resumeFileName: file.name };
    const s = await buildProfileSummary(np.resumeText, np.rambleText);
    np.bullets = s.bullets || profile.bullets; if (s.name) np.name = s.name;
    setProfile(np);
  };

  const handleAddVoice = (newText) => {
    const u = { ...profile, rambleText: profile.rambleText + " " + newText }; setProfile(u);
    buildProfileSummary(u.resumeText, u.rambleText).then(s => setProfile(p => ({ ...p, bullets: s.bullets || p.bullets })));
  };

  const handleViewPitch = (item) => {
    setResult(item.result); setSelectedOutput(item.type); setCompanyUrl(item.companyUrl || "");
    setTargetRole(item.targetRole || ""); setVoiceContext(item.voiceContext || "");
    setShowProfile(false); setStep(STEPS.RESULT);
  };

  const completeProfile = async () => {
    setStep(STEPS.PROFILE_COMPLETE);
    // Try API first for name + bullets
    const s = await buildProfileSummary(profile.resumeText, profile.rambleText);
    // Fallback name extraction: prefer manualName, then API, then parse from text
    let name = manualName || s.name || "";
    if (!name && profile.resumeText) {
      const match = profile.resumeText.match(/^([A-Z][a-z]+)/);
      if (match) name = match[1];
    }
    if (!name && profile.rambleText) {
      const words = profile.rambleText.split(/\s+/);
      const cap = words.find(w => /^[A-Z][a-z]{1,15}$/.test(w));
      if (cap) name = cap;
    }
    setProfile(p => ({ ...p, name: (name || "Friend").split(" ")[0], bullets: s.bullets?.length > 1 ? s.bullets : [] }));
  };

  const downloadPDF = () => {
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>Interview Prep</title><style>body{font-family:'Helvetica Neue',sans-serif;max-width:680px;margin:40px auto;padding:24px;color:#1a1a1a;line-height:1.8;font-size:14px}h1{font-size:22px;color:#2D5A45}pre{white-space:pre-wrap;font-family:inherit}.meta{color:#9c9a94;font-size:13px;margin-bottom:20px}</style></head><body><h1>Interview Prep Guide</h1><div class="meta">${companyUrl} · ${new Date().toLocaleDateString()}</div><pre>${result}</pre></body></html>`);
    w.document.close(); w.print();
  };

  if (!profileLoaded) return null;
  const hasProfile = profile.name?.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: fonts.body, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px" }}>
      <style>{`
        @keyframes micPulse{0%,100%{box-shadow:0 0 0 8px ${c.accentGlow},0 0 40px ${c.accentGlow}}50%{box-shadow:0 0 0 20px ${c.accentGlow},0 0 60px ${c.accentGlow}}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes blink{50%{opacity:0}}
        @keyframes loadDot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:${c.accentSoft};color:${c.accent}}
        textarea:focus,input:focus,select:focus{outline:none;border-color:${c.accent}!important;box-shadow:0 0 0 3px ${c.accentSoft}}
        .output-card{cursor:pointer;transition:all 0.2s cubic-bezier(0.4,0,0.2,1)}
        .output-card:hover{border-color:${c.accent}!important;box-shadow:0 2px 16px ${c.accentGlow};transform:translateY(-1px)}
        input::placeholder,textarea::placeholder{color:${c.textMuted}}
      `}</style>

      {hasProfile && step !== STEPS.WELCOME && <ProfileButton name={profile.name} onClick={() => setShowProfile(true)}/>}
      {showProfile && <ProfilePanel profile={profile} history={history} onClose={() => setShowProfile(false)} onReupload={handleProfileReupload} onAddVoice={handleAddVoice} onViewPitch={handleViewPitch}/>}

      {step === STEPS.WELCOME && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 32, animation: "fadeUp 0.7s cubic-bezier(0.4,0,0.2,1)", maxWidth: 560, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${c.accentSoft}, ${c.accentSofter})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, border: "1px solid rgba(45,90,69,0.08)" }}>🎙️</div>
          <div>
            <h1 style={{ fontFamily: fonts.display, fontSize: 50, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: c.text }}>
              Speak your way<br/>to the <span style={{ color: c.accent, fontStyle: "italic" }}>perfect pitch</span>
            </h1>
            <p style={{ fontSize: 17, color: c.textSecondary, lineHeight: 1.7, maxWidth: 440, margin: "20px auto 0" }}>Upload your resume, talk about yourself, and we&apos;ll craft cold emails, LinkedIn DMs, cover letters, interview prep, and elevator pitches — ready to send.</p>
          </div>
          <Btn primary onClick={() => setStep(STEPS.RESUME)} style={{ padding: "18px 56px", fontSize: 16, borderRadius: 14 }}>Get Started</Btn>
          <span style={{ fontSize: 13, color: c.textMuted }}>Takes about 2 minutes to set up</span>
        </div>
      )}

      {step === STEPS.RESUME && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 28, animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1)", maxWidth: 520, width: "100%", paddingTop: 40, paddingBottom: 40 }}>
          <div style={{ textAlign: "center" }}>
            <StepIndicator current={1} total={2}/>
            <h2 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 700, marginTop: 12, letterSpacing: "-0.02em" }}>Upload your resume</h2>
            <p style={{ fontSize: 15, color: c.textSecondary, marginTop: 10, lineHeight: 1.65 }}>We&apos;ll read it behind the scenes to personalize every output.</p>
          </div>

          {!showManualForm && (
            <>
              <label onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragEnter={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={e => { e.preventDefault(); setDragOver(false); }} onDrop={handleResumeDrop}
                style={{ width: "100%", padding: "56px 24px", borderRadius: 20, border: `2px dashed ${profile.resumeFileName ? c.accent : dragOver ? c.accentLight : c.border}`, background: profile.resumeFileName ? c.accentSofter : dragOver ? c.accentSofter : c.surface, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, cursor: "pointer", transition: "all 0.3s" }}>
                <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleResumeUpload} style={{ display: "none" }}/>
                {profile.resumeFileName ? <><div style={{ width: 56, height: 56, borderRadius: "50%", background: c.successSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={c.success} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div><span style={{ fontSize: 16, fontWeight: 600, color: c.text }}>{profile.resumeFileName}</span><span style={{ fontSize: 13, color: c.textMuted }}>Tap to replace</span></>
                : <><div style={{ fontSize: 40 }}>📎</div><span style={{ fontSize: 16, fontWeight: 500, color: c.text }}>Drop your resume here or click to browse</span><span style={{ fontSize: 13, color: c.textMuted }}>PDF or TXT</span></>}
              </label>
              <button onClick={() => setShowManualForm(true)} style={{ background: "none", border: "none", color: c.textMuted, fontSize: 13, cursor: "pointer", fontFamily: fonts.body, textDecoration: "underline", textUnderlineOffset: 3 }}>Type it out instead</button>
              <Btn primary onClick={() => setStep(STEPS.RAMBLE)} disabled={!profile.resumeFileName}>Continue</Btn>
            </>
          )}

          {showManualForm && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18, animation: "fadeUp 0.4s ease" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fonts.body }}>Your Name *</label>
                <input type="text" value={manualName} onChange={e => setManualName(e.target.value)} placeholder="First and last name"
                  style={{ width: "100%", marginTop: 8, padding: "14px 18px", borderRadius: 14, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 15 }}/>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fonts.body }}>Education</label>
                <input type="text" value={profile.education || ""} onChange={e => setProfile(p => ({ ...p, education: e.target.value }))} placeholder="e.g. USC Marshall School of Business, BS '22"
                  style={{ width: "100%", marginTop: 8, padding: "14px 18px", borderRadius: 14, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 15 }}/>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fonts.body }}>Experience</label>
                <textarea value={profile.experience || ""} onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))} placeholder="Briefly list your roles, companies, and what you did — one per line is fine"
                  style={{ width: "100%", marginTop: 8, padding: "14px 18px", borderRadius: 14, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 14, resize: "vertical", minHeight: 100, lineHeight: 1.7 }}/>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fonts.body }}>Key Skills</label>
                <input type="text" value={profile.skills || ""} onChange={e => setProfile(p => ({ ...p, skills: e.target.value }))} placeholder="e.g. marketing strategy, operations, financial modeling, AI tools"
                  style={{ width: "100%", marginTop: 8, padding: "14px 18px", borderRadius: 14, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 15 }}/>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowManualForm(false)} style={{ background: "none", border: "none", color: c.textMuted, fontSize: 13, cursor: "pointer", fontFamily: fonts.body, textDecoration: "underline", textUnderlineOffset: 3 }}>← Upload resume instead</button>
              </div>

              <Btn primary disabled={!manualName.trim()} onClick={() => {
                const resumeText = `Name: ${manualName}\n${profile.education ? `Education: ${profile.education}\n` : ""}${profile.experience ? `Experience: ${profile.experience}\n` : ""}${profile.skills ? `Skills: ${profile.skills}` : ""}`;
                setProfile(p => ({ ...p, resumeText: resumeText.trim(), resumeFileName: "" }));
                setStep(STEPS.RAMBLE);
              }}>Continue</Btn>
            </div>
          )}
        </div>
      )}

      {step === STEPS.RAMBLE && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 22, animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1)", maxWidth: 540, width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <StepIndicator current={2} total={2}/>
            <h2 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 700, marginTop: 12, letterSpacing: "-0.02em" }}>Now tell us about you</h2>
            <p style={{ fontSize: 15, color: c.textSecondary, marginTop: 10, lineHeight: 1.65, maxWidth: 420, margin: "10px auto 0" }}>
              Hit the mic and talk for at least 30 seconds. We&apos;ll prompt you along the way.
            </p>
          </div>
          {voice.isListening && <TimerRing elapsed={voice.elapsed} minimum={30}/>}
          {!voice.isListening && !voice.transcript && <div style={{ height: 16 }}/>}
          <MicButton isListening={voice.isListening} onClick={() => { if (voice.isListening) { voice.stopListening(); setProfile(p => ({ ...p, rambleText: voice.transcript })); } else voice.startListening(); }} size={voice.isListening ? 72 : 92} disabled={voice.isListening && voice.elapsed < 30}/>
          {voice.isListening && voice.elapsed < 30 && <span style={{ fontSize: 12, color: c.textMuted, animation: "fadeIn 0.3s ease" }}>Talk for {30-voice.elapsed} more seconds</span>}
          {voice.isListening && <AnimatedPrompt elapsed={voice.elapsed}/>}
          {voice.isListening && voice.transcript && <div style={{ width: "100%", padding: 18, borderRadius: 16, background: c.surface, border: `1px solid ${c.borderLight}`, fontSize: 14, color: c.textSecondary, lineHeight: 1.7, maxHeight: 150, overflow: "auto", animation: "fadeUp 0.3s ease" }}>{voice.transcript}<span style={{ animation: "blink 1s step-end infinite", color: c.accent }}>|</span></div>}
          {!voice.isListening && voice.transcript && (
            <div style={{ width: "100%", animation: "fadeUp 0.4s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: c.textMuted, fontWeight: 500 }}>Your transcript — feel free to edit</label>
                <button onClick={() => { voice.setTranscript(""); voice.startListening(); }} style={{ background: "none", border: "none", fontSize: 12, color: c.accent, cursor: "pointer", fontWeight: 600, fontFamily: fonts.body }}>↺ Re-record</button>
              </div>
              <textarea value={voice.transcript} onChange={e => { voice.setTranscript(e.target.value); setProfile(p => ({ ...p, rambleText: e.target.value })); }}
                style={{ width: "100%", padding: 18, borderRadius: 16, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 14, resize: "vertical", minHeight: 120, lineHeight: 1.7 }}/>
            </div>
          )}
          {!voice.isListening && !voice.transcript && <button onClick={() => setShowTypeInput(true)} style={{ background: "none", border: "none", color: c.textMuted, fontSize: 13, cursor: "pointer", fontFamily: fonts.body, textDecoration: "underline", textUnderlineOffset: 3 }}>Type instead</button>}
          {showTypeInput && !voice.isListening && !voice.transcript && (
            <textarea value={profile.rambleText} onChange={e => setProfile(p => ({ ...p, rambleText: e.target.value }))}
              placeholder="Tell us about yourself — your skills, goals, what makes you different, where you want to go..."
              style={{ width: "100%", padding: 18, borderRadius: 16, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 14, resize: "vertical", minHeight: 140, lineHeight: 1.7, animation: "fadeUp 0.3s ease" }}/>
          )}
          <Btn primary onClick={completeProfile} disabled={!profile.rambleText || profile.rambleText.length < 30} style={{ marginTop: 4 }}>Complete Profile →</Btn>
        </div>
      )}

      {step === STEPS.PROFILE_COMPLETE && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 28, animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1)", maxWidth: 520, width: "100%" }}>
          {buildingProfile ? <><LoadingDots/><p style={{ fontSize: 16, color: c.textSecondary, marginTop: 12 }}>Building your profile...</p></> : <>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", color: c.white, fontFamily: fonts.display, fontSize: 32, fontWeight: 700, animation: "scaleIn 0.4s cubic-bezier(0.4,0,0.2,1)" }}>{profile.name?.[0]?.toUpperCase() || "?"}</div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>Welcome, {profile.name || "there"}!</h2>
              <p style={{ fontSize: 15, color: c.textSecondary, marginTop: 8 }}>Here&apos;s your profile summary. You can update it anytime.</p>
            </div>
            {profile.resumeFileName && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 12, background: c.successSoft, width: "100%" }}>
              <span style={{ fontSize: 18 }}>📎</span><span style={{ fontSize: 14, fontWeight: 500, color: c.text }}>{profile.resumeFileName}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.success} strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: "auto" }}><polyline points="20 6 9 17 4 12"/></svg>
            </div>}
            {profile.bullets?.length > 0 && <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              {profile.bullets.map((b, i) => <div key={i} style={{ display: "flex", gap: 10, fontSize: 15, color: c.text, lineHeight: 1.6, padding: "12px 16px", borderRadius: 14, background: c.surface, border: `1px solid ${c.borderLight}`, animation: `fadeUp ${0.4+i*0.1}s cubic-bezier(0.4,0,0.2,1)` }}><span style={{ color: c.accent, flexShrink: 0, fontWeight: 700 }}>•</span>{b}</div>)}
            </div>}
            <Btn primary onClick={() => setStep(STEPS.GENERATE)} style={{ padding: "18px 56px", fontSize: 16, borderRadius: 14, marginTop: 4 }}>Start Pitching →</Btn>
          </>}
        </div>
      )}

      {step === STEPS.GENERATE && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 52, paddingBottom: 64, gap: 30, animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1)", maxWidth: 600, width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>{profile.name ? `Hey ${profile.name}, who` : "Who"} are you pitching?</h2>
            <p style={{ fontSize: 15, color: c.textSecondary, marginTop: 8 }}>Tell us the company, who you&apos;re targeting, and what you need.</p>
          </div>
          <div style={{ width: "100%" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fonts.body }}>Company Website</label>
            <input type="url" value={companyUrl} onChange={e => setCompanyUrl(e.target.value)} placeholder="https://example.com" style={{ width: "100%", marginTop: 8, padding: "15px 18px", borderRadius: 14, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 15 }}/>
          </div>
          <div style={{ width: "100%" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fonts.body }}>Who Are You Targeting?</label>
            <select value={targetRole} onChange={e => setTargetRole(e.target.value)} style={{ width: "100%", marginTop: 8, padding: "15px 18px", borderRadius: 14, border: `1px solid ${c.border}`, background: c.surface, color: targetRole ? c.text : c.textMuted, fontFamily: fonts.body, fontSize: 15, appearance: "none", cursor: "pointer", backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239C9A94' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 18px center" }}>
              <option value="">Select a role...</option>
              {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ width: "100%" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, display: "block", fontFamily: fonts.body }}>What Do You Need?</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {OUTPUT_TYPES.map(type => (
                <div key={type.id} className="output-card" onClick={() => setSelectedOutput(type.id)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 16, border: `1.5px solid ${selectedOutput === type.id ? c.accent : c.borderLight}`, background: selectedOutput === type.id ? c.accentSoft : c.surface }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{type.icon}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{type.label}</div><div style={{ fontSize: 12, color: c.textMuted, marginTop: 3 }}>{type.desc}</div></div>
                  {selectedOutput === type.id && <div style={{ width: 24, height: 24, borderRadius: "50%", background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
                </div>
              ))}
            </div>
          </div>
          <Btn primary onClick={() => { setShowTypeInput(false); setVoiceContext(""); briefVoice.setTranscript(""); setStep(STEPS.PITCH_VOICE); }} disabled={!companyUrl || !targetRole} style={{ width: "100%", padding: "18px 24px", borderRadius: 14, fontSize: 16 }}>Continue</Btn>
        </div>
      )}

      {step === STEPS.PITCH_VOICE && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 22, animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1)", maxWidth: 540, width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 700, marginTop: 12, letterSpacing: "-0.02em" }}>Tell us about this pitch</h2>
            <p style={{ fontSize: 15, color: c.textSecondary, marginTop: 10, lineHeight: 1.65, maxWidth: 420, margin: "10px auto 0" }}>Hit the mic and describe what you&apos;re offering and why. We&apos;ll prompt you as you go.</p>
          </div>
          {briefVoice.isListening && <TimerRing elapsed={briefVoice.elapsed} minimum={15}/>}
          {!briefVoice.isListening && !briefVoice.transcript && !voiceContext && <div style={{ height: 16 }}/>}
          {!briefVoice.isListening && !briefVoice.transcript && !voiceContext && !showTypeInput && <>
            <MicButton isListening={false} onClick={() => briefVoice.startListening()} size={92}/>
            <button onClick={() => setShowTypeInput(true)} style={{ background: "none", border: "none", color: c.textMuted, fontSize: 13, cursor: "pointer", fontFamily: fonts.body, textDecoration: "underline", textUnderlineOffset: 3 }}>Type instead</button>
          </>}
          {briefVoice.isListening && <>
            <MicButton isListening={true} onClick={() => { briefVoice.stopListening(); setVoiceContext(briefVoice.transcript); }} size={72} disabled={briefVoice.elapsed < 15}/>
            {briefVoice.elapsed < 15 && <span style={{ fontSize: 12, color: c.textMuted, animation: "fadeIn 0.3s ease" }}>Talk for {15-briefVoice.elapsed} more seconds</span>}
            <AnimatedPitchPrompt elapsed={briefVoice.elapsed}/>
            {briefVoice.transcript && <div style={{ width: "100%", padding: 18, borderRadius: 16, background: c.surface, border: `1px solid ${c.borderLight}`, fontSize: 14, color: c.textSecondary, lineHeight: 1.7, maxHeight: 150, overflow: "auto", animation: "fadeUp 0.3s ease" }}>{briefVoice.transcript}<span style={{ animation: "blink 1s step-end infinite", color: c.accent }}>|</span></div>}
          </>}
          {showTypeInput && !briefVoice.isListening && !briefVoice.transcript && !voiceContext && (
            <textarea value={voiceContext} onChange={e => setVoiceContext(e.target.value)} placeholder="E.g. I noticed they're hiring for a content lead — I could fill that gap as a contractor..."
              style={{ width: "100%", padding: 18, borderRadius: 16, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 14, resize: "vertical", minHeight: 140, lineHeight: 1.7, animation: "fadeUp 0.3s ease" }}/>
          )}
          {!briefVoice.isListening && (briefVoice.transcript || voiceContext) && (
            <div style={{ width: "100%", animation: "fadeUp 0.4s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: c.textMuted, fontWeight: 500 }}>Your transcript — feel free to edit</label>
                <button onClick={() => { setVoiceContext(""); briefVoice.setTranscript(""); briefVoice.startListening(); }} style={{ background: "none", border: "none", fontSize: 12, color: c.accent, cursor: "pointer", fontWeight: 600, fontFamily: fonts.body }}>↺ Re-record</button>
              </div>
              <textarea value={voiceContext || briefVoice.transcript} onChange={e => setVoiceContext(e.target.value)}
                style={{ width: "100%", padding: 18, borderRadius: 16, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 14, resize: "vertical", minHeight: 120, lineHeight: 1.7 }}/>
            </div>
          )}
          <Btn primary onClick={generateOutput} disabled={!voiceContext && !briefVoice.transcript} style={{ padding: "16px 44px", marginTop: 4 }}>Generate {OUTPUT_TYPES.find(t => t.id === selectedOutput)?.label} →</Btn>
        </div>
      )}

      {step === STEPS.LOADING && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 28, animation: "fadeUp 0.4s ease" }}>
          <LoadingDots/>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 17, color: c.text, fontFamily: fonts.body, fontWeight: 500 }}>Crafting your {OUTPUT_TYPES.find(t => t.id === selectedOutput)?.label.toLowerCase()}</p>
            <p style={{ fontSize: 14, color: c.textMuted, fontFamily: fonts.body, marginTop: 8, minHeight: 20 }}>{loadingText}</p>
          </div>
        </div>
      )}

      {step === STEPS.RESULT && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 52, paddingBottom: 64, gap: 24, animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1)", maxWidth: 660, width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 34 }}>{OUTPUT_TYPES.find(t => t.id === selectedOutput)?.icon}</span>
            <h2 style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 700, marginTop: 8, color: c.text, letterSpacing: "-0.02em" }}>Your {OUTPUT_TYPES.find(t => t.id === selectedOutput)?.label}</h2>
            <p style={{ fontSize: 13, color: c.textMuted, marginTop: 6 }}>Review, edit if needed, then copy and send.</p>
          </div>
          <div style={{ width: "100%", padding: 32, borderRadius: 20, border: `1px solid ${c.borderLight}`, background: c.surface, fontSize: 15, lineHeight: 1.85, whiteSpace: "pre-wrap", color: c.text, boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>{result}</div>
          <div style={{ display: "flex", gap: 10, width: "100%", flexWrap: "wrap" }}>
            <Btn primary onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ flex: 1, minWidth: 130, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px 20px" }}>{copied ? "✓ Copied!" : "📋 Copy"}</Btn>
            {selectedOutput === "interview_prep" && <Btn onClick={downloadPDF} style={{ flex: 1, minWidth: 130, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px 20px" }}>📥 Download PDF</Btn>}
            <Btn onClick={() => { setVoiceContext(""); briefVoice.setTranscript(""); setShowTypeInput(false); setResult(""); setCopied(false); setStep(STEPS.GENERATE); }} style={{ flex: 1, minWidth: 130, padding: "15px 20px" }}>↺ New Pitch</Btn>
          </div>
          <div style={{ width: "100%", marginTop: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, display: "block", fontFamily: fonts.body }}>Generate Another Format</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {OUTPUT_TYPES.filter(t => t.id !== selectedOutput).map(type => (
                <button key={type.id} onClick={() => { setSelectedOutput(type.id); setTimeout(generateOutput, 50); }} style={{ padding: "11px 18px", borderRadius: 12, background: c.surface, color: c.text, border: `1px solid ${c.border}`, fontSize: 13, fontWeight: 500, fontFamily: fonts.body, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s" }}><span>{type.icon}</span>{type.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
