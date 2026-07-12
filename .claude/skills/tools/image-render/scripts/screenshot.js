#!/usr/bin/env node
/*
 * Screenshot an element of an HTML page with headless Chromium (Playwright).
 * Used to capture a to-scale 3D model view (e.g. a room-design walk-through)
 * so it can be fed to generate.py as a structural reference for a
 * dimension-accurate photoreal reskin.
 *
 * Usage:
 *   NODE_PATH=$(npm root -g) node screenshot.js \
 *     --html /path/to/walkthrough.html --out ref.png \
 *     [--selector "#vp"] [--wait 2200] [--hide ".hint,.compass"] \
 *     [--click "text=Foot of bed"] [--width 1200] [--height 900] [--scale 2]
 *
 * Requires Playwright + Chromium (pre-installed in Claude Code web envs).
 */
const path = require('path');

function loadChromium() {
  try { return require('playwright').chromium; } catch (e) {}
  try {
    const { execSync } = require('child_process');
    const root = execSync('npm root -g').toString().trim();
    return require(path.join(root, 'playwright')).chromium;
  } catch (e) {
    console.error('[error] Playwright not found. Try: NODE_PATH=$(npm root -g) node screenshot.js ...');
    process.exit(2);
  }
}

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

(async () => {
  const html = arg('html');
  const out = arg('out', 'ref.png');
  if (!html) { console.error('[error] --html <file-or-url> is required'); process.exit(2); }
  const selector = arg('selector', 'body');
  const wait = parseInt(arg('wait', '2000'), 10);
  const hide = arg('hide', '');
  const click = arg('click', '');
  const width = parseInt(arg('width', '1200'), 10);
  const height = parseInt(arg('height', '900'), 10);
  const scale = parseFloat(arg('scale', '2'));

  const url = /^https?:\/\//.test(html) ? html : 'file://' + path.resolve(html);
  const chromium = loadChromium();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
    await page.goto(url, { waitUntil: 'load' });
    if (hide) await page.addStyleTag({ content: hide + '{display:none!important}' });
    if (click) { try { await page.click(click, { timeout: 3000 }); } catch (e) { console.error('[warn] click failed:', e.message.split('\n')[0]); } }
    await page.waitForTimeout(wait);
    const el = await page.$(selector);
    if (!el) { console.error('[error] selector not found:', selector); process.exit(3); }
    await el.screenshot({ path: out });
    console.log('[ok] wrote', out);
  } finally {
    await browser.close();
  }
})();
