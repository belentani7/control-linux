#!/usr/bin/env node
// Exporta el inventario del proyecto control-linux como JSON (export independiente).
// Uso: node scripts/export.js [archivo-salida]
// Sin argumento imprime el JSON en stdout; con argumento lo escribe en ese archivo.

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function inventoryOf(relativePaths) {
  return relativePaths.map((rel) => {
    const abs = path.join(root, rel);
    const stat = fs.existsSync(abs) ? fs.statSync(abs) : null;
    return {
      path: rel.replace(/\\/g, '/'),
      exists: stat !== null,
      bytes: stat ? stat.size : null,
    };
  });
}

function buildManifest() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

  const workflowDir = path.join(root, '.github', 'workflows');
  const workflows = fs.readdirSync(workflowDir)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .sort();

  const skillsDir = path.join(root, 'skills');
  const skills = fs.readdirSync(skillsDir)
    .filter((f) => f.toLowerCase().endsWith('.ps1'))
    .sort();

  return {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    license: 'MIT',
    generatedAt: new Date().toISOString(),
    node: process.version,
    npmScripts: pkg.scripts,
    dependencies: pkg.dependencies,
    devDependencies: pkg.devDependencies,
    skills,
    workflows,
    inventory: inventoryOf([
      'scripts/Control-Repos.ps1',
      'scripts/browser-screenshot.js',
      'scripts/export.js',
      'bootstrap.sh',
      'tests/smoke.test.js',
      'tests/test_forge_smoke.py',
      '.devcontainer/devcontainer.json',
      'package-lock.json',
    ]),
  };
}

function main() {
  const manifest = buildManifest();
  const json = JSON.stringify(manifest, null, 2) + '\n';
  const outPath = process.argv[2];

  if (outPath) {
    fs.writeFileSync(path.resolve(outPath), json, 'utf8');
    console.log(`export escrito en ${path.resolve(outPath)}`);
  } else {
    process.stdout.write(json);
  }
}

main();
