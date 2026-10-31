# Control-Linux

Entorno de operación de repositorios para el ecosistema Belentani: combina Linux,
PowerShell 7, GitHub CLI (`gh`) y automatización de navegador (Playwright/Chromium
headless) para listar, inspeccionar y documentar repos de forma repetible y trazable.
Incluye skills reutilizables, suite completa de control, devcontainer de Codespaces
y un workflow programado en GitHub Actions.

## Qué hace

- **List-Repos** (`skills/List-Repos.ps1`): lista los repositorios accesibles por el
  token (`gh repo list --json nameWithOwner,visibility,updatedAt`).
- **Create-Issue** (`skills/Create-Issue.ps1`): crea un issue en el repo actual
  (`gh issue create`).
- **Screenshot** (`skills/Screenshot.ps1`): captura una URL con Chromium headless vía
  `scripts/browser-screenshot.js` (Playwright).
- **Suite de control** (`scripts/Control-Repos.ps1`): verifica autenticación, muestra
  el repo actual, lista repos, issues y PRs abiertos, y genera evidencia de navegador;
  opcionalmente crea un issue de control con `CREATE_ISSUE=true`.
- **Export** (`scripts/export.js`): exporta el inventario del proyecto (scripts,
  skills, workflows, archivos clave) como JSON en stdout o a un archivo.
- **Ejecución automática**: el workflow `linux-pwsh-cli-browser` corre a diario
  (cron 06:00 UTC), en push a `main`/`master` o manualmente (`workflow_dispatch`),
  instalando Playwright + Chromium y ejecutando la suite con subida de evidencias.

## Stack

- PowerShell 7+ (`pwsh`)
- GitHub CLI (`gh`) con PAT de grano fino o `GITHUB_TOKEN` del workflow
- Node 20+ y Playwright (Chromium headless)
- Tests: `node:test` (JS) y pytest (Python, test de humo)
- Codespaces: devcontainer Ubuntu con PowerShell, gh y Node 20 (`.devcontainer/`)

## Requisitos

- GitHub CLI (`gh`) autenticado (`gh auth login`) para los skills que consultan la API
- PowerShell 7+ en Linux/WSL (o cualquier host con `pwsh`)
- Node 20+ y navegadores de Playwright (`npx playwright install chromium`)

## Instalación

### Bootstrap (Linux/WSL/Cloud Shell)

```bash
bash bootstrap.sh
```

El script verifica prerequisitos (`gh`, `git`, `node`, `npm`), instala las
dependencias npm y el Chromium headless de Playwright.

### Instalación manual

```bash
npm install
npx playwright install chromium
```

## Uso

```bash
gh auth login            # necesario para los skills de GitHub CLI
npm run list-repos       # lista repos accesibles
npm run create-issue     # crea un issue (requiere -Title)
pwsh skills/Create-Issue.ps1 -Title "Revisión semanal"
pwsh skills/Screenshot.ps1 -Url https://example.com -Out captura.png
npm run control          # suite completa de control
node scripts/export.js   # inventario del proyecto en JSON
node scripts/export.js inventario.json   # exporta a archivo
```

La suite de control también puede ejecutarse desde GitHub Actions con el workflow
`linux-pwsh-cli-browser` (manual o programado). Para controlar otros repos crea el
secreto del token:

```bash
gh secret set GH_TOKEN --app codespaces
```

Sin secretos propios el workflow usa `github.token` del propio repo.

## Estructura

```
.github/workflows/linux-pwsh-cli-browser.yml  Workflow programado de control
.github/workflows/ci.yml                      CI (npm ci, tests, protocolos, sintaxis JS)
.github/workflows/codeql.yml                  Análisis CodeQL (javascript/python)
.github/workflows/build.yml                   Build básico (checkout)
.devcontainer/devcontainer.json               Codespaces dev container
.devcontainer/setup.sh                        Setup del dev container
scripts/Control-Repos.ps1                     Suite de control principal
scripts/browser-screenshot.js                 Captura Playwright headless
scripts/export.js                             Export del inventario en JSON
skills/List-Repos.ps1                         Skill: listar repos
skills/Create-Issue.ps1                       Skill: crear issues
skills/Screenshot.ps1                         Skill: captura de pantalla
skills/README.md                              Documentación de los skills
tests/smoke.test.js                           Tests Node (node:test)
tests/test_forge_smoke.py                     Test de humo Python (pytest)
bootstrap.sh                                  Bootstrap del entorno
PROJECT_MASTER_PROMPT.md                      Canon de producto y dirección
```

## Scripts

Definidos en `package.json`:

| Comando | Acción |
|---|---|
| `npm run dev` / `npm run control` | Ejecuta `scripts/Control-Repos.ps1` |
| `npm run browser` | Captura `https://example.com` con Playwright |
| `npm run list-repos` | Lista repositorios accesibles |
| `npm run create-issue` | Crea un issue en el repo actual (ej. `npm run create-issue -- -Title "texto"`) |
| `npm run screenshot` | Captura de pantalla con valores por defecto |
| `npm test` | Ejecuta los tests Node (`node --test`) |
| `npm run export` | Exporta el inventario del proyecto en JSON |

## Tests

```bash
npm test                                   # tests Node (node:test)
pytest tests/test_forge_smoke.py -q        # test de humo Python
```

## Utilidad

**Utilidad social:** da a personas y equipos que administran muchos repositorios de
GitHub un conjunto de comandos simples y auditables para inventariar, documentar y
verificar sus proyectos (issues, capturas, inventario), sin depender de interfaces
manuales; toda la operación queda registrada y es reproducible.

**Utilidad comercial:** reduce el coste operativo de mantener carteras de
repositorios (auditorías, revisiones programadas, evidencias) y sirve como base para
servicios de operación y control de repos como infraestructura del ecosistema
Belentani, con licencia MIT que permite reutilización en otros contextos.

## Licencia

MIT — ver [LICENSE](LICENSE).
