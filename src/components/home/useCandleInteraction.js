import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Click theatre owns no navigation/light state. A new lighting cycle always wins.
export default function useCandleInteraction(candleRef, { theme, cycle, changing, reduced }) {
  const [interaction, setInteraction] = useState(null);
  const [darkHandoff, setDarkHandoff] = useState(false);
  const interactionRef = useRef(null);
  const busy = useRef(false);
  const sequence = useRef(0);
  const timers = useRef([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);
  const cancel = useCallback(() => {
    clearTimers();
    busy.current = false;
    interactionRef.current = null;
    setInteraction(null);
  }, [clearTimers]);

  useLayoutEffect(() => {
    const current = interactionRef.current;
    const wasDark = current?.kind === "surge"
      && (["full", "collapse", "out", "strike", "strike-gap", "strike-again"].includes(current.phase)
        || (current.restarting && ["compress", "burst"].includes(current.phase)));
    // Animation removal can expose its underlying style immediately. Preserve
    // an already-dark flame while the authoritative Home fade takes over.
    setDarkHandoff((previous) => theme === "home" && (wasDark || previous));
    cancel();
  }, [theme, cycle, reduced, cancel]);
  useLayoutEffect(() => {
    if (theme === "home" && !changing) setDarkHandoff(false);
  }, [theme, changing]);
  useEffect(() => clearTimers, [clearTimers]);

  const interactionId = interaction?.id;
  useEffect(() => {
    if (!interactionId) return;
    // A captured viewport origin must never float away from a scrolling candle.
    window.addEventListener("scroll", cancel, { capture: true, passive: true });
    window.addEventListener("resize", cancel);
    return () => {
      window.removeEventListener("scroll", cancel, true);
      window.removeEventListener("resize", cancel);
    };
  }, [interactionId, cancel]);

  function activate() {
    if (!candleRef.current || (busy.current && theme === "home")) return;
    const restarting = busy.current;
    // Regeneration replaces one finite effect and postpones its ending. Old
    // phase timers cannot extinguish or relight the newly regenerated fire.
    if (restarting) clearTimers();
    busy.current = true;
    const bounds = candleRef.current.getBoundingClientRect();
    const compact = window.innerWidth <= 700;
    const kind = theme === "home" ? "spark" : "surge";
    const originY = bounds.top + bounds.height * 81 / 260;
    const nextInteraction = {
      id: ++sequence.current, kind, reduced, compact, restarting,
      phase: kind === "spark" ? "flash" : reduced ? "full" : restarting ? "burst" : "compress",
      originX: bounds.left + bounds.width * 49 / 96,
      originY,
      // Overscan keeps the curling tip at the viewport top during peak fire.
      fireHeight: Math.max(80, originY * 1.1 + 12),
      fireWidth: compact ? Math.max(52, Math.min(70, bounds.width * 1.8))
        : Math.max(96, Math.min(150, bounds.width * 1.55)),
    };
    interactionRef.current = nextInteraction;
    setInteraction(nextInteraction);
    const phaseAt = (ms, phase) => timers.current.push(window.setTimeout(() => {
      const current = interactionRef.current;
      if (!current || current.id !== nextInteraction.id) return;
      const next = { ...current, phase };
      interactionRef.current = next;
      setInteraction(next);
    }, ms));
    if (kind === "spark") phaseAt(reduced ? 100 : 180, "glow");
    else {
      if (!reduced) {
        if (!restarting) phaseAt(120, "burst");
        phaseAt(restarting ? 210 : 330, "full");
        phaseAt(980, "collapse");
      }
      phaseAt(reduced ? 450 : 1600, "out");
      phaseAt(reduced ? 1450 : 2600, "strike");
      phaseAt(reduced ? 1550 : 2780, "strike-gap");
      phaseAt(reduced ? 1690 : 2960, "strike-again");
      phaseAt(reduced ? 1790 : 3140, "relight");
    }
    const duration = kind === "spark" ? (reduced ? 450 : 1600) : (reduced ? 1970 : 3380);
    timers.current.push(window.setTimeout(() => {
      if (interactionRef.current?.id === nextInteraction.id) cancel();
    }, duration));
  }

  return { interaction, activate, darkHandoff };
}
