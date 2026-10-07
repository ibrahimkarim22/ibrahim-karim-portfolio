import ProjectImage from "./projects/ProjectImage";
import { useRef } from "react";
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

function SectionLabel({ number, children }) {
  return <p className="td-section-label"><span className="td-section-number" aria-hidden="true">{number}</span>{children}</p>;
}

function AppCapture({ src, width, height, name, number, children }) {
  return (
    <figure className="td-app-capture">
      <ProjectImage src={src} width={width} height={height} loading="lazy" decoding="async" alt={`Tuh-Doo app: ${name}`} />
      <figcaption><span className="td-capture-number" aria-hidden="true">{number}</span><div><strong>{name}</strong><p>{children}</p></div><a className="td-full-size" href={src} target="_blank" rel="noopener noreferrer" aria-label={`View ${name} at full size (opens in a new tab)`}><span>View full size</span><span aria-hidden="true">↗</span></a></figcaption>
    </figure>
  );
}

function CodeEvidence({ item }) {
  return (
    <figure className="td-code-evidence">
      <div className="td-code-label">{item.file}</div>
      <div className="td-code-crop" style={{ aspectRatio: `${item.width} / ${item.crop}` }}>
        <ProjectImage src={item.src} width={item.width} height={item.height} loading="lazy" decoding="async" alt={`Tuh-Doo implementation: ${item.name}`} style={{ top: `${-item.top / item.crop * 100}%` }} />
      </div>
      <figcaption><div><strong>{item.name}</strong><p>{item.note}</p></div><a className="td-full-size" href={item.src} target="_blank" rel="noopener noreferrer" aria-label={`View ${item.name} at full size (opens in a new tab)`}>View full size <span aria-hidden="true">↗</span></a></figcaption>
    </figure>
  );
}

function TechnicalSpread({ label, id, title, reverse = false, children, items }) {
  return (
    <section className={`td-technical-spread${reverse ? " td-technical-spread--reverse" : ""}`} aria-labelledby={id}>
      <div className="td-technical-copy"><p className="td-eyebrow">{label}</p><h2 id={id}>{title}</h2>{children}</div>
      <div className={`td-evidence-grid${items.length === 3 ? " td-evidence-grid--three" : ""}`}>{items.map((item) => <CodeEvidence key={item.name} item={item} />)}</div>
    </section>
  );
}

function KanbanPresentation({ closeModal }) {
  const bodyRef = useRef(null);

  return (
    <>
      <ModalHeader toggle={closeModal} closeAriaLabel="Close project" tag="div" className="kanban-modal-header td-toolbar">
        <span className="td-toolbar-index">Portfolio / 05</span>
        <span className="td-toolbar-context">A personal productivity project</span>
      </ModalHeader>

      <div className="modal-body kanban-modal-main" ref={bodyRef} role="region" aria-label="Tuh-Doo case study" tabIndex={0}>
        <article className="td-case-study" aria-labelledby="td-project-title">
          <section className="td-hero" aria-labelledby="td-project-title">
            <div className="td-hero-layout">
              <div className="td-hero-copy">
                <p className="td-eyebrow">05 <span aria-hidden="true">—</span> PERSONAL PROJECT</p>
                <h1 id="td-project-title">TUH-DOO<span className="td-title-period" aria-hidden="true">.</span></h1>
                <p className="td-hero-subtitle">KANBAN BOARD</p>
                <p className="td-hero-statement">A little order.<br />A lot of momentum.</p>
                <p className="td-hero-description">A personal task board built with React. Add a task, move it through your workflow, and keep your progress organized with Firebase.</p>
                <div className="td-hero-actions" role="group" aria-label="Open the Tuh-Doo project">
                  <a className="td-action td-action--primary" href="https://kanbanboardtodolist.web.app/" target="_blank" rel="noopener noreferrer">Open board <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
                  <a className="td-action" href="https://github.com/ibrahimkarim22/kanbanboard" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
                </div>
                <button type="button" className="td-text-link" aria-controls="td-workflow-title" onClick={() => {
                  const target = bodyRef.current?.querySelector("#td-workflow-title");
                  if (!target) return;
                  target.scrollIntoView?.({ block: "start", behavior: "auto" });
                  target.focus({ preventScroll: true });
                }}>Try the workflow <span aria-hidden="true">↓</span></button>
              </div>
              <TuhDooHeroBoard />
            </div>
            <dl className="td-project-meta">
              <div><dt>ROLE</dt><dd>Design &amp; development</dd></div>
              <div><dt>BUILT WITH</dt><dd>React · JavaScript · Firebase Authentication · Firestore · Sass / SCSS</dd></div>
              <div><dt>FOCUS</dt><dd>Personal productivity · Kanban workflow · Drag &amp; drop</dd></div>
            </dl>
          </section>

          <section className="td-idea" aria-labelledby="td-idea-title">
            <div><SectionLabel number="01">THE IDEA</SectionLabel><h2 id="td-idea-title">Make room for<br />what matters.</h2></div>
            <div className="td-idea-copy"><p>A simple personal Kanban board for getting tasks out of your head and into motion. A place for what comes next, what you’re working on, and what you’ve finished.</p><p>The original app pairs that everyday workflow with personal accounts and saved tasks. Sign in, organize your work, and pick it up again when you’re ready.</p></div>
          </section>

          <section className="td-how-it-works" aria-labelledby="td-how-title">
            <SectionLabel number="02">HOW IT WORKS</SectionLabel>
            <h2 id="td-how-title">Create. Move. Finish.</h2>
            <ol className="td-how-steps">
              <li><span aria-hidden="true">01</span><h3>Create</h3><p>Add what you need to do. Give the next small step a place on the board.</p></li>
              <li><span aria-hidden="true">02</span><h3>Move</h3><p>Drag a task or use its arrow controls as your work progresses.</p></li>
              <li><span aria-hidden="true">03</span><h3>Finish</h3><p>Keep completed work visible, with room to see what you’ve accomplished.</p></li>
            </ol>
          </section>

          <section className="td-workflow" aria-labelledby="td-workflow-title">
            <div className="td-section-heading"><div><SectionLabel number="03">TRY THE WORKFLOW</SectionLabel><h2 id="td-workflow-title" tabIndex={-1}>Good work moves forward.</h2></div><p>Move a few sample tasks through the board below. Open the full project to create tasks and save your own work.</p></div>
            <KanbanDemo />
          </section>

          <section className="td-product" aria-labelledby="td-product-title">
            <div className="td-section-heading"><div><SectionLabel number="04">THE ORIGINAL APP</SectionLabel><h2 id="td-product-title">One board. Your own rhythm.</h2></div><p>Original project captures: personal accounts, task movement, and a choice of theme.</p></div>
            <div className="td-capture-layout">
              <div className="td-capture-account"><AppCapture src={tuhdoo1} width={1915} height={752} number="01" name="Signup and login">Email and password accounts connect your saved board to you.</AppCapture></div>
              <div className="td-capture-board"><AppCapture src={tuhdoo2} width={1916} height={943} number="02" name="Tasks in the three-column board">Add and delete tasks. Drag them between To Do, In Progress, and Completed, or use the arrow controls.</AppCapture></div>
              <div className="td-capture-theme"><AppCapture src={tuhdoo3} width={1915} height={942} number="03" name="Alternate theme and task states">A theme toggle changes the view. Your tasks and theme preference are saved when you’re signed in.</AppCapture></div>
            </div>
          </section>

          <section className="td-built-with" aria-labelledby="td-built-title"><SectionLabel number="05">BUILT WITH</SectionLabel><h2 id="td-built-title">Small pieces.<br />One thoughtful board.</h2><p className="td-technology-list">React · JavaScript · Firebase Authentication · Firestore · Sass / SCSS</p></section>

          <TechnicalSpread label="REACT / STATE MANAGEMENT" id="td-react-title" title={<>A place for<br />every piece.</>} items={[evidence.state, evidence.props]}>
            <p>React functional components and hooks keep the board organized. <code>App.jsx</code> owns the task arrays; <code>useState</code> manages local state and <code>useEffect</code> handles loading and saving.</p>
            <p>Props connect the pieces: <code>Signup.jsx</code> and <code>Login.jsx</code> handle accounts, <code>TaskInput.jsx</code> adds tasks and toggles the theme, and <code>DroppableArea.jsx</code> renders each workflow column.</p>
          </TechnicalSpread>

          <TechnicalSpread label="JAVASCRIPT / INTERACTION" id="td-interaction-title" title={<>Small moves.<br />Visible progress.</>} reverse items={[evidence.interaction]}>
            <p>The original board uses the native HTML Drag API and custom logic in <code>DroppableArea.jsx</code>. A drop or arrow-button action sends the task to the selected list.</p>
            <p>JavaScript’s <code>map</code>, <code>filter</code>, destructuring, and <code>async/await</code> support task arrays, addition, deletion, and asynchronous data fetching. React updates the interface as state changes.</p>
          </TechnicalSpread>

          <TechnicalSpread label="FIREBASE / AUTHENTICATION" id="td-auth-title" title={<>Your account.<br />Your board.</>} items={[evidence.signup, evidence.login]}>
            <p>Firebase Authentication supports email and password signup and login. <code>Signup.jsx</code> uses <code>createUserWithEmailAndPassword</code>; <code>Login.jsx</code> uses <code>signInWithEmailAndPassword</code>.</p>
            <p>After authentication, the user’s UID connects the account to its Firestore document, so task data can be stored and retrieved for that user.</p>
          </TechnicalSpread>

          <TechnicalSpread label="FIRESTORE / PERSISTENCE" id="td-data-title" title={<>Pick up where<br />you left off.</>} reverse items={[evidence.persistence]}>
            <p>Tasks, in-progress items, completed items, the username, and the theme preference live in a Firestore document under the user’s UID.</p>
            <p><code>getDoc</code> restores the board when a user logs in. <code>setDoc</code> saves the data, with a <code>useEffect</code> responding to changes in task state and preferences while the user is signed in.</p>
          </TechnicalSpread>

          <TechnicalSpread label="SASS / THE INTERFACE" id="td-styling-title" title={<>Structure you<br />can see.</>} items={[evidence.gridStyle, evidence.accountStyle, evidence.inputStyle]}>
            <p>SCSS groups the interface into component-based styles. Separate stylesheets organize the account view, task input, and droppable board areas.</p>
            <p>The original <code>.droppable-areas-container</code> uses CSS Grid for the task input and three workflow columns. React theme state selects light and dark classes, styled in SCSS.</p>
          </TechnicalSpread>

          <section className="td-completion" aria-labelledby="td-completion-title"><SectionLabel number="06">FROM TO-DO TO DONE</SectionLabel><h2 id="td-completion-title">A little more room.<br />A little more momentum.</h2><p>A personal React project by Ibrahim Karim. Built to make the next step clear, and keep good work moving.</p></section>
          <div className="td-copyright"><Copyright /></div>
        </article>
      </div>

      <ModalFooter className="kanban-modal-footer td-footer" role="group" aria-label="Tuh-Doo project actions"><span className="td-footer-caption">Designed &amp; developed by Ibrahim Karim</span><a className="td-action td-action--primary" href="https://kanbanboardtodolist.web.app/" target="_blank" rel="noopener noreferrer">Open board <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a><a className="td-action" href="https://github.com/ibrahimkarim22/kanbanboard" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a></ModalFooter>
    </>
  );
}

export default function KanbanBoardModal({ isOpen, closeModal }) {
  return <Modal isOpen={isOpen} toggle={closeModal} fullscreen fade={false} trapFocus labelledBy="td-project-title" className="kanban-modal-main-div">{isOpen && <KanbanPresentation closeModal={closeModal} />}</Modal>;
}
