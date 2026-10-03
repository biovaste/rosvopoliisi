// End-to-end check for the fire mode: plays a full level (three fires) with touch emulation.
// Screen size defaults to an iPad (1024x768); set VW/VH to try others, e.g. a phone: VW=844 VH=390.
// Usage: npm run build && npx vite preview --port 4173 &  then  npm run test:fire
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.env.URL || 'http://localhost:4173/';
const VW = Number(process.env.VW) || 1024;
const VH = Number(process.env.VH) || 768;
const OUT = 'test-results';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
const cdp = await ctx.newCDPSession(page);

const touch = (type, points) =>
  cdp.send('Input.dispatchTouchEvent', {
    type,
    touchPoints: points.map((p, i) => ({ x: p.x, y: p.y, id: p.id ?? i, radiusX: 10, radiusY: 10, force: 1 })),
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tap(p) {
  await touch('touchStart', [p]);
  await sleep(60);
  await touch('touchEnd', []);
}

/** Drags along a straight line, then holds at the end for `hold` ms. */
async function drag(from, to, { steps = 16, hold = 0, shot = '' } = {}) {
  await touch('touchStart', [from]);
  await sleep(50);
  for (let i = 1; i <= steps; i++) {
    await touch('touchMove', [{ x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps }]);
    await sleep(30);
    if (shot && i === Math.floor(steps / 2)) await page.screenshot({ path: shot });
  }
  await sleep(hold);
  await touch('touchEnd', []);
}

const st = () => page.evaluate(() => window.__fire.state());
const tg = () => page.evaluate(() => window.__fire.targets());

async function waitFor(pred, label, timeout = 20000) {
  const t0 = Date.now();
  for (;;) {
    const s = await st();
    if (pred(s)) return s;
    if (Date.now() - t0 > timeout) throw new Error(`timeout waiting for ${label}: ${JSON.stringify(s)}`);
    await sleep(100);
  }
}

function check(cond, msg) {
  if (!cond) throw new Error(`check failed: ${msg}`);
  console.log(`  ok  ${msg}`);
}

await page.goto(URL);
await page.screenshot({ path: `${OUT}/fire-00-start.png` });
const btn = await page.evaluate(() => {
  const r = document.querySelector('.play-fire').getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
await tap(btn);
await page.waitForFunction(() => window.__fire, null, { timeout: 5000 });
check(true, 'fire mode starts from the red play button');
await page.evaluate(() => window.__fire.setLimit(1)); // the session ends after this level

for (let fire = 0; fire < 3; fire++) {
  console.log(`fire ${fire + 1}`);
  let s = await waitFor((s) => s.phase === 'alarm', 'fire starts');
  check(s.flames >= 2, `fire in house ${s.house} with ${s.flames} flames`);
  await sleep(600);
  await page.screenshot({ path: `${OUT}/fire-${fire}1-alarm.png` });

  if (fire === 0) {
    // A miss first, then the idle hint shows the alarm.
    await tap({ x: VW / 2, y: VH / 2 });
    check((await st()).phase === 'alarm', 'tapping elsewhere does not raise the alarm');
    await waitFor((s) => s.hint, 'idle hint', 14000);
    check(true, 'idle hint appears after 10 s');
  }
  await tap((await tg()).alarm);
  await waitFor((s) => s.phase === 'drive', 'truck out', 8000);
  check(true, 'alarm pressed, truck rolled out');
  await page.screenshot({ path: `${OUT}/fire-${fire}2-truck-out.png` });

  // Drag the truck towards the fire, letting go once on the way (it just stops there).
  let t = await tg();
  const mid = { x: (t.truck.x + t.curb.x) / 2, y: (t.truck.y + t.curb.y) / 2 };
  await drag(t.truck, mid, { hold: 800 });
  check((await st()).phase === 'drive', 'letting go of the truck keeps it waiting');
  t = await tg();
  await drag(t.truck, t.curb, { hold: 1500, shot: `${OUT}/fire-${fire}3-driving.png` });
  await waitFor((s) => s.phase === 'hose', 'parked', 10000);
  check(true, 'truck parked at the fire');
  await page.screenshot({ path: `${OUT}/fire-${fire}4-parked.png` });

  await tap((await tg()).reel);
  await waitFor((s) => s.phase === 'spray', 'hose', 3000);
  check(true, 'hose picked up');

  // Water each flame until all are out.
  for (let i = 0; i < 12; i++) {
    const f = (await tg()).flame;
    if (!f) break;
    await drag({ x: f.x - 40, y: f.y + 10 }, f, { steps: 6, hold: 1200, shot: i === 0 ? `${OUT}/fire-${fire}5-spray.png` : '' });
    s = await st();
    if (s.phase !== 'spray') break;
  }
  await waitFor((s) => s.phase === 'saved' || s.phase === 'home' || s.done === fire + 1, 'fire out', 5000);
  check(true, 'fire put out');
  await page.screenshot({ path: `${OUT}/fire-${fire}6-saved.png` });
}

await waitFor((s) => s.phase === 'ended', 'end screen', 30000);
const end = await st();
check(end.stickers === 1, 'a sticker for the level, then the end screen');
await sleep(1500);
await page.screenshot({ path: `${OUT}/fire-07-end.png` });

check(errors.length === 0, `no console errors${errors.length ? `: ${errors.join(' | ')}` : ''}`);
await browser.close();
console.log('fire mode test passed');
