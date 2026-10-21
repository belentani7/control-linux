#!/usr/bin/env node
/**
 * Batch 152–202 release gate.
 * Read-only by default. --merge-ready merges ONLY this batch's release/2026-10-21-* PRs,
 * after checking every GitHub check run and mergeability; never alters archived repos.
 * Requires RELEASE_TOKEN with least-privilege read + PR merge permissions.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const manifestUrl = new URL("../release/batch-152-202.json", import.meta.url);
const outputDir = new URL("../out/", import.meta.url);
const owner = "belentani7";
const branchPrefix = "release/2026-10-21-";

export function evaluateChecks(checkRuns, statuses) {
  if (!Array.isArray(checkRuns) || checkRuns.length === 0) {
    return { ready: false, reason: "No CI checks reported" };
  }
  const failed = checkRuns.filter((c) => c.status !== "completed" || c.conclusion !== "success");
  if (failed.length > 0) {
    return { ready: false, reason: "CI not green: " + failed.map((c) => c.name + " (" + (c.conclusion ?? c.status) + ")").join(", ") };
  }
  if (statuses?.statuses?.length && statuses.state !== "success") {
    return { ready: false, reason: "Commit status is " + statuses.state };
  }
  return { ready: true, reason: "All reported checks successful" };
}

export function eligiblePull(pull, repoFullName, baseBranch) {
  return Boolean(
    pull &&
    pull.state === "open" &&
    pull.draft !== true &&
    pull.head?.ref?.startsWith(branchPrefix) &&
    pull.head?.repo?.full_name?.toLowerCase() === repoFullName.toLowerCase() &&
    pull.base?.ref === baseBranch
  );
}

export async function github(route, options = {}, token = process.env.RELEASE_TOKEN) {
  if (!token) throw new Error("Missing RELEASE_TOKEN; never use anonymous public API for private projects.");
  const response = await fetch("https://api.github.com/" + route.replace(/^\//, ""), {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {})
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  });
  if (!response.ok) {
    const safeMessage = (await response.text()).slice(0, 320);
    throw new Error("GitHub request failed (" + response.status + "): " + route + ": " + safeMessage);
  }
  return response.status === 204 ? {} : response.json();
}

export async function evaluateRepo(entry, mergeReady = false) {
  const repoName = entry.name;
  const repoPath = "repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repoName);
  try {
    const metadata = await github(repoPath);
    if (entry.archivedAtInventory || metadata.archived) {
      return { number: entry.number, repo: repoName, state: "preserved-archived", merged: [] };
    }
    if (metadata.private !== true && metadata.visibility !== "private") {
      // Visibility is not an approval or a test; do not use it to bypass gates.
    }
    const repoFullName = owner + "/" + repoName;
    const pulls = await github(repoPath + "/pulls?state=open&per_page=100");
    const candidates = pulls.filter((p) => eligiblePull(p, repoFullName, metadata.default_branch));
    if (!candidates.length) {
      return { number: entry.number, repo: repoName, state: "no-release-pr", merged: [] };
    }
    const results = [];
    for (const p of candidates) {
      const sha = p.head.sha;
      const [checks, statuses, detail] = await Promise.all([
        github(repoPath + "/commits/" + sha + "/check-runs?per_page=100"),
        github(repoPath + "/commits/" + sha + "/status"),
        github(repoPath + "/pulls/" + p.number)
      ]);
      const gate = evaluateChecks(checks.check_runs, statuses);
      if (!gate.ready || detail.mergeable !== true) {
        results.push({ pr: p.number, state: "blocked", reason: gate.ready ? "PR not mergeable" : gate.reason });
        continue;
      }
      if (!mergeReady) {
        results.push({ pr: p.number, state: "ready-not-merged", reason: "Dry-run mode" });
        continue;
      }
      const merged = await github(repoPath + "/pulls/" + p.number + "/merge", {
        method: "PUT",
        body: { sha, merge_method: "merge", commit_title: "release: validated batch 152–202 " + repoName }
      });
      results.push({ pr: p.number, state: merged.merged ? "merged" : "blocked", sha: merged.sha ?? null });
    }
    return { number: entry.number, repo: repoName, state: "processed", merged: results };
  } catch (error) {
    return { number: entry.number, repo: repoName, state: "error", reason: String(error?.message ?? error).slice(0, 380) };
  }
}

export async function main() {
  const allowMerge = process.argv.includes("--merge-ready");
  if (!process.env.RELEASE_TOKEN) throw new Error("RELEASE_TOKEN must be set to an authorized fine-grained GitHub token.");
  const manifest = JSON.parse(readFileSync(manifestUrl, "utf8"));
  if (manifest.owner !== owner || manifest.projects.length !== 51) throw new Error("Unexpected manifest");
  const output = [];
  // Limit API concurrency so one rate limit or service issue does not fan out.
  for (let i = 0; i < manifest.projects.length; i += 4) {
    const batch = manifest.projects.slice(i, i + 4);
    output.push(...await Promise.all(batch.map((p) => evaluateRepo(p, allowMerge))));
  }
  const report = {
    evaluatedAt: new Date().toISOString(),
    owner,
    mode: allowMerge ? "merge-ready-only" : "dry-run",
    scanned: output.length,
    archivedPreserved: output.filter((x) => x.state === "preserved-archived").length,
    blockedOrUnavailable: output.filter((x) => x.state === "error" || x.merged?.some((p) => p.state === "blocked")).length,
    mergedCount: output.reduce((n, x) => n + (x.merged?.filter((p) => p.state === "merged").length ?? 0), 0),
    projects: output
  };
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(new URL("batch-152-202.json", outputDir), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ mode: report.mode, scanned: report.scanned, preserved: report.archivedPreserved, blocked: report.blockedOrUnavailable, merged: report.mergedCount }));
  if (output.some((x) => x.state === "error")) process.exitCode = 1;
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === new URL("file://" + fileURLToPath(new URL(import.meta.url))).href && invokedPath.endsWith("release-batch-152-202.mjs")) {
  await main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
