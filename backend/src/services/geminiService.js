/**
 * Google Gemini AI Service — Semantic Item Matching
 * 
 * Uses Gemini to analyze lost/found item pairs and produce:
 *   - A confidence score (0–100)
 *   - A short explanation of why items match or don't
 * 
 * Falls back gracefully if GEMINI_API_KEY is not set.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
let model = null;

function initGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "YOUR_GEMINI_API_KEY_HERE" || key === "your_gemini_api_key_here") {
    console.log("   Gemini AI   :  ✗ No API key — using local matching only");
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(key);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("   Gemini AI   :  ✓ Connected (gemini-2.0-flash)");
    return true;
  } catch (err) {
    console.error("   Gemini AI   :  ✗ Init failed —", err.message);
    return false;
  }
}

/**
 * Ask Gemini to semantically compare a lost item vs a found item.
 * Returns { score: 0–100, explanation: string } or null on failure.
 */
async function analyzeMatch(lostItem, foundItem) {
  if (!model) return null;

  const prompt = `You are an AI matching engine for a Lost & Found system.

Compare the LOST item and FOUND item below. Determine how likely they are the SAME physical item.

LOST ITEM:
- Title: ${lostItem.title || "N/A"}
- Description: ${lostItem.description || "N/A"}
- Category: ${lostItem.category || "N/A"}
- Location Lost: ${lostItem.location_lost || "N/A"}
- Date Lost: ${lostItem.date_lost || "N/A"}

FOUND ITEM:
- Title: ${foundItem.title || "N/A"}
- Description: ${foundItem.description || "N/A"}
- Category: ${foundItem.category || "N/A"}
- Location Found: ${foundItem.location_found || "N/A"}
- Date Found: ${foundItem.date_found || "N/A"}

Analyze these factors:
1. Item type/category similarity
2. Title and description semantic similarity (colors, brands, distinguishing features)
3. Location proximity (same building/area = higher score)
4. Date proximity (found after lost = logical, same day = highest)
5. Any distinguishing details that match or conflict

Respond ONLY with valid JSON (no markdown, no backticks):
{"score": <number 0-100>, "explanation": "<2-3 sentence explanation>"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Extract JSON from response (handle markdown code blocks if present)
    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];
    
    const parsed = JSON.parse(jsonStr);
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
    const explanation = String(parsed.explanation || "").slice(0, 500);
    
    return { score, explanation };
  } catch (err) {
    console.error("[Gemini] Analysis failed:", err.message);
    return null;
  }
}

/**
 * Batch-analyze multiple match candidates.
 * Processes sequentially to respect API rate limits.
 * Returns Map<string, { score, explanation }> keyed by "lostId-foundId"
 */
async function analyzeBatch(candidates) {
  if (!model) return new Map();
  
  const results = new Map();
  
  for (const { lost, found } of candidates) {
    const key = `${lost.id}-${found.id}`;
    try {
      const result = await analyzeMatch(lost, found);
      if (result) results.set(key, result);
      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`[Gemini] Batch item ${key} failed:`, err.message);
    }
  }
  
  return results;
}

function isAvailable() {
  return model !== null;
}

module.exports = { initGemini, analyzeMatch, analyzeBatch, isAvailable };
