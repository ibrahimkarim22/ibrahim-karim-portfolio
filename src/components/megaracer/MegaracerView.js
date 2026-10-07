import { useLayoutEffect, useRef, useState } from "react";

export const MEGARACER_PROFILE_URL = "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22";
const PROFILE_WIDTH = 1100;

export function MegaracerContext() {
  return (
    <div className="home-context-panel__caption">
      <p className="home-context-panel__label">MEGARACER</p>
      <h2 className="home-context-panel__heading">Typing, at speed.</h2>
      <p className="home-context-panel__description">Typing races and practice on TypeRacer.</p>
      <p className="home-context-panel__detail">Visit the live profile to explore my typing activity.</p>
      <a className="megaracer-context__visit" href={MEGARACER_PROFILE_URL} target="_blank" rel="noopener noreferrer">
        Visit profile <span aria-hidden="true">&#8599;</span>
      </a>
    </div>
  );
}

export default function MegaracerView() {
  const viewportRef = useRef(null);
  const [viewport, setViewport] = useState({ scale: 1, height: 660 });

  useLayoutEffect(() => {
    const frame = viewportRef.current;
    let disposed = false;
    const resize = () => {
      if (disposed) return;
      const { width, height } = frame.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const scale = width / PROFILE_WIDTH;
      const logicalHeight = Math.max(1, Math.round(height / scale));
      setViewport((current) => current.scale === scale && current.height === logicalHeight ? current : { scale, height: logicalHeight });
    };
    resize();
    if (window.ResizeObserver) {
      const observer = new window.ResizeObserver(resize);
      observer.observe(frame);
      return () => { disposed = true; observer.disconnect(); };
    }
    window.addEventListener("resize", resize);
    return () => { disposed = true; window.removeEventListener("resize", resize); };
  }, []);

  return (
    <section id="megaracer-view" className="megaracer-view" aria-label="Megaracer profile">
      <a className="megaracer-view__preview" href={MEGARACER_PROFILE_URL} target="_blank" rel="noopener noreferrer" aria-label="Visit Megaracer / TypeRacer profile">
        <span className="megaracer-view__viewport" ref={viewportRef}>
          <iframe
            className="megaracer-view__iframe"
            src={MEGARACER_PROFILE_URL}
            title="Megaracer / TypeRacer profile preview"
            tabIndex={-1}
            aria-hidden="true"
            loading="lazy"
            scrolling="no"
            style={{ width: `${PROFILE_WIDTH}px`, height: `${viewport.height}px`, transform: `scale(${viewport.scale})` }}
          />
        </span>
      </a>
    </section>
  );
}
