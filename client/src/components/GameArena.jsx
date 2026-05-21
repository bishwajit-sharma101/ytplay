import YoutubePlayer from "./YoutubePlayer";
import ChatBox from "./ChatBox";
import * as sound from "../utils/audio";
import { getUnlockedSkills } from "../utils/characterClasses";

export default function GameArena({
  room,
  socket,
  username,
  opponent,
  myProgress,
  opponentProgress,
  energy,
  isFrozen,
  isBlurred,
  opponentWaiting,
  chatMessages,
  chatInput,
  setChatInput,
  onSendChat,
  onVideoProgress,
  onVideoFinished,
  onUsePowerup,
  selectedClass,
  level
}) {
  const myUnlockedSkills = getUnlockedSkills(selectedClass || "doomscroller", level || 1);

  const getSkillCost = (skillLevel) => {
    if (skillLevel === 1) return 25;
    if (skillLevel === 10) return 40;
    if (skillLevel === 20) return 60;
    if (skillLevel === 30) return 80;
    return 100; // Level 40 and 50 are max energy
  };

  const handleUsePowerupClick = (skill) => {
    const cost = getSkillCost(skill.level);
    if (energy < cost) return;
    sound.playClockTick(); // Click feedback
    onUsePowerup({ type: skill.name, cost });
  };

  const handleSkipToQuiz = () => {
    sound.playClockTick();
    onVideoFinished(true); // Flag fromClick
  };

  return (
    <div className="arena-grid">
      <main className="arena-video-pane">
        {/* Video Frame Area */}
        <div className="video-player-outer-wrapper">
          <div className={isBlurred ? "arena-viewport-blurred" : "arena-viewport-normal"}>
            <YoutubePlayer
              videoId={room?.video.id}
              onProgress={onVideoProgress}
              onFinished={() => onVideoFinished(false)}
              isFrozen={isFrozen}
            />
          </div>
          
          {/* Active Glitch Overlays */}
          {isFrozen && (
            <div className="debuff-overlay-freeze">
              <div className="debuff-text-freeze">⚡ EMP FREEZE ACTIVE ⚡</div>
              <div className="debuff-desc-freeze">Opponent jammer deployed. Video feed suspended!</div>
            </div>
          )}

          {isBlurred && (
            <div className="debuff-overlay-blur">
              <div className="debuff-text-blur">🌫️ SMOKE SCREEN ACTIVE 🌫️</div>
              <div style={{ color: "#fff", fontSize: "12px", textShadow: "0 0 5px #000", fontFamily: "var(--font-gamer)" }}>
                Tactical visibility shield engaged.
              </div>
            </div>
          )}
        </div>
        
        {/* Video Header Controls */}
        <div className="video-title-bar">
          <div>
            <h3 className="arena-video-title">{room?.video.title}</h3>
            <p className="arena-video-creator">📺 {room?.video.channel} | Category: {room?.video.category}</p>
          </div>
          <button className="btn-primary" style={{ padding: "10px 20px", borderRadius: "10px" }} onClick={handleSkipToQuiz}>
            Skip to Quiz ➜
          </button>
        </div>

        {/* Cyber Weapon Action Panel */}
        <div className="powerups-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
          {myUnlockedSkills.map(skill => {
            const cost = getSkillCost(skill.level);
            return (
              <button 
                key={skill.name}
                className="powerup-btn" 
                disabled={energy < cost} 
                onClick={() => handleUsePowerupClick(skill)}
                style={{ 
                  background: energy >= cost ? "var(--accent-gradient)" : "var(--bg-dark-surface)",
                  color: energy >= cost ? "#fff" : "var(--text-muted)",
                  border: energy >= cost ? "none" : "1px solid var(--glass-border)",
                  opacity: energy >= cost ? 1 : 0.6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  padding: "10px",
                  borderRadius: "8px",
                  cursor: energy >= cost ? "pointer" : "not-allowed",
                  transition: "all 0.2s"
                }}
                title={skill.desc}
              >
                <span style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>{skill.name}</span>
                <span className="powerup-btn-cost" style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>{cost}% energy</span>
              </button>
            )
          })}
          {myUnlockedSkills.length === 0 && (
            <div style={{ color: "var(--text-muted)", padding: "10px" }}>No skills unlocked yet.</div>
          )}
        </div>
      </main>

      {/* Side Tracker Monitor & Chat */}
      <aside className="dashboard-sidebar">
        {/* Duel Progress Track Monitor */}
        <div className="glass-panel duel-monitor">
          <h4 className="panel-title" style={{ borderLeftColor: "var(--neon-pink)" }}>Duel Status Tracker</h4>
          
          <div className="progress-track-row">
            <div className="progress-track-info">
              <span className="track-label player-indicator">👤 {username} (You)</span>
              <span>{myProgress}%</span>
            </div>
            <div className="progress-bar-base">
              <div className="progress-bar-fill player-fill" style={{ width: `${myProgress}%` }}></div>
            </div>
          </div>

          <div className="progress-track-row">
            <div className="progress-track-info">
              <span className="track-label opponent-indicator">
                {opponent?.isBot ? "🤖" : "👤"} {opponent?.username}
              </span>
              <span>{opponentProgress}%</span>
            </div>
            <div className="progress-bar-base">
              <div className="progress-bar-fill opponent-fill" style={{ width: `${opponentProgress}%` }}></div>
            </div>
          </div>
          
          {opponentWaiting && (
            <div className="opponent-waiting-alert animate-pulse">
              ⚠️ Opponent has finished watching and is solving the quiz!
            </div>
          )}
        </div>

        {/* Battery Widget */}
        <div className="energy-bar-container glowing-border-cyan">
          <div className="energy-bar-header">
            <span>⚡ SYSTEM BATTERY POWERS</span>
            <span>{energy}%</span>
          </div>
          <div className="energy-bar-base">
            <div className={`energy-bar-fill ${energy === 100 ? "full" : ""}`} style={{ width: `${energy}%` }}></div>
          </div>
        </div>

        {/* Live Chat Component */}
        <div className="glass-panel" style={{ flex: 1, minHeight: "280px", padding: "15px" }}>
          <ChatBox
            messages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendChat={onSendChat}
            username={username}
            placeholder="Distract them during playback..."
          />
        </div>
      </aside>
    </div>
  );
}
