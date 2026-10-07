/* eslint-env node */
// Browser-only instrumentation: compare each marker write with the exact
// native currentTime read that produced it, including writes between frames.
module.exports = async function installClockProbe(page) {
  await page.addInitScript(() => {
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLMediaElement.prototype,
      "currentTime",
    );
    const setProperty = CSSStyleDeclaration.prototype.setProperty;
    let sampledTime;
    window.portfolioClockProbe = {
      active: false,
      writes: 0,
      maxError: 0,
      backward: [],
      maxGap: 0,
      lastWall: undefined,
      lastTime: undefined,
    };
    Object.defineProperty(HTMLMediaElement.prototype, "currentTime", {
      ...descriptor,
      get() {
        const value = descriptor.get.call(this);
        if (this.matches(".tp-whale-media video")) sampledTime = value;
        return value;
      },
      set(value) {
        if (this.matches(".tp-whale-media video")) sampledTime = undefined;
        descriptor.set.call(this, value);
      },
    });
    CSSStyleDeclaration.prototype.setProperty = function (name, ...args) {
      const result = setProperty.call(this, name, ...args);
      const marker = document.querySelector(".tp-timeline-marker");
      if (
        name === "--tp-marker-y" &&
        this === marker?.style &&
        sampledTime !== undefined
      ) {
        window.portfolioLastMarkerTime = sampledTime;
        const probe = window.portfolioClockProbe;
        if (probe.active) {
          const wall = performance.now();
          probe.writes++;
          probe.maxError = Math.max(
            probe.maxError,
            window.portfolioWhaleError(sampledTime),
          );
          if (
            probe.lastTime !== undefined &&
            sampledTime < probe.lastTime &&
            probe.lastTime - sampledTime < 9
          )
            probe.backward.push({ from: probe.lastTime, to: sampledTime });
          if (probe.lastWall !== undefined)
            probe.maxGap = Math.max(probe.maxGap, wall - probe.lastWall);
          probe.lastWall = wall;
          probe.lastTime = sampledTime;
        }
      }
      return result;
    };
  });
};
