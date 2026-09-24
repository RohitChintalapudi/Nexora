/**
 * NEXORA Uncertainty Filter
 * Drops generic, templated caveat items that add no repository-specific value
 * from the "Facts & Inferences" analysis output.
 */

const GENERIC_TOPIC_PATTERNS = [
  /^environment\s*&\s*secrets$/i,
  /^external\s+api\s+dependency$/i,
  /^database\s+integration$/i,
  /^environment\s+variables$/i,
  /^runtime\s+environment$/i,
  /^secrets\s+management$/i,
  /^api\s+(key|keys|credentials?)s?$/i,
];

const GENERIC_TEXT_PATTERNS = [
  /\.env\s+file|environment variables|secret|credentials/i,
  /groq[-_\s]sdk|api\s+key|external\s+(api|service)/i,
  /db_connection|database schema|migration|orm\s+configuration/i,
];

function matchesGenericPattern(value) {
  if (!value) return false;
  const haystack = String(value).toLowerCase();
  return GENERIC_TOPIC_PATTERNS.some((re) => re.test(haystack)) ||
    GENERIC_TEXT_PATTERNS.some((re) => re.test(haystack));
}

/**
 * Remove generic/templated caveat entries from an uncertainties array.
 * Accepts both string items and { topic, inference, ... } objects.
 * @param {Array} uncertainties
 * @returns {Array}
 */
export function filterGenericUncertainties(uncertainties) {
  if (!Array.isArray(uncertainties)) return [];
  return uncertainties.filter((u) => {
    if (typeof u === 'string') return !matchesGenericPattern(u);
    if (u && typeof u === 'object') {
      const parts = [u.topic, u.inference, u.missingEvidence, u.description, u.note];
      return !parts.some((p) => matchesGenericPattern(p));
    }
    return true;
  });
}

export default filterGenericUncertainties;