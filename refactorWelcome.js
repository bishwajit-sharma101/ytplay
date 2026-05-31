const fs = require('fs');

let code = fs.readFileSync('client/src/features/Auth/WelcomeScreen.jsx', 'utf8');

const lines = code.split('\n');

const wStartLine = 609; // 1-indexed
// Find the end of workspace portal. It ends right before {/* STYLE 2: RETRO
const rStartLine = 1503;

const wCode = lines.slice(wStartLine - 1, rStartLine - 1).join('\n');

// Find the end of retro portal. It ends right before the closing </div> of auth-container
let rEndLine = lines.length - 1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('</div>')) {
    // skip the outer div closing, find the one before
    break;
  }
}
// Actually, let's just use string replacement on the whole file instead of precise lines.

// Since the user is okay with the current implementation and just wants modularity,
// let's extract them.

const workspaceStr = "        {/* STYLE 1: WORKSPACE / NEON-GAMER */}";
const retroStr = "        {/* STYLE 2: RETRO ARCADE */}";

const wStartIdx = code.indexOf(workspaceStr);
const rStartIdx = code.indexOf(retroStr);

const wBlock = code.substring(wStartIdx, rStartIdx);

const rEndStr = "      </div>\n    </div>\n  );\n}";
const rEndIdx = code.indexOf(rEndStr);
const rBlock = code.substring(rStartIdx, rEndIdx);

// Extract props
const propNamesStr = "onAuthSuccess, isDarkMode, currentThemeColor, portalStyle, setPortalStyle, cycleMusicProfile, handleLoginSubmit, handleRegisterSubmit, loginUsername, setLoginUsername, loginPassword, setLoginPassword, loginError, isLoggingIn, recognizedClass, recognizedAvatar, signUpStep, setSignUpStep, selectedClassId, setSelectedClassId, onboardingQ, setOnboardingQ, onboardingAnswers, setOnboardingAnswers, onboardingInputVal, setOnboardingInputVal, typedQuestion, setTypedQuestion, isTypingQuestion, handleQuestionNext, handleQuestionBack, handleQuestionKeyDown, avatarSeed, setAvatarSeed, avatar, setAvatar, startTerminalSequence, terminalLines, showTerminal, retroShowForm, setRetroShowForm, retroTipIdx";

fs.writeFileSync('client/src/features/Auth/WorkspacePortal.jsx', `import React from "react";
import { CLASS_COLORS, CLASS_ICONS, CLASS_STATS, PATHFINDER_QUESTIONS } from "../../utils/authConstants";

export default function WorkspacePortal(props) {
  const { ${propNamesStr} } = props;

  return (
    <>
${wBlock}
    </>
  );
}
`);

fs.writeFileSync('client/src/features/Auth/RetroPortal.jsx', `import React from "react";
import { CLASS_COLORS, CLASS_ICONS, CLASS_STATS, PATHFINDER_QUESTIONS, RETRO_TIPS } from "../../utils/authConstants";

export default function RetroPortal(props) {
  const { ${propNamesStr} } = props;

  return (
    <>
${rBlock}
    </>
  );
}
`);

const newWelcomeScreen = code.substring(0, wStartIdx) + 
`        {portalStyle === "workspace" && <WorkspacePortal {...propsObj} />}
        {portalStyle === "retro-game" && <RetroPortal {...propsObj} />}
` + code.substring(rEndIdx);

// We must define propsObj right before return
const returnIdx = newWelcomeScreen.indexOf('return (');
const finalCode = newWelcomeScreen.substring(0, returnIdx) + `  const propsObj = { ${propNamesStr} };\n  ` + newWelcomeScreen.substring(returnIdx);

// We must add imports to WelcomeScreen
const importIdx = finalCode.indexOf('export default function WelcomeScreen');
const finalCodeWithImports = finalCode.substring(0, importIdx) + `import WorkspacePortal from "./WorkspacePortal";\nimport RetroPortal from "./RetroPortal";\n\n` + finalCode.substring(importIdx);


fs.writeFileSync('client/src/features/Auth/WelcomeScreen.jsx', finalCodeWithImports);

console.log("WelcomeScreen Refactored Successfully!");
