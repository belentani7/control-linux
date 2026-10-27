$ErrorActionPreference = 'Stop'

# The inventory workflow is read-only. Only a separately-authorized,
# explicitly requested operator command should mutate a GitHub repo.
$allowIssueCreation = $env:CREATE_ISSUE -eq 'true' -and
    $env:ALLOW_GITHUB_WRITES -eq 'yes-i-authorize-writes'

function Write-Skill {
    param([string]$Name)
    Write-Host ""
    Write-Host "=== $Name ===" -ForegroundColor Cyan
}

Write-Skill "Skill 1: autenticacion GitHub CLI"
gh auth status
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI no esta autenticado. Revisa GH_TOKEN o GITHUB_TOKEN."
}

Write-Skill "Skill 2: repo actual"
$repoJson = gh repo view --json nameWithOwner,defaultBranchRef
if ($LASTEXITCODE -ne 0) {
    throw "No se pudo obtener el repo actual."
}

$repoInfo = $repoJson | ConvertFrom-Json
$repo = $repoInfo.nameWithOwner
$branch = $repoInfo.defaultBranchRef.name

Write-Host "Repo actual: $repo"
Write-Host "Rama por defecto: $branch"

Write-Skill "Skill 3: repos accesibles"
gh repo list belentani7 --limit 500 --json nameWithOwner,visibility,updatedAt
if ($LASTEXITCODE -ne 0) {
    Write-Warning "No se pudieron listar más repos. Puede faltar permiso al token."
}

Write-Skill "Skill 4: detalle del repo actual"
gh api "repos/$repo" --jq '.full_name + " | private=" + (.private | tostring) + " | branch=" + .default_branch'
if ($LASTEXITCODE -ne 0) {
    Write-Warning "No se pudo obtener detalle del repo actual."
}

Write-Skill "Skill 5: issues abiertos"
gh issue list --repo $repo --state open --limit 5 --json number,title,state
if ($LASTEXITCODE -ne 0) {
    Write-Warning "No se pudieron listar issues."
}

Write-Skill "Skill 6: pull requests abiertos"
gh pr list --repo $repo --state open --limit 5 --json number,title,state
if ($LASTEXITCODE -ne 0) {
    Write-Warning "No se pudieron listar pull requests."
}

Write-Skill "Skill 7: navegador headless"
node "$PSScriptRoot/browser-screenshot.js" https://example.com screenshot.png
if ($LASTEXITCODE -ne 0) {
    throw "El navegador headless falló. Revisa Playwright."
}
Write-Host "Screenshot guardado en screenshot.png"

if ($env:CREATE_ISSUE -eq 'true' -and -not $allowIssueCreation) {
    throw 'GitHub writes were requested without ALLOW_GITHUB_WRITES=yes-i-authorize-writes'
}
if ($allowIssueCreation) {
    Write-Skill "Skill 8: crear issue de control"
    gh issue create `
        --repo $repo `
        --title "Control automatizado" `
        --body "Ejecutado desde GitHub Actions con PowerShell."
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo crear el issue."
    }
}

Write-Skill "Fin"
Write-Host "Skills ejecutadas correctamente."
