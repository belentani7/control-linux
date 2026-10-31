# Skills de control-linux

Pequeños comandos PowerShell que envuelven GitHub CLI y Playwright para operar
repositorios. Requisitos: `gh` autenticado (`gh auth login`), PowerShell 7 (`pwsh`)
y Node 20+. Todos los skills están registrados como scripts npm en `package.json`.

| Skill | Archivo | Qué hace | Equivalente npm |
|---|---|---|---|
| List-Repos | `List-Repos.ps1` | Lista los repositorios accesibles por el token (`gh repo list`) | `npm run list-repos` |
| Create-Issue | `Create-Issue.ps1` | Crea un issue en el repo actual (`gh issue create`). Parámetros: `-Title` (obligatorio), `-Body` | `npm run create-issue` |
| Screenshot | `Screenshot.ps1` | Captura una URL con Chromium headless vía Playwright. Parámetros: `-Url`, `-Out` | `npm run screenshot` |

La suite completa (autenticación, inventario, issues, PRs y evidencia de navegador)
vive en `scripts/Control-Repos.ps1` (`npm run control`). El script necesita los
navegadores de Playwright instalados: `npx playwright install chromium`.
