// End-to-end check: plays two full levels with touch emulation.
// Screen size defaults to an iPad (1024x768); set VW/VH to try others, e.g. a phone: VW=844 VH=390.
// Usage: npm run build && npx vite preview --port 4173 &  then  npm run test:e2e
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.env.URL || 'http://localhost:4173/';
const VW = Number(process.env.VW) || 1024;
const VH = Number(process.env.VH) || 768;
const OUT = 'test-results';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {},
);
const ctx = await browser.newContext({
  viewport: { width: VW, height: VH },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 1,
});
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

async function drag(from, to, { palm = false, shot = '' } = {}) {
  const f = { ...from, id: 1 };
  await touch('touchStart', [f]);
  await sleep(50);
  const palmPt = { x: 980, y: 700, id: 2 };
  if (palm) await touch('touchStart', [f, palmPt]); // a resting palm joins mid-drag
  const steps = 14;
  for (let i = 1; i <= steps; i++) {
    const p = { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps, id: 1 };
    await touch('touchMove', palm ? [p, palmPt] : [p]);
    await sleep(25);
    if (shot && i === steps / 2) await page.screenshot({ path: shot });
  }
  if (palm) await touch('touchEnd', [{ ...to, id: 1 }]); // palm lifts
  await sleep(40);
  await touch('touchEnd', []);
}

const st = () => page.evaluate(() => window.__rosvo.state());
const tg = () => page.evaluate(() => window.__rosvo.targets());

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
await page.screenshot({ path: `${OUT}/00-start.png` });
// Session length: an adult holds the clock on the start screen and picks a duration.
await touch('touchStart', [{ x: VW - 46, y: VH - 46 }]);
await sleep(2300);
await touch('touchEnd', []);
const pick = await page.evaluate(() => {
  const r = document.querySelector('.session-choice[data-m="10"]').getBoundingClientRect();
  return { open: document.querySelector('.session-picker').classList.contains('open'), x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
check(pick.open, 'session clock opens after a 2 s hold on the start screen');
await page.screenshot({ path: `${OUT}/00-session-picker.png` });
await tap(pick);
const saved = await page.evaluate(() => localStorage.getItem('rosvopoliisi.minutes'));
check(saved === '10', 'chosen session length (10 min) is remembered');
// The blue play button starts the police game (the red one is the fire brigade).
await tap(
  await page.evaluate(() => {
    const r = document.querySelector('.play:not(.play-fire)').getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }),
);

let shot = 1;
let sawRun = false;
for (let cycle = 0; cycle < 2; cycle++) {
  console.log(`cycle ${cycle + 1}`);
  // In the second level, pretend the chosen play time has run out.
  if (cycle === 1) await page.evaluate(() => window.__rosvo.setLimit(0.001));
  for (let r = 0; r < 3; r++) {
    let s = await waitFor((s) => s.phase === 'hiding' && !s.busy, 'hiding');
    check(s.jailed === r, `robbery ${r + 1}: rosvo hiding, ${r} in jail (time=${s.time})`);
    if (r === 0) check(s.npcs === 5 + cycle && s.tier === cycle, `level ${cycle + 1}: ${s.npcs} townspeople, difficulty tier ${s.tier}`);
    await sleep(400);

    if (cycle === 0 && r === 0) {
      // Two misses -> rosvo relocates, then holds still and wiggles.
      await tap({ x: 30, y: VH - 8 });
      await sleep(900);
      await tap({ x: VW - 24, y: 40 });
      await sleep(900);
      s = await st();
      check(s.misses === 2 && s.still, 'after 2 misses the rosvo holds still');
      // Idle hint after 10 s.
      await sleep(10600);
      s = await st();
      check(s.hint, 'hint hand appears after 10 s idle');
      await page.screenshot({ path: `${OUT}/${String(shot++).padStart(2, '0')}-hint.png` });
    }

    // Rosvot sometimes run between hiding spots; try to catch one on the run.
    let running = false;
    if (!(cycle === 0 && r === 0) && !sawRun) {
      running = await waitFor((s) => s.moving, 'run', 8500).then(() => true, () => false);
    }
    if (running) {
      await sleep(200);
      await tap((await tg()).rosvo);
      s = await waitFor((s) => s.phase === 'caught' && !s.busy, 'caught on the run');
      sawRun = true;
      check(true, 'rosvo ran between spots and was caught on the run');
    } else {
      await page.screenshot({ path: `${OUT}/${String(shot++).padStart(2, '0')}-hiding.png` });
      // The rosvo may dash to another spot at any moment; retry if the tap lands after it left.
      for (let tries = 0; ; tries++) {
        await waitFor((s) => !s.moving && !s.busy, 'rosvo settled', 20000);
        await tap((await tg()).rosvo);
        await sleep(400);
        s = await st();
        if (s.phase !== 'hiding' || s.busy || tries >= 6) break;
      }
      s = await waitFor((s) => s.phase === 'caught' && !s.busy, 'caught');
      check(true, 'rosvo caught');
    }
    s = await page.evaluate(() => ({
      cuffed: document.querySelector('.actor.rosvo.cuffed') !== null,
      escort: document.querySelector('.actor.officer.escorting') !== null,
    }));
    check(s.cuffed && s.escort, 'officer handcuffed the rosvo and holds it');
    let t;

    t = await tg();
    if (cycle === 0 && r === 0) {
      // Drop far from the jail -> floats back.
      await drag(t.rosvo, { x: VW * 0.88, y: VH * 0.58 });
      s = await waitFor((s) => s.phase === 'caught' && !s.busy, 'float back');
      check(s.jailed === 0, 'drop away from jail floats back');
      t = await tg();
    }
    await drag(t.rosvo, t.jail, { palm: cycle === 1 && r === 0, shot: r === 0 ? `${OUT}/${String(shot++).padStart(2, '0')}-escort.png` : '' });
    s = await waitFor((s) => s.phase === 'returning' && !s.busy, 'returning');
    check(s.jailed === r + 1, `rosvo jailed (${s.jailed}/3)`);
    const hidden = await page.evaluate(() => getComputedStyle(document.querySelector('.actor.rosvo')).opacity === '0');
    check(hidden, 'jailed rosvo is no longer visible outside the station');
    await page.screenshot({ path: `${OUT}/${String(shot++).padStart(2, '0')}-jailed.png` });

    t = await tg();
    check(!s.itemOut, 'loot is stashed in a hiding spot');
    if (cycle === 0 && r === 0) {
      // Left alone, the lost loot starts to shine more and more.
      await sleep(7000);
      const halo = await page.evaluate(() => window.__rosvo.halo());
      check(halo > 0.5, `lost loot shines when nobody touches the screen (halo ${halo.toFixed(2)})`);
      await page.screenshot({ path: `${OUT}/${String(shot++).padStart(2, '0')}-shine.png` });
      // Loot dropped away from its owner floats back.
      await drag(t.item, { x: VW / 2, y: VH * 0.26 });
      s = await waitFor((s) => s.itemOut && !s.busy, 'loot floats back');
      check(s.phase === 'returning', 'loot dropped away from owner floats back');
      const front = await page.evaluate(() => {
        const z = (el) => Number(getComputedStyle(el).zIndex) || 0;
        const loot = [...document.querySelectorAll('.actor.item')].find((e) => e.classList.contains('glow'));
        return !!loot && [...document.querySelectorAll('.spot-obj')].every((o) => z(loot) > z(o));
      });
      check(front, 'retrieved loot is drawn in front of every hiding object');
      t = await tg();
    }
    await drag(t.item, t.owner);
    if (r < 2) await waitFor((s) => s.phase === 'stealing' || s.phase === 'hiding', 'next robbery');
  }
  await waitFor((s) => s.phase === 'celebrating', 'celebrating');
  await sleep(1300);
  await page.screenshot({ path: `${OUT}/${String(shot++).padStart(2, '0')}-celebrate.png` });
  await sleep(7200);
  await page.screenshot({ path: `${OUT}/${String(shot++).padStart(2, '0')}-car.png` });
  if (cycle === 0) {
    const s = await waitFor((s) => s.phase === 'hiding' && s.cycle === 1, 'loop restart', 30000);
    check(s.jailed === 0 && s.stickers === 1, `loop restarted: cycle=${s.cycle}, time=${s.time}, stickers=${s.stickers}`);
    // Parent panel: hold the lock for 3 s.
    await touch('touchStart', [{ x: 34, y: 34 }]);
    await sleep(3300);
    await touch('touchEnd', []);
    const open = await page.evaluate(() => document.querySelector('.parent-panel')?.classList.contains('open'));
    check(open, 'parent panel opens after a 3 s hold');
    await page.screenshot({ path: `${OUT}/${String(shot++).padStart(2, '0')}-parent.png` });
    await tap({ x: VW / 2, y: VH * 0.13 });
  } else {
    const s = await waitFor((s) => s.phase === 'ended', 'session end', 30000);
    await sleep(1800);
    const shown = await page.evaluate(() => document.querySelectorAll('.end-screen .end-sticker').length);
    check(s.stickers === 2 && shown === 2, `time up: the level finishes and the end screen shows ${shown} stickers`);
    await page.screenshot({ path: `${OUT}/${String(shot++).padStart(2, '0')}-end.png` });
  }
}

check(sawRun, 'saw a rosvo run between hiding spots');

// Holding the corner button on the end screen starts a new session.
await touch('touchStart', [{ x: VW - 46, y: VH - 46 }]);
await sleep(3400);
await touch('touchEnd', []);
await page.waitForFunction(() => window.__rosvo && window.__rosvo.state().phase === 'start', null, { timeout: 10000 });
check(true, 'holding the end-screen button starts a new session');

// Portrait shows the rotate picture.
await page.setViewportSize({ width: VH, height: VW });
await sleep(200);
const rot = await page.evaluate(() => getComputedStyle(document.querySelector('.rotate')).display);
check(rot === 'flex', 'portrait shows the rotate-device picture');
await page.screenshot({ path: `${OUT}/${String(shot++).padStart(2, '0')}-portrait.png` });

check(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
await browser.close();
console.log('PASS');
