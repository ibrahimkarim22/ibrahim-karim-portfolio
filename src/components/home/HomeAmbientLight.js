import { useContext, useId, useRef } from "react";
import { PortfolioLightingContext } from "./portfolioLighting";

const BULB_SHAPE = "M20 49h16c0 7 11 12 11 26 0 12-8 20-19 20S9 87 9 75c0-14 11-19 11-26Z";

export default function HomeAmbientLight({ className = "" }) {
  const gradientId = `portfolio-bulb-${useId().replaceAll(":", "")}`;
  const { theme, cycle, changing, reduced } = useContext(PortfolioLightingContext);
  const enabled = theme !== "home";
  const mountedCycle = useRef(cycle);
  const animating = changing && cycle !== mountedCycle.current;
  return (
    <div className={`portfolio-light ${className}`} aria-hidden="true" data-light-enabled={enabled ? "true" : "false"} data-light-phase={animating ? "changing" : "settled"} data-light-motion={reduced ? "reduced" : "full"}>
      <svg className="portfolio-light__fixture" viewBox="0 0 56 112" focusable="false">
        <path className="portfolio-light__cord" d="M28 0v38" />
        <path className="portfolio-light__cap" d="M21 38h14v13H21Z" />
        <path className="portfolio-light__glass portfolio-light__glass--unlit" d={BULB_SHAPE} />
        <path className="portfolio-light__reflection" d="M16 74q0-8 6-13" />
        <path className="portfolio-light__socket" d="M20 42h16m-16 5h16" />
        <path className="portfolio-light__pull-mount" d="M35 45h11" />
        <g className="portfolio-light__pull-cord" key={cycle}>
          <path className="portfolio-light__pull-thread" d="M46 46v64" />
          <circle className="portfolio-light__pull-toggle" cx="46" cy="110" r="3" />
        </g>
      </svg>
      <div className="portfolio-light__emission-envelope">
      <div className="portfolio-light__transition" key={cycle}>
        <span className="portfolio-light__halo" />
        {enabled && <span className="portfolio-light__dust" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((particle) => <span className="portfolio-light__dust-particle" key={particle} />)}
        </span>}
        <svg className="portfolio-light__emission" viewBox="0 0 56 112" focusable="false">
        <defs>
          <radialGradient id={gradientId} cx="46%" cy="60%" r="65%">
            <stop className="portfolio-light__core" offset="0" />
            <stop className="portfolio-light__rim" offset="1" />
          </radialGradient>
        </defs>
        <path className="portfolio-light__glass" fill={`url(#${gradientId})`} d={BULB_SHAPE} />
        <path className="portfolio-light__filament" d="m21 65 7 9 7-9m-7 9v12" />
        <path className="portfolio-light__reflection" d="M16 74q0-8 6-13" />
        </svg>
      </div>
      </div>
    </div>
  );
}
