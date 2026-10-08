import { useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { PortfolioLightingContext } from "./portfolioLighting";
import "../../SCSS/HomeBulbInteraction.scss";

const BULB_SHAPE = "M20 49h16c0 7 11 12 11 26 0 12-8 20-19 20S9 87 9 75c0-14 11-19 11-26Z";
const GLASS_FRAGMENTS = [
  { x: 0.18, y: 0.24, width: 7, height: 11, drift: -24, velocity: 14, angle: -20, spin: -142, shape: "polygon(0 8%, 100% 0, 66% 100%, 18% 74%)" },
  { x: 0.52, y: 0.08, width: 5, height: 9, drift: 13, velocity: -12, angle: 18, spin: 176, shape: "polygon(10% 0, 100% 36%, 38% 100%)" },
  { x: 0.78, y: 0.33, width: 8, height: 7, drift: 28, velocity: 30, angle: 34, spin: 117, shape: "polygon(0 24%, 74% 0, 100% 62%, 16% 100%)" },
  { x: 0.36, y: 0.48, width: 6, height: 10, drift: -12, velocity: 38, angle: -8, spin: -186, shape: "polygon(15% 0, 92% 18%, 54% 100%, 0 78%)" },
  { x: 0.61, y: 0.61, width: 9, height: 6, drift: 20, velocity: 18, angle: 12, spin: 95, shape: "polygon(0 42%, 84% 0, 100% 82%, 22% 100%)" },
  { x: 0.16, y: 0.7, width: 4, height: 8, drift: -31, velocity: 46, angle: -31, spin: -209, shape: "polygon(0 0, 100% 24%, 36% 100%)" },
  { x: 0.47, y: 0.87, width: 7, height: 5, drift: -3, velocity: 34, angle: 7, spin: 152, shape: "polygon(0 12%, 62% 0, 100% 66%, 29% 100%)" },
  { x: 0.84, y: 0.75, width: 4, height: 6, drift: 34, velocity: 8, angle: 39, spin: -123, shape: "polygon(21% 0, 100% 100%, 0 64%)" },
];

function cancelRun(run) {
  run.serial += 1;
  if (run.frame !== null) window.cancelAnimationFrame(run.frame);
  run.timers.forEach((timer) => window.clearTimeout(timer));
  run.frame = null;
  run.timers.clear();
  run.busy = false;
}

function resetCarriage(source) {
  source?.style.removeProperty("--bulb-carriage-offset");
  source?.style.removeProperty("--bulb-cable-scale");
}

function fixtureBounds(source) {
  const bounds = source.getBoundingClientRect();
  return { top: bounds.top, left: bounds.left, width: bounds.width || 42, height: bounds.height || 84 };
}

function fragmentTransform(x, y, angle) {
  return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${angle.toFixed(2)}deg)`;
}

export default function HomeAmbientLight({ className = "" }) {
  const gradientId = `portfolio-bulb-${useId().replaceAll(":", "")}`;
  const { theme, bulbEnabled = theme !== "home", cycle, changing, reduced } = useContext(PortfolioLightingContext);
  const enabled = bulbEnabled;
  const mountedCycle = useRef(cycle);
  const animating = changing && cycle !== mountedCycle.current;
  const sourceRef = useRef(null);
  const glassRef = useRef(null);
  const shardNodes = useRef(new Map());
  const runtime = useRef({ serial: 0, frame: null, timers: new Set(), busy: false });
  const lastReduced = useRef(reduced);
  const [phase, setPhase] = useState("idle");
  const [shards, setShards] = useState([]);
  const emitting = enabled && (phase === "idle" || phase === "settling");

  useEffect(() => {
    const run = runtime.current;
    return () => cancelRun(run);
  }, []);

  useLayoutEffect(() => {
    if (lastReduced.current === reduced) return;
    lastReduced.current = reduced;
    cancelRun(runtime.current);
    resetCarriage(sourceRef.current);
    setShards([]);
    setPhase("idle");
  }, [reduced]);

  function breakBulb() {
    const run = runtime.current;
    if (run.busy) return;
    run.busy = true;
    const serial = ++run.serial;
    const current = () => run.serial === serial;
    const schedule = (callback, delay) => {
      const timer = window.setTimeout(() => {
        run.timers.delete(timer);
        if (current()) callback();
      }, delay);
      run.timers.add(timer);
    };
    const requestFrame = (callback) => {
      run.frame = window.requestAnimationFrame((timestamp) => {
        run.frame = null;
        if (current()) callback(timestamp);
      });
    };
    const finish = () => {
      resetCarriage(sourceRef.current);
      run.busy = false;
      setShards([]);
      setPhase("idle");
    };

    setPhase("breaking");
    if (reduced) {
      schedule(() => {
        setPhase("replacing");
        schedule(finish, 120);
      }, 180);
      return;
    }

    const fixture = fixtureBounds(sourceRef.current);
    const glass = glassRef.current.getBoundingClientRect();
    const bounds = glass.width && glass.height ? glass : {
      left: fixture.left + fixture.width * 9 / 56,
      top: fixture.top + fixture.height * 49 / 112,
      width: fixture.width * 38 / 56,
      height: fixture.height * 46 / 112,
    };
    const scale = bounds.width / 28;
    const fragments = GLASS_FRAGMENTS.map((fragment, id) => ({
      ...fragment, id, originX: bounds.left + bounds.width * fragment.x,
      originY: bounds.top + bounds.height * fragment.y,
      width: fragment.width * scale, height: fragment.height * scale, exited: false,
    }));
    setShards(fragments);

    const aboveViewport = () => {
      const resting = fixtureBounds(sourceRef.current);
      const svgScale = resting.height / 112;
      return -(resting.top + resting.height + 24) / svgScale;
    };
    const move = (offset) => {
      sourceRef.current.style.setProperty("--bulb-carriage-offset", `${offset}px`);
      // Keep the cord attached as either socket crosses the viewport's top.
      sourceRef.current.style.setProperty("--bulb-cable-scale", `${Math.max(0, 1 + offset / 38)}`);
    };
    const replace = () => {
      const lift = aboveViewport();
      move(lift);
      setPhase("replacing");
      let start = null;
      const descend = (timestamp) => {
        if (start === null) start = timestamp;
        const progress = Math.min(1, (timestamp - start) / 860);
        const ease = progress * progress * (3 - 2 * progress);
        move(lift * (1 - ease));
        if (progress < 1) requestFrame(descend);
        else {
          move(0);
          setPhase("settling");
          schedule(finish, 460);
        }
      };
      requestFrame(descend);
    };

    const retract = () => {
      const lift = aboveViewport();
      move(0);
      setPhase("retracting");
      let start = null;
      const raise = (timestamp) => {
        if (start === null) start = timestamp;
        const progress = Math.min(1, (timestamp - start) / 340);
        move(lift * progress * progress);
        if (progress < 1) requestFrame(raise);
        else {
          move(lift);
          schedule(replace, 100);
        }
      };
      requestFrame(raise);
    };

    schedule(() => {
      setPhase("falling");
      let start = null;
      const fall = (timestamp) => {
        if (start === null) start = timestamp;
        const seconds = (timestamp - start) / 1000;
        const viewportBottom = window.visualViewport?.height || window.innerHeight;
        let removed = false;
        fragments.forEach((fragment) => {
          if (fragment.exited) return;
          const x = fragment.originX + fragment.drift * (1 - Math.exp(-seconds * 1.35)) / 1.35;
          const y = fragment.originY + fragment.velocity * seconds + 0.5 * 1750 * seconds * seconds;
          const node = shardNodes.current.get(fragment.id);
          if (node) node.style.transform = fragmentTransform(x, y, fragment.angle + fragment.spin * seconds);
          // Account for the rotating fragment's full diagonal before cleanup.
          if (y - Math.hypot(fragment.width, fragment.height) > viewportBottom) {
            fragment.exited = true;
            removed = true;
          }
        });
        const remaining = fragments.filter((fragment) => !fragment.exited);
        if (removed) setShards(remaining);
        if (remaining.length) requestFrame(fall);
        else retract();
      };
      requestFrame(fall);
    }, 80);
  }

  return (
    <>
    <div ref={sourceRef} className={`portfolio-light ${className}`} aria-hidden="true" data-light-enabled={enabled ? "true" : "false"} data-light-phase={animating ? "changing" : "settled"} data-light-motion={reduced ? "reduced" : "full"} data-bulb-phase={phase} data-rope-rig-busy={phase !== "idle" ? "true" : "false"} data-bulb-emitting={emitting ? "true" : "false"}>
      <div className="portfolio-light__sway" data-rope-fixture-sway="">
      <svg className="portfolio-light__fixture" viewBox="0 0 56 112" focusable="false">
        <path className="portfolio-light__cord" d="M28 0v38" />
        <g className="portfolio-light__carriage">
        <path className="portfolio-light__cap" d="M21 38h14v13H21Z" />
        <path ref={glassRef} className="portfolio-light__glass portfolio-light__glass--unlit" d={BULB_SHAPE} />
        <path className="portfolio-light__fracture" d="m26 52 6 12-12 10 14 10-7 10m-7-20-8-5m20-5 9 5" />
        <path className="portfolio-light__reflection" d="M16 74q0-8 6-13" />
        <path className="portfolio-light__socket" d="M20 42h16m-16 5h16" />
        <path className="portfolio-light__pull-mount" d="M35 45h11" />
        {/* Stable structural frames follow the real carriage through replacement.
            Only the original light-response artwork is keyed by theme cycle. */}
        <rect data-rope-master="" x="45" y="44" width="2" height="2" fill="none" />
        <g data-rope-pull="">
        <rect data-rope-rig="" x="45" y="109" width="2" height="2" fill="none" />
        <g className="portfolio-light__pull-cord" key={cycle}>
          <path className="portfolio-light__pull-thread" d="M46 46v64" />
          <circle className="portfolio-light__pull-toggle" cx="46" cy="110" r="3" />
        </g>
        </g>
        </g>
      </svg>
      <div className="portfolio-light__emission-envelope">
      <div className="portfolio-light__transition" key={cycle}>
        <span className="portfolio-light__halo" />
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
      <div className="portfolio-light__dust-envelope" style={{ opacity: emitting ? 1 : 0 }}>
      <div className="portfolio-light__transition" key={cycle}>
        {enabled && <span className="portfolio-light__dust" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((particle) => <span className="portfolio-light__dust-particle" key={particle} />)}
        </span>}
      </div>
      </div>
    </div>
    <button className="portfolio-light__trigger" type="button" aria-label="Break hanging light bulb" aria-disabled={phase !== "idle"} onClick={breakBulb} />
    {shards.length > 0 && <div className="portfolio-light__debris" aria-hidden="true">
      {shards.map((shard) => <span className="portfolio-light__shard" key={shard.id}
        ref={(node) => { if (node) shardNodes.current.set(shard.id, node); else shardNodes.current.delete(shard.id); }}
        style={{ width: `${shard.width}px`, height: `${shard.height}px`, clipPath: shard.shape,
          transform: fragmentTransform(shard.originX, shard.originY, shard.angle) }} />)}
    </div>}
    </>
  );
}
