# Control Linux

Private control toolkit for GitHub repository inventory, PowerShell 7, Linux/WSL, and public-site browser screenshots. The source of truth for intended future capabilities is `PROJECT_MASTER_PROMPT.md`; proposed verbs such as `apply` and `resume` are **not implemented**.

## What is implemented

- `scripts/Control-Repos.ps1`: authenticates `gh`, inspects the current repository, lists up to 500 repositories owned by `belentani7`, reports issues/PRs, and captures a screenshot of `https://example.com`. GitHub issue creation requires both `CREATE_ISSUE=true` and `ALLOW_GITHUB_WRITES=yes-i-authorize-writes`; the scheduled workflow sets `CREATE_ISSUE=false` and has read-only repository permissions.
- `skills/List-Repos.ps1`: a small `gh repo list` wrapper.
- `scripts/browser-screenshot.js`: saves screenshots of credential-free, public HTTPS URLs only. It rejects direct IP/local destinations, unsafe DNS answers, query strings on initial targets, and existing or unsafe output paths. Network requests from the browser context are checked again; **this is not a guarantee against every DNS-rebinding/proxy scenario**.
- `tests/*.test.js`: offline Node tests for read-only workflow guards and screenshot input/DNS validation.

## Run from an existing authorized checkout

Requires Node.js 22+, PowerShell 7+ and GitHub CLI (`gh`) for repository inventory. For browser captures, install the repository's Playwright dependency and its Chromium browser in a trusted environment. No credentials should be placed in command arguments, screenshots, artifacts or Git history.

```bash
npm test
pwsh -File ./scripts/Control-Repos.ps1
node scripts/browser-screenshot.js https://example.com browser-test.png
```

The screenshot command requires Playwright/Chromium to be installed, and refuses to overwrite `browser-test.png` if it already exists. The PowerShell control command additionally requires authenticated `gh` and an available browser. **Never enable GitHub writes for a scheduled inventory run.**

## Important limitations

- The repository does **not** contain a `bootstrap.sh`, `skills/Create-Issue.ps1`, `skills/Screenshot.ps1` or `skills/README.md`; the historical references to these paths were inaccurate. The `npm run create-issue` and `npm run screenshot` aliases in `package.json` therefore remain nonfunctional and must not be treated as tested features.
- The inventory limit of 500 is not pagination and is not guaranteed to be a complete fleet export if the account grows.
- No GitHub Actions run, PowerShell runtime, real Chromium screenshot, restore drill, deployment, or cross-repository write operation is certified by these offline tests. GitHub Actions has previously failed before runner assignment.
- The open PRs #1 (CI), #2 (release controller for a historical 152–202 batch), and #3 (read-only inventory) overlap or diverge from `main`. Do not automatically merge them; the historical 152–202 batch is not the current exclusive agent partition.

## Security and preservation

This repository remains private. Do not publish private repositories or personal content, expose tokens, upload unreviewed screenshots, delete repositories, or bypass permissions. See `SECURITY.md` and the preservation protocol in `belentani7/workflow-orchestrator`. A Git bundle alone is not a complete backup of Git LFS, issues, releases, metadata or offsite encrypted copies.

## License

MIT; see `LICENSE`.
