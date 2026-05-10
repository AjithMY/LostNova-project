/**
 * LostNova Matching Engine — Hybrid AI + Local Scoring
 * 
 * Architecture:
 *   1. Local scoring (synonym-aware keyword matching, color, brand, date) → fast filter
 *   2. Gemini AI semantic analysis → deep analysis for promising candidates
 *   3. Final score = weighted blend of both signals
 * 
 * Runs every 5 minutes via cron + on-demand after new item reports.
 */

const cron = require("node-cron");
const db   = require("../config/db");
const { analyzeMatch, isAvailable: geminiAvailable } = require("./geminiService");

// ─────────────────────────────────────────────────────────────────
// SYNONYM DICTIONARY
// ─────────────────────────────────────────────────────────────────
const SYNONYMS = {
  phone:     ["mobile","cellphone","smartphone","iphone","android","handphone","cell"],
  laptop:    ["notebook","macbook","chromebook","computer","pc","ultrabook"],
  earbuds:   ["airpods","earphones","headphones","buds","tws","wireless earphones","pods"],
  watch:     ["smartwatch","timepiece","fitbit","apple watch","wristwatch","garmin"],
  tablet:    ["ipad","pad","e-reader","kindle","surface"],
  charger:   ["adapter","cable","power brick","charging cable"],
  camera:    ["dslr","mirrorless","cam","digicam","webcam"],
  powerbank: ["power bank","battery pack","portable charger"],
  wallet:    ["purse","billfold","cardholder","money clip","card holder"],
  bag:       ["backpack","satchel","handbag","tote","rucksack","pouch","purse","sling"],
  keys:      ["key","keychain","keyring","car keys","house keys"],
  glasses:   ["spectacles","sunglasses","eyeglasses","shades","goggles"],
  umbrella:  ["brolly","parasol","rain umbrella"],
  bottle:    ["water bottle","flask","thermos","tumbler"],
  helmet:    ["bike helmet","cycle helmet","safety helmet"],
  id:        ["identity card","national id","student id","id card","identification"],
  passport:  ["travel document"],
  license:   ["driving license","driver license","dl"],
  card:      ["credit card","debit card","atm card","bank card","id card"],
  jacket:    ["coat","blazer","hoodie","sweatshirt","windbreaker","cardigan"],
  shoes:     ["sneakers","footwear","boots","sandals","heels","slippers"],
  cap:       ["hat","beanie","snapback","baseball cap"],
};

const WORD_TO_CANONICAL = {};
for (const [canonical, aliases] of Object.entries(SYNONYMS)) {
  WORD_TO_CANONICAL[canonical] = canonical;
  for (const alias of aliases) WORD_TO_CANONICAL[alias] = canonical;
}

const STOPWORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","was","are","were","be","been","have","has","had",
  "do","does","did","it","its","this","that","these","those","i","my",
  "lost","found","item","please","help","need","some","any","also",
]);

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────

function tokenize(str = "") {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter(w => w.length >= 2 && !STOPWORDS.has(w));
}

function canonicalize(words) {
  return words.map(w => WORD_TO_CANONICAL[w] || w);
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function fuzzyMatch(a, b) {
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen <= 4) return a === b;
  return levenshtein(a, b) <= (maxLen <= 6 ? 1 : 2);
}

function wordOverlapScore(wordsA, wordsB) {
  if (!wordsA.length || !wordsB.length) return 0;
  let matches = 0;
  for (const wa of wordsA)
    for (const wb of wordsB)
      if (fuzzyMatch(wa, wb)) { matches++; break; }
  return matches / new Set([...wordsA, ...wordsB]).size;
}

const COLORS = ["red","blue","green","black","white","yellow","brown","grey","gray",
                "pink","purple","orange","silver","gold","navy","beige","maroon"];
function extractColors(str = "") {
  const lower = str.toLowerCase();
  return COLORS.filter(c => lower.includes(c));
}

const BRANDS = ["apple","samsung","sony","hp","dell","lenovo","lg","asus","nike","adidas",
                "puma","zara","gucci","prada","fossil","casio","canon","nikon","logitech",
                "jbl","bose","xiaomi","oneplus","oppo","vivo","motorola"];
function extractBrands(str = "") {
  const lower = str.toLowerCase();
  return BRANDS.filter(b => lower.includes(b));
}

// ─────────────────────────────────────────────────────────────────
// LOCAL SCORING — fast deterministic match (0–100)
// ─────────────────────────────────────────────────────────────────
function scoreMatchLocal(lost, found) {
  let score = 0;

  // Category (25 pts)
  if (lost.category && found.category) {
    const lc = lost.category.toLowerCase().trim();
    const fc = found.category.toLowerCase().trim();
    if (lc === fc) score += 25;
    else if (lc.includes(fc) || fc.includes(lc)) score += 12;
  }

  // Title (30 pts)
  const lTitle = canonicalize(tokenize(`${lost.title}`));
  const fTitle = canonicalize(tokenize(`${found.title}`));
  score += Math.round(wordOverlapScore(lTitle, fTitle) * 30);

  // Description (15 pts)
  const lDesc = canonicalize(tokenize(`${lost.description || ""}`));
  const fDesc = canonicalize(tokenize(`${found.description || ""}`));
  if (lDesc.length && fDesc.length)
    score += Math.round(wordOverlapScore(lDesc, fDesc) * 15);

  // Cross-match bonus (5 pts)
  if (lTitle.length && fDesc.length && wordOverlapScore(lTitle, fDesc) > 0.3)
    score += 5;

  // Color (10 pts)
  const lColors = extractColors(`${lost.title} ${lost.description || ""}`);
  const fColors = extractColors(`${found.title} ${found.description || ""}`);
  if (lColors.filter(c => fColors.includes(c)).length > 0) score += 10;

  // Brand (10 pts)
  const lBrands = extractBrands(`${lost.title} ${lost.description || ""}`);
  const fBrands = extractBrands(`${found.title} ${found.description || ""}`);
  if (lBrands.filter(b => fBrands.includes(b)).length > 0) score += 10;

  // Date proximity (10 pts)
  if (lost.date_lost && found.date_found) {
    const daysDiff = (new Date(found.date_found) - new Date(lost.date_lost)) / 86400000;
    if (daysDiff >= 0 && daysDiff <= 1) score += 10;
    else if (daysDiff >= -1 && daysDiff <= 3) score += 8;
    else if (Math.abs(daysDiff) <= 7) score += 5;
    else if (Math.abs(daysDiff) <= 30) score += 2;
  }

  return Math.min(Math.round(score), 100);
}

// ─────────────────────────────────────────────────────────────────
// CONFIDENCE TIERS
// ─────────────────────────────────────────────────────────────────
function getConfidenceTier(score) {
  if (score >= 85) return "very_high";
  if (score >= 70) return "high";
  if (score >= 55) return "medium";
  return "low";
}

// ─────────────────────────────────────────────────────────────────
// MATCHING ENGINE
// ─────────────────────────────────────────────────────────────────
let _io = null;
function setIO(io) { _io = io; }

// Lock to prevent concurrent runs
let _running = false;

async function runMatchingEngine() {
  if (_running) return;
  _running = true;
  console.log("[MatchEngine] Starting run at", new Date().toISOString());

  try {
    const [lostItems]  = await db.query("SELECT * FROM lost_items  WHERE status = 'open'");
    const [foundItems] = await db.query("SELECT * FROM found_items WHERE status = 'open'");

    let newMatches = 0, updatedMatches = 0;
    const useAI = geminiAvailable();

    for (const lost of lostItems) {
      for (const found of foundItems) {
        if (lost.user_id === found.user_id) continue;

        // Step 1: Fast local score
        const localScore = scoreMatchLocal(lost, found);
        if (localScore < 30) continue; // Skip very low matches

        // Step 2: Gemini AI analysis (only for promising candidates >= 30)
        let finalScore = localScore;
        let explanation = null;

        if (useAI && localScore >= 30) {
          try {
            const aiResult = await analyzeMatch(lost, found);
            if (aiResult) {
              // Blend: 40% local + 60% AI for the final score
              finalScore = Math.round(localScore * 0.4 + aiResult.score * 0.6);
              explanation = aiResult.explanation;
            }
          } catch (err) {
            console.error("[MatchEngine] AI analysis failed for", lost.id, "-", found.id, ":", err.message);
            // Keep local score on AI failure
          }
        }

        // Minimum threshold to store
        if (finalScore < 35) continue;

        const confidence = getConfidenceTier(finalScore);

        // Upsert match
        const [r] = await db.query(
          `INSERT INTO matches (lost_item_id, found_item_id, score, ai_explanation, status)
           VALUES (?, ?, ?, ?, 'pending')
           ON DUPLICATE KEY UPDATE
             score          = IF(VALUES(score) > score, VALUES(score), score),
             ai_explanation = IF(VALUES(score) > score, VALUES(ai_explanation), ai_explanation)`,
          [lost.id, found.id, finalScore, explanation]
        );

        const isNew = r.insertId > 0;
        if (isNew) newMatches++;
        else if (r.affectedRows > 0) updatedMatches++;

        // Notify on new high-confidence matches
        if (isNew && finalScore >= 70) {
          const tier = confidence === "very_high" ? "🎯 Very High" : "⚡ High";
          const aiTag = useAI ? " (AI-verified)" : "";
          
          await db.query(
            `INSERT IGNORE INTO notifications (user_id, type, title, body) VALUES (?, 'match', ?, ?)`,
            [
              lost.user_id,
              `${tier} Match Found — ${finalScore}% confidence${aiTag}`,
              `Your "${lost.title}" matches a found "${found.title}". ${explanation || "Review the match to verify ownership."}`,
            ]
          );

          await db.query(
            `INSERT IGNORE INTO notifications (user_id, type, title, body) VALUES (?, 'match', ?, ?)`,
            [
              found.user_id,
              `Potential Owner Found — ${finalScore}% match${aiTag}`,
              `The item you found "${found.title}" may belong to someone. A match has been generated.`,
            ]
          );

          if (_io) {
            _io.to(`user:${lost.user_id}`).emit("notifications:changed");
            _io.to(`user:${found.user_id}`).emit("notifications:changed");
          }
        }
      }
    }

    // Log engine run
    await db.query(
      `INSERT INTO activity_logs (action, entity_type, entity_id) VALUES ('MATCH_ENGINE_RUN', 'system', 0)`
    );

    if ((newMatches > 0 || updatedMatches > 0) && _io) {
      _io.emit("matches:changed");
      _io.emit("stats:changed");
      _io.emit("activity:changed");
    }

    const mode = useAI ? "AI+Local" : "Local-only";
    console.log(`[MatchEngine] Done (${mode}). ${newMatches} new, ${updatedMatches} updated from ${lostItems.length}×${foundItems.length} candidates.`);
  } catch (err) {
    console.error("[MatchEngine] Error:", err.message);
  } finally {
    _running = false;
  }
}

// Schedule: every 5 minutes
cron.schedule("*/5 * * * *", runMatchingEngine);

// Run once at startup (delayed to let DB connect)
setTimeout(runMatchingEngine, 2000);

module.exports = { runMatchingEngine, setIO, scoreMatchLocal, tokenize, canonicalize };
