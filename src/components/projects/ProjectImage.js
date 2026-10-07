import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { decodeImage, reportImageFailure } from "./projectImageLoading";

const RevealGroup = createContext(null);

function RevealGroupProvider({ sources, children }) {
  const [settled, setSettled] = useState({});
  const value = useMemo(() => ({
    ready: sources.every((src) => settled[src]),
    settle: (src) => setSettled((previous) => previous[src] ? previous : { ...previous, [src]: true }),
  }), [sources, settled]);
  return <RevealGroup.Provider value={value}>{children}</RevealGroup.Provider>;
}

export function ProjectImageGroup({ sources, children }) {
  return <RevealGroupProvider key={sources.join("|")} sources={sources}>{children}</RevealGroupProvider>;
}

// Keep the image itself in the existing DOM position so scoped/crop styles still apply.
function DecodedProjectImage({
  src, width, height, alt, critical = false, loading = "lazy", className = "", style, ...props
}) {
  const ref = useRef(null);
  const group = useContext(RevealGroup);
  const settleGroup = useRef(group?.settle);
  settleGroup.current = group?.settle;
  const [state, setState] = useState("loading");

  useLayoutEffect(() => {
    const image = ref.current;
    let cancelled = false;
    let generation = 0;
    let pendingSource;
    let decodedSource;
    const finish = (success) => {
      if (cancelled) return;
      setState(success ? "ready" : "error");
      settleGroup.current?.(src);
    };
    const load = async () => {
      const source = image.currentSrc || src;
      if (pendingSource === source || decodedSource === source) return;
      const currentGeneration = ++generation;
      pendingSource = source;
      setState("loading");
      const success = await decodeImage(image);
      if (cancelled || currentGeneration !== generation) return;
      pendingSource = undefined;
      if (success) decodedSource = source;
      if (!success && !cancelled) reportImageFailure(image.currentSrc || src);
      finish(success);
    };
    const error = () => {
      // Cancel a decode in progress too; its resolution must not undo this failure.
      if (cancelled) return;
      generation += 1;
      pendingSource = undefined;
      decodedSource = undefined;
      reportImageFailure(image.currentSrc || src);
      finish(false);
    };
    image.addEventListener("load", load);
    image.addEventListener("error", error);
    if (image.complete) {
      if (image.naturalWidth > 0) load();
      else error();
    }
    return () => {
      cancelled = true;
      image.removeEventListener("load", load);
      image.removeEventListener("error", error);
    };
  }, [src]);

  const visible = state === "ready" && (!group || group.ready);
  return <img
    {...props}
    ref={ref}
    src={src}
    width={width}
    height={height}
    alt={alt}
    loading={critical ? "eager" : loading}
    // React 18 forwards the native lower-case spelling without an unknown-prop warning.
    fetchpriority={critical ? "high" : undefined}
    decoding="async"
    className={`project-image ${className}`.trim()}
    data-image-state={state === "error" ? "error" : visible ? "ready" : "loading"}
    style={{
      aspectRatio: `${width} / ${height}`,
      ...style,
      // Keep descriptive alt text accessible while loading. Clipping also conceals
      // logos whose original keyframes animate opacity independently of this fade.
      clipPath: visible ? style?.clipPath : "inset(50%)",
      visibility: state === "error" ? "hidden" : style?.visibility,
    }}
  />;
}

export default function ProjectImage(props) {
  // A changed URL owns a fresh lifecycle; an old decode can never reveal its replacement.
  return <DecodedProjectImage key={props.src} {...props} />;
}
