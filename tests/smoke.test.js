const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');

test('smoke', () => { assert.ok(true); });

test('archivos base de protocolos presentes', () => {
  for (const file of ['README.md', 'LICENSE', 'CODE_OF_CONDUCT.md', 'CONTRIBUTING.md', '.gitignore']) {
    assert.ok(fs.existsSync(path.join(root, file)), `falta ${file}`);
  }
});

test('package.json es JSON válido y sus scripts npm apuntan a archivos existentes', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'control-linux');

  const scriptTargets = {
    dev: 'scripts/Control-Repos.ps1',
    browser: 'scripts/browser-screenshot.js',
    'list-repos': 'skills/List-Repos.ps1',
    'create-issue': 'skills/Create-Issue.ps1',
    screenshot: 'skills/Screenshot.ps1',
    control: 'scripts/Control-Repos.ps1',
    export: 'scripts/export.js',
  };
  for (const [script, file] of Object.entries(scriptTargets)) {
    assert.ok(pkg.scripts[script], `falta el script npm "${script}"`);
    assert.ok(pkg.scripts[script].includes(file), `el script "${script}" no usa ${file}`);
    assert.ok(fs.existsSync(path.join(root, file)), `el script "${script}" apunta a ${file}, que no existe`);
  }
});

test('scripts/export.js genera un inventario JSON válido', () => {
  const out = execFileSync(process.execPath, [path.join(root, 'scripts', 'export.js')], { encoding: 'utf8' });
  const manifest = JSON.parse(out);
  assert.equal(manifest.name, 'control-linux');
  assert.ok(Array.isArray(manifest.skills) && manifest.skills.length >= 3, 'debe inventariar los 3 skills');
  assert.ok(Array.isArray(manifest.workflows) && manifest.workflows.length >= 4, 'debe inventariar los workflows');
  const exportEntry = manifest.inventory.find((i) => i.path === 'scripts/export.js');
  assert.ok(exportEntry && exportEntry.exists, 'el inventario debe incluir scripts/export.js');
});
