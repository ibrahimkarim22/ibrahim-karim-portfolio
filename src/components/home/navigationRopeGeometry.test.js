import { ropeCurve, leverAngle, pullEnvelope, homePullEnvelope, awayFromRig, moonPull, takeupTension, fixtureSway } from './navigationRopeGeometry';

const pathPoints = (path) => path.match(/-?\d+(?:\.\d+)?/g).map(Number);
const separation = (point, rig) => Math.hypot(point.x - rig.x, point.y - rig.y);

// Integrate the rendered SVG path independently of the production bow formula.
const curveSamples = (path, steps = 600) => {
  const [sx, sy, ax, ay, bx, by, ex, ey] = pathPoints(path);
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const q = 1 - t;
    return {
      x: q ** 3 * sx + 3 * q ** 2 * t * ax + 3 * q * t ** 2 * bx + t ** 3 * ex,
      y: q ** 3 * sy + 3 * q ** 2 * t * ay + 3 * q * t ** 2 * by + t ** 3 * ey,
    };
  });
};
const arcLength = (path) => curveSamples(path).reduce((sum, point, index, samples) => (
  index ? sum + separation(point, samples[index - 1]) : 0
), 0);

describe('navigation cord geometry', () => {
  test('keeps its exact anchors and uses one connected cubic span', () => {
    const path = ropeCurve({ x: 0, y: 0 }, { x: 300, y: 0 }, { slack: 8 });
    const [sx, sy, c1x, c1y, c2x, c2y, ex, ey] = pathPoints(path);
    expect(path.match(/C/g)).toHaveLength(1);
    expect([sx, sy, ex, ey]).toEqual([0, 0, 300, 0]);
    expect(c1x).toBeGreaterThan(sx);
    expect(c2x).toBeGreaterThan(c1x);
    expect(c2x).toBeLessThan(ex);
    expect(c1y).toBeGreaterThan(0);
    expect(c2y).toBeGreaterThan(0);
  });

  test.each([
    ['desktop diagonal', { x: 0, y: 0 }, { x: 900, y: 600 }, -1],
    ['long nearvertical', { x: 40, y: 800 }, { x: 50, y: 0 }, 0.8],
    ['exact vertical down', { x: 40, y: 0 }, { x: 40, y: 800 }, -0.6],
    ['exact vertical up', { x: 40, y: 800 }, { x: 40, y: 0 }, 0.5],
    ['horizontal', { x: 0, y: 0 }, { x: 1000, y: 0 }, -1],
    ['reverse horizontal', { x: 1000, y: 0 }, { x: 0, y: 0 }, 1],
  ])('the %s cord sags with gravity while spending its actual extra-length budget', (_, start, end, bias) => {
    const path = ropeCurve(start, end, { slack: 28, bias });
    const chord = separation(start, end);
    const excess = arcLength(path) - chord;
    expect(excess).toBeGreaterThan(27);
    expect(excess).toBeLessThan(29);
    const samples = curveSamples(path);
    samples.forEach((point, index) => {
      const straightY = start.y + (end.y - start.y) * index / (samples.length - 1);
      expect(point.y + 0.001).toBeGreaterThanOrEqual(straightY);
    });
    const partial = arcLength(ropeCurve(start, end, { slack: 28, bias, tension: 0.6 })) - chord;
    const tight = arcLength(ropeCurve(start, end, { slack: 28, bias, tension: 1 })) - chord;
    expect(Math.abs(partial - 11.2)).toBeLessThan(1);
    expect(partial).toBeLessThan(excess);
    expect(tight).toBeCloseTo(0, 2);
  });

  test.each([-1, 0, 1])('a gravity-sagged cord retains monotonic screen x without a lateral loop at bias %s', (bias) => {
    const samples = curveSamples(ropeCurve(
      { x: 410, y: 600 }, { x: 400, y: -240 }, { slack: 28, bias },
    ), 120);
    for (let index = 1; index < samples.length; index += 1) {
      expect(samples[index].x).toBeLessThan(samples[index - 1].x);
    }
  });

  test('signed bias only redistributes gravity sag and cannot float either cord upward', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 900, y: 0 };
    const firstHeavy = curveSamples(ropeCurve(start, end, { slack: 28, bias: 1 }), 4);
    const lastHeavy = curveSamples(ropeCurve(start, end, { slack: 28, bias: -1 }), 4);
    expect(firstHeavy[2].y).toBeGreaterThan(80);
    expect(lastHeavy[2].y).toBeGreaterThan(80);
    expect(firstHeavy[1].y).toBeGreaterThan(firstHeavy[3].y + 3);
    expect(lastHeavy[3].y).toBeGreaterThan(lastHeavy[1].y + 3);
  });

  test.each([0, 10])('a steep cord with %spx horizontal separation hangs below the lower attachment', (dx) => {
    const samples = curveSamples(ropeCurve({ x: 40, y: 800 }, { x: 40 + dx, y: 0 }, { slack: 28, bias: -0.4 }));
    const bottom = Math.max(...samples.map((point) => point.y));
    expect(bottom).toBeGreaterThan(810);
    expect(bottom).toBeLessThan(820);
  });

  test('the default desktop cord contains exaggerated but consumable slack', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 800, y: 0 };
    const resting = ropeCurve(start, end);
    const excess = arcLength(resting) - 800;
    const bottom = Math.max(...curveSamples(resting).map((point) => point.y));
    expect(excess).toBeGreaterThan(31);
    expect(excess).toBeLessThan(33);
    expect(bottom).toBeGreaterThan(85);
    expect(bottom).toBeLessThan(110);
  });

  test('a coincident anchor stays finite without manufacturing a loop', () => {
    expect(pathPoints(ropeCurve({ x: 20, y: 30 }, { x: 20, y: 30 })))
      .toEqual([20, 30, 20, 30, 20, 30, 20, 30]);
  });
});

describe('navigation lever mechanics', () => {
  test.each([
    [80, 36, 'left', -1],
    [240, 36, 'left', -1],
    [80, 36, 'right', 1],
    [240, 36, 'right', 1],
  ])('lowers the attached %s pixel title end by the requested travel', (width, travel, end, sign) => {
    const angle = leverAngle(width, travel, end);
    expect(Math.sign(angle)).toBe(sign);
    expect(Math.abs(width * Math.sin(angle * Math.PI / 180))).toBeCloseTo(36, 5);
  });

  test('retraction lifts a title around the same opposite pivot', () => {
    expect(leverAngle(120, -4, 'left')).toBeGreaterThan(0);
    expect(leverAngle(120, -4, 'right')).toBeLessThan(0);
  });

  test('an unmeasured title stays at rest', () => {
    expect(leverAngle(0, 10, 'left')).toBe(0);
  });
});

describe('rope pull feedback', () => {
  test('begins immediately, engages at the peak, and settles without a stale offset', () => {
    expect(pullEnvelope(0).amount).toBe(0);
    expect(pullEnvelope(12).amount).toBeGreaterThan(0);
    expect(pullEnvelope(100).engagement).toBe(false);
    expect(pullEnvelope(220)).toMatchObject({ amount: 1, engagement: true, done: false });
    expect(pullEnvelope(330).amount).toBeLessThan(1);
    expect(pullEnvelope(760)).toEqual({ amount: 0, engagement: true, done: true });
    expect(pullEnvelope(9999)).toEqual({ amount: 0, engagement: true, done: true });
  });

  test('spends long-handle travel visibly before late mechanical engagement', () => {
    expect(pullEnvelope(16).amount).toBeGreaterThan(0);
    expect(pullEnvelope(110).amount).toBeCloseTo(0.5, 5);
    for (let time = 0; time <= 140; time += 10) {
      const amount = pullEnvelope(time).amount;
      expect(amount).toBeLessThanOrEqual(0.75);
      expect(takeupTension(amount * 36, 28).engagement).toBe(false);
    }
    expect(takeupTension(pullEnvelope(170).amount * 36, 28).engagement).toBe(true);
    expect(pullEnvelope(220).amount).toBe(1);
    expect(pullEnvelope(760).amount).toBe(0);
  });

  test('reduced motion gives one fast bounded pulse and fully settles', () => {
    expect(pullEnvelope(8, true).amount).toBeGreaterThan(0);
    expect(pullEnvelope(45, true)).toMatchObject({ amount: 1, engagement: true, done: false });
    expect(pullEnvelope(180, true)).toEqual({ amount: 0, engagement: true, done: true });
    for (let time = 0; time <= 700; time += 7) {
      expect(pullEnvelope(time, true).amount).toBeGreaterThanOrEqual(0);
      expect(pullEnvelope(time, true).amount).toBeLessThanOrEqual(1);
    }
  });
});

describe('measured cord directions', () => {
  test('a selected circle moves its requested distance away from the measured rig', () => {
    const offset = awayFromRig({ x: 30, y: 40 }, { x: 0, y: 0 }, 10);
    expect(offset.x).toBeCloseTo(6);
    expect(offset.y).toBeCloseTo(8);
  });

  test('a coincident circle has a stable downward fallback', () => {
    expect(awayFromRig({ x: 10, y: 10 }, { x: 10, y: 10 }, 8)).toEqual({ x: 0, y: 8 });
  });

  test.each([
    ['desktop', { x: 780, y: 180 }, { x: 1370, y: 92 }],
    ['mobile home', { x: 142, y: 330 }, { x: 325, y: 98 }],
    ['mobile wheel Home right of rig', { x: 351, y: 330 }, { x: 325, y: 98 }],
    ['wide wheel Home right of rig', { x: 460, y: 420 }, { x: 325, y: 98 }],
  ])('Home moves southwest and takes up cord length in the %s layout', (_, point, rig) => {
    const offset = moonPull(point, rig, 50);
    expect(offset.x).toBeLessThan(0);
    expect(offset.y).toBeGreaterThan(0);
    expect(Math.hypot(offset.x, offset.y)).toBeCloseTo(50, 5);
    expect((point.x - rig.x) * offset.x + (point.y - rig.y) * offset.y).toBeGreaterThan(0);
    expect(separation({ x: point.x + offset.x, y: point.y + offset.y }, rig))
      .toBeGreaterThan(separation(point, rig));
  });
});


describe('actual cord take-up and engagement', () => {
  test.each([0, 4.5, 12, 17.999])('keeps the master at rest while %spx still consumes the 18px slack', (travel) => {
    const feedback = takeupTension(travel, 18);
    expect(feedback.engagement).toBe(false);
    expect(feedback.residualTravel).toBe(0);
    expect(feedback.tension).toBeGreaterThanOrEqual(0);
    expect(feedback.tension).toBeLessThan(1);
  });

  test('engages only when all the measured slack has been consumed', () => {
    expect(takeupTension(18, 18)).toEqual({ tension: 1, engagement: true, residualTravel: 0 });
    expect(takeupTension(9, 18)).toMatchObject({ tension: 0.5, engagement: false });
  });

  test('eases into residual master travel without an engagement jump', () => {
    const first = takeupTension(18.01, 18);
    const next = takeupTension(20, 18);
    const full = takeupTension(24, 18);
    expect(first.engagement).toBe(true);
    expect(first.residualTravel).toBeGreaterThan(0);
    expect(first.residualTravel).toBeLessThan(0.0001);
    expect(next.residualTravel).toBeGreaterThan(first.residualTravel);
    expect(full.residualTravel).toBeGreaterThan(next.residualTravel);
    expect(full.residualTravel).toBeLessThanOrEqual(6);
    expect(full.tension).toBe(1);
  });

  test('uses travel to consume slack while retaining the same total cord length', () => {
    const start = { x: 0, y: 0 };
    const resting = arcLength(ropeCurve(start, { x: 0, y: 800 }, { slack: 18 }));
    const consumed = takeupTension(9, 18);
    const pulled = arcLength(ropeCurve(start, { x: 0, y: 809 }, { slack: 18, tension: consumed.tension }));
    expect(Math.abs(resting - pulled)).toBeLessThan(0.6);
    expect(consumed.residualTravel).toBe(0);
  });

  test('a pull toward the rig releases slack without negative force or stale offsets', () => {
    expect(takeupTension(-5, 18)).toEqual({ tension: 0, engagement: false, residualTravel: 0 });
  });

  test('an already taut cord has no division error and no resting engagement', () => {
    expect(takeupTension(0, 0)).toEqual({ tension: 0, engagement: false, residualTravel: 0 });
    expect(takeupTension(3, 0)).toMatchObject({ tension: 1, engagement: true });
    expect(takeupTension(3, 0).residualTravel).toBeGreaterThan(0);
  });
});


describe('Home moon pacing', () => {
  test('responds immediately, turns without a hold, and finishes within 640ms', () => {
    expect(homePullEnvelope(16).amount).toBeGreaterThan(0);
    expect(homePullEnvelope(220).amount).toBeGreaterThan(0.8);
    expect(homePullEnvelope(220).amount).toBeLessThan(1);
    expect(homePullEnvelope(280)).toMatchObject({ amount: 1, engagement: true, done: false });
    expect(homePullEnvelope(300).amount).toBeLessThan(1);
    expect(homePullEnvelope(460).amount).toBeCloseTo(0.5, 5);
    expect(homePullEnvelope(600).amount).toBeLessThan(0.05);
    expect(homePullEnvelope(640)).toEqual({ amount: 0, engagement: true, done: true });
    expect(pullEnvelope(220).amount).toBe(1);
    expect(pullEnvelope(760).done).toBe(true);
  });

  test('retains the existing brief reduced-motion pulse', () => {
    expect(homePullEnvelope(8, true).amount).toBeGreaterThan(0);
    expect(homePullEnvelope(45, true)).toEqual({ amount: 1, engagement: true, done: false });
    expect(homePullEnvelope(180, true)).toEqual({ amount: 0, engagement: true, done: true });
  });
});


describe('tension-driven fixture sway', () => {
  test('starts only after actual engagement and carries a continuous release into a bounded tail', () => {
    const settings = { engagedAt: 170, directionX: -1 };
    expect(fixtureSway(200, { directionX: -1 })).toBe(0);
    expect(fixtureSway(150, settings)).toBe(0);
    expect(fixtureSway(170, settings)).toBe(0);
    expect(fixtureSway(220, settings)).toBeGreaterThan(6);
    expect(fixtureSway(220, settings)).toBeLessThanOrEqual(8);
    expect(Math.abs(fixtureSway(760, settings))).toBeGreaterThan(0.05);
    expect(Math.abs(fixtureSway(761, settings) - fixtureSway(759, settings))).toBeLessThan(0.1);
    expect(fixtureSway(1360, settings)).toBe(0);
    expect(fixtureSway(2000, settings)).toBe(0);
  });

  test.each([[220, 760], [280, 640]])('the %sms peak has two or three shrinking crossings after the %sms handle release', (peak, duration) => {
    const settings = { engagedAt: peak - 50, peak, duration, directionX: -1 };
    const samples = Array.from({ length: 59 }, (_, index) => fixtureSway(duration + 10 + index * 10, settings));
    expect(samples.every(angle => Number.isFinite(angle) && Math.abs(angle) < 5)).toBe(true);
    const moving = samples.filter(angle => Math.abs(angle) > 0.00001);
    const signs = moving.map(Math.sign).filter((sign, index, values) => index === 0 || sign !== values[index - 1]);
    expect(signs.length - 1).toBeGreaterThanOrEqual(2);
    expect(signs.length - 1).toBeLessThanOrEqual(3);
    const early = Math.max(...samples.slice(0, 30).map(Math.abs));
    const late = Math.max(...samples.slice(30).map(Math.abs));
    expect(late).toBeLessThan(early * 0.8);
    expect(fixtureSway(duration + 600, settings)).toBe(0);
  });

  test('the Home return crosses smoothly while the moon itself finishes at 640ms', () => {
    const settings = { engagedAt: 225, peak: 280, duration: 640, directionX: 1 };
    expect(fixtureSway(250, settings)).toBeLessThan(0);
    expect(fixtureSway(280, settings)).toBeLessThan(-6);
    expect(Math.abs(fixtureSway(620, settings)) + Math.abs(fixtureSway(660, settings))).toBeGreaterThan(0.05);
    expect(homePullEnvelope(640)).toEqual({ amount: 0, engagement: true, done: true });
    expect(fixtureSway(1240, settings)).toBe(0);
  });

  test('reduced motion and vertical force keep the fixture stationary throughout the tail', () => {
    for (const elapsed of [220, 760, 1100, 1360]) {
      expect(fixtureSway(elapsed, { engagedAt: 170, directionX: 0 })).toBe(0);
      expect(fixtureSway(elapsed, { engagedAt: 170, directionX: -1, reduced: true })).toBe(0);
    }
  });
});


test.each([[220, 760], [280, 640]])('an intensified fixture impulse stays visibly oscillating after the %sms peak and %sms handle release', (peak, duration) => {
 const settings = { engagedAt: peak - 50, peak, duration, directionX: -0.25 };
 const tail = Array.from({ length: 60 }, (_, index) => fixtureSway(duration + index * 10, settings));
 expect(Math.max(...tail)).toBeGreaterThan(1.25);
 expect(Math.min(...tail)).toBeLessThan(-1);
 expect(Math.max(...tail.map(Math.abs))).toBeLessThan(2.5);
 expect(fixtureSway(duration + 600, settings)).toBe(0);
});
