#!/usr/bin/env node
/* capture-pair-assets.js — Capture real product screenshots for palette pairing.
 * Outputs:
 *   exports/destination-cards-july.png  — Kauai + Maui DestCards (current design + July dates)
 *   exports/event-cards-stack.png       — 2 event cards from July 4 Day timeline
 */
const puppeteer = require('puppeteer');
const path = require('path');

const APP = 'http://192.168.1.198';
const OUT = path.join(__dirname, 'exports');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const CHROME = process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/home/ubuntu/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome';

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // ── 1. DESTINATION CARDS (HeroView DestCards) ──────────────────────────
  {
    const page = await browser.newPage();
    // Mobile width, tall enough, retina DPR for crisp output
    await page.setViewport({ width: 420, height: 900, deviceScaleFactor: 3, isMobile: true });
    await page.goto(APP, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2500); // let Unsplash photos load

    // DestCards are role=button, height exactly 144px, inside the "Your trip" section.
    // Scroll to find them, then clip.
    const clipCSS = await page.evaluate(async () => {
      // Find all role=button elements that are exactly 144px tall (DestCard height).
      // "Up next" compact cards are a different height.
      const allButtons = [...document.querySelectorAll('[role=button]')];
      const destCards = allButtons.filter(el => {
        const h = el.offsetHeight;
        return h >= 140 && h <= 150 && el.offsetWidth > 150;
      });
      if (destCards.length < 2) return null;

      // Scroll first card into view, wait a tick
      destCards[0].scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise(r => setTimeout(r, 400));

      const r0 = destCards[0].getBoundingClientRect();
      const r1 = destCards[destCards.length - 1].getBoundingClientRect();
      const pad = 20;
      return {
        x: Math.max(0, r0.left - pad),
        y: Math.max(0, r0.top - pad),
        width:  r1.right  - r0.left + pad * 2,
        height: r1.bottom - r0.top  + pad * 2,
      };
    });

    if (clipCSS && clipCSS.width > 100) {
      // clip is in CSS px — Puppeteer screenshot() uses CSS px directly
      await page.screenshot({
        path: path.join(OUT, 'destination-cards-july.png'),
        clip: clipCSS,
      });
      console.log('✓ destination-cards-july.png  clip:', JSON.stringify(clipCSS));
    } else {
      // fallback: full-page shot
      await page.screenshot({ path: path.join(OUT, 'destination-cards-july.png') });
      console.log('⚠ destination-cards-july.png — no clip found, full viewport');
    }
    await page.close();
  }

  // ── 2. EVENT CARDS (DayTimelineView, July 4, Kauai) ────────────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true });
    await page.goto(APP, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);

    // Click the "Day" tab to enter the Day timeline
    await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('[role=tab]')];
      const dayTab = tabs.find(t => t.textContent.trim() === 'Day');
      if (dayTab) dayTab.click();
    });
    await sleep(1500);

    // Advance 3 days to reach Jul 7 (Na Pali Boat Tour + Pool day)
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        // Next-day button is the rightmost small button in the sticky header
        const btns = [...document.querySelectorAll('button')].filter(b => {
          const r = b.getBoundingClientRect();
          return r.top < 160 && r.height < 80 && r.width < 80;
        });
        const nextBtn = btns[btns.length - 1];
        if (nextBtn) nextBtn.click();
      });
      await sleep(600);
    }

    // Force eager loading so Unsplash photos are painted before screenshot
    await page.evaluate(() => {
      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.loading = 'eager';
      });
    });
    await sleep(2500);

    // Mark the first 2 non-transport activity cards (boat, beach, activity, dining, hotel…)
    const found = await page.evaluate(() => {
      const allButtons = [...document.querySelectorAll('[role=button]')];
      const targets = allButtons.filter(el =>
        el.offsetHeight > 150 && el.offsetWidth > 200 && !!el.querySelector('img')
        && !el.textContent.includes('Transport')
      ).slice(0, 2);
      targets.forEach((el, i) => el.setAttribute('data-ev-target', String(i)));
      return targets.length;
    });

    if (found > 0) {
      // Hide fixed nav bar so it doesn't overlap card screenshots
      await page.evaluate(() => {
        const nav = document.querySelector('[role=tablist]');
        if (nav) nav.style.visibility = 'hidden';
      });

      // Screenshot each activity card individually — clean crop, no clip math
      const handles = await page.$$('[data-ev-target]');
      const cardImages = [];
      for (const h of handles) {
        await h.scrollIntoView();
        await sleep(400);
        const buf = await h.screenshot({ encoding: 'binary' });
        cardImages.push(buf);
      }

      // Stack the card images vertically using a temp HTML page
      const b64 = cardImages.map(b => Buffer.from(b).toString('base64'));
      const tmpHtml = `<!DOCTYPE html><html><body style="margin:0;padding:12px;background:#F2F3F5;display:flex;flex-direction:column;gap:10px;">
        ${b64.map(d => `<img src="data:image/png;base64,${d}" style="display:block;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.12);">`).join('\n')}
      </body></html>`;

      const compPage = await browser.newPage();
      await compPage.setViewport({ width: 400, height: 1000, deviceScaleFactor: 3 });
      await compPage.setContent(tmpHtml, { waitUntil: 'load' });
      await sleep(300);
      await compPage.screenshot({
        path: path.join(OUT, 'event-cards-stack.png'),
        fullPage: true,
      });
      await compPage.close();
      console.log(`✓ event-cards-stack.png  (${found} cards composed)`);
    } else {
      await page.screenshot({ path: path.join(OUT, 'event-cards-stack.png') });
      console.log('⚠ event-cards-stack.png — no activity cards found, full viewport');
    }
    await page.close();
  }

  await browser.close();
  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });
