const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

// Find the start of the return statement
const returnIdx = code.lastIndexOf('  return (\n    <div className="app-container">');

const logicPart = code.substring(0, returnIdx);
const uiPart = code.substring(returnIdx);

const appPropsStr = "username, setUsername, avatar, setAvatar, selectedClass, setSelectedClass, isRegistered, setIsRegistered, xp, setXp, level, setLevel, wins, setWins, losses, setLosses, isDarkMode, setIsDarkMode, token, setToken, isMusicMuted, setIsMusicMuted, musicProfile, setMusicProfile, keepMusicInGame, setKeepMusicInGame, showMusicSettings, setShowMusicSettings, showSurpassLimits, setShowSurpassLimits, isExitIntercept, setIsExitIntercept, interceptTrackIdx, setInterceptTrackIdx, showDailyModal, setShowDailyModal, journeyDay, setJourneyDay, energy, setEnergy, isFrozen, setIsFrozen, isBlurred, setIsBlurred, progressAtQuizEntry, setProgressAtQuizEntry, doubleDownQuestions, setDoubleDownQuestions, disabledOptions, setDisabledOptions, leaderboard, setLeaderboard, curatedVideos, setCuratedVideos, selectedVideo, setSelectedVideo, selectedSoloVideo, setSelectedSoloVideo, vsBot, setVsBot, searchQuery, setSearchQuery, activeSearchQuery, setActiveSearchQuery, searchResults, setSearchResults, isSearching, setIsSearching, socket, setSocket, status, setStatus, room, setRoom, opponent, setOpponent, countdown, setCountdown, myProgress, setMyProgress, opponentProgress, setOpponentProgress, opponentWaiting, setOpponentWaiting, opponentSubmitted, setOpponentSubmitted, chatMessages, setChatMessages, chatInput, setChatInput, questions, setQuestions, currentQuestionIdx, setCurrentQuestionIdx, selectedAnswers, setSelectedAnswers, quizTimer, setQuizTimer, gameResults, setGameResults, xpGained, setXpGained, leveledUp, setLeveledUp, handleLogout, cancelMatchmaking, handleSearchSubmit, clearSearch, resetToDashboard, startMatchmaking, handleReadyToPlay, handleSendChat, handleVideoProgress, handleVideoFinished, handleUsePowerup, handleSelectOption, handleDoubleDown, handleHackersClue, submitQuizAnswers, handleNextQuestion, handleStartSoloStudy, handleAddSoloXp, cycleMusicProfile, exitAttemptsRef, initializeSocketAndRegister";

fs.writeFileSync('client/src/App.jsx', logicPart + '\n  const appProps = { ' + appPropsStr + ' };\n  return <AppRouter {...appProps} />;\n}\n');

fs.writeFileSync('client/src/AppRouter.jsx', `import React from "react";
import WelcomeScreen from "./features/Auth/WelcomeScreen";
import Dashboard from "./features/Dashboard/Dashboard";
import Matchmaking from "./features/GameArena/Matchmaking";
import Lobby from "./features/GameArena/Lobby";
import Countdown from "./features/Shared/Countdown";
import GameArena from "./features/GameArena/GameArena";
import QuizPanel from "./features/GameArena/QuizPanel";
import ResultsPanel from "./features/GameArena/ResultsPanel";
import SurpassLimits from "./features/Dashboard/SurpassLimits";
import DailyLogin from "./features/Dashboard/DailyLogin";
import SoloStudyRoom from "./features/SoloStudy/SoloStudyRoom";

export default function AppRouter(props) {
  const { ${appPropsStr} } = props;

${uiPart}
`);

console.log("Split successful!");
