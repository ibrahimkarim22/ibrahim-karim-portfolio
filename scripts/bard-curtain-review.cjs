/* eslint-env node */
// Inspect opening velocity and closing frames without racing the safety deadline.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require(process.env.BARD_PLAYWRIGHT_PATH || "playwright");
const baseUrl = process.env.BARD_REVIEW_URL || "http://localhost:3000";
const output = path.join(os.tmpdir(), "bard-curtain-review");
const sizes = [[1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 568]];
const progress = [0, 10, 25, 50, 70, 80, 85, 90, 94, 97, 100];

async function endMovement(page, name) {
  await page.locator(".bard-curtain-panel--right").evaluate((element, animationName) => {
    element.dispatchEvent(new AnimationEvent("animationend", { bubbles: true, animationName }));
  }, name);
}

async function frames(page, width, direction, duration) {
  const result = [];
  const isOpening = direction === "opening" || direction === "manual-raising";
  for (const percent of progress) {
    await page.locator(".bard-curtain-performance").evaluate((root, currentTime) => {
      root.getAnimations({ subtree: true }).forEach((animation) => { animation.pause(); animation.currentTime = currentTime; });
    }, Math.min(duration - 0.01, duration * percent / 100));
    await page.locator(".bard-title-entrance").evaluate((title, currentTime) => {
      title.getAnimations().forEach((animation) => { animation.pause(); animation.currentTime = currentTime; });
    }, isOpening ? duration * percent / 100 : 3800);
    await page.clock.runFor(32);
    const frame = await page.locator(".bard-stage").evaluate((stage) => {
      const root = stage.querySelector(".bard-curtain-performance");
      return {
        totalPanels: document.querySelectorAll(".bard-curtain-panel").length,
        heroPanels: document.querySelectorAll(".bard-hero .bard-curtain-panel").length,
        wrapperBackground: getComputedStyle(root).backgroundColor,
        panels: [...root.querySelectorAll(".bard-curtain-panel")].map((panel) => {
          const style = getComputedStyle(panel), r = panel.getBoundingClientRect();
          return { left: r.left, right: r.right, width: r.width, x: new DOMMatrix(style.transform).m41,
            background: style.backgroundImage, shadow: style.boxShadow,
            layers: ["::before", "::after"].map((pseudo) => { const layer = getComputedStyle(panel, pseudo); return { position: layer.position, inset: [layer.top, layer.right, layer.bottom, layer.left], transform: layer.transform, animation: layer.animationName }; }),
          };
        }),
      };
    });
    assert.equal(frame.totalPanels, 2, `${width}/${direction}/${percent}: duplicated fabric`);
    assert.equal(frame.heroPanels, 0);
    assert.equal(frame.wrapperBackground, "rgba(0, 0, 0, 0)");
    const [left, right] = frame.panels;
    assert(Math.abs(left.x + right.x) < 0.1, "asymmetric curtain movement");
    for (const panel of frame.panels) {
      assert(panel.background.includes("linear-gradient") && !panel.background.includes("repeating"));
      assert(panel.shadow.includes("inset"));
      for (const layer of panel.layers) {
        assert.equal(layer.position, "absolute");
        assert.deepEqual(layer.inset, ["0px", "0px", "0px", "0px"]);
        assert.equal(layer.transform, "none");
        assert.equal(layer.animation, "none");
      }
    }
    if (result.length) {
      const previous = result[result.length - 1].panels[0].x;
      assert(isOpening ? left.x <= previous : left.x >= previous, "inner edge reversed direction");
    }
    if ((isOpening && percent === 0) || (!isOpening && percent === 100)) assert(left.right >= right.left, "gap at the center join");
    if ((isOpening && percent === 100) || (!isOpening && percent === 0)) assert(left.right > 0 && left.right <= width * 0.025 + 1, "open curtain ends are missing or too wide");
    await page.screenshot({ path: path.join(output, `${width}-${direction}-${percent}.png`) });
    result.push({ percent, ...frame });
  }
  if (isOpening) {
    const tail = result.filter((frame) => frame.percent >= 80);
    let previousVelocity = Infinity;
    for (let index = 1; index < tail.length; index++) {
      const velocity = Math.abs(tail[index].panels[0].x - tail[index - 1].panels[0].x) / ((tail[index].percent - tail[index - 1].percent) / 100 * duration / 1000);
      assert(velocity <= previousVelocity + 0.01, `${width}: final opening accelerated at ${tail[index].percent}%`);
      tail[index].velocityPxPerSecond = velocity;
      previousVelocity = velocity;
    }
  }
  return result;
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BARD_CHROMIUM_PATH || undefined });
  const report = [];
  try {
    for (const [width, height] of sizes) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/projects`);
      await page.evaluate(() => document.fonts.ready);
      await page.clock.install();
      await page.clock.pauseAt(await page.evaluate(() => Date.now() + 20));
      await page.locator('[data-project-id="bard"]').evaluate((element) => element.click());
      await page.clock.runFor(32);
      const opening = await frames(page, width, "opening", 3800);
      await endMovement(page, "bardCurtainOpenRight");
      const open = await page.locator('.bard-curtain-performance[data-movement="open"]').evaluate((root) => ({ pointerEvents: getComputedStyle(root).pointerEvents, panels: root.querySelectorAll(".bard-curtain-panel").length }));
      assert.deepEqual(open, { pointerEvents: "none", panels: 2 });
      const settled = await page.locator(".bard-curtain-panel--left").evaluate((panel) => new DOMMatrix(getComputedStyle(panel).transform).m41);
      assert(Math.abs(settled - opening[opening.length - 1].panels[0].x) < 0.1, "controller snapped to a different final transform");
      await page.getByRole("button", { name: "Draw curtain", exact: true }).evaluate((element) => element.click());
      const manualClosing = await frames(page, width, "manual-closing", 900);
      await endMovement(page, "bardCurtainCloseRight");
      await page.clock.runFor(32);
      await page.screenshot({ path: path.join(output, `${width}-intermission.png`) });
      await page.getByRole("region", { name: "BARD intermission" }).getByRole("button", { name: "Raise curtain" }).evaluate((element) => element.click());
      const manualRaising = await frames(page, width, "manual-raising", 3800);
      await endMovement(page, "bardCurtainOpenRight");
      await page.getByRole("button", { name: "Close project", exact: true }).evaluate((element) => element.click());
      const exitClosing = await frames(page, width, "exit-closing", 900);
      await endMovement(page, "bardCurtainCloseRight");
      await page.clock.runFor(32);
      assert.equal(page.url(), `${baseUrl}/projects`);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.locator('[data-project-id="bard"]').evaluate((element) => element.click());
      await page.clock.runFor(32);
      assert.equal(await page.locator('.bard-stage[data-curtain-state="open"]').count(), 1);
      const reducedAnimations = await page.locator(".bard-curtain-panel").evaluateAll((panels) => panels.map((panel) => getComputedStyle(panel).animationName));
      assert.deepEqual(reducedAnimations, ["none", "none"]);
      await page.screenshot({ path: path.join(output, `${width}-reduced-motion.png`) });
      report.push({ width, height, opening, manualClosing, manualRaising, exitClosing, open, reducedAnimations });
      await context.close();
      console.log(`${width}×${height}: 44 curtain frames, declining final velocity, Draw/Raise, attached fabric and reduced motion PASS`);
    }
    await fs.writeFile(path.join(output, "results.json"), JSON.stringify(report, null, 2));
    console.log(`Curtain frames: ${output}`);
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
