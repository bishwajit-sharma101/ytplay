import dotenv from "dotenv";
dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = "gemma4:e4b";

// ── Ollama helpers ──────────────────────────────────────────────────────────
async function ollamaGenerate(prompt, format = "json") {
  const body = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
    options: { temperature: 0.7, num_predict: 4096 }
  };
  if (format === "json") body.format = "json";

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000) // 2 min timeout
  });

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  return data.response;
}

function buildFallbackRoadmap(topic, goal) {
  const t = topic || "Your Subject";
  const milestoneBase = (level, idx, titles, descs) => ({
    id: `${level}-${idx}`,
    title: titles[idx],
    description: descs[idx],
    searchQuery: `${t} ${titles[idx]} tutorial`,
    keyPoints: ["Understand core concepts", "Practice with examples", "Build something small", "Review and solidify"],
    estimatedMinutes: 45,
    status: level === 1 && idx === 0 ? "unlocked" : "locked",
    xpReward: 30 + idx * 10,
    isRevision: false
  });

  return {
    topic: t,
    goal: goal || "Master the subject",
    summary: `A personalized 3-level roadmap to take you from zero to mastery in ${t}.`,
    level1: {
      title: "Level 1 — Foundations",
      subtitle: "Basic → Intermediate",
      color: "#10b981",
      milestones: [
        milestoneBase(1, 0, [`${t} Fundamentals`, `Core Concepts of ${t}`, `Hands-on ${t} Basics`, `${t} Mini Project`], ["Master the building blocks and syntax.", "Understand the underlying principles.", "Apply knowledge with guided exercises.", "Consolidate with a beginner project."]),
        milestoneBase(1, 1, [`${t} Fundamentals`, `Core Concepts of ${t}`, `Hands-on ${t} Basics`, `${t} Mini Project`], ["Master the building blocks and syntax.", "Understand the underlying principles.", "Apply knowledge with guided exercises.", "Consolidate with a beginner project."]),
        milestoneBase(1, 2, [`${t} Fundamentals`, `Core Concepts of ${t}`, `Hands-on ${t} Basics`, `${t} Mini Project`], ["Master the building blocks and syntax.", "Understand the underlying principles.", "Apply knowledge with guided exercises.", "Consolidate with a beginner project."]),
        milestoneBase(1, 3, [`${t} Fundamentals`, `Core Concepts of ${t}`, `Hands-on ${t} Basics`, `${t} Mini Project`], ["Master the building blocks and syntax.", "Understand the underlying principles.", "Apply knowledge with guided exercises.", "Consolidate with a beginner project."]),
      ]
    },
    level2: {
      title: "Level 2 — Intermediate",
      subtitle: "Intermediate → Advanced",
      color: "#f59e0b",
      milestones: [
        { id: "2-0", title: `Intermediate ${t} Patterns`, description: "Learn established patterns and best practices.", searchQuery: `${t} intermediate patterns best practices`, keyPoints: [], estimatedMinutes: 60, status: "locked", xpReward: 50, isRevision: false },
        { id: "2-1", title: `${t} Performance & Optimization`, description: "Profile and optimize your code.", searchQuery: `${t} performance optimization`, keyPoints: [], estimatedMinutes: 60, status: "locked", xpReward: 55, isRevision: false },
        { id: "2-2", title: `Testing & Debugging ${t}`, description: "Write tests and debug effectively.", searchQuery: `${t} testing debugging`, keyPoints: [], estimatedMinutes: 55, status: "locked", xpReward: 55, isRevision: false },
        { id: "2-3", title: `Real-World ${t} Project`, description: "Build a complete intermediate-level project.", searchQuery: `${t} project tutorial intermediate`, keyPoints: [], estimatedMinutes: 90, status: "locked", xpReward: 70, isRevision: false },
      ]
    },
    level3: {
      title: "Level 3 — Mastery",
      subtitle: "Advanced → God Tier",
      color: "#8b5cf6",
      milestones: [
        { id: "3-0", title: `Advanced ${t} Architecture`, description: "Design scalable systems and architectures.", searchQuery: `${t} advanced architecture`, keyPoints: [], estimatedMinutes: 75, status: "locked", xpReward: 80, isRevision: false },
        { id: "3-1", title: `${t} Under the Hood`, description: "Deep dive into internals and source code.", searchQuery: `${t} internals how it works`, keyPoints: [], estimatedMinutes: 70, status: "locked", xpReward: 85, isRevision: false },
        { id: "3-2", title: `Contributing to ${t} Ecosystem`, description: "Open source, libraries, and community.", searchQuery: `${t} open source contribution`, keyPoints: [], estimatedMinutes: 60, status: "locked", xpReward: 90, isRevision: false },
        { id: "3-3", title: `${t} Mastery Project`, description: "Build something production-ready and impressive.", searchQuery: `${t} advanced full project`, keyPoints: [], estimatedMinutes: 120, status: "locked", xpReward: 100, isRevision: false },
      ]
    }
  };
}

/**
 * Generates a personalized 3-level learning roadmap using Ollama gemma4:e4b.
 * Falls back to template if Ollama is unavailable.
 */
export async function generateRoadmapFromAnswers(answers) {
  const qa = answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n");
  const userTopic = answers[0]?.answer || "General Learning";
  const userGoal = answers[1]?.answer || "";

  const prompt = `You are an expert learning path designer for the ytPlay educational gaming platform.
A user has completed an onboarding interview. Based on their answers, generate a highly personalized, detailed 3-level learning roadmap.

USER INTERVIEW:
${qa}

Generate a JSON roadmap with this EXACT structure:
{
  "topic": "short specific topic name (2-4 words)",
  "goal": "one sentence summarizing what they want to achieve",
  "summary": "2-3 sentences describing why this roadmap is tailored for them",
  "level1": {
    "title": "Level 1 — [Theme]",
    "subtitle": "Basic → Intermediate",
    "color": "#10b981",
    "milestones": [
      {
        "id": "1-0",
        "title": "specific topic title",
        "description": "2-3 sentences describing what this covers and why it matters for their goal",
        "searchQuery": "YouTube search query to find the best video for this milestone",
        "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
        "estimatedMinutes": 40,
        "status": "unlocked",
        "xpReward": 30,
        "isRevision": false
      }
    ]
  },
  "level2": {
    "title": "Level 2 — [Theme]",
    "subtitle": "Intermediate → Advanced",
    "color": "#f59e0b",
    "milestones": [/* same structure, status: "locked", xpReward: 50-70 */]
  },
  "level3": {
    "title": "Level 3 — [Theme]",
    "subtitle": "Advanced → God Tier",
    "color": "#8b5cf6",
    "milestones": [/* same structure, status: "locked", xpReward: 80-100 */]
  }
}

Rules:
- Each level must have exactly 4 milestones
- Level 1 milestone 0 must have status "unlocked", all others "locked"
- Milestones must be highly specific to their actual topic and goal — NOT generic
- searchQuery should return real YouTube tutorials
- keyPoints should be actionable and specific
- estimatedMinutes: 30-120 based on depth
- Be extremely detailed and practical
- If they mentioned a specific goal (job, startup, etc), tailor the roadmap to that

Return ONLY valid JSON, no markdown.`;

  try {
    console.log(`[Pathfinder] Generating roadmap for: "${userTopic}" via Ollama ${OLLAMA_MODEL}`);
    const raw = await ollamaGenerate(prompt, "json");
    const roadmap = JSON.parse(raw);

    // Validate structure
    if (!roadmap.level1?.milestones || !roadmap.level2?.milestones || !roadmap.level3?.milestones) {
      throw new Error("Invalid roadmap structure from AI");
    }

    // Enforce unlock rules
    roadmap.level1.milestones.forEach((m, i) => { m.status = i === 0 ? "unlocked" : "locked"; });
    roadmap.level2.milestones.forEach(m => { m.status = "locked"; });
    roadmap.level3.milestones.forEach(m => { m.status = "locked"; });

    console.log(`[Pathfinder] Successfully generated roadmap: "${roadmap.topic}"`);
    return roadmap;
  } catch (err) {
    console.error(`[Pathfinder] Ollama failed (${err.message}), using fallback template`);
    return buildFallbackRoadmap(userTopic, userGoal);
  }
}

/**
 * Generates AI study notes (markdown) for a specific milestone.
 */
export async function generateStudyNotes(topic, milestone) {
  const prompt = `You are a concise, expert educator for ytPlay.
Generate focused study notes for this learning milestone:

Topic: ${topic}
Milestone: ${milestone.title}
Description: ${milestone.description || ""}
Key Points: ${(milestone.keyPoints || []).join(", ")}

Write study notes in this format:
## ${milestone.title}

### 🎯 What You'll Learn
[2-3 sentences]

### 📚 Core Concepts
[4-6 bullet points with brief explanations]

### 💡 Key Insight
[1 memorable insight or mental model]

### ⚡ Quick Practice
[A simple exercise or question to test understanding]

### 🔗 What Comes Next
[1 sentence about what unlocks after this]

Keep it concise but packed with value. Use examples. No fluff.`;

  try {
    const notes = await ollamaGenerate(prompt, "text");
    return notes.trim();
  } catch (err) {
    console.error(`[StudyNotes] Ollama failed: ${err.message}`);
    return `## ${milestone.title || "Study Notes"}\n\n### 🎯 What You'll Learn\n${milestone.description || "Core concepts for this milestone."}\n\n### 📚 Key Points\n${(milestone.keyPoints || ["Study the fundamentals", "Practice regularly", "Build small projects"]).map(p => `- ${p}`).join("\n")}\n\n### ⚡ Quick Practice\nResearch this topic on YouTube and take notes on what surprises you most.`;
  }
}

/**
 * Generates a mock quiz based on the video title as a fallback.
 */
function generateFallbackQuiz(title) {
  const normalizedTitle = title.toLowerCase();
  
  // Topic: JavaScript/Web Development
  if (normalizedTitle.includes("javascript") || normalizedTitle.includes("js") || normalizedTitle.includes("react") || normalizedTitle.includes("html") || normalizedTitle.includes("web dev") || normalizedTitle.includes("coding")) {
    return [
      {
        question: "What is the primary purpose of JavaScript in web development?",
        options: ["To style the layout and colors", "To add interactivity and dynamic behavior", "To store physical database files", "To configure server operating systems"],
        answerIndex: 1,
        points: 100
      },
      {
        question: "Which keyword is used to declare a block-scoped variable in modern JavaScript?",
        options: ["var", "define", "let", "global"],
        answerIndex: 2,
        points: 100
      },
      {
        question: "In React, what hook is commonly used to manage local state within a component?",
        options: ["useEffect", "useContext", "useState", "useReducer"],
        answerIndex: 2,
        points: 100
      },
      {
        question: "Which of the following is NOT a JavaScript data type?",
        options: ["String", "Float", "Boolean", "Undefined"],
        answerIndex: 1,
        points: 100
      },
      {
        question: "What does the DOM stand for in web technologies?",
        options: ["Document Object Model", "Digital Order Module", "Direct Output Mechanism", "Data Object Monitor"],
        answerIndex: 0,
        points: 100
      }
    ];
  }

  // Topic: Python / General Programming
  if (normalizedTitle.includes("python") || normalizedTitle.includes("java") || normalizedTitle.includes("c++") || normalizedTitle.includes("programming") || normalizedTitle.includes("tutorial")) {
    return [
      {
        question: "What is the correct file extension for Python source files?",
        options: [".pt", ".py", ".pyt", ".python"],
        answerIndex: 1,
        points: 100
      },
      {
        question: "How do you start a comment in Python code?",
        options: ["// comment", "/* comment */", "# comment", "<!-- comment -->"],
        answerIndex: 2,
        points: 100
      },
      {
        question: "What is the output of len([1, 2, 3]) in Python?",
        options: ["2", "3", "4", "An error is thrown"],
        answerIndex: 1,
        points: 100
      },
      {
        question: "Which data structure in Python is ordered, mutable, and allows duplicate elements?",
        options: ["List", "Set", "Tuple", "Dictionary"],
        answerIndex: 0,
        points: 100
      },
      {
        question: "What is the purpose of the 'git' system?",
        options: ["Writing documentation", "Compiling machine code", "Version control tracking of changes", "Deploying website hosting"],
        answerIndex: 2,
        points: 100
      }
    ];
  }

  // Topic: Science / Physics / Space / Nature
  if (normalizedTitle.includes("science") || normalizedTitle.includes("space") || normalizedTitle.includes("quantum") || normalizedTitle.includes("physics") || normalizedTitle.includes("earth") || normalizedTitle.includes("nature")) {
    return [
      {
        question: "What is the approximate speed of light in a vacuum?",
        options: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "10,000 km/s"],
        answerIndex: 0,
        points: 100
      },
      {
        question: "Which planet in our solar system is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        answerIndex: 1,
        points: 100
      },
      {
        question: "What is the chemical symbol for water?",
        options: ["O2", "CO2", "H2O", "HO2"],
        answerIndex: 2,
        points: 100
      },
      {
        question: "What force holds galaxies together and keeps planets in orbit?",
        options: ["Electromagnetism", "Friction", "Gravity", "Strong nuclear force"],
        answerIndex: 2,
        points: 100
      },
      {
        question: "What is the name of our home galaxy?",
        options: ["Andromeda", "The Milky Way", "Sombrero Galaxy", "Triangulum"],
        answerIndex: 1,
        points: 100
      }
    ];
  }

  // Topic: Gaming / Video Games
  if (normalizedTitle.includes("game") || normalizedTitle.includes("gaming") || normalizedTitle.includes("minecraft") || normalizedTitle.includes("fortnite") || normalizedTitle.includes("zelda") || normalizedTitle.includes("gta")) {
    return [
      {
        question: "Which of the following is considered the best-selling video game of all time?",
        options: ["Tetris", "Grand Theft Auto V", "Minecraft", "Super Mario Bros."],
        answerIndex: 2,
        points: 100
      },
      {
        question: "What is the primary developer of the Mario and Zelda franchises?",
        options: ["Sony Interactive", "Nintendo", "Sega", "Ubisoft"],
        answerIndex: 1,
        points: 100
      },
      {
        question: "In gaming, what does 'NPC' stand for?",
        options: ["New Player Character", "Non-Player Character", "Net Play Controller", "Neutral Power Center"],
        answerIndex: 1,
        points: 100
      },
      {
        question: "Which console was released by Sony in the year 2020?",
        options: ["PlayStation 4 Pro", "PlayStation 5", "Xbox Series X", "PlayStation Portal"],
        answerIndex: 1,
        points: 100
      },
      {
        question: "What is the name of the main block-building protagonist in Minecraft?",
        options: ["Alex", "Steve", "notch", "Creeper"],
        answerIndex: 1,
        points: 100
      }
    ];
  }

  // Generic Fallback (suitable for any video)
  return [
    {
      question: `What is the primary topic of the video: "${title}"?`,
      options: [
        "A scientific overview of historical events",
        "A detailed review, explanation, or presentation of the subject matter",
        "A fictional short story depicting space travel",
        "An advertisement promoting an energy drink brand"
      ],
      answerIndex: 1,
      points: 100
    },
    {
      question: "Which of the following is a good strategy to retain information from this video?",
      options: [
        "Playing it in the background at 4x speed while sleeping",
        "Active listening, taking notes, and answering follow-up questions",
        "Immediately closing the browser tab after 10 seconds",
        "Muting the volume and staring at the wall"
      ],
      answerIndex: 1,
      points: 100
    },
    {
      question: "If a viewer has doubts about a claim made in the video, what is the best next step?",
      options: [
        "Accept it blindly without any further questioning",
        "Cross-reference the information with peer-reviewed sources or trusted documentation",
        "Write an angry comment in all capital letters",
        "Never watch videos on the internet again"
      ],
      answerIndex: 1,
      points: 100
    },
    {
      question: "What makes digital video formats (like YouTube) effective for modern learning?",
      options: [
        "They completely replace teachers and books forever",
        "They allow visual demonstration, self-paced pausing, and easy repeating",
        "They consume high bandwidth and deplete device batteries",
        "They guarantee a 100% grade in all college exams"
      ],
      answerIndex: 1,
      points: 100
    },
    {
      question: "In an online educational duel, what is the most honorable way to win?",
      options: [
        "Guessing randomly as fast as possible",
        "Watching the video carefully, understanding it, and answering accurately",
        "Hacking the website database to inject score points",
        "Distracting the opponent by spamming the chat panel"
      ],
      answerIndex: 1,
      points: 100
    }
  ];
}

/**
 * Generates quiz questions for a video using the Gemini API if available, or falls back.
 */
export async function generateQuizForVideo(title, channelName = "") {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    console.log(`[Gemini API] No valid API Key found. Using smart fallback for: "${title}"`);
    return generateFallbackQuiz(title);
  }

  try {
    const prompt = `
Generate a quiz consisting of exactly 5 multiple choice questions based on a YouTube video with the title: "${title}" ${channelName ? `by channel "${channelName}"` : ""}.
The questions must be educational, relevant to the topic, and challenging.
Respond ONLY with a valid JSON array of objects. Do not include markdown code blocks, backticks, or any conversational text.
Format specification:
[
  {
    "question": "The question text here?",
    "options": ["Option 0 text", "Option 1 text", "Option 2 text", "Option 3 text"],
    "answerIndex": 0, // integer index (0, 1, 2, or 3) of the correct option
    "points": 100
  }
]
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status} from Gemini API`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error("Empty response from Gemini API candidates structure");
    }

    const questions = JSON.parse(textResponse.trim());
    
    // Simple validation structure
    if (Array.isArray(questions) && questions.length === 5) {
      const validatedQuestions = questions.map((q) => ({
        question: q.question || "Trivia Question",
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
        answerIndex: typeof q.answerIndex === "number" && q.answerIndex >= 0 && q.answerIndex <= 3 ? q.answerIndex : 0,
        points: q.points || 100
      }));
      console.log(`[Gemini API] Successfully generated quiz questions for: "${title}"`);
      return validatedQuestions;
    } else {
      throw new Error("Returned content is not a 5-question array");
    }

  } catch (error) {
    console.error("[Gemini API] Error generating quiz, utilizing smart fallback:", error.message);
    return generateFallbackQuiz(title);
  }
}
