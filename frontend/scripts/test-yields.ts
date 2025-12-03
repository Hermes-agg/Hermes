// ./scripts/test-yields.ts

import { YieldAPI } from "@/lib/api/yield-api";

// Inject frontend base URL (same as next.config.env)
(global as any).App_Api_Base_Url = "http://localhost:3000";

async function runTests() {
  try {
    console.log("=== Testing: Get All Yields ===");
    const allYields = await YieldAPI.getAllYields({
      asset: "USDC",
      amount: 1000000,
      limit: 50,
    });
    console.log("All Yields Response:", allYields);

    console.log("\n=== Testing: Get Best Route ===");
    const bestRoute = await YieldAPI.getBestRoute({
      asset: "USDC",
      amount: 1000000,
      riskProfile: "low",
    });
    console.log("Best Route Response:", bestRoute);
  } catch (error) {
    console.error("API Test Error:", error);
  }
}

runTests();
