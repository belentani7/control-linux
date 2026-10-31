param(
    [string]$Url = "https://example.com",
    [string]$Out = "screenshot.png"
)

# Captura de pantalla de una URL usando Playwright/Chromium headless.
# Requiere los navegadores de Playwright instalados: npx playwright install chromium
node "$PSScriptRoot/../scripts/browser-screenshot.js" $Url $Out
if ($LASTEXITCODE -ne 0) {
    throw "El navegador headless fallo. Revisa Playwright y los navegadores instalados."
}
Write-Host "Screenshot guardado en $Out"
