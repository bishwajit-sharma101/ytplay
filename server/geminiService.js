import dotenv from "dotenv";
dotenv.config();

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
