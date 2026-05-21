import { useState, useEffect } from "react";

const STATUS_LOGS = [
  "📡 Contacting matchmaking server nodes...",
  "🔍 Analyzing active queues for video room...",
  "🧬 Filtering players with compatible skill seeds...",
  "👾 Setting up virtual arena variables...",
  "🤖 Synchronizing AI bot fallback parameters...",
  "⚡ Opening localized sub-space tunnels..."
];

export default function Matchmaking({ avatar, selectedVideo, onCancel }) {
  const [logIdx, setLogIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIdx((prev) => (prev + 1) % STATUS_LOGS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="matchmaking-container">
      <div className="radar-spinner">
        {/* Radar Rings Ripple Effect */}
        <div className="radar-ripple-ring ring-1"></div>
        <div className="radar-ripple-ring ring-2"></div>
        <div className="radar-ripple-ring ring-3"></div>
        <div className="radar-scan-line"></div>
        <div className="radar-circle">
          <div className="radar-avatar" style={{overflow: 'hidden', border: 'none'}}>{avatar && avatar.includes('http') ? <img src={avatar} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}}/> : avatar}</div>
        </div>
      </div>
      <div className="matchmaking-status">SEARCHING FOR OPPONENTS</div>
      
      <div className="matchmaking-log-ticker">
        {STATUS_LOGS[logIdx]}
      </div>

      <p className="matchmaking-video-info">
        Duel Video:{" "}
        <span style={{ color: "var(--neon-blue)", fontWeight: "bold" }}>
          {selectedVideo?.title || "Targeting YouTube Link"}
        </span>
      </p>
      <div className="matchmaking-actions">
        <button className="btn-secondary" onClick={onCancel}>
          CANCEL LOOKUP
        </button>
      </div>
    </div>
  );
}
