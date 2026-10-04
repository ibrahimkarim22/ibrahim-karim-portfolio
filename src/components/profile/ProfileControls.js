import { useEffect, useId, useRef, useState } from "react";

const COMPACT_CONTROLS_QUERY = "(max-width: 1250px), (pointer: coarse), (max-height: 500px)";
const TOUCH_INPUT_QUERY = "(pointer: coarse)";

export default function ProfileControls({ onReset, ready }) {
  const [compact, setCompact] = useState(() => window.matchMedia?.(COMPACT_CONTROLS_QUERY).matches ?? false);
  const [touchInput, setTouchInput] = useState(() => window.matchMedia?.(TOUCH_INPUT_QUERY).matches ?? false);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    const media = window.matchMedia?.(COMPACT_CONTROLS_QUERY);
    if (!media) return;
    setCompact(media.matches);
    const update = (event) => { setCompact(event.matches); setIsOpen(false); };
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener?.(update);
    return () => media.removeListener?.(update);
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.(TOUCH_INPUT_QUERY);
    if (!media) return;
    setTouchInput(media.matches);
    const update = (event) => setTouchInput(event.matches);
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener?.(update);
    return () => media.removeListener?.(update);
  }, []);

  useEffect(() => {
    if (compact && isOpen) closeRef.current?.focus();
  }, [compact, isOpen]);

  function closeControls() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  const gestures = touchInput
    ? [["Drag", "Rotate"], ["Pinch", "Zoom"], ["Two-finger drag", "Pan"]]
    : [["Drag", "Rotate"], ["Right-drag", "Pan"], ["Scroll", "Zoom"]];

  return (
    <div
      className={`profile-controls${compact ? " profile-controls--compact" : ""}`}
      onKeyDown={(event) => {
        if (compact && isOpen && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeControls();
        }
      }}
    >
      {compact && (
        <button type="button" className="profile-controls__trigger" ref={triggerRef}
          aria-expanded={isOpen} aria-controls={panelId}
          onClick={() => isOpen ? closeControls() : setIsOpen(true)}>
          Controls
        </button>
      )}
      {(!compact || isOpen) && (
        <section className="profile-controls__panel" id={panelId} aria-label="3D controls">
          <div className="profile-controls__heading">
            <p>NAVIGATE</p>
            {compact && (
              <button type="button" className="profile-controls__close" ref={closeRef}
                aria-label="Close controls" onClick={closeControls}>
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
          <dl className="profile-controls__gestures">
            {gestures.map(([gesture, action]) => (
              <div key={gesture}><dt>{gesture}</dt><dd>{action}</dd></div>
            ))}
          </dl>
          <button type="button" className="profile-controls__reset" disabled={!ready} onClick={onReset}>
            Reset View
          </button>
        </section>
      )}
    </div>
  );
}
