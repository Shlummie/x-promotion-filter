"use strict";

const assert = require("node:assert/strict");
const rules = require("../src/rules.js");

assert.equal(rules.isBlockedLabel("Ad"), true);
assert.equal(rules.isBlockedLabel("  Promoted  "), true);
assert.equal(rules.isBlockedLabel("Sponsored ·"), true);
assert.equal(rules.isBlockedLabel("I dislike sponsored posts"), false);
assert.equal(rules.isBlockedLabel("Adventure"), false);

assert.equal(rules.isPartnershipLabel("Paid partnership"), true);
assert.equal(
  rules.isPartnershipLabel("Paid partnership with Acme"),
  true
);
assert.equal(rules.isPartnershipLabel("Our paid partnership ended"), false);

const regularPromotion = rules.classifySignals(false, ["Promoted"]);
assert.equal(rules.shouldBlock(regularPromotion, false), true);
assert.equal(rules.shouldBlock(regularPromotion, true), true);

const markedPromotion = rules.classifySignals(true, []);
assert.equal(rules.shouldBlock(markedPromotion, false), true);

const partnership = rules.classifySignals(false, ["Paid partnership"]);
assert.equal(rules.shouldBlock(partnership, false), true);
assert.equal(rules.shouldBlock(partnership, true), false);

const organicPost = rules.classifySignals(false, ["Organic post"]);
assert.equal(rules.shouldBlock(organicPost, false), false);

console.log("Rule tests passed.");
