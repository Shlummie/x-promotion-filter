"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "manifest.json"), "utf8")
);

assert.equal(manifest.manifest_version, 3);
assert.ok(manifest.permissions.includes("storage"));
assert.ok(manifest.host_permissions.includes("https://x.com/*"));
assert.ok(manifest.options_ui?.page);
assert.ok(manifest.action?.default_popup);
assert.deepEqual(
  manifest.browser_specific_settings.gecko.data_collection_permissions,
  { required: ["none"] }
);

for (const script of manifest.content_scripts[0].js) {
  assert.ok(fs.existsSync(path.join(root, script)), `Missing ${script}`);
}

for (const stylesheet of manifest.content_scripts[0].css) {
  assert.ok(
    fs.existsSync(path.join(root, stylesheet)),
    `Missing ${stylesheet}`
  );
}

console.log("Manifest validation passed.");
