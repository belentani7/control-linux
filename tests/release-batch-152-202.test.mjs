import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluateChecks, eligiblePull } from "../scripts/release-batch-152-202.mjs";

const manifest = JSON.parse(readFileSync(new URL("../release/batch-152-202.json", import.meta.url), "utf8"));

test("release inventory is exactly the original 152–202 range", () => {
  assert.equal(manifest.projects.length, 51);
  assert.deepEqual(manifest.projects.map(p => p.number), Array.from({ length: 51 }, (_, i) => 152 + i));
  assert.equal(new Set(manifest.projects.map(p => p.name.toLowerCase())).size, 51);
  assert.equal(manifest.projects.filter(p => p.archivedAtInventory).length, 15);
});

test("a missing, pending or failed check blocks release", () => {
  assert.equal(evaluateChecks([], {}).ready, false);
  assert.equal(evaluateChecks([{ name: "ci", status: "in_progress" }], {}).ready, false);
  assert.equal(evaluateChecks([{ name: "ci", status: "completed", conclusion: "failure" }], {}).ready, false);
  assert.equal(evaluateChecks([{ name: "ci", status: "completed", conclusion: "success" }], { statuses: [{ state: "failure" }], state: "failure" }).ready, false);
});

test("successful checks and statuses can pass the gate", () => {
  const result = evaluateChecks([{ name: "ci", status: "completed", conclusion: "success" }], { statuses: [], state: "pending" });
  assert.equal(result.ready, true);
});

test("only owner-authored non-draft release PRs against the default branch qualify", () => {
  const example = {
    state: "open", draft: false,
    head: { ref: "release/2026-10-21-boutique-quality", repo: { full_name: "belentani7/boutique-catalogo" } },
    base: { ref: "main" }
  };
  assert.equal(eligiblePull(example, "belentani7/boutique-catalogo", "main"), true);
  assert.equal(eligiblePull({ ...example, draft: true }, "belentani7/boutique-catalogo", "main"), false);
  assert.equal(eligiblePull({ ...example, head: { ...example.head, repo: { full_name: "another-user/boutique-catalogo" } } }, "belentani7/boutique-catalogo", "main"), false);
  assert.equal(eligiblePull({ ...example, head: { ...example.head, ref: "feature/unsafe" } }, "belentani7/boutique-catalogo", "main"), false);
});
