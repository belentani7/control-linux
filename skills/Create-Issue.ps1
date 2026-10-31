param(
    [Parameter(Mandatory = $true)][string]$Title,
    [string]$Body = "Issue creado con skills/Create-Issue.ps1."
)

# Crea un issue en el repo actual usando GitHub CLI (requiere gh autenticado).
gh issue create --title $Title --body $Body
if ($LASTEXITCODE -ne 0) {
    throw "No se pudo crear el issue. Revisa la autenticacion de gh y los permisos del token."
}
