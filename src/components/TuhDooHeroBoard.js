import { useEffect, useRef, useState } from "react";

const initialCards = [
  { key: "outline", id: "TD-01", title: "Outline the idea", detail: "Start with a clear purpose.", column: 0, row: 0, visible: true },
  { key: "sketch", id: "TD-02", title: "Sketch the layout", detail: "Make room for the next step.", column: 0, row: 1, visible: true },
  { key: "build", id: "TD-03", title: "Build the board", detail: "Put the pieces together.", column: 1, row: 0, visible: true },
  { key: "test", id: "TD-04", title: "Test the flow", detail: "Give every state a little attention.", column: 2, row: 1, visible: true },
  { key: "ship", id: "TD-05", title: "Ship something good", detail: "One more thing, done.", column: 2, row: 0, visible: true },
];
const initialBoard = { cards: initialCards, step: 0, nextId: 6, phase: "organized" };
const nextTitles = ["Plan the next step", "Refine the details", "Review the next idea", "Sketch a new approach"];
const nextDetails = ["Choose one thing to move forward.", "Give the small decisions some care.", "Make space for a fresh direction.", "Find a clearer way through the work."];
const columns = ["Backlog", "In Progress", "Complete"];
const statusMarks = ["○", "◐", "●"];
const ambientDelay = 3200;

function advanceBoard(board) {
  const step = board.step % 4;
  const phases = ["archive", "progress", "complete", "backlog"];
  const cards = board.cards.map((card) => {
    if (step === 0 && card.column === 2 && card.row === 1) return { ...card, visible: false };
    if (step === 1 && card.column === 0 && card.row === 1) return { ...card, column: 1 };
    if (step === 2 && card.column === 1 && card.row === 1) return { ...card, column: 2 };
    if (step === 3 && !card.visible) return { ...card, column: 0, visible: true, id: `TD-${String(board.nextId).padStart(2, "0")}`, title: nextTitles[(board.nextId - 6) % nextTitles.length], detail: nextDetails[(board.nextId - 6) % nextDetails.length] };
    return card;
  });
  return { cards, step: board.step + 1, nextId: board.nextId + (step === 3 ? 1 : 0), phase: phases[step] };
}

export default function TuhDooHeroBoard() {
  const [opened, setOpened] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false);
  const [board, setBoard] = useState(initialBoard);
  const boardRef = useRef(null);
  const finishOpeningRef = useRef(null);

  useEffect(() => {
    const root = boardRef.current;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let reduced = media?.matches || false;
    let settled = reduced;
    let visible = false;
    let timer = null;
    let openingTimer = null;
    let remaining = ambientDelay;
    let deadline = 0;

    function pause() {
      if (timer !== null) {
        remaining = Math.max(0, deadline - Date.now());
        window.clearTimeout(timer);
        timer = null;
      }
      root.dataset.ambientRunning = "false";
    }

    function synchronize() {
      pause();
      if (!settled || reduced || !visible || document.hidden) return;
      root.dataset.ambientRunning = "true";
      deadline = Date.now() + remaining;
      timer = window.setTimeout(() => {
        timer = null;
        remaining = ambientDelay;
        setBoard(advanceBoard);
        synchronize();
      }, remaining);
    }

    function finishOpening() {
      if (settled) return;
      settled = true;
      window.clearTimeout(openingTimer);
      openingTimer = null;
      setOpened(true);
      synchronize();
    }
    finishOpeningRef.current = finishOpening;
    if (!reduced) openingTimer = window.setTimeout(finishOpening, 2700);

    const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.25;
      synchronize();
    }, { threshold: [0, 0.25] }) : null;
    observer?.observe(root);

    function changePreference(event) {
      reduced = event.matches;
      if (reduced) {
        finishOpening();
        setBoard(initialBoard);
        remaining = ambientDelay;
      }
      synchronize();
    }
    if (media?.addEventListener) media.addEventListener("change", changePreference);
    else media?.addListener?.(changePreference);
    document.addEventListener("visibilitychange", synchronize);

    return () => {
      pause();
      window.clearTimeout(openingTimer);
      observer?.disconnect();
      if (media?.removeEventListener) media.removeEventListener("change", changePreference);
      else media?.removeListener?.(changePreference);
      document.removeEventListener("visibilitychange", synchronize);
      finishOpeningRef.current = null;
    };
  }, []);

  return (
    <div ref={boardRef} className={`td-opening${opened ? " td-hero-ambient" : ""}`} role="img" aria-label="Illustrated task workflow: cards organize into Backlog, In Progress and Complete, then work moves forward one task at a time."
      data-ambient-phase={opened ? board.phase : "opening"} onAnimationEnd={(event) => { if (event.animationName === "td-card-sort") finishOpeningRef.current?.(); }}>
      <div className="td-opening-top" aria-hidden="true"><span>THE DAILY BOARD</span><span className="td-opening-caption">A place for every next step.</span></div>
      <div className="td-sort-board" aria-hidden="true">
        {columns.map((label, index) => <div key={label} className={`td-sort-column td-state-${index}`}><span className="td-state-dot">{statusMarks[index]}</span>{label}<span className="td-sort-column-line" /></div>)}
        {board.cards.map((card, index) => (
          <div key={card.key} data-hero-column={card.column} data-hero-visible={card.visible}
            className={`td-sort-card td-sort-card-${index + 1}${!card.visible ? " td-sort-card--retired" : ""}${opened && board.phase === "backlog" && card.id === `TD-${String(board.nextId - 1).padStart(2, "0")}` ? " td-sort-card--fresh" : ""}`}
            style={opened ? { "--td-final-x": `calc((var(--td-slot) + var(--td-sort-gap)) * ${card.column})`, "--td-final-y": card.row === 0 ? "var(--td-row-one)" : "var(--td-row-two)" } : undefined}>
            <span className="td-sort-id">{card.id.replace("TD-", "")}</span>
            <strong>{card.title}</strong>
            <p className="td-sort-detail">{card.detail}</p>
            <span className="td-sort-status"><span>{statusMarks[card.column]}</span> {columns[card.column]}</span>
          </div>
        ))}
      </div>
      <div className="td-opening-bottom" aria-hidden="true"><span className="td-sort-result">A LITTLE MORE ORGANIZED.</span><span>{String(board.cards.filter((card) => card.visible).length).padStart(2, "0")} TASKS / 03 STATES</span></div>
    </div>
  );
}
