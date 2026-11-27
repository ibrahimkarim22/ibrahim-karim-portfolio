import { useEffect, useId, useRef, useState } from "react";

const mediaRoot = `${process.env.PUBLIC_URL}/media/bard`;
const motionQuery = "(prefers-reduced-motion: reduce)";
const visibleFraction = 0.4;

function BardScreen({ scene, stageOpen, descriptionId }) {
  const videoRef = useRef(null);
  const intent = useRef("auto");
  const syncPlayback = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const poster = `${mediaRoot}/${scene.id}.jpg`;
  const canObserve = typeof window.IntersectionObserver === "function";

  useEffect(() => {
    if (!canObserve || failed) return;
    const video = videoRef.current;
    const preference = window.matchMedia?.(motionQuery);
    let visible = false;
    let active = true;

    function updatePlayback() {
      if (!active) return;
      const wantsMotion = intent.current === "play" || (intent.current === "auto" && !preference?.matches);
      if (stageOpen && visible && !document.hidden && wantsMotion) {
        if (video.paused) {
          // A denied autoplay attempt leaves the poster and allows a tap to retry.
          video.play()?.catch(() => {});
        }
      } else if (!video.paused) {
        video.pause();
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= visibleFraction;
      updatePlayback();
    }, { root: video.closest(".bard-modal-body-main"), threshold: visibleFraction });

    function preferenceChanged() {
      if (preference.matches && intent.current === "play") intent.current = "auto";
      updatePlayback();
    }

    syncPlayback.current = updatePlayback;
    observer.observe(video);
    preference?.addEventListener?.("change", preferenceChanged);
    document.addEventListener("visibilitychange", updatePlayback);
    return () => {
      active = false;
      syncPlayback.current = null;
      observer.disconnect();
      preference?.removeEventListener?.("change", preferenceChanged);
      document.removeEventListener("visibilitychange", updatePlayback);
      if (!video.paused) video.pause();
    };
  }, [canObserve, failed, stageOpen]);

  function togglePlayback() {
    intent.current = videoRef.current.paused ? "play" : "pause";
    syncPlayback.current?.();
  }

  if (failed) {
    return <div className="bard-glass">
      <img src={poster} width="648" height="1440" alt={scene.caption} aria-describedby={descriptionId} />
    </div>;
  }

  return (
    <button type="button" className="bard-glass bard-screen-toggle" onClick={togglePlayback}
      disabled={!stageOpen || !canObserve} aria-label={`${playing ? "Pause" : "Play"} ${scene.label} recording`}
      aria-describedby={descriptionId}>
      <video ref={videoRef} src={`${mediaRoot}/${scene.id}.mp4`} poster={poster} muted playsInline loop disablePictureInPicture preload="none"
        width="648" height="1440" aria-label={scene.caption} aria-describedby={descriptionId}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} />
    </button>
  );
}

export function BardDevice({ scene, stageOpen, descriptionId }) {
  return (
    <figure className="bard-device">
      <div className="bard-device-stage">
        <div className="bard-handset">
          <span className="bard-handset-keys" aria-hidden="true" />
          <BardScreen key={scene.id} scene={scene} stageOpen={stageOpen} descriptionId={descriptionId} />
        </div>
      </div>
      <figcaption><span>{scene.caption}</span></figcaption>
    </figure>
  );
}

export default function BardShowcase({ scene, stageOpen, children }) {
  const descriptionId = useId();
  return (
    <div className="bard-showcase">
      <div className="bard-showcase-copy">
        {children}
        <p className="bard-scene-description" id={descriptionId}>{scene.description}</p>
      </div>
      <BardDevice scene={scene} stageOpen={stageOpen} descriptionId={descriptionId} />
    </div>
  );
}
