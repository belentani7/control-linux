'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isPublicAddress, parsePublicUrl, assertPublicUrl, validateOutput
} = require('../scripts/browser-screenshot');

test('accepts a plain public HTTPS URL without importing Playwright', () => {
  assert.equal(parsePublicUrl('https://example.com/path').hostname, 'example.com');
});

test('rejects URL credentials, queries, fragments, HTTP and nonstandard ports', () => {
  for (const target of [
    'http://example.com', 'file:///etc/passwd',
    'https://user:pass@example.com', 'https://example.com/?token=private',
    'https://example.com/#secret', 'https://example.com:8443/'
  ]) assert.throws(() => parsePublicUrl(target), Error, target);
});

test('rejects local and direct-IP hostnames', () => {
  for (const target of [
    'https://localhost', 'https://service.internal', 'https://host.local',
    'https://127.0.0.1', 'https://192.168.1.3', 'https://[::1]'
  ]) assert.throws(() => parsePublicUrl(target), Error, target);
});

test('classifies reserved, local, public IPv4 and IPv6', () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '172.16.1.1',
    '192.168.1.1', '100.64.0.1', '192.0.2.1', '198.51.100.1',
    '203.0.113.2', '::1', 'fc00::1', 'fe80::1', '2001:db8::1', '2002::1']) {
    assert.equal(isPublicAddress(ip), false, ip);
  }
  assert.equal(isPublicAddress('8.8.8.8'), true);
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true);
});

test('DNS validation accepts only exclusively public addresses', async () => {
  const lookup = async () => [{ address: '8.8.8.8', family: 4 },
    { address: '2606:4700:4700::1111', family: 6 }];
  assert.equal((await assertPublicUrl('https://example.com', { lookup })).hostname, 'example.com');
});

test('DNS validation rejects mixed public/private and empty records', async () => {
  for (const records of [[], [{ address: '8.8.8.8' }, { address: '10.0.0.1' }]]) {
    await assert.rejects(assertPublicUrl('https://example.com', { lookup: async () => records }));
  }
});

test('DNS failures fail closed', async () => {
  await assert.rejects(assertPublicUrl('https://example.com', {
    lookup: async () => { throw new Error('network unavailable'); }
  }), /Could not verify/);
});

test('subresources may have query strings but not private destinations', () => {
  assert.doesNotThrow(() => parsePublicUrl('https://example.com/image.png?v=1', { allowQuery: true }));
  assert.throws(() => parsePublicUrl('http://169.254.169.254/latest', { allowQuery: true }));
});

test('output stays in cwd, is PNG and cannot overwrite existing files', () => {
  assert.equal(validateOutput('new-screenshot-20261023.png'), 'new-screenshot-20261023.png');
  for (const name of ['../private.png', '/tmp/test.png', 'a/../test.png', 'test.svg', 'package.json']) {
    assert.throws(() => validateOutput(name));
  }
  assert.throws(() => validateOutput('scripts/browser-screenshot.js'));
});
