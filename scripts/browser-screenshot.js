'use strict';

const dns = require('node:dns').promises;
const { existsSync } = require('node:fs');
const { isIP, BlockList } = require('node:net');
const { basename } = require('node:path');

const blockedIPv4 = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10],
  ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12],
  ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16],
  ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
  ['224.0.0.0', 4], ['240.0.0.0', 4]
]) blockedIPv4.addSubnet(network, prefix, 'ipv4');

const globalIPv6 = new BlockList();
globalIPv6.addSubnet('2000::', 3, 'ipv6');
const blockedIPv6 = new BlockList();
for (const [network, prefix] of [
  ['2001:db8::', 32], ['2001::', 32], ['2002::', 16]
]) blockedIPv6.addSubnet(network, prefix, 'ipv6');

function isPublicAddress(address) {
  const family = isIP(address);
  if (family === 4) return !blockedIPv4.check(address, 'ipv4');
  if (family === 6) {
    return globalIPv6.check(address, 'ipv6') && !blockedIPv6.check(address, 'ipv6');
  }
  return false;
}

function parsePublicUrl(raw, { allowQuery = false } = {}) {
  let url;
  try { url = new URL(raw); } catch { throw new Error('A valid HTTPS URL is required'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port && url.port !== '443') {
    throw new Error('Only credential-free HTTPS on the standard port is allowed');
  }
  if (!allowQuery && (url.search || url.hash)) {
    throw new Error('Screenshot targets cannot include query strings or fragments');
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!host.includes('.') || isIP(host) ||
      /(?:^|\.)(?:localhost|local|internal|lan|home|onion|invalid|test)$/.test(host)) {
    throw new Error('A public DNS hostname is required');
  }
  return url;
}

async function assertPublicUrl(raw, { allowQuery = false, lookup = dns.lookup } = {}) {
  const url = parsePublicUrl(raw, { allowQuery });
  let records;
  try { records = await lookup(url.hostname, { all: true }); }
  catch { throw new Error('Could not verify public DNS addresses'); }
  if (!Array.isArray(records) || !records.length ||
      records.some(record => !isPublicAddress(record.address))) {
    throw new Error('Target resolves to a non-public or unknown address');
  }
  return url;
}

function validateOutput(name) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.png$/i.test(name) ||
      basename(name) !== name || name.includes('..')) {
    throw new Error('Output must be a simple PNG filename in the working directory');
  }
  if (existsSync(name)) throw new Error('Refusing to overwrite an existing screenshot');
  return name;
}

async function capture(raw, output) {
  const target = await assertPublicUrl(raw);
  const file = validateOutput(output);
  // Import Playwright only when capturing, so validation tests run offline.
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ acceptDownloads: false, serviceWorkers: 'block' });
    const page = await context.newPage();
    await context.route('**/*', async route => {
      try {
        await assertPublicUrl(route.request().url(), { allowQuery: true });
        await route.continue();
      } catch {
        await route.abort('blockedbyclient');
      }
    });
    const response = await page.goto(target.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
    if (!response || !response.ok()) throw new Error('Target did not return a successful HTTP response');
    await page.screenshot({ path: file, fullPage: true, timeout: 20000 });
    console.log(`Screenshot saved: ${file}`);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  capture(process.argv[2] || 'https://example.com', process.argv[3] || 'screenshot.png')
    .catch(() => {
      // Do not leak supplied URLs or browser diagnostics containing credentials.
      console.error('Screenshot failed: target, network, browser or output was rejected');
      process.exitCode = 1;
    });
}

module.exports = { isPublicAddress, parsePublicUrl, assertPublicUrl, validateOutput };
