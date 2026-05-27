import fs from "fs";
import crypto from "crypto";
import { DATA_DIR, USERS_FILE } from "../config/constants.js";
import { updatePlayerStats } from "./leaderboardService.js";

const SECRET_KEY = process.env.SESSION_SECRET || "kaevrix-magical-secret-key-1092837";
let users = [];

export function loadUsers() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }

  try {
    if (fs.existsSync(USERS_FILE)) {
      users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    } else {
      users = [];
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }
  } catch (error) {
    console.error("Error reading users file, using empty array:", error);
    users = [];
  }
}

export function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Failed to save users:", error);
  }
}

// Stateless signed tokens
export function generateToken(username) {
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(username).digest("hex");
  return `${Buffer.from(username).toString("base64")}.${signature}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  
  try {
    const username = Buffer.from(parts[0], "base64").toString("utf-8");
    const signature = parts[1];
    const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(username).digest("hex");
    if (signature === expectedSignature) {
      return username;
    }
  } catch (e) {
    return null;
  }
  return null;
}

export function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

function checkJourneyDay(user) {
  if (!user.createdAt) {
    user.createdAt = new Date().toISOString();
  }
  if (user.lastSeenDay === undefined) {
    user.lastSeenDay = 0;
  }

  const createdAt = new Date(user.createdAt);
  const now = new Date();
  const diffMs = now - createdAt;
  const currentDay = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  if (currentDay > user.lastSeenDay) {
    user.lastSeenDay = currentDay;
    saveUsers();
    return currentDay;
  }

  return null;
}

export function registerUser(username, password, avatar, selectedClass) {
  const normalized = username.trim();
  if (!normalized) {
    throw new Error("Gamer tag cannot be empty");
  }
  if (!password || password.length < 4) {
    throw new Error("Passkey must be at least 4 characters long");
  }

  const existing = users.find(u => u.username.toLowerCase() === normalized.toLowerCase());
  if (existing) {
    throw new Error("Alias already taken in this domain");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  const newUser = {
    username: normalized,
    salt,
    passwordHash,
    avatar,
    selectedClass: selectedClass || "doomscroller",
    xp: 0,
    level: 1,
    wins: 0,
    losses: 0,
    totalVideosWatched: 0,
    totalWatchTime: 0,
    watchHistory: [],
    createdAt: new Date().toISOString(),
    lastSeenDay: 1
  };

  users.push(newUser);
  saveUsers();

  // Add the user to the leaderboard records too
  updatePlayerStats(normalized, 0, false, null, avatar, selectedClass);

  const token = generateToken(normalized);
  const sanitized = sanitizeUser(newUser);
  sanitized.showDailyAnnouncement = 1;
  return { user: sanitized, token };
}

export function loginUser(username, password) {
  const normalized = username.trim();
  const user = users.find(u => u.username.toLowerCase() === normalized.toLowerCase());
  if (!user) {
    throw new Error("Invalid tag or passkey");
  }

  const checkHash = hashPassword(password, user.salt);
  if (checkHash !== user.passwordHash) {
    throw new Error("Invalid tag or passkey");
  }

  const currentDay = checkJourneyDay(user);

  const token = generateToken(user.username);
  const sanitized = sanitizeUser(user);
  if (currentDay) {
    sanitized.showDailyAnnouncement = currentDay;
  }
  return { user: sanitized, token };
}

export function getUserThemeInfo(username) {
  const normalized = username.trim();
  const user = users.find(u => u.username.toLowerCase() === normalized.toLowerCase());
  if (user) {
    return {
      username: user.username,
      selectedClass: user.selectedClass,
      avatar: user.avatar
    };
  }
  return null;
}

export function getUserProfile(username) {
  const normalized = username.trim();
  const user = users.find(u => u.username.toLowerCase() === normalized.toLowerCase());
  if (user) {
    const currentDay = checkJourneyDay(user);
    const sanitized = sanitizeUser(user);
    if (currentDay) {
      sanitized.showDailyAnnouncement = currentDay;
    }
    return sanitized;
  }
  return null;
}

import { registerStatsCallback } from "./leaderboardService.js";

registerStatsCallback((username, xpGained, won, videoDetails, avatar, selectedClass) => {
  const normalized = username.trim();
  const user = users.find(u => u.username.toLowerCase() === normalized.toLowerCase());
  if (user) {
    user.xp += xpGained;
    user.level = Math.floor(user.xp / 200) + 1;
    
    if (won !== null) {
      if (won) {
        user.wins = (user.wins || 0) + 1;
      } else {
        user.losses = (user.losses || 0) + 1;
      }
    }
    
    if (avatar) user.avatar = avatar;
    if (selectedClass) user.selectedClass = selectedClass;

    if (videoDetails) {
      if (videoDetails.solo) {
        if (!user.watchHistory) user.watchHistory = [];
        user.watchHistory.unshift({ title: videoDetails.title, timestamp: new Date().toISOString(), solo: true });
        if (user.watchHistory.length > 20) user.watchHistory.pop();
        user.totalVideosWatched = (user.totalVideosWatched || 0) + 1;
      } else {
        user.totalVideosWatched = (user.totalVideosWatched || 0) + 1;
        user.totalWatchTime = (user.totalWatchTime || 0) + (videoDetails.duration || 0);
        if (!user.watchHistory) user.watchHistory = [];
        user.watchHistory.unshift({
          id: videoDetails.id,
          title: videoDetails.title,
          timestamp: new Date().toISOString()
        });
        if (user.watchHistory.length > 20) user.watchHistory.pop();
      }
    }
    saveUsers();
  }
});

function sanitizeUser(user) {
  const { salt, passwordHash, ...safe } = user;
  return safe;
}
