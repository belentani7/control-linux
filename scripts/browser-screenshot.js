const { chromium } = require('playwright');

const url = process.argv[2] || 'https://example.com';
const out = process.argv[3] || 'screenshot.png';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.screenshot({ path: out, fullPage: true });
  console.log(`saved: ${out}`);
  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
