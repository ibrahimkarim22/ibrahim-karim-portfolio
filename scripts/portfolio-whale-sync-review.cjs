/* eslint-env node */
// Uses an existing external Playwright module. No asset or production scene is
// captured or changed. Tests initial autoplay without using Replay first.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const installClockProbe = require("./portfolio-clock-probe.cjs");
const { chromium } = require(
  process.env.PORTFOLIO_PLAYWRIGHT_PATH || "playwright",
);
const channel = process.env.PORTFOLIO_BROWSER_CHANNEL || "msedge";
const output =
  process.env.PORTFOLIO_SYNC_OUTPUT_DIRECTORY ||
  path.join(os.tmpdir(), "portfolio-whale-sync-review");
const url = `${
  process.env.PORTFOLIO_REVIEW_URL || "http://localhost:3000"
}/projects/thisportfolio`;
const oracle = [
  [0, 10, 100],
  [10, -2, -10],
  [15, -3, -10],
  [29, -20, 100],
  [50, -50, 0],
  [70, -60, 5],
  [74, -65, 0],
  [80, -67, 5],
  [99, -68, 120],
  [100, 10, 100],
];

async function position(page, selector = ".tp-timeline") {
  await page.locator(selector).evaluate((element) => {
    const body = document.querySelector(".tp-body");
    body.scrollTo({
      top:
        body.scrollTop +
        element.getBoundingClientRect().top -
        body.getBoundingClientRect().top -
        document.querySelector(".tp-index").offsetHeight -
        16,
      behavior: "instant",
    });
  });
}

async function open(browser, mode = "normal") {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  await context.addInitScript((kind) => {
    window.portfolioDecodedFrames = 0;
    window.portfolioDroppedFrames = false;
    const request = HTMLVideoElement.prototype.requestVideoFrameCallback;
    let previous = -1;
    if (kind === "fallback")
      HTMLVideoElement.prototype.requestVideoFrameCallback = undefined;
    else
      HTMLVideoElement.prototype.requestVideoFrameCallback = function (
        callback,
      ) {
        return request.call(this, (now, metadata) => {
          // Simulate a browser failing to deliver the pending decoded callback
          // after the first natural wrap. Native playback itself keeps looping.
          if (
            kind === "lost-callback" &&
            (window.portfolioDroppedFrames || metadata.mediaTime < previous - 9)
          ) {
            window.portfolioDroppedFrames = true;
            return;
          }
          previous = metadata.mediaTime;
          window.portfolioDecodedFrames++;
          callback(now, metadata);
        });
      };
  }, mode);
  const page = await context.newPage();
  await installClockProbe(page);
  await page.addInitScript((source) => {
    window.portfolioWhaleExpected = (seconds) => {
      const time = Math.max(0, Math.min(18000, seconds * 1000));
      const index = source.findIndex(
        (pose, i) =>
          time >= 180 * pose[0] && (i === 9 || time < 180 * source[i + 1][0]),
      );
      const from = source[index],
        to = source[Math.min(index + 1, 9)];
      const amount =
        from === to ? 0 : (time - from[0] * 180) / ((to[0] - from[0]) * 180);
      return {
        phase: from[0],
        x: 8 + ((from[1] + (to[1] - from[1]) * amount + 68) / 78) * 84,
        y: 12 + ((from[2] + (to[2] - from[2]) * amount + 10) / 130) * 76,
      };
    };
    window.portfolioWhaleError = (time) => {
      const expected = window.portfolioWhaleExpected(time);
      const style = document.querySelector(".tp-timeline-marker").style;
      return Math.max(
        Math.abs(
          parseFloat(style.getPropertyValue("--tp-marker-x")) - expected.x,
        ),
        Math.abs(
          parseFloat(style.getPropertyValue("--tp-marker-y")) - expected.y,
        ),
      );
    };
  }, oracle);
  await page.goto(url);
  await position(page);
  await page.waitForFunction(() => {
    const video = document.querySelector(".tp-whale-media video");
    return (
      video.readyState >= 2 &&
      !video.paused &&
      !video.seeking &&
      video.currentTime > 0.05
    );
  });
  return { page, context };
}

async function threeLoops(browser, mode) {
  const { page, context } = await open(browser, mode);
  const video = page.locator(".tp-whale-media video");
  const metadata = await video.evaluate((element) => ({
    duration: element.duration,
    width: element.videoWidth,
    height: element.videoHeight,
    rate: element.playbackRate,
  }));
  assert.deepEqual(metadata, {
    duration: 18,
    width: 800,
    height: 408,
    rate: 1,
  });
  const result = await video.evaluate(
    (element) =>
      new Promise((resolve, reject) => {
        const probe = window.portfolioClockProbe;
        probe.active = true;
        const timeout = setTimeout(() => {
          cancelAnimationFrame(frame);
          reject(new Error("Initial autoplay did not complete three loops"));
        }, 65000);
        let previous = element.currentTime,
          loops = 0,
          checks = 0,
          frame;
        const samples = [],
          starts = [];
        let lastSample = -1;
        function watch() {
          const time = element.currentTime;
          checks++;
          if (time < previous - 9) {
            loops++;
            starts.push({
              loop: loops,
              time,
              markerTime: window.portfolioLastMarkerTime,
            });
            lastSample = -1;
          }
          if (time - lastSample >= 0.75) {
            samples.push({
              loop: loops,
              time,
              markerTime: window.portfolioLastMarkerTime,
              phase: document.querySelector(
                '[aria-label="Whale timeline pose"]',
              ).textContent,
            });
            lastSample = time;
          }
          previous = time;
          if (loops === 3) {
            clearTimeout(timeout);
            probe.active = false;
            element.pause();
            resolve({
              loops,
              checks,
              starts,
              samples,
              writes: probe.writes,
              maxPositionErrorPercent: probe.maxError,
              backwardWrites: probe.backward,
              maxUpdateGapMs: probe.maxGap,
              decodedFrames: window.portfolioDecodedFrames,
              callbacksStopped: window.portfolioDroppedFrames,
            });
            return;
          }
          frame = requestAnimationFrame(watch);
        }
        frame = requestAnimationFrame(watch);
      }),
  );
  assert.equal(result.loops, 3);
  assert(
    result.writes > 1000 &&
      result.maxPositionErrorPercent < 0.000001 &&
      result.maxUpdateGapMs < 300,
    JSON.stringify(result),
  );
  assert.deepEqual(
    result.backwardWrites,
    [],
    "Marker received an older timestamp during playback",
  );
  if (mode === "lost-callback")
    assert(result.callbacksStopped, "Frame-callback loss was not exercised");
  await page.screenshot({ path: path.join(output, `${mode}-third-wrap.png`) });
  console.log(
    `${channel}/${mode}: three initial-autoplay loops, ${
      result.writes
    } marker writes, ${
      result.backwardWrites.length
    } backward writes, gap ${result.maxUpdateGapMs.toFixed(1)}ms`,
  );
  if (mode === "normal") {
    // Replay is deliberately tested only after initial autoplay has proved it
    // can keep looping on its own.
    await page
      .getByRole("button", { name: "Replay source timeline" })
      .evaluate((button) => button.click());
    await page.waitForFunction(() => {
      const video = document.querySelector("video");
      return !video.paused && !video.seeking && video.currentTime < 0.3;
    });
    await page
      .getByRole("button", { name: "Pause whale loop" })
      .evaluate((button) => button.click());
    const paused = await video.evaluate((element) => element.currentTime);
    await page.waitForTimeout(120);
    assert.equal(
      await video.evaluate((element) => element.currentTime),
      paused,
    );
    for (const percent of [0, 10, 15, 29, 50, 70, 74, 80, 99, 100]) {
      await page
        .getByRole("button", {
          name: `Inspect whale pose at ${percent} percent`,
        })
        .evaluate((button) => button.click());
      await page.waitForFunction((value) => {
        const video = document.querySelector("video");
        return (
          video.paused &&
          !video.seeking &&
          Math.abs(video.currentTime - value * 0.18) < 0.001
        );
      }, percent);
      assert(
        (
          await page
            .getByRole("status", { name: "Whale timeline pose" })
            .textContent()
        ).startsWith(`${percent}%`),
      );
      assert(
        (await video.evaluate((element) =>
          window.portfolioWhaleError(element.currentTime),
        )) < 0.000001,
      );
      await page.screenshot({
        path: path.join(
          output,
          `source-${String(percent).padStart(3, "0")}.png`,
        ),
      });
    }
    await page
      .getByRole("button", { name: "Replay source timeline" })
      .evaluate((button) => button.click());
    await page.getByRole("button", { name: "01 Concept" }).click();
    await page.waitForFunction(() => document.querySelector("video").paused);
    await position(page);
    await page.waitForFunction(() => !document.querySelector("video").paused);
    for (const hidden of [true, false]) {
      await page.evaluate((value) => {
        Object.defineProperty(document, "hidden", {
          configurable: true,
          value,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      }, hidden);
      await page.waitForFunction(
        (value) => document.querySelector("video").paused === value,
        hidden,
      );
    }
    result.pauseSeekReplayAndVisibility = true;
  }
  await context.close();
  return result;
}

async function fallback(browser) {
  const { page, context } = await open(browser, "fallback");
  await page.evaluate(() => {
    window.portfolioClockProbe.active = true;
  });
  await page.waitForTimeout(1000);
  const result = await page.evaluate(() => ({ ...window.portfolioClockProbe }));
  assert(
    result.writes > 20 &&
      result.maxError < 0.000001 &&
      result.backward.length === 0,
  );
  await context.close();
  return {
    writes: result.writes,
    maxPositionErrorPercent: result.maxError,
    backwardWrites: result.backward,
  };
}

async function visuals(browser) {
  const results = [];
  for (const [width, height] of [
    [1920, 1080],
    [768, 1024],
    [390, 844],
    [320, 568],
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.goto(url);
    const stages = [];
    for (const name of ["Model", "Animate", "Export", "Integrate", "Render"]) {
      await page.getByRole("button", { name: `Inspect ${name} stage` }).click();
      const styles = await page
        .locator(
          ".tp-process-grid .tp-media-mount, .tp-integration-evidence .tp-source-crop",
        )
        .evaluateAll((elements) =>
          elements.map((element) => getComputedStyle(element).outlineStyle),
        );
      assert(
        styles.every((style) => style === "none"),
        `${width}: unwanted image outline at ${name}`,
      );
      stages.push(name);
    }
    await page
      .getByRole("button", { name: "View Mobile responsive preview" })
      .click();
    await position(page, ".tp-responsive-model");
    await page
      .getByRole("img", { name: /HeyYou responsive preview: mobile/ })
      .evaluate((image) => image.decode());
    const preview = await page
      .locator(".tp-responsive-model")
      .evaluate((element) => {
        const card = element
          .querySelector(".tp-viewport-active")
          .getBoundingClientRect();
        const drawing = element
          .querySelector(".tp-viewport-drawing")
          .getBoundingClientRect();
        const controls = element
          .querySelector(".tp-viewport-controls")
          .getBoundingClientRect();
        const image = element.querySelector("img");
        return {
          height: card.height,
          stageHeight: drawing.height,
          controlsClear: card.bottom + 12 < controls.top,
          image: [image.naturalWidth, image.naturalHeight],
        };
      });
    assert(preview.height < 400 && preview.controlsClear);
    assert.deepEqual(preview.image, [390, 1141]);
    await page.screenshot({
      path: path.join(output, `${width}-compact-mobile.png`),
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator(".tp-whale-media video").waitFor({ state: "detached" });
    assert.equal(await page.locator(".tp-whale-media video").count(), 0);
    assert.equal(
      await page
        .locator(".tp-timeline-marker")
        .evaluate((element) => element.getAnimations().length),
      0,
    );
    results.push({ width, height, stages, preview, reducedMotion: true });
    await context.close();
  }
  return results;
}

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel, headless: true });
  try {
    const [normal, lostCallback] = await Promise.all([
      threeLoops(browser, "normal"),
      threeLoops(browser, "lost-callback"),
    ]);
    const report = {
      url,
      channel,
      normal,
      lostCallback,
      fallback: await fallback(browser),
      visuals: await visuals(browser),
    };
    await fs.writeFile(
      path.join(output, "report.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify({
        url,
        channel,
        normalWrites: normal.writes,
        lostCallbackWrites: lostCallback.writes,
        backwardWrites: 0,
        fallback: report.fallback,
        output,
      }),
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
