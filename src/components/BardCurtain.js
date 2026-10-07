import { useCallback, useEffect, useRef, useState } from "react";

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const openTransforms = ["translateX(-96%)", "translateX(96%)"];
export const bardCurtainTiming = { opening: 3800, closing: 900, safety: 120 };

export function useBardCurtain(isOpen, onClose) {
  const reducedRef = useRef(prefersReducedMotion());
  const [performance, setPerformance] = useState({ phase: isOpen ? (reducedRef.current ? "open" : "opening") : "closed", sequence: 0, from: openTransforms, action: null });
  const current = useRef(performance);
  const overlayRef = useRef(null);
  const timer = useRef(null);
  const closeCallback = useRef(onClose);
  const exitSent = useRef(false);
  closeCallback.current = onClose;

  const cancelTimer = useCallback(() => { clearTimeout(timer.current); timer.current = null; }, []);
  const transition = useCallback((phase, from = openTransforms, action = null) => {
    cancelTimer();
    const next = { phase, from, action, sequence: current.current.sequence + 1 };
    // Update synchronously so consecutive activations cannot start two performances.
    current.current = next;
    setPerformance(next);
  }, [cancelTimer]);

  const closeImmediately = useCallback(() => {
    if (exitSent.current) return;
    exitSent.current = true;
    transition("closed");
    closeCallback.current();
  }, [transition]);

  const finish = useCallback((sequence) => {
    const active = current.current;
    if (active.sequence !== sequence || exitSent.current) return;
    if (active.phase === "exiting") closeImmediately();
    else if (active.phase === "closing") transition("manualClosed");
    else if (active.phase === "opening") transition("open");
  }, [closeImmediately, transition]);

  useEffect(() => {
    exitSent.current = false;
    transition(isOpen ? (reducedRef.current ? "open" : "opening") : "closed");
    return cancelTimer;
  }, [isOpen, transition, cancelTimer]);

  useEffect(() => {
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const change = ({ matches }) => {
      reducedRef.current = matches;
      if (!matches) return;
      if (current.current.phase === "exiting") closeImmediately();
      else if (current.current.phase === "closing") transition("manualClosed");
      else if (current.current.phase === "opening") transition("open");
    };
    preference?.addEventListener?.("change", change);
    return () => preference?.removeEventListener?.("change", change);
  }, [closeImmediately, transition]);

  useEffect(() => {
    const { phase, sequence } = performance;
    if (!isOpen || !["opening", "closing", "exiting"].includes(phase)) return;
    // Animation events are the primary clock; a small safety margin prevents a stuck overlay.
    const duration = (phase === "opening" ? bardCurtainTiming.opening : bardCurtainTiming.closing) + bardCurtainTiming.safety;
    timer.current = setTimeout(() => finish(sequence), duration);
    return cancelTimer;
  }, [performance, isOpen, finish, cancelTimer]);

  const draw = useCallback(() => {
    if (current.current.phase !== "open" || exitSent.current) return;
    transition(reducedRef.current ? "manualClosed" : "closing");
  }, [transition]);

  const raise = useCallback(() => {
    if (current.current.phase !== "manualClosed" || exitSent.current) return;
    transition(reducedRef.current ? "open" : "opening", openTransforms, "raise");
  }, [transition]);

  const close = useCallback(() => {
    const active = current.current;
    if (exitSent.current || active.phase === "exiting") return;
    if (reducedRef.current || active.phase === "manualClosed") {
      closeImmediately();
      return;
    }
    // An interrupted movement closes from the fabric's current position, without a jump.
    const panels = overlayRef.current?.querySelectorAll(".bard-curtain-panel");
    const from = panels?.length ? [...panels].map((panel) => getComputedStyle(panel).transform) : openTransforms;
    transition("exiting", from);
  }, [closeImmediately, transition]);

  return { performance, overlayRef, finish, draw, raise, close, closeImmediately,
    canDraw: performance.phase === "open",
    canRaise: performance.phase === "manualClosed", isManualClosed: performance.phase === "manualClosed",
    isTasselPulling: performance.phase === "closing" || (performance.phase === "opening" && performance.action === "raise"),
  };
}

export default function BardCurtain({ performance, overlayRef, finish }) {
  const { phase, sequence, from } = performance;
  if (phase === "closed") return null;
  const movement = phase === "exiting" ? "closing" : phase;
  const expectedAnimation = movement === "opening" ? "bardCurtainOpenRight" : movement === "closing" ? "bardCurtainCloseRight" : null;
  return (
    <div key={sequence} ref={overlayRef} className="bard-curtain bard-curtain-performance" data-movement={movement} aria-hidden="true" style={{ "--bard-opening-duration": `${bardCurtainTiming.opening}ms`, "--bard-closing-duration": `${bardCurtainTiming.closing}ms` }}>
      <div className="bard-curtain-panel bard-curtain-panel--left" style={{ "--bard-curtain-start": from[0] }} />
      <div className="bard-curtain-panel bard-curtain-panel--right" style={{ "--bard-curtain-start": from[1] }} onAnimationEnd={(event) => {
        if (expectedAnimation && event.target === event.currentTarget && event.animationName === expectedAnimation) finish(sequence);
      }} />
      <div className="bard-proscenium" />
    </div>
  );
}
