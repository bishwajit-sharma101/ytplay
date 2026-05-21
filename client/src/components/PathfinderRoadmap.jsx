import { useState, useEffect } from "react";
import * as sound from "../utils/audio";

const BACKEND_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "";

// Status visual config
const STATUS_CONFIG = {
  completed:  { bg: "#dcfce7", border: "#16a34a", text: "#16a34a", icon: "✓", label: "Completed" },
  active:     { bg: "#fff7ed", border: "#ff6a00", text: "#ff6a00", icon: "▶", label: "In Progress" },
  unlocked:   { bg: "#ffffff", border: "#e2e8f0", text: "#64748b", icon: "○", label: "Available" },
  locked:     { bg: "#f8fafc", border: "#e2e8f0", text: "#cbd5e1", icon: "🔒", label: "Locked" },
  revision:   { bg: "#fef9c3", border: "#ca8a04", text: "#ca8a04", icon: "↺", label: "Revision" },
};

const LEVEL_META = {
  1: { emoji: "🌱", label: "Foundations", range: "Basic → Intermediate" },
  2: { emoji: "⚡", label: "Intermediate", range: "Intermediate → Advanced" },
  3: { emoji: "🔥", label: "Mastery",     range: "Advanced → God Tier" },
};

function MilestoneNode({ milestone, levelColor, isLastInLevel, onSelect, isSelected, levelNum }) {
  const cfg = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.locked;
  const isClickable = milestone.status !== "locked";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      {/* Connector line above (except first) */}
      {!isLastInLevel && (
        <div style={{
          position: "absolute", top: "52px", left: "50%",
          transform: "translateX(-50%)",
          width: "2px", height: "40px",
          background: milestone.status === "completed"
            ? levelColor
            : "repeating-linear-gradient(to bottom, #e2e8f0 0, #e2e8f0 5px, transparent 5px, transparent 10px)",
          zIndex: 0
        }} />
      )}

      {/* The node card */}
      <div
        onClick={() => isClickable && onSelect(milestone)}
        style={{
          width: "260px",
          background: isSelected ? `${cfg.bg}` : cfg.bg,
          border: `2px solid ${isSelected ? levelColor : cfg.border}`,
          borderRadius: "16px",
          padding: "16px 18px",
          cursor: isClickable ? "pointer" : "default",
          transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: isSelected
            ? `0 8px 30px ${levelColor}33, 0 0 0 4px ${levelColor}22`
            : "0 2px 8px rgba(0,0,0,0.05)",
          position: "relative",
          zIndex: 1,
          transform: isSelected ? "scale(1.03)" : milestone.status === "locked" ? "none" : "none",
          opacity: milestone.status === "locked" ? 0.6 : 1,
        }}
        onMouseOver={e => {
          if (isClickable && !isSelected) {
            e.currentTarget.style.boxShadow = `0 6px 20px ${levelColor}33`;
            e.currentTarget.style.borderColor = levelColor;
            e.currentTarget.style.transform = "translateY(-2px)";
          }
        }}
        onMouseOut={e => {
          if (!isSelected) {
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
            e.currentTarget.style.borderColor = cfg.border;
            e.currentTarget.style.transform = "none";
          }
        }}
      >
        {/* Revision badge */}
        {milestone.isRevision && (
          <div style={{
            position: "absolute", top: "-8px", right: "12px",
            background: "#fef9c3", border: "1px solid #ca8a04",
            color: "#ca8a04", fontSize: "10px", fontWeight: "800",
            padding: "2px 8px", borderRadius: "10px", letterSpacing: "0.5px"
          }}>
            REVISION
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          {/* Status icon circle */}
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: milestone.status === "completed" ? levelColor
              : milestone.status === "active" ? "#fff7ed"
              : milestone.status === "unlocked" ? "#f1f5f9"
              : "#f8fafc",
            border: `2px solid ${milestone.status === "locked" ? "#e2e8f0" : levelColor}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: milestone.status === "completed" ? "14px" : "12px",
            color: milestone.status === "completed" ? "#fff" : cfg.text,
            fontWeight: "900",
            flexShrink: 0,
          }}>
            {cfg.icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-light)", lineHeight: "1.3", marginBottom: "4px" }}>
              {milestone.title}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {milestone.description}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
              {milestone.estimatedMinutes && (
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
                  ⏱ {milestone.estimatedMinutes}min
                </span>
              )}
              {milestone.xpReward && (
                <span style={{
                  fontSize: "10px", fontWeight: "800",
                  color: milestone.status === "completed" ? "#16a34a" : cfg.text,
                  background: milestone.status === "completed" ? "#dcfce7" : "#f1f5f9",
                  padding: "2px 6px", borderRadius: "6px"
                }}>
                  +{milestone.xpReward} XP
                </span>
              )}
              <span style={{
                fontSize: "10px", fontWeight: "700",
                color: cfg.text, marginLeft: "auto"
              }}>
                {cfg.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MilestoneDetailPanel({ milestone, roadmapTopic, levelColor, onClose, onSearchDuel, onMarkComplete, username }) {
  const [studyNotes, setStudyNotes] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const cfg = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.locked;

  const loadStudyNotes = async () => {
    if (studyNotes || loadingNotes) return;
    setLoadingNotes(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/pathfinder/study-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: roadmapTopic, milestone })
      });
      const data = await res.json();
      setStudyNotes(data.notes);
    } catch (err) {
      setStudyNotes(`## ${milestone.title}\n\n${milestone.description}\n\n${(milestone.keyPoints || []).map(p => `- ${p}`).join("\n")}`);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Render basic markdown to HTML (minimal)
  const renderMd = (text) => {
    if (!text) return "";
    return text
      .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:800;color:#0f172a;margin:20px 0 8px">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:800;color:#ff6a00;margin:16px 0 6px;text-transform:uppercase;letter-spacing:0.5px">$1</h3>')
      .replace(/^- (.+)$/gm, '<li style="color:#475569;font-size:14px;line-height:1.7;margin-bottom:4px">$1</li>')
      .replace(/(<li[^>]*>.*<\/li>)/gs, '<ul style="padding-left:20px;margin:8px 0">$1</ul>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0f172a">$1</strong>')
      .replace(/\n\n/g, '</p><p style="color:#64748b;font-size:14px;line-height:1.7;margin:8px 0">')
      .replace(/^(?!<[h|u|l|p])(.+)$/gm, '<p style="color:#64748b;font-size:14px;line-height:1.7;margin:8px 0">$1</p>');
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px"
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "680px", maxHeight: "90vh",
          background: "#ffffff", borderRadius: "24px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "scaleIn 0.2s ease-out"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "24px 28px",
          borderBottom: "1px solid #f1f5f9",
          background: milestone.status === "completed" ? "#f0fdf4" : "#fff7ed",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                <span style={{
                  fontSize: "10px", fontWeight: "800", color: "#fff",
                  background: levelColor, padding: "3px 10px", borderRadius: "8px",
                  textTransform: "uppercase", letterSpacing: "1px"
                }}>
                  {cfg.label}
                </span>
                {milestone.estimatedMinutes && (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>⏱ {milestone.estimatedMinutes} min</span>
                )}
                <span style={{ fontSize: "12px", fontWeight: "700", color: levelColor }}>+{milestone.xpReward} XP</span>
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", lineHeight: "1.3", marginBottom: "6px" }}>
                {milestone.title}
              </h2>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                {milestone.description}
              </p>
            </div>
            <button onClick={onClose} style={{
              width: "32px", height: "32px", borderRadius: "50%",
              border: "1px solid #e2e8f0", background: "#fff",
              cursor: "pointer", fontSize: "16px", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* Key Points */}
          {milestone.keyPoints?.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                📌 What You'll Cover
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {milestone.keyPoints.map((pt, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: "10px",
                    padding: "10px 14px", background: "#f8fafc",
                    borderRadius: "10px", border: "1px solid #e2e8f0"
                  }}>
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%",
                      background: levelColor, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", fontWeight: "900", flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Notes section */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                📚 AI Study Notes
              </h3>
              {!studyNotes && (
                <button
                  onClick={loadStudyNotes}
                  disabled={loadingNotes}
                  style={{
                    padding: "6px 14px", borderRadius: "8px",
                    border: `1px solid ${levelColor}`, background: "#fff",
                    color: levelColor, fontSize: "12px", fontWeight: "700",
                    cursor: loadingNotes ? "wait" : "pointer"
                  }}
                >
                  {loadingNotes ? "Generating..." : "✨ Generate Notes"}
                </button>
              )}
            </div>

            {studyNotes ? (
              <div
                style={{
                  background: "#f8fafc", borderRadius: "16px",
                  padding: "20px 24px", border: "1px solid #e2e8f0",
                  lineHeight: "1.7"
                }}
                dangerouslySetInnerHTML={{ __html: renderMd(studyNotes) }}
              />
            ) : (
              <div style={{
                background: "#f8fafc", borderRadius: "16px",
                padding: "20px 24px", border: "2px dashed #e2e8f0",
                textAlign: "center", color: "var(--text-muted)", fontSize: "14px"
              }}>
                Click "Generate Notes" for AI-powered study material for this milestone.
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{
          padding: "20px 28px",
          borderTop: "1px solid #f1f5f9",
          display: "flex", gap: "12px", flexWrap: "wrap",
          background: "#fafafa", flexShrink: 0
        }}>
          {milestone.status !== "locked" && (
            <button
              onClick={() => { sound.playClockTick(); onSearchDuel(milestone); onClose(); }}
              style={{
                flex: 1, padding: "14px 20px", borderRadius: "12px",
                border: "none", background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)`,
                color: "#fff", fontWeight: "800", fontSize: "14px",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px",
                boxShadow: `0 6px 20px ${levelColor}44`,
                transition: "all 0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseOut={e => e.currentTarget.style.transform = "none"}
            >
              ⚔️ Search & Duel This Topic
            </button>
          )}

          {milestone.status === "unlocked" && (
            <button
              onClick={() => { sound.playClockTick(); onMarkComplete(milestone); onClose(); }}
              style={{
                padding: "14px 20px", borderRadius: "12px",
                border: `1.5px solid ${levelColor}`, background: "#fff",
                color: levelColor, fontWeight: "700", fontSize: "13px",
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              ✓ Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PathfinderRoadmap({ roadmap: initialRoadmap, username, onSearchDuel, onReset }) {
  const storageKey = `ytplay_roadmap_progress_${username}`;

  const [roadmap, setRoadmap] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch { return initialRoadmap; }
    }
    return initialRoadmap;
  });

  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [expandedLevel, setExpandedLevel] = useState(1);

  // Sync to localStorage whenever roadmap changes
  useEffect(() => {
    if (roadmap) {
      localStorage.setItem(storageKey, JSON.stringify(roadmap));
    }
  }, [roadmap, storageKey]);

  // Update roadmap with new initial if parent changes it
  useEffect(() => {
    if (initialRoadmap) {
      setRoadmap(initialRoadmap);
    }
  }, [initialRoadmap]);

  const getAllMilestones = () => [
    ...(roadmap?.level1?.milestones || []),
    ...(roadmap?.level2?.milestones || []),
    ...(roadmap?.level3?.milestones || []),
  ];

  const completedCount = getAllMilestones().filter(m => m.status === "completed").length;
  const totalCount = getAllMilestones().length;
  const totalXpEarned = getAllMilestones().filter(m => m.status === "completed").reduce((s, m) => s + (m.xpReward || 0), 0);

  const markComplete = (milestone) => {
    sound.playCorrect();
    setRoadmap(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const allLevels = ["level1", "level2", "level3"];

      let found = false;
      let nextUnlocked = false;

      for (const lk of allLevels) {
        const ms = next[lk]?.milestones || [];
        for (let i = 0; i < ms.length; i++) {
          if (ms[i].id === milestone.id) {
            ms[i].status = "completed";
            found = true;
            // Unlock next milestone in same level
            if (i + 1 < ms.length && ms[i + 1].status === "locked") {
              ms[i + 1].status = "unlocked";
              nextUnlocked = true;
            }
          }
        }

        // If last in level completed, unlock first of next level
        if (found && !nextUnlocked) {
          const allDone = ms.every(m => m.status === "completed");
          if (allDone) {
            const nextLevelIdx = allLevels.indexOf(lk) + 1;
            if (nextLevelIdx < allLevels.length) {
              const nextMs = next[allLevels[nextLevelIdx]]?.milestones;
              if (nextMs?.[0]) {
                nextMs[0].status = "unlocked";
                setExpandedLevel(nextLevelIdx + 1);
              }
            }
          }
          break;
        }
      }

      return next;
    });
  };

  const getLevelData = (levelKey, levelNum) => {
    const data = roadmap?.[levelKey];
    if (!data) return null;
    const milestones = data.milestones || [];
    const completedInLevel = milestones.filter(m => m.status === "completed").length;
    const isLevelUnlocked = milestones.some(m => m.status !== "locked");
    return { ...data, milestones, completedInLevel, isLevelUnlocked, levelNum };
  };

  if (!roadmap) return null;

  const levels = [
    { key: "level1", num: 1, color: "#10b981" },
    { key: "level2", num: 2, color: "#f59e0b" },
    { key: "level3", num: 3, color: "#8b5cf6" },
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Top Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#ea580c", background: "#fff7ed", padding: "4px 12px", borderRadius: "20px", border: "1px solid #fed7aa", textTransform: "uppercase", letterSpacing: "1px" }}>
                🗺️ Your Roadmap
              </span>
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: "900", color: "var(--text-light)", marginBottom: "4px" }}>
              {roadmap.topic}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: "600px", lineHeight: "1.5" }}>
              {roadmap.summary}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            <button
              onClick={() => { sound.playClockTick(); onReset(); }}
              style={{
                padding: "10px 18px", borderRadius: "12px",
                border: "1.5px solid #e2e8f0", background: "#fff",
                color: "var(--text-muted)", fontSize: "13px", fontWeight: "700",
                cursor: "pointer"
              }}
            >
              🔄 New Roadmap
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: "16px", marginTop: "24px", flexWrap: "wrap"
        }}>
          {[
            { label: "Progress", value: `${completedCount} / ${totalCount}`, sub: "milestones done", color: "#ff6a00" },
            { label: "XP Earned", value: `+${totalXpEarned}`, sub: "from roadmap", color: "#f59e0b" },
            { label: "Goal", value: roadmap.goal?.split(" ").slice(0, 5).join(" ") + (roadmap.goal?.split(" ").length > 5 ? "..." : ""), sub: roadmap.goal, color: "#8b5cf6" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#ffffff", borderRadius: "16px",
              padding: "16px 20px", border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)", flex: "1", minWidth: "160px"
            }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>{s.label}</div>
              <div style={{ fontSize: "20px", fontWeight: "900", color: s.color }}>{s.value}</div>
              {i === 0 && (
                <div style={{ marginTop: "6px", height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(completedCount / totalCount) * 100}%`, background: "linear-gradient(90deg, #ff6a00, #ffb300)", borderRadius: "2px", transition: "width 0.5s" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: cfg.bg, border: `1.5px solid ${cfg.border}` }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Levels */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {levels.map(({ key, num, color }) => {
          const data = getLevelData(key, num);
          if (!data) return null;
          const isOpen = expandedLevel === num;
          const meta = LEVEL_META[num];

          return (
            <div key={key} style={{
              background: "#ffffff", borderRadius: "24px",
              border: `1.5px solid ${data.isLevelUnlocked ? color + "44" : "#e2e8f0"}`,
              overflow: "hidden",
              boxShadow: data.isLevelUnlocked ? `0 4px 20px ${color}11` : "0 2px 8px rgba(0,0,0,0.04)",
              opacity: data.isLevelUnlocked ? 1 : 0.7,
              transition: "all 0.3s"
            }}>
              {/* Level header — clickable to expand */}
              <div
                onClick={() => { sound.playClockTick(); setExpandedLevel(isOpen ? 0 : num); }}
                style={{
                  padding: "20px 28px",
                  background: data.isLevelUnlocked
                    ? `linear-gradient(135deg, ${color}11 0%, ${color}08 100%)`
                    : "#f8fafc",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "16px",
                  borderBottom: isOpen ? `1px solid ${color}22` : "none"
                }}
              >
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px",
                  background: data.isLevelUnlocked
                    ? `linear-gradient(135deg, ${color}, ${color}bb)`
                    : "#e2e8f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", flexShrink: 0,
                  boxShadow: data.isLevelUnlocked ? `0 4px 14px ${color}44` : "none"
                }}>
                  {data.isLevelUnlocked ? meta.emoji : "🔒"}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-light)" }}>
                      {data.title}
                    </h2>
                    {!data.isLevelUnlocked && (
                      <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: "8px" }}>
                        LOCKED
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{data.subtitle}</p>
                </div>

                {/* Level progress */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "16px", fontWeight: "900", color }}>
                    {data.completedInLevel} / {data.milestones.length}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>completed</div>
                  <div style={{ marginTop: "6px", width: "80px", height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(data.completedInLevel / data.milestones.length) * 100}%`,
                      background: color, borderRadius: "2px", transition: "width 0.5s"
                    }} />
                  </div>
                </div>

                <div style={{ fontSize: "16px", color: "var(--text-muted)", transition: "transform 0.3s", transform: isOpen ? "rotate(180deg)" : "none" }}>
                  ▼
                </div>
              </div>

              {/* Milestones — shown when expanded */}
              {isOpen && (
                <div style={{ padding: "28px" }}>
                  {/* roadmap.sh-style node layout */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "0",
                    position: "relative"
                  }}>
                    {/* Central spine line */}
                    <div style={{
                      position: "absolute",
                      top: "26px", left: "50%",
                      transform: "translateX(-50%)",
                      width: "2px",
                      height: `calc(100% - 52px)`,
                      background: `repeating-linear-gradient(to bottom, ${color} 0, ${color} 6px, transparent 6px, transparent 12px)`,
                      opacity: 0.3,
                      display: data.milestones.length > 2 ? "block" : "none"
                    }} />

                    {data.milestones.map((milestone, idx) => (
                      <div key={milestone.id} style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: idx % 2 === 0 ? "flex-end" : "flex-start",
                        padding: "12px 16px",
                        position: "relative"
                      }}>
                        {/* Horizontal connector to center */}
                        <div style={{
                          position: "absolute",
                          top: "38px",
                          [idx % 2 === 0 ? "right" : "left"]: "0",
                          width: "16px", height: "2px",
                          background: milestone.status === "completed" ? color : "#e2e8f0"
                        }} />

                        <MilestoneNode
                          milestone={milestone}
                          levelColor={color}
                          isLastInLevel={idx === data.milestones.length - 1}
                          isSelected={selectedMilestone?.id === milestone.id}
                          onSelect={(m) => {
                            sound.playClockTick();
                            setSelectedMilestone(m);
                          }}
                          levelNum={num}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Level completion message */}
                  {data.completedInLevel === data.milestones.length && (
                    <div style={{
                      marginTop: "20px",
                      padding: "16px 20px",
                      background: `${color}11`,
                      border: `1.5px solid ${color}44`,
                      borderRadius: "14px",
                      display: "flex", alignItems: "center", gap: "12px"
                    }}>
                      <span style={{ fontSize: "24px" }}>🎉</span>
                      <div>
                        <div style={{ fontWeight: "800", color, fontSize: "15px" }}>Level Complete!</div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                          You've mastered all {data.milestones.length} milestones in this level. Next level unlocked!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Milestone detail modal */}
      {selectedMilestone && (
        <MilestoneDetailPanel
          milestone={selectedMilestone}
          roadmapTopic={roadmap.topic}
          levelColor={
            roadmap.level1?.milestones?.find(m => m.id === selectedMilestone.id) ? "#10b981" :
            roadmap.level2?.milestones?.find(m => m.id === selectedMilestone.id) ? "#f59e0b" : "#8b5cf6"
          }
          username={username}
          onClose={() => setSelectedMilestone(null)}
          onSearchDuel={onSearchDuel}
          onMarkComplete={(m) => { markComplete(m); setSelectedMilestone(null); }}
        />
      )}
    </div>
  );
}
