// Renders cover-gen.html to high-res PNGs: clean, titled, and transparent variants.
const puppeteer = require('puppeteer');
const path = require('path');

const FILE = 'file://' + path.join(__dirname, 'cover-gen.html');
const OUT = path.join(__dirname, 'exports');

const VARIANTS = [
  { name: 'clean',       query: 'mode=clean',      omitBackground: false },
  { name: 'titled',      query: 'mode=titled',     omitBackground: false },
  { name: 'transparent', query: 'bg=transparent',  omitBackground: true  },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--force-color-profile=srgb'],
  });
  for (const v of VARIANTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 800, deviceScaleFactor: 3 });
    await page.goto(`${FILE}?${v.query}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400)); // let webfont settle
    const out = path.join(OUT, `cover-${v.name}.png`);
    await page.screenshot({ path: out, omitBackground: v.omitBackground });
    console.log('wrote', out);
    await page.close();
  }
  await browser.close();
})();
