"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const STEPS = {
  WELCOME: "welcome",
  RESUME: "resume",
  RAMBLE: "ramble",
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
  "CEO / Founder",
  "C-Suite (COO, CMO, CRO, CTO)",
  "VP / SVP",
  "Director",
  "Head of Department",
  "Hiring Manager",
  "HR / People Ops / Recruiter",
  "Other",
];

const PITCH_PROMPTS = [
  "What specific service or skill are you offering them?",
  "Why this company? What caught your eye about them?",
  "Have you noticed anything — a job posting, product launch, or gap?",
  "What result or outcome could you deliver for them?",
  "Is there a mutual connection, shared school, or common thread?",
  "Any other context that would help us tailor this?",
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

// ─── Hooks ───

function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const finalRef = useRef("");

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition isn't supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    finalRef.current = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalRef.current += event.results[i][0].transcript + " ";
        else interim += event.results[i][0].transcript;
      }
      setTranscript(finalRef.current + interim);
    };
    recognition.onerror = (event) => {
      if (event.error !== "no-speech") console.error("Speech error:", event.error);
    };
    recognition.onend = () => {
      if (recognitionRef.current) {
        try { recognition.start(); } catch (e) {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setElapsed(0);
    setTranscript("");
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { isListening, transcript, setTranscript, elapsed, startListening, stopListening };
}

// ─── Components ───

function MicButton({ isListening, onClick, size = 80, disabled = false }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: size, height: size, borderRadius: "50%", border: "none",
        background: isListening
          ? `radial-gradient(circle, ${c.accent} 0%, ${c.dark} 100%)`
          : `radial-gradient(circle, ${c.accentLight} 0%, ${c.accent} 100%)`,
        boxShadow: isListening
          ? `0 0 0 8px ${c.accentGlow}, 0 0 40px ${c.accentGlow}, 0 0 80px rgba(45,90,69,0.08)`
          : hover && !disabled ? `0 0 0 6px ${c.accentGlow}, 0 6px 30px rgba(0,0,0,0.12)`
          : `0 0 0 4px ${c.accentGlow}, 0 4px 24px rgba(0,0,0,0.08)`,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        opacity: disabled ? 0.5 : 1,
        transform: hover && !disabled && !isListening ? "scale(1.06)" : "scale(1)",
        animation: isListening ? "micPulse 2s ease-in-out infinite" : "none", flexShrink: 0,
      }}>
      <svg width={size * 0.38} height={size * 0.38} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isListening ? (
          <rect x="6" y="6" width="12" height="12" rx="2" fill="white" stroke="none" />
        ) : (
          <>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="white" stroke="none" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </>
        )}
      </svg>
    </button>
  );
}

function TimerRing({ elapsed, minimum, size = 130 }) {
  const progress = Math.min(elapsed / minimum, 1);
  const circ = 2 * Math.PI * 54;
  const offset = circ * (1 - progress);
  const hit = elapsed >= minimum;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="65" cy="65" r="54" fill="none" stroke={c.borderLight} strokeWidth="3" />
        <circle cx="65" cy="65" r="54" fill="none" stroke={hit ? c.success : c.accent}
          strokeWidth="3" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: fonts.body, fontSize: 32, fontWeight: 600, color: c.text, letterSpacing: "-0.02em" }}>{elapsed}s</span>
        <span style={{ fontFamily: fonts.body, fontSize: 11, color: hit ? c.success : c.textMuted, marginTop: 2, fontWeight: 500 }}>
          {hit ? "Stop whenever" : `${minimum - elapsed}s minimum`}
        </span>
      </div>
    </div>
  );
}

function AnimatedPrompt({ elapsed }) {
  const prompts = [
    { time: 0, text: "Start by telling us what you do..." },
    { time: 8, text: "What industries do you know best?" },
    { time: 16, text: "What's your superpower — what do clients love about you?" },
    { time: 24, text: "What's your dream client or long-term goal?" },
    { time: 32, text: "Anything else? Stop whenever you're ready." },
  ];
  const current = [...prompts].reverse().find((p) => elapsed >= p.time);
  const [vis, setVis] = useState(true);
  const [text, setText] = useState(current?.text || "");
  const prev = useRef(current?.text);

  useEffect(() => {
    if (current?.text !== prev.current) {
      setVis(false);
      const t = setTimeout(() => { setText(current?.text || ""); setVis(true); prev.current = current?.text; }, 400);
      return () => clearTimeout(t);
    }
  }, [current?.text]);

  return (
    <div style={{
      fontFamily: fonts.body, fontSize: 14, color: c.accent, fontWeight: 500,
      minHeight: 32, textAlign: "center", maxWidth: 380,
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)",
      padding: "10px 20px", borderRadius: 100, background: c.accentSofter,
      border: "1px solid rgba(45,90,69,0.06)", letterSpacing: "-0.01em",
    }}>{text}</div>
  );
}

function AnimatedPitchPrompt({ elapsed }) {
  const prompts = [
    { time: 0, text: "What service or skill are you offering them?" },
    { time: 7, text: "Why this company? What caught your eye?" },
    { time: 14, text: "Any job posting, product launch, or gap you noticed?" },
    { time: 21, text: "What result or outcome could you deliver?" },
    { time: 28, text: "Any mutual connections or common thread?" },
    { time: 35, text: "Anything else? Stop whenever you're ready." },
  ];
  const current = [...prompts].reverse().find((p) => elapsed >= p.time);
  const [vis, setVis] = useState(true);
  const [text, setText] = useState(current?.text || "");
  const prev = useRef(current?.text);

  useEffect(() => {
    if (current?.text !== prev.current) {
      setVis(false);
      const t = setTimeout(() => { setText(current?.text || ""); setVis(true); prev.current = current?.text; }, 400);
      return () => clearTimeout(t);
    }
  }, [current?.text]);

  return (
    <div style={{
      fontFamily: fonts.body, fontSize: 14, color: c.accent, fontWeight: 500,
      minHeight: 32, textAlign: "center", maxWidth: 380,
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)",
      padding: "10px 20px", borderRadius: 100, background: c.accentSofter,
      border: "1px solid rgba(45,90,69,0.06)", letterSpacing: "-0.01em",
    }}>{text}</div>
  );
}

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11, color: c.accent, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: fonts.body }}>
        Step {current} of {total}
      </span>
      <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{
            width: i + 1 <= current ? 20 : 8, height: 4, borderRadius: 2,
            background: i + 1 <= current ? c.accent : c.border, transition: "all 0.3s ease",
          }} />
        ))}
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: "50%", background: c.accent,
          animation: `loadDot 1.4s ease-in-out ${i * 0.16}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Btn({ children, primary, disabled, onClick, style: sx = {} }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: primary ? (disabled ? c.border : c.accent) : c.surfaceAlt,
        color: primary ? c.white : c.text,
        border: primary ? "none" : `1px solid ${c.border}`,
        padding: "14px 36px", borderRadius: 12, fontSize: 15, fontWeight: 600,
        fontFamily: fonts.body, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transform: hov && !disabled ? "translateY(-2px)" : "translateY(0)",
        boxShadow: primary && !disabled ? `0 4px 20px ${c.accentGlow}` : "none",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", ...sx,
      }}>
      {children}
    </button>
  );
}

// ─── Output Type Prompt Templates ───

const outputTypePrompts = {
  cold_email: `a cold outreach email. Requirements:
- Subject line referencing something SPECIFIC about the company (a recent hire, product launch, funding round, market move)
- Maximum 4 sentences in the body
- Each sentence on its own line with a blank line between them for visual breathing room
- Sentence 1: A sharp, specific observation about their company proving you researched. NEVER start with "I" — start with THEM.
- Sentence 2: The insight or gap you've identified and how it connects to what you do
- Sentence 3: One concrete result you've delivered (with a number if possible)
- Sentence 4: A single clear CTA — propose a specific day or ask one question
- Tone: confident peer offering value. NOT a job seeker. NOT humble. NOT salesy.
- BANNED phrases: "I hope this finds you well", "I'd love to", "I came across", "I believe I could", "reaching out because", "just wanted to", any generic compliment
- Every single word must earn its place.`,

  linkedin_dm: `a LinkedIn direct message. STRICT Requirements:
- MUST be under 200 characters total. Count carefully. This is NON-NEGOTIABLE.
- Structure: one hook + one CTA. That's it. Two short sentences maximum.
- The hook must reference something SPECIFIC — something they posted, a company announcement, a hiring signal
- The CTA is a dead-simple question that's easy to reply to
- NO greeting (no "Hi [name]" — wastes characters)
- NO pitching your services. The ONLY goal is to start a conversation.
- NO formal language. Write like a text message between professionals.
- Count your characters. If it's over 200, cut ruthlessly.`,

  cover_letter: `a cover letter. Requirements:
- 3 tight paragraphs. Zero fluff.
- Paragraph 1: Name the EXACT role. Reference something hyper-specific about the company — a recent product feature, a leadership quote, a market move, a value from their culture page. This MUST prove you spent real time researching.
- Paragraph 2: Take 2-3 SPECIFIC requirements from the job and map your experience to each one with explicit proof. Format: "Your posting asks for X — at [Company], I did exactly that: [specific achievement with numbers]."
- Paragraph 3: Something the resume doesn't capture — pull from their voice ramble for a personal motivation, passion for the industry, or long-term vision that aligns with where the company is heading. Close with forward momentum, not gratitude.
- BANNED: "I'm excited to apply", "I believe I'd be a great fit", "I'm passionate about", any sentence that could appear in anyone else's cover letter`,

  interview_prep: `an interview preparation guide. Format with clear headers.

COMPANY SNAPSHOT
What they do, how they make money, stage/size, 2-3 recent developments, and 2-3 main competitors. 4-5 sentences max.

ROLE ANALYSIS
What this role REALLY requires based on company stage and context. What problems is this hire meant to solve?

LIKELY QUESTIONS (7)
7 specific questions tailored to role and industry. For each, provide a concrete talking point referencing the user's actual experience. Include 2+ behavioral questions. Format as "Q:" and "Your angle:" pairs.

QUESTIONS TO ASK THEM (5)
5 smart, researched questions proving homework. Reference specific company moves, market conditions, or strategic decisions. BANNED: "What does success look like", anything generic.

KEY TALKING POINTS (4)
4 things to weave into conversation no matter what, each connecting their background to this company's specific needs.`,

  elevator_pitch: `a 30-second elevator pitch designed to be SPOKEN aloud. Requirements:
- 3-4 sentences maximum
- Sentence 1: Who you are framed around the OUTCOME you deliver, not your title
- Sentence 2: Who you help and what specific result you create (include a number)
- Sentence 3: What makes you different — your unique angle
- Sentence 4: A conversational bridge inviting them to engage
- Must sound completely natural spoken aloud — contractions, natural rhythm, conversational tone`,
};

// ─── Main App ───

export default function PitchTool() {
  const [step, setStep] = useState(STEPS.WELCOME);
  const [profile, setProfile] = useState({ resumeText: "", rambleText: "", resumeFileName: "" });
  const [companyUrl, setCompanyUrl] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("cold_email");
  const [voiceContext, setVoiceContext] = useState("");
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const voice = useVoiceInput();
  const briefVoice = useVoiceInput();

  const loadingMessages = [
    "Pulling up the company profile...",
    "Reading between the lines of their website...",
    "Cross-referencing with your background...",
    "Crafting something worth sending...",
  ];

  useEffect(() => {
    if (step !== STEPS.LOADING) return;
    let i = 0;
    setLoadingText(loadingMessages[0]);
    const interval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[i]);
    }, 2800);
    return () => clearInterval(interval);
  }, [step]);

  const generateOutput = async () => {
    setStep(STEPS.LOADING);
    try {
      // Step 1: Scrape company website via server-side route
      let companyData = `Company website: ${companyUrl}`;
      try {
        const scrapeResp = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: companyUrl }),
        });
        const scrapeData = await scrapeResp.json();
        if (scrapeData.text) companyData = scrapeData.text;
      } catch (e) {
        console.error("Scrape failed:", e);
      }

      // Step 2: Generate via server-side Anthropic route
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are an elite career strategist and copywriter. You write with surgical precision — every word earns its place. You never use filler, cliches, or generic language. Every output demonstrates deep, specific knowledge of the target company. Your tone is confident, sharp, and human — never robotic, never desperate, never sycophantic. You follow formatting instructions EXACTLY.`,
          messages: [{
            role: "user",
            content: `Generate ${outputTypePrompts[selectedOutput]}

ABOUT THE PERSON (resume):
${profile.resumeText || "Not provided"}

ABOUT THE PERSON (their own words):
${profile.rambleText || "Not provided"}

TARGET COMPANY:
${companyData}

TARGET ROLE/PERSON: ${targetRole || "Decision maker"}

ADDITIONAL CONTEXT:
${voiceContext || "None provided"}

Write ONLY the deliverable. No meta-commentary, no explanations, no preamble. Just the output.`,
          }],
        }),
      });

      const data = await response.json();

      if (data.error) {
        setResult(data.error);
      } else {
        const text = data.content?.map((block) => block.text || "").join("\n") || "Error generating. Please try again.";
        setResult(text);
      }
      setStep(STEPS.RESULT);
    } catch (err) {
      console.error(err);
      setResult("Something went wrong. Please check your connection and try again.");
      setStep(STEPS.RESULT);
    }
  };

  const processResumeFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    const cleaned = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
    setProfile((p) => ({
      ...p,
      resumeText: cleaned.length > 50 ? cleaned : `[${file.name} uploaded]`,
      resumeFileName: file.name,
    }));
  };

  const handleResumeUpload = async (e) => {
    processResumeFile(e.target.files?.[0]);
  };

  const handleResumeDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processResumeFile(file);
  };

  const downloadPDF = () => {
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>Interview Prep</title><style>
      body{font-family:'Helvetica Neue',sans-serif;max-width:680px;margin:40px auto;padding:24px;color:#1a1a1a;line-height:1.8;font-size:14px}
      h1{font-size:22px;color:#2D5A45;margin-bottom:4px}
      .meta{color:#9c9a94;font-size:13px;margin-bottom:20px}
      pre{white-space:pre-wrap;font-family:inherit}
    </style></head><body>
    <h1>Interview Prep Guide</h1>
    <div class="meta">${companyUrl} · Generated ${new Date().toLocaleDateString()}</div>
    <pre>${result}</pre></body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div style={{
      minHeight: "100vh", background: c.bg, color: c.text,
      fontFamily: fonts.body, display: "flex", flexDirection: "column",
      alignItems: "center", padding: "0 20px",
    }}>
      <style>{`
        @keyframes micPulse {
          0%,100%{box-shadow:0 0 0 8px ${c.accentGlow},0 0 40px ${c.accentGlow}}
          50%{box-shadow:0 0 0 20px ${c.accentGlow},0 0 60px ${c.accentGlow}}
        }
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes blink{50%{opacity:0}}
        @keyframes loadDot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:${c.accentSoft};color:${c.accent}}
        textarea:focus,input:focus,select:focus{outline:none;border-color:${c.accent}!important;box-shadow:0 0 0 3px ${c.accentSoft}}
        .output-card{cursor:pointer;transition:all 0.2s cubic-bezier(0.4,0,0.2,1)}
        .output-card:hover{border-color:${c.accent}!important;box-shadow:0 2px 16px ${c.accentGlow};transform:translateY(-1px)}
        input::placeholder,textarea::placeholder{color:${c.textMuted}}
      `}</style>

      {/* ─── WELCOME ─── */}
      {step === STEPS.WELCOME && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", gap: 32, animation: "fadeUp 0.7s cubic-bezier(0.4,0,0.2,1)", maxWidth: 560, textAlign: "center",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22,
            background: `linear-gradient(135deg, ${c.accentSoft}, ${c.accentSofter})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34,
            border: "1px solid rgba(45,90,69,0.08)",
          }}>🎙️</div>
          <div>
            <h1 style={{
              fontFamily: fonts.display, fontSize: 50, fontWeight: 700,
              lineHeight: 1.1, letterSpacing: "-0.025em", color: c.text,
            }}>
              Speak your way<br />to the <span style={{ color: c.accent, fontStyle: "italic" }}>perfect pitch</span>
            </h1>
            <p style={{ fontSize: 17, color: c.textSecondary, lineHeight: 1.7, maxWidth: 440, margin: "20px auto 0" }}>
              Upload your resume, talk about yourself, and we&apos;ll craft cold emails, LinkedIn DMs, cover letters, interview prep, and elevator pitches — ready to send.
            </p>
          </div>
          <Btn primary onClick={() => setStep(STEPS.RESUME)} style={{ padding: "18px 56px", fontSize: 16, borderRadius: 14 }}>
            Get Started
          </Btn>
          <span style={{ fontSize: 13, color: c.textMuted }}>Takes about 2 minutes to set up</span>
        </div>
      )}

      {/* ─── RESUME ─── */}
      {step === STEPS.RESUME && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", gap: 28, animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1)", maxWidth: 520, width: "100%",
        }}>
          <div style={{ textAlign: "center" }}>
            <StepIndicator current={1} total={2} />
            <h2 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 700, marginTop: 12, letterSpacing: "-0.02em" }}>Upload your resume</h2>
            <p style={{ fontSize: 15, color: c.textSecondary, marginTop: 10, lineHeight: 1.65 }}>
              We&apos;ll read it behind the scenes to personalize every output with your real experience.
            </p>
          </div>
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={handleResumeDrop}
            style={{
            width: "100%", padding: "56px 24px", borderRadius: 20,
            border: `2px dashed ${profile.resumeFileName ? c.accent : dragOver ? c.accentLight : c.border}`,
            background: profile.resumeFileName ? c.accentSofter : dragOver ? c.accentSofter : c.surface,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}>
            <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleResumeUpload} style={{ display: "none" }} />
            {profile.resumeFileName ? (
              <>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: c.successSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={c.success} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: c.text }}>{profile.resumeFileName}</span>
                <span style={{ fontSize: 13, color: c.textMuted }}>Tap to replace</span>
              </>
            ) : (
              <>
                <div style={{ fontSize: 40, opacity: 0.9 }}>📎</div>
                <span style={{ fontSize: 16, fontWeight: 500, color: c.text }}>Drop your resume here or click to browse</span>
                <span style={{ fontSize: 13, color: c.textMuted }}>PDF or TXT</span>
              </>
            )}
          </label>
          <Btn primary onClick={() => setStep(STEPS.RAMBLE)} disabled={!profile.resumeFileName}>Continue</Btn>
        </div>
      )}

      {/* ─── VOICE RAMBLE ─── */}
      {step === STEPS.RAMBLE && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", gap: 22, animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1)", maxWidth: 540, width: "100%",
        }}>
          <div style={{ textAlign: "center" }}>
            <StepIndicator current={2} total={2} />
            <h2 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 700, marginTop: 12, letterSpacing: "-0.02em" }}>Now tell us about you</h2>
            <p style={{ fontSize: 15, color: c.textSecondary, marginTop: 10, lineHeight: 1.65, maxWidth: 420, margin: "10px auto 0" }}>
              Hit the mic and talk for at least 30 seconds. We&apos;ll prompt you along the way.
            </p>
          </div>

          {voice.isListening && <TimerRing elapsed={voice.elapsed} minimum={30} />}
          {!voice.isListening && !voice.transcript && <div style={{ height: 16 }} />}

          <MicButton isListening={voice.isListening}
            onClick={() => {
              if (voice.isListening) { voice.stopListening(); setProfile(p => ({ ...p, rambleText: voice.transcript })); }
              else voice.startListening();
            }}
            size={voice.isListening ? 72 : 92}
            disabled={voice.isListening && voice.elapsed < 30} />

          {voice.isListening && voice.elapsed < 30 && (
            <span style={{ fontSize: 12, color: c.textMuted, animation: "fadeIn 0.3s ease" }}>
              Talk for {30 - voice.elapsed} more seconds to unlock stop
            </span>
          )}
          {voice.isListening && <AnimatedPrompt elapsed={voice.elapsed} />}
          {voice.isListening && voice.transcript && (
            <div style={{
              width: "100%", padding: 18, borderRadius: 16, background: c.surface,
              border: `1px solid ${c.borderLight}`, fontSize: 14, color: c.textSecondary,
              lineHeight: 1.7, maxHeight: 150, overflow: "auto", animation: "fadeUp 0.3s ease",
            }}>
              {voice.transcript}<span style={{ animation: "blink 1s step-end infinite", color: c.accent }}>|</span>
            </div>
          )}
          {!voice.isListening && voice.transcript && (
            <div style={{ width: "100%", animation: "fadeUp 0.4s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: c.textMuted, fontWeight: 500 }}>Your transcript — feel free to edit</label>
                <button onClick={() => { voice.setTranscript(""); voice.startListening(); }} style={{
                  background: "none", border: "none", fontSize: 12, color: c.accent, cursor: "pointer", fontWeight: 600, fontFamily: fonts.body,
                }}>↺ Re-record</button>
              </div>
              <textarea value={voice.transcript}
                onChange={e => { voice.setTranscript(e.target.value); setProfile(p => ({ ...p, rambleText: e.target.value })); }}
                style={{
                  width: "100%", padding: 18, borderRadius: 16, border: `1px solid ${c.border}`,
                  background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 14,
                  resize: "vertical", minHeight: 120, lineHeight: 1.7,
                }} />
            </div>
          )}
          {!voice.isListening && !voice.transcript && (
            <button onClick={() => setShowTypeInput(true)} style={{
              background: "none", border: "none", color: c.textMuted, fontSize: 13,
              cursor: "pointer", fontFamily: fonts.body, textDecoration: "underline", textUnderlineOffset: 3,
            }}>Type instead</button>
          )}
          {showTypeInput && !voice.isListening && !voice.transcript && (
            <textarea value={profile.rambleText}
              onChange={e => setProfile(p => ({ ...p, rambleText: e.target.value }))}
              placeholder="Tell us about yourself — your skills, goals, what makes you different..."
              style={{
                width: "100%", padding: 18, borderRadius: 16, border: `1px solid ${c.border}`,
                background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 14,
                resize: "vertical", minHeight: 140, lineHeight: 1.7, animation: "fadeUp 0.3s ease",
              }} />
          )}
          <Btn primary onClick={() => setStep(STEPS.GENERATE)} disabled={!profile.rambleText || profile.rambleText.length < 30}
            style={{ marginTop: 4 }}>Complete Profile →</Btn>
        </div>
      )}

      {/* ─── GENERATE (Page 1: Setup) ─── */}
      {step === STEPS.GENERATE && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: 52, paddingBottom: 64, gap: 30, animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1)", maxWidth: 600, width: "100%",
        }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>Who are you pitching?</h2>
            <p style={{ fontSize: 15, color: c.textSecondary, marginTop: 8 }}>Tell us the company, who you&apos;re targeting, and what you need.</p>
          </div>

          <div style={{ width: "100%" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fonts.body }}>Company Website</label>
            <input type="url" value={companyUrl} onChange={e => setCompanyUrl(e.target.value)} placeholder="https://example.com"
              style={{ width: "100%", marginTop: 8, padding: "15px 18px", borderRadius: 14, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 15 }} />
          </div>

          <div style={{ width: "100%" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fonts.body }}>Who Are You Targeting?</label>
            <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
              style={{
                width: "100%", marginTop: 8, padding: "15px 18px", borderRadius: 14,
                border: `1px solid ${c.border}`, background: c.surface,
                color: targetRole ? c.text : c.textMuted, fontFamily: fonts.body, fontSize: 15,
                appearance: "none", cursor: "pointer",
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239C9A94' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 18px center",
              }}>
              <option value="">Select a role...</option>
              {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ width: "100%" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, display: "block", fontFamily: fonts.body }}>What Do You Need?</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {OUTPUT_TYPES.map(type => (
                <div key={type.id} className="output-card" onClick={() => setSelectedOutput(type.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 16,
                    border: `1.5px solid ${selectedOutput === type.id ? c.accent : c.borderLight}`,
                    background: selectedOutput === type.id ? c.accentSoft : c.surface,
                  }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{type.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{type.label}</div>
                    <div style={{ fontSize: 12, color: c.textMuted, marginTop: 3 }}>{type.desc}</div>
                  </div>
                  {selectedOutput === type.id && (
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Btn primary onClick={() => setStep(STEPS.PITCH_VOICE)} disabled={!companyUrl || !targetRole}
            style={{ width: "100%", padding: "18px 24px", borderRadius: 14, fontSize: 16 }}>
            Continue
          </Btn>
        </div>
      )}

      {/* ─── PITCH VOICE (Page 2: Voice-first pitch context) ─── */}
      {step === STEPS.PITCH_VOICE && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", gap: 22, animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1)", maxWidth: 540, width: "100%",
        }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 700, marginTop: 12, letterSpacing: "-0.02em" }}>
              Tell us about this pitch
            </h2>
            <p style={{ fontSize: 15, color: c.textSecondary, marginTop: 10, lineHeight: 1.65, maxWidth: 420, margin: "10px auto 0" }}>
              Hit the mic and describe what you&apos;re offering and why. We&apos;ll prompt you as you go.
            </p>
          </div>

          {briefVoice.isListening && <TimerRing elapsed={briefVoice.elapsed} minimum={15} />}
          {!briefVoice.isListening && !briefVoice.transcript && !voiceContext && <div style={{ height: 16 }} />}

          {!briefVoice.isListening && !briefVoice.transcript && !voiceContext && (
            <>
              <MicButton isListening={false} onClick={() => briefVoice.startListening()} size={92} />
              <button onClick={() => setShowTypeInput(true)} style={{
                background: "none", border: "none", color: c.textMuted, fontSize: 13,
                cursor: "pointer", fontFamily: fonts.body, textDecoration: "underline", textUnderlineOffset: 3,
              }}>Type instead</button>
            </>
          )}

          {briefVoice.isListening && (
            <>
              <MicButton isListening={true}
                onClick={() => { briefVoice.stopListening(); setVoiceContext(briefVoice.transcript); }}
                size={72} disabled={briefVoice.elapsed < 15} />
              {briefVoice.elapsed < 15 && (
                <span style={{ fontSize: 12, color: c.textMuted, animation: "fadeIn 0.3s ease" }}>
                  Talk for {15 - briefVoice.elapsed} more seconds to unlock stop
                </span>
              )}
              <AnimatedPitchPrompt elapsed={briefVoice.elapsed} />
              {briefVoice.transcript && (
                <div style={{
                  width: "100%", padding: 18, borderRadius: 16, background: c.surface,
                  border: `1px solid ${c.borderLight}`, fontSize: 14, color: c.textSecondary,
                  lineHeight: 1.7, maxHeight: 150, overflow: "auto", animation: "fadeUp 0.3s ease",
                }}>
                  {briefVoice.transcript}<span style={{ animation: "blink 1s step-end infinite", color: c.accent }}>|</span>
                </div>
              )}
            </>
          )}

          {showTypeInput && !briefVoice.isListening && !briefVoice.transcript && !voiceContext && (
            <textarea value={voiceContext} onChange={e => setVoiceContext(e.target.value)}
              placeholder="E.g. I noticed they're hiring for a content lead — I could fill that gap as a contractor while they search..."
              style={{
                width: "100%", padding: 18, borderRadius: 16, border: `1px solid ${c.border}`,
                background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 14,
                resize: "vertical", minHeight: 140, lineHeight: 1.7, animation: "fadeUp 0.3s ease",
              }} />
          )}

          {!briefVoice.isListening && (briefVoice.transcript || voiceContext) && (
            <div style={{ width: "100%", animation: "fadeUp 0.4s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: c.textMuted, fontWeight: 500 }}>Your transcript — feel free to edit</label>
                <button onClick={() => { setVoiceContext(""); briefVoice.setTranscript(""); briefVoice.startListening(); }} style={{
                  background: "none", border: "none", fontSize: 12, color: c.accent, cursor: "pointer", fontWeight: 600, fontFamily: fonts.body,
                }}>↺ Re-record</button>
              </div>
              <textarea value={voiceContext || briefVoice.transcript} onChange={e => setVoiceContext(e.target.value)}
                style={{
                  width: "100%", padding: 18, borderRadius: 16, border: `1px solid ${c.border}`,
                  background: c.surface, color: c.text, fontFamily: fonts.body, fontSize: 14,
                  resize: "vertical", minHeight: 120, lineHeight: 1.7,
                }} />
            </div>
          )}

          <Btn primary onClick={generateOutput} disabled={!voiceContext && !briefVoice.transcript}
            style={{ padding: "16px 44px", marginTop: 4 }}>
            Generate {OUTPUT_TYPES.find(t => t.id === selectedOutput)?.label} →
          </Btn>
        </div>
      )}

      {/* ─── LOADING ─── */}
      {step === STEPS.LOADING && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 28, animation: "fadeUp 0.4s ease" }}>
          <LoadingDots />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 17, color: c.text, fontFamily: fonts.body, fontWeight: 500 }}>
              Crafting your {OUTPUT_TYPES.find(t => t.id === selectedOutput)?.label.toLowerCase()}
            </p>
            <p style={{ fontSize: 14, color: c.textMuted, fontFamily: fonts.body, marginTop: 8, transition: "opacity 0.3s ease", minHeight: 20 }}>{loadingText}</p>
          </div>
        </div>
      )}

      {/* ─── RESULT ─── */}
      {step === STEPS.RESULT && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: 52, paddingBottom: 64, gap: 24, animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1)", maxWidth: 660, width: "100%",
        }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 34 }}>{OUTPUT_TYPES.find(t => t.id === selectedOutput)?.icon}</span>
            <h2 style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 700, marginTop: 8, color: c.text, letterSpacing: "-0.02em" }}>
              Your {OUTPUT_TYPES.find(t => t.id === selectedOutput)?.label}
            </h2>
            <p style={{ fontSize: 13, color: c.textMuted, marginTop: 6 }}>Review, edit if needed, then copy and send.</p>
          </div>

          <div style={{
            width: "100%", padding: 32, borderRadius: 20, border: `1px solid ${c.borderLight}`,
            background: c.surface, fontSize: 15, lineHeight: 1.85, whiteSpace: "pre-wrap", color: c.text,
            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
          }}>{result}</div>

          <div style={{ display: "flex", gap: 10, width: "100%", flexWrap: "wrap" }}>
            <Btn primary onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ flex: 1, minWidth: 130, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px 20px" }}>
              {copied ? "✓ Copied!" : "📋 Copy"}
            </Btn>
            {selectedOutput === "interview_prep" && (
              <Btn onClick={downloadPDF} style={{ flex: 1, minWidth: 130, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px 20px" }}>
                📥 Download PDF
              </Btn>
            )}
            <Btn onClick={() => { setVoiceContext(""); briefVoice.setTranscript(""); setShowTypeInput(false); setResult(""); setCopied(false); setStep(STEPS.GENERATE); }}
              style={{ flex: 1, minWidth: 130, padding: "15px 20px" }}>↺ New Pitch</Btn>
          </div>

          <div style={{ width: "100%", marginTop: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, display: "block", fontFamily: fonts.body }}>Generate Another Format</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {OUTPUT_TYPES.filter(t => t.id !== selectedOutput).map(type => (
                <button key={type.id} onClick={() => { setSelectedOutput(type.id); setTimeout(generateOutput, 50); }}
                  style={{
                    padding: "11px 18px", borderRadius: 12, background: c.surface, color: c.text,
                    border: `1px solid ${c.border}`, fontSize: 13, fontWeight: 500, fontFamily: fonts.body,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                    transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  }}>
                  <span>{type.icon}</span>{type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
