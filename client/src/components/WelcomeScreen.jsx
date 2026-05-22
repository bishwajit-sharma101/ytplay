import { useState, useEffect, useRef } from "react";
import * as sound from "../utils/audio";
import { CHARACTER_CLASSES } from "../utils/characterClasses";

const getAvatarUrl = (seed) => `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=transparent`;

const CLASS_COLORS = [
  "#a855f7", // Purple
  "#f97316", // Orange
  "#3b82f6", // Blue
  "#ec4899", // Pink
  "#22c55e", // Green
  "#eab308", // Yellow
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
  "#f43f5e"  // Rose
];

const CLASS_ICONS = ["🧠", "⚡", "🛡️", "👾", "🎯", "👁️", "⚔️", "🤖", "🧬", "🎲"];

export default function WelcomeScreen({ username, setUsername, avatar, setAvatar, selectedClass, setSelectedClass, onRegister, isDarkMode, setIsDarkMode }) {
  const classes = Object.values(CHARACTER_CLASSES);
  
  // Assign colors and icons to classes
  const enhancedClasses = classes.map((cls, index) => ({
    ...cls,
    themeColor: CLASS_COLORS[index % CLASS_COLORS.length],
    icon: CLASS_ICONS[index % CLASS_ICONS.length]
  }));

  const [activeClassId, setActiveClassId] = useState(selectedClass || enhancedClasses[0].id);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!selectedClass && typeof setSelectedClass === 'function' && enhancedClasses.length > 0) {
      setSelectedClass(enhancedClasses[0].id);
      setAvatar(getAvatarUrl(enhancedClasses[0].avatarSeed));
    }
  }, []);

  const handleClassSelect = (cls) => {
    sound.playClockTick();
    setActiveClassId(cls.id);
    if (typeof setSelectedClass === 'function') {
      setSelectedClass(cls.id);
    }
    setAvatar(getAvatarUrl(cls.avatarSeed));
  };

  const handleShuffleAvatar = () => {
    sound.playClockTick();
    const newSeed = Math.random().toString(36).substring(7);
    setAvatar(getAvatarUrl(newSeed));
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    if (value.length <= 15) {
      setUsername(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    sound.playClockTick();
    onRegister(username, avatar, activeClassId);
  };

  const activeClass = enhancedClasses.find(c => c.id === activeClassId) || enhancedClasses[0];

  const handleScrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -344, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 344, behavior: 'smooth' });
  };

  const bgColor = isDarkMode ? "radial-gradient(ellipse at top, #111827 0%, #000000 100%)" : "radial-gradient(ellipse at top, #f8fafc 0%, #e2e8f0 100%)";
  const textColor = isDarkMode ? "#ffffff" : "#0f172a";
  const textMuted = isDarkMode ? "#9ca3af" : "#64748b";
  const cardBgBase = isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
  const cardBorder = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)";
  const footerBg = isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";

  return (
    <div className="welcome-aaa-overlay" style={{ 
      background: bgColor, 
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
      display: "flex", flexDirection: "column", 
      overflowY: "auto", overflowX: "hidden", zIndex: 9999,
      fontFamily: "'Inter', sans-serif",
      color: textColor
    }}>
      
      {/* Theme Toggle */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{ position: "absolute", top: "20px", right: "20px", zIndex: 100, background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
      >
        {isDarkMode ? "🌙" : "☀️"}
      </button>

      {/* Background FX */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80%", height: "40%", background: `radial-gradient(ellipse, ${activeClass.themeColor}33 0%, transparent 70%)`, filter: "blur(80px)", transition: "background 0.5s ease", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIvPgo8L3N2Zz4=')", pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ padding: "40px 0 20px", textAlign: "center", position: "relative", zIndex: 10, marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <img src="/logo.png" alt="Kaevrix Logo" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          <span style={{ fontSize: "24px", fontWeight: "900", letterSpacing: "2px", color: textColor, fontFamily: "var(--font-gamer)" }}>Kaevrix</span>
        </div>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#ff6a00", letterSpacing: "4px", marginBottom: "10px", textTransform: "uppercase" }}>
          Welcome To
        </div>
        <h1 style={{ fontSize: "72px", fontWeight: "900", margin: "0 0 10px 0", letterSpacing: "8px", textTransform: "uppercase", background: isDarkMode ? "linear-gradient(to bottom, #ffffff 40%, #9ca3af 100%)" : "linear-gradient(to bottom, #0f172a 40%, #64748b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: isDarkMode ? "0 10px 30px rgba(0,0,0,0.5)" : "none" }}>
          The Arena
        </h1>
        <p style={{ fontSize: "14px", color: textMuted, letterSpacing: "2px", textTransform: "uppercase", fontWeight: "600" }}>
          Choose your class. Define your legacy.
        </p>
      </header>

      {/* Main Content - Class Selection Carousel */}
      <main style={{ flex: 1, position: "relative", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px", minHeight: "600px" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
          <div style={{ height: "1px", width: "100px", background: isDarkMode ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.2))" : "linear-gradient(90deg, transparent, rgba(0,0,0,0.2))" }} />
          <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "3px", color: textMuted }}>CHOOSE YOUR CLASS</span>
          <div style={{ height: "1px", width: "100px", background: isDarkMode ? "linear-gradient(-90deg, transparent, rgba(255,255,255,0.2))" : "linear-gradient(-90deg, transparent, rgba(0,0,0,0.2))" }} />
        </div>

        <div style={{ position: "relative", width: "100%" }}>
          {/* Scroll Left Button */}
          <button 
            onClick={handleScrollLeft}
            style={{ position: "absolute", left: "-20px", top: "50%", transform: "translateY(-50%)", zIndex: 20, width: "50px", height: "50px", borderRadius: "50%", background: isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)", border: `1px solid ${cardBorder}`, color: textColor, fontSize: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
            onMouseOver={(e) => { e.currentTarget.style.background = isDarkMode ? "rgba(255,106,0,0.2)" : "rgba(255,106,0,0.1)"; e.currentTarget.style.borderColor = "#ff6a00"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = cardBorder; }}
          >
            ←
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollRef}
            className="class-carousel"
            style={{ 
              display: "flex", 
              gap: "24px", 
              overflowX: "auto", 
              padding: "20px",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
          >
          {enhancedClasses.map(cls => {
            const isSelected = activeClassId === cls.id;
            const signatureSkill = cls.skills[0];

            return (
              <div 
                key={cls.id}
                onClick={() => handleClassSelect(cls)}
                style={{
                  minWidth: "320px",
                  maxWidth: "320px",
                  height: "480px",
                  borderRadius: "16px",
                  background: isSelected ? `linear-gradient(180deg, ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 0%, ${cls.themeColor}15 100%)` : cardBgBase,
                  border: `1px solid ${isSelected ? cls.themeColor : cardBorder}`,
                  boxShadow: isSelected ? `0 0 30px ${cls.themeColor}33, inset 0 0 20px ${cls.themeColor}22` : (isDarkMode ? "none" : "0 4px 10px rgba(0,0,0,0.05)"),
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isSelected ? "scale(1.02) translateY(-10px)" : "scale(1)",
                  position: "relative",
                  overflow: "hidden",
                  scrollSnapAlign: "center"
                }}
              >
                {/* Glow behind character */}
                <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)", width: "150px", height: "150px", background: cls.themeColor, filter: "blur(60px)", opacity: isSelected ? 0.3 : 0.1, transition: "opacity 0.3s" }} />

                {/* Icon & Title */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px", position: "relative", zIndex: 2 }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: `1px solid ${cls.themeColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "16px", background: isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)", boxShadow: `0 0 15px ${cls.themeColor}44` }}>
                    {cls.icon}
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: isSelected ? cls.themeColor : textColor, margin: 0, textTransform: "uppercase", letterSpacing: "1px", textAlign: "center" }}>
                    {cls.name}
                  </h3>
                </div>

                {/* Character Avatar */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2, marginBottom: "20px" }}>
                   <div style={{ width: "160px", height: "160px", filter: isSelected ? `drop-shadow(0 10px 20px ${cls.themeColor}66)` : (isDarkMode ? "drop-shadow(0 10px 10px rgba(0,0,0,0.5))" : "drop-shadow(0 10px 10px rgba(0,0,0,0.2))"), transition: "all 0.3s" }}>
                     <img src={getAvatarUrl(cls.avatarSeed)} alt={cls.name} style={{ width: "100%", height: "100%", objectFit: "contain", transform: isSelected ? "scale(1.1)" : "scale(1)", transition: "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }} />
                   </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: "13px", color: textMuted, textAlign: "center", lineHeight: "1.5", marginBottom: "24px", position: "relative", zIndex: 2 }}>
                  {cls.description}
                </p>

                {/* Signature Skill Box */}
                <div style={{ background: isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)", border: `1px solid ${cls.themeColor}44`, borderRadius: "12px", padding: "16px", position: "relative", zIndex: 2, marginTop: "auto" }}>
                  <div style={{ fontSize: "10px", color: textMuted, fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", textAlign: "center", marginBottom: "6px" }}>Signature</div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: cls.themeColor, textAlign: "center", marginBottom: "6px", textTransform: "uppercase" }}>{signatureSkill.name}</div>
                  <div style={{ fontSize: "12px", color: textMuted, textAlign: "center", lineHeight: "1.4" }}>{signatureSkill.desc}</div>
                </div>
                
                {isSelected && (
                  <div style={{ position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)", background: cls.themeColor, color: "#fff", fontSize: "10px", fontWeight: "800", padding: "4px 12px", borderTopLeftRadius: "8px", borderTopRightRadius: "8px", letterSpacing: "1px" }}>
                    ★ SELECTED
                  </div>
                )}
              </div>
            );
          })}
          </div>
          
          {/* Scroll Right Button */}
          <button 
            onClick={handleScrollRight}
            style={{ position: "absolute", right: "-20px", top: "50%", transform: "translateY(-50%)", zIndex: 20, width: "50px", height: "50px", borderRadius: "50%", background: isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)", border: `1px solid ${cardBorder}`, color: textColor, fontSize: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
            onMouseOver={(e) => { e.currentTarget.style.background = isDarkMode ? "rgba(255,106,0,0.2)" : "rgba(255,106,0,0.1)"; e.currentTarget.style.borderColor = "#ff6a00"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = cardBorder; }}
          >
            →
          </button>
        </div>
      </main>

      {/* Footer / Action Bar */}
      <footer style={{ background: footerBg, backdropFilter: "blur(20px)", borderTop: `1px solid ${cardBorder}`, padding: "30px 40px", position: "relative", zIndex: 10, marginTop: "auto" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto", flexWrap: "wrap", gap: "20px" }}>
          
          {/* Left: Nickname Input */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: "250px" }}>
            <label style={{ fontSize: "12px", color: textMuted, fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>Initialize Gamer Tag</label>
            <div style={{ position: "relative", maxWidth: "300px" }}>
              <input 
                type="text" 
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter Alias..."
                required
                maxLength={15}
                style={{ width: "100%", background: isDarkMode ? "rgba(255,255,255,0.03)" : "#fff", border: `1px solid #ff6a0066`, color: textColor, padding: "16px 20px", borderRadius: "12px", fontSize: "16px", fontWeight: "700", outline: "none", transition: "all 0.3s", boxShadow: isDarkMode ? "none" : "0 4px 6px rgba(0,0,0,0.05)" }}
                onFocus={(e) => { e.currentTarget.style.background = isDarkMode ? "rgba(255,255,255,0.06)" : "#fff"; e.currentTarget.style.boxShadow = `0 0 20px #ff6a0033`; }}
                onBlur={(e) => { e.currentTarget.style.background = isDarkMode ? "rgba(255,255,255,0.03)" : "#fff"; e.currentTarget.style.boxShadow = isDarkMode ? "none" : "0 4px 6px rgba(0,0,0,0.05)"; }}
              />
              <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: username.length === 15 ? "#ef4444" : textMuted, fontWeight: "700" }}>{username.length}/15</span>
            </div>
          </div>

          {/* Center: Big Play Button */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: "300px" }}>
            <button 
              type="submit"
              style={{ 
                background: "linear-gradient(90deg, #ff6a00 0%, #ff8c00 100%)",
                border: "none",
                borderRadius: "12px",
                padding: "20px 60px",
                color: "#fff",
                fontSize: "20px",
                fontWeight: "900",
                letterSpacing: "3px",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: `0 10px 30px rgba(255,106,0,0.4), inset 0 0 20px rgba(255,255,255,0.3)`,
                transition: "all 0.2s",
                transform: "scale(1)",
                display: "flex",
                alignItems: "center",
                gap: "15px"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              ENTER THE ARENA <span style={{ fontSize: "24px" }}>»</span>
            </button>
          </div>

          {/* Right: Avatar Preview & Shuffle */}
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "20px", minWidth: "250px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: textMuted, fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>Identity Core</span>
              <button 
                type="button"
                onClick={handleShuffleAvatar}
                style={{ background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${cardBorder}`, color: textColor, padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "background 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                onMouseOut={(e) => e.currentTarget.style.background = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
              >
                🎲 RE-ROLL LOOK
              </button>
            </div>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: isDarkMode ? "rgba(0,0,0,0.5)" : "#fff", border: `2px solid #ff6a00`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px rgba(255,106,0,0.4)`, overflow: "hidden" }}>
               <img src={avatar} alt="Current Avatar" style={{ width: "90%", height: "90%", objectFit: "contain" }} />
            </div>
          </div>

        </form>
        
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "25px", fontSize: "11px", fontWeight: "700", color: textMuted, letterSpacing: "3px", textTransform: "uppercase" }}>
          <span>• LEARN</span>
          <span>• COMPETE</span>
          <span>• ASCEND</span>
        </div>
      </footer>

      <style>{`
        .class-carousel::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
