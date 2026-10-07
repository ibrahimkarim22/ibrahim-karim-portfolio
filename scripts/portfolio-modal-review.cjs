/* eslint-env node */
// PORTFOLIO_PLAYWRIGHT_PATH=<existing module path> node scripts/portfolio-modal-review.cjs
// Same external Playwright convention as the other project review scripts.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const installClockProbe = require("./portfolio-clock-probe.cjs");
const { chromium } = require(
  process.env.PORTFOLIO_PLAYWRIGHT_PATH || "playwright",
);
const baseUrl = process.env.PORTFOLIO_REVIEW_URL || "http://localhost:3000";
const output =
  process.env.PORTFOLIO_REVIEW_OUTPUT_DIRECTORY ||
  path.join(os.tmpdir(), "portfolio-modal-exhibition-review");
const sizes = [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [320, 568],
];
const sections = [
  "concept",
  "system",
  "worlds",
  "motion",
  "assets",
  "experience",
  "quality",
  "deployment",
];
const report = {
  sizes: [],
  reducedMotion: [],
  pageErrors: [],
  consoleErrors: [],
  dependencyWarnings: [],
  assets: [],
};

function errors(page) {
  page.on("pageerror", (error) => report.pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    if (
      message.text().includes("Support for defaultProps") &&
      message.text().includes("Fade")
    )
      report.dependencyWarnings.push(message.text());
    else report.consoleErrors.push(message.text());
  });
}

async function loadImages(page, selector) {
  await page.locator(selector).evaluate(async (root) => {
    await Promise.all(
      [...root.querySelectorAll("img")].map((img) => {
        img.loading = "eager";
        return img.decode();
      }),
    );
    await document.fonts.ready;
  });
}

async function position(page, selector) {
  await page.locator(selector).evaluate((root) => {
    const body = document.querySelector(".tp-body");
    const index = document.querySelector(".tp-index");
    body.scrollTo({
      top:
        body.scrollTop +
        root.getBoundingClientRect().top -
        body.getBoundingClientRect().top -
        index.offsetHeight -
        12,
      behavior: "instant",
    });
  });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

async function accessibility(page) {
  await page.addScriptTag({ path: require.resolve("axe-core") });
  const result = await page.evaluate(() =>
    window.axe.run(".this-portfolio-modal-main-div", {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  assert.deepEqual(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        reason: n.failureSummary,
      })),
    })),
    [],
    "axe violations",
  );
}

async function polishAudit(page, width) {
  // Settle finite exhibit entrances before inspecting semantic copy/media.
  await page.locator(".tp-atlas").evaluate((root) => {
    root.getAnimations({ subtree: true }).forEach((animation) => {
      if (animation.effect.target.classList.contains("tp-timeline-marker"))
        return;
      animation.pause();
      animation.currentTime = animation.effect.getTiming().duration;
    });
  });
  const collisions = await page.locator(".tp-atlas").evaluate((root) => {
    const visible = (element) =>
      getComputedStyle(element).visibility !== "hidden" &&
      !element.closest(
        ".tp-annotation-reserve, [aria-hidden='true'], details:not([open])",
      );
    const media = [
      ...root.querySelectorAll(
        ".tp-media-mount, .tp-source-crop, .tp-study-stage, .tp-assembly-stage, .tp-whale-track, .tp-viewport-drawing, .tp-final-structure",
      ),
    ].filter((element) => !element.closest("details:not([open])"));
    const copy = [
      ...root.querySelectorAll(
        "h1, h2, h3, p, figcaption > span, figcaption > a",
      ),
    ].filter(visible);
    const found = [];
    for (const text of copy) {
      const range = document.createRange();
      range.selectNodeContents(text);
      const textBox = range.getBoundingClientRect();
      if (!textBox.width || !textBox.height) continue;
      for (const visual of media) {
        if (visual.contains(text) || text.contains(visual)) continue;
        const mediaBox = visual.getBoundingClientRect();
        const x =
          Math.min(textBox.right, mediaBox.right) -
          Math.max(textBox.left, mediaBox.left);
        const y =
          Math.min(textBox.bottom, mediaBox.bottom) -
          Math.max(textBox.top, mediaBox.top);
        if (x > 2 && y > 2)
          found.push({
            text: text.textContent.slice(0, 80),
            visual: visual.className,
            x,
            y,
          });
      }
    }
    // Shadows must also finish before caption text begins.
    const captions = [
      ...root.querySelectorAll(
        ".tp-world .tp-media, .tp-process-grid .tp-media",
      ),
    ].map((figure) => {
      const mount = figure.querySelector(".tp-media-mount");
      const caption = figure.querySelector("figcaption > span");
      const range = document.createRange();
      range.selectNodeContents(caption);
      const gap =
        range.getBoundingClientRect().top -
        mount.getBoundingClientRect().bottom;
      const needed = figure.closest(".tp-world")
        ? window.innerWidth <= 480
          ? 9
          : 18
        : 12;
      return { name: caption.textContent, gap, needed };
    });
    return { found, captions, copy: copy.length, media: media.length };
  });
  assert.deepEqual(
    collisions.found,
    [],
    `${width}: media covers semantic copy`,
  );
  assert(
    collisions.captions.every((caption) => caption.gap >= caption.needed + 4),
    `${width}: shadow crowds caption`,
  );
  const architecture = [];
  const snapshot = () =>
    page.evaluate(() => {
      const body = document.querySelector(".tp-body");
      const rect = (selector) =>
        document.querySelector(selector).getBoundingClientRect();
      return {
        height: rect("#tp-system").height,
        exploded: rect(".tp-exploded").height,
        next: rect("#tp-worlds").top,
        scroll: body.scrollTop,
        scrollHeight: body.scrollHeight,
        width: body.scrollWidth,
      };
    });
  for (const [selector, labels] of [
    [
      ".tp-exploded",
      [
        "Project experience layer",
        "Project modals layer",
        "Shared UI + routing layer",
        "Motion + assets layer",
        "Application shell layer",
      ],
    ],
    [
      ".tp-system-map",
      ["Portfolio shell", "Project catalog", "Modal host", "Project worlds"],
    ],
  ]) {
    await position(page, selector);
    const before = await snapshot();
    for (let repeat = 0; repeat < 3; repeat++)
      for (const label of labels) {
        const button = page.getByRole("button", {
          name: `Inspect ${label}`,
          exact: true,
        });
        await button.evaluate((element) =>
          element.focus({ preventScroll: true }),
        );
        await page.keyboard.press(repeat % 2 ? "Space" : "Enter");
        const after = await snapshot();
        for (const key of Object.keys(before))
          assert(
            Math.abs(before[key] - after[key]) <= 1,
            `${width}: ${label} changed ${key}: ${before[key]} → ${after[key]}`,
          );
        assert.equal(
          await button.evaluate(
            (element) => element === document.activeElement,
          ),
          true,
        );
        assert.equal(await button.getAttribute("aria-pressed"), "true");
        architecture.push({ label, ...after });
      }
  }
  const anchors = [];
  for (const [index, chapter] of sections.entries()) {
    const names = [
      "Concept",
      "System",
      "Worlds",
      "Motion",
      "Assets",
      "Loading",
      "Quality",
      "Ship",
    ];
    await page
      .getByRole("button", {
        name: `${String(index + 1).padStart(2, "0")} ${names[index]}`,
        exact: true,
      })
      .click();
    const anchor = await page.evaluate((name) => {
      const target = document.querySelector(`#tp-${name}-title`);
      return {
        title: target.getBoundingClientRect().top,
        chrome: document.querySelector(".tp-index").getBoundingClientRect()
          .bottom,
        focused: target === document.activeElement,
      };
    }, chapter);
    assert(
      anchor.focused && anchor.title >= anchor.chrome + 12,
      `${width}: ${chapter} under sticky chrome`,
    );
    anchors.push({ chapter, ...anchor });
  }
  await page
    .locator(".tp-body")
    .evaluate((body) =>
      body.scrollTo({ top: body.scrollHeight, behavior: "instant" }),
    );
  const footer = await page.evaluate(() => {
    const rect = (selector) =>
      document.querySelector(selector).getBoundingClientRect();
    return {
      height: rect(".tp-footer").height,
      bodyBottom: rect(".tp-body").bottom,
      top: rect(".tp-footer").top,
      copyrightBottom: rect(".tp-copyright").bottom,
    };
  });
  assert(
    footer.height <= (width <= 480 ? 64 : 70) &&
      footer.bodyBottom <= footer.top + 1 &&
      footer.copyrightBottom <= footer.top - 24,
    `${width}: footer obscures final content`,
  );
  await position(page, ".tp-timeline");
  const video = page.locator(".tp-whale-media video");
  await page
    .getByRole("button", { name: "Replay source timeline" })
    .evaluate((button) => button.click());
  await page.waitForFunction(
    () => document.querySelector(".tp-whale-media video").readyState >= 2,
  );
  const metadata = await video.evaluate((element) => ({
    duration: element.duration,
    width: element.videoWidth,
    height: element.videoHeight,
  }));
  assert.deepEqual(metadata, { duration: 18, width: 800, height: 408 });
  for (const percent of [0, 10, 15, 29, 50, 70, 74, 80, 99, 100]) {
    await page
      .getByRole("button", { name: `Inspect whale pose at ${percent} percent` })
      .evaluate((button) => button.click());
    await page.waitForFunction((value) => {
      const element = document.querySelector(".tp-whale-media video");
      return (
        element.paused &&
        !element.seeking &&
        Math.abs(element.currentTime - value * 0.18) < 0.001 &&
        document.querySelector(".tp-timeline-marker").getAnimations().length ===
          0
      );
    }, percent);
    assert.equal(
      await page
        .getByRole("button", {
          name: `Inspect whale pose at ${percent} percent`,
        })
        .getAttribute("aria-pressed"),
      "true",
    );
  }
  // Check decoded-frame sync and a real loop boundary, using the media clock.
  await page
    .getByRole("button", { name: "Inspect whale pose at 99 percent" })
    .evaluate((button) => button.click());
  await page
    .getByRole("button", { name: "Play whale loop" })
    .evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const element = document.querySelector(".tp-whale-media video");
    return !element.paused && !element.seeking;
  });
  const sync = await video.evaluate(
    (element) =>
      new Promise((resolve) => {
        const deltas = [];
        const times = [];
        let handle;
        const sample = (_, metadata) => {
          times.push(metadata.mediaTime);
          const source = [
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
          const progress = (window.portfolioLastMarkerTime / 18) * 100;
          const index = source.findIndex(
            (pose, i) =>
              progress >= pose[0] && (i === 9 || progress < source[i + 1][0]),
          );
          const from = source[index],
            to = source[Math.min(index + 1, 9)];
          const amount =
            from === to ? 0 : (progress - from[0]) / (to[0] - from[0]);
          const expectedX =
            8 + ((from[1] + (to[1] - from[1]) * amount + 68) / 78) * 84;
          const expectedY =
            12 + ((from[2] + (to[2] - from[2]) * amount + 10) / 130) * 76;
          const marker = document.querySelector(".tp-timeline-marker");
          deltas.push(
            Math.max(
              Math.abs(
                parseFloat(marker.style.getPropertyValue("--tp-marker-x")) -
                  expectedX,
              ),
              Math.abs(
                parseFloat(marker.style.getPropertyValue("--tp-marker-y")) -
                  expectedY,
              ),
            ),
          );
          handle = element.requestVideoFrameCallback(sample);
        };
        handle = element.requestVideoFrameCallback(sample);
        setTimeout(() => {
          element.cancelVideoFrameCallback(handle);
          resolve({
            frames: times.length,
            maxPositionErrorPercent: Math.max(...deltas),
            wrapped: times.some(
              (time, index) => index && time < times[index - 1],
            ),
          });
        }, 1300);
      }),
  );
  assert(
    sync.frames >= 12 &&
      sync.maxPositionErrorPercent < 0.000001 &&
      sync.wrapped,
    `${width}: video/path sync failed: ${JSON.stringify(sync)}`,
  );
  await page
    .getByRole("button", { name: "Pause whale loop" })
    .evaluate((button) => button.click());
  const paused = await video.evaluate((element) => element.currentTime);
  await page.waitForTimeout(150);
  assert.equal(
    await video.evaluate((element) => element.currentTime),
    paused,
    "Pause does not freeze video",
  );
  await page
    .getByRole("button", { name: "Play whale loop" })
    .evaluate((button) => button.click());
  await page.getByRole("button", { name: "01 Concept" }).click();
  await page.waitForFunction(
    () => document.querySelector(".tp-whale-media video").paused,
  );
  await position(page, ".tp-timeline");
  await page.waitForFunction(
    () => !document.querySelector(".tp-whale-media video").paused,
  );
  return {
    architectureSelections: architecture.length,
    architecture,
    anchors,
    footer,
    collisions,
    metadata,
    sync,
    offscreenPause: true,
  };
}

async function planeHits(browser) {
  const results = [];
  const viewports = [
    ...sizes,
    [1920, 1080],
    [360, 800],
    [420, 844],
    [480, 800],
    [481, 800],
    [720, 900],
    [800, 900],
    [801, 900],
  ];
  for (const [width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/projects/thisportfolio`);
    await page.locator(".tp-layer-stack button").first().waitFor();
    await loadImages(page, ".tp-atlas");
    const hits = [];
    for (let index = 0; index < 5; index++) {
      for (const fraction of [0.08, 0.5, 0.92]) {
        const buttons = page.locator(".tp-layer-stack button");
        // Start with another plane selected, so each real mouse click tests an
        // exposed part of an unselected surface, including its far right edge.
        await buttons
          .nth(index === 0 ? 4 : 0)
          .evaluate((button) => button.click());
        await page.waitForTimeout(270);
        await position(
          page,
          `.tp-layer-stack li:nth-child(${index + 1}) button`,
        );
        const point = await buttons.nth(index).evaluate((button, amount) => {
          const style = getComputedStyle(button);
          const matrix = new DOMMatrix(style.transform);
          const origin = style.transformOrigin.split(" ").map(parseFloat);
          const project = (x, y) => {
            const point = new DOMPoint(
              x - origin[0],
              y - origin[1],
              0,
              1,
            ).matrixTransform(matrix);
            return {
              x: point.x / point.w + origin[0],
              y: point.y / point.w + origin[1],
            };
          };
          const corners = [
            [0, 0],
            [button.offsetWidth, 0],
            [0, button.offsetHeight],
            [button.offsetWidth, button.offsetHeight],
          ].map(([x, y]) => project(x, y));
          const point = project(
            button.offsetWidth * amount,
            button.offsetHeight * 0.93,
          );
          const box = button.getBoundingClientRect();
          const x =
            box.left + point.x - Math.min(...corners.map((corner) => corner.x));
          const y =
            box.top + point.y - Math.min(...corners.map((corner) => corner.y));
          const hit = document.elementFromPoint(x, y);
          return {
            x,
            y,
            target: button.getAttribute("aria-label"),
            hit: hit?.closest("button") === button,
            interceptedBy: hit?.tagName + "." + hit?.className,
          };
        }, fraction);
        assert(
          point.hit,
          `${width}: plane ${index} at ${fraction}: ${JSON.stringify(point)}`,
        );
        await page.mouse.click(point.x, point.y);
        assert.equal(
          await buttons.nth(index).getAttribute("aria-pressed"),
          "true",
        );
        assert.equal(
          await buttons
            .nth(index)
            .evaluate((button) => button === document.activeElement),
          true,
        );
        hits.push({ index, fraction, ...point });
      }
    }
    const overflow = await page.locator(".tp-body").evaluate((body) => ({
      body: body.scrollWidth - body.clientWidth,
      page: document.documentElement.scrollWidth - window.innerWidth,
    }));
    assert(
      overflow.body <= 1 && overflow.page <= 1,
      `${width}: horizontal overflow`,
    );
    results.push({ width, height, hits, overflow });
    await page.screenshot({
      path: path.join(output, `${width}-plane-hit.png`),
    });
    await context.close();
    console.log(
      `${width}x${height}: all 15 left/center/right native plane clicks passed`,
    );
  }
  await fs.writeFile(
    path.join(output, "plane-hits.json"),
    JSON.stringify(results, null, 2),
  );
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({
    channel: process.env.PORTFOLIO_BROWSER_CHANNEL || "msedge",
    headless: true,
  });
  try {
    if (process.argv.includes("--planes-only")) {
      await planeHits(browser);
      return;
    }
    for (const [width, height] of sizes) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      errors(page);
      await installClockProbe(page);
      await page.goto(`${baseUrl}/projects/thisportfolio`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("dialog", { name: "THIS PORTFOLIO" }).waitFor();
      assert.equal(
        await page.locator(".tp-whale-media video").getAttribute("src"),
        null,
        "Offscreen video fetched at startup",
      );
      await loadImages(page, ".tp-hero");
      const animation = [];
      for (const time of [0, 700, 1900, 2700]) {
        const state = await page.locator(".tp-hero").evaluate((hero, ms) => {
          const animations = hero.getAnimations({ subtree: true });
          animations.forEach((a) => {
            a.pause();
            a.currentTime = ms;
          });
          return {
            frame: getComputedStyle(hero.querySelector(".tp-assembled-frame"))
              .clipPath,
            planes: [...hero.querySelectorAll(".tp-assembly-plane")].map(
              (p) => getComputedStyle(p).transform,
            ),
            duration: animations.map((a) => a.effect.getTiming().duration),
            iterations: animations.map((a) => a.effect.getTiming().iterations),
          };
        }, time);
        animation.push({ time, ...state });
        await page.screenshot({
          path: path.join(output, `${width}-assembly-${time}.png`),
        });
      }
      assert(
        animation[0].frame !== animation[3].frame,
        "assembly frame never resolves",
      );
      assert(
        animation[3].planes.every(
          (transform) => transform === "matrix(1, 0, 0, 1, 0, 0)",
        ),
        "planes do not register",
      );
      assert(
        animation.every(
          (frame) =>
            frame.duration.every((duration) => duration === 2700) &&
            frame.iterations.every((count) => count === 1),
        ),
        "opening loops or exceeds its duration",
      );
      const layout = [];
      for (const section of sections) {
        const selector = `#tp-${section}`;
        await position(page, selector);
        await loadImages(page, selector);
        const geometry = await page.locator(selector).evaluate((root) => {
          const body = document.querySelector(".tp-body");
          const rect = body.getBoundingClientRect();
          return {
            pageOverflow:
              document.documentElement.scrollWidth > window.innerWidth + 1,
            bodyOverflow: body.scrollWidth > body.clientWidth + 1,
            escaped: [
              ...root.querySelectorAll("h2, h3, p, figure, button, pre"),
            ]
              .filter((node) => {
                const r = node.getBoundingClientRect();
                return (
                  r.width > 0 &&
                  (r.left < rect.left - 2 || r.right > rect.right + 2)
                );
              })
              .map((node) => node.className),
            images: [...root.querySelectorAll("img")]
              .filter((img) => img.getBoundingClientRect().width > 0)
              .map((img) => ({
                loaded: img.naturalWidth > 0,
                declared: [
                  Number(img.getAttribute("width")),
                  Number(img.getAttribute("height")),
                ],
                natural: [img.naturalWidth, img.naturalHeight],
              })),
          };
        });
        assert(
          !geometry.pageOverflow && !geometry.bodyOverflow,
          `${width}: horizontal overflow in ${section}`,
        );
        assert.deepEqual(
          geometry.escaped,
          [],
          `${width}: escaped content in ${section}`,
        );
        assert(
          geometry.images.every((img) => img.loaded),
          `${width}: broken media`,
        );
        assert(
          geometry.images.every(
            (img) =>
              img.declared[0] === img.natural[0] &&
              img.declared[1] === img.natural[1],
          ),
          `${width}: image dimensions do not match source in ${section}`,
        );
        layout.push({ section, ...geometry });
        await page.screenshot({
          path: path.join(output, `${width}-${section}.png`),
        });
        await accessibility(page);
      }
      const polish = await polishAudit(page, width);
      // Record a continuous reading pass, including the areas between chapter starts.
      await page
        .locator(".tp-body")
        .evaluate((body) => body.scrollTo({ top: 0, behavior: "instant" }));
      const distance = await page.locator(".tp-body").evaluate((body) => ({
        max: body.scrollHeight - body.clientHeight,
        step: Math.floor(body.clientHeight * 0.8),
      }));
      let frame = 0;
      for (
        let top = 0;
        top <= distance.max + distance.step;
        top += distance.step
      ) {
        await page
          .locator(".tp-body")
          .evaluate(
            (body, value) => body.scrollTo({ top: value, behavior: "instant" }),
            top,
          );
        await page.screenshot({
          path: path.join(
            output,
            `${width}-reading-${String(frame++).padStart(2, "0")}.png`,
          ),
        });
      }
      await position(page, ".tp-system-map");
      for (const name of [
        "Portfolio shell",
        "Project catalog",
        "Modal host",
        "Project worlds",
      ]) {
        const control = page.getByRole("button", {
          name: `Inspect ${name}`,
          exact: true,
        });
        await control.focus();
        await page.keyboard.press("Enter");
        assert.equal(await control.getAttribute("aria-pressed"), "true");
        await accessibility(page);
      }
      await position(page, ".tp-exploded");
      for (const name of [
        "Project experience",
        "Project modals",
        "Shared UI + routing",
        "Motion + assets",
        "Application shell",
      ]) {
        const control = page.getByRole("button", {
          name: `Inspect ${name} layer`,
        });
        await control.focus();
        await page.keyboard.press("Space");
        assert.equal(await control.getAttribute("aria-pressed"), "true");
        assert.equal(
          await control.evaluate((button) => document.activeElement === button),
          true,
        );
      }
      await position(page, ".tp-motion-lab");
      for (const name of ["HeyYou", "BARD", "Tuh-Doo"]) {
        const model = page.getByRole("img", {
          name: `${name} simplified motion study`,
        });
        const previous = Number(await model.getAttribute("data-run"));
        const button = page.getByRole("button", {
          name: `Replay ${name} motion study`,
        });
        await button.focus();
        await page.keyboard.press("Enter");
        assert.equal(
          Number(await model.getAttribute("data-run")),
          previous + 1,
        );
        const timing = await model.evaluate((root) =>
          root.getAnimations({ subtree: true }).map((animation) => ({
            duration: animation.effect.getTiming().duration,
            iterations: animation.effect.getTiming().iterations,
          })),
        );
        assert(
          timing.length > 0 && timing.every((item) => item.iterations === 1),
          "motion study does not play once",
        );
      }
      for (const ms of [0, 1900, 3800]) {
        await page.locator(".tp-motion-lab").evaluate(
          (root, time) =>
            root.getAnimations({ subtree: true }).forEach((animation) => {
              animation.pause();
              animation.currentTime = time;
            }),
          ms,
        );
        await page.screenshot({
          path: path.join(output, `${width}-motion-${ms}.png`),
        });
      }
      await page
        .getByRole("button", { name: "Replay source timeline" })
        .click();
      await page
        .getByRole("button", { name: "Inspect whale pose at 29 percent" })
        .evaluate((button) => button.click());
      await page.locator(".tp-timeline-marker").evaluate((root) => {
        if (root.getAnimations().length)
          throw new Error("Marker has an independent animation");
        if (
          Math.abs(
            parseFloat(root.style.getPropertyValue("--tp-marker-x")) -
              59.6923076923,
          ) > 0.000001
        )
          throw new Error("Marker did not seek with the video");
      });
      await page
        .getByRole("status", { name: "Whale timeline pose" })
        .filter({ hasText: "29% / Dive" })
        .waitFor();
      await page
        .getByRole("button", { name: "Inspect whale pose at 70 percent" })
        .click();
      assert(
        (
          await page
            .getByRole("status", { name: "Whale timeline pose" })
            .textContent()
        ).includes("70% / Float"),
      );
      await position(page, ".tp-timeline");
      await page.screenshot({
        path: path.join(output, `${width}-timeline.png`),
      });
      await position(page, ".tp-production-pipeline");
      for (const stage of [
        "Model",
        "Animate",
        "Export",
        "Integrate",
        "Render",
      ]) {
        const control = page.getByRole("button", {
          name: `Inspect ${stage} stage`,
        });
        await control.focus();
        await page.keyboard.press("Space");
        assert.equal(await control.getAttribute("aria-pressed"), "true");
      }
      await position(page, ".tp-inspection");
      for (const practice of [
        "Responsive",
        "Keyboard",
        "Focus",
        "Reduced motion",
        "Regression testing",
        "Accessibility",
      ]) {
        const control = page.getByRole("button", {
          name: `Inspect ${practice} practice`,
        });
        await control.focus();
        await page.keyboard.press("Enter");
        assert.equal(await control.getAttribute("aria-pressed"), "true");
      }
      for (const size of ["Desktop", "Tablet", "Mobile"]) {
        await page
          .getByRole("button", { name: `View ${size} responsive preview` })
          .click();
        assert.equal(
          await page
            .locator(".tp-viewport-active")
            .getAttribute("data-viewport"),
          size.toLowerCase(),
        );
      }
      await accessibility(page);
      await position(page, ".tp-final-model");
      for (const ms of [0, 1000, 2000]) {
        await page.locator(".tp-final-model").evaluate(
          (root, time) =>
            root.getAnimations({ subtree: true }).forEach((animation) => {
              animation.pause();
              animation.currentTime = time;
            }),
          ms,
        );
        await page.screenshot({
          path: path.join(output, `${width}-final-${ms}.png`),
        });
      }
      await page
        .getByText("Open the splash motion source", { exact: true })
        .click();
      await loadImages(page, ".tp-motion-section");
      await accessibility(page);
      const originals = await page
        .getByRole("link", { name: /^View .* at full size/ })
        .evaluateAll((links) =>
          links.map((link) => ({
            href: link.href,
            rel: link.rel,
            target: link.target,
          })),
        );
      assert(originals.length >= 10, "missing originals");
      assert(
        !originals.some((link) =>
          /portfolio-(shell|tablet|mobile)\./.test(link.href),
        ),
        "Projects-page capture returned",
      );
      assert(
        originals.every(
          (link) =>
            link.target === "_blank" && link.rel === "noopener noreferrer",
        ),
      );
      if (width === 1440) {
        for (const link of originals)
          assert.equal(
            (await page.request.get(link.href)).status(),
            200,
            `original image missing: ${link.href}`,
          );
        report.assets = originals.map((link) => link.href);
      }
      const before = page.url();
      await page.getByRole("button", { name: "03 Worlds" }).click();
      assert.equal(
        await page
          .getByRole("heading", { name: "One system. Different worlds." })
          .evaluate((h) => h === document.activeElement),
        true,
      );
      assert.equal(page.url(), before);
      assert.equal(
        await page
          .getByRole("button", { name: "03 Worlds" })
          .getAttribute("aria-current"),
        "step",
      );
      await position(page, "#tp-concept");
      await page
        .getByRole("region", { name: "Portfolio studio atlas" })
        .focus();
      const scrollBefore = await page
        .locator(".tp-body")
        .evaluate((body) => body.scrollTop);
      await page.keyboard.press("PageDown");
      await page.waitForTimeout(250);
      assert(
        (await page.locator(".tp-body").evaluate((body) => body.scrollTop)) >
          scrollBefore,
        "keyboard cannot scroll body",
      );
      const github = page.getByRole("link", { name: /GitHub/ });
      await github.focus();
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .getByRole("button", { name: "Close project" })
          .evaluate((button) => document.activeElement === button),
        true,
        "focus escaped dialog",
      );
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "detached" });
      assert.equal(new URL(page.url()).pathname, "/projects");
      await page
        .getByRole("button", { name: /Portfolio This Portfolio/ })
        .click();
      await page.getByRole("button", { name: "Close", exact: true }).click();
      assert.equal(
        await page
          .getByRole("button", { name: /Portfolio This Portfolio/ })
          .evaluate((button) => button === document.activeElement),
        true,
        "opener focus was not restored",
      );
      report.sizes.push({
        width,
        height,
        layout,
        animation,
        keyboard: true,
        focus: true,
        links: originals.length,
        axe: 0,
        readingFrames: frame,
        polish,
      });
      await context.close();
      console.log(
        `${width}x${height}: reading pass, geometry, media, assembly, keyboard, focus and axe passed`,
      );
    }
    for (const [width, height] of sizes) {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      errors(page);
      await page.goto(`${baseUrl}/projects/thisportfolio`, {
        waitUntil: "domcontentloaded",
      });
      await page.locator(".tp-hero").waitFor();
      assert.equal(
        await page.locator(".tp-whale-media video").count(),
        0,
        "Reduced-motion video mounted",
      );
      const reduced = await page
        .locator(".this-portfolio-modal-main-div")
        .evaluate((root) => ({
          animations: root.getAnimations({ subtree: true }).length,
          frame: getComputedStyle(root.querySelector(".tp-assembled-frame"))
            .clipPath,
          title: getComputedStyle(root.querySelector("h1")).clipPath,
        }));
      assert.deepEqual(reduced, {
        animations: 0,
        frame: "none",
        title: "none",
      });
      await page
        .getByRole("button", { name: "Inspect Motion + assets layer" })
        .click();
      assert(
        (
          await page.getByRole("region", { name: "Layer detail" }).textContent()
        ).includes("CSS keyframes"),
      );
      for (const name of ["HeyYou", "BARD", "Tuh-Doo"])
        await page
          .getByRole("button", { name: `Replay ${name} motion study` })
          .click();
      await page
        .getByRole("button", { name: "Replay source timeline" })
        .click();
      assert.equal(
        await page
          .locator(".this-portfolio-modal-main-div")
          .evaluate((root) => root.getAnimations({ subtree: true }).length),
        0,
        "reduced-motion replay animates",
      );
      await page
        .getByRole("button", { name: "Inspect whale pose at 29 percent" })
        .click();
      assert(
        (
          await page
            .getByRole("status", { name: "Whale timeline pose" })
            .textContent()
        ).includes("29% / Dive"),
      );
      await accessibility(page);
      await position(page, "#tp-concept");
      await loadImages(page, ".tp-hero");
      await page.screenshot({
        path: path.join(output, `${width}-reduced.png`),
      });
      await page.getByRole("button", { name: "Close project" }).click();
      await page.getByRole("dialog").waitFor({ state: "detached" });
      report.reducedMotion.push({
        width,
        height,
        ...reduced,
        axe: 0,
        interactions: true,
      });
      await context.close();
    }
    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.consoleErrors, []);
    await fs.writeFile(
      path.join(output, "report.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify(
        {
          viewports: report.sizes.length,
          reducedMotionViewports: report.reducedMotion.length,
          errors: 0,
          output,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
