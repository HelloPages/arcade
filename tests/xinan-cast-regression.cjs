"use strict";
// Regression guard: Xinan Temple has seven real-person roles only.
// Run: node tests/xinan-cast-regression.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const script = fs.readFileSync(path.join(root, "xinan.js"), "utf8");
const html = fs.readFileSync(path.join(root, "xinan.html"), "utf8");
const scenarioBlock = script.match(/const slapScenarios = \[([\s\S]*?)\n  \];/);
assert(scenarioBlock, "slapScenarios not found");
const expected = ["3畝", "肯尼", "啾底", "偷泥", "蝦婷", "學妹", "沙拉"];
const labels = [...scenarioBlock[1].matchAll(/id:\s*"[^"]+",\s*label:\s*"([^"]+)",\s*charKey:\s*"[^"]+"/g)].map(x => x[1]);
assert.deepEqual(labels, expected, "Must keep exactly seven people, correct names and order");

for (const [label, key] of [
  ["拖延症", "villain-sloth"],
  ["水逆退散", "villain-retrograde"],
  ["豬隊友", "villain-teammate"],
  ["加班煩惱", "villain-overtime"]
]) {
  assert(!scenarioBlock[1].includes(label), "Obsolete selectable character still exists: " + label);
  assert(!script.includes('"' + key + '"'), "Obsolete character asset still loaded: " + key);
  assert(!fs.existsSync(path.join(root, "assets", "v2", key + ".webp")), "Obsolete character image still exists: " + key);
}
assert(!scenarioBlock[1].includes('id: "sam3mu"'), "3畝 mistakenly identified as Sam");
assert(scenarioBlock[1].includes('id: "three_mu"'), "3畝 correct internal id missing");
assert(script.includes("const pool = slapScenarios;"), "Random office events must pick only actual seven roles");

const states = ["normal", "happy", "hurt_cry", "innocent"];
const hashSha256 = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const approvedSaraHashes = {
  normal: "fb809672e5eb34d85439a5d4507bbfbad498be503050e4391b11ca7f5612f261",
  happy: "9be4adde266dbbb3c0d8a51a412c4d1108f575afad175e64a3de29b9b9f49055",
  hurt_cry: "49e7e72109718a147b3e78703f4722383a77ae8a73614746596f2c7e09f07521",
  innocent: "3d3931f4c43a691e5e22c797ddf1d22f1618e951e8a71f9e209cfd4c99bbb515"
};
for (const who of ["3畝", "Kenny", "Sara"]) {
  for (const state of states) {
    const stem = who + "_" + state;
    const file = path.join(root, "assets", "office-fullbody", stem + ".png");
    assert(fs.existsSync(file), "Missing " + file);
    const buf = fs.readFileSync(file);
    assert.equal(buf.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "PNG signature " + stem);
    assert.equal(buf.readUInt32BE(16), 768, "PNG width " + stem);
    assert.equal(buf.readUInt32BE(20), 1024, "PNG height " + stem);
    assert.equal(buf[25], 6, "PNG RGBA color type " + stem);
    if (who === "Sara") {
      assert.equal(hashSha256(file), approvedSaraHashes[state], "Sara must use the user's selected plaid-skirt source, not old bear pinafore");
      assert(script.includes(`"${stem}": "./assets/office-fullbody-webp/${stem}.webp?v=20261118_hd2k_v8"`), "Sara fast WebP URL must bypass old image cache: " + stem);
    }
  }
}
assert(html.includes("xinan.js?v=20261118_hd2k_v10"), "HTML cache-busted JS reference missing");
console.log("PASS Xinan: exactly seven people, removed four old roles/assets, 12 valid fullbody PNG, Sara approved plaid verified by SHA-256, cache version updated");
