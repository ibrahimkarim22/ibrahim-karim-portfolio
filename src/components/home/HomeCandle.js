import { useContext, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PortfolioLightingContext } from "./portfolioLighting";

const MAGIC_PARTICLES = [
  [-54, 28, 0], [38, 16, 70], [92, 22, 130], [-30, 26, 40],
  [164, 20, 190], [58, 16, 110], [124, 30, 250], [-12, 12, 160],
  [210, 18, 280], [76, 22, 210], [142, 22, 330], [20, 16, 90],
  [188, 28, 300], [110, 20, 230],
];
const SMOKE_WISPS = [
  [-18, 24, 260, "M18 96C6 81 31 72 19 57S6 32 21 19S22 8 18 2"],
  [12, 28, 350, "M18 96C30 81 7 71 17 56S30 34 16 20S14 8 19 2"],
  [30, 32, 440, "M18 96C7 82 29 74 20 60S9 38 21 25S25 10 18 2"],
  [-6, 26, 530, "M18 96C28 83 8 73 16 59S29 38 17 23S13 9 18 2"],
];

export default function HomeCandle() {
  const { theme, cycle, changing, reduced } = useContext(PortfolioLightingContext);
  const id = useId().replaceAll(":", "");
  const candleRef = useRef(null);
  const handledCycleRef = useRef(cycle);
  const previousSmokeThemeRef = useRef(theme);
  const smokeCycleRef = useRef(0);
  const [burst, setBurst] = useState(null);
  const [smoke, setSmoke] = useState(null);
  const state = theme === "home" ? changing ? "extinguishing" : "off" : changing ? "igniting" : "lit";

  useEffect(() => {
    const isNewCycle = handledCycleRef.current !== cycle;
    handledCycleRef.current = cycle;
    if (!isNewCycle || theme === "home" || reduced) {
      setBurst(null);
      return;
    }
    const bounds = candleRef.current.getBoundingClientRect();
    const originX = Math.max(16, Math.min(bounds.left + bounds.width * 0.5, window.innerWidth - 16));
    const originY = Math.max(16, Math.min(bounds.top + bounds.height * 0.2, window.innerHeight - 16));
    setBurst({ cycle, originX, originY });
    const timer = window.setTimeout(() => setBurst(null), 2200);
    return () => window.clearTimeout(timer);
  }, [cycle, theme, reduced]);

  useEffect(() => {
    const isExtinguishing = previousSmokeThemeRef.current !== "home" && theme === "home";
    previousSmokeThemeRef.current = theme;
    if (!isExtinguishing) {
      setSmoke(null);
      return;
    }
    const bounds = candleRef.current.getBoundingClientRect();
    setSmoke({
      cycle: ++smokeCycleRef.current,
      originX: bounds.left + bounds.width * 49 / 96,
      originY: bounds.top + bounds.height * 81 / 260,
      reduced,
    });
    const timer = window.setTimeout(() => setSmoke(null), reduced ? 600 : 8300);
    return () => window.clearTimeout(timer);
  }, [theme, reduced]);

  return (
    <>
    <div className="portfolio-candle" ref={candleRef} aria-hidden="true" data-candle-state={state} data-light-phase={changing ? "changing" : "settled"} data-light-motion={reduced ? "reduced" : "full"}>
      <span className="portfolio-candle__glow-envelope">
        <span className="portfolio-candle__glow" />
        <span className="portfolio-candle__surge-glow" key={`surge-${cycle}`} />
        {state !== "off" && <span className="portfolio-candle__dust" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((index) => <span className={`portfolio-candle__dust-particle portfolio-candle__dust-particle--${index}`} key={index} />)}
        </span>}
      </span>
      <svg viewBox="0 0 96 260" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id={`candle-wax-${id}`}><stop offset="0" stopColor="#b6a88e" /><stop offset="0.2" stopColor="#ded3bb" /><stop offset="0.46" stopColor="#f1e7d2" /><stop offset="0.73" stopColor="#d0bea0" /><stop offset="1" stopColor="#998971" /></linearGradient>
          <radialGradient id={`candle-flame-${id}`} cx="48%" cy="76%" r="76%"><stop className="portfolio-candle__flame-core" offset="0" /><stop className="portfolio-candle__flame-edge" offset="1" /></radialGradient>
          <clipPath id={`candle-wax-clip-${id}`}><rect width="96" height="260" /></clipPath>
        </defs>
        <g clipPath={`url(#candle-wax-clip-${id})`}>
        <path className="portfolio-candle__wax" d="M19 103c-1 26 3 60 2 89l-3 130h60l-3-129c-2-29 3-62 1-90-17-9-40-9-57 0Z" fill={`url(#candle-wax-${id})`} stroke="#9c8b72" strokeWidth="0.65" />
        <path d="M20 103c5-6 13-8 19-8 6 0 6 2 12 1 8-2 17 1 23 6-4 5-8 7-14 8-6 2-9 0-15 1-10 1-19-1-25-8Z" fill="#e9ddc4" />
        <path d="M29 102c9-5 29-6 38-1-7 7-30 9-38 1Z" fill="#a59375" opacity="0.56" />
        <path d="M24 110c2 8 0 15 1 22 0 8 6 10 7 2 1-7-1-16 3-19m25-5c3 11-1 24 1 34 1 8 6 8 6 0 0-11-2-17 0-27" fill="none" stroke="#f5ecd9" strokeWidth="3.5" strokeLinecap="round" opacity="0.56" />
        <path d="M35 133c-2 13 1 23-1 36m28-12c-1 13 1 26 0 38" fill="none" stroke="#9c8b72" strokeWidth="1.1" strokeLinecap="round" opacity="0.18" />
        <path d="M30 171c-2 48-3 99-2 149" fill="none" stroke="#fff6e4" strokeWidth="1.2" opacity="0.32" />
        <path className="portfolio-candle__wax-highlight" d="M23 103c5 4 10 3 15 6 6 3 12 0 18 0 7 0 10-2 16-6" fill="none" stroke="#fff6e4" strokeWidth="1.7" strokeLinecap="round" />
        <path d="m48 103 1-22" fill="none" stroke="#4e4033" strokeWidth="1.8" strokeLinecap="round" />
        </g>
        <g className="portfolio-candle__flame-envelope">
        <g className="portfolio-candle__flame">
          <g className="portfolio-candle__ignition" key={cycle}>
            <path className="portfolio-candle__flame-shape" d="M48 14c2 20-14 29-15 47-1 15 6 24 16 24 11 0 17-11 16-25-1-18-14-27-17-46Z" fill={`url(#candle-flame-${id})`} />
            <path className="portfolio-candle__flame-heart" d="M49 52c-5 10-9 21 0 30 9-9 8-19 0-30Z" fill="#fff8e7" opacity="0.82" />
          </g>
        </g>
        </g>
      </svg>
    </div>
    {burst && createPortal(
      <div className="portfolio-candle__sparkles portfolio-candle-magic" key={burst.cycle} aria-hidden="true" data-candle-burst={burst.cycle} style={{ "--magic-origin-x": `${burst.originX}px`, "--magic-origin-y": `${burst.originY}px` }}>
        {MAGIC_PARTICLES.map(([drift, size, delay], index) => {
          const destinationX = Math.max(14, Math.min(burst.originX + drift, window.innerWidth - 14));
          const rise = 12 + index % 4 * 14 - burst.originY;
          return <span className="portfolio-candle__sparkle portfolio-candle__sparkle--star" key={index} style={{
            "--magic-drift": `${destinationX - burst.originX}px`,
            "--magic-mid-drift": `${(destinationX - burst.originX) * 0.35}px`,
            "--magic-rise": `${rise}px`,
            "--magic-mid-rise": `${rise * 0.48}px`,
            "--magic-size": `${size}px`,
            "--magic-delay": `${delay}ms`,
            "--magic-spin": `${index % 2 === 0 ? 105 : -75}deg`,
          }}><svg viewBox="0 0 16 16" focusable="false"><path d="M8 0l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" /></svg></span>;
        })}
      </div>, document.body,
    )}
    {theme === "home" && smoke && createPortal(
      <div className="portfolio-candle-smoke" key={smoke.cycle} aria-hidden="true" data-candle-smoke={smoke.cycle} data-smoke-motion={smoke.reduced ? "reduced" : "full"} style={{ "--smoke-origin-x": `${smoke.originX}px`, "--smoke-origin-y": `${smoke.originY}px` }}>
        {(smoke.reduced ? SMOKE_WISPS.slice(0, 1) : SMOKE_WISPS).map(([drift, size, delay, path], index) => {
          const rise = smoke.reduced ? 0 : 8 + index * 6 - smoke.originY;
          return <span className="portfolio-candle__smoke-wisp" key={index} style={{
            "--smoke-drift": `${smoke.reduced ? 0 : drift}px`,
            "--smoke-mid-drift": `${smoke.reduced ? 0 : drift * -0.3}px`,
            "--smoke-rise": `${rise}px`,
            "--smoke-mid-rise": `${rise * 0.7}px`,
            "--smoke-size": `${size}px`,
            "--smoke-delay": `${smoke.reduced ? 0 : delay}ms`,
          }}><svg viewBox="0 0 36 96" focusable="false"><path d={path} /></svg></span>;
        })}
      </div>, document.body,
    )}
    </>
  );
}
