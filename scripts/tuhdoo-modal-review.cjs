/* eslint-env node */
// Reuse an external Playwright install; do not add project dependencies.
// TUHDOO_PLAYWRIGHT_PATH=<module path> node scripts/tuhdoo-modal-review.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require(process.env.TUHDOO_PLAYWRIGHT_PATH || "playwright");

const baseUrl = process.env.TUHDOO_REVIEW_URL || "http://localhost:3000";
const output = process.env.TUHDOO_REVIEW_OUTPUT_DIRECTORY || path.join(os.tmpdir(), "tuhdoo-modal-review");
const sizes = [[1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 568]];
const sections = [".td-hero", ".td-workflow", ".td-product", ".td-capture-account", ".td-capture-board", ".td-capture-theme", ".td-build-divider", "#td-react-title", "#td-interaction-title", ".td-state-system", "#td-auth-title", "#td-data-title", "#td-styling-title", ".td-completion"];

function observeErrors(page, report) {
  page.on("pageerror", (error) => report.pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (text.includes("Support for defaultProps will be removed from function components") && text.includes("Fade")) report.dependencyWarnings.push(text);
    else report.consoleErrors.push(text);
  });
}

async function scrollTo(page, selector) {
  await page.locator(selector).evaluate((element) => {
    const body = document.querySelector(".kanban-modal-main");
    body.scrollTo({ top: body.scrollTop + element.getBoundingClientRect().top - body.getBoundingClientRect().top - 24, behavior: "instant" });
  });
}

async function openingFrame(page, time) {
  return page.locator(".td-hero").evaluate((hero, frameTime) => {
    for (const animation of hero.getAnimations({ subtree: true })) {
      animation.pause();
      animation.currentTime = frameTime;
    }
    const board = hero.querySelector(".td-sort-board").getBoundingClientRect();
    const cards = [...hero.querySelectorAll(".td-sort-card")].map((card) => {
      const r = card.getBoundingClientRect(), s = getComputedStyle(card);
      return { left: r.left - board.left, top: r.top - board.top, width: r.width, height: r.height, opacity: Number(s.opacity), transform: s.transform };
    });
    return { board: { width: board.width, height: board.height }, cards };
  }, time);
}

async function heroState(page) {
  return page.locator(".td-opening").evaluate((hero) => {
    hero.closest(".td-hero").getAnimations({ subtree: true }).forEach((animation) => animation.finish());
    const board = hero.querySelector(".td-sort-board").getBoundingClientRect();
    return { phase: hero.dataset.ambientPhase, width: board.width, height: board.height,
      cards: [...hero.querySelectorAll(".td-sort-card")].map((card) => {
        const r = card.getBoundingClientRect();
        return { column: card.dataset.heroColumn, visible: card.dataset.heroVisible === "true", title: card.querySelector("strong").textContent,
          left: r.left - board.left, top: r.top - board.top, width: r.width, height: r.height };
      }) };
  });
}

function assertHeroContained(state, width) {
  const visible = state.cards.filter((card) => card.visible);
  assert(visible.length >= 4 && visible.length <= 5, `${width}: implausible ambient card count`);
  assert(visible.every((card) => card.left >= -1 && card.top >= -1 && card.left + card.width <= state.width + 1 && card.top + card.height <= state.height + 1), `${width}: ambient card outside board`);
  assert.equal(new Set(visible.map((card) => `${card.column}/${Math.round(card.top)}`)).size, visible.length, `${width}: ambient cards share a slot`);
}

async function reviewAmbient(browser, report) {
  for (const [width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "no-preference" });
    const page = await context.newPage();
    observeErrors(page, report);
    const start = new Date("2026-10-04T12:00:00Z");
    await page.clock.install({ time: start });
    await page.clock.pauseAt(start);
    await page.goto(`${baseUrl}/projects/kanban`, { waitUntil: "domcontentloaded" });
    await page.getByRole("dialog", { name: "TUH-DOO" }).waitFor();
    await scrollTo(page, ".td-opening");
    await page.clock.runFor(2700);
    await page.locator('[data-ambient-running="true"]').waitFor();
    const openingChecks = await page.locator(".td-sort-check").evaluateAll((checks) => checks.map((check) => ({ opacity: getComputedStyle(check).opacity, animated: check.classList.contains("td-sort-check--ambient") })));
    assert(openingChecks.every((check) => check.opacity === "1" && !check.animated), `${width}: existing completion checks replay after opening`);
    let previous = await heroState(page);
    assert.equal(previous.phase, "organized");
    assertHeroContained(previous, width);
    const states = [previous];
    for (const phase of ["archive", "progress", "complete", "backlog", "archive", "progress", "complete", "backlog"]) {
      await page.clock.runFor(3200);
      await page.locator(`[data-ambient-phase="${phase}"]`).waitFor();
      if (phase === "progress" || phase === "complete") {
        const moving = await page.locator(".td-opening").evaluate((hero) => {
          const animations = hero.getAnimations({ subtree: true }).filter((animation) => animation.effect.target.closest(".td-sort-card"));
          const changingCards = new Set(animations.map((animation) => animation.effect.target.closest(".td-sort-card")));
          animations.forEach((animation) => { animation.pause(); animation.currentTime = 325; });
          const board = hero.querySelector(".td-sort-board").getBoundingClientRect();
          return { count: changingCards.size, contained: [...hero.querySelectorAll('[data-hero-visible="true"]')].every((card) => {
            const r = card.getBoundingClientRect(); return r.left >= board.left - 1 && r.right <= board.right + 1 && r.top >= board.top - 1 && r.bottom <= board.bottom + 1;
          }) };
        });
        assert(moving.count <= 1, `${width}: multiple cards animate during ambient movement`);
        assert(moving.contained, `${width}: card leaves hero mid-transition`);
      }
      const state = await heroState(page);
      assertHeroContained(state, width);
      assert.equal(state.height, previous.height, `${width}: ambient board height changed`);
      assert.equal(state.width, previous.width, `${width}: ambient board width changed`);
      const priorCards = previous.cards;
      const changed = state.cards.filter((card, index) => card.column !== priorCards[index].column || card.visible !== priorCards[index].visible || card.title !== priorCards[index].title);
      assert.equal(changed.length, 1, `${width}: more than one ambient task changed`);
      states.push(state);
      previous = state;
    }
    await page.screenshot({ path: path.join(output, `${width}-ambient-backlog.png`) });

    await page.clock.runFor(1000);
    await scrollTo(page, ".td-workflow");
    await page.locator('[data-ambient-running="false"]').waitFor();
    const paused = await heroState(page);
    await page.clock.runFor(20000);
    assert.deepEqual(await heroState(page), paused, `${width}: ambient progression continued offscreen`);
    await scrollTo(page, ".td-opening");
    await page.locator('[data-ambient-running="true"]').waitFor();
    await page.clock.runFor(2199);
    assert.equal((await heroState(page)).phase, "backlog");
    await page.clock.runFor(1);
    await page.locator('[data-ambient-phase="archive"]').waitFor();

    // Exercise the browser visibility event with a controlled hidden document.
    await page.clock.runFor(1000);
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
    const hidden = await heroState(page);
    assert.equal(await page.locator(".td-opening").getAttribute("data-ambient-running"), "false");
    await page.clock.runFor(20000);
    assert.deepEqual(await heroState(page), hidden, `${width}: ambient progression continued in hidden document`);
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); });
    await page.clock.runFor(2199);
    assert.equal((await heroState(page)).phase, "archive");
    await page.clock.runFor(1);
    await page.locator('[data-ambient-phase="progress"]').waitFor();

    await scrollTo(page, ".td-workflow");
    await page.getByRole("button", { name: "Move Outline the idea to In Progress" }).click();
    await page.getByRole("button", { name: "Move Outline the idea to Complete" }).click();
    await scrollTo(page, ".td-opening");
    await page.locator('[data-ambient-running="true"]').waitFor();
    await page.clock.runFor(12800);
    assert.equal(await page.getByRole("region", { name: "Complete", exact: true }).getByRole("listitem", { name: "Outline the idea" }).count(), 1, `${width}: hero changed manual demo state`);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator('[data-ambient-phase="organized"]').waitFor();
    assert.equal(await page.locator(".td-opening").getAttribute("data-ambient-running"), "false");
    const reduced = await heroState(page);
    await page.clock.runFor(60000);
    assert.deepEqual(await heroState(page), reduced);
    assert.equal(await page.locator(".td-opening").evaluate((hero) => hero.getAnimations({ subtree: true }).length), 0);
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    await page.clock.runFor(60000);
    report.ambient.push({ width, height, states, offscreenPauseAndRemainingWait: true, hiddenDocumentPauseAndRemainingWait: true, manualDemoIndependent: true, dynamicReducedMotion: true, closedWithoutError: true });
    await context.close();
    console.log(`${width}x${height}: ambient cycles, containment, pause/resume and manual independence passed`);
  }
}

async function review() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.TUHDOO_BROWSER_CHANNEL || "msedge", headless: true });
  const report = { sizes: [], ambient: [], reducedMotion: [], interactions: {}, pageErrors: [], consoleErrors: [], dependencyWarnings: [] };
  try {
    for (const [width, height] of sizes) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "no-preference" });
      const page = await context.newPage();
      observeErrors(page, report);
      await page.goto(`${baseUrl}/projects/kanban`, { waitUntil: "domcontentloaded" });
      const dialog = page.getByRole("dialog", { name: "TUH-DOO" });
      await dialog.waitFor();
      await page.locator(".td-hero").waitFor();
      assert(await page.getByText(/TRY THE WORKFLOW/).isVisible());
      assert(await page.getByText(/Interactive recreation based on the original Tuh-Doo project/).isVisible());
      assert(await page.getByText(/ORIGINAL PROJECT UI/).isVisible());
      assert(await page.getByText("The original interface shown below is preserved from the project build.", { exact: true }).isVisible());

      const opening = [];
      for (const time of [0, 700, 1350, 1850, 2350, 2700]) {
        opening.push({ time, ...await openingFrame(page, time) });
        await page.screenshot({ path: path.join(output, `${width}-opening-${time}.png`) });
      }
      const finalFrame = opening[opening.length - 1];
      assert(finalFrame.cards.every((card) => card.opacity === 1 && card.left >= -1 && card.left + card.width <= finalFrame.board.width + 1 && card.top + card.height <= finalFrame.board.height + 1), `${width}: final opening cards outside the board`);
      assert(opening.filter((frame) => frame.time >= 1350).every((frame) => frame.cards.every((card) => card.top >= -1 && card.top + card.height <= frame.board.height + 1)), `${width}: sorting cards leave the board after the initial loose arrangement`);

      const metrics = await dialog.evaluate((root) => {
        const body = root.querySelector(".kanban-modal-main");
        const header = root.querySelector(".td-toolbar").getBoundingClientRect();
        const footer = root.querySelector(".td-footer").getBoundingClientRect();
        return { bodyWidth: body.clientWidth, bodyScrollWidth: body.scrollWidth, bodyHeight: body.clientHeight, headerHeight: header.height, footerHeight: footer.height,
          controls: [...root.querySelectorAll("button, .td-action, .td-full-size, .td-text-link")].map((element) => { const r = element.getBoundingClientRect(); return { name: element.getAttribute("aria-label") || element.textContent.trim(), width: r.width, height: r.height }; }),
          pageOverflow: document.documentElement.scrollWidth > window.innerWidth };
      });
      assert.equal(metrics.bodyWidth, metrics.bodyScrollWidth, `${width}: case study horizontal overflow`);
      assert.equal(metrics.pageOverflow, false, `${width}: page horizontal overflow`);
      assert(metrics.headerHeight <= 68 && metrics.footerHeight <= 72, `${width}: oversized header/footer`);
      assert(metrics.controls.every((control) => control.height >= 43.9), `${width}: control smaller than 44px high`);
      assert(metrics.controls.filter((control) => !/^View /.test(control.name) && !/^Try /.test(control.name)).every((control) => control.width >= 43.9), `${width}: control smaller than 44px wide`);

      for (const [index, section] of sections.entries()) {
        await scrollTo(page, section);
        await page.waitForFunction(() => [...document.querySelectorAll(".td-case-study img")].filter((image) => {
          const mount = image.closest("figure"), r = mount.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        }).every((image) => image.complete && image.naturalWidth > 0));
        await page.locator(".td-case-study img").evaluateAll((images) => Promise.all(images.filter((image) => {
          const r = image.closest("figure").getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        }).map((image) => image.decode())));
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.screenshot({ path: path.join(output, `${width}-section-${String(index).padStart(2, "0")}.png`) });
      }
      const media = await page.locator(".td-case-study img").evaluateAll((images) => images.map((image) => {
        const r = image.getBoundingClientRect();
        return { alt: image.alt, loaded: image.complete && image.naturalWidth > 0, ratioError: Math.abs(r.width / r.height - image.naturalWidth / image.naturalHeight) };
      }));
      assert.equal(media.length, 12);
      assert(media.every((item) => item.loaded && item.ratioError < 0.01), `${width}: missing or distorted media`);

      await page.locator(".kanban-modal-main").evaluate((body) => body.scrollTo({ top: body.scrollHeight, behavior: "instant" }));
      await page.waitForFunction(() => document.querySelector('[aria-label="Case study progress"]').getAttribute("aria-valuenow") === "100");
      await page.screenshot({ path: path.join(output, `${width}-complete.png`) });
      await page.addScriptTag({ path: require.resolve("axe-core") });
      const axe = await page.evaluate(() => window.axe.run(".kanban-modal-main-div", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } }));
      report.sizes.push({ width, height, metrics, opening, media, axeViolations: axe.violations });
      await fs.writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
      assert.equal(axe.violations.length, 0, `${width}: axe violations: ${axe.violations.map((v) => v.id).join(", ")}`);

      await scrollTo(page, ".td-workflow");
      const forward = page.getByRole("button", { name: "Move Outline the idea to In Progress" });
      await forward.focus();
      await page.keyboard.press("Enter");
      const complete = page.getByRole("button", { name: "Move Outline the idea to Complete" });
      assert(await complete.evaluate((element) => element === document.activeElement), `${width}: focus lost after card move`);
      await page.keyboard.press("Enter");
      assert(await page.getByRole("status").textContent() === "Outline the idea completed. 2 of 5 tasks complete.");
      const back = page.getByRole("button", { name: "Move Outline the idea to In Progress" });
      assert(await back.evaluate((element) => element === document.activeElement), `${width}: focus lost on completion`);
      await page.getByRole("button", { name: "Reset board" }).click();
      if (width < 650) {
        const local = await page.locator(".td-board-scroll").evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return { width: element.clientWidth, scrollWidth: element.scrollWidth, columns: [...element.querySelectorAll(".td-column")].map((column) => {
            const r = column.getBoundingClientRect(); return { left: r.left - bounds.left, right: r.right - bounds.left, top: r.top, bottom: r.bottom };
          }) };
        });
        assert.equal(local.scrollWidth, local.width, `${width}: mobile demo requires horizontal scrolling`);
        assert(local.columns.every((column) => column.left >= 0 && column.right <= local.width + 1), `${width}: mobile column clipped`);
        assert(local.columns[1].top > local.columns[0].bottom && local.columns[2].top > local.columns[1].bottom, `${width}: phone columns are not stacked`);
        await scrollTo(page, ".td-demo");
        await page.screenshot({ path: path.join(output, `${width}-stacked-demo.png`) });
      }

      await page.getByRole("button", { name: "Close project" }).click();
      await page.getByRole("dialog").waitFor({ state: "detached" });
      await context.close();
      console.log(`${width}×${height}: layout, opening, media, keyboard, progress and axe passed`);
    }

    for (const [width, height] of [[1440, 900], [390, 844], [320, 568]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      const page = await context.newPage();
      observeErrors(page, report);
      await page.goto(`${baseUrl}/projects/kanban`, { waitUntil: "domcontentloaded" });
      await page.getByRole("dialog", { name: "TUH-DOO" }).waitFor();
      const motion = await page.locator(".td-hero").evaluate((hero) => ({ count: hero.getAnimations({ subtree: true }).length, titleOpacity: getComputedStyle(hero.querySelector("h1")).opacity, cards: [...hero.querySelectorAll(".td-sort-card")].map((card) => ({ transform: getComputedStyle(card).transform, opacity: getComputedStyle(card).opacity })) }));
      assert.equal(motion.count, 0);
      assert.equal(motion.titleOpacity, "1");
      assert(motion.cards.every((card) => card.opacity === "1" && card.transform === "none"));
      await page.screenshot({ path: path.join(output, `${width}-reduced-motion.png`) });
      await page.addScriptTag({ path: require.resolve("axe-core") });
      const axe = await page.evaluate(() => window.axe.run(".kanban-modal-main-div", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } }));
      assert.equal(axe.violations.length, 0, `${width}: reduced-motion axe violations`);
      report.reducedMotion.push({ width, height, motion, axeViolations: axe.violations });
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "detached" });
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    observeErrors(page, report);
    await page.goto(`${baseUrl}/projects/kanban`, { waitUntil: "domcontentloaded" });
    await page.getByRole("dialog", { name: "TUH-DOO" }).waitFor();
    await scrollTo(page, ".td-workflow");
    const source = page.getByRole("listitem", { name: "Outline the idea" });
    await source.dragTo(page.getByRole("region", { name: "Complete", exact: true }));
    await page.getByRole("region", { name: "Complete", exact: true }).getByRole("listitem", { name: "Outline the idea" }).waitFor();
    assert.equal(await page.locator(".td-task").count(), 5);
    report.interactions.nativeDrag = true;
    const links = await page.getByRole("link", { name: /^View .* at full size/ }).evaluateAll((elements) => elements.map((element) => ({ href: element.href, target: element.target, rel: element.rel })));
    assert.equal(links.length, 12);
    for (const link of links) {
      const response = await page.request.get(link.href);
      assert.equal(response.status(), 200);
      assert.equal(link.target, "_blank");
      assert.equal(link.rel, "noopener noreferrer");
    }
    report.interactions.fullSizeMedia = 12;
    const fullImage = page.getByRole("link", { name: /View React state and hooks at full size/ });
    await fullImage.focus();
    const popupPromise = page.waitForEvent("popup");
    await page.keyboard.press("Enter");
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
    assert(popup.url().includes("kanbanReactTwo"));
    await popup.close();
    report.interactions.keyboardFullSizeLink = true;
    const first = page.getByRole("button", { name: "Close project" });
    const last = page.getByRole("link", { name: /GitHub/ });
    await last.focus();
    await page.keyboard.press("Tab");
    assert(await first.evaluate((element) => element === document.activeElement));
    await page.keyboard.press("Shift+Tab");
    assert(await last.evaluate((element) => element === document.activeElement));
    await first.focus();
    await page.keyboard.press("Tab");
    assert(await page.locator(".kanban-modal-main").evaluate((element) => element === document.activeElement));
    const before = await page.locator(".kanban-modal-main").evaluate((element) => element.scrollTop);
    await page.keyboard.press("PageDown");
    await page.waitForFunction((top) => document.querySelector(".kanban-modal-main").scrollTop > top, before);
    report.interactions.keyboardFocusAndScrolling = true;
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "detached" });
    const opener = page.locator('[data-project-id="kanban"]');
    await opener.click();
    await page.getByRole("dialog", { name: "TUH-DOO" }).waitFor();
    await scrollTo(page, ".td-workflow");
    await page.getByRole("button", { name: "Move Outline the idea to In Progress" }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    await page.waitForFunction(() => document.activeElement?.getAttribute("data-project-id") === "kanban");
    await opener.click();
    await page.getByRole("dialog", { name: "TUH-DOO" }).waitFor();
    assert.equal(await page.getByRole("region", { name: "Backlog", exact: true }).getByRole("listitem").count(), 2);
    assert.equal(await page.getByRole("progressbar").getAttribute("aria-valuenow"), "0");
    report.interactions.openerRestorationAndReopenReset = true;
    await page.getByRole("button", { name: "Try the workflow" }).click();
    assert(await page.getByRole("heading", { name: "Good work moves forward." }).evaluate((element) => element === document.activeElement));
    assert.equal(new URL(page.url()).hash, "");
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    await page.goBack();
    assert.equal(await page.getByRole("dialog").count(), 0, "Hero jump created history that reopened the modal on Back");
    report.interactions.heroJumpPreservesRouterHistory = true;
    await context.close();

    const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
    const touchPage = await touchContext.newPage();
    observeErrors(touchPage, report);
    await touchPage.goto(`${baseUrl}/projects/kanban`, { waitUntil: "domcontentloaded" });
    await touchPage.getByRole("dialog", { name: "TUH-DOO" }).waitFor();
    await scrollTo(touchPage, ".td-workflow");
    await touchPage.getByRole("button", { name: "Move Outline the idea to In Progress" }).tap();
    await touchPage.getByRole("button", { name: "Move Outline the idea to Complete" }).tap();
    assert.equal(await touchPage.getByRole("region", { name: "Complete", exact: true }).getByRole("listitem").count(), 2);
    await touchPage.getByRole("button", { name: "Reset board" }).tap();
    assert.equal(await touchPage.getByRole("region", { name: "Backlog", exact: true }).getByRole("listitem").count(), 2);
    report.interactions.touchMovementAndReset = true;
    await touchContext.close();

    const preferenceContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
    const preferencePage = await preferenceContext.newPage();
    observeErrors(preferencePage, report);
    await preferencePage.goto(`${baseUrl}/projects/kanban`, { waitUntil: "domcontentloaded" });
    await preferencePage.getByRole("dialog", { name: "TUH-DOO" }).waitFor();
    await openingFrame(preferencePage, 1350);
    await preferencePage.emulateMedia({ reducedMotion: "reduce" });
    const switched = await preferencePage.locator(".td-hero").evaluate((hero) => ({ animations: hero.getAnimations({ subtree: true }).length, titleOpacity: getComputedStyle(hero.querySelector("h1")).opacity, cardsSettled: [...hero.querySelectorAll(".td-sort-card")].every((card) => getComputedStyle(card).transform === "none") }));
    assert.equal(switched.animations, 0);
    assert.equal(switched.titleOpacity, "1");
    assert(switched.cardsSettled);
    report.interactions.reducedMotionPreferenceChange = true;
    await preferenceContext.close();
    await reviewAmbient(browser, report);
    assert.equal(report.pageErrors.length, 0);
    assert.equal(report.consoleErrors.length, 0);
    await fs.writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
    console.log(`Review passed. Report and screenshots: ${output}`);
  } finally {
    await browser.close();
  }
}

review().catch((error) => { console.error(error); process.exitCode = 1; });
