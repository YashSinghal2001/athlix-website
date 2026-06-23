import { chromium } from 'playwright-core';
const url = process.argv[2];
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
let ok = true;
const log = (m, p) => { if (!p) ok = false; console.log(`  [${p ? 'PASS' : 'FAIL'}] ${m}`); };

async function checkSweep(name, sel, pseudo, expectColor) {
  await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), sel);
  await page.waitForTimeout(900);
  const box = await page.locator(sel).first().boundingBox();
  // read base pseudo (background gradient + start position)
  const base = await page.locator(sel).first().evaluate((n, ps) => {
    const s = getComputedStyle(n, ps);
    return { bg: s.backgroundImage, size: s.backgroundSize, anim: s.animationName };
  }, pseudo);
  // hover, then read animation
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(120);
  const hov = await page.locator(sel).first().evaluate((n, ps) => {
    const s = getComputedStyle(n, ps);
    return { anim: s.animationName, dur: s.animationDuration, bg: s.backgroundImage };
  }, pseudo);
  console.log(`\n  ${name} (${pseudo}):`);
  console.log(`    bg: ${hov.bg.slice(0, 140)}`);
  console.log(`    animation: ${hov.anim} ${hov.dur}, bg-size base: ${base.size}`);
  log(`${name}: gradient line present`, /linear-gradient/.test(hov.bg));
  log(`${name}: ${expectColor} color`, hov.bg.includes(expectColor));
  log(`${name}: sweeps on hover (animation card-border-sweep)`, hov.anim === 'card-border-sweep');
  log(`${name}: duration 0.8s`, hov.dur === '0.8s');
  log(`${name}: localized beam (background-size 50%)`, /50%/.test(base.size));
  await page.mouse.move(2, 2);
  await page.waitForTimeout(200);
}

await checkSweep('Method blue (stage1)', '.timeline .stage-card:nth-child(1)', '::after', 'rgb(79, 140, 255)');
await checkSweep('Method purple (stage2)', '.timeline .stage-card:nth-child(2)', '::after', 'rgb(139, 85, 246)');
await checkSweep('Method green (stage3)', '.timeline .stage-card:nth-child(3)', '::after', 'rgb(16, 185, 129)');
await checkSweep('Pathway (blue)', '.pathway-card:not(.featured)', '::before', 'rgb(96, 165, 250)');
await checkSweep('Pathway featured (blue)', '.pathway-card.featured', '::before', 'rgb(96, 165, 250)');

await browser.close();
console.log('\nRESULT: ' + (ok ? 'PASS' : 'FAIL'));
process.exit(ok ? 0 : 1);
