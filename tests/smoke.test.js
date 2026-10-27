const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const read = (path) => readFileSync(resolve(__dirname, '..', path), 'utf8');

test('scheduled GitHub workflow has no default write permission', () => {
  const workflow = read('.github/workflows/linux-pwsh-cli-browser.yml');
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.doesNotMatch(workflow, /(?:contents|issues|pull-requests): write/);
  assert.match(workflow, /CREATE_ISSUE: 'false'/);
});

test('creating a GitHub issue requires a second explicit opt-in', () => {
  const ps = read('scripts/Control-Repos.ps1');
  assert.match(ps, /ALLOW_GITHUB_WRITES/);
  assert.match(ps, /yes-i-authorize-writes/);
  assert.match(ps, /throw 'GitHub writes were requested without/);
  assert.match(ps, /if \(\$allowIssueCreation\)/);
});

test('inventory is not artificially restricted to the first ten repositories', () => {
  const ps = read('scripts/Control-Repos.ps1');
  assert.match(ps, /gh repo list belentani7 --limit 500/);
  assert.doesNotMatch(ps, /gh repo list --limit 10/);
});
