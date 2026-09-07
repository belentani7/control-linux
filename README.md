# Control-Linux Repository

Complete Linux + PowerShell + GitHub CLI + Browser automation environment for repository control.

## Quick Start

### Bootstrap (Linux/WSL/Cloud Shell)
```bash
bash bootstrap.sh
```

### Or clone existing
```bash
gh auth login
gh repo create control-linux --private --clone
cd control-linux
bash bootstrap.sh
```

## Skills

- **List-Repos.ps1**: List accessible repositories
- **Create-Issue.ps1**: Create GitHub issues
- **Screenshot.ps1**: Browser screenshot via Playwright
- **Control-Repos.ps1**: Full control suite

## Execution Methods

1. **GitHub Actions**: Automatic scheduled execution
2. **GitHub Codespaces**: Interactive terminal
3. **Local Linux/WSL**: Direct execution

## Structure

```
.github/workflows/linux-pwsh-cli-browser.yml  GitHub Actions workflow
.devcontainer/devcontainer.json                 Codespaces dev container
.devcontainer/setup.sh                          Dev container setup
scripts/Control-Repos.ps1                       Main control script
scripts/browser-screenshot.js                   Playwright screenshot
skills/List-Repos.ps1                           List repos skill
skills/Create-Issue.ps1                         Create issue skill
skills/Screenshot.ps1                           Screenshot skill
skills/README.md                                Skills documentation
```

## Requirements

- GitHub CLI (`gh`) with fine-grained PAT
- PowerShell 7+ on Linux
- Node 20+
- Playwright with Chromium

## Token Setup

For controlling other repos, create a secret:
```bash
gh secret set GH_TOKEN --app codespaces
```

## License

MIT
