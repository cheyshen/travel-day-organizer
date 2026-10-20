#!/usr/bin/env node
'use strict';
const puppeteer = require('puppeteer');
const path = require('path');

const CHROME = process.env.PUPPETEER_EXECUTABLE_PATH;
const OUT = path.join(__dirname, 'exports', 'sticker-float.png');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(CHROME ? { executablePath: CHROME } : {}),
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 900, deviceScaleFactor: 2 });

  // Inject transparent background before load
  await page.evaluateOnNewDocument(() => {
    document.addEventListener('DOMContentLoaded', () => {
      document.documentElement.style.background = 'transparent';
      document.body.style.background = 'transparent';
    });
  });

  await page.goto('http://192.168.1.122:8080/sticker-float.html', {
    waitUntil: 'networkidle0',
    timeout: 15000,
  });

  await page.waitForFunction(() => window.__done === true);

  await page.screenshot({
    path: OUT,
    omitBackground: true,
    clip: { x: 0, y: 0, width: 1920, height: 900 },
  });

  await browser.close();
  console.log('done:', OUT);
})().catch(e => { console.error(e.message); process.exit(1); });
