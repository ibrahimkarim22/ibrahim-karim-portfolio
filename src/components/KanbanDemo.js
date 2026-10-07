import { useLayoutEffect, useRef, useState } from "react";

const columns = ["Backlog", "In Progress", "Complete"];
const statusMarks = ["○", "◐", "●"];
const initialTasks = [
  { id: "TD-01", title: "Outline the idea", detail: "Start with a clear purpose", column: 0 },
  { id: "TD-02", title: "Sketch the layout", detail: "Make room for the next step", column: 0 },
  { id: "TD-03", title: "Build the board", detail: "Put the pieces together", column: 1 },
  { id: "TD-04", title: "Test the flow", detail: "Give every state a little attention", column: 1 },
  { id: "TD-05", title: "Ship something good", detail: "One more thing, done", column: 2 },
];
const dragType = "application/x-tuhdoo-task";

export default function KanbanDemo() {
  const [tasks, setTasks] = useState(initialTasks);
  const [announcement, setAnnouncement] = useState("");
  const [dropColumn, setDropColumn] = useState(null);
  const [dragged, setDragged] = useState(null);
  const [focusRequest, setFocusRequest] = useState(null);
  const activeDrag = useRef(null);
  const cardRefs = useRef({});
  const completed = tasks.filter((task) => task.column === 2).length;

  useLayoutEffect(() => {
    if (!focusRequest) return;
    const card = cardRefs.current[focusRequest.id];
    const button = card?.querySelector(`[data-direction="${focusRequest.direction}"]`) || card?.querySelector("button");
    button?.focus({ preventScroll: true });
    card?.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "auto" });
  }, [focusRequest]);

  function moveTask(id, destination, direction = null) {
    const task = tasks.find((item) => item.id === id);
    if (!task || destination < 0 || destination > 2 || task.column === destination) return;
    const updated = tasks.map((item) => item.id === id ? { ...item, column: destination } : item);
    setTasks(updated);
    setAnnouncement(destination === 2
      ? `${task.title} completed. ${updated.filter((item) => item.column === 2).length} of 5 tasks complete.`
      : `${task.title} moved to ${columns[destination]}.`);
    if (direction) setFocusRequest({ id, direction });
  }

  function endDrag() {
    activeDrag.current = null;
    setDragged(null);
    setDropColumn(null);
  }

  function reset() {
    setTasks(initialTasks);
    setFocusRequest(null);
    endDrag();
    setAnnouncement("Board reset. Five sample tasks are back in their original columns.");
  }

  return (
    <section className="td-demo" aria-label="Interactive sample board" aria-describedby="td-demo-instructions">
      <div className="td-demo-toolbar">
        <div><strong>A little momentum</strong><span className="td-demo-label">Portfolio recreation</span></div>
        <button className="td-reset" type="button" onClick={reset}><span aria-hidden="true">↺</span> Reset board</button>
      </div>
      <p id="td-demo-instructions" className="td-demo-instructions">Drag a card, or use its arrow buttons to move it. Five sample tasks. A fresh start every time.</p>
      <div className="td-board-scroll" role="region" aria-label="Sample board columns" tabIndex={0}>
        <div className="td-demo-columns">
          {columns.map((name, index) => (
            <section key={name} aria-label={name} className={`td-column td-state-${index}${dropColumn === index ? " td-column--target" : ""}`}
              onDragOver={(event) => {
                if (!activeDrag.current) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDropColumn(index);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setDropColumn(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData(dragType);
                if (id && activeDrag.current === id) moveTask(id, index);
                endDrag();
              }}>
              <div className="td-column-heading"><h3><span className="td-state-dot" aria-hidden="true">{statusMarks[index]}</span>{name}</h3><span className="td-column-count" aria-label={`${tasks.filter((task) => task.column === index).length} tasks`}>{tasks.filter((task) => task.column === index).length}</span></div>
              <ul className="td-task-list">
                {tasks.filter((task) => task.column === index).map((task) => (
                  <li key={task.id} aria-label={task.title} draggable
                    ref={(element) => { cardRefs.current[task.id] = element; }}
                    className={`td-task${index === 2 ? " td-task--complete" : ""}${dragged === task.id ? " td-task--dragging" : ""}`}
                    onDragStart={(event) => {
                      activeDrag.current = task.id;
                      event.dataTransfer.setData(dragType, task.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDragged(task.id);
                    }} onDragEnd={endDrag}>
                    <div className="td-task-topline"><span>{task.id.replace("TD-", "")}</span><span className="td-task-grip" aria-hidden="true">⠿</span></div>
                    <p className="td-task-title">{task.title}</p>
                    <p className="td-task-detail">{task.detail}</p>
                    <div className="td-task-bottomline"><span className="td-task-state"><span aria-hidden="true">{statusMarks[index]}</span> {name}</span><div className="td-task-controls">
                      {index > 0 && <button type="button" data-direction="left" aria-label={`Move ${task.title} to ${columns[index - 1]}`} onClick={() => moveTask(task.id, index - 1, "left")}><span className="td-task-arrow-desktop" aria-hidden="true">←</span></button>}
                      {index < 2 && <button type="button" data-direction="right" aria-label={`Move ${task.title} to ${columns[index + 1]}`} onClick={() => moveTask(task.id, index + 1, "right")}><span className="td-task-arrow-desktop" aria-hidden="true">→</span></button>}
                    </div></div>
                  </li>
                ))}
              </ul>
              {tasks.every((task) => task.column !== index) && <p className="td-column-empty">A little breathing room.<br />Move a card here.</p>}
            </section>
          ))}
        </div>
      </div>
      <div className="td-demo-bottom"><span>{completed} of 5 complete</span><span className="td-demo-footnote">Small moves. Clear progress.</span></div>
      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </section>
  );
}
