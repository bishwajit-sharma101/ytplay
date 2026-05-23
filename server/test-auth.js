import { 
  loadUsers, 
  registerUser, 
  loginUser, 
  verifyToken, 
  getUserThemeInfo,
  getUserProfile
} from "./services/authService.js";
import { loadLeaderboard } from "./services/leaderboardService.js";

async function runTests() {
  console.log("=== STARTING AUTH LAYER VERIFICATION ===");
  
  // 1. Initial Load
  loadLeaderboard();
  loadUsers();
  console.log("✔ Persistent user storage initialized");

  const testUser = "Neo_" + Math.random().toString(36).substring(7);
  const testPass = "matrixPass123";
  const testClass = "speedrunner";
  const testAvatar = "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka";

  // 2. Register User
  console.log(`\nTesting user registration: "${testUser}"...`);
  const regResult = registerUser(testUser, testPass, testAvatar, testClass);
  
  if (!regResult || !regResult.token) {
    throw new Error("Registration did not return a session token");
  }
  if (regResult.user.username !== testUser) {
    throw new Error("Returned username does not match registered username");
  }
  console.log("✔ Registration successful. Returned token:", regResult.token);

  // 3. Prevent duplicate alias registrations
  console.log("\nTesting duplicate alias prevention...");
  try {
    registerUser(testUser, "anotherPass", testAvatar, testClass);
    throw new Error("Duplicate registration succeeded when it should have failed!");
  } catch (error) {
    console.log("✔ Duplicate registration blocked with message:", error.message);
  }

  // 4. Validate user login with correct credentials
  console.log("\nTesting login with correct passkey...");
  const loginResult = loginUser(testUser, testPass);
  if (!loginResult || !loginResult.token) {
    throw new Error("Login did not return a session token");
  }
  console.log("✔ Login successful. User level:", loginResult.user.level);

  // 5. Block login with incorrect password
  console.log("\nTesting login with incorrect passkey...");
  try {
    loginUser(testUser, "wrongPassword");
    throw new Error("Login succeeded with incorrect password!");
  } catch (error) {
    console.log("✔ Login correctly blocked with message:", error.message);
  }

  // 6. Token signature validation
  console.log("\nTesting token verification...");
  const verifiedUsername = verifyToken(regResult.token);
  if (verifiedUsername !== testUser) {
    throw new Error(`Token verification failed. Expected "${testUser}", got "${verifiedUsername}"`);
  }
  console.log("✔ Token signature is valid. Verified username:", verifiedUsername);

  // 7. Get theme info for recognized class transition
  console.log("\nTesting class theme matching...");
  const themeInfo = getUserThemeInfo(testUser);
  if (!themeInfo || themeInfo.selectedClass !== testClass) {
    throw new Error("Failed to retrieve correct theme configuration");
  }
  console.log(`✔ Theme retrieved: User "${themeInfo.username}" is matching class "${themeInfo.selectedClass}"`);

  console.log("\n=== ALL AUTH LAYER TESTS PASSED SUCCESSFULLY ===");
}

runTests().catch((error) => {
  console.error("\n❌ VERIFICATION TEST FAILED:", error);
  process.exit(1);
});
