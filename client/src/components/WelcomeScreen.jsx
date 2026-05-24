import { useState, useEffect, useLayoutEffect, useRef } from "react";
import * as sound from "../utils/audio";
import { CHARACTER_CLASSES } from "../utils/characterClasses";

const BACKEND_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "";
const getAvatarUrl = (seed) => `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=transparent`;

const CLASS_COLORS = [
  "#a855f7", // Purple (Doomscroller)
  "#f97316", // Orange (Speedrunner)
  "#3b82f6", // Blue (Streamsniper)
  "#ef4444", // Red (Edgelord)
  "#22c55e", // Green (Vibechecker)
  "#06b6d4", // Cyan (Glitchmancer)
  "#eab308", // Yellow (Sigmagrinder)
  "#8b5cf6", // Violet (NPC)
  "#f43f5e", // Rose (Brainiac)
  "#ec4899"  // Pink (Gachaaddict)
];

const CLASS_ICONS = ["🧠", "⚡", "🛡️", "👾", "🎯", "👁️", "⚔️", "🤖", "🧬", "🎲"];

const CLASS_STATS = {
  doomscroller: { focus: 40, speed: 50, disruption: 85, defense: 30, chaos: 60 },
  speedrunner: { focus: 75, speed: 99, disruption: 45, defense: 40, chaos: 50 },
  streamsniper: { focus: 80, speed: 60, disruption: 70, defense: 30, chaos: 65 },
  edgelord: { focus: 45, speed: 70, disruption: 90, defense: 20, chaos: 75 },
  vibechecker: { focus: 90, speed: 50, disruption: 10, defense: 99, chaos: 20 },
  glitchmancer: { focus: 50, speed: 60, disruption: 98, defense: 35, chaos: 80 },
  sigmagrinder: { focus: 95, speed: 75, disruption: 50, defense: 60, chaos: 30 },
  npc: { focus: 30, speed: 40, disruption: 75, defense: 50, chaos: 70 },
  brainiac: { focus: 99, speed: 65, disruption: 30, defense: 70, chaos: 25 },
  gachaaddict: { focus: 35, speed: 55, disruption: 60, defense: 40, chaos: 99 }
};

export default function WelcomeScreen({
  onAuthSuccess,
  isDarkMode,
  setIsDarkMode,
  isMusicMuted,
  setIsMusicMuted,
  musicProfile,
  setMusicProfile,
  keepMusicInGame,
  setKeepMusicInGame
}) {
  // Theme styling toggle state: "workspace" or "retro-game"
  const [portalStyle, setPortalStyle] = useState(() => localStorage.getItem("kaevrix_portal_style") || "workspace");
  const [showMusicSettings, setShowMusicSettings] = useState(false);
  
  const [authMode, setAuthMode] = useState("menu"); // menu, signin, signup
  const [retroShowForm, setRetroShowForm] = useState(false);
  const [retroTipIdx, setRetroTipIdx] = useState(0);

  const RETRO_TIPS = [
    "TIP: CORRECT ANSWERS YIELD 50 XP BASE + SPEED BONUS UP TO 10% PER REMAINING SECOND!",
    "TIP: DOOMSCROLLER CLASS SPECIALIZES IN VISUAL DISRUPTION AND CHAOS!",
    "TIP: STREAMSIPER CAN FREEZE OPPONENTS TO DELAY THEIR VIDEO PLAYBACK!",
    "TIP: KEEP AN EYE ON YOUR WATCH ENERGY BAR TO ACTIVATE POWERFUL SIGNATURE ACTIONS!",
    "TIP: QUESTIONS POP UP DYNAMICALLY BASED ON VIDEO LENGTH IN THE SECOND HALF!",
    "TIP: REROLL YOUR AVATAR MATRIX SEED TO GENERATE UNIQUE BOT DETAILS!"
  ];

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setRetroTipIdx(prev => (prev + 1) % RETRO_TIPS.length);
    }, 6000);
    return () => clearInterval(tipInterval);
  }, []);

  const cycleMusicProfile = () => {
    sound.playClockTick();
    if (isMusicMuted) {
      setIsMusicMuted(false);
      localStorage.setItem("kaevrix_music_muted", "false");
      setMusicProfile(0);
      localStorage.setItem("kaevrix_music_profile", "0");
    } else if (musicProfile === 5) {
      setIsMusicMuted(true);
      localStorage.setItem("kaevrix_music_muted", "true");
    } else {
      const nextProfile = musicProfile + 1;
      setMusicProfile(nextProfile);
      localStorage.setItem("kaevrix_music_profile", String(nextProfile));
    }
  };
  
  // Using opacity-based overlay background layers to completely avoid browser gradient rendering bugs

  // Sign In States
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [recognizedClass, setRecognizedClass] = useState(null);
  const [recognizedAvatar, setRecognizedAvatar] = useState(null);

  // Sign Up States
  const [signUpStep, setSignUpStep] = useState(1); // 1: Class Selection, 2: Credentials, 3: Loading
  const [selectedClassId, setSelectedClassId] = useState(
    () => localStorage.getItem("kaevrix_class") || "doomscroller"
  );
  const [avatarSeed, setAvatarSeed] = useState(() => Math.random().toString(36).substring(7));
  const savedAvatarInit = localStorage.getItem("kaevrix_avatar");
  const [avatar, setAvatar] = useState(
    () => savedAvatarInit && savedAvatarInit.includes("http") ? savedAvatarInit : getAvatarUrl(Math.random().toString(36).substring(7))
  );
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [isGlitching, setIsGlitching] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);

  // Active hover indicator for retro arcade buttons
  const [hoveredButtonId, setHoveredButtonId] = useState(null);

  const classes = Object.values(CHARACTER_CLASSES);
  const enhancedClasses = classes.map((cls, index) => ({
    ...cls,
    themeColor: CLASS_COLORS[index % CLASS_COLORS.length],
    icon: CLASS_ICONS[index % CLASS_ICONS.length]
  }));

  const scrollRef = useRef(null);

  // Debounced check to recognize username and load their profile theme on the login screen
  useEffect(() => {
    if (authMode !== "signin") return;
    const cleanName = loginUsername.trim();
    if (cleanName.length < 3) {
      setRecognizedClass(null);
      setRecognizedAvatar(null);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetch(`${BACKEND_URL}/api/auth/theme/${cleanName}`)
        .then(res => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then(data => {
          if (data && data.selectedClass) {
            sound.playWhoosh();
            setRecognizedClass(data.selectedClass);
            setRecognizedAvatar(data.avatar);
          }
        })
        .catch(() => {
          setRecognizedClass(null);
          setRecognizedAvatar(null);
        });
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [loginUsername, authMode]);

  // Sync avatar seed with selected class on Step 1 load
  useEffect(() => {
    const activeCls = enhancedClasses.find(c => c.id === selectedClassId);
    if (activeCls) {
      setAvatarSeed(activeCls.avatarSeed);
      setAvatar(getAvatarUrl(activeCls.avatarSeed));
    }
  }, [selectedClassId]);

  const handleShuffleAvatar = () => {
    sound.playGlitch();
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 300);
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
    setAvatar(getAvatarUrl(newSeed));
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) return;

    sound.playClockTick();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      
      sound.playMatchFound();
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setLoginError(err.message);
      sound.playIncorrect();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!signUpUsername.trim() || !signUpPassword) return;
    if (signUpPassword.length < 4) {
      setSignUpError("Passkey must be at least 4 characters long");
      return;
    }

    sound.playClockTick();
    setSignUpError("");
    setIsRegistering(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: signUpUsername, 
          password: signUpPassword,
          avatar,
          selectedClass: selectedClassId
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSignUpStep(3);
      startTerminalSequence(data);
    } catch (err) {
      setSignUpError(err.message);
      sound.playIncorrect();
      setIsRegistering(false);
    }
  };

  const startTerminalSequence = (authPayload) => {
    const activeCls = enhancedClasses.find(c => c.id === selectedClassId) || enhancedClasses[0];
    const logs = [
      `>>> INITIATING NEURAL CONNECT v2.5...`,
      `>>> SHIELD PROTOCOLS ACTIVE.`,
      `>>> SYNTHESIZING CLASS LINK: [${activeCls.name.toUpperCase()}]... SUCCESS.`,
      `>>> ENCRYPTING PASSKEY INTERFACE... SECURE.`,
      `>>> RESOLVING LOGICAL VIDEO METRICS... STANDBY.`,
      `>>> CALIBRATING AVATAR MEMORY CORE... LOGGED.`,
      `>>> SYSTEM READY. ENTERING KAEVRIX ARENA...`
    ];

    setTerminalLogs([]);
    let idx = 0;
    
    const interval = setInterval(() => {
      if (idx < logs.length) {
        sound.playClockTick(true);
        setTerminalLogs(prev => [...prev, logs[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          sound.playMatchFound();
          onAuthSuccess(authPayload.user, authPayload.token);
        }, 800);
      }
    }, 450);
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -344, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 344, behavior: 'smooth' });
  };

  // Switch between styles helper
  const handleTogglePortalStyle = () => {
    sound.playClockTick();
    const nextStyle = portalStyle === "workspace" ? "retro-game" : "workspace";
    setPortalStyle(nextStyle);
    setRetroShowForm(false);
    setAuthMode("menu");
    localStorage.setItem("kaevrix_portal_style", nextStyle);
  };

  // Resolve current visual themes
  const activeClassIdToMatch = authMode === "signin" && recognizedClass ? recognizedClass : selectedClassId;
  const activeClass = enhancedClasses.find(c => c.id === activeClassIdToMatch) || enhancedClasses[0];

  const currentThemeColor = activeClass.themeColor;
  const classStats = CLASS_STATS[activeClass.id] || { focus: 50, speed: 50, disruption: 50, defense: 50, chaos: 50 };

  const overlayBg = isDarkMode 
    ? "radial-gradient(ellipse at top, #111827 0%, #000000 100%)" 
    : "radial-gradient(160deg, #fff7ed 0%, #ffedd5 55%, #ffe8cc 100%)";
  const textColor = isDarkMode ? "#ffffff" : "#1c0a00";
  const textMuted = isDarkMode ? "#9ca3af" : "#92400e";
  const cardBgBase = isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.7)";
  const cardBorder = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(255,106,0,0.2)";
  const inputBg = isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.95)";
  const labelColor = isDarkMode ? "#9ca3af" : "#92400e";
  const footerBg = isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.85)";
  // In light mode, glow is always orange (not class-based color which can be blue/purple)
  const ambientGlowColor = isDarkMode ? currentThemeColor : "#ff6a00";

  return (
    <div
      className="welcome-aaa-overlay"
      style={{ 
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
        display: "flex", flexDirection: "column", 
        overflowY: "auto", overflowX: "hidden", zIndex: 9999,
        fontFamily: "'Inter', sans-serif",
        color: textColor,
      }}
    >
      {/* Light Mode Gradient Layer */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(160deg, #fff7ed 0%, #ffedd5 55%, #ffe0b2 100%)",
        opacity: isDarkMode ? 0 : 1,
        transition: "opacity 0.4s ease-in-out",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Dark Mode Gradient Layer */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 30% 20%, #1a2744 0%, #060c1a 70%)",
        opacity: isDarkMode ? 1 : 0,
        transition: "opacity 0.4s ease-in-out",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Cyber Grid Background */}
      <div className="portal-cyber-grid" />

      {/* Light Mode Ambient Glow (Orange) */}
      <div style={{ 
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", 
        width: "90%", height: "45%", 
        background: "radial-gradient(ellipse, rgba(255, 106, 0, 0.09) 0%, transparent 70%)", 
        filter: "blur(90px)", 
        opacity: isDarkMode ? 0 : 1,
        transition: "opacity 0.4s ease-in-out", 
        pointerEvents: "none",
        zIndex: 1
      }} />

      {/* Dark Mode Ambient Glow (Class Theme Color) */}
      <div style={{ 
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", 
        width: "90%", height: "45%", 
        background: `radial-gradient(ellipse, ${currentThemeColor}2a 0%, transparent 70%)`, 
        filter: "blur(90px)", 
        opacity: isDarkMode ? 1 : 0,
        transition: "opacity 0.4s ease-in-out", 
        pointerEvents: "none",
        zIndex: 1
      }} />

      {/* Theme Toggle (Right) */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{ position: "absolute", top: "20px", right: "20px", zIndex: 9999, background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)", border: `1px solid ${cardBorder}`, borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
        title="Toggle Light/Dark Theme"
      >
        {isDarkMode ? "🌙" : "☀️"}
      </button>

      {/* Music Toggle (Right) */}
      <button 
        onClick={() => {
          sound.playClockTick();
          const nextMuted = !isMusicMuted;
          setIsMusicMuted(nextMuted);
          localStorage.setItem("kaevrix_music_muted", String(nextMuted));
        }}
        style={{ position: "absolute", top: "20px", right: "70px", zIndex: 9999, background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)", border: `1px solid ${cardBorder}`, borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
        title={isMusicMuted ? "Unmute Ambient Music" : "Mute Ambient Music"}
      >
        {isMusicMuted ? "🔇" : "🔊"}
      </button>

      {/* Soundscape Console Container */}
      <div style={{ position: "absolute", top: "20px", right: "120px", zIndex: 9999, display: "flex", gap: "8px", alignItems: "center" }}>
        <button 
          onClick={() => { sound.playClockTick(); setShowMusicSettings(!showMusicSettings); }}
          style={{ background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)", border: `1px solid ${cardBorder}`, borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
          title="Soundscape Console"
        >
          🎵
        </button>

        {showMusicSettings && (
          <div style={{
            position: "absolute", top: "50px", right: 0, zIndex: 10000,
            width: "280px", background: isDarkMode ? "#111827" : "#ffffff",
            border: "1px solid var(--neon-orange)", borderRadius: "16px",
            padding: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column", gap: "12px",
            fontFamily: "var(--font-sans)",
            color: textColor
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: "8px" }}>
              <span style={{ fontFamily: "var(--font-gamer)", fontSize: "12px", fontWeight: "900", color: "var(--neon-orange)", letterSpacing: "1px" }}>SOUNDSCAPE CONSOLE</span>
              <button 
                onClick={() => { sound.playClockTick(); setShowMusicSettings(false); }}
                style={{ background: "transparent", border: "none", color: textMuted, cursor: "pointer", fontSize: "14px" }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: "bold", color: textMuted, letterSpacing: "0.5px" }}>SELECT STATION:</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "150px", overflowY: "auto", paddingRight: "4px" }}>
                {sound.MUSIC_PROFILES.map((p, idx) => {
                  const isActive = musicProfile === idx;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        sound.playClockTick();
                        setMusicProfile(idx);
                        localStorage.setItem("kaevrix_music_profile", String(idx));
                      }}
                      style={{
                        textAlign: "left", padding: "8px 12px", borderRadius: "8px",
                        background: isActive ? "var(--accent-gradient)" : "transparent",
                        border: `1px solid ${isActive ? "transparent" : "var(--glass-border)"}`,
                        color: isActive ? "#ffffff" : textColor,
                        cursor: "pointer", fontSize: "12px", transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>{p.name}</div>
                      <div style={{ fontSize: "10px", opacity: isActive ? 0.9 : 0.6, marginTop: "2px" }}>{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--glass-border)", paddingTop: "10px", marginTop: "4px" }}>
              <input
                type="checkbox"
                id="keepMusicInGameWelcome"
                checked={keepMusicInGame}
                onChange={(e) => {
                  sound.playClockTick();
                  const val = e.target.checked;
                  setKeepMusicInGame(val);
                  localStorage.setItem("kaevrix_music_in_game", String(val));
                }}
                style={{ cursor: "pointer", accentColor: "var(--neon-orange)" }}
              />
              <label htmlFor="keepMusicInGameWelcome" style={{ fontSize: "11px", fontWeight: "600", color: textColor, cursor: "pointer" }}>
                Keep playing during matches
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Dimensional Style Switcher (Left) */}
      <button 
        onClick={handleTogglePortalStyle}
        className="dimensional-switch-btn"
        style={{ 
          position: "absolute", top: "20px", left: "20px", zIndex: 9999, 
          background: isDarkMode ? "rgba(255,106,0,0.12)" : "rgba(255, 255, 255, 0.9)", 
          border: `2px solid ${currentThemeColor}`, 
          color: textColor, display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"
        }}
      >
        <span className={`dimensional-switch-indicator ${portalStyle === "workspace" ? "workspace-active" : "retro-active"}`} />
        <span style={{ fontFamily: "var(--font-gamer)", fontSize: "11px", fontWeight: "900", letterSpacing: "1px" }}>
          SWITCH PORTAL DESIGN: <span style={{ color: currentThemeColor }}>{portalStyle === "workspace" ? "WORKSPACE" : "RETRO ARCADE"}</span>
        </span>
      </button>

      {/* STYLE 1: WORKSPACE — TRUE GAME INTERFACE */}
      {portalStyle === "workspace" && signUpStep === 3 && (
        /* STEP 3 - NEURAL TERMINAL BOOTING (FULL SCREEN) */
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 10 }}>
          <div style={{
            width: "100%", maxWidth: "600px", borderRadius: "20px",
            background: "#000000eb", border: `2.5px solid ${currentThemeColor}`,
            boxShadow: `0 0 45px ${currentThemeColor}44, inset 0 0 25px ${currentThemeColor}22`,
            padding: "40px", minHeight: "280px",
            fontFamily: "'Courier New', Courier, monospace"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: `1px solid ${currentThemeColor}55`, paddingBottom: "12px", marginBottom: "18px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ color: currentThemeColor, fontSize: "11px", fontWeight: "bold", marginLeft: "10px", letterSpacing: "1.5px" }}>KAEVRIX_ARENA_LOADER_v2.5.bin</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {terminalLogs.map((log, lIdx) => {
                if (!log || typeof log !== "string") return null;
                const isLast = lIdx === terminalLogs.length - 1;
                const isSuccess = log.includes("SUCCESS") || log.includes("SECURE") || log.includes("LOGGED") || log.includes("ACTIVE");
                return (
                  <div key={lIdx} style={{ 
                    fontSize: "13px", 
                    color: isLast ? "#10b981" : (isSuccess ? "#34d399" : `${currentThemeColor}dd`), 
                    fontWeight: isLast ? "800" : "500",
                    whiteSpace: "nowrap", overflow: "hidden",
                    borderRight: isLast ? "2px solid #10b981" : "none",
                    animation: isLast ? "caretBlink 0.8s steps(2, start) infinite" : "none"
                  }}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {portalStyle === "workspace" && signUpStep !== 3 && (
        /* GAME INTERFACE: FULL-SCREEN SPLIT */
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: window.innerWidth < 900 ? "column" : "row",
          position: "relative",
          zIndex: 10,
          minHeight: 0,
        }}>

          {/* ══════════════════════════════════════════════
              LEFT PANEL — GAME MENU + AUTH FORMS
          ══════════════════════════════════════════════ */}
          <div style={{
            flex: "0 0 48%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 60px 60px 80px",
            position: "relative",
            zIndex: 2,
          }}>
            {/* Kaevrix wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <img src="/logo.png" alt="Kaevrix" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
              <span style={{
                fontFamily: "var(--font-gamer)", fontSize: "22px", fontWeight: "900",
                letterSpacing: "4px", color: textColor,
                textShadow: isDarkMode ? `0 0 20px ${currentThemeColor}88` : "none"
              }}>KAEVRIX</span>
            </div>
            <div style={{ fontSize: "10px", fontWeight: "800", color: "#ff6a00", letterSpacing: "5px", textTransform: "uppercase", marginBottom: "40px" }}>
              Watch · Quiz · Compete · Ascend
            </div>

            {/* ─── MAIN MENU (no form open) ─── */}
            {authMode === "menu" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: textMuted, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px" }}>
                  — Select Mode —
                </div>

                {[
                  {
                    id: "continue",
                    icon: "▶",
                    label: "CONTINUE",
                    sub: "Sign In — Resume Your Journey",
                    action: () => { sound.playClockTick(); setAuthMode("signin"); }
                  },
                  {
                    id: "newgame",
                    icon: "+",
                    label: "NEW GAME",
                    sub: "Sign Up — Create Your Legend",
                    action: () => { sound.playClockTick(); setAuthMode("signup"); setSignUpStep(1); }
                  },
                  {
                    id: "darkmode",
                    icon: isDarkMode ? "🌙" : "☀️",
                    label: isDarkMode ? "DARK MODE" : "LIGHT MODE",
                    sub: "Toggle visual filter",
                    action: () => { sound.playClockTick(); setIsDarkMode(!isDarkMode); }
                  },
                  {
                    id: "music",
                    icon: isMusicMuted ? "🔇" : "🔊",
                    label: isMusicMuted ? "SOUNDTRACK: MUTED" : `SOUNDTRACK: ${sound.MUSIC_PROFILES[musicProfile].name.toUpperCase()}`,
                    sub: isMusicMuted ? "Click to play Lofi Study" : `Play next: ${musicProfile === 5 ? "Muted" : sound.MUSIC_PROFILES[musicProfile + 1].name}`,
                    action: cycleMusicProfile
                  }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => { sound.playClockTick(true); setHoveredButtonId(item.id); }}
                    onMouseLeave={() => setHoveredButtonId(null)}
                    style={{
                      textAlign: "left",
                      background: hoveredButtonId === item.id
                        ? isDarkMode ? `rgba(255,106,0,0.12)` : `rgba(255,106,0,0.08)`
                        : "transparent",
                      border: `2px solid ${hoveredButtonId === item.id ? currentThemeColor : (isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)")}`,
                      borderRadius: "16px",
                      padding: "18px 24px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "18px",
                      transition: "all 0.2s ease",
                      transform: hoveredButtonId === item.id ? "translateX(8px)" : "translateX(0)",
                      boxShadow: hoveredButtonId === item.id ? `0 0 20px ${currentThemeColor}22` : "none",
                    }}
                  >
                    <span style={{
                      width: "40px", height: "40px", borderRadius: "12px",
                      background: hoveredButtonId === item.id ? currentThemeColor : (isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "18px", fontWeight: "900", flexShrink: 0,
                      fontFamily: "var(--font-gamer)",
                      color: hoveredButtonId === item.id ? "#fff" : currentThemeColor,
                      transition: "all 0.2s",
                    }}>{item.icon}</span>
                    <div>
                      <div style={{
                        fontFamily: "var(--font-gamer)", fontSize: "20px", fontWeight: "900",
                        letterSpacing: "3px", color: hoveredButtonId === item.id ? currentThemeColor : textColor,
                        transition: "color 0.2s",
                      }}>{item.label}</div>
                      <div style={{ fontSize: "11px", color: textMuted, fontWeight: "600", letterSpacing: "1px", marginTop: "3px" }}>{item.sub}</div>
                    </div>
                  </button>
                ))}

                <div style={{ marginTop: "24px", borderTop: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, paddingTop: "20px" }}>
                  <div style={{ fontSize: "10px", color: textMuted, letterSpacing: "2px", textTransform: "uppercase", fontWeight: "700" }}>
                    Ranked Arena · Class-Based Combat · Real-Time Duels
                  </div>
                </div>
              </div>
            )}

            {/* ─── SIGN IN FORM ─── */}
            {authMode === "signin" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                <button
                  onClick={() => { sound.playClockTick(); setAuthMode("menu"); setLoginUsername(""); setLoginPassword(""); setLoginError(""); }}
                  style={{ background: "transparent", border: "none", color: textMuted, cursor: "pointer", fontSize: "12px", fontWeight: "700", textAlign: "left", padding: "0 0 20px 0", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  ← BACK TO MAIN MENU
                </button>

                <div style={{ marginBottom: "28px" }}>
                  <div style={{ fontFamily: "var(--font-gamer)", fontSize: "28px", fontWeight: "900", letterSpacing: "3px", color: textColor, textTransform: "uppercase" }}>
                    CONTINUE
                  </div>
                  <div style={{ fontSize: "12px", color: textMuted, marginTop: "4px", letterSpacing: "1px" }}>
                    Enter credentials to resume your campaign
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {loginError && (
                    <div style={{
                      background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.25)",
                      color: "#ef4444", padding: "12px 16px", borderRadius: "12px", fontSize: "13px",
                      fontWeight: "700", display: "flex", alignItems: "center", gap: "8px"
                    }}>
                      🚨 <span>{loginError}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: labelColor, letterSpacing: "1px", textTransform: "uppercase" }}>Gamer Tag</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", opacity: 0.5 }}>👤</span>
                      <input
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Your tag..."
                        required
                        maxLength={15}
                        style={{
                          width: "100%", background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                          border: `1.5px solid ${recognizedClass ? currentThemeColor : (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)")}`,
                          color: textColor, padding: "15px 20px 15px 46px", borderRadius: "14px",
                          fontSize: "15px", fontWeight: "700", outline: "none", transition: "all 0.25s",
                          boxSizing: "border-box"
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = currentThemeColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${currentThemeColor}18`; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = recognizedClass ? currentThemeColor : (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"); e.currentTarget.style.boxShadow = "none"; }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: labelColor, letterSpacing: "1px", textTransform: "uppercase" }}>Passkey</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", opacity: 0.5 }}>🔑</span>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{
                          width: "100%", background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                          border: `1.5px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`,
                          color: textColor, padding: "15px 20px 15px 46px", borderRadius: "14px",
                          fontSize: "15px", fontWeight: "700", outline: "none", transition: "all 0.25s",
                          boxSizing: "border-box"
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = currentThemeColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${currentThemeColor}18`; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    style={{
                      background: `linear-gradient(135deg, ${currentThemeColor} 0%, #ff8c00 100%)`,
                      border: "none", borderRadius: "14px", padding: "17px 20px",
                      color: "#fff", fontSize: "15px", fontWeight: "900", letterSpacing: "2px",
                      textTransform: "uppercase", cursor: isLoggingIn ? "not-allowed" : "pointer",
                      boxShadow: `0 8px 30px ${currentThemeColor}40`,
                      transition: "all 0.25s", marginTop: "8px",
                      opacity: isLoggingIn ? 0.7 : 1,
                    }}
                    onMouseOver={(e) => { if (!isLoggingIn) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 35px ${currentThemeColor}55`; } }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 8px 30px ${currentThemeColor}40`; }}
                  >
                    {isLoggingIn ? "CONNECTING..." : "▶  ENTER ARENA"}
                  </button>

                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "12px", color: textMuted }}>No account? </span>
                    <button
                      type="button"
                      onClick={() => { sound.playClockTick(); setAuthMode("signup"); setSignUpStep(1); }}
                      style={{ background: "transparent", border: "none", color: currentThemeColor, fontWeight: "800", cursor: "pointer", fontSize: "12px", padding: 0 }}
                    >
                      Start New Campaign →
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ─── SIGN UP STEP 1 — SELECT CLASS ─── */}
            {authMode === "signup" && signUpStep === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                <button
                  onClick={() => { sound.playClockTick(); setAuthMode("menu"); }}
                  style={{ background: "transparent", border: "none", color: textMuted, cursor: "pointer", fontSize: "12px", fontWeight: "700", textAlign: "left", padding: "0 0 20px 0", letterSpacing: "1px" }}
                >
                  ← BACK
                </button>

                <div style={{ marginBottom: "22px" }}>
                  <div style={{ fontFamily: "var(--font-gamer)", fontSize: "24px", fontWeight: "900", letterSpacing: "3px", color: textColor }}>
                    CHOOSE CLASS
                  </div>
                  <div style={{ fontSize: "12px", color: textMuted, marginTop: "4px" }}>Select your battle archetype</div>
                </div>

                {/* Class pill tabs */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
                  {enhancedClasses.map(c => {
                    const isChosen = selectedClassId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => { sound.playClockTick(); setSelectedClassId(c.id); }}
                        style={{
                          padding: "7px 14px", borderRadius: "20px",
                          background: isChosen ? c.themeColor : "transparent",
                          border: `1.5px solid ${isChosen ? c.themeColor : (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")}`,
                          color: isChosen ? "#fff" : textMuted, fontSize: "11px", fontWeight: "800",
                          cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.5px"
                        }}
                      >
                        {c.icon} {c.name.split("The ")[1] || c.name}
                      </button>
                    );
                  })}
                </div>

                {/* Active class info */}
                <div style={{
                  background: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  border: `1.5px solid ${currentThemeColor}33`,
                  borderRadius: "16px", padding: "18px", marginBottom: "20px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "22px" }}>{activeClass.icon}</span>
                    <div style={{ fontFamily: "var(--font-gamer)", fontSize: "16px", fontWeight: "900", color: currentThemeColor, letterSpacing: "1.5px" }}>{activeClass.name}</div>
                  </div>
                  <div style={{ fontSize: "12px", color: textMuted, lineHeight: "1.6" }}>{activeClass.description}</div>
                  <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                    {[
                      { label: "FOCUS", value: classStats.focus },
                      { label: "SPEED", value: classStats.speed },
                      { label: "CHAOS", value: classStats.chaos },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "900", color: currentThemeColor, fontFamily: "var(--font-gamer)" }}>{s.value}</div>
                        <div style={{ fontSize: "9px", color: textMuted, fontWeight: "700", letterSpacing: "1px" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { sound.playClockTick(); setSignUpStep(2); }}
                  style={{
                    background: `linear-gradient(135deg, ${currentThemeColor} 0%, #ff8c00 100%)`,
                    border: "none", borderRadius: "14px", padding: "17px 20px",
                    color: "#fff", fontSize: "15px", fontWeight: "900", letterSpacing: "2px",
                    textTransform: "uppercase", cursor: "pointer",
                    boxShadow: `0 8px 30px ${currentThemeColor}40`, transition: "all 0.25s",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = "none"; }}
                >
                  ▶  CONFIRM ARCHETYPE
                </button>

                <div style={{ textAlign: "center", marginTop: "14px" }}>
                  <span style={{ fontSize: "12px", color: textMuted }}>Already registered? </span>
                  <button type="button" onClick={() => { sound.playClockTick(); setAuthMode("signin"); }} style={{ background: "transparent", border: "none", color: currentThemeColor, fontWeight: "800", cursor: "pointer", fontSize: "12px", padding: 0 }}>
                    Sign In →
                  </button>
                </div>
              </div>
            )}

            {/* ─── SIGN UP STEP 2 — CREDENTIALS ─── */}
            {authMode === "signup" && signUpStep === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                <button
                  onClick={() => { sound.playClockTick(); setSignUpStep(1); }}
                  style={{ background: "transparent", border: "none", color: textMuted, cursor: "pointer", fontSize: "12px", fontWeight: "700", textAlign: "left", padding: "0 0 20px 0", letterSpacing: "1px" }}
                >
                  ← BACK TO CLASS SELECT
                </button>

                <div style={{ marginBottom: "22px" }}>
                  <div style={{ fontFamily: "var(--font-gamer)", fontSize: "24px", fontWeight: "900", letterSpacing: "3px", color: textColor }}>
                    NEW GAME
                  </div>
                  <div style={{ fontSize: "12px", color: textMuted, marginTop: "4px" }}>Set your gamer tag and passkey to begin</div>
                </div>

                <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {signUpError && (
                    <div style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.25)", color: "#ef4444", padding: "12px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: "700" }}>
                      🚨 {signUpError}
                    </div>
                  )}

                  {/* Avatar row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", background: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1.5px solid ${currentThemeColor}22`, borderRadius: "14px", padding: "14px 18px" }}>
                    <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: isDarkMode ? "#0f172a" : "#fff", border: `2px solid ${currentThemeColor}`, overflow: "hidden", flexShrink: 0 }}>
                      <img src={avatar} alt="Avatar" className={isGlitching ? "glitch-active" : ""} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: textMuted, fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>Identity Matrix</div>
                      <button type="button" onClick={handleShuffleAvatar} style={{ border: "none", background: "transparent", color: currentThemeColor, padding: 0, fontSize: "12px", fontWeight: "800", cursor: "pointer", marginTop: "2px" }}>
                        🎲 Re-Roll Avatar
                      </button>
                    </div>
                    <div style={{ marginLeft: "auto", background: `${currentThemeColor}22`, borderRadius: "8px", padding: "4px 10px", fontSize: "10px", color: currentThemeColor, fontWeight: "800", letterSpacing: "1px" }}>
                      {activeClass.icon} {activeClass.name.split("The ")[1] || activeClass.name}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: labelColor, letterSpacing: "1px", textTransform: "uppercase" }}>Gamer Tag</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", opacity: 0.5 }}>👤</span>
                      <input
                        type="text"
                        value={signUpUsername}
                        onChange={(e) => setSignUpUsername(e.target.value)}
                        placeholder="Choose a unique tag..."
                        required
                        maxLength={15}
                        style={{
                          width: "100%", background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                          border: `1.5px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`,
                          color: textColor, padding: "15px 20px 15px 46px", borderRadius: "14px",
                          fontSize: "15px", fontWeight: "700", outline: "none", transition: "all 0.25s", boxSizing: "border-box"
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = currentThemeColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${currentThemeColor}18`; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: labelColor, letterSpacing: "1px", textTransform: "uppercase" }}>Passkey</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", opacity: 0.5 }}>🔑</span>
                      <input
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="•••••••• (Min 4 chars)"
                        required
                        minLength={4}
                        style={{
                          width: "100%", background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                          border: `1.5px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`,
                          color: textColor, padding: "15px 20px 15px 46px", borderRadius: "14px",
                          fontSize: "15px", fontWeight: "700", outline: "none", transition: "all 0.25s", boxSizing: "border-box"
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = currentThemeColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${currentThemeColor}18`; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    style={{
                      background: `linear-gradient(135deg, ${currentThemeColor} 0%, #ff8c00 100%)`,
                      border: "none", borderRadius: "14px", padding: "17px 20px",
                      color: "#fff", fontSize: "15px", fontWeight: "900", letterSpacing: "2px",
                      textTransform: "uppercase", cursor: isRegistering ? "not-allowed" : "pointer",
                      boxShadow: `0 8px 30px ${currentThemeColor}40`,
                      transition: "all 0.25s", marginTop: "4px",
                      opacity: isRegistering ? 0.7 : 1,
                    }}
                    onMouseOver={(e) => { if (!isRegistering) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 35px ${currentThemeColor}55`; } }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 8px 30px ${currentThemeColor}40`; }}
                  >
                    {isRegistering ? "CREATING..." : "▶  START NEW CAMPAIGN"}
                  </button>

                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "12px", color: textMuted }}>Already registered? </span>
                    <button type="button" onClick={() => { sound.playClockTick(); setAuthMode("signin"); }} style={{ background: "transparent", border: "none", color: currentThemeColor, fontWeight: "800", cursor: "pointer", fontSize: "12px", padding: 0 }}>
                      Continue Saved Game →
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

          {/* ══════════════════════════════════════════════
              RIGHT PANEL — GAME CHARACTER SHOWCASE
          ══════════════════════════════════════════════ */}
          <div style={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
            {/* Light Mode Panel Background */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at center, rgba(255,106,0,0.07) 0%, transparent 65%)",
              opacity: isDarkMode ? 0 : 1,
              transition: "opacity 0.4s ease-in-out",
              pointerEvents: "none",
              zIndex: 0,
            }} />

            {/* Dark Mode Panel Background */}
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at center, ${currentThemeColor}0f 0%, transparent 65%)`,
              opacity: isDarkMode ? 1 : 0,
              transition: "opacity 0.4s ease-in-out",
              pointerEvents: "none",
              zIndex: 0,
            }} />

            {/* Decorative background orb (Light Mode) */}
            <div style={{
              position: "absolute",
              width: "420px", height: "420px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,106,0,0.07) 0%, transparent 70%)",
              filter: "blur(50px)",
              opacity: isDarkMode ? 0 : 1,
              transition: "opacity 0.4s ease-in-out",
              pointerEvents: "none",
              zIndex: 1,
            }} />

            {/* Decorative background orb (Dark Mode) */}
            <div style={{
              position: "absolute",
              width: "420px", height: "420px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${currentThemeColor}12 0%, transparent 70%)`,
              filter: "blur(50px)",
              opacity: isDarkMode ? 1 : 0,
              transition: "opacity 0.4s ease-in-out",
              pointerEvents: "none",
              zIndex: 1,
            }} />

            {/* Concentric ring decorations */}
            <div style={{
              position: "absolute",
              width: "380px", height: "380px",
              borderRadius: "50%",
              border: `1px solid ${ambientGlowColor}${isDarkMode ? "18" : "22"}`,
              animation: "portalOrbitalSpin 30s linear infinite",
              pointerEvents: "none",
              transition: "border-color 0.4s ease-in-out",
              zIndex: 2,
            }} />
            <div style={{
              position: "absolute",
              width: "280px", height: "280px",
              borderRadius: "50%",
              border: `1px dashed ${ambientGlowColor}${isDarkMode ? "22" : "18"}`,
              animation: "portalOrbitalSpin 20s linear infinite reverse",
              pointerEvents: "none",
              transition: "border-color 0.4s ease-in-out",
              zIndex: 2,
            }} />

            {/* Glowing projector pad at the bottom (Light Mode) */}
            <div style={{
              position: "absolute",
              bottom: "120px",
              width: "220px", height: "28px",
              background: "radial-gradient(ellipse, rgba(255,106,0,0.35) 0%, transparent 75%)",
              borderRadius: "50%",
              filter: "blur(8px)",
              opacity: isDarkMode ? 0 : 1,
              transition: "opacity 0.4s ease-in-out",
              pointerEvents: "none",
              zIndex: 2,
            }} />

            {/* Glowing projector pad at the bottom (Dark Mode) */}
            <div style={{
              position: "absolute",
              bottom: "120px",
              width: "220px", height: "28px",
              background: `radial-gradient(ellipse, ${currentThemeColor}99 0%, transparent 75%)`,
              borderRadius: "50%",
              filter: "blur(8px)",
              opacity: isDarkMode ? 1 : 0,
              transition: "opacity 0.4s ease-in-out",
              pointerEvents: "none",
              zIndex: 2,
            }} />

            {/* Light cone (Light Mode) */}
            <div style={{
              position: "absolute",
              bottom: "120px",
              width: "240px", height: "340px",
              background: "linear-gradient(to top, rgba(255,106,0,0.11) 0%, transparent 75%)",
              clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
              opacity: isDarkMode ? 0 : 1,
              transition: "opacity 0.4s ease-in-out",
              pointerEvents: "none",
              zIndex: 2,
            }} />

            {/* Light cone (Dark Mode) */}
            <div style={{
              position: "absolute",
              bottom: "120px",
              width: "240px", height: "340px",
              background: `linear-gradient(to top, ${currentThemeColor}25 0%, transparent 75%)`,
              clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
              opacity: isDarkMode ? 1 : 0,
              transition: "opacity 0.4s ease-in-out",
              pointerEvents: "none",
              zIndex: 2,
            }} />

            {/* Breathing character avatar */}
            <div className="retro-breathing-character" style={{
              position: "relative",
              zIndex: 3,
              width: "260px", height: "260px",
              filter: `drop-shadow(0 0 40px ${ambientGlowColor}${isDarkMode ? "bb" : "88"})`,
              transition: "filter 0.4s ease",
              marginBottom: "20px",
            }}>
              <img
                src={authMode === "signin" && recognizedAvatar ? recognizedAvatar : avatar}
                alt="Arena character"
                className={isGlitching ? "glitch-active" : ""}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>

            {/* Class badge under character */}
            <div style={{
              position: "relative", zIndex: 4,
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
            }}>
              <div style={{
                background: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.85)",
                border: `1.5px solid ${ambientGlowColor}`,
                borderRadius: "30px", padding: "8px 20px",
                display: "flex", alignItems: "center", gap: "8px",
                backdropFilter: "blur(12px)",
                boxShadow: `0 0 20px ${ambientGlowColor}33`,
              }}>
                <span style={{ fontSize: "16px" }}>{activeClass.icon}</span>
                <span style={{
                  fontFamily: "var(--font-gamer)", fontSize: "14px", fontWeight: "900",
                  letterSpacing: "2px", color: ambientGlowColor, textTransform: "uppercase"
                }}>{activeClass.name}</span>
              </div>
              <div style={{ fontSize: "10px", color: "#10b981", fontWeight: "800", letterSpacing: "2px", textTransform: "uppercase" }}>
                ● SYSTEM ONLINE
              </div>
            </div>

            {/* Stats mini display top-right corner */}
            <div style={{
              position: "absolute", top: "30px", right: "30px",
              display: "flex", flexDirection: "column", gap: "8px",
              opacity: 0.6,
              pointerEvents: "none",
            }}>
              {[
                { label: "FOCUS", value: classStats.focus },
                { label: "SPEED", value: classStats.speed },
                { label: "CHAOS", value: classStats.chaos },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "9px", color: textMuted, fontWeight: "800", letterSpacing: "1px", width: "40px" }}>{s.label}</span>
                  <div style={{ width: "70px", height: "4px", background: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(255,106,0,0.12)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${s.value}%`, height: "100%", background: ambientGlowColor, borderRadius: "2px", transition: "width 0.4s ease" }} />
                  </div>
                  <span style={{ fontSize: "9px", color: ambientGlowColor, fontWeight: "800" }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Kaevrix watermark + tagline bottom left */}
            <div style={{
              position: "absolute", bottom: "30px", left: "30px",
              opacity: 0.35, pointerEvents: "none",
              fontFamily: "'Courier New', monospace", fontSize: "9px",
              color: textColor, lineHeight: "1.6"
            }}>
              <div>SYS: ONLINE</div>
              <div>ARENA: READY</div>
              <div>v2.5 // KAEVRIX</div>
            </div>

          </div>

        </div>
      )}

      {/* STYLE 2: RETRO ARCADE GAME HOME PAGE LAYOUT */}
      {/* STYLE 2: RETRO ARCADE GAME HOME PAGE LAYOUT */}
      {portalStyle === "retro-game" && (
        <div className="retro-crt-screen retro-flicker" style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: isDarkMode ? "#070913" : "#fff7ed",
          border: `8px double ${currentThemeColor}`,
          padding: "35px 50px",
          boxShadow: isDarkMode 
            ? `inset 0 0 100px rgba(0,0,0,0.95), 0 0 60px ${currentThemeColor}33`
            : `inset 0 0 100px rgba(255,247,237,0.1), 0 0 30px rgba(255,106,0,0.15)`,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          zIndex: 9998,
          fontFamily: "var(--font-gamer)",
          color: textColor,
          boxSizing: "border-box",
          overflow: "hidden",
          transition: "background 0.4s ease-in-out, color 0.4s ease-in-out"
        }}>
          
          {/* Top Bar Game Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `3px double ${currentThemeColor}66`, paddingBottom: "15px", marginBottom: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <img src="/logo.png" alt="Kaevrix Logo" style={{ width: "48px", height: "48px", objectFit: "contain", filter: `drop-shadow(0 0 8px ${currentThemeColor})` }} />
              <div>
                <div style={{ fontSize: "30px", fontWeight: "900", letterSpacing: "4px", color: textColor, textShadow: isDarkMode ? `0 0 8px ${currentThemeColor}bb` : "none" }}>KAEVRIX</div>
                <div style={{ fontSize: "11px", color: "#ff6a00", letterSpacing: "3px", fontWeight: "bold", textTransform: "uppercase" }}>Synchronized Watch-&-Quiz Duel</div>
              </div>
            </div>
            
            <div style={{ textAlign: "right", fontFamily: "var(--font-gamer)" }}>
              <div style={{ fontSize: "12px", color: currentThemeColor, fontWeight: "900", letterSpacing: "1.5px" }}>SYS_STATUS: ONLINE</div>
              <div style={{ fontSize: "10px", color: textMuted, letterSpacing: "1px" }}>INSERT COIN / FREE PLAY</div>
            </div>
          </div>

          {/* Body columns */}
          <div style={{ flex: 1, display: "flex", gap: "50px", alignItems: "center", flexDirection: window.innerWidth < 768 ? "column" : "row", overflow: "hidden", padding: "10px 0" }}>
            
            {/* Left projection pad (holographic character) */}
            {signUpStep !== 3 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", minHeight: "360px" }}>
                
                {/* Glowing projector pad */}
                <div style={{ 
                  width: "200px", height: "24px", 
                  background: `radial-gradient(ellipse, ${currentThemeColor} 0%, transparent 75%)`, 
                  borderRadius: "50%", filter: `drop-shadow(0 0 12px ${currentThemeColor})`, 
                  position: "absolute", bottom: "30px", zIndex: 1 
                }} />
                
                {/* Conical light cone projector */}
                <div style={{ 
                  width: "220px", height: "300px", 
                  background: `linear-gradient(to top, ${currentThemeColor}2e 0%, transparent 80%)`, 
                  clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)", 
                  position: "absolute", bottom: "38px", zIndex: 2, pointerEvents: "none" 
                }} />

                {/* Projecting Avatar with breathing idle animation */}
                <div className="retro-breathing-character" style={{ 
                  position: "absolute", bottom: "50px", zIndex: 3, 
                  width: "220px", height: "220px", 
                  filter: `drop-shadow(0 0 25px ${currentThemeColor}dd)` 
                }}>
                  <img 
                    src={avatar} 
                    alt="Projection character" 
                    className={isGlitching ? "glitch-active" : ""}
                    style={{ width: "100%", height: "100%", objectFit: "contain", transform: "scale(1.08)" }} 
                  />
                </div>

                {/* Floating dialog prompt bubble */}
                <div style={{
                  position: "absolute", top: "15px", 
                  background: isDarkMode ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.9)",
                  border: `2px solid ${currentThemeColor}`, borderRadius: "10px",
                  padding: "10px 16px", fontSize: "12px", fontFamily: "var(--font-gamer)",
                  letterSpacing: "1.5px", color: textColor, zIndex: 4, 
                  boxShadow: isDarkMode ? `0 0 20px ${currentThemeColor}44` : "0 4px 15px rgba(0,0,0,0.08)", 
                  textAlign: "center",
                  transition: "background 0.4s ease-in-out, color 0.4s ease-in-out"
                }}>
                  {signUpStep === 2 ? "READY TO ENROLL..." : (retroShowForm && authMode === "signup" ? "SELECTING ARCHETYPE..." : (recognizedClass ? `${activeClass.name.toUpperCase()} LOADED` : "AWAITING USER KEY..."))}
                </div>

                {/* Character Name Badge */}
                <div style={{ position: "absolute", bottom: "-10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ fontSize: "16px", fontWeight: "900", color: currentThemeColor, letterSpacing: "2.5px", textTransform: "uppercase", textShadow: isDarkMode ? `0 0 8px ${currentThemeColor}66` : "none" }}>
                    {activeClass.name}
                  </div>
                  <div style={{ fontSize: "10px", color: "#10b981", letterSpacing: "2px", fontWeight: "bold" }}>
                    ● STATUS: SYSTEM_ONLINE
                  </div>
                </div>

              </div>
            )}

            {/* Right arcade menu panel */}
            <div style={{ flex: 1.1, display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
              
              {signUpStep === 3 ? (
                /* STEP 3 RETRO TERMINAL LOAD */
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontFamily: "'Courier New', monospace" }}>
                  {terminalLogs.map((log, lIdx) => {
                    if (!log || typeof log !== "string") return null;
                    const isLast = lIdx === terminalLogs.length - 1;
                    const isSuccess = log.includes("SUCCESS") || log.includes("SECURE") || log.includes("LOGGED") || log.includes("ACTIVE");
                    return (
                      <div 
                        key={lIdx} 
                        style={{ 
                          fontSize: "12px", 
                          color: isLast ? "#10b981" : (isSuccess ? "#34d399" : `${currentThemeColor}dd`), 
                          fontWeight: isLast ? "800" : "500",
                          borderRight: isLast ? "2px solid #10b981" : "none",
                          animation: isLast ? "caretBlink 0.8s steps(2, start) infinite" : "none"
                        }}
                      >
                        {log}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* STATE-BASED MENU FOR RETRO ARCADE */
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", height: "100%", justifyContent: "center" }}>
                  
                  {/* MAIN MENU SELECTOR */}
                  {!retroShowForm && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "18px", justifyContent: "center" }}>
                      
                      <div className="retro-arcade-blink" style={{ fontSize: "12px", color: "#ff6a00", fontWeight: "900", fontFamily: "var(--font-gamer)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "5px" }}>
                        ● INSERT COIN OR SELECT START
                      </div>

                      <div style={{ fontSize: "11px", color: textMuted, fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "2px" }}>
                        ▶ Main Campaign Selection
                      </div>

                      {[
                        { id: "continue", label: "CONTINUE PREVIOUS LEVEL [ LOGIN ]", desc: "Access the arena via signed passkey", action: () => { sound.playClockTick(); setAuthMode("signin"); setRetroShowForm(true); } },
                        { id: "newgame", label: "START NEW CAMPAIGN [ SIGN UP ]", desc: "Select battle class and register gamer tag", action: () => { sound.playClockTick(); setAuthMode("signup"); setSignUpStep(1); setRetroShowForm(true); } },
                        { id: "toggle", label: `CALIBRATE GRAPHICS: ${isDarkMode ? "DARK MODE" : "LIGHT MODE"}`, desc: "Toggle interface light/dark filters", action: () => { sound.playClockTick(); setIsDarkMode(!isDarkMode); } },
                        { 
                          id: "music", 
                          label: `AMBIENT SOUNDTRACK: [ ${isMusicMuted ? "MUTED" : sound.MUSIC_PROFILES[musicProfile].name.toUpperCase()} ]`, 
                          desc: "Current active station. Click to cycle / mute", 
                          action: cycleMusicProfile
                        }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => { sound.playClockTick(true); setHoveredButtonId(item.id); }}
                          onMouseLeave={() => setHoveredButtonId(null)}
                          style={{
                            textAlign: "left", 
                            background: hoveredButtonId === item.id 
                              ? `${currentThemeColor}1a` 
                              : (isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)"),
                            border: `2px solid ${hoveredButtonId === item.id ? currentThemeColor : (isDarkMode ? `${currentThemeColor}22` : `${currentThemeColor}44`)}`,
                            borderRadius: "12px",
                            color: hoveredButtonId === item.id ? (isDarkMode ? "#fff" : currentThemeColor) : textColor,
                            fontFamily: "var(--font-gamer)", fontSize: "18px", fontWeight: "900",
                            letterSpacing: "2.5px", cursor: "pointer", display: "flex", flexDirection: "column",
                            gap: "6px", padding: "18px 24px", transition: "all 0.2s ease-out",
                            boxShadow: hoveredButtonId === item.id ? `0 0 20px ${currentThemeColor}33` : "none",
                            transform: hoveredButtonId === item.id ? "scale(1.02)" : "scale(1)"
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {hoveredButtonId === item.id ? "▶" : "  "} {item.label}
                          </span>
                          <span style={{ fontSize: "11px", color: textMuted, fontWeight: "normal", paddingLeft: "18px", letterSpacing: "1px" }}>
                            {item.desc}
                          </span>
                        </button>
                      ))}

                    </div>
                  )}

                  {/* SIGN IN INPUT VIEW */}
                  {retroShowForm && authMode === "signin" && (
                    <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px", justifyContent: "center" }}>
                      
                      <div style={{ fontSize: "11px", color: textMuted, fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "5px" }}>
                        ▶ Credentials Validation
                      </div>

                      {loginError && (
                        <div style={{ color: "#ef4444", fontSize: "12px", fontFamily: "'Courier New', monospace", fontWeight: "bold" }}>
                          ERROR: {loginError.toUpperCase()}
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span style={{ fontSize: "11px", color: currentThemeColor, fontFamily: "var(--font-gamer)", fontWeight: "bold", letterSpacing: "1.5px" }}>GAMER_TAG:</span>
                        <input
                          type="text"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="tag..."
                          required
                          style={{ 
                            background: isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.8)", 
                            border: `2px solid ${currentThemeColor}44`, 
                            borderRadius: "8px", 
                            color: textColor, 
                            padding: "12px 18px", 
                            outline: "none", 
                            fontSize: "16px", 
                            fontFamily: "var(--font-gamer)", 
                            fontWeight: "bold", 
                            letterSpacing: "1.5px",
                            transition: "background 0.4s, color 0.4s"
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = currentThemeColor}
                          onBlur={(e) => e.currentTarget.style.borderColor = `${currentThemeColor}44`}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span style={{ fontSize: "11px", color: currentThemeColor, fontFamily: "var(--font-gamer)", fontWeight: "bold", letterSpacing: "1.5px" }}>PASSKEY_HASH:</span>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          style={{ 
                            background: isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.8)", 
                            border: `2px solid ${currentThemeColor}44`, 
                            borderRadius: "8px", 
                            color: textColor, 
                            padding: "12px 18px", 
                            outline: "none", 
                            fontSize: "16px", 
                            fontFamily: "var(--font-gamer)", 
                            fontWeight: "bold", 
                            letterSpacing: "1.5px",
                            transition: "background 0.4s, color 0.4s"
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = currentThemeColor}
                          onBlur={(e) => e.currentTarget.style.borderColor = `${currentThemeColor}44`}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
                        <button
                          type="submit"
                          disabled={isLoggingIn}
                          style={{
                            background: `linear-gradient(90deg, ${currentThemeColor} 0%, #ff8c00 100%)`, border: `2px solid ${textColor}`, borderRadius: "10px",
                            color: "#fff", fontFamily: "var(--font-gamer)", fontSize: "15px", fontWeight: "900",
                            padding: "16px 20px", cursor: isLoggingIn ? "not-allowed" : "pointer", letterSpacing: "2px",
                            boxShadow: `0 0 25px ${currentThemeColor}44`, textTransform: "uppercase"
                          }}
                        >
                          {isLoggingIn ? "[ LINKING NODE... ]" : "[ SIGN IN & ENTER ARENA ]"}
                        </button>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}>
                          <button
                            type="button"
                            onClick={() => { sound.playClockTick(); setAuthMode("signup"); setSignUpStep(1); setLoginUsername(""); setLoginPassword(""); setLoginError(""); }}
                            style={{ background: "transparent", border: "none", color: currentThemeColor, fontSize: "12px", fontWeight: "bold", cursor: "pointer", fontFamily: "var(--font-gamer)", letterSpacing: "1px" }}
                          >
                            [ NEED AN ACCOUNT? SIGN UP ]
                          </button>
                          <button
                            type="button"
                            onClick={() => { sound.playClockTick(); setLoginUsername(""); setLoginPassword(""); setLoginError(""); setRetroShowForm(false); }}
                            style={{ background: "transparent", border: "none", color: textMuted, fontSize: "12px", fontWeight: "bold", cursor: "pointer", fontFamily: "var(--font-gamer)", letterSpacing: "1px" }}
                          >
                            [ RETURN TO MENU ]
                          </button>
                        </div>
                      </div>

                    </form>
                  )}

                  {/* SIGN UP STEP 1 - SELECT ARCHETYPE */}
                  {retroShowForm && authMode === "signup" && signUpStep === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px", justifyContent: "center" }}>
                      
                      <div style={{ fontSize: "11px", color: textMuted, fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "5px" }}>
                        ▶ SELECT CLASS ARCHETYPE
                      </div>

                      {/* Dropdown list styled like classic RPG list */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto", paddingRight: "6px" }}>
                        {enhancedClasses.map(c => {
                          const isChosen = selectedClassId === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => { sound.playClockTick(); setSelectedClassId(c.id); }}
                              style={{
                                textAlign: "left", background: isChosen ? `${c.themeColor}22` : "transparent",
                                border: `2px solid ${isChosen ? c.themeColor : "transparent"}`,
                                borderRadius: "8px",
                                color: isChosen ? c.themeColor : textColor,
                                fontFamily: "var(--font-gamer)", fontSize: "13px", fontWeight: "900",
                                cursor: "pointer", padding: "8px 16px", letterSpacing: "1.5px"
                              }}
                            >
                              {isChosen ? `▶ ${c.name.toUpperCase()}` : `  ${c.name.toUpperCase()}`}
                            </button>
                          );
                        })}
                      </div>

                      {/* Attribute stats preview inside RPG overlay */}
                      <div style={{ 
                        background: isDarkMode ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.6)", 
                        border: `2px solid ${currentThemeColor}44`, 
                        borderRadius: "10px", 
                        padding: "16px",
                        transition: "background 0.4s"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: currentThemeColor, fontWeight: "900", fontFamily: "var(--font-gamer)", marginBottom: "8px" }}>
                          <span>FOCUS: {classStats.focus}%</span>
                          <span>SPEED: {classStats.speed}%</span>
                          <span>CHAOS: {classStats.chaos}%</span>
                        </div>
                        <div style={{ fontSize: "12px", color: textMuted, lineHeight: "1.5", fontFamily: "var(--font-gamer)" }}>
                          {activeClass.description}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                        <button
                          onClick={() => { sound.playClockTick(); setSignUpStep(2); }}
                          style={{
                            flex: 1, background: `linear-gradient(90deg, ${currentThemeColor} 0%, #ff8c00 100%)`, border: `2px solid ${textColor}`,
                            borderRadius: "10px", color: "#fff", fontFamily: "var(--font-gamer)",
                            fontSize: "14px", fontWeight: "900", padding: "16px 20px", cursor: "pointer", letterSpacing: "2.5px"
                          }}
                        >
                          [ CONFIRM CLASS ARCHETYPE ]
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}>
                        <button
                          onClick={() => { sound.playClockTick(); setAuthMode("signin"); setRetroShowForm(true); }}
                          style={{
                            background: "transparent", border: "none", color: currentThemeColor, fontFamily: "var(--font-gamer)",
                            fontSize: "12px", fontWeight: "900", cursor: "pointer", letterSpacing: "1px"
                          }}
                        >
                          [ HAVE AN ACCOUNT? SIGN IN ]
                        </button>
                        
                        <button
                          onClick={() => { sound.playClockTick(); setRetroShowForm(false); }}
                          style={{
                            background: "transparent", border: "none", color: textMuted, fontFamily: "var(--font-gamer)",
                            fontSize: "12px", fontWeight: "900", cursor: "pointer", letterSpacing: "1px"
                          }}
                        >
                          [ RETURN TO MENU ]
                        </button>
                      </div>

                    </div>
                  )}

                  {/* SIGN UP STEP 2 - DEFINE IDENTIFIER */}
                  {retroShowForm && authMode === "signup" && signUpStep === 2 && (
                    <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center" }}>
                      
                      <div style={{ fontSize: "11px", color: textMuted, fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "5px" }}>
                        ▶ Credentials Initialization
                      </div>

                      {signUpError && (
                        <div style={{ color: "#ef4444", fontSize: "12px", fontFamily: "'Courier New', monospace", fontWeight: "bold" }}>
                          ERROR: {signUpError.toUpperCase()}
                        </div>
                      )}

                      <div style={{ 
                        display: "flex", gap: "12px", alignItems: "center", 
                        background: isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)", 
                        padding: "12px 18px", borderRadius: "8px", border: `2px solid ${cardBorder}`,
                        transition: "background 0.4s"
                      }}>
                        <button 
                          type="button" 
                          onClick={handleShuffleAvatar}
                          style={{ border: "none", background: "transparent", color: currentThemeColor, fontFamily: "var(--font-gamer)", fontSize: "12px", fontWeight: "900", cursor: "pointer", letterSpacing: "1px" }}
                        >
                          🎲 RE-ROLL AVATAR MATRIX
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span style={{ fontSize: "11px", color: currentThemeColor, fontFamily: "var(--font-gamer)", fontWeight: "bold", letterSpacing: "1.5px" }}>ALIAS:</span>
                        <input
                          type="text"
                          value={signUpUsername}
                          onChange={(e) => setSignUpUsername(e.target.value)}
                          placeholder="alias..."
                          required
                          maxLength={15}
                          style={{ 
                            background: isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.8)", 
                            border: `2px solid ${currentThemeColor}44`, 
                            borderRadius: "8px", 
                            color: textColor, 
                            padding: "12px 18px", 
                            outline: "none", 
                            fontSize: "16px", 
                            fontFamily: "var(--font-gamer)", 
                            fontWeight: "bold", 
                            letterSpacing: "1.5px",
                            transition: "background 0.4s, color 0.4s"
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = currentThemeColor}
                          onBlur={(e) => e.currentTarget.style.borderColor = `${currentThemeColor}44`}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span style={{ fontSize: "11px", color: currentThemeColor, fontFamily: "var(--font-gamer)", fontWeight: "bold", letterSpacing: "1.5px" }}>PASSWORD:</span>
                        <input
                          type="password"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={4}
                          style={{ 
                            background: isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.8)", 
                            border: `2px solid ${currentThemeColor}44`, 
                            borderRadius: "8px", 
                            color: textColor, 
                            padding: "12px 18px", 
                            outline: "none", 
                            fontSize: "16px", 
                            fontFamily: "var(--font-gamer)", 
                            fontWeight: "bold", 
                            letterSpacing: "1.5px",
                            transition: "background 0.4s, color 0.4s"
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = currentThemeColor}
                          onBlur={(e) => e.currentTarget.style.borderColor = `${currentThemeColor}44`}
                        />
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                        <button
                          type="button"
                          onClick={() => { sound.playClockTick(); setSignUpStep(1); }}
                          style={{
                            flex: 0.4, border: `2px solid ${cardBorder}`, background: "transparent",
                            borderRadius: "10px", color: textMuted, fontFamily: "var(--font-gamer)",
                            fontSize: "13px", fontWeight: "900", padding: "16px 14px", cursor: "pointer"
                          }}
                        >
                          BACK
                        </button>
                        <button
                          type="submit"
                          disabled={isRegistering}
                          style={{
                            flex: 1, background: `linear-gradient(90deg, ${currentThemeColor} 0%, #ff8c00 100%)`, border: `2px solid ${textColor}`,
                            borderRadius: "10px", color: "#fff", fontFamily: "var(--font-gamer)",
                            fontSize: "14px", fontWeight: "900", padding: "16px 20px", cursor: isRegistering ? "not-allowed" : "pointer", letterSpacing: "1.5px"
                          }}
                        >
                          {isRegistering ? "[ SYNC LOAD... ]" : "[ SIGN UP & REGISTER ]"}
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}>
                        <button
                          onClick={() => { sound.playClockTick(); setAuthMode("signin"); setRetroShowForm(true); }}
                          style={{
                            background: "transparent", border: "none", color: currentThemeColor, fontFamily: "var(--font-gamer)",
                            fontSize: "12px", fontWeight: "900", cursor: "pointer", letterSpacing: "1px"
                          }}
                        >
                          [ HAVE AN ACCOUNT? SIGN IN ]
                        </button>
                        
                        <button
                          onClick={() => { sound.playClockTick(); setRetroShowForm(false); }}
                          style={{
                            background: "transparent", border: "none", color: textMuted, fontFamily: "var(--font-gamer)",
                            fontSize: "12px", fontWeight: "900", cursor: "pointer", letterSpacing: "1px"
                          }}
                        >
                          [ RETURN TO MENU ]
                        </button>
                      </div>

                    </form>
                  )}

                  {/* Scrolling Tips Ticker at bottom of panel */}
                  <div style={{ marginTop: "auto", paddingTop: "10px", borderTop: `2px double ${currentThemeColor}44` }}>
                    <div className="retro-ticker-container" style={{
                      background: isDarkMode ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.7)",
                      border: `1px solid ${isDarkMode ? "rgba(255, 106, 0, 0.15)" : "rgba(255, 106, 0, 0.3)"}`,
                      transition: "background 0.4s"
                    }}>
                      <div className="retro-ticker-text" style={{
                        color: isDarkMode ? "#ff8c00" : "#d97706",
                        transition: "color 0.4s"
                      }}>
                        {RETRO_TIPS[retroTipIdx]}
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}




      <style>{`
        .class-carousel::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
