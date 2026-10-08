import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { ROPE_DESTINATIONS, ROPE_BIASES, ROPE_ENDS, ROPE_TUNING, awayFromRig, leverAngle, moonPull, pullEnvelope, homePullEnvelope, ropeCurve, takeupTension, fixtureSway } from "./navigationRopeGeometry";
import { clearGlyphAttachmentCache, fitGlyphAttachment } from "./navigationLetterAttachment";
import { beginNavigationMotion } from "./navigationMotion";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const center = (element) => {
  const bounds = element?.getBoundingClientRect();
  return bounds?.width ? { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 } : null;
};
const svgPoint = (element, x, y) => {
  const matrix = element?.getScreenCTM?.();
  return matrix ? { x: matrix.a * x + matrix.c * y + matrix.e, y: matrix.b * x + matrix.d * y + matrix.f } : center(element);
};
const interpolate = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const writeAttribute = (element, name, value) => {
  const text = String(value);
  if (element.getAttribute(name) !== text) element.setAttribute(name, text);
};
const show = (element, value) => {
  if (element.style.visibility !== value) element.style.visibility = value;
};

function homePullDirection(nav, moon, mode, wheel) {
  if (!moon || mode !== 'desktop' || wheel) return null;
  const label = nav?.closest('.menu-div-main')?.querySelector('.full-stack-div') || document.querySelector('.full-stack-div');
  if (!label) return null;
  const bounds = label.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return null;
  const style = window.getComputedStyle(label);
  if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return null;
  const target = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
  if (target.x <= moon.x) return null;
  return awayFromRig(moon, target, -1);
}

function homeGesture(point, rig, distance, direction) {
  return direction ? { x: direction.x * distance, y: direction.y * distance } : moonPull(point, rig, distance);
}

function restingSlack(view, point, rig, mode, wheel, homeDirection = null) {
  const ray = awayFromRig(point, rig, 1);
  const distance = wheel ? ROPE_TUNING.wheelTravel : mode === 'desktop' ? ROPE_TUNING.desktopTravel : ROPE_TUNING.mobileTravel;
  const travel = view === 'home'
    ? homeGesture(point, rig, mode === 'desktop' ? ROPE_TUNING.moonTravel : ROPE_TUNING.mobileMoonTravel, homeDirection)
    : wheel ? awayFromRig(point, rig, distance) : { x: 0, y: distance };
  const takeup = travel.x * ray.x + travel.y * ray.y - ROPE_TUNING.rigTravel * Math.max(0.35, ray.y);
  // Reserve the master cord's travel: a tiny lever cannot consume a huge loop.
  const desired = view === 'home' ? ROPE_TUNING.moonSlack : wheel ? ROPE_TUNING.wheelSlack : ROPE_TUNING.restSlack;
  return Math.min(desired, Math.max(1.5, takeup - 0.6));
}

// Capture DOM geometry once, then resolve moon/circle rims against whichever
// rig position this frame produces. No cord write can invalidate the next read.
function attachmentSnapshot(control, wheel, view) {
  if (!control) return null;
  if (view === "home") {
    const svg = control.querySelector('.navigation-home__moon-icon');
    if (!svg) return null;
    const matrix = svg.getScreenCTM?.();
    if (matrix) {
      const point = { x: matrix.a * 12 + matrix.c * 12 + matrix.e, y: matrix.b * 12 + matrix.d * 12 + matrix.f };
      const radius = Math.hypot(matrix.a * 9, matrix.b * 9) || svg.getBoundingClientRect().width * 0.375;
      return { point, radius };
    }
    const bounds = svg.getBoundingClientRect();
    return bounds.width ? { point: { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }, radius: bounds.width * 0.375 } : null;
  }
  if (wheel) {
    const bounds = control.getBoundingClientRect();
    return bounds.width ? { point: { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }, radius: bounds.width / 2 } : null;
  }
  const point = center(control.querySelector('[data-rope-pin]'));
  return point ? { point } : null;
}

function attachmentPoint(snapshot, rig) {
  if (!snapshot) return null;
  if (snapshot.radius === undefined) return snapshot.point;
  const ray = awayFromRig(snapshot.point, rig, -snapshot.radius);
  return { x: snapshot.point.x + ray.x, y: snapshot.point.y + ray.y };
}

function attachment(control, rig, wheel, view) {
  return attachmentPoint(attachmentSnapshot(control, wheel, view), rig);
}

// Owns mechanical wrappers; moon hover scaling and the fixture lifecycle keep
// their nested layers. Idle frames stop; observers wake a bounded read/write run.
export default function useNavigationRopes({ navRef, mode, wheelVisible, closing, routeKey, activeView, hidden = false }) {
  const layerRef = useRef(null);
  const controllerRef = useRef(null);
  const routeIdentityRef = useRef({ routeKey, activeView });
  const stateRef = useRef({ mode, wheelVisible, closing, hidden });
  stateRef.current = { mode, wheelVisible, closing, hidden };

  useLayoutEffect(() => {
    const previous = routeIdentityRef.current;
    if (previous.routeKey !== routeKey || previous.activeView !== activeView) controllerRef.current?.cancelPending();
    routeIdentityRef.current = { routeKey, activeView };
    controllerRef.current?.setHidden(hidden);
    controllerRef.current?.wake(800);
  }, [mode, wheelVisible, closing, routeKey, activeView, hidden]);
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return undefined;
    let frame = null, runningUntil = 0, destroyed = false, active = null, commitTimer = null, animationAvailable = true;
    let rigRest = null, lastMode = null, changingModeAt = 0, previousPoints = {}, currentPoints = {}, poses = new Map(), selectedControl = null, masterPosed = false;
    let source = null, rigNode = null, masterNode = null, pullNode = null, swayNode = null, anchorsDirty = true;
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let reduced = media?.matches || false;
    const lines = ROPE_DESTINATIONS.map((view) => ({ view, group: layer.querySelector('[data-rope-line="' + view + '"]') }));
    const rigGroup = layer.querySelector('[data-rope-gather]');
    function locateRig() {
      source = document.querySelector('.portfolio-light');
      rigNode = source?.querySelector('[data-rope-rig]');
      masterNode = source?.querySelector('[data-rope-master]');
      pullNode = source?.querySelector('[data-rope-pull]');
      swayNode = source?.querySelector('[data-rope-fixture-sway]');
      if (source && rigNode) writeAttribute(source, 'data-rope-connected', 'true');
    }
    locateRig();
    const commit = () => {
      if (commitTimer !== null) window.clearTimeout(commitTimer);
      commitTimer = null;
      const callback = active?.commit;
      if (active) active.commit = null;
      callback?.();
    };
    function resetPoses() {
      poses.forEach((properties, element) => properties.forEach((property) => element.style.removeProperty(property)));
      poses.clear();
      if (masterPosed) { pullNode?.removeAttribute('transform'); masterPosed = false; }
    }
    function selectControl(control) {
      if (selectedControl !== control) {
        selectedControl?.removeAttribute('data-rope-selected');
        selectedControl = control;
      }
      if (control) writeAttribute(control, 'data-rope-selected', 'true');
    }
    function writePose(element, property, value, unit) {
      if (!value) return; // CSS defaults already provide the neutral pose.
      element.style.setProperty(property, value + unit);
      let properties = poses.get(element);
      if (!properties) { properties = new Set(); poses.set(element, properties); }
      properties.add(property);
    }
    function clearTransforms() {
      resetPoses();
      selectControl(null);
    }
    function releaseMotion(pull) {
      const release = pull?.releaseMotion;
      if (pull) pull.releaseMotion = null;
      release?.();
    }
    function finishActive(pull = active) {
      try {
        if (active === pull) { active = null; clearTransforms(); }
      } finally { releaseMotion(pull); }
    }
    function wake(duration = 650) {
      if (destroyed || stateRef.current.hidden || !center(rigNode)) return;
      runningUntil = Math.max(runningUntil, performance.now() + duration);
      if (!destroyed && animationAvailable && frame === null) {
        try { frame = window.requestAnimationFrame(draw); }
        catch {
          animationAvailable = false;
          const failed = active;
          try { commit(); } finally { finishActive(failed); }
        }
      }
    }
    function prepareAttachments(controls, wheel) {
      if (!anchorsDirty || wheel) return;
      ROPE_DESTINATIONS.forEach((view) => {
        if (view !== 'home') fitGlyphAttachment(controls[view]?.querySelector('[data-rope-glyph]'), ROPE_ENDS[view]);
      });
      anchorsDirty = false;
    }
    function finishUnavailable() {
      show(layer, 'hidden');
      const unavailable = active;
      try { commit(); } finally { finishActive(unavailable); }
    }
    function draw() {
      const timestamp = performance.now();
      frame = null;
      if (destroyed || stateRef.current.hidden) return;
      try {
        if (!rigNode?.isConnected) locateRig();
        if (!rigNode || !masterNode?.isConnected) { finishUnavailable(); return; }
        const phase = source.dataset.bulbPhase;
        const busy = source.dataset.ropeRigBusy === 'true';
        const elapsed = active ? timestamp - active.start : 0;
        const peak = active?.view === 'home' ? ROPE_TUNING.homePullPeak : ROPE_TUNING.pullPeak;
        const duration = active?.view === 'home' ? peak + ROPE_TUNING.homePullReturn : ROPE_TUNING.pullDuration;
        const envelope = active?.view === 'home' ? homePullEnvelope : pullEnvelope;
        const pulse = active ? envelope(elapsed, reduced) : { amount: 0, done: true };
        // A break interrupts the secondary pull, never its pending navigation.
        if (busy && active) {
          const interrupted = active;
          try { commit(); } finally { finishActive(interrupted); }
        }
        const tailLive = active && !busy && !reduced && !active.swayCancelled && swayNode?.isConnected && elapsed < active.swayUntil;
        const motionDone = pulse.done && !tailLive;
        const pulling = Boolean(active && !busy && !pulse.done);
        if (active && !busy && !motionDone && !active.releaseMotion) active.releaseMotion = beginNavigationMotion();
        const amount = pulling ? pulse.amount : 0;
        const { mode: currentMode, wheelVisible: wheel } = stateRef.current;
        const nav = wheel ? document.querySelector('.navigation-wheel__destinations') : navRef.current;
        const controls = Object.fromEntries(ROPE_DESTINATIONS.map((view) => [view, nav?.querySelector('[data-rope-control="' + view + '"]')]));
        prepareAttachments(controls, wheel);
        const compact = currentMode === 'compact' && !wheel;
        const modeKey = currentMode + ':' + wheel;
        if (modeKey !== lastMode) {
          previousPoints = { ...currentPoints };
          changingModeAt = timestamp;
          lastMode = modeKey;
        }
        // Keep this frame's real unpulled pose: cached activation anchors would
        // incorrectly count font/layout, moon scaling or wheel flight as a pull.
        resetPoses();
        let rig = svgPoint(rigNode, 46, 110);
        if (!rig) { finishUnavailable(); return; }
        if (!busy || rigRest === null) rigRest = rig;
        const snapshots = Object.fromEntries(ROPE_DESTINATIONS.map((view) => [view, attachmentSnapshot(controls[view], wheel, view)]));
        const homeDirection = homePullDirection(navRef.current, snapshots.home?.point, currentMode, wheel);
        const before = Object.fromEntries(ROPE_DESTINATIONS.map((view) => [view, attachmentPoint(snapshots[view], rig)]));
        if (pulling && before[active.view]) {
          active.anchor = before[active.view];
          active.restLength = Math.hypot(active.anchor.x - rig.x, active.anchor.y - rig.y);
          active.slack = restingSlack(active.view, active.anchor, rig, currentMode, wheel, homeDirection);
        }
        const storedTrigger = center(navRef.current?.querySelector('.navigation-trigger'));
        const replacement = Object.fromEntries(ROPE_DESTINATIONS.map((view, index) => {
          const point = before[view] || (compact && storedTrigger ? { x: storedTrigger.x + 10 + index * 2.2, y: storedTrigger.y + 9 + index * 1.7 } : null);
          if (!point) return [view, null];
          const restLength = Math.hypot(point.x - rigRest.x, point.y - rigRest.y);
          const slack = compact ? ROPE_TUNING.bundleSlack * ROPE_TUNING.bundleSlackWeights[index] : restingSlack(view, point, rigRest, currentMode, wheel, homeDirection);
          const extension = Math.hypot(point.x - rig.x, point.y - rig.y) - restLength;
          const takeup = takeupTension(extension, slack);
          return [view, { restLength, slack, amount: busy && !reduced ? clamp(takeup.residualTravel / 52, 0, 1) : 0 }];
        }));
        // Widths belong in the baseline read phase, before any mechanical write.
        const parts = Object.fromEntries(ROPE_DESTINATIONS.map((view) => {
          const control = controls[view];
          if (!control) return [view, null];
          const selected = pulling && active.view === view;
          const moving = (selected && amount > 0) || replacement[view]?.amount > 0;
          if (view === 'home') {
            const moon = control.querySelector('.navigation-home__moon-pull');
            const width = wheel && moving ? control.offsetWidth || parseFloat(window.getComputedStyle(control).width) : 0;
            const screenScale = wheel && width ? control.getBoundingClientRect().width / width : 1;
            return [view, { moon, screenScale }];
          }
          const lever = wheel ? null : control.querySelector('[data-rope-lever]');
          const width = moving && lever ? lever.offsetWidth || lever.getBoundingClientRect().width : 0;
          return [view, { lever, width }];
        }));
        const masterBounds = pulling ? source.querySelector('svg')?.getBoundingClientRect() : null;
        const scale = (masterBounds?.height || 84) / 112;
        show(layer, 'visible');
        selectControl(pulling ? controls[active.view] || null : null);
        const moved = new Set();
        ROPE_DESTINATIONS.forEach((view) => {
          const control = controls[view];
          if (!control) return;
          const selected = pulling && active.view === view;
          const pull = selected ? amount : 0;
          const passive = replacement[view]?.amount || 0;
          const point = before[view] || rig;
          if (view === 'home') {
            const { moon, screenScale } = parts[view];
            if (!moon) return;
            const distance = reduced ? 3 : currentMode === 'desktop' ? ROPE_TUNING.moonTravel : ROPE_TUNING.mobileMoonTravel;
            const gesture = homeGesture(point, rig, distance * pull, homeDirection);
            const response = awayFromRig(point, rig, -ROPE_TUNING.replacementMoonTravel * passive);
            writePose(moon, '--rope-x', (gesture.x + response.x) / Math.max(0.12, screenScale), 'px');
            writePose(moon, '--rope-y', (gesture.y + response.y) / Math.max(0.12, screenScale), 'px');
            if (gesture.x + response.x || gesture.y + response.y) moved.add(view);
          } else if (wheel) {
            const gesture = awayFromRig(point, rig, (reduced ? 2 : ROPE_TUNING.wheelTravel) * pull - ROPE_TUNING.replacementLift * passive);
            writePose(control, '--rope-x', gesture.x, 'px');
            writePose(control, '--rope-y', gesture.y, 'px');
            if (gesture.x || gesture.y) moved.add(view);
          } else {
            const { lever, width } = parts[view];
            if (!lever) return;
            const distance = reduced ? 2 : currentMode === 'desktop' ? ROPE_TUNING.desktopTravel : ROPE_TUNING.mobileTravel;
            // Replace the small cord length spent by fixture lean without adding resting material.
            const takeup = reduced ? 0 : ROPE_TUNING.fixtureTakeupTravel;
            const angle = leverAngle(width, (distance + takeup) * pull - ROPE_TUNING.replacementLift * passive, ROPE_ENDS[view]);
            writePose(lever, '--rope-angle', angle, 'deg');
            if (angle) moved.add(view);
          }
        });
        // All moved controls are sampled together. Unmoved controls retain this
        // same frame's snapshot; their circle/moon rim can follow the final rig.
        const pulled = Object.fromEntries(ROPE_DESTINATIONS.map((view) => [view, moved.has(view) ? attachmentSnapshot(controls[view], wheel, view) : snapshots[view]]));
        let engaged = 0, swayAngle = 0;
        if (pulling && pullNode && active.anchor) {
          let point = attachmentPoint(pulled[active.view], rig);
          if (point) {
            active.lastPoint = point;
            active.lastAmount = amount;
          } else {
            point = interpolate(active.anchor, active.lastPoint || active.anchor, active.lastAmount ? clamp(amount / active.lastAmount, 0, 1) : 0);
          }
          const extension = Math.hypot(point.x - rig.x, point.y - rig.y) - active.restLength;
          const takeup = takeupTension(extension, active.slack);
          const selectedIndex = ROPE_DESTINATIONS.indexOf(active.view);
          const approach = ropeCurve(point, rig, { slack: active.slack, bias: ROPE_BIASES[selectedIndex], tension: takeup.tension }).match(/-?\d+(?:\.\d+)?/g).map(Number);
          const direction = awayFromRig({ x: approach[4], y: approach[5] }, rig, 1);
          const travel = reduced ? 0 : Math.min(ROPE_TUNING.rigTravel, takeup.residualTravel);
          engaged = travel / ROPE_TUNING.rigTravel;
          if (!reduced && !active.swayCancelled && takeup.engagement && elapsed < peak && active.swayStarted === undefined) {
            const impulse = swayNode?.isConnected ? fixtureSway(peak, { engagedAt: elapsed, directionX: direction.x, peak, duration }) : 0;
            if (Math.abs(impulse) >= ROPE_TUNING.fixtureSwayMinAngle) {
              active.swayStarted = elapsed;
              active.swayDirection = direction.x;
              active.swayUntil = duration + ROPE_TUNING.fixtureSwayTail;
            } else active.swayCancelled = true;
          }
          // Slack must be consumed before the real master cord can move.
          const angle = -direction.x * travel / Math.max(1, 64 * scale) * 180 / Math.PI;
          if (travel > 0) {
            writeAttribute(pullNode, 'transform', 'translate(46 46) rotate(' + angle + ') scale(1 ' + (1 + Math.max(0.35, direction.y) * travel / (64 * scale)) + ') translate(-46 -46)');
            masterPosed = true;
          }
          writeAttribute(layer, 'data-rope-engaged', takeup.engagement && !reduced);
        } else writeAttribute(layer, 'data-rope-engaged', 'false');
        if (active && !busy && !active.swayCancelled) {
          swayAngle = fixtureSway(elapsed, { engagedAt: active.swayStarted, directionX: active.swayDirection, peak, duration, reduced });
        }
        // The fixture and its emission share this local pose. Source observers
        // watch the outer carriage only, so sway cannot schedule feedback frames.
        if (swayNode) writePose(swayNode, '--rope-fixture-angle', swayAngle, 'deg');
        // Preserve the exact current fixture endpoint after both responses.
        rig = svgPoint(rigNode, 46, 110);
        const points = Object.fromEntries(ROPE_DESTINATIONS.map((view) => [view, attachmentPoint(pulled[view], rig)]));
        const trigger = storedTrigger;
        let payout = 0;
        const blend = reduced || !compact ? 1 : clamp((timestamp - changingModeAt) / 280, 0, 1);
        lines.forEach(({ view, group }, index) => {
          let point = points[view];
          if (compact && trigger) point = { x: trigger.x + 10 + index * 2.2, y: trigger.y + 9 + index * 1.7 };
          if (!point) { show(group, 'hidden'); return; }
          show(group, 'visible');
          if (previousPoints[view] && blend < 1) point = interpolate(previousPoints[view], point, blend * blend * (3 - 2 * blend));
          currentPoints[view] = point;
          const selected = pulling && active.view === view;
          const span = replacement[view];
          const slack = busy && span ? span.slack : compact ? ROPE_TUNING.bundleSlack * ROPE_TUNING.bundleSlackWeights[index] : selected && active.anchor ? active.slack : restingSlack(view, point, rig, currentMode, wheel, homeDirection);
          const extension = busy && span ? Math.hypot(point.x - rig.x, point.y - rig.y) - span.restLength : selected && active.anchor && !compact ? Math.hypot(point.x - rig.x, point.y - rig.y) - active.restLength : 0;
          const tension = (busy || (selected && !compact)) ? takeupTension(extension, slack).tension : 0;
          if (busy) payout = Math.max(payout, extension - slack);
          const d = ropeCurve(point, rig, { slack, bias: compact ? ROPE_TUNING.bundleBiases[index] : ROPE_BIASES[index], tension });
          group.querySelectorAll('path').forEach((path) => writeAttribute(path, 'd', d));
          writeAttribute(group.querySelector('circle'), 'cx', point.x);
          writeAttribute(group.querySelector('circle'), 'cy', point.y);
          writeAttribute(group, 'data-active', selected);
        });
        writeAttribute(rigGroup, 'transform', 'translate(' + rig.x + ' ' + rig.y + ')');
        writeAttribute(layer, 'data-rope-payout', payout.toFixed(1));
        writeAttribute(rigGroup.querySelector('[data-rope-reel]'), 'transform', 'rotate(' + ((payout + engaged * ROPE_TUNING.rigTravel) / 3.8 * 180 / Math.PI) + ')');
        writeAttribute(layer, 'data-rope-phase', busy ? phase : pulling ? 'pulling' : tailLive ? 'swaying' : compact ? 'bundled' : 'resting');
        if (motionDone && active && !busy) {
          const finished = active;
          try { commit(); } finally { finishActive(finished); }
        }
        if (busy || active || timestamp < runningUntil) frame = window.requestAnimationFrame(draw);
      } catch {
        // Drawing failure never blocks routing or strands a deferred scene.
        const failed = active;
        try { commit(); } finally { finishActive(failed); }
      }
    }
    const resize = () => { anchorsDirty = true; wake(750); };
    const hover = (event) => {
      const home = event.target?.closest?.('.navigation-home');
      if (!home || home === event.relatedTarget?.closest?.('.navigation-home')) return;
      if (navRef.current?.contains(home) || (stateRef.current.wheelVisible && home.closest('.navigation-wheel__destinations'))) wake(750);
    };
    const fontsLoaded = () => { clearGlyphAttachmentCache(); anchorsDirty = true; wake(750); };
    const preferences = () => { reduced = media.matches; clearTransforms(); wake(250); };
    const observer = new MutationObserver(() => { anchorsDirty = true; wake(750); });
    const sourceObserver = new MutationObserver(() => {
      if (stateRef.current.hidden) return;
      // Carriage writes can occur after our rAF callback in the same frame.
      // Sample after that authoritative write, before the browser paints.
      if (source?.dataset.ropeRigBusy === 'true') {
        if (frame !== null) window.cancelAnimationFrame(frame);
        frame = null;
        draw();
      } else wake(750);
    });
    observer.observe(navRef.current, { childList: true, subtree: true });
    if (source) sourceObserver.observe(source, { attributes: true, attributeFilter: ['data-bulb-phase', 'data-rope-rig-busy', 'style'] });
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    if (navRef.current) resizeObserver?.observe(navRef.current);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', resize, { passive: true });
    window.visualViewport?.addEventListener('resize', resize);
    document.fonts?.addEventListener?.('loadingdone', fontsLoaded);
    // Hover scale takes 480ms on an independent inner layer.
    document.addEventListener('pointerover', hover);
    document.addEventListener('pointerout', hover);
    document.addEventListener('focusin', hover);
    document.addEventListener('focusout', hover);
    media?.addEventListener?.('change', preferences);
    controllerRef.current = {
      wake,
      setHidden(value) {
        if (value) {
          if (frame !== null) window.cancelAnimationFrame(frame);
          frame = null;
          runningUntil = 0;
          if (active) active.swayCancelled = true;
          try { clearTransforms(); } finally { releaseMotion(active); }
        }
        anchorsDirty = true;
      },
      cancelPending() {
        if (commitTimer !== null) window.clearTimeout(commitTimer);
        commitTimer = null;
        // Own commits clear this callback before routing. History can cancel a
        // pending destination while its small release continues safely.
        if (active) active.commit = null;
      },
      activate(view, callback) {
        if (stateRef.current.hidden) {
          if (commitTimer !== null) window.clearTimeout(commitTimer);
          commitTimer = null;
          finishActive();
          callback(); return;
        }
        locateRig();
        const point = center(rigNode);
        if (!point || !animationAvailable || source?.dataset.ropeRigBusy === 'true') {
          if (commitTimer !== null) window.clearTimeout(commitTimer);
          commitTimer = null;
          finishActive();
          callback(); wake(); return;
        }
        if (commitTimer !== null) window.clearTimeout(commitTimer);
        clearTransforms();
        const { mode: currentMode, wheelVisible: wheel } = stateRef.current;
        const nav = wheel ? document.querySelector('.navigation-wheel__destinations') : navRef.current;
        const controls = Object.fromEntries(ROPE_DESTINATIONS.map((destination) => [destination, nav?.querySelector('[data-rope-control="' + destination + '"]')]));
        prepareAttachments(controls, wheel);
        const rig = svgPoint(rigNode, 46, 110);
        const homeSnapshot = view === 'home' ? attachmentSnapshot(controls[view], wheel, view) : null;
        const anchor = view === 'home' ? attachmentPoint(homeSnapshot, rig) : attachment(controls[view], rig, wheel, view);
        const homeDirection = homePullDirection(navRef.current, homeSnapshot?.point, currentMode, wheel);
        const restLength = anchor ? Math.hypot(anchor.x - rig.x, anchor.y - rig.y) : 0;
        const slack = anchor ? restingSlack(view, anchor, rig, currentMode, wheel, homeDirection) : 0;
        if (!anchor) { finishActive(); callback(); wake(); return; }
        const previous = active;
        active = { view, start: performance.now(), commit: callback, anchor, restLength, slack, lastPoint: anchor, lastAmount: 0 };
        active.releaseMotion = beginNavigationMotion();
        // The next token exists before the previous token ends: no false idle.
        releaseMotion(previous);
        // Independent fallback timer also works in background tabs / failed rAF.
        commitTimer = window.setTimeout(commit, reduced ? 0 : ROPE_TUNING.pullPeak);
        const visualDuration = view === 'home' && !reduced ? ROPE_TUNING.homePullPeak + ROPE_TUNING.homePullReturn : ROPE_TUNING.pullDuration;
        wake(visualDuration + 50);
      },
      canFold: () => !stateRef.current.hidden && Boolean(center(rigNode)) && !reduced,
    };
    wake(900);
    document.fonts?.ready.then(() => { if (!destroyed) fontsLoaded(); });
    return () => {
      destroyed = true;
      if (frame !== null) window.cancelAnimationFrame(frame);
      if (commitTimer !== null) window.clearTimeout(commitTimer);
      controllerRef.current = null;
      observer.disconnect(); sourceObserver.disconnect(); resizeObserver?.disconnect();
      window.removeEventListener('resize', resize); window.removeEventListener('scroll', resize);
      window.visualViewport?.removeEventListener('resize', resize);
      document.fonts?.removeEventListener?.('loadingdone', fontsLoaded);
      document.removeEventListener('pointerover', hover); document.removeEventListener('pointerout', hover); document.removeEventListener('focusin', hover); document.removeEventListener('focusout', hover);
      media?.removeEventListener?.('change', preferences);
      finishActive();
      source?.removeAttribute('data-rope-connected');
    };
  }, [navRef]);
  const activate = useCallback((view, commit) => {
    if (controllerRef.current) controllerRef.current.activate(view, commit);
    else commit();
  }, []);
  const canFold = useCallback(() => controllerRef.current?.canFold() || false, []);
  const cancelPending = useCallback(() => controllerRef.current?.cancelPending(), []);
  return { layerRef, activate, canFold, cancelPending };
}
