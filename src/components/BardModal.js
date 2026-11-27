import ProjectImage from "./projects/ProjectImage";
import { useEffect, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import folgerSlice from "../images/folgerSlice.png";
import mitSlice from "../images/mitSlice.png";
import BardShowcase, { BardDevice } from "./BardShowcase";
import Copyright from "./Copyright";
import BardCurtain, { useBardCurtain } from "./BardCurtain";

const apkUrl = "https://drive.google.com/file/d/1kblapPn0vab5BiiJwcaMAioJ5yW14cCf/view?usp=drive_link";
const githubUrl = "https://github.com/ibrahim-karim-22/reactNativePortfolioProject";
const readerScene = {
  id: "reader", label: "Full plays", caption: "Setting the page in As You Like It",
  description: "Move between acts and scenes in the complete text. Adjust the typeface, spacing, and reading theme to suit the page.",
};
const highlightsScene = {
  id: "highlights", label: "My Highlights", caption: "Marking and revisiting a passage",
  description: "Select a passage and choose a highlight color. Bard checks the selection against the play text before saving it. Open My Highlights to return to that line in its original scene.",
};
const synopsesScene = {
  id: "synopses", label: "Synopses", caption: "Browsing the Hamlet synopsis",
  description: "Choose a play for a short overview. Read the full story in one sitting, or open an act at a time to follow the plot alongside the script.",
};

const learningScenes = [
  {
    id: "quiz", label: "Quiz feedback", caption: "The passage behind an answer",
    description: "Answer a question, review the feedback, and open the passage that explains it.",
  },
  {
    id: "medals", label: "Quiz completion", caption: "From the final answer to the next play",
    description: "Finish Romeo and Juliet, see the confetti, and visit the medal collection. Back on the course page, Twelfth Night unlocks.",
  },
];

const accountScene = {
  id: "account", label: "Account entry", caption: "From the welcome screen to account creation",
  description: "The curtain opens onto account creation. Firebase Authentication handles sign-in, and Firestore syncs saved highlights and course progress with the reader’s account.",
};

function ActLabel({ children }) {
  return <p className="bard-act-line">{children}</p>;
}

function ImplementationFigure({ src, width, height, name }) {
  return (
    <figure className="bard-implementation-figure">
      <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`Open ${name} at full size (opens in a new tab)`}>
        <ProjectImage src={src} alt={`Bard implementation: ${name}`} width={width} height={height} loading="lazy" decoding="async" />
      </a>
      <figcaption><span>{name}</span><a href={src} target="_blank" rel="noopener noreferrer" aria-label={`View ${name} at full size (opens in a new tab)`}>View full size ↗</a></figcaption>
    </figure>
  );
}

function BardProgramme({ children }) {
  const programmeRef = useRef(null);

  useEffect(() => {
    const programme = programmeRef.current;
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!programme || !window.IntersectionObserver || !preference || preference.matches) return;

    // A few stage cues, once per opening. Content remains visible without this enhancement.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          target.setAttribute("data-bard-revealed", "true");
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.15 });
    programme.classList.add("bard-motion-enabled");
    programme.querySelectorAll("[data-bard-cue]").forEach((cue) => observer.observe(cue));
    const finishMotion = ({ matches }) => {
      if (matches) {
        observer.disconnect();
        programme.classList.remove("bard-motion-enabled");
      }
    };
    preference.addEventListener?.("change", finishMotion);
    return () => {
      observer.disconnect();
      preference.removeEventListener?.("change", finishMotion);
      programme.classList.remove("bard-motion-enabled");
    };
  }, []);

  return <div className="bard-modal-main-flex-container" ref={programmeRef}>{children}</div>;
}

function BardModal({ isOpen, closeModal }) {
  const curtain = useBardCurtain(isOpen, closeModal);
  const closeControlRef = useRef(null);
  const tasselRef = useRef(null);
  const raiseRef = useRef(null);
  const returnTasselFocus = useRef(false);
  const draw = () => {
    if (!curtain.canDraw) return;
    returnTasselFocus.current = false;
    // Keep Escape inside the dialog before disabling the native tassel button.
    if (document.activeElement === tasselRef.current) closeControlRef.current?.focus({ preventScroll: true });
    curtain.draw();
  };
  const raise = () => {
    if (!curtain.canRaise) return;
    returnTasselFocus.current = true;
    closeControlRef.current?.focus({ preventScroll: true });
    curtain.raise();
  };
  useEffect(() => {
    if (curtain.performance.phase === "manualClosed") raiseRef.current?.focus({ preventScroll: true });
    if (curtain.performance.phase !== "open" || !returnTasselFocus.current) return;
    if (document.activeElement === closeControlRef.current) tasselRef.current?.focus({ preventScroll: true });
    returnTasselFocus.current = false;
  }, [curtain.performance.phase]);
  return (
    <Modal isOpen={isOpen} toggle={curtain.closeImmediately} fullscreen fade={false} trapFocus labelledBy="bard-project-title" className="bard-modal-main-div">
      {isOpen && <>
        <ModalHeader tag="div" className="bard-modal-header" close={<div className="bard-masthead-actions">
          <button type="button" ref={closeControlRef} className="btn-close" aria-label="Close project" onClick={curtain.close} />
          <button type="button" ref={tasselRef} className="bard-tassel-control" aria-label={curtain.isManualClosed ? "Raise curtain" : "Draw curtain"} title={curtain.isManualClosed ? "Raise curtain" : "Draw curtain"} aria-controls="bard-programme-stage" disabled={!curtain.canDraw && !curtain.canRaise} data-pulling={curtain.isTasselPulling || undefined} onClick={curtain.isManualClosed ? raise : draw}>
            <svg viewBox="0 0 24 38" aria-hidden="true" focusable="false"><path className="bard-tassel-cord" d="M12 1v18" /><ellipse cx="12" cy="22" rx="3" ry="2" /><path d="m9 24-2 9q5 4 10 0l-2-9Z" /><path d="M10 25 9 33m3-8v9m2-9 1 8" /></svg>
          </button>
        </div>}>
          <span className="bard-modal-header-text">BARD</span>
          <span className="bard-modal-header-text-two">Shakespeare on Android</span>
          <span className="bard-masthead-note">A project by Ibrahim Karim</span>
        </ModalHeader>

        <div id="bard-programme-stage" className="bard-stage" data-curtain-state={curtain.performance.phase}>
        <ModalBody className="bard-modal-body-main" tabIndex={0} role="region" aria-label="BARD programme" aria-hidden={curtain.isManualClosed || undefined} inert={curtain.isManualClosed ? "" : undefined}>
          <BardProgramme>
            <section className="bard-hero bard-spread" aria-labelledby="bard-project-title">
              <BardShowcase scene={readerScene} stageOpen={curtain.canDraw}>
                <div className="bard-title-entrance">
                  <ActLabel>Act I <span>/</span> The reading room</ActLabel>
                  <h1 id="bard-project-title">BARD</h1>
                  <p className="bard-hero-subtitle">A Shakespeare reader</p>
                  <p className="bard-intro">Explore 38 plays, follow each story act by act, and keep the lines you want to read again.</p>
                </div>
              </BardShowcase>
            </section>

            <section className="bard-highlights bard-spread" aria-labelledby="bard-highlights-title">
              <BardShowcase scene={highlightsScene} stageOpen={curtain.canDraw}>
                <ActLabel>A Midsummer Night’s Dream <span>/</span> Act I, Scene I</ActLabel>
                <h2 id="bard-highlights-title" data-bard-cue>My <em>Highlights</em></h2>
              </BardShowcase>
            </section>

            <section className="bard-synopses bard-spread" aria-labelledby="bard-synopses-title">
              <BardShowcase scene={synopsesScene} stageOpen={curtain.canDraw}>
                <ActLabel>Hamlet <span>/</span> Tragedy</ActLabel>
                <h2 id="bard-synopses-title" data-bard-cue><em>Synopses</em></h2>
              </BardShowcase>
            </section>

            <section className="bard-learning bard-spread" aria-labelledby="bard-learning-title">
              <div className="bard-learning-layout">
                <header>
                  <ActLabel>Act II <span>/</span> The learning path</ActLabel>
                  <h2 id="bard-learning-title" data-bard-cue>Quizzes <em>&amp; medals.</em></h2>
                  <p className="bard-intro">Each play has its own quiz. Follow an answer back to Shakespeare’s text, then see how a perfect score opens the next play.</p>
                </header>
                <div className="bard-quiz-pair">
                  {learningScenes.map((scene) => (
                    <div className="bard-quiz-scene" key={scene.id}>
                      <BardDevice scene={scene} stageOpen={curtain.canDraw} descriptionId={`bard-${scene.id}-description`} />
                      <p className="bard-scene-description" id={`bard-${scene.id}-description`}>{scene.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bard-account bard-spread" aria-labelledby="bard-account-title">
              <BardShowcase scene={accountScene} stageOpen={curtain.canDraw}>
                <ActLabel>Act III <span>/</span> The account</ActLabel>
                <h2 id="bard-account-title" data-bard-cue>A reader’s <em>account.</em></h2>
                <p className="bard-intro">Sign in to pick up a course or revisit a saved passage.</p>
              </BardShowcase>
            </section>

            <section className="bard-sources bard-spread" aria-labelledby="bard-sources-title">
              <ActLabel>Curtain call <span>/</span> Production notes</ActLabel>
              <div className="bard-credits-layout">
                <div>
                  <h2 id="bard-sources-title" data-bard-cue>Behind the <em>curtain.</em></h2>
                  <p className="bard-intro">I built Bard in React Native. The original project received Nucamp’s Front-End Honors Award.</p>
                  <a className="bard-honors-link" href="https://www.youtube.com/watch?v=mDVozMvFYb8" target="_blank" rel="noopener noreferrer">Watch the original honors submission <span aria-hidden="true">↗</span></a>
                </div>
                <div className="bard-production-data">
                  <dl>
                    <div><dt>Developer</dt><dd>Ibrahim Karim</dd></div>
                    <div><dt>Platform</dt><dd>Android · React Native</dd></div>
                    <div><dt>State &amp; accounts</dt><dd>Redux · Firebase Authentication · Firestore</dd></div>
                  </dl>
                </div>
              </div>
              <details className="bard-source-excerpts">
                <summary>Original source-code excerpts</summary>
                <p>Two excerpts from the original build show how Bard brought Folger synopses and MIT’s public-domain play texts into its reading views.</p>
                <div>
                  <ImplementationFigure src={folgerSlice} width={1150} height={1590} name="Folger synopsis and character data" />
                  <ImplementationFigure src={mitSlice} width={1151} height={1446} name="MIT full-text data" />
                </div>
              </details>
              <div className="bard-endnote"><Copyright /></div>
            </section>
          </BardProgramme>
        </ModalBody>
        <BardCurtain {...curtain} />
        {curtain.isManualClosed && <section className="bard-intermission" aria-label="BARD intermission">
          <p className="bard-intermission-title" aria-hidden="true">BARD</p>
          <h2>Intermission</h2>
          <button type="button" ref={raiseRef} className="bard-raise-curtain" onClick={raise}>Raise curtain</button>
        </section>}
        </div>

        <ModalFooter className="bard-modal-footer" role="group" aria-label="Bard project actions">
          <span className="bard-curtain-call">Curtain call</span>
          <button type="button" className="bard-action bard-modal-close-btn" onClick={curtain.close}>EXIT <span aria-hidden="true">↙</span></button>
          <a className="bard-action bard-apk-download-btn" href={apkUrl} target="_blank" rel="noopener noreferrer">Get APK <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
          <a className="bard-action bard-modal-github-btn" href={githubUrl} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
        </ModalFooter>
      </>}
    </Modal>
  );
}

export default BardModal;
