import ProjectImage from "../projects/ProjectImage";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { SourceCrop } from "./PortfolioMedia";
import StableAnnotation from "./StableAnnotation";
import WhaleLoop from "./WhaleLoop";
import {
  whaleFrame,
  whaleInterval,
  whalePoses as poses,
  whalePosition,
} from "./whaleTimeline";

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media?.matches ?? false);
    media?.addEventListener?.("change", update);
    return () => media?.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function useStudy() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (reduced) return;
    if (!window.IntersectionObserver) {
      setRun(1);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(1);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reduced]);
  return { ref, reduced, run, replay: () => setRun((value) => value + 1) };
}

export function useExhibitionScenes(ref) {
  useEffect(() => {
    const scenes = [...ref.current.querySelectorAll(".tp-scene")];
    if (!window.IntersectionObserver) {
      scenes.forEach((scene) => {
        scene.dataset.seen = "true";
      });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.seen = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { root: ref.current, threshold: 0.15 },
    );
    scenes.forEach((scene) => observer.observe(scene));
    return () => observer.disconnect();
  }, [ref]);
}

export function OpeningAssembly({ worlds }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  function move(event) {
    if (
      reduced ||
      event.pointerType !== "mouse" ||
      !window.matchMedia?.("(pointer: fine)").matches
    )
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    ref.current.style.setProperty(
      "--tp-look-x",
      `${((event.clientX - rect.left) / rect.width - 0.5) * 8}px`,
    );
    ref.current.style.setProperty(
      "--tp-look-y",
      `${((event.clientY - rect.top) / rect.height - 0.5) * 6}px`,
    );
  }
  function reset() {
    ref.current.style.setProperty("--tp-look-x", "0px");
    ref.current.style.setProperty("--tp-look-y", "0px");
  }
  return (
    <div
      ref={ref}
      className="tp-assembly"
      role="img"
      aria-label="HeyYou, BARD and Tuh-Doo float as separate image planes above the shared portfolio architecture"
      onPointerMove={move}
      onPointerLeave={reset}
    >
      <div className="tp-registration tp-registration--top" aria-hidden="true">
        <span>FIG. 01 / EXPLODED PORTFOLIO</span>
        <span>DIFFERENT WORLDS / ONE SYSTEM</span>
      </div>
      <div className="tp-assembly-stage" aria-hidden="true">
        <div className="tp-model-axis tp-model-axis--x" />
        <div className="tp-model-axis tp-model-axis--y" />
        {[
          "CONTENT",
          "INTERFACE",
          "MOTION",
          "PROJECT MODALS",
          "3D / ASSETS",
          "QUALITY",
          "DEPLOYMENT",
        ].map((layer, index) => (
          <div
            className={`tp-assembly-plane tp-assembly-plane--${index}`}
            key={layer}
            style={{
              "--tp-plane": index,
              "--tp-start-x": `${(index % 2 ? 1 : -1) * (22 + index * 3)}px`,
              "--tp-start-y": `${(index - 3) * 23}px`,
            }}
          >
            <span>0{index + 1}</span>
            <span>{layer}</span>
            <span>+</span>
          </div>
        ))}
        {worlds.map((world, index) => (
          <div
            className={`tp-world-plane tp-world-plane--${index}`}
            key={world.name}
          >
            <div className="tp-plane-image">
              <ProjectImage critical
                src={world.src}
                width={world.width}
                height={world.height}
                alt=""
                decoding="async"
              />
            </div>
            <span className="tp-plane-name">
              0{index + 1} / {world.name}
              <span>↗</span>
            </span>
          </div>
        ))}
        <div className="tp-assembled-frame">
          <span>04 / THE SHARED STRUCTURE</span>
          <strong>
            THIS
            <br />
            PORTFOLIO<span>↗</span>
          </strong>
          <div className="tp-frame-caption">CONTENT × CRAFT × CODE</div>
        </div>
        <span className="tp-model-coordinate">X 04 / Y 03 / Z 01</span>
      </div>
      <div className="tp-registration" aria-hidden="true">
        <span className="tp-crosshair">+</span>
        <span>MODEL 01 — ASSEMBLED IN 2.7 S</span>
        <span className="tp-crosshair">+</span>
      </div>
    </div>
  );
}

const studyCopy = [
  [
    "HeyYou",
    "Continuous / playful",
    "Signals meet, scatter and return.",
    "signal",
  ],
  [
    "BARD",
    "Weighted / theatrical",
    "Anticipation. Travel. A slow settle.",
    "curtain",
  ],
  [
    "Tuh-Doo",
    "Structured / workflow",
    "One task. One deliberate transition.",
    "task",
  ],
];

function MotionStudy({ name, language, description, type }) {
  const { ref, reduced, run, replay } = useStudy();
  return (
    <article ref={ref} className={`tp-study tp-study--${type}`}>
      <p className="tp-label">{name} / MOTION LANGUAGE</p>
      <div
        key={run}
        className={`tp-study-stage ${run && !reduced ? "is-playing" : ""}`}
        role="img"
        aria-label={`${name} simplified motion study`}
        data-run={run}
      >
        {type === "signal" && (
          <>
            <div className="tp-study-device" />
            <div className="tp-study-device tp-study-device--right" />
            <span className="tp-signal-path" />
            <span className="tp-signal-dot tp-signal-dot--left" />
            <span className="tp-signal-dot tp-signal-dot--right" />
            <span className="tp-signal-meet" />
          </>
        )}
        {type === "curtain" && (
          <>
            <span className="tp-study-word">B / A / R / D</span>
            <span className="tp-study-curtain" />
            <span className="tp-study-curtain tp-study-curtain--right" />
          </>
        )}
        {type === "task" && (
          <>
            <div className="tp-study-lanes">
              <span>01</span>
              <span>02</span>
              <span>03</span>
            </div>
            <span className="tp-study-task">
              <span>↳</span> ONE TASK <span>✓</span>
            </span>
          </>
        )}
      </div>
      <div className="tp-study-caption">
        <div>
          <h3>{language}</h3>
          <p>{description}</p>
        </div>
        <button
          type="button"
          onClick={replay}
          aria-label={`Replay ${name} motion study`}
        >
          Replay <span aria-hidden="true">↻</span>
        </button>
      </div>
    </article>
  );
}

export function MotionStudies() {
  return (
    <div
      role="region"
      aria-label="Three worlds. Three motion languages."
      className="tp-motion-lab tp-scene"
    >
      <div className="tp-lab-heading">
        <h3>
          Three worlds.
          <br />
          Three motion languages.
        </h3>
        <p>
          Simplified studies of each project’s character.
          <br />
          Small interpretations, played once. Replay to compare.
        </p>
      </div>
      <div className="tp-studies">
        {studyCopy.map(([name, language, description, type]) => (
          <MotionStudy key={name} {...{ name, language, description, type }} />
        ))}
      </div>
    </div>
  );
}

export function MotionTimeline({ source, whale, loop }) {
  const reduced = useReducedMotion();
  const sprite = useRef(null);
  const phase = useRef(reduced ? 4 : 0);
  const [point, setPoint] = useState(reduced ? 4 : 0);
  const [paused, setPaused] = useState(false);
  const [seek, setSeek] = useState({ time: 0, revision: 0 });
  const followVideo = useCallback(
    (seconds) => {
      if (reduced) return;
      const frame = whaleFrame(seconds);
      sprite.current?.style.setProperty("--tp-marker-x", `${frame.left}%`);
      sprite.current?.style.setProperty("--tp-marker-y", `${frame.top}%`);
      if (frame.phase !== phase.current) {
        phase.current = frame.phase;
        setPoint(frame.phase);
      }
    },
    [reduced],
  );
  useLayoutEffect(() => {
    const initial = whalePosition(poses[reduced ? 4 : 0]);
    sprite.current.style.setProperty("--tp-marker-x", `${initial.left}%`);
    sprite.current.style.setProperty("--tp-marker-y", `${initial.top}%`);
    phase.current = reduced ? 4 : 0;
    setPoint(phase.current);
  }, [reduced]);
  const pose = poses[point];
  function replay() {
    if (reduced) {
      const poster = whalePosition(poses[4]);
      sprite.current.style.setProperty("--tp-marker-x", `${poster.left}%`);
      sprite.current.style.setProperty("--tp-marker-y", `${poster.top}%`);
      phase.current = 4;
      setPoint(4);
      return;
    }
    setSeek((value) => ({
      time: whaleInterval.start,
      revision: value.revision + 1,
    }));
    setPaused(false);
    followVideo(0);
  }
  return (
    <div className="tp-timeline tp-scene">
      <div className="tp-timeline-result">
        <p className="tp-label">WHAT YOU SEE / HEYYOU</p>
        <WhaleLoop
          src={loop}
          poster={whale}
          reduced={reduced}
          paused={paused}
          onPausedChange={setPaused}
          onTime={followVideo}
          seek={seek}
        />
      </div>
      <div className="tp-timeline-model">
        <p className="tp-label">HOW IT MOVES / 18 SECOND CYCLE</p>
        <h3>A timeline written in CSS.</h3>
        <div className="tp-whale-track" aria-hidden="true">
          <svg
            className="tp-motion-path"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points={poses
                .map(
                  (item) =>
                    `${whalePosition(item).left},${whalePosition(item).top}`,
                )
                .join(" ")}
            />
          </svg>
          <span ref={sprite} className="tp-timeline-marker" />
          <span className="tp-path-label">
            POSITION / NORMALIZED SOURCE X + Y
          </span>
        </div>
        <div
          className="tp-timeline-points"
          aria-label="Whale CSS keyframe poses"
        >
          {poses.map(([percent], index) => (
            <button
              key={percent}
              type="button"
              aria-label={`Inspect whale pose at ${percent} percent`}
              aria-pressed={point === index}
              onClick={() => {
                setPaused(true);
                if (!reduced) {
                  const time = (18 * percent) / 100;
                  setSeek((value) => ({ time, revision: value.revision + 1 }));
                  followVideo(time);
                } else {
                  const selected = whalePosition(poses[index]);
                  sprite.current.style.setProperty(
                    "--tp-marker-x",
                    `${selected.left}%`,
                  );
                  sprite.current.style.setProperty(
                    "--tp-marker-y",
                    `${selected.top}%`,
                  );
                }
                phase.current = index;
                setPoint(index);
              }}
            >
              <span>{percent}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="tp-timeline-controls">
          <p
            role="status"
            aria-label="Whale timeline pose"
            aria-live={paused || reduced ? "polite" : "off"}
          >
            {pose[0]}% / {pose[1]}
          </p>
          <button type="button" onClick={replay}>
            Replay source timeline <span aria-hidden="true">↻</span>
          </button>
        </div>
        <p className="tp-margin-note">
          A position marker follows the current <code>dockerLogo</code> source:
          normalized X + Y, original offsets and linear timing. Both views share
          the video clock. Select a keyframe to pause and inspect the same
          moment.
        </p>
      </div>
      <div className="tp-timeline-source">
        <p className="tp-label">HOW IT WORKS / PROCESS ARCHIVE</p>
        <SourceCrop
          src={source}
          width={2004}
          height={1057}
          top={0}
          crop={400}
          cropWidth={730}
          name="whale keyframes"
          alt="Process archive: whale keyframes showing timeline positions and transforms"
          note="Selected opening poses / original CSS source"
        />
      </div>
    </div>
  );
}

const stages = [
  [
    "Model",
    "Blender",
    "Geometry and materials begin in Blender. The signature and landscape source views record that work.",
  ],
  [
    "Animate",
    "Clips / AnimationMixer",
    "Model clips travel with the GLB. Three.js AnimationMixer plays them; useFrame updates the mixer in the live scene.",
  ],
  [
    "Export",
    "logo.glb / landscape2.glb",
    "Binary glTF assets carry the geometry and animation into the application.",
  ],
  [
    "Integrate",
    "React Three Fiber / useGLTF",
    "Canvas hosts the scene. useGLTF loads the exported model; internal Suspense and readiness state contain loading.",
  ],
  [
    "Render",
    "Three.js / browser",
    "The exported signature and profile become live browser scenes. Rendered phone views remain lightweight images.",
  ],
];

export function AssetPipeline({ selected, onSelect }) {
  return (
    <div className="tp-production-pipeline tp-scene">
      <ol className="tp-pipeline" aria-label="Live 3D asset pipeline">
        {stages.map(([name], index) => (
          <li key={name}>
            <button
              type="button"
              aria-label={`Inspect ${name} stage`}
              aria-pressed={selected === index}
              aria-controls="tp-pipeline-detail"
              onClick={() => onSelect(index)}
            >
              <span>0{index + 1}</span>
              <strong>{name}</strong>
              <i aria-hidden="true">{index === 4 ? "↗" : "→"}</i>
            </button>
          </li>
        ))}
      </ol>
      <StableAnnotation
        items={stages}
        selected={selected}
        className="tp-pipeline-detail"
        id="tp-pipeline-detail"
        label="Asset pipeline detail"
        render={(stage) => (
          <>
            <p className="tp-label">{stage[1]}</p>
            <p>{stage[2]}</p>
          </>
        )}
      />
    </div>
  );
}

const practices = [
  [
    "Responsive",
    "Recompose the structure.",
    "This atlas changes its plane spacing, media layouts and navigation for desktop, tablet and mobile. The exhibition stays readable at narrow widths.",
  ],
  [
    "Keyboard",
    "A path through every layer.",
    "Native buttons support Enter and Space. The atlas scrolling region supports keyboard scrolling; chapter links focus their destination headings.",
  ],
  [
    "Focus",
    "Contained. Visible. Returned.",
    "Named dialogs contain focus. Escape and both close controls return to the project trigger; selected planes preserve keyboard focus.",
  ],
  [
    "Reduced motion",
    "The complete model, at rest.",
    "The atlas opens already assembled. Motion studies show still poses, and every explanation and control remains available.",
  ],
  [
    "Regression testing",
    "Review what the visitor does.",
    "Component and browser checks cover layer selection, media, responsive geometry, closing, route state and focus restoration.",
  ],
  [
    "Accessibility",
    "Inspect the whole experience.",
    "Semantic headings, image descriptions, named controls, contrast and native full-size links support access. Browser reviews include axe checks.",
  ],
];

export function QualitySheet({ previews }) {
  const [selected, setSelected] = useState(0);
  const [viewport, setViewport] = useState("desktop");
  const preview = previews[viewport];
  return (
    <div className="tp-inspection tp-scene">
      <div className="tp-inspection-sheet">
        <div className="tp-sheet-meta">
          <span>DRAWING Q—01</span>
          <span>QUALITY LAYER / SIX PRACTICES</span>
        </div>
        <div className="tp-practices">
          {practices.map(([name], index) => (
            <button
              key={name}
              type="button"
              aria-label={`Inspect ${name} practice`}
              aria-pressed={selected === index}
              aria-controls="tp-quality-detail"
              onClick={() => setSelected(index)}
            >
              <span>0{index + 1}</span>
              <strong>{name}</strong>
              <i aria-hidden="true">+</i>
            </button>
          ))}
        </div>
        <StableAnnotation
          items={practices}
          selected={selected}
          className="tp-quality-detail"
          id="tp-quality-detail"
          label="Quality inspection detail"
          render={(practice) => (
            <>
              <h3>{practice[1]}</h3>
              <p>{practice[2]}</p>
            </>
          )}
        />
      </div>
      <figure className="tp-responsive-model">
        <p className="tp-label">RESPONSIVE / HEYYOU AT THREE WIDTHS</p>
        <div className="tp-viewport-drawing">
          <span className="tp-viewport-ghost tp-viewport-ghost--tablet" />
          <span className="tp-viewport-ghost tp-viewport-ghost--mobile" />
          <div className="tp-viewport-active" data-viewport={viewport}>
            <span className="tp-preview-index">
              {viewport.toUpperCase()} / {preview.width} PX
            </span>
            <div className="tp-preview-body">
              <ProjectImage
                src={preview.src}
                width={preview.width}
                height={preview.height}
                alt={`HeyYou responsive preview: ${viewport}, ${preview.width} pixels wide`}
                loading="lazy"
                decoding="async"
              />
            </div>
            <span className="tp-preview-rule" />
          </div>
        </div>
        <div className="tp-viewport-controls">
          {["desktop", "tablet", "mobile"].map((size) => (
            <button
              type="button"
              key={size}
              aria-label={`View ${
                size[0].toUpperCase() + size.slice(1)
              } responsive preview`}
              aria-pressed={viewport === size}
              onClick={() => setViewport(size)}
            >
              {size}
            </button>
          ))}
        </div>
        <figcaption className="tp-margin-note">
          <span>
            The same HeyYou opening at three widths. The phone capture shows the
            complete stacked composition.
          </span>
          <a
            href={preview.src}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${viewport} HeyYou responsive preview at full size (opens in a new tab)`}
          >
            View full size ↗
          </a>
        </figcaption>
      </figure>
    </div>
  );
}

export function FinalAssembly() {
  return (
    <div
      className="tp-final-model tp-scene"
      role="img"
      aria-label="Five portfolio system layers converge into one compact architectural structure"
    >
      <div className="tp-final-orbit" aria-hidden="true" />
      <div className="tp-final-structure" aria-hidden="true">
        {["EXPERIENCE", "MODALS", "ROUTING", "MOTION + ASSETS", "SHELL"].map(
          (layer, index) => (
            <div
              className="tp-final-plane"
              key={layer}
              style={{ "--tp-final-layer": index }}
            >
              <span>0{index + 1}</span>
              <span>{layer}</span>
              <b>+</b>
            </div>
          ),
        )}
      </div>
      <span className="tp-final-caption" aria-hidden="true">
        SYSTEM 01 / ALL LAYERS CONNECTED
      </span>
    </div>
  );
}
