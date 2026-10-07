/* eslint-env node */
// Run against npm start. Playwright may be installed outside the repository:
// HEYYOU_PLAYWRIGHT_PATH=<module path> node scripts/heyyou-modal-review.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require(process.env.HEYYOU_PLAYWRIGHT_PATH || "playwright");

const baseUrl = process.env.HEYYOU_REVIEW_URL || "http://localhost:3000";
const output = process.env.HEYYOU_REVIEW_OUTPUT_DIRECTORY || path.join(os.tmpdir(), "heyyou-modal-review");
const sizes = [[1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 568]];
const samples = [1800, 2700, 4500, 9000, 12600, 14400, 17820, 17910, 17982, 17999, 18000, 18001, 18018, 18090];
const signalSamples = [0, 600, 1800, 2432, 3000, 4200, 5600, 6399, 6400, 6401, 8832, 9400];

async function scrollTo(page, selector) {
  await page.locator(selector).evaluate((element) => {
    const body = document.querySelector(".hey-you-modal-body-main");
    body.scrollTo({ top: body.scrollTop + element.getBoundingClientRect().top - body.getBoundingClientRect().top, behavior: "instant" });
  });
}

async function freeze(page, selector, time) {
  await page.locator(selector).evaluate((element, currentTime) => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.pause();
      animation.currentTime = currentTime;
    }
  }, time);
}

async function inspectConnection(page, width, output) {
  await page.locator(".hey-you-hero-product").scrollIntoViewIfNeeded();
  const geometry = await page.locator(".hey-you-location-signal").evaluate((svg) => {
    const orbit = svg.querySelector(".hey-you-signal-orbit");
    const x = Number(orbit.getAttribute("cx")), y = Number(orbit.getAttribute("cy")), radius = Number(orbit.getAttribute("r"));
    const point = (px, py) => new DOMPoint(px, py).matrixTransform(svg.getScreenCTM());
    const center = point(x, y);
    const phones = [...svg.parentElement.querySelectorAll(".hey-you-hero-phone")].map((e) => { const r = e.getBoundingClientRect(); return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 }; });
    const clear = (p) => !document.elementsFromPoint(p.x, p.y).some((e) => e.closest(".hey-you-hero-phone"));
    const ringClear = Array.from({ length: 32 }, (_, i) => point(x + (radius + 1) * Math.cos(i * Math.PI / 16), y + (radius + 1) * Math.sin(i * Math.PI / 16))).every(clear);
    const label = svg.querySelector("text").getBoundingClientRect();
    return { center: { x: center.x, y: center.y }, midpoint: { x: (phones[0].x + phones[1].x) / 2, y: (phones[0].y + phones[1].y) / 2 }, radius, ringClear, labelClear: clear({ x: label.left, y: label.top }) && clear({ x: label.right, y: label.bottom }) };
  });
  assert(Math.abs(geometry.center.x - geometry.midpoint.x) < 1 && Math.abs(geometry.center.y - geometry.midpoint.y) < 1, `${width}: group is not centered between rendered phones`);
  assert(geometry.ringClear && geometry.labelClear, `${width}: connection overlaps a phone`);
  const frames = [];
  for (const time of signalSamples) {
    await freeze(page, ".hey-you-location-signal", time);
    const frame = await page.locator(".hey-you-location-signal").evaluate((svg) => {
      const orbit = svg.querySelector(".hey-you-signal-orbit");
      const center = { x: Number(orbit.getAttribute("cx")), y: Number(orbit.getAttribute("cy")) };
      const travelers = ["left", "right"].map((side) => {
        const e = svg.querySelector(`.hey-you-signal-traveler-${side}`), style = getComputedStyle(e), matrix = new DOMMatrixReadOnly(style.transform);
        return { x: Number(e.getAttribute("cx")) + matrix.m41, y: Number(e.getAttribute("cy")) + matrix.m42, opacity: Number(style.opacity) };
      });
      const pulse = getComputedStyle(svg.querySelector(".hey-you-signal-ring"));
      return { center, travelers, pulseOpacity: Number(pulse.opacity), pulseScale: new DOMMatrixReadOnly(pulse.transform).m11, baselineNodesVisible: [...svg.querySelectorAll(".hey-you-device-node")].every((e) => Number(getComputedStyle(e).opacity) > 0.8), pathsVisible: [...svg.querySelectorAll(".hey-you-signal-route")].every((e) => Number(getComputedStyle(e).opacity) > 0) };
    });
    if (time === 2432 || time === 8832) {
      assert(frame.travelers.every((p) => Math.hypot(p.x - frame.center.x, p.y - frame.center.y) < 1 && p.opacity > 0.8), `${width}: signals do not synchronize at ${time}`);
      assert(frame.pulseOpacity < 0.001, "pulse starts before signals meet");
    }
    if (time === 3000 || time === 9400) assert(frame.pulseOpacity > 0.1, "missing established-connection pulse");
    if (time >= 6399 && time <= 6401) assert(frame.travelers.every((p) => p.opacity < 0.01) && frame.pulseOpacity < 0.001, "visible signal reset at loop seam");
    assert(frame.baselineNodesVisible && frame.pathsVisible, "connected state disappears during loop");
    frames.push({ time, ...frame });
    await page.locator(".hey-you-hero-product").screenshot({ path: path.join(output, `${width}-connection-${time}.png`) });
  }
  assert(frames.find((f) => f.time === 4200).pulseScale > frames.find((f) => f.time === 3000).pulseScale, "connection pulse does not expand");
  return { ...geometry, frames };
}

async function review() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.HEYYOU_BROWSER_CHANNEL || "msedge", headless: true });
  const report = { sizes: [], reducedMotion: [], compatibility: {}, interactions: {}, pageErrors: [] };
  try {
    for (const [width, height] of sizes) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "no-preference" });
      const page = await context.newPage();
      page.on("pageerror", (error) => report.pageErrors.push(error.message));
      await page.goto(`${baseUrl}/projects/heyyou`, { waitUntil: "domcontentloaded" });
      await page.getByRole("dialog", { name: "HEYYOU" }).waitFor();

      const metrics = await page.locator(".hey-you-modal-main-div").evaluate((root) => {
        const body = root.querySelector(".hey-you-modal-body-main");
        return { width: body.clientWidth, scrollWidth: body.scrollWidth, actions: [...root.querySelectorAll(".hey-you-footer-action, .btn-close, .hey-you-gallery-controls button")].map((e) => ({ name: e.textContent || e.getAttribute("aria-label"), height: e.getBoundingClientRect().height })) };
      });
      assert.equal(metrics.scrollWidth, metrics.width, `${width}: body horizontal overflow`);
      assert(metrics.actions.every((a) => a.height >= 44), `${width}: action target below 44px`);
      const headerHeight = await page.locator(".hey-you-modal-header").evaluate((e) => e.getBoundingClientRect().height);
      assert(headerHeight <= 75, `${width}: header unexpectedly wraps into multiple rows (${headerHeight}px)`);

      const animationStyles = await page.locator(".hey-you-modal-main-div").evaluate((root) => {
        const style = (selector) => { const s = getComputedStyle(root.querySelector(selector)); return { name: s.animationName, duration: s.animationDuration, iterations: s.animationIterationCount, easing: s.animationTimingFunction }; };
        return { title: style(".hey-you-modal-main-title"), header: style(".modal-title"), subtitle: style(".hey-you-modal-header-text-two"), whale: style(".docker-logo-container"), splash: style(".water-particle-one"), pulse: style(".hey-you-signal-ring-one") };
      });
      assert.equal(animationStyles.title.name, "heyYouModalMainTitleStartup");
      assert.equal(animationStyles.title.duration, "4s");
      assert.equal(animationStyles.header.name, "heyYouModalTitleStartup");
      assert.equal(animationStyles.subtitle.duration, "5s");
      assert.deepEqual(animationStyles.whale, { name: "dockerLogo", duration: "18s", iterations: "infinite", easing: "linear" });
      assert.equal(animationStyles.splash.duration, "18s");
      assert.equal(animationStyles.pulse.iterations, "infinite");
      assert.equal(animationStyles.pulse.duration, "6.4s");
      const preservedLogos = await page.locator(".hey-you-modal-main-div").evaluate((root) => [".express-hey-you-modal", ".mongo-hey-you-modal", ".socket-io-logo-two", ".google-maps-api-logo-one-container", ".google-maps-api-logo-two-container", ".hey-you-safety-person", ".hey-you-safety-key", ".bg-light-hey-you-modal", ".bg-light-hey-you-modal-two", ".bg-light-hey-you-modal-three"].map((selector) => getComputedStyle(root.querySelector(selector)).animationName));
      assert.deepEqual(preservedLogos, ["expressLogoInfiniteHeyYouModal", "mongoLogoInfiniteHeyYouModal", "socketioLogoHeyYouModal", "googleApiLogoOne", "googleApiLogoTwo", "faUser", "keyHeyYouModal", "bgLightInfiniteHeyYouModal", "bgLightTwoInfiniteHeyYouModal", "bgLightThreeInfiniteHeyYouModal"]);
      const whaleOffsets = await page.locator(".docker-logo-container").evaluate((e) => e.getAnimations()[0].effect.getKeyframes().map((frame) => frame.offset));
      assert.deepEqual(whaleOffsets, [0, 0.1, 0.15, 0.29, 0.5, 0.7, 0.74, 0.8, 0.99, 1]);
      assert(await page.locator(".docker-logo-container").evaluate((e) => { const frames = e.getAnimations()[0].effect.getKeyframes(); return frames[0].transform === frames[frames.length - 1].transform; }), "whale start/end poses differ");
      const connection = await inspectConnection(page, width, output);
      await freeze(page, ".hey-you-modal-header", 5000);
      await freeze(page, ".hey-you-modal-footer", 5000);
      await freeze(page, ".hey-you-modal-main-title", 2000);
      await page.locator(".hey-you-modal-body-main").evaluate((e) => e.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: path.join(output, `${width}-hero.png`) });

      for (const [chapter, selector] of [["mobile", ".hey-you-mobile"], ["architecture", ".hey-you-architecture"], ["realtime", ".hey-you-realtime"], ["location", ".hey-you-location"], ["safety", ".hey-you-safety"], ["shipping", ".hey-you-shipping"], ["demo", ".hey-you-demo"]]) {
        await scrollTo(page, selector);
        await page.screenshot({ path: path.join(output, `${width}-${chapter}.png`) });
        const bounds = await page.locator(selector).evaluate((e) => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, scrollWidth: e.scrollWidth, width: e.clientWidth }; });
        assert(bounds.left >= -1 && bounds.right <= width + 1 && bounds.scrollWidth <= bounds.width, `${width}: overflow in ${chapter}`);
      }

      await scrollTo(page, ".hey-you-mobile");
      const gallery = page.locator(".hey-you-horizontal-scroll");
      await gallery.scrollIntoViewIfNeeded();
      await gallery.evaluate((e) => e.scrollTo({ left: e.scrollWidth, behavior: "instant" }));
      const galleryBounds = await gallery.boundingBox();
      const pointer = { x: galleryBounds.x + galleryBounds.width / 2, y: Math.min(galleryBounds.y + 80, height - 95) };
      await page.mouse.move(pointer.x, pointer.y);
      assert(await gallery.evaluate((e, p) => e.contains(document.elementFromPoint(p.x, p.y)), pointer), "wheel pointer missed gallery");
      const bodyBefore = await page.locator(".hey-you-modal-body-main").evaluate((e) => e.scrollTop);
      await page.mouse.wheel(0, 350);
      await page.waitForFunction((previous) => document.querySelector(".hey-you-modal-body-main").scrollTop > previous + 40, bodyBefore);
      const bodyAfter = await page.locator(".hey-you-modal-body-main").evaluate((e) => e.scrollTop);
      await scrollTo(page, ".hey-you-mobile");
      await gallery.scrollIntoViewIfNeeded();
      await gallery.evaluate((e) => e.scrollTo({ left: 0, behavior: "instant" }));
      const firstBounds = await gallery.boundingBox();
      await page.mouse.move(firstBounds.x + firstBounds.width / 2, Math.min(firstBounds.y + 80, height - 95));
      const reverseBefore = await page.locator(".hey-you-modal-body-main").evaluate((e) => e.scrollTop);
      await page.mouse.wheel(0, -220);
      await page.waitForFunction((previous) => document.querySelector(".hey-you-modal-body-main").scrollTop < previous - 40, reverseBefore);
      const reverseAfter = await page.locator(".hey-you-modal-body-main").evaluate((e) => e.scrollTop);

      const polish = await page.locator(".hey-you-modal-main-div").evaluate((root) => {
        const bounds = (selector) => { const r = root.querySelector(selector).getBoundingClientRect(); return { width: r.width, height: r.height, center: r.left + r.width / 2 }; };
        return { map: bounds(".hey-you-map-exhibit"), phone: bounds(".hey-you-map-exhibit .hey-you-device-shot"), orbits: bounds(".hey-you-map-orbits"), person: bounds(".hey-you-safety-person"), key: bounds(".hey-you-safety-key"), badges: [...root.querySelectorAll(".hey-you-deployment-badge")].map((e) => ({ text: e.textContent, background: getComputedStyle(e).backgroundImage, overflow: e.scrollWidth > e.clientWidth })) };
      });
      assert(Math.abs(polish.map.center - polish.phone.center) < 1, "map phone is not centered in its exhibit");
      assert(Math.abs(polish.map.center - polish.orbits.center) < 1, "map logos are detached from the phone axis");
      assert(polish.person.width >= 76 && polish.key.width >= 72, "safety illustration too small");
      assert(polish.badges.every((badge) => !badge.overflow && badge.background.includes("gradient")), "deployment badge overflows or loses refined surface");

      await scrollTo(page, ".hey-you-ocean");
      const whaleFrames = [];
      for (const time of samples) {
        await freeze(page, ".hey-you-ocean", time);
        const frame = await page.locator(".hey-you-ocean").evaluate((scene) => {
          const whale = scene.querySelector(".docker-logo-container");
          const s = scene.getBoundingClientRect();
          const w = whale.getBoundingClientRect();
          const image = scene.querySelector(".docker-logo").getBoundingClientRect();
          const matrix = new DOMMatrixReadOnly(getComputedStyle(whale).transform);
          return { sceneWidth: s.width, sceneHeight: s.height, x: matrix.m41, y: matrix.m42, top: w.top - s.top, left: w.left - s.left, bottom: w.bottom - s.top, right: w.right - s.left, imageTop: image.top - s.top };
        });
        if (time === 1800 || time === 2700 || time === 9000 || time === 12600) {
          assert(frame.right > 0 && frame.left < frame.sceneWidth && frame.bottom > 0 && frame.top < frame.sceneHeight, `${width}: missing whale at ${time}`);
        }
        // Original keyframe fractions; one-pixel tolerance for borders/rounding.
        if (time === 9000) { assert(Math.abs(frame.x + (frame.sceneWidth - 2) * 0.5) < 1); assert(Math.abs(frame.y) < 1); }
        if (time === 12600) { assert(Math.abs(frame.x + (frame.sceneWidth - 2) * 0.6) < 1); assert(Math.abs(frame.y - (frame.sceneHeight - 2) * 0.05) < 1); }
        whaleFrames.push({ time, ...frame });
        await page.locator(".hey-you-ocean").screenshot({ path: path.join(output, `${width}-whale-${time}.png`) });
        if (time >= 17820) assert(frame.imageTop >= frame.sceneHeight, `${width}: whale exposes the loop boundary at ${time}ms (top ${frame.imageTop}, scene ${frame.sceneHeight})`);
      }
      report.sizes.push({ width, height, headerHeight, metrics, animationStyles, preservedLogos, whaleOffsets, whaleFrames, polish, connection, wheelHandoff: { bodyBefore, bodyAfter, reverseBefore, reverseAfter } });
      await context.close();
    }

    for (const [width, height] of [[1440, 900], [390, 844], [320, 568]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/projects/heyyou`, { waitUntil: "domcontentloaded" });
      await page.getByRole("dialog", { name: "HEYYOU" }).waitFor();
      const animations = await page.locator(".hey-you-modal-main-div").evaluate((root) => root.getAnimations({ subtree: true }).map((a) => a.animationName));
      assert.deepEqual(animations, [], `${width}: reduced motion still animates`);
      await page.locator(".hey-you-hero-product").scrollIntoViewIfNeeded();
      assert(await page.locator(".hey-you-location-signal").evaluate((svg) => [...svg.querySelectorAll(".hey-you-device-node, .hey-you-signal-route, .hey-you-shared-node")].every((e) => Number(getComputedStyle(e).opacity) > 0)), "reduced motion loses connected-state visual");
      await page.locator(".hey-you-hero-product").screenshot({ path: path.join(output, `${width}-connection-reduced.png`) });
      await scrollTo(page, ".hey-you-ocean");
      await page.locator(".hey-you-ocean").screenshot({ path: path.join(output, `${width}-whale-reduced.png`) });
      const image = page.locator(".docker-logo");
      assert(await image.isVisible());
      const before = await image.boundingBox();
      await page.screenshot({ path: path.join(output, `${width}-reduced.png`) });
      const after = await image.boundingBox();
      assert.deepEqual(before, after, "reduced-motion whale moved");
      await scrollTo(page, ".hey-you-mobile");
      await page.getByRole("button", { name: "Next app screen" }).click();
      assert((await page.locator(".hey-you-horizontal-scroll").evaluate((e) => e.scrollLeft)) > 0, "reduced motion disabled gallery navigation");
      await page.getByRole("button", { name: "Close", exact: true }).click();
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      report.reducedMotion.push({ width, height, animations: 0, whaleVisible: true, closeWorks: true, galleryWorks: true });
      await context.close();
    }

    const compatibilityContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await compatibilityContext.addInitScript(() => {
      window.ResizeObserver = undefined;
      const matchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query) => {
        const preference = matchMedia(query);
        return { get matches() { return preference.matches; }, addListener: (listener) => preference.addListener(listener), removeListener: (listener) => preference.removeListener(listener) };
      };
    });
    const compatibilityPage = await compatibilityContext.newPage();
    compatibilityPage.on("pageerror", (error) => report.pageErrors.push(error.message));
    await compatibilityPage.goto(`${baseUrl}/projects/heyyou`, { waitUntil: "domcontentloaded" });
    await compatibilityPage.getByRole("dialog", { name: "HEYYOU" }).waitFor();
    await compatibilityPage.setViewportSize({ width: 390, height: 844 });
    await compatibilityPage.waitForFunction(() => { const scene = document.querySelector(".hey-you-ocean"); return Math.abs(parseFloat(scene.style.getPropertyValue("--hey-you-scene-unit-x")) * 100 - scene.clientWidth) < 1; });
    await compatibilityPage.waitForFunction(() => { const product = document.querySelector(".hey-you-hero-product"); return Math.abs(product.querySelector("svg").viewBox.baseVal.width - product.getBoundingClientRect().width) < 1; });
    assert(await compatibilityPage.locator(".hey-you-location-signal").evaluate((svg) => { const product = svg.parentElement.getBoundingClientRect(); const frames = [...svg.parentElement.querySelectorAll(".hey-you-hero-phone")].map((e) => e.getBoundingClientRect()); const orbit = svg.querySelector(".hey-you-signal-orbit"); return Math.abs(Number(orbit.getAttribute("cy")) + product.top - (frames[0].top + frames[0].bottom + frames[1].top + frames[1].bottom) / 4) < 1; }), "connection midpoint fails after resize without ResizeObserver");
    await freeze(compatibilityPage, ".hey-you-ocean", 9000);
    assert(await compatibilityPage.locator(".hey-you-ocean").evaluate((scene) => Math.abs(new DOMMatrixReadOnly(getComputedStyle(scene.querySelector(".docker-logo-container")).transform).m41 + scene.clientWidth * 0.5) < 1), "resize fallback breaks whale path");
    await compatibilityPage.emulateMedia({ reducedMotion: "reduce" });
    await compatibilityPage.waitForFunction(() => document.querySelector(".hey-you-modal-main-div").getAnimations({ subtree: true }).length === 0);
    await scrollTo(compatibilityPage, ".hey-you-mobile");
    await compatibilityPage.getByRole("button", { name: "Next app screen" }).click();
    await compatibilityPage.waitForFunction(() => document.querySelector(".hey-you-horizontal-scroll").scrollLeft > 0);
    report.compatibility = { withoutResizeObserver: true, resizedSceneGeometry: true, legacyMediaQueryListeners: true, liveReducedMotionChange: true, galleryWorks: true };
    await compatibilityContext.close();

    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/projects`, { waitUntil: "domcontentloaded" });
    const opener = page.getByRole("button", { name: /HeyYou.*Location/ });
    await opener.click();
    await page.getByRole("dialog", { name: "HEYYOU" }).waitFor();
    await page.evaluate(() => { window.__heyYouFirstSignal = document.querySelector(".hey-you-location-signal"); });
    await page.getByRole("button", { name: "Close project" }).focus();
    await page.keyboard.press("Shift+Tab");
    assert(await page.locator(".hey-you-modal-github-btn").evaluate((e) => document.activeElement === e));
    await page.keyboard.press("Tab");
    assert(await page.getByRole("button", { name: "Close project" }).evaluate((e) => document.activeElement === e));
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert(await opener.evaluate((e) => document.activeElement === e), "focus did not return to opener");
    await opener.click();
    await page.getByRole("dialog", { name: "HEYYOU" }).waitFor();
    assert(await page.evaluate(() => window.__heyYouFirstSignal !== document.querySelector(".hey-you-location-signal")), "opening signal did not remount");
    await page.getByRole("link", { name: /Meet the app/ }).click();
    const gallery = page.locator(".hey-you-horizontal-scroll");
    const firstLeft = await gallery.evaluate((e) => e.scrollLeft);
    await page.getByRole("button", { name: "Next app screen" }).click();
    await page.waitForFunction(() => document.querySelector(".hey-you-horizontal-scroll").scrollLeft > 200);
    assert((await gallery.evaluate((e) => e.scrollLeft)) > firstLeft);
    await page.getByRole("group", { name: "App screenshots" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForFunction(() => document.querySelector(".hey-you-horizontal-scroll").scrollLeft > 500);
    await page.getByRole("button", { name: "Previous app screen" }).click();
    await page.waitForFunction(() => document.querySelector(".hey-you-horizontal-scroll").scrollLeft < 500);
    const footer = page.getByRole("group", { name: "HeyYou project actions" });
    for (const [name, expected] of [[/APK!/, "drive.google.com"], [/GitHub/, "github.com"]]) {
      const link = footer.getByRole("link", { name });
      assert.equal(await link.getAttribute("rel"), "noopener noreferrer");
      const popupPromise = page.waitForEvent("popup");
      await link.click();
      const popup = await popupPromise;
      await popup.waitForLoadState("domcontentloaded").catch(() => {});
      assert(popup.url().includes(expected));
      assert.equal(await popup.evaluate(() => window.opener), null);
      await popup.close();
    }
    await scrollTo(page, ".hey-you-demo");
    const video = page.getByTitle("HeyYou Honors Project Video Submission");
    assert((await video.getAttribute("src")).includes("/embed/CShAZT8jykY"));
    assert(!(await video.getAttribute("src")).includes("autoplay=1"));
    await video.scrollIntoViewIfNeeded();
    await page.frameLocator(".hey-you-modal-project-video").getByRole("button", { name: /^play(?: video)?$/i }).waitFor({ timeout: 30000 });
    const media = page.frameLocator(".hey-you-modal-project-video").locator("video");
    assert.equal(await media.evaluate((e) => e.paused), true, "demo starts playing without activation");
    await media.evaluate((e) => { e.muted = true; });
    await video.screenshot({ path: path.join(output, "video-loaded.png") });
    await page.frameLocator(".hey-you-modal-project-video").getByRole("button", { name: /^play(?: video)?$/i }).click();
    const videoFrame = page.frames().find((frame) => frame.url().includes("youtube.com/embed/"));
    await videoFrame.waitForFunction(() => document.querySelector("video")?.currentTime > 0 && !document.querySelector("video")?.paused, null, { timeout: 20000 });
    await video.screenshot({ path: path.join(output, "video-playing.png") });
    report.interactions = { focusContainment: true, focusRestoration: true, escape: true, reopening: true, galleryButtons: true, galleryKeyboard: true, safeExternalActions: true, videoEmbedPresent: true, videoPlayControlLoaded: true, videoPausedInitially: true, videoPlaybackAfterActivation: true };
    await context.close();
    assert.deepEqual(report.pageErrors, []);
    await fs.writeFile(path.join(output, "review-results.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ viewports: report.sizes.length, connectionTimestampsPerViewport: signalSamples.length, whaleTimestampsPerViewport: samples.length, reducedMotionViewports: report.reducedMotion.length, wheelHandoffViewports: report.sizes.length, compatibility: report.compatibility, interactions: report.interactions, output }, null, 2));
  } finally {
    await browser.close();
  }
}

review().catch((error) => { console.error(error); process.exitCode = 1; });
