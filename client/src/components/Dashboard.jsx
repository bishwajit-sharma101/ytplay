import { useState } from "react";
import * as sound from "../utils/audio";
import CognitivePathfinder from "./CognitivePathfinder";
import ProfilePanel from "./ProfilePanel";

export default function Dashboard({
  curatedVideos,
  selectedVideo,
  setSelectedVideo,
  vsBot,
  setVsBot,
  leaderboard,
  username,
  avatar,
  getRankTitle,
  onStartMatchmaking,
  backendUrl,
  searchQuery,
  searchResults,
  onSearch,
  selectedClass
}) {
  const [activeTab, setActiveTab] = useState("duels");

  const handleTabChange = (tab) => {
    sound.playClockTick();
    setActiveTab(tab);
  };

  const handleSelectVideo = (video) => {
    sound.playClockTick();
    setSelectedVideo(video);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", display: "flex", gap: "40px", alignItems: "flex-start" }}>
      
      {/* Modern Sidebar Navigation */}
      <div className="dashboard-sidebar-nav" style={{ width: "240px", display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
        <button
          onClick={() => handleTabChange("profile")}
          style={{ padding: "12px 16px", borderRadius: "12px", border: "none", background: activeTab === "profile" ? "#e0e7ff" : "transparent", color: activeTab === "profile" ? "#4338ca" : "var(--text-muted)", fontWeight: "600", textAlign: "left", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "10px" }}
        >
          👤 Profile
        </button>
        <button
          onClick={() => handleTabChange("duels")}
          style={{ padding: "12px 16px", borderRadius: "12px", border: "none", background: activeTab === "duels" ? "#e0e7ff" : "transparent", color: activeTab === "duels" ? "#4338ca" : "var(--text-muted)", fontWeight: "600", textAlign: "left", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "10px" }}
        >
          🎮 Duel Arena
        </button>
        <button
          onClick={() => handleTabChange("pathfinder")}
          style={{ padding: "12px 16px", borderRadius: "12px", border: "none", background: activeTab === "pathfinder" ? "#e0e7ff" : "transparent", color: activeTab === "pathfinder" ? "#4338ca" : "var(--text-muted)", fontWeight: "600", textAlign: "left", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "10px" }}
        >
          🧠 Pathfinder
        </button>
        <button
          onClick={() => handleTabChange("rules")}
          style={{ padding: "12px 16px", borderRadius: "12px", border: "none", background: activeTab === "rules" ? "#e0e7ff" : "transparent", color: activeTab === "rules" ? "#4338ca" : "var(--text-muted)", fontWeight: "600", textAlign: "left", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "10px" }}
        >
          📘 Combat Manual
        </button>
        <button
          onClick={() => handleTabChange("rankings")}
          style={{ padding: "12px 16px", borderRadius: "12px", border: "none", background: activeTab === "rankings" ? "#e0e7ff" : "transparent", color: activeTab === "rankings" ? "#4338ca" : "var(--text-muted)", fontWeight: "600", textAlign: "left", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "10px" }}
        >
          🏆 Global Rankings
        </button>
      </div>

      {/* Content Area */}
      <div className="dashboard-content" style={{ flex: 1, minWidth: 0 }}>
        {activeTab === "profile" && (
          <ProfilePanel username={username} selectedClass={selectedClass} />
        )}
        
        {activeTab === "duels" && (
          <div className="content-section">
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-light)", marginBottom: "8px" }}>
              {searchQuery ? "Search Results" : "Curated Training"}
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "30px", fontSize: "15px" }}>
              Select a video to initiate a duel. The system will auto-generate a cognitive test based on the content.
            </p>
            
            <div className="videos-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "40px" }}>
              {(searchResults?.length > 0 ? searchResults : curatedVideos).map((video) => (
                <div
                  key={video.id}
                  className={`video-card ${selectedVideo?.id === video.id ? "selected" : ""}`}
                  onClick={() => handleSelectVideo(video)}
                  style={{
                    background: selectedVideo?.id === video.id ? "#fff7ed" : "#ffffff",
                    border: selectedVideo?.id === video.id ? "2px solid var(--neon-orange)" : "1px solid #e2e8f0",
                    borderRadius: "20px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    boxShadow: selectedVideo?.id === video.id ? "0 15px 35px rgba(255, 106, 0, 0.2)" : "0 4px 12px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    transform: selectedVideo?.id === video.id ? "translateY(-5px)" : "none"
                  }}
                >
                  <div className="video-thumbnail-container" style={{ position: "relative", width: "100%", paddingTop: "133%", backgroundColor: "#000" }}>
                    <img src={video.thumbnail} alt={video.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)" }} />
                    
                    {/* Mock Live Viewers */}
                    <div style={{ position: "absolute", top: "15px", left: "15px", background: "#ef4444", color: "#fff", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "900", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 10px rgba(239, 68, 68, 0.4)", textTransform: "uppercase" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite" }} /> LIVE
                    </div>

                    {/* Viewer count */}
                    <div style={{ position: "absolute", top: "15px", right: "15px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(255,255,255,0.1)" }}>
                      👁️ {Math.floor(video.id.charCodeAt(0) * 3.7) + 120} queuing
                    </div>

                    <span style={{ position: "absolute", bottom: "15px", right: "15px", background: "rgba(0,0,0,0.75)", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                      {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                    </span>
                  </div>
                  
                  <div className="video-card-info" style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", background: selectedVideo?.id === video.id ? "linear-gradient(to bottom, #fff7ed, #ffffff)" : "#ffffff" }}>
                    
                    {/* Mock Tags */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10px", fontWeight: "900", color: "#ea580c", background: "#ffedd5", padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", border: "1px solid #fed7aa" }}>{video.category}</span>
                      <span style={{ fontSize: "10px", fontWeight: "900", color: "#4338ca", background: "#e0e7ff", padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", border: "1px solid #c7d2fe" }}>TRENDING</span>
                    </div>

                    <h4 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-light)", marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.3" }}>
                      {video.title}
                    </h4>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
                      📺 {video.channel}
                    </p>
                    
                    <div style={{ marginTop: "auto" }}>
                      {selectedVideo?.id === video.id && (
                        <div style={{ paddingTop: "20px", borderTop: "1px solid #fed7aa", display: "flex", flexDirection: "column", gap: "12px", animation: "fadeIn 0.3s" }}>
                          <button onClick={(e) => { e.stopPropagation(); onStartMatchmaking(); }} style={{ width: "100%", padding: "16px", borderRadius: "12px", fontSize: "15px", fontWeight: "900", background: "var(--accent-gradient)", border: "none", color: "white", cursor: "pointer", boxShadow: "var(--accent-gradient-glow)", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "transform 0.2s", textTransform: "uppercase", letterSpacing: "1px" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.03)"} onMouseOut={e => e.currentTarget.style.transform = "none"}>
                            ⚡ ENTER MATCHMAKING
                          </button>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              id={`bot-toggle-${video.id}`}
                              checked={vsBot}
                              onChange={(e) => {
                                sound.playClockTick();
                                setVsBot(e.target.checked);
                              }}
                              style={{ width: "16px", height: "16px", accentColor: "var(--neon-orange)", cursor: "pointer" }}
                            />
                            <label htmlFor={`bot-toggle-${video.id}`} style={{ fontSize: "13px", color: "var(--text-muted)", cursor: "pointer", userSelect: "none", fontWeight: "600" }}>
                              Enable Bot Fallback
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="content-section fade-in" style={{ background: "#ffffff", borderRadius: "24px", padding: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" }}>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#4338ca", marginBottom: "12px" }}>Combat Manual</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "16px", marginBottom: "40px" }}>Master the arena with these essential techniques and status effects.</p>
            
            <div style={{ background: "linear-gradient(145deg, #f8fafc, #eff6ff)", borderRadius: "20px", padding: "30px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1e40af", marginBottom: "20px" }}>Status Effects Explained</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "30px" }}>
                Understanding how different status effects interact is key to dominating the Duel Arena. Collect battery power (+2% per sec) to invoke active countermeasures!
              </p>
              
              <div style={{ background: "#ffffff", borderRadius: "16px", padding: "25px", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "20px" }}>
                <h4 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-light)", marginBottom: "10px" }}>Weapon Systems</h4>
                
                <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "24px", background: "#fef3c7", padding: "10px", borderRadius: "12px", color: "#d97706", display: "flex" }}>⚡</div>
                  <div>
                    <strong style={{ color: "var(--text-light)", fontSize: "15px" }}>EMP Freeze (50% energy)</strong>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px", lineHeight: "1.5" }}>Pause the opponent's video stream for 3 seconds and glitch their viewport with CRT static noise.</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "24px", background: "#f1f5f9", padding: "10px", borderRadius: "12px", color: "#64748b", display: "flex" }}>🌫️</div>
                  <div>
                    <strong style={{ color: "var(--text-light)", fontSize: "15px" }}>Smoke Screen (40% energy)</strong>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px", lineHeight: "1.5" }}>Blur the opponent's view for 5 seconds using heavy smoke fog. Reduces visibility significantly.</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "24px", background: "#fee2e2", padding: "10px", borderRadius: "12px", color: "#ef4444", display: "flex" }}>💻</div>
                  <div>
                    <strong style={{ color: "var(--text-light)", fontSize: "15px" }}>Hacker's Clue (60% energy)</strong>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px", lineHeight: "1.5" }}>Scans answers during the quiz phase to permanently filter out two incorrect choices for the active question.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pathfinder" && (
          <CognitivePathfinder
            username={username}
            onTriggerSearch={(topicName) => {
              if(onSearch) onSearch(topicName);
              setActiveTab("duels");
            }}
          />
        )}

        {activeTab === "rankings" && (
          <div className="content-section fade-in" style={{ background: "#ffffff", borderRadius: "24px", padding: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" }}>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#4338ca", marginBottom: "12px" }}>Global Rankings</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "16px", marginBottom: "40px" }}>The top duelists across all domains.</p>
            
            <div className="leaderboard-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {leaderboard.map((player, index) => (
                <div
                  key={player.username}
                  style={{
                    display: "flex", alignItems: "center", gap: "20px", padding: "20px", background: player.username.toLowerCase() === username.toLowerCase() ? "#fff7ed" : "#f8fafc", borderRadius: "16px", border: player.username.toLowerCase() === username.toLowerCase() ? "2px solid var(--neon-orange)" : "1px solid #e2e8f0", transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ fontSize: "24px", fontWeight: "900", color: index === 0 ? "#f59e0b" : index === 1 ? "#94a3b8" : index === 2 ? "#b45309" : "#cbd5e1", width: "40px", textAlign: "center" }}>
                    #{index + 1}
                  </div>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#fff", border: "2px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", overflow: "hidden" }}>
                    {player.avatar ? (player.avatar.includes('http') ? <img src={player.avatar} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}}/> : player.avatar) : "👤"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-light)" }}>{player.username}</div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{getRankTitle(player.level || 1)}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--neon-orange)" }}>LVL {player.level || 1}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {player.wins} Wins | {player.losses} Losses
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
