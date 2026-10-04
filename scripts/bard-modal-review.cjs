/* eslint-env node */
// Run against npm start; reuse a local Playwright install without adding dependencies.
// BARD_PLAYWRIGHT_PATH=<module path> node scripts/bard-modal-review.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require(process.env.BARD_PLAYWRIGHT_PATH || "playwright");

const baseUrl = process.env.BARD_REVIEW_URL || "http://localhost:3000";
const output = process.env.BARD_REVIEW_OUTPUT_DIRECTORY || path.join(os.tmpdir(), "bard-modal-review");
const sizes = [[1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 568]];
const spreads = [".bard-hero", ".bard-prologue", ".bard-interface-index", ".bard-sources", ".bard-accounts", ".bard-feature-frontispiece", ".bard-feature-spread--paper", ".bard-feature-spread--reverse", ".bard-feature-spread--aubergine", ".bard-additional", ".bard-video-feature", ".bard-screening"];
const deviceBounds = {
  Home: [424, 12, 947, 1192], SideMenu: [352, 5, 1109, 1202], Profile: [467, 0, 972, 1193],
  Info: [433, 34, 976, 1197], Course: [435, 13, 927, 1208], Synopsis: [453, 17, 908, 1203],
  Quiz: [243, 108, 968, 1163], QuizOne: [448, 27, 914, 1199], Medals: [453, 17, 908, 1203],
  Performance: [411, 41, 963, 1137], HowTo: [321, 27, 921, 1201],
};
const waitForOpen = (page) => page.locator('.bard-stage[data-curtain-state="open"]').waitFor();

async function scrollTo(page, selector) {
  await page.locator(selector).evaluate((element) => {
    const body = document.querySelector(".bard-modal-body-main");
    body.scrollTo({ top: body.scrollTop + element.getBoundingClientRect().top - body.getBoundingClientRect().top, behavior: "instant" });
  });
}

async function freezeCurtain(page, time) {
  await page.locator(".bard-curtain-performance").evaluate((element, currentTime) => {
    element.getAnimations({ subtree: true }).forEach((animation) => { animation.pause(); animation.currentTime = currentTime; });
  }, time);
  await page.locator(".bard-title-entrance").evaluate((element, currentTime) => {
    element.getAnimations().forEach((animation) => { animation.pause(); animation.currentTime = currentTime; });
  }, time);
}

async function capture(page, name) {
  // Let the composited fabric and scroll position paint before recording the frame.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({ path: path.join(output, name) });
}

async function decodeVisibleImages(page, selector) {
  await page.locator(selector).evaluate(async (section) => {
    const frame = document.querySelector(".bard-modal-body-main").getBoundingClientRect();
    const images = [...section.querySelectorAll("img")].filter((image) => { const r = image.getBoundingClientRect(); return r.bottom > frame.top && r.top < frame.bottom; });
    await Promise.all(images.map((image) => image.decode()));
  });
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BARD_CHROMIUM_PATH || undefined });
  const report = [];
  const errors = [];
  const consoleMessages = new Set();
  try {
    for (const [width, height] of sizes) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (["error", "warning"].includes(message.type())) consoleMessages.add(message.text()); });
      await page.goto(`${baseUrl}/projects`);
      await page.evaluate(() => document.fonts.ready);
      const bodyBeforeModal = await page.evaluate(() => ({ classes: document.body.className, overflow: document.body.style.overflow, priority: document.body.style.getPropertyPriority("overflow") }));
      await page.locator('[data-project-id="bard"]').click();
      await page.getByRole("dialog", { name: "BARD", exact: true }).waitFor();
      const openingTiming = await page.locator(".bard-curtain-performance .bard-curtain-panel--right").evaluate((e) => ({ duration: getComputedStyle(e).animationDuration, easing: getComputedStyle(e).animationTimingFunction }));
      const curtain = await page.locator(".bard-curtain-performance").evaluate((root) => [...root.querySelectorAll(".bard-curtain-panel")].map((e) => ({ transform: getComputedStyle(e).transform, background: getComputedStyle(e).backgroundImage })));
      assert.equal(openingTiming.duration, "3.8s");
      assert.equal(await page.getByRole("button", { name: "Draw curtain", exact: true }).isDisabled(), true);
      for (const time of [0, 950, 1900, 3100, 3750]) {
        await freezeCurtain(page, time);
        await capture(page, `${width}-curtain-${time}.png`);
      }
      await page.locator(".bard-curtain-performance").evaluate((e) => e.getAnimations({ subtree: true }).forEach((animation) => animation.play()));
      await page.locator(".bard-title-entrance").evaluate((e) => e.getAnimations().forEach((animation) => animation.play()));
      await waitForOpen(page);
      assert.equal(await page.locator(".bard-curtain-panel").count(), 2, `${width}: duplicate fabric remains after opening`);
      assert.equal(await page.locator(".bard-hero .bard-curtain-panel").count(), 0);
      assert.equal(await page.getByRole("heading", { level: 1, name: "BARD", exact: true }).count(), 1);

      const chrome = await page.locator(".bard-modal-main-div").evaluate((root) => {
        const body = root.querySelector(".bard-modal-body-main");
        const rect = (selector) => { const e = root.querySelector(selector), r = e.getBoundingClientRect(); return { width: r.width, height: r.height }; };
        return { body: { width: body.clientWidth, scrollWidth: body.scrollWidth, height: body.clientHeight, scrollHeight: body.scrollHeight }, header: rect(".bard-modal-header"), footer: rect(".bard-modal-footer"), actions: [...root.querySelectorAll(".bard-action, .btn-close, .bard-tassel-control")].map((e) => { const r = e.getBoundingClientRect(); return { width: r.width, height: r.height, left: r.left, right: r.right }; }) };
      });
      assert.equal(chrome.body.scrollWidth, chrome.body.width, `${width}: horizontal body overflow`);
      assert(chrome.header.height <= 68 && chrome.footer.height <= 72, `${width}: oversized chrome`);
      assert(chrome.actions.every((r) => r.width >= 44 && r.height >= 44), `${width}: small touch target`);
      assert(chrome.actions.every((r) => r.left >= 0 && r.right <= width), `${width}: header/footer control overflow`);

      assert.equal(curtain.length, 2);
      assert(curtain.every((panel) => panel.background.includes("linear-gradient") && !panel.background.includes("repeating")), `${width}: curtain surface is not continuous`);

      const layout = [];
      for (const selector of spreads) {
        await scrollTo(page, selector);
        await page.waitForFunction((selector) => {
          const frame = document.querySelector(".bard-modal-body-main").getBoundingClientRect();
          return [...document.querySelector(selector).querySelectorAll("[data-bard-cue]")].every((e) => {
            const r = e.getBoundingClientRect();
            const visible = Math.max(0, Math.min(frame.bottom, r.bottom) - Math.max(frame.top, r.top));
            return visible / r.height < 0.15 || getComputedStyle(e).opacity === "1";
          });
        }, selector);
        await page.locator(selector).locator("[data-bard-cue]").evaluateAll((elements) => Promise.all(elements.flatMap((e) => e.getAnimations().map((animation) => animation.finished))));
        await decodeVisibleImages(page, selector);
        const bounds = await page.locator(selector).evaluate((element) => {
          const r = element.getBoundingClientRect();
          const overflowing = [...element.querySelectorAll("h1,h2,h3,p,figcaption,iframe")].filter((e) => { const b = e.getBoundingClientRect(); return b.left < -1 || b.right > window.innerWidth + 1 || e.scrollWidth > e.clientWidth + 2; }).map((e) => ({ tag: e.tagName, text: e.textContent.slice(0, 80), width: e.clientWidth, scrollWidth: e.scrollWidth }));
          return { left: r.left, right: r.right, overflowing };
        });
        assert(bounds.left >= -1 && bounds.right <= width + 1, `${width}: spread overflow ${selector}`);
        assert.deepEqual(bounds.overflowing, [], `${width}: overflowing text/media ${selector}`);
        await capture(page, `${width}-${selector.slice(1)}.png`);
        const headerTop = await page.locator(".bard-modal-header").evaluate((e) => e.getBoundingClientRect().top);
        assert.equal(headerTop, 0, `${width}: masthead shifted while scrolling ${selector}`);
        layout.push({ selector, ...bounds });
      }

      // Check every existing image by rendering it; lazy media must not silently disappear.
      const media = page.locator('img[alt^="Bard app:"], img[alt^="Bard implementation:"]');
      assert.equal(await media.count(), 22);
      const devices = [];
      for (let index = 0; index < 22; index++) {
        const figure = media.nth(index).locator("xpath=ancestor::figure");
        await figure.scrollIntoViewIfNeeded();
        await media.nth(index).evaluate((image) => image.decode());
        const imageMetrics = await media.nth(index).evaluate((image) => ({ natural: image.naturalWidth / image.naturalHeight, rendered: image.width / image.height }));
        assert(Math.abs(imageMetrics.natural - imageMetrics.rendered) < 0.01, `${width}: distorted image ${index}`);
        if (await media.nth(index).getAttribute("alt").then((alt) => alt.startsWith("Bard app:"))) {
          const metrics = await media.nth(index).evaluate((image, bounds) => {
            const figure = image.closest("figure"), mount = image.parentElement, section = image.closest("section");
            const rendered = image.getBoundingClientRect();
            const filename = image.src.match(/phoneBard(\w+)\./)[1];
            const [l, t, r, b] = bounds[filename];
            const scale = rendered.width / image.naturalWidth;
            const visible = { left: rendered.left + l * scale, right: rendered.left + r * scale, top: rendered.top + t * scale, bottom: rendered.top + b * scale };
            const box = (e) => { const rect = e.getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height }; };
            return { filename, visible, frame: box(mount), figure: box(figure), section: box(section), caption: box(figure.querySelector("figcaption")), cap: parseFloat(getComputedStyle(mount).height), role: figure.className };
          }, deviceBounds);
          const { visible, frame, figure: figureBounds, section, caption } = metrics;
          assert(visible.left >= frame.left - 1 && visible.right <= frame.right + 1 && visible.top >= frame.top - 1 && visible.bottom <= frame.bottom + 1, `${width}: clipped device ${metrics.filename}`);
          assert(figureBounds.left >= section.left && figureBounds.right <= section.right && figureBounds.top >= section.top && figureBounds.bottom <= section.bottom + 1, `${width}: escaped composition ${metrics.filename}`);
          assert(visible.bottom < caption.top, `${width}: device/caption collision ${metrics.filename}`);
          assert(frame.height <= (metrics.role.includes("--hero") ? 576 : metrics.role.includes("--lead") ? 448 : metrics.role.includes("--supporting") ? 416 : 384) + 1, `${width}: oversized device ${metrics.filename}`);
          assert(Math.abs((visible.left + visible.right) / 2 - (frame.left + frame.right) / 2) <= 1, `${width}: off-center device ${metrics.filename}`);
          await capture(page, `${width}-phone-${metrics.filename}.png`);
          await figure.screenshot({ path: path.join(output, `${width}-device-${metrics.filename}.png`) });
          devices.push(metrics);
        }
      }
      assert.equal(devices.length, 11);

      await scrollTo(page, ".bard-sources");
      const fullSize = page.getByRole("link", { name: /Open Folger synopsis and character data at full size/ });
      const imageUrl = await fullSize.getAttribute("href");
      const popupPromise = page.waitForEvent("popup");
      await fullSize.click();
      const popup = await popupPromise;
      await popup.waitForURL(new URL(imageUrl, baseUrl).href);
      await popup.close();
      const captionLinks = page.getByRole("link", { name: /^View .* at full size/ });
      assert.equal(await captionLinks.count(), 11);
      for (let index = 0; index < (width === 1440 ? 11 : 1); index++) {
        const link = captionLinks.nth(index);
        const target = await link.getAttribute("href");
        const captionPopupPromise = page.waitForEvent("popup");
        await link.click();
        const captionPopup = await captionPopupPromise;
        await captionPopup.waitForURL(new URL(target, baseUrl).href);
        await captionPopup.close();
      }

      await scrollTo(page, ".bard-sources");
      const before = await page.locator(".bard-modal-body-main").evaluate((e) => e.scrollTop);
      await page.mouse.move(width / 2, height / 2);
      await page.mouse.wheel(0, 350);
      await page.waitForFunction((previous) => document.querySelector(".bard-modal-body-main").scrollTop > previous + 100, before);
      await page.getByRole("region", { name: "BARD programme", exact: true }).focus();
      const keyboardBefore = await page.locator(".bard-modal-body-main").evaluate((e) => e.scrollTop);
      await page.keyboard.press("PageDown");
      await page.waitForFunction((previous) => document.querySelector(".bard-modal-body-main").scrollTop > previous + 50, keyboardBefore);

      await page.getByRole("link", { name: /GitHub/ }).focus();
      await page.keyboard.press("Tab");
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), "Close project");
      const closeFocus = await page.locator(".bard-modal-header .btn-close").evaluate((e) => {
        const style = getComputedStyle(e);
        const rgb = (color) => color.match(/[\d.]+/g).slice(0, 3).map(Number);
        const luminance = (values) => values.map((v) => v / 255).map((v) => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        const outline = rgb(style.outlineColor).map((v) => style.filter === "invert(1)" ? 255 - v : v);
        const a = luminance(outline), b = luminance(rgb(getComputedStyle(e.closest(".bard-modal-header")).backgroundColor));
        return { width: parseFloat(style.outlineWidth), contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
      });
      assert(closeFocus.width >= 2 && closeFocus.contrast >= 3, `${width}: close focus outline lacks contrast`);
      await page.keyboard.press("Shift+Tab");
      assert.equal(await page.evaluate(() => document.activeElement.textContent.includes("GitHub")), true);
      const focusOutline = await page.getByRole("link", { name: /GitHub/ }).evaluate((e) => getComputedStyle(e).outlineWidth);
      assert.notEqual(focusOutline, "0px");
      await page.addScriptTag({ path: require.resolve("axe-core") });
      // Audit BARD and the iframe's accessible name; the external YouTube document is not ours.
      const animatedAccessibility = await page.evaluate(() => window.axe.run(".bard-modal-main-div", { iframes: false, runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } }));
      assert.deepEqual(animatedAccessibility.violations.map(({ id }) => id), [], `${width}: accessibility violations with motion enabled`);
      await scrollTo(page, ".bard-sources");
      const manualScroll = await page.locator(".bard-modal-body-main").evaluate((e) => { window.bardProgrammeUnderTest = e; return e.scrollTop; });
      const draw = page.getByRole("button", { name: "Draw curtain", exact: true });
      await draw.focus();
      await page.keyboard.press("Enter");
      const closingDuration = await page.locator(".bard-curtain-panel--right").evaluate((e) => getComputedStyle(e).animationDuration);
      assert.equal(closingDuration, "0.9s");
      await draw.evaluate((e) => { e.click(); e.click(); });
      await page.locator('.bard-stage[data-curtain-state="manualClosed"]').waitFor();
      assert.equal(page.url(), `${baseUrl}/projects/bard`);
      const intermission = page.getByRole("region", { name: "BARD intermission" });
      const raise = intermission.getByRole("button", { name: "Raise curtain", exact: true });
      assert.equal(await raise.evaluate((e) => document.activeElement === e), true);
      assert.equal(await page.locator(".bard-modal-body-main").getAttribute("inert"), "");
      const intermissionBox = await intermission.boundingBox();
      const raiseBox = await raise.boundingBox();
      assert(Math.abs(raiseBox.x + raiseBox.width / 2 - (intermissionBox.x + intermissionBox.width / 2)) < 1, `${width}: Intermission is not centered`);
      const intermissionAxe = await page.evaluate(() => window.axe.run(".bard-modal-main-div", { iframes: false, runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } }));
      assert.deepEqual(intermissionAxe.violations.map(({ id }) => id), [], `${width}: Intermission accessibility violations`);
      await capture(page, `${width}-intermission.png`);
      await page.keyboard.press("Enter");
      assert.equal(await page.locator(".bard-curtain-panel--right").evaluate((e) => getComputedStyle(e).animationDuration), "3.8s");
      await waitForOpen(page);
      assert.equal(await page.locator(".bard-modal-body-main").evaluate((e) => e === window.bardProgrammeUnderTest && e.scrollTop), manualScroll, `${width}: Draw/Raise changed the programme or scroll`);
      assert.equal(await draw.evaluate((e) => document.activeElement === e), true);

      // A new presentation mounts each time, so there is no visible animation reset in-session.
      await page.keyboard.press("Escape");
      await page.waitForURL(`${baseUrl}/projects`);
      const opener = page.locator('[data-project-id="bard"]');
      await opener.click();
      await page.getByRole("dialog", { name: "BARD", exact: true }).waitFor();
      await waitForOpen(page);
      const exitStarted = Date.now();
      await page.getByRole("button", { name: "Close project", exact: true }).click();
      assert.equal(page.url(), `${baseUrl}/projects/bard`);
      await page.waitForURL(`${baseUrl}/projects`);
      const exitElapsed = Date.now() - exitStarted;
      assert(exitElapsed >= 800 && exitElapsed <= 1600, `${width}: exit duration ${exitElapsed}`);
      assert.equal(await opener.evaluate((e) => document.activeElement === e), true);
      await opener.click();
      await page.getByRole("button", { name: "EXIT", exact: true }).click();
      await page.waitForURL(`${baseUrl}/projects`);

      await opener.click();
      await waitForOpen(page);
      await draw.click();
      await page.getByRole("button", { name: "EXIT", exact: true }).click();
      await page.waitForURL(`${baseUrl}/projects`);
      await opener.click();
      await waitForOpen(page);
      await draw.focus();
      await page.keyboard.press("Enter");
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), "Close project");
      await page.keyboard.press("Escape");
      await page.waitForURL(`${baseUrl}/projects`);
      await opener.click();
      await waitForOpen(page);
      await page.getByRole("button", { name: "EXIT", exact: true }).click();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForURL(`${baseUrl}/projects`);

      await page.emulateMedia({ reducedMotion: "reduce" });
      await opener.click();
      const reduced = await page.locator(".bard-modal-main-div").evaluate((root) => ({ curtain: [...root.querySelectorAll(".bard-curtain-panel")].map((e) => getComputedStyle(e).animationName), title: getComputedStyle(root.querySelector(".bard-title-entrance")).opacity, hiddenCues: [...root.querySelectorAll("[data-bard-cue]")].filter((e) => getComputedStyle(e).opacity === "0").length }));
      assert.deepEqual(reduced.curtain, ["none", "none"]);
      assert.equal(reduced.title, "1");
      assert.equal(reduced.hiddenCues, 0);
      assert.equal(await draw.isEnabled(), true);
      assert.equal(await page.locator('.bard-curtain-performance[data-movement="open"]').count(), 1);
      await page.getByRole("button", { name: "Draw curtain", exact: true }).click();
      await page.locator('.bard-stage[data-curtain-state="manualClosed"]').waitFor();
      await page.getByRole("region", { name: "BARD intermission" }).getByRole("button", { name: "Raise curtain" }).click();
      await waitForOpen(page);
      await page.addScriptTag({ path: require.resolve("axe-core") });
      const accessibility = await page.evaluate(() => window.axe.run(".bard-modal-main-div", { iframes: false, runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } }));
      assert.deepEqual(accessibility.violations.map(({ id }) => id), [], `${width}: accessibility violations`);
      await capture(page, `${width}-reduced-motion.png`);
      await page.getByRole("button", { name: "EXIT", exact: true }).click();
      await page.waitForURL(`${baseUrl}/projects`);
      assert.equal(await page.locator(".bard-curtain-performance").count(), 0);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await opener.click();
      await waitForOpen(page);
      await draw.click();
      await page.goBack();
      await page.waitForURL(`${baseUrl}/projects`);
      await page.goForward();
      await page.getByRole("dialog", { name: "BARD", exact: true }).waitFor();
      assert.equal(await draw.isDisabled(), true);
      await waitForOpen(page);
      await page.keyboard.press("Escape");
      await page.waitForURL(`${baseUrl}/projects`);
      const bodyAfterModal = await page.evaluate(() => ({ classes: document.body.className, overflow: document.body.style.overflow, priority: document.body.style.getPropertyPriority("overflow") }));
      assert.deepEqual(bodyAfterModal, bodyBeforeModal, `${width}: body scroll ownership was not restored`);
      report.push({ width, height, chrome, curtain, openingTiming, exitElapsed, layout, devices, mediaCount: 22, reduced, accessibilityViolations: 0, manualDrawRaise: "exact scroll preserved; centered Intermission; keyboard focus, repeated activation and reduced motion pass", fullSizeCaptionLinks: "11 native links verified", scrolling: "pass", keyboard: "pass", openClose: "pass", historyAndBodyRestoration: "pass" });
      await context.close();
      console.log(`${width}×${height}: layout, curtain, 22 media, scroll, keyboard, open/close, reduced motion PASS`);
    }
    assert.deepEqual(errors, [], "Browser JavaScript errors");
    await fs.writeFile(path.join(output, "results.json"), JSON.stringify({ report, errors, consoleMessages: [...consoleMessages] }, null, 2));
    console.log(`Screenshots and report: ${output}`);
    console.log(`Console messages: ${JSON.stringify([...consoleMessages])}`);
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
