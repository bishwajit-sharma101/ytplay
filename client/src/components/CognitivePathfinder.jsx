import { useState, useEffect } from "react";
import * as sound from "../utils/audio";

const PATHS = {
  javascript: [
    { level: 1, title: "JavaScript Variables & Scope", tier: "Tier 1 - Novice", desc: "Understand let, const, var, block scopes, and the temporal dead zone." },
    { level: 2, title: "Functions, Scope & Lexical Closures", tier: "Tier 2 - Specialist", desc: "Master lexical environment, arrow functions, and enclosing scopes." },
    { level: 3, title: "Array Methods & ES6 Operations", tier: "Tier 3 - Elite", desc: "Deep dive into map, filter, reduce, find, slice, splice, and rest/spread syntax." },
    { level: 4, title: "Asynchronous Promises & Async/Await", tier: "Tier 4 - Grandmaster", desc: "Conquer the event loop, microtask queue, promise chaining, and error handling." }
  ],
  python: [
    { level: 1, title: "Python Syntax & Indentation Rules", tier: "Tier 1 - Novice", desc: "Get comfortable with snake_case, variables, lists, and basic indentation blocks." },
    { level: 2, title: "Data Structures: Lists, Tuples & Dicts", tier: "Tier 2 - Specialist", desc: "Learn key differences in mutability, indexing, hash maps, and set operations." },
    { level: 3, title: "Functions & Object-Oriented Classes", tier: "Tier 3 - Elite", desc: "Build reusable logic using functions, decorators, self references, and inheritance." },
    { level: 4, title: "File Operations & Dynamic API Requests", tier: "Tier 4 - Grandmaster", desc: "Interact with the operating system, fetch external data using requests, and parse JSON." }
  ],
  react: [
    { level: 1, title: "React JSX & Component Hierarchy", tier: "Tier 1 - Novice", desc: "Discover how JSX is compiled, and build a nesting component structure." },
    { level: 2, title: "State Hook Management (useState)", tier: "Tier 2 - Specialist", desc: "Master local react state updates, re-renders, and controlled form inputs." },
    { level: 3, title: "Side Effects Lifecycle with useEffect", tier: "Tier 3 - Elite", desc: "Understand dependency arrays, cleanups, subscriptions, and mounting hooks." },
    { level: 4, title: "Global Context & Redux-Style Reducers", tier: "Tier 4 - Grandmaster", desc: "Manage complex global state trees without prop drilling via useContext and useReducer." }
  ],
  physics: [
    { level: 1, title: "Wave-Particle Duality & Planck Constant", tier: "Tier 1 - Novice", desc: "Explore the dual nature of light and standard quantum packets of energy." },
    { level: 2, title: "Schrodinger's Cat & Superposition States", tier: "Tier 2 - Specialist", desc: "Understand mathematical state vectors and why subatomic particles exist in multiple paths." },
    { level: 3, title: "Quantum Entanglement & Einstein Spooky Action", tier: "Tier 3 - Elite", desc: "Study spin correlations, Bell's theorem, and why local realism doesn't apply." },
    { level: 4, title: "Quantum Computing Qubits & Logic Gates", tier: "Tier 4 - Grandmaster", desc: "Implement Hadamard, CNOT gates, and quantum algorithms to beat classical speeds." }
  ],
  gamedev: [
    { level: 1, title: "Game Loop Mechanics & Frame Drawing", tier: "Tier 1 - Novice", desc: "Learn the core updates cycle, requestAnimationFrame, and delta-time calculations." },
    { level: 2, title: "2D Collision Detection & Vector Math", tier: "Tier 2 - Specialist", desc: "Solve bounding box collisions, circle overlaps, and basic vector arithmetic." },
    { level: 3, title: "Sprites Rendering & State Machines", tier: "Tier 3 - Elite", desc: "Control running, jumping, and attacking sprite animations using active state indexes." },
    { level: 4, title: "Physics Engines Gravity & Drag Forces", tier: "Tier 4 - Grandmaster", desc: "Simulate gravity accelerations, wind friction, elastic collisions, and bounce coefficients." }
  ]
};

export default function CognitivePathfinder({ onTriggerSearch, username }) {
  const [topic, setTopic] = useState("javascript");
  const [customTopic, setCustomTopic] = useState("");
  const [motivation, setMotivation] = useState("project");
  const [learningStyle, setLearningStyle] = useState("methodic");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [activePathKey, setActivePathKey] = useState(() => localStorage.getItem(`ytplay_active_path_key_${username}`) || "");
  const [pathProgress, setPathProgress] = useState(() => {
    const saved = localStorage.getItem(`ytplay_path_progress_${username}`);
    return saved ? JSON.parse(saved) : {};
  });

  const scanLogs = [
    "📡 Establishing cognitive link with learning node...",
    "🧠 Scanning neural profile for " + username.toUpperCase() + "...",
    "🔍 Checking pre-requisites and conceptual familiarity...",
    "⚙️ Compiling optimal video dueling progression...",
    "✨ Duel Roadmap Generated successfully!"
  ];

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanStep((prev) => {
          if (prev >= scanLogs.length - 1) {
            clearInterval(interval);
            setTimeout(() => {
              setIsScanning(false);
              const selectedKey = topic === "custom" ? customTopic.trim() || "Custom Path" : topic;
              setActivePathKey(selectedKey);
              localStorage.setItem(`ytplay_active_path_key_${username}`, selectedKey);
            }, 1000);
            return prev;
          }
          sound.playClockTick();
          return prev + 1;
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isScanning, topic, customTopic, username]);

  const handleStartScan = (e) => {
    e.preventDefault();
    if (topic === "custom" && !customTopic.trim()) {
      alert("Please enter a custom topic!");
      return;
    }
    sound.playClockTick();
    setScanStep(0);
    setIsScanning(true);
  };

  const getRoadmapData = () => {
    if (!activePathKey) return [];
    
    // Check if it's one of pre-defined keys
    const lowerKey = activePathKey.toLowerCase();
    if (PATHS[lowerKey]) {
      return PATHS[lowerKey];
    }

    // Custom path generation
    return [
      { level: 1, title: `${activePathKey} Foundations`, tier: "Tier 1 - Novice", desc: `Learn the core primitives, environment setup, and fundamental concepts of ${activePathKey}.` },
      { level: 2, title: `Intermediate ${activePathKey} Systems`, tier: "Tier 2 - Specialist", desc: `Explore advanced operations, architectural syntax patterns, and best development practices.` },
      { level: 3, title: `${activePathKey} Performance & Libraries`, tier: "Tier 3 - Elite", desc: `Conquer performance tuning, major libraries, state management, and critical debugging loops.` },
      { level: 4, title: `${activePathKey} Production Deployment`, tier: "Tier 4 - Grandmaster", desc: `Deploy robust architectures, compile production bundles, and secure high-stakes components.` }
    ];
  };

  const currentUnlockedLevel = pathProgress[activePathKey] || 1;

  const handleSearchAndDuel = (stage) => {
    sound.playClockTick();
    // Switch to duels tab, search for the title
    onTriggerSearch(stage.title);
  };

  const forceUnlockNext = () => {
    sound.playClockTick();
    const nextLevel = Math.min(4, currentUnlockedLevel + 1);
    const updated = { ...pathProgress, [activePathKey]: nextLevel };
    setPathProgress(updated);
    localStorage.setItem(`ytplay_path_progress_${username}`, JSON.stringify(updated));
  };

  const resetPath = () => {
    sound.playClockTick();
    if (window.confirm("Are you sure you want to clear your learning path? All progress will be reset.")) {
      setActivePathKey("");
      localStorage.removeItem(`ytplay_active_path_key_${username}`);
      const updated = { ...pathProgress };
      delete updated[activePathKey];
      setPathProgress(updated);
      localStorage.setItem(`ytplay_path_progress_${username}`, JSON.stringify(updated));
    }
  };

  if (isScanning) {
    return (
      <div className="glass-panel text-center pathfinder-scanner">
        <div className="scanner-brain-container">
          <div className="scanner-brain">🧠</div>
          <div className="scanner-radar-ripple"></div>
          <div className="scanner-radar-ripple ripple-2"></div>
        </div>
        <h2 className="scanner-heading font-gamer">COGNITIVE ASSESSMENT SCAN IN PROGRESS</h2>
        <div className="terminal-box">
          <div className="terminal-header">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
            <span className="terminal-title">cognitive_core.sh</span>
          </div>
          <div className="terminal-body font-mono">
            {scanLogs.slice(0, scanStep + 1).map((log, idx) => (
              <div key={idx} className={`terminal-line ${idx === scanStep ? "active-line" : ""}`}>
                {idx < scanStep ? "✓" : "⚡"} {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activePathKey) {
    const roadmap = getRoadmapData();
    return (
      <div className="glass-panel pathfinder-results-panel">
        <div className="pathfinder-header">
          <div>
            <h2 className="panel-title font-gamer" style={{ borderLeftColor: "var(--neon-purple)" }}>
              🧠 COGNITIVE PATH: <span className="text-neon-purple">{activePathKey.toUpperCase()}</span>
            </h2>
            <p className="hero-subtitle">
              Current progress: Stage {currentUnlockedLevel} of 4. Win matches to unlock higher difficulty levels!
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-secondary" onClick={forceUnlockNext} disabled={currentUnlockedLevel >= 4}>
              🔓 SIMULATE VICTORY (UNLOCK NEXT)
            </button>
            <button className="btn-secondary btn-danger" onClick={resetPath}>
              🗑️ RESET PATH
            </button>
          </div>
        </div>

        <div className="roadmap-timeline">
          {roadmap.map((stage) => {
            const isUnlocked = stage.level <= currentUnlockedLevel;
            const isActive = stage.level === currentUnlockedLevel;
            return (
              <div
                key={stage.level}
                className={`roadmap-node ${isUnlocked ? "unlocked" : "locked"} ${isActive ? "active" : ""}`}
              >
                <div className="node-marker font-gamer">
                  {stage.level}
                </div>
                <div className="node-content glass-panel">
                  <div className="node-header">
                    <span className="node-tier font-gamer">{stage.tier}</span>
                    <span className={`node-status-badge ${isUnlocked ? "status-unlocked" : "status-locked"}`}>
                      {isUnlocked ? "🟢 UNLOCKED" : "🔒 LOCKED"}
                    </span>
                  </div>
                  <h3 className="node-title font-gamer">{stage.title}</h3>
                  <p className="node-description">{stage.desc}</p>
                  
                  <div className="node-actions">
                    {isUnlocked ? (
                      <button
                        className="btn-primary btn-sm node-action-btn"
                        onClick={() => handleSearchAndDuel(stage)}
                      >
                        ⚔️ SEARCH & DUEL
                      </button>
                    ) : (
                      <button className="btn-primary btn-sm node-action-btn" disabled>
                        🔒 DUEL LOCKED
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel pathfinder-setup-panel">
      <h2 className="panel-title font-gamer" style={{ borderLeftColor: "var(--neon-purple)" }}>
        🧠 Cognitive Pathfinder System
      </h2>
      <p className="hero-subtitle">
        Analyze your learning objectives, define your skills profile, and let our cognitive engine map out an optimized sequence of educational YouTube video duels.
      </p>

      <form onSubmit={handleStartScan} className="pathfinder-form">
        <div className="form-group">
          <label className="form-label font-gamer">1. SELECT TARGET DOMAIN</label>
          <div className="pathfinder-options-grid">
            <button
              type="button"
              className={`option-card ${topic === "javascript" ? "active" : ""}`}
              onClick={() => { sound.playClockTick(); setTopic("javascript"); }}
            >
              <span className="option-icon">👾</span>
              <span className="option-title">JavaScript</span>
              <span className="option-subtitle">Variables, Closures, Async & Event Loop</span>
            </button>
            <button
              type="button"
              className={`option-card ${topic === "python" ? "active" : ""}`}
              onClick={() => { sound.playClockTick(); setTopic("python"); }}
            >
              <span className="option-icon">🐍</span>
              <span className="option-title">Python</span>
              <span className="option-subtitle">Syntax, Data Structures & Files</span>
            </button>
            <button
              type="button"
              className={`option-card ${topic === "react" ? "active" : ""}`}
              onClick={() => { sound.playClockTick(); setTopic("react"); }}
            >
              <span className="option-icon">⚛️</span>
              <span className="option-title">React Systems</span>
              <span className="option-subtitle">JSX, Hooks, Lifecycle & Reducers</span>
            </button>
            <button
              type="button"
              className={`option-card ${topic === "physics" ? "active" : ""}`}
              onClick={() => { sound.playClockTick(); setTopic("physics"); }}
            >
              <span className="option-icon">⚛️</span>
              <span className="option-title">Quantum Physics</span>
              <span className="option-subtitle">Duality, Schrodinger & Entanglement</span>
            </button>
            <button
              type="button"
              className={`option-card ${topic === "gamedev" ? "active" : ""}`}
              onClick={() => { sound.playClockTick(); setTopic("gamedev"); }}
            >
              <span className="option-icon">🎮</span>
              <span className="option-title">Game Dev</span>
              <span className="option-subtitle">Loops, Physics, Collisions & Vectors</span>
            </button>
            <button
              type="button"
              className={`option-card ${topic === "custom" ? "active" : ""}`}
              onClick={() => { sound.playClockTick(); setTopic("custom"); }}
            >
              <span className="option-icon">✏️</span>
              <span className="option-title">Custom Domain</span>
              <span className="option-subtitle">Input any technology or field</span>
            </button>
          </div>
        </div>

        {topic === "custom" && (
          <div className="form-group custom-topic-input fade-in">
            <label className="form-label font-gamer">ENTER CUSTOM SUBJECT MATTER</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Next.js, Machine Learning, World History..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label font-gamer">2. WHAT IS YOUR PRIMARY TARGET OBJECTIVE?</label>
          <div className="form-select-group">
            <label className={`radio-pill-card ${motivation === "project" ? "active" : ""}`}>
              <input
                type="radio"
                name="motivation"
                value="project"
                checked={motivation === "project"}
                onChange={() => { sound.playClockTick(); setMotivation("project"); }}
              />
              🛠️ Build a Personal App / Project
            </label>
            <label className={`radio-pill-card ${motivation === "exam" ? "active" : ""}`}>
              <input
                type="radio"
                name="motivation"
                value="exam"
                checked={motivation === "exam"}
                onChange={() => { sound.playClockTick(); setMotivation("exam"); }}
              />
              🎓 College / School Exam prep
            </label>
            <label className={`radio-pill-card ${motivation === "job" ? "active" : ""}`}>
              <input
                type="radio"
                name="motivation"
                value="job"
                checked={motivation === "job"}
                onChange={() => { sound.playClockTick(); setMotivation("job"); }}
              />
              💼 Get a Job / Upskilling
            </label>
            <label className={`radio-pill-card ${motivation === "fun" ? "active" : ""}`}>
              <input
                type="radio"
                name="motivation"
                value="fun"
                checked={motivation === "fun"}
                onChange={() => { sound.playClockTick(); setMotivation("fun"); }}
              />
              ⚔️ Recreational Dueling
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label font-gamer">3. CHOOSE LEARNING SYSTEM METHODOLOGY</label>
          <div className="form-select-group">
            <label className={`radio-pill-card ${learningStyle === "methodic" ? "active" : ""}`}>
              <input
                type="radio"
                name="style"
                value="methodic"
                checked={learningStyle === "methodic"}
                onChange={() => { sound.playClockTick(); setLearningStyle("methodic"); }}
              />
              📚 Full-Watch Methodic (Maximizes watch-score multipliers)
            </label>
            <label className={`radio-pill-card ${learningStyle === "fast" ? "active" : ""}`}>
              <input
                type="radio"
                name="style"
                value="fast"
                checked={learningStyle === "fast"}
                onChange={() => { sound.playClockTick(); setLearningStyle("fast"); }}
              />
              ⚡ Speedrun Hack (Skip videos quickly, test knowledge faster)
            </label>
            <label className={`radio-pill-card ${learningStyle === "chaotic" ? "active" : ""}`}>
              <input
                type="radio"
                name="style"
                value="chaotic"
                checked={learningStyle === "chaotic"}
                onChange={() => { sound.playClockTick(); setLearningStyle("chaotic"); }}
              />
              🔥 Chaotic Battle (Directly fight bosses & training bots)
            </label>
          </div>
        </div>

        <button type="submit" className="btn-primary btn-large font-gamer" style={{ width: "100%" }}>
          🧠 INITIALIZE NEURAL ROADMAP GENERATOR
        </button>
      </form>
    </div>
  );
}
