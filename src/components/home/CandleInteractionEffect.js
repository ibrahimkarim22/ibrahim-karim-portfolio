import { useId } from "react";
import { createPortal } from "react-dom";
import "../../SCSS/HomeCandleInteraction.scss";

const SPARKS = [[-9, -14], [12, -8], [-15, 3], [5, -21], [17, 6]];
const EMBERS = [
  [-0.12, 0.65, 0], [0.16, 0.88, 55], [-0.25, 0.79, 100], [0.08, 1.04, 35],
  [0.31, 0.72, 130], [-0.07, 0.98, 70], [0.2, 0.81, 160], [-0.34, 0.92, 95],
  [0.02, 1.1, 190], [0.26, 0.93, 125],
];
const CLICK_SMOKE = [
  [-8, 0, 23, "M18 96C6 81 31 72 19 57S6 32 21 19S22 8 18 2"],
  [10, 70, 27, "M18 96C30 81 7 71 17 56S30 34 16 20S14 8 19 2"],
  [-22, 130, 20, "M18 96C7 82 29 74 20 60S9 38 21 25S25 10 18 2"],
  [28, 180, 30, "M18 96C28 83 8 73 16 59S29 38 17 23S13 9 18 2"],
  [2, 230, 25, "M18 96C9 82 26 69 17 56S10 35 22 23S23 8 18 2"],
  [-15, 270, 19, "M18 96C26 80 10 72 19 56S29 35 16 23S14 8 18 2"],
];
const SMOKE_MOTES = [[-4, 35, 9], [18, 105, 13], [-24, 165, 7], [28, 235, 11], [-12, 290, 8], [10, 335, 10]];

export default function CandleInteractionEffect({ interaction }) {
  const id = `candle-click-${useId().replaceAll(":", "")}`;
  if (!interaction) return null;
  const { kind, phase, reduced, compact, fireHeight, fireWidth, originX, originY } = interaction;
  const isFire = kind === "surge";
  const showFire = isFire && ["burst", "full", "collapse"].includes(phase);
  const showStrike = (!isFire && phase === "flash") || phase === "strike" || phase === "strike-again";
  return createPortal(
    <div className="portfolio-candle-click" aria-hidden="true" key={interaction.id}
      data-candle-interaction={kind} data-interaction-phase={phase}
      data-interaction-motion={reduced ? "reduced" : "full"}
      data-interaction-repeat={interaction.restarting ? "true" : "false"}
      style={{ "--click-origin-x": `${originX}px`, "--click-origin-y": `${originY}px`, "--click-fire-height": `${fireHeight}px`, "--click-fire-width": `${fireWidth}px`, "--click-smoke-rise": `${-originY - 30}px` }}>
      <span className="portfolio-candle-click__light" data-light-boost={isFire ? "fire" : "spark"} />
      {showStrike && <>
        <span className="portfolio-candle-click__wick-flash" />
        {!reduced && SPARKS.map(([x, y], index) => <span className="portfolio-candle-click__spark" key={index}
          style={{ "--spark-x": `${x}px`, "--spark-y": `${y}px`, "--spark-spin": `${index * 57}deg` }} />)}
      </>}
      {isFire && ["strike", "strike-again", "relight"].includes(phase) && <span className="portfolio-candle-click__strike-light" />}
      {isFire && phase === "out" && CLICK_SMOKE.slice(0, reduced ? 1 : compact ? 4 : 6).map(([drift, delay, size, path], index) =>
        <span className="portfolio-candle-click__smoke" key={index}
          style={{ "--click-smoke-drift": `${drift}px`, "--click-smoke-delay": `${reduced ? 0 : delay}ms`, "--click-smoke-duration": `${reduced ? 1000 : 1000 - delay}ms`, "--click-smoke-size": `${size}px` }}>
          <svg viewBox="0 0 36 96" focusable="false"><path d={path} /></svg>
        </span>)}
      {isFire && phase === "out" && !reduced && SMOKE_MOTES.slice(0, compact ? 4 : 6).map(([drift, delay, size], index) =>
        <span className="portfolio-candle-click__smoke-mote" key={index}
          style={{ "--click-smoke-drift": `${drift}px`, "--click-smoke-delay": `${delay}ms`, "--click-smoke-duration": `${1000 - delay}ms`, "--click-smoke-size": `${size}px` }} />)}
      {showFire && <div className="portfolio-candle-click__fire">
        <svg viewBox="0 0 120 360" preserveAspectRatio="none" focusable="false">
          <defs>
            <linearGradient id={`${id}-outer`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#ffc857" /><stop offset="0.34" stopColor="#ffaf35" />
              <stop offset="0.78" stopColor="#e97a21" /><stop offset="1" stopColor="#b95217" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id={`${id}-inner`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#fffde4" /><stop offset="0.36" stopColor="#ffe89a" />
              <stop offset="1" stopColor="#ffb735" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <g className="portfolio-candle-click__tongue portfolio-candle-click__tongue--outer">
            <path d="M60 357C34 358 12 327 17 284C21 240 43 229 27 174C52 199 47 221 52 240C69 179 33 141 53 92C65 58 78 45 70 7C106 52 85 112 89 151C91 187 111 205 103 240C118 285 107 335 60 357Z" fill={`url(#${id}-outer)`} />
          </g>
          <g className="portfolio-candle-click__tongue portfolio-candle-click__tongue--side">
            <path d="M58 357C21 344 24 301 35 270C42 247 34 218 39 204C49 231 69 231 67 195C71 168 86 153 79 133C110 180 87 220 94 254C111 299 84 345 58 357Z" fill={`url(#${id}-outer)`} opacity="0.8" />
          </g>
          <g className="portfolio-candle-click__tongue portfolio-candle-click__tongue--inner">
            <path d="M60 357C35 351 29 321 41 295C54 267 47 230 56 206C60 244 84 258 72 291C92 320 84 350 60 357Z" fill={`url(#${id}-inner)`} />
            <path d="M60 356C47 345 46 331 56 315C62 307 58 296 62 285C71 309 83 335 60 356Z" fill="#fffef0" />
          </g>
        </svg>
      </div>}
      {isFire && !reduced && (phase === "full" || phase === "collapse") &&
        EMBERS.slice(0, compact ? 6 : 10).map(([drift, rise, delay], index) => <span className="portfolio-candle-click__ember" key={index}
          style={{
            "--ember-x": `${Math.max(-originX + 4, Math.min(fireHeight * drift, window.innerWidth - originX - 4))}px`,
            "--ember-y": `${-fireHeight * rise}px`, "--ember-start": `${-fireHeight * (0.36 + index % 3 * 0.1)}px`,
            "--ember-delay": `${delay}ms`, "--ember-duration": `${880 + index % 4 * 45}ms`,
            "--ember-size": `${1.4 + index % 3 * 0.4}px`,
          }} />)}
    </div>, document.body,
  );
}
