import { whaleFrame } from "./whaleTimeline";

it.each([
  [0, 0, 92, 76.307692],
  [1.8, 1, 79.076923, 12],
  [2.7, 2, 78, 12],
  [5.22, 3, 59.692308, 76.307692],
  [9, 4, 27.384615, 17.846154],
  [12.6, 5, 16.615385, 20.769231],
  [13.32, 6, 11.230769, 17.846154],
  [14.4, 7, 9.076923, 20.769231],
  [17.82, 8, 8, 88],
  [18, 9, 92, 76.307692],
])(
  "maps media time %s to the current source keyframe",
  (time, phase, left, top) => {
    const actual = whaleFrame(time);
    expect(actual.phase).toBe(phase);
    expect(actual.left).toBeCloseTo(left, 5);
    expect(actual.top).toBeCloseTo(top, 5);
  },
);

it("interpolates the source's changing X and Y instead of a left-to-right timer", () => {
  const midpoint = whaleFrame(10.8);
  expect(midpoint.phase).toBe(4);
  expect(midpoint.left).toBeCloseTo(22);
  expect(midpoint.top).toBeCloseTo(19.307692, 5);
});

it("clamps outside the calibrated interval and resets directly when media wraps", () => {
  expect(whaleFrame(-1)).toEqual(whaleFrame(0));
  expect(whaleFrame(20)).toEqual(whaleFrame(18));
  const opening = whaleFrame(0.125);
  whaleFrame(17.958333);
  expect(whaleFrame(0.125)).toEqual(opening);
});
