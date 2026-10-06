// Simple test script to verify the input parsing works
import { parseEpisodeInput } from "./lib/rickandmorty/input";
import { ValidationError } from "./lib/rickandmorty/errors";

console.log("Testing input parsing...");

try {
  const result = parseEpisodeInput("15");
  console.log("ID test passed:", result);
} catch (error) {
  console.error("ID test failed:", error.message);
}

try {
  const result = parseEpisodeInput("s02e04");
  console.log("Code test passed:", result);
} catch (error) {
  console.error("Code test failed:", error.message);
}

try {
  parseEpisodeInput("");
  console.log("Empty input test failed - should have thrown");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Empty input test passed:", error.message);
  } else {
    console.error("Empty input test failed with wrong error type:", error.message);
  }
}

try {
  parseEpisodeInput("abc");
  console.log("Invalid input test failed - should have thrown");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Invalid input test passed:", error.message);
  } else {
    console.error("Invalid input test failed with wrong error type:", error.message);
  }
}

console.log("Testing complete.");
