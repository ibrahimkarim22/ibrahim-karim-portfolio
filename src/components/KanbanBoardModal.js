import { useEffect, useRef, useState } from "react";
import { Modal, ModalHeader, ModalFooter } from "reactstrap";
import kanbanReact from "../images/kanbanReact.png";
import kanbanReactTwo from "../images/kanbanReactTwo.png";
import kanbanJS from "../images/kanbanJS.png";
import kanbanFirebase from "../images/kanbanFirebase.png";
import kanbanFirebaseLogin from "../images/kanbanFirebaseLogin.png";
import kanbanFirestore from "../images/kanbanFirestore.png";
import kanbanSass1 from "../images/kanbanSass1.png";
import kanbanSass2 from "../images/kanbanSass2.png";
import kanbanSass3 from "../images/kanbanSass3.png";
import tuhdoo1 from "../images/tuhdoo1.png";
import tuhdoo2 from "../images/tuhdoo2.png";
import tuhdoo3 from "../images/tuhdoo3.png";
import Copyright from "./Copyright";
import KanbanDemo from "./KanbanDemo";
import TuhDooHeroBoard from "./TuhDooHeroBoard";

const evidence = {
  state: { src: kanbanReactTwo, width: 1169, height: 1443, top: 0, crop: 360, file: "App.jsx", name: "React state and hooks", note: "Separate arrays hold each workflow state." },
  props: { src: kanbanReact, width: 1870, height: 1921, top: 580, crop: 540, file: "App.jsx", name: "React component props", note: "The board receives its tasks and movement handlers." },
  interaction: { src: kanbanJS, width: 1708, height: 1960, top: 80, crop: 670, file: "DroppableArea.jsx", name: "Native drag and drop", note: "Drag data identifies the task; dropping calls the move handler." },
  signup: { src: kanbanFirebase, width: 1876, height: 1951, top: 80, crop: 560, file: "Signup.jsx", name: "Firebase email and password signup", note: "Create an account, then pass its user and username to App." },
  login: { src: kanbanFirebaseLogin, width: 1303, height: 1954, top: 300, crop: 550, file: "Login.jsx", name: "Firebase email and password login", note: "A successful sign-in returns the authenticated user." },
  persistence: { src: kanbanFirestore, width: 1308, height: 1954, top: 720, crop: 680, file: "App.jsx", name: "Firestore saves and state effects", note: "setDoc writes the user's arrays and theme; useEffect triggers saves." },
  accountStyle: { src: kanbanSass1, width: 1449, height: 1953, top: 20, crop: 410, file: "authentication.scss", name: "SCSS account layout", note: "Named Grid areas organize the account view." },
  gridStyle: { src: kanbanSass2, width: 1120, height: 1953, top: 0, crop: 620, file: "droppable.scss", name: "SCSS three-column board grid", note: "One input row. Three task columns." },
  inputStyle: { src: kanbanSass3, width: 1033, height: 1953, top: 150, crop: 530, file: "tasks.scss", name: "SCSS task input styling", note: "Component rules keep task-entry styling together." },
};

function BoardMark() {
  return <span className="td-brand-mark" aria-hidden="true"><span /><span /><span /></span>;
}

function SectionLabel({ number, children }) {
  return <p className="td-section-label"><span className="td-section-number" aria-hidden="true">{number}</span>{children}</p>;
}

function AppCapture({ src, width, height, name, number, label, children }) {
  return (
    <figure className="td-app-capture">
      <div className="td-window-bar" aria-hidden="true"><span className="td-window-dots"><i /><i /><i /></span><span>tuh-doo / {label}</span><span>↗</span></div>
      <img src={src} width={width} height={height} loading="lazy" decoding="async" alt={`Tuh-Doo app: ${name}`} />
      <figcaption><span className="td-capture-number" aria-hidden="true">{number}</span><div><strong>{name}</strong><p>{children}</p></div><a className="td-full-size" href={src} target="_blank" rel="noopener noreferrer" aria-label={`View ${name} at full size (opens in a new tab)`}><span>View full size</span><span aria-hidden="true">↗</span></a></figcaption>
    </figure>
  );
}

function CodeEvidence({ item }) {
  return (
    <figure className="td-code-evidence">
      <div className="td-code-label"><span>{item.file}</span><span aria-hidden="true">SOURCE EXCERPT</span></div>
      <div className="td-code-crop" style={{ aspectRatio: `${item.width} / ${item.crop}` }}>
        <img src={item.src} width={item.width} height={item.height} loading="lazy" decoding="async" alt={`Tuh-Doo implementation: ${item.name}`} style={{ top: `${-item.top / item.crop * 100}%` }} />
      </div>
      <figcaption><div><strong>{item.name}</strong><p>{item.note}</p></div><a className="td-full-size" href={item.src} target="_blank" rel="noopener noreferrer" aria-label={`View ${item.name} at full size (opens in a new tab)`}>View full size <span aria-hidden="true">↗</span></a></figcaption>
    </figure>
  );
}

function TechnicalSpread({ number, label, id, title, reverse = false, children, items }) {
  return (
    <section className={`td-technical-spread${reverse ? " td-technical-spread--reverse" : ""}`} aria-labelledby={id}>
      <div className="td-technical-copy"><SectionLabel number={number}>{label}</SectionLabel><h2 id={id}>{title}</h2>{children}</div>
      <div className={`td-evidence-grid${items.length === 3 ? " td-evidence-grid--three" : ""}`}>{items.map((item) => <CodeEvidence key={item.name} item={item} />)}</div>
    </section>
  );
}

function KanbanPresentation({ closeModal }) {
  const [progress, setProgress] = useState(0);
  const bodyRef = useRef(null);
  const storyRef = useRef(null);
  const readingState = progress >= 99 ? "Complete" : progress > 2 ? "In Progress" : "Backlog";

  function measureProgress() {
    const body = bodyRef.current;
    if (!body) return;
    const distance = body.scrollHeight - body.clientHeight;
    setProgress(body.clientHeight <= 0 ? 0 : distance <= 1 ? 100 : Math.round(Math.min(1, Math.max(0, body.scrollTop / distance)) * 100));
  }

  useEffect(() => {
    measureProgress();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measureProgress) : null;
    if (bodyRef.current) observer?.observe(bodyRef.current);
    if (storyRef.current) observer?.observe(storyRef.current);
    window.addEventListener("resize", measureProgress);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measureProgress); };
  }, []);

  return (
    <>
      <ModalHeader toggle={closeModal} closeAriaLabel="Close project" tag="div" className="kanban-modal-header td-toolbar">
        <div className="td-toolbar-brand"><BoardMark /><span>TUH-DOO</span><span className="td-toolbar-divider" aria-hidden="true" /><span className="td-toolbar-context">Project / Kanban board</span></div>
        <div className={`td-reading-state td-reading-state--${readingState === "Complete" ? "complete" : readingState === "Backlog" ? "backlog" : "progress"}`}><span aria-hidden="true">{readingState === "Complete" ? "✓" : "●"}</span><span>{readingState}</span><span className="td-reading-percent" aria-hidden="true">{progress}%</span></div>
        <div className="td-reading-progress" role="progressbar" aria-label="Case study progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={readingState}><span style={{ width: `${progress}%` }} /></div>
      </ModalHeader>

      <div className="modal-body kanban-modal-main" ref={bodyRef} role="region" aria-label="Tuh-Doo case study" tabIndex={0} onScroll={measureProgress} onLoad={measureProgress}>
        <div className="td-case-study" ref={storyRef}>
          <section className="td-hero" aria-labelledby="td-project-title">
            <div className="td-project-line"><span>A web project by Ibrahim Karim</span><span>PRODUCTIVITY, IN PRACTICE</span></div>
            <div className="td-hero-layout">
              <div className="td-hero-copy">
                <p className="td-eyebrow"><span className="td-brand-square" aria-hidden="true" />MAKE ROOM FOR WHAT’S NEXT.</p>
                <h1 id="td-project-title">TUH-DOO<span className="td-title-period" aria-hidden="true">.</span></h1>
                <p className="td-hero-subtitle">KANBAN BOARD</p>
                <p className="td-hero-statement">A little order.<br />A lot of momentum.</p>
                <p className="td-hero-description">A personal task board built with React. Add a task, move it through your workflow, and keep your progress with Firebase.</p>
                <button type="button" className="td-text-link" aria-controls="td-workflow-title" onClick={() => {
                  const target = bodyRef.current.querySelector("#td-workflow-title");
                  target.scrollIntoView?.({ block: "start", behavior: "auto" });
                  target.focus({ preventScroll: true });
                }}>Try the workflow <span aria-hidden="true">↓</span></button>
              </div>
              <TuhDooHeroBoard />
            </div>
            <dl className="td-project-meta"><div><dt>ROLE</dt><dd>Design & development</dd></div><div><dt>PLATFORM</dt><dd>Web application</dd></div><div><dt>FOCUS</dt><dd>Personal productivity</dd></div></dl>
            <ul className="td-tech-strip" aria-label="Project technology system">
              <li><span>INTERFACE</span><strong>React</strong></li><li><span>LOGIC</span><strong>JavaScript</strong></li><li><span>ACCOUNTS</span><strong>Firebase Auth</strong></li><li><span>DATA</span><strong>Firestore</strong></li><li><span>STYLING</span><strong>Sass / SCSS</strong></li>
            </ul>
          </section>

          <section className="td-workflow" aria-labelledby="td-workflow-title">
            <div className="td-section-heading"><div><SectionLabel number="01">TRY THE WORKFLOW</SectionLabel><h2 id="td-workflow-title" tabIndex={-1}>Good work moves forward.</h2></div><p>Interactive recreation based on the original Tuh-Doo project. Take the workflow for a small spin.</p></div>
            <KanbanDemo />
          </section>

          <section className="td-product" aria-labelledby="td-product-title">
            <div className="td-section-heading"><div><SectionLabel number="02">ORIGINAL PROJECT UI</SectionLabel><h2 id="td-product-title">One board. Your own rhythm.</h2></div><p>The original interface shown below is preserved from the project build.</p></div>
            <ol className="td-product-sequence" aria-label="Original app workflow"><li><span>01</span> Make it yours</li><li><span>02</span> Put work in motion</li><li><span>03</span> Find your focus</li></ol>
            <div className="td-capture-layout">
              <div className="td-capture-account"><AppCapture src={tuhdoo1} width={1915} height={752} number="01" label="your account" name="Signup and login">Email and password accounts connect your saved board to you.</AppCapture></div>
              <div className="td-capture-board"><AppCapture src={tuhdoo2} width={1916} height={943} number="02" label="the board" name="Tasks in the three-column board">Add and delete tasks. Drag them between To Do, In Progress, and Completed, or use the arrow controls.</AppCapture></div>
              <div className="td-capture-theme"><AppCapture src={tuhdoo3} width={1915} height={942} number="03" label="a different view" name="Alternate theme and task states">A theme toggle changes the view. Your tasks and theme preference are saved when you’re signed in.</AppCapture></div>
            </div>
          </section>

          <div className="td-build-divider"><span aria-hidden="true">▦</span><p>BEHIND THE BOARD</p><span className="td-build-divider-line" /><span>Small components. Connected systems.</span></div>

          <TechnicalSpread number="03" label="REACT / STATE MANAGEMENT" id="td-react-title" title={<>A place for<br />every piece.</>} items={[evidence.state, evidence.props]}>
            <p>React functional components and hooks keep the board organized. <code>App.jsx</code> owns the task arrays; <code>useState</code> manages local state and <code>useEffect</code> handles loading and saving.</p>
            <p>Props connect the pieces: <code>Signup.jsx</code> and <code>Login.jsx</code> handle accounts, <code>TaskInput.jsx</code> adds tasks and toggles the theme, and <code>DroppableArea.jsx</code> renders each workflow column.</p>
            <div className="td-technical-note"><span aria-hidden="true">↳</span> One parent. Clear responsibilities.</div>
          </TechnicalSpread>

          <TechnicalSpread number="04" label="JAVASCRIPT / INTERACTION" id="td-interaction-title" title={<>Small moves.<br />Visible progress.</>} reverse items={[evidence.interaction]}>
            <p>The original board uses the native HTML Drag API and custom logic in <code>DroppableArea.jsx</code>. A drop or arrow-button action sends the task to the selected list.</p>
            <p>JavaScript’s <code>map</code>, <code>filter</code>, destructuring, and <code>async/await</code> support task arrays, addition, deletion, and asynchronous data fetching. React updates the interface as state changes.</p>
            <div className="td-technical-note"><span aria-hidden="true">↳</span> Native drag. Button controls. The same next step.</div>
          </TechnicalSpread>

          <section className="td-state-system" aria-labelledby="td-state-title">
            <div className="td-state-system-intro"><p className="td-eyebrow">THE PATH OF A TASK</p><h2 id="td-state-title">Move it. Update it. Keep it.</h2></div>
            <ol className="td-state-path" aria-label="Original task workflow"><li className="td-state-0"><span className="td-state-dot" aria-hidden="true" /><strong>To Do</strong><code>tasks</code></li><li className="td-state-1"><span className="td-state-dot" aria-hidden="true" /><strong>In Progress</strong><code>inProgressTasks</code></li><li className="td-state-2"><span className="td-state-dot" aria-hidden="true" /><strong>Completed</strong><code>completedTasks</code></li></ol>
            <ol className="td-update-path" aria-label="How task state updates propagate"><li><span>01</span><strong>Drop or button</strong><p>Choose the destination.</p></li><li><span>02</span><strong>App.jsx updates arrays</strong><p>Remove from old lists. Add to the target.</p></li><li><span>03</span><strong>React renders the board</strong><p>The task appears in its new column.</p></li><li><span>04</span><strong>Save for the signed-in user</strong><p>useEffect writes the state to Firestore.</p></li></ol>
          </section>

          <TechnicalSpread number="05" label="FIREBASE / AUTHENTICATION" id="td-auth-title" title={<>Your account.<br />Your board.</>} items={[evidence.signup, evidence.login]}>
            <p>Firebase Authentication supports email and password signup and login. <code>Signup.jsx</code> uses <code>createUserWithEmailAndPassword</code>; <code>Login.jsx</code> uses <code>signInWithEmailAndPassword</code>.</p>
            <p>After authentication, the user’s UID connects the account to its Firestore document, so task data can be stored and retrieved for that user.</p>
            <div className="td-technical-note"><span aria-hidden="true">↳</span> An account is the link to your saved work.</div>
          </TechnicalSpread>

          <TechnicalSpread number="06" label="FIRESTORE / PERSISTENCE" id="td-data-title" title={<>Pick up where<br />you left off.</>} reverse items={[evidence.persistence]}>
            <p>Tasks, in-progress items, completed items, the username, and the theme preference live in a Firestore document under the user’s UID.</p>
            <p><code>getDoc</code> restores the board when a user logs in. <code>setDoc</code> saves the data, with a <code>useEffect</code> responding to changes in task state and preferences while the user is signed in.</p>
            <div className="td-data-record"><span>users / user.uid</span><code>tasks · inProgressTasks · completedTasks</code><code>username · isLight</code></div>
          </TechnicalSpread>

          <TechnicalSpread number="07" label="SASS / THE INTERFACE" id="td-styling-title" title={<>Structure you<br />can see.</>} items={[evidence.gridStyle, evidence.accountStyle, evidence.inputStyle]}>
            <p>SCSS groups the interface into component-based styles. Separate stylesheets organize the account view, task input, and droppable board areas.</p>
            <p>The original <code>.droppable-areas-container</code> uses CSS Grid for the task input and three workflow columns. React theme state selects light and dark classes, styled in SCSS.</p>
            <div className="td-technical-note"><span aria-hidden="true">↳</span> A consistent grid. A change of perspective.</div>
          </TechnicalSpread>

          <section className="td-completion" aria-labelledby="td-completion-title"><div className="td-completion-check" aria-hidden="true">✓</div><div><SectionLabel number="08">COMPLETE</SectionLabel><h2 id="td-completion-title">From to-do to done.</h2><p>A React task board with native movement, personal accounts, saved state, and a view that adapts to your preference. One idea, brought into order.</p></div><span className="td-completion-stamp" aria-hidden="true">TASK<br />COMPLETE ↗</span></section>
          <div className="td-copyright"><Copyright /><span>MADE WITH INTENT. MOVED WITH PURPOSE.</span></div>
        </div>
      </div>

      <ModalFooter className="kanban-modal-footer td-footer" role="group" aria-label="Tuh-Doo project actions"><span className="td-footer-caption"><BoardMark />Ideas into action.</span><button type="button" className="td-action td-action--quiet" onClick={closeModal}>Close</button><a className="td-action td-action--primary" href="https://kanbanboardtodolist.web.app/" target="_blank" rel="noopener noreferrer">Open board <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a><a className="td-action" href="https://github.com/ibrahimkarim22/kanbanboard" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a></ModalFooter>
    </>
  );
}

export default function KanbanBoardModal({ isOpen, closeModal }) {
  return <Modal isOpen={isOpen} toggle={closeModal} fullscreen fade={false} trapFocus labelledBy="td-project-title" className="kanban-modal-main-div">{isOpen && <KanbanPresentation closeModal={closeModal} />}</Modal>;
}
