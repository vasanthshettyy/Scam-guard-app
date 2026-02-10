/**
 * ScamDetector — Rule-based scam detection engine.
 *
 * Analyzes text against weighted keyword/phrase patterns
 * across multiple scam categories. Returns a risk score (0–100),
 * a status label, matched reasons, and a recommendation.
 *
 * Zero external dependencies. Fully client-side.
 */

// ── Pattern Categories ──────────────────────────────────────────────
// Each category has a name, weight (importance multiplier), and
// an array of { pattern: RegExp, label: string } entries.

const SCAM_PATTERNS = [
    {
        category: 'Urgency & Pressure',
        weight: 8,
        patterns: [
            { pattern: /act\s*now/i, label: '"Act now" pressure tactic' },
            { pattern: /limited\s*time/i, label: '"Limited time" urgency' },
            { pattern: /hurry/i, label: '"Hurry" pressure language' },
            { pattern: /don'?t\s*miss\s*out/i, label: 'Fear of missing out (FOMO)' },
            { pattern: /expires?\s*(soon|today|tonight|tomorrow)/i, label: 'Artificial deadline' },
            { pattern: /last\s*chance/i, label: '"Last chance" pressure' },
            { pattern: /only\s*\d+\s*(left|remaining|spots?|seats?)/i, label: 'Artificial scarcity' },
            { pattern: /respond\s*(immediately|urgently|asap)/i, label: 'Urgent response demand' },
            { pattern: /within\s*\d+\s*(hours?|minutes?)/i, label: 'Time-limited pressure' },
            { pattern: /before\s*it'?s?\s*too\s*late/i, label: '"Before it\'s too late" fear tactic' },
        ],
    },
    {
        category: 'Guaranteed Returns',
        weight: 10,
        patterns: [
            { pattern: /guarantee[ds]?\s*(return|profit|income|earning)/i, label: 'Guaranteed returns claim' },
            { pattern: /100%\s*(safe|secure|guaranteed|profit)/i, label: '100% safety/profit claim' },
            { pattern: /no\s*risk/i, label: '"No risk" claim' },
            { pattern: /risk[- ]?free/i, label: '"Risk-free" claim' },
            { pattern: /double\s*your\s*(money|investment)/i, label: '"Double your money" promise' },
            { pattern: /(\d{2,})[x×]\s*return/i, label: 'Unrealistic multiplier return' },
            { pattern: /get\s*rich\s*(quick|fast)/i, label: '"Get rich quick" language' },
            { pattern: /passive\s*income\s*(guaranteed|every)/i, label: 'Guaranteed passive income' },
            { pattern: /zero\s*(risk|loss)/i, label: '"Zero risk/loss" claim' },
            { pattern: /never\s*lose/i, label: '"Never lose" promise' },
        ],
    },
    {
        category: 'Too Good To Be True',
        weight: 9,
        patterns: [
            { pattern: /make\s*\$?\d[\d,]*\s*(a\s*day|daily|per\s*day|weekly)/i, label: 'Unrealistic daily/weekly income claim' },
            { pattern: /earn\s*\$?\d[\d,]*\s*(a\s*day|daily|per\s*day|weekly)/i, label: 'Unrealistic earning claim' },
            { pattern: /secret\s*(method|system|formula|strategy|technique)/i, label: '"Secret method" claim' },
            { pattern: /exclusive\s*(opportunity|offer|access|deal)/i, label: '"Exclusive opportunity" bait' },
            { pattern: /millionaire/i, label: 'Millionaire promise' },
            { pattern: /life[- ]?changing\s*(opportunity|money|wealth)/i, label: '"Life-changing" wealth promise' },
            { pattern: /financial\s*freedom/i, label: '"Financial freedom" lure' },
            { pattern: /quit\s*your\s*job/i, label: '"Quit your job" promise' },
            { pattern: /free\s*money/i, label: '"Free money" claim' },
        ],
    },
    {
        category: 'Phishing & Identity Theft',
        weight: 10,
        patterns: [
            { pattern: /verify\s*your\s*(account|identity|information)/i, label: 'Account verification request' },
            { pattern: /update\s*your\s*(payment|billing|bank|card)/i, label: 'Payment info update request' },
            { pattern: /confirm\s*your\s*(ssn|social\s*security|password|pin)/i, label: 'Sensitive data request' },
            { pattern: /click\s*(here|this\s*link|below)\s*(to|for|immediately)/i, label: 'Suspicious link click request' },
            { pattern: /your\s*account\s*(has\s*been|will\s*be)\s*(suspended|locked|closed|disabled)/i, label: 'Account suspension threat' },
            { pattern: /unauthorized\s*(access|activity|transaction)/i, label: 'Fake unauthorized activity alert' },
            { pattern: /login\s*(attempt|detected)/i, label: 'Fake login alert' },
            { pattern: /unusual\s*(activity|sign[- ]?in)/i, label: 'Fake unusual activity alert' },
        ],
    },
    {
        category: 'Payment Red Flags',
        weight: 9,
        patterns: [
            { pattern: /wire\s*transfer/i, label: 'Wire transfer request' },
            { pattern: /gift\s*card/i, label: 'Gift card payment request' },
            { pattern: /cryptocurrency\s*(only|payment|deposit)/i, label: 'Crypto-only payment demand' },
            { pattern: /bitcoin\s*(only|payment|send|deposit)/i, label: 'Bitcoin payment demand' },
            { pattern: /western\s*union/i, label: 'Western Union payment' },
            { pattern: /moneygram/i, label: 'MoneyGram payment' },
            { pattern: /pay\s*(upfront|in\s*advance|before)/i, label: 'Upfront payment demand' },
            { pattern: /processing\s*fee/i, label: 'Suspicious processing fee' },
            { pattern: /send\s*\$?\d[\d,]*\s*(to|now|today)/i, label: 'Direct money send request' },
            { pattern: /cash\s*app|venmo|zelle/i, label: 'P2P payment request (harder to reverse)' },
        ],
    },
    {
        category: 'Impersonation & Authority',
        weight: 7,
        patterns: [
            { pattern: /irs|internal\s*revenue/i, label: 'IRS impersonation' },
            { pattern: /fbi|federal\s*bureau/i, label: 'FBI impersonation' },
            { pattern: /social\s*security\s*(administration|office)/i, label: 'SSA impersonation' },
            { pattern: /microsoft\s*(support|security|team)/i, label: 'Microsoft support scam' },
            { pattern: /apple\s*(support|security|id)/i, label: 'Apple support scam' },
            { pattern: /amazon\s*(support|security|prime)/i, label: 'Amazon impersonation' },
            { pattern: /your\s*(computer|device)\s*(has|is)\s*(infected|compromised|hacked)/i, label: 'Fake device infection alert' },
            { pattern: /technical\s*support/i, label: 'Tech support scam indicator' },
            { pattern: /prince|royalty|inheritance/i, label: 'Classic inheritance/royalty scam' },
        ],
    },
    {
        category: 'Poor Grammar & Formatting',
        weight: 4,
        patterns: [
            { pattern: /dear\s*(sir|madam|friend|customer|user|member|valued)/i, label: 'Generic greeting (mass-sent indicator)' },
            { pattern: /congratulations?\s*!?\s*(you|your)/i, label: '"Congratulations" unsolicited message' },
            { pattern: /you\s*(have\s*been|are)\s*(selected|chosen|picked)\s*(as\s*a)?/i, label: '"You have been selected" scam opener' },
            { pattern: /kindly\s*(send|provide|share|click|transfer|reply)/i, label: '"Kindly" — common in scam scripts' },
            { pattern: /million\s*(dollars?|usd|pounds?|euros?)/i, label: 'Large currency amount mentioned' },
            { pattern: /beneficiary/i, label: '"Beneficiary" — common advance-fee scam term' },
        ],
    },
];

// ── Score Thresholds ────────────────────────────────────────────────

const STATUS_THRESHOLDS = {
    HIGH: { min: 60, label: '🚨 High Risk — Likely a Scam', color: 'red' },
    MEDIUM: { min: 30, label: '⚠️ Medium Risk — Suspicious Content', color: 'yellow' },
    LOW: { min: 0, label: '✅ Low Risk — Appears Legitimate', color: 'green' },
};

// ── Main Analysis Function ──────────────────────────────────────────

/**
 * Analyze text for scam indicators.
 *
 * @param {string} text — The text to analyze (e.g. OCR output).
 * @returns {{ score: number, status: string, statusColor: string, reasons: Array<{category: string, label: string}>, recommendation: string }}
 */
export function analyzeText(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return {
            score: 0,
            status: STATUS_THRESHOLDS.LOW.label,
            statusColor: STATUS_THRESHOLDS.LOW.color,
            reasons: [],
            recommendation: 'No text was provided for analysis.',
        };
    }

    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const matchedReasons = [];
    let rawScore = 0;

    for (const category of SCAM_PATTERNS) {
        for (const { pattern, label } of category.patterns) {
            if (pattern.test(normalizedText)) {
                rawScore += category.weight;
                matchedReasons.push({ category: category.category, label });
            }
        }
    }

    // Normalize score to 0–100 range.
    // Max plausible raw score would be hitting ~10 patterns across top categories,
    // so we scale against a reasonable ceiling and cap at 100.
    const MAX_RAW = 60;
    const score = Math.min(100, Math.round((rawScore / MAX_RAW) * 100));

    // Determine status
    let status, statusColor;
    if (score >= STATUS_THRESHOLDS.HIGH.min) {
        status = STATUS_THRESHOLDS.HIGH.label;
        statusColor = STATUS_THRESHOLDS.HIGH.color;
    } else if (score >= STATUS_THRESHOLDS.MEDIUM.min) {
        status = STATUS_THRESHOLDS.MEDIUM.label;
        statusColor = STATUS_THRESHOLDS.MEDIUM.color;
    } else {
        status = STATUS_THRESHOLDS.LOW.label;
        statusColor = STATUS_THRESHOLDS.LOW.color;
    }

    // Generate recommendation based on score
    let recommendation;
    if (score >= 60) {
        recommendation =
            'This content contains multiple strong scam indicators. Do NOT share personal information, click any links, or send money. Report this to the appropriate authorities.';
    } else if (score >= 30) {
        recommendation =
            'This content shows some suspicious characteristics. Proceed with extreme caution. Verify the sender through official channels before taking any action.';
    } else {
        recommendation =
            'This content appears relatively safe, but always stay vigilant. If something feels off, trust your instincts and verify independently.';
    }

    return { score, status, statusColor, reasons: matchedReasons, recommendation };
}
