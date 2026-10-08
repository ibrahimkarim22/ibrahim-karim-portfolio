// Distances are CSS pixels; durations are milliseconds. Keep the visible rig's
// material and movement small enough that one title pull can take up its slack.
export const ROPE_DESTINATIONS = Object.freeze(['home', 'projects', 'resume', '3d-profile', 'megaracer']);
export const ROPE_BIASES = Object.freeze([-0.4, -1, 0.8, 0.5, -0.6]);
export const ROPE_ENDS = Object.freeze({
  home: 'moon',
  projects: 'left',
  resume: 'right',
  '3d-profile': 'left',
  megaracer: 'right',
});
export const ROPE_TUNING = Object.freeze({
  desktopTravel: 41,
  mobileTravel: 32,
  wheelTravel: 25,
  moonTravel: 57,
  mobileMoonTravel: 46,
  rigTravel: 6,
  fixtureSwayAngle: 8,
  fixtureTakeupTravel: 3,
  fixtureSwayMinAngle: 0.05,
  fixtureSwayTail: 600,
  fixtureSwayPeriod: 480,
  fixtureSwayDamping: 1.4,
  masterTakeupEase: 2,
  maxLeverSin: 0.6,
  replacementLift: 4,
  replacementMoonTravel: 6,
  restSlack: 32,
  moonSlack: 55,
  wheelSlack: 18,
  bundleSlack: 20,
  bundleBiases: Object.freeze([0.28, 0.88, 0.52, 1, 0.68]),
  bundleSlackWeights: Object.freeze([1, 0.66, 0.84, 0.55, 1.05]),
  maxSlack: 55,
  sagSamples: 16,
  sagIterations: 14,
  maxSagRatio: 2,
  bowAsymmetry: 0.22,
  pullPeak: 220,
  pullDuration: 760,
  homePullPeak: 280,
  homePullReturn: 360,
  reducedPullPeak: 45,
  reducedPullDuration: 180,
  strokeWidth: 1.1,
  activeStrokeWidth: 1.45,
});

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const coordinate = (value) => Math.round(value * 1000) / 1000;

// Include vertical turning points in the sampled arc. Without them a steep
// cord's small bottom dip could fall between samples and hide its extra length.
function sagArcLength(dx, dy, height, a, b) {
  const times = Array.from({ length: ROPE_TUNING.sagSamples + 1 }, (_, index) => index / ROPE_TUNING.sagSamples);
  const qa = 9 * height * (a - b);
  const qb = 6 * height * (b - 2 * a);
  const qc = dy + 3 * height * a;
  const addTurn = (time) => { if (time > 0 && time < 1) times.push(time); };
  if (Math.abs(qa) < 0.000001) {
    if (Math.abs(qb) > 0.000001) addTurn(-qc / qb);
  } else {
    const discriminant = qb * qb - 4 * qa * qc;
    if (discriminant >= 0) {
      const root = Math.sqrt(discriminant);
      addTurn((-qb - root) / (2 * qa));
      addTurn((-qb + root) / (2 * qa));
    }
  }
  times.sort((left, right) => left - right);
  let total = 0;
  let previousT = 0;
  let previousY = 0;
  for (let index = 1; index < times.length; index += 1) {
    const t = times[index];
    const y = dy * t + 3 * height * t * (1 - t) * (a * (1 - t) + b * t);
    total += Math.hypot(dx * (t - previousT), y - previousY);
    previousT = t;
    previousY = y;
  }
  return total;
}

/**
 * Gravity always adds positive screen-y sag. Bias only redistributes that sag
 * between the two controls; it never flips the curve above its straight chord.
 * Linear x progress prevents lateral loops. A vertical span may naturally dip
 * below its lower fitting before returning upward to spend its real slack.
 */
export function ropeCurve(start, end, { slack = ROPE_TUNING.restSlack, bias = 0, tension = 0 } = {}) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  const materialBias = clamp(bias, -1, 1);
  const a = 1 + materialBias * ROPE_TUNING.bowAsymmetry;
  const b = 1 - materialBias * ROPE_TUNING.bowAsymmetry;
  const extraLength = clamp(slack, 0, ROPE_TUNING.maxSlack) * (1 - clamp(tension, 0, 1));
  let height = 0;
  if (length > 0 && extraLength > 0) {
    let upper = (length + extraLength) * ROPE_TUNING.maxSagRatio;
    const targetLength = length + extraLength;
    for (let iteration = 0; iteration < ROPE_TUNING.sagIterations; iteration += 1) {
      const candidate = (height + upper) / 2;
      if (sagArcLength(dx, dy, candidate, a, b) <= targetLength) height = candidate;
      else upper = candidate;
    }
  }
  const c1 = { x: start.x + dx / 3, y: start.y + dy / 3 + height * a };
  const c2 = { x: start.x + dx * 2 / 3, y: start.y + dy * 2 / 3 + height * b };
  return 'M ' + coordinate(start.x) + ' ' + coordinate(start.y)
    + ' C ' + coordinate(c1.x) + ' ' + coordinate(c1.y)
    + ' ' + coordinate(c2.x) + ' ' + coordinate(c2.y)
    + ' ' + coordinate(end.x) + ' ' + coordinate(end.y);
}

/** The opposite end is the pivot. Negative travel is the rig's passive lift. */
export function leverAngle(width, travel, end) {
  if (!Number.isFinite(width) || width <= 0) return 0;
  const angle = Math.asin(clamp(travel / width, -ROPE_TUNING.maxLeverSin, ROPE_TUNING.maxLeverSin)) * 180 / Math.PI;
  return end === 'left' ? -angle : angle;
}

/**
 * First consume the measured extra cord length. The master stays at rest until
 * the cord is taut, then residual movement eases in with a zero initial slope.
 * The tension fraction also removes exactly that share of ropeCurve's budget.
 */
export function takeupTension(projectedTravel, slack) {
  const travel = Number.isFinite(projectedTravel) ? Math.max(0, projectedTravel) : 0;
  const budget = Number.isFinite(slack) ? clamp(slack, 0, ROPE_TUNING.maxSlack) : 0;
  const tension = budget > 0 ? clamp(travel / budget, 0, 1) : travel > 0 ? 1 : 0;
  const residual = Math.max(0, travel - budget);
  return {
    tension,
    engagement: travel > 0 && travel >= budget,
    residualTravel: residual * residual / (residual + ROPE_TUNING.masterTakeupEase),
  };
}

/** Immediate take-up, engagement, then one restrained return with no idle sway. */
export function pullEnvelope(elapsed, reduced = false) {
  const peak = reduced ? ROPE_TUNING.reducedPullPeak : ROPE_TUNING.pullPeak;
  const duration = reduced ? ROPE_TUNING.reducedPullDuration : ROPE_TUNING.pullDuration;
  const time = Math.max(0, elapsed);
  if (time >= duration) return { amount: 0, engagement: true, done: true };
  if (time < peak) {
    const progress = time / peak;
    const amount = reduced ? 1 - Math.pow(1 - progress, 3) : progress * progress * (3 - 2 * progress);
    return { amount, engagement: false, done: false };
  }
  const release = (time - peak) / (duration - peak);
  return { amount: 1 - release * release * (3 - 2 * release), engagement: true, done: false };
}

/** Home has its own short outward stroke and controlled return, with no hold. */
export function homePullEnvelope(elapsed, reduced = false) {
  if (reduced) return pullEnvelope(elapsed, true);
  const time = Math.max(0, elapsed);
  const peak = ROPE_TUNING.homePullPeak;
  const duration = peak + ROPE_TUNING.homePullReturn;
  if (time >= duration) return { amount: 0, engagement: true, done: true };
  if (time < peak) {
    const progress = time / peak;
    return { amount: progress * progress * (3 - 2 * progress), engagement: false, done: false };
  }
  const release = (time - peak) / ROPE_TUNING.homePullReturn;
  return { amount: 1 - release * release * (3 - 2 * release), engagement: true, done: false };
}

/** Displacement, rather than an absolute position, along the measured cord ray. */
export function awayFromRig(point, rig, distance) {
  const dx = point.x - rig.x;
  const dy = point.y - rig.y;
  const length = Math.hypot(dx, dy);
  if (length < 0.001) return { x: 0, y: distance };
  return { x: dx / length * distance, y: dy / length * distance };
}

/**
 * Home deliberately pulls southwest. When the wheel puts Home right of the
 * rig, increase the downward share so the gesture still lengthens its cord.
 * Visible navigation anchors sit below the fixture; for coincident/unmeasured
 * anchors the same southwest fallback keeps the interaction predictable.
 */
export function moonPull(point, rig, distance) {
  const dx = point.x - rig.x;
  const dy = point.y - rig.y;
  let leftShare = 0.72;
  if (dx > 0 && dy > 0) leftShare = Math.min(leftShare, dy / dx * 0.6);
  if (dx < 0 && dy < 0) leftShare = Math.max(leftShare, Math.abs(dy / dx) * 1.4);
  const length = Math.hypot(leftShare, 1);
  return { x: -leftShare / length * distance, y: distance / length };
}


// The existing navigation clock owns the pull and its finite pendulum tail.
// A continuous damped wave passes through handle release without a new kick.
// The ceiling pivot
// moves opposite the CSS angle, so a rightward cord force needs negative rotation.
export function fixtureSway(elapsed, { engagedAt = null, peak = ROPE_TUNING.pullPeak, duration = ROPE_TUNING.pullDuration, directionX = 0, reduced = false } = {}) {
  if (reduced || !directionX || engagedAt === null || !Number.isFinite(elapsed + engagedAt + peak + duration + directionX)) return 0;
  if (elapsed <= engagedAt || elapsed >= duration + ROPE_TUNING.fixtureSwayTail || engagedAt >= peak || duration <= peak) return 0;
  const strength = -Math.sign(directionX) * Math.sqrt(clamp(Math.abs(directionX), 0, 1)) * ROPE_TUNING.fixtureSwayAngle;
  const smooth = (progress) => progress * progress * (3 - 2 * progress);
  if (elapsed < peak) return strength * smooth(clamp((elapsed - engagedAt) / (peak - engagedAt), 0, 1));
  const seconds = (elapsed - peak) / 1000;
  const wave = Math.cos(2 * Math.PI * (elapsed - peak) / ROPE_TUNING.fixtureSwayPeriod);
  const fade = 1 - smooth(clamp((elapsed - duration - ROPE_TUNING.fixtureSwayTail + 200) / 200, 0, 1));
  return strength * Math.exp(-ROPE_TUNING.fixtureSwayDamping * seconds) * wave * fade;
}
