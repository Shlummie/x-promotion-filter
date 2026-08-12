(function (root, factory) {
  const rules = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }

  root.XPromotionFilterRules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const BLOCKED_LABELS = new Set([
    "ad",
    "advertisement",
    "boosted",
    "promoted",
    "sponsored",
    "sponsored post"
  ]);

  const PARTNERSHIP_LABELS = new Set([
    "paid partnership",
    "paid partnership with"
  ]);

  function normalizeLabel(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/[·•:]+$/u, "")
      .trim()
      .toLocaleLowerCase("en-US");
  }

  function isBlockedLabel(value) {
    return BLOCKED_LABELS.has(normalizeLabel(value));
  }

  function isPartnershipLabel(value) {
    const label = normalizeLabel(value);
    return (
      PARTNERSHIP_LABELS.has(label) ||
      label.startsWith("paid partnership with ")
    );
  }

  function classifySignals(hasPlacementMarker, labels) {
    const safeLabels = Array.isArray(labels) ? labels : [];
    const isPartnership = safeLabels.some(isPartnershipLabel);
    const isPromotion =
      Boolean(hasPlacementMarker) ||
      isPartnership ||
      safeLabels.some(isBlockedLabel);

    return { isPartnership, isPromotion };
  }

  function shouldBlock(signals, allowPaidPartnerships) {
    return (
      Boolean(signals?.isPromotion) &&
      !(Boolean(allowPaidPartnerships) && signals.isPartnership)
    );
  }

  return Object.freeze({
    classifySignals,
    isBlockedLabel,
    isPartnershipLabel,
    normalizeLabel,
    shouldBlock
  });
});
