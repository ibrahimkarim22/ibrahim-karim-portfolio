// Current dockerLogo source, captured at 24fps from t=0 through t<18s.
// The submerged opening/return are source poses, not recording padding.
export const whaleInterval = { start: 0, end: 18 };
export const whalePoses = [
  [0, "Below the surface", 10, 100],
  [10, "Jump", -2, -10],
  [15, "Airborne", -3, -10],
  [29, "Dive", -20, 100],
  [50, "Rise", -50, 0],
  [70, "Float", -60, 5],
  [74, "Prepare", -65, 0],
  [80, "Turn", -67, 5],
  [99, "Submerge", -68, 120],
  [100, "Return", 10, 100],
];
export function whalePosition(pose) {
  return {
    left: 8 + ((pose[2] + 68) / 78) * 84,
    top: 12 + ((pose[3] + 10) / 130) * 76,
  };
}
// A pure function of media time. No elapsed-time accumulator or animation clock.
export function whaleFrame(seconds) {
  const ms = Math.max(
    0,
    Math.min(
      (whaleInterval.end - whaleInterval.start) * 1000,
      (seconds - whaleInterval.start) * 1000,
    ),
  );
  const phase = whalePoses.findIndex(
    (pose, index) =>
      ms >= 180 * pose[0] &&
      (index === whalePoses.length - 1 || ms < 180 * whalePoses[index + 1][0]),
  );
  const from = whalePoses[phase];
  const to = whalePoses[Math.min(phase + 1, whalePoses.length - 1)];
  const amount =
    from === to ? 0 : (ms - 180 * from[0]) / (180 * (to[0] - from[0]));
  const point = whalePosition([
    0,
    "",
    from[2] + (to[2] - from[2]) * amount,
    from[3] + (to[3] - from[3]) * amount,
  ]);
  return { phase, ...point };
}
