import ProjectImage from "../projects/ProjectImage";
import { useEffect, useRef, useState } from "react";

export default function WhaleLoop({
  src,
  poster,
  reduced,
  paused,
  onPausedChange,
  onTime,
  seek,
}) {
  const ref = useRef(null);
  const video = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(
    () => !document.hidden,
  );
  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (reduced) return;
    if (!window.IntersectionObserver) {
      setLoaded(true);
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setLoaded(true);
      },
      { threshold: 0.15 },
    );
    observer.observe(ref.current.closest(".tp-timeline") || ref.current);
    return () => observer.disconnect();
  }, [reduced]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let cancelled = false;
    if (visible && documentVisible && !paused && !reduced && !failed) {
      element.play()?.catch((error) => {
        if (!cancelled && error.name !== "AbortError") onPausedChange(true);
      });
    } else element.pause();
    return () => {
      cancelled = true;
    };
  }, [
    visible,
    documentVisible,
    paused,
    reduced,
    loaded,
    failed,
    onPausedChange,
    seek,
  ]);
  function seekVideo() {
    const element = video.current;
    if (element) element.currentTime = seek.time;
    onTime(seek.time);
  }
  useEffect(() => {
    const element = video.current;
    if (element) element.currentTime = seek.time;
    onTime(seek.time);
  }, [seek, loaded, onTime]);
  useEffect(() => {
    const element = video.current;
    if (!element || !visible || !documentVisible || paused || reduced || failed)
      return;
    let decodedFrame;
    let presentationFrame;
    let cancelled = false;
    const decodedFrames =
      typeof element.requestVideoFrameCallback === "function";
    function sample() {
      // Seek events and decoded metadata can describe different instants.
      // Every update reads the same live media clock so an older decoded
      // timestamp can never pull the marker back after a seek or loop.
      if (!cancelled && !element.paused && element.readyState >= 2)
        onTime(element.currentTime);
    }
    function present() {
      if (cancelled) return;
      sample();
      presentationFrame = requestAnimationFrame(present);
    }
    function decoded() {
      if (cancelled) return;
      sample();
      decodedFrame = element.requestVideoFrameCallback(decoded);
    }
    // The presentation chain follows currentTime between the video's 24fps
    // frames and keeps running if a browser drops its one-shot frame callback.
    // Both callbacks share sample(); neither accumulates its own elapsed time.
    presentationFrame = requestAnimationFrame(present);
    if (decodedFrames)
      decodedFrame = element.requestVideoFrameCallback(decoded);
    return () => {
      cancelled = true;
      cancelAnimationFrame(presentationFrame);
      if (decodedFrames) element.cancelVideoFrameCallback(decodedFrame);
    };
  }, [visible, documentVisible, paused, reduced, loaded, failed, onTime, seek]);
  return (
    <figure className="tp-whale-media" ref={ref}>
      <div className="tp-media-mount">
        {reduced || failed ? (
          <ProjectImage
            src={poster}
            width="1139"
            height="580"
            alt="HeyYou whale above the moonlit deployment ocean"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <video
            ref={video}
            src={loaded ? src : undefined}
            poster={poster}
            width="800"
            height="408"
            muted
            loop
            playsInline
            autoPlay={visible && documentVisible && !paused}
            preload="none"
            aria-label="Actual HeyYou whale animation"
            aria-describedby="tp-whale-caption"
            onLoadedMetadata={seekVideo}
            onSeeked={(event) => onTime(event.currentTarget.currentTime)}
            onPause={(event) => onTime(event.currentTarget.currentTime)}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <figcaption id="tp-whale-caption">
        <span>
          Actual HeyYou /{" "}
          {reduced || failed ? "still frame" : "18s source cycle"}
        </span>
        <a
          href={reduced || failed ? poster : src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View HeyYou whale motion study at full size (opens in a new tab)"
        >
          View full size ↗
        </a>
      </figcaption>
      {!reduced && !failed && (
        <button
          className="tp-loop-control"
          type="button"
          onClick={() => onPausedChange(!paused)}
        >
          {paused ? "Play whale loop" : "Pause whale loop"}
        </button>
      )}
    </figure>
  );
}
