import { useLayoutEffect, useRef, useState } from "react";
import { reportImageFailure } from "./projectImageLoading";

// Keep the image itself in the existing DOM position so scoped/crop styles still apply.
function LoadedProjectImage({
  src, width, height, alt, critical = false, loading = "lazy", className = "", style, ...props
}) {
  const ref = useRef(null);
  const [state, setState] = useState("loading");

  useLayoutEffect(() => {
    const image = ref.current;
    const error = () => {
      reportImageFailure(image.currentSrc || src);
      setState("error");
    };
    const load = () => {
      // A successful native load is enough. Waiting for decode() can keep a
      // usable image hidden indefinitely, especially on constrained devices.
      if (image.naturalWidth > 0) setState("ready");
      else error();
    };
    image.addEventListener("load", load);
    image.addEventListener("error", error);
    // Cached images may have fired their load event before the listener existed.
    if (image.complete) load();
    return () => {
      image.removeEventListener("load", load);
      image.removeEventListener("error", error);
    };
  }, [src]);

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
    data-image-state={state}
    style={{
      aspectRatio: `${width} / ${height}`,
      ...style,
      // Opacity handles the loading fade without collapsing lazy-load geometry.
      visibility: state === "error" ? "hidden" : style?.visibility,
    }}
  />;
}

export default function ProjectImage(props) {
  // A changed URL owns a fresh lifecycle; old load events cannot reveal its replacement.
  return <LoadedProjectImage key={props.src} {...props} />;
}
