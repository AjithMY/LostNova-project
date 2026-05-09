const cron = require("node-cron");
const db    = require("../config/db");

// ─────────────────────────────────────────────────────────────────
// SYNONYM DICTIONARY — maps common item aliases to canonical groups
// ─────────────────────────────────────────────────────────────────
const SYNONYMS = {
  // Electronics
  phone:       ["mobile","cellphone","smartphone","iphone","android","handphone","cell"],
  laptop:      ["notebook","macbook","chromebook","computer","pc","ultrabook"],
  earbuds:     ["airpods","earphones","headphones","buds","tws","wireless earphones","pods"],
  watch:       ["smartwatch","timepiece","fitbit","apple watch","wristwatch","garmin"],
  tablet:      ["ipad","pad","e-reader","kindle","surface"],
  charger:     ["adapter","cable","power brick","charging cable"],
  camera:      ["dslr","mirrorless","cam","digicam","webcam"],
  powerbank:   ["power bank","battery pack","portable charger"],

  // Personal items
  wallet:      ["purse","billfold","cardholder","money clip","card holder"],
  bag:         ["backpack","satchel","handbag","tote","rucksack","pouch","purse","sling"],
  keys:        ["key","keychain","keyring","car keys","house keys"],
  glasses:     ["spectacles","sunglasses","eyeglasses","shades","goggles"],
  umbrella:    ["brolly","parasol","rain umbrella"],
  bottle:      ["water bottle","flask","thermos","tumbler"],
  helmet:      ["bike helmet","cycle helmet","safety helmet"],

  // Documents
  id:          ["identity card","national id","student id","id card","identification"],
  passport:    ["travel document"],
  license:     ["driving license","driver license","dl"],
  card:        ["credit card","debit card","atm card","bank card","id card"],

  // Clothing
  jacket:      ["coat","blazer","hoodie","sweatshirt","windbreaker","cardigan"],
  shoes:       ["sneakers","footwear","boots","sandals","heels","slippers"],
  cap:         ["hat","beanie","snapback","baseball cap"],
};

// Build reverse-lookup: word → canonical key
const WORD_TO_CANONICAL = {};
for (const [canonical, aliases] of Object.entries(SYNONYMS)) {
  WORD_TO_CANONICAL[canonical] = canonical;
  for (const alias of aliases) {
    WORD_TO_CANONICAL[alias] = canonical;
  }
}

// Common stopwords to exclude from keyword extraction
const STOPWORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","was","are","were","be","been","have","has","had",
  "do","does","did","it","its","this","that","these","those","i","my",
  "lost","found","item","please","help","need","some","any","also",
]);

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────

/** Tokenize a string into cleaned lowercase words */
function tokenize(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOPWORDS.has(w));
}

/** Map words to their canonical synonyms */
function canonicalize(words) {
  return words.map(w => WORD_TO_CANONICAL[w] || w);
}

/** Levenshtein distance for typo tolerance */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

/** Fuzzy match: returns true if two words are within edit distance proportional to length */
function fuzzyMatch(a, b) {
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen <= 4) return a === b; // short words must be exact
  const threshold = maxLen <= 6 ? 1 : 2;
  return levenshtein(a, b) <= threshold;
}

/** Overlap score between two canonical word arrays (0–1) */
function wordOverlapScore(wordsA, wordsB) {
  if (!wordsA.length || !wordsB.length) return 0;
  let matches = 0;
  for (const wa of wordsA) {
    for (const wb of wordsB) {
      if (fuzzyMatch(wa, wb)) { matches++; break; }
    }
  }
  // Jaccard-style: matches / union
  const union = new Set([...wordsA, ...wordsB]).size;
  return matches / union;
}

/** Extract color hints from text */
const COLORS = ["red","blue","green","black","white","yellow","brown","grey","gray",
                "pink","purple","orange","silver","gold","navy","beige","maroon"];
function extractColors(str = "") {
  const lower = str.toLowerCase();
  return COLORS.filter(c => lower.includes(c));
}

/** Extract brand hints from text */
const BRANDS = ["apple","samsung","sony","hp","dell","lenovo","lg","asus","nike","adidas",
                "puma","zara","h&m","gucci","prada","fossil","casio","canon","nikon","logitech",
                "jbl","bose","xiaomi","oneplus","oppo","vivo","motorola"];
function extractBrands(str = "") {
  const lower = str.toLowerCase();
  return BRANDS.filter(b => lower.includes(b));
}

// ─────────────────────────────────────────────────────────────────
// CORE SCORING FUNCTION
// ─────────────────────────────────────────────────────────────────
/**
 * Score a (lost, found) pair. Returns 0–100.
 *
 * Weight breakdown:
 *   Category exact    : 25 pts
 *   Category fuzzy    : 12 pts
 *   Title similarity  : 30 pts  (synonym-aware + fuzzy)
 *   Description sim   : 15 pts  (synonym-aware)
 *   Color match       : 10 pts
 *   Brand match       : 10 pts
 *   Date proximity    : 10 pts
 *                     --------
 *   Max possible      : 100 pts (capped)
 */
function scoreMatch(lost, found) {
  let score = 0;
  const breakdown = {};

  // ── Category (25 pts) ──────────────────────────────────────────
  if (lost.category && found.category) {
    const lc = lost.category.toLowerCase().trim();
    const fc = found.category.toLowerCase().trim();
    if (lc === fc) {
      score += 25; breakdown.category = 25;
    } else if (lc.includes(fc) || fc.includes(lc)) {
      score += 12; breakdown.category = 12;
    } else {
      breakdown.category = 0;
    }
  }

  // ── Title similarity (30 pts) ─────────────────────────────────
  const lTitleWords  = canonicalize(tokenize(`${lost.title}`));
  const fTitleWords  = canonicalize(tokenize(`${found.title}`));
  const titleOverlap = wordOverlapScore(lTitleWords, fTitleWords);
  const titlePts     = Math.round(titleOverlap * 30);
  score += titlePts;
  breakdown.title = titlePts;

  // ── Description similarity (15 pts) ──────────────────────────
  const lDescWords = canonicalize(tokenize(`${lost.description || ""}`));
  const fDescWords = canonicalize(tokenize(`${found.description || ""}`));
  if (lDescWords.length && fDescWords.length) {
    const descOverlap = wordOverlapScore(lDescWords, fDescWords);
    const descPts     = Math.round(descOverlap * 15);
    score += descPts;
    breakdown.description = descPts;
  }

  // Cross-match: lost title vs found description + vice versa (bonus 5 pts)
  if (lTitleWords.length && fDescWords.length) {
    const cross = wordOverlapScore(lTitleWords, fDescWords);
    if (cross > 0.3) { score += 5; breakdown.crossMatch = 5; }
  }

  // ── Color match (10 pts) ──────────────────────────────────────
  const lColors = extractColors(`${lost.title} ${lost.description || ""}`);
  const fColors = extractColors(`${found.title} ${found.description || ""}`);
  const commonColors = lColors.filter(c => fColors.includes(c));
  if (commonColors.length > 0) {
    const colorPts = Math.min(10, commonColors.length * 10);
    score += colorPts;
    breakdown.color = colorPts;
  }

  // ── Brand match (10 pts) ──────────────────────────────────────
  const lBrands = extractBrands(`${lost.title} ${lost.description || ""}`);
  const fBrands = extractBrands(`${found.title} ${found.description || ""}`);
  const commonBrands = lBrands.filter(b => fBrands.includes(b));
  if (commonBrands.length > 0) {
    score += 10;
    breakdown.brand = 10;
  }

  // ── Date proximity (10 pts) ───────────────────────────────────
  if (lost.date_lost && found.date_found) {
    const lDate = new Date(lost.date_lost);
    const fDate = new Date(found.date_found);
    // Found date should be >= lost date (you find after you lose)
    const daysDiff = (fDate - lDate) / (1000 * 60 * 60 * 24);
    if (daysDiff >= 0 && daysDiff <= 1)       { score += 10; breakdown.date = 10; }
    else if (daysDiff >= -1 && daysDiff <= 3)  { score += 8;  breakdown.date = 8;  }
    else if (Math.abs(daysDiff) <= 7)          { score += 5;  breakdown.date = 5;  }
    else if (Math.abs(daysDiff) <= 30)         { score += 2;  breakdown.date = 2;  }
    else                                        { breakdown.date = 0; }
  }

  const finalScore = Math.min(Math.round(score), 100);
  return { score: finalScore, breakdown };
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
// MATCHING ENGINE RUN
// ─────────────────────────────────────────────────────────────────
let _io = null;
function setIO(io) { _io = io; }

async function runMatchingEngine() {
  console.log("[MatchEngine] Starting run at", new Date().toISOString());

  try {
    const [lostItems]  = await db.query("SELECT * FROM lost_items  WHERE status = 'open'");
    const [foundItems] = await db.query("SELECT * FROM found_items WHERE status = 'open'");

    let newMatches = 0;
    let updatedMatches = 0;

    for (const lost of lostItems) {
      for (const found of foundItems) {
        // Don't match a user's own items against themselves
        if (lost.user_id === found.user_id) continue;

        const { score, breakdown } = scoreMatch(lost, found);

        // Minimum threshold: 40 pts to store (we want to capture medium matches too)
        if (score < 40) continue;

        const confidence = getConfidenceTier(score);

        // Upsert — update score if better match found
        const [r] = await db.query(
          `INSERT INTO matches (lost_item_id, found_item_id, score, status)
           VALUES (?, ?, ?, 'pending')
           ON DUPLICATE KEY UPDATE
             score  = IF(VALUES(score) > score, VALUES(score), score)`,
          [lost.id, found.id, score]
        );

        const isNew = r.insertId > 0;
        if (isNew) newMatches++;
        else if (r.affectedRows > 0) updatedMatches++;

        // Notify on new high-confidence matches
        if (isNew && score >= 70) {
          const tier = confidence === "very_high" ? "🎯 Very High" : "⚡ High";
          await db.query(
            `INSERT IGNORE INTO notifications (user_id, type, title, body) VALUES (?, 'match', ?, ?)`,
            [
              lost.user_id,
              `${tier} Match Found — ${score}% confidence`,
              `Your "${lost.title}" matches a found "${found.title}". Review the match to verify ownership.`,
            ]
          );

          // Also notify the found item reporter
          await db.query(
            `INSERT IGNORE INTO notifications (user_id, type, title, body) VALUES (?, 'match', ?, ?)`,
            [
              found.user_id,
              `Potential Owner Found — ${score}% match`,
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

    // Broadcast if matches changed
    if ((newMatches > 0 || updatedMatches > 0) && _io) {
      _io.emit("matches:changed");
      _io.emit("stats:changed");
      _io.emit("activity:changed");
    }

    console.log(`[MatchEngine] Done. ${newMatches} new, ${updatedMatches} updated from ${lostItems.length}×${foundItems.length} candidates.`);
  } catch (err) {
    console.error("[MatchEngine] Error:", err.message);
  }
}

// Schedule: every 5 minutes
cron.schedule("*/5 * * * *", runMatchingEngine);

// Run once at startup
runMatchingEngine();

module.exports = { runMatchingEngine, setIO, scoreMatch, tokenize, canonicalize };
