import ProjectImage from "./projects/ProjectImage";
import { useEffect, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import native from "../images/native.png";
import firebase from "../images/firebase.png";
import firestore from "../images/firestore.png";
import redux from "../images/redux.png";
import folgerSlice from "../images/folgerSlice.png";
import mitSlice from "../images/mitSlice.png";
import bardSignUp from "../images/bardSignUp.png";
import bardLogin from "../images/bardLogin.png";
import playsRoot from "../images/playsRoot.png";
import medalsCode from "../images/medalsCode.png";
import quizCode from "../images/quizCode.png";
import certificateCode from "../images/certificateCode.png";
import freeFolger from "../images/freeFolger.png";
import freeSynopsis from "../images/freeSynopsis.png";
import readFolger from "../images/readFolger.png";
import phoneBardHome from "../images/phoneBardHome.png";
import phoneBardProfile from "../images/phoneBardProfile.png";
import phoneBardSideMenu from "../images/phoneBardSideMenu.png";
import phoneBardCourse from "../images/phoneBardCourse.png";
import phoneBardQuiz from "../images/phoneBardQuiz.png";
import phoneBardQuizOne from "../images/phoneBardQuizOne.png";
import phoneBardMedals from "../images/phoneBardMedals.png";
import phoneBardInfo from "../images/phoneBardInfo.png";
import phoneBardSynopsis from "../images/phoneBardSynopsis.png";
import phoneBardPerformance from "../images/phoneBardPerformance.png";
import phoneBardHowTo from "../images/phoneBardHowTo.png";
import Copyright from "./Copyright";
import BardCurtain, { useBardCurtain } from "./BardCurtain";

const apkUrl = "https://drive.google.com/file/d/1kblapPn0vab5BiiJwcaMAioJ5yW14cCf/view?usp=drive_link";
const githubUrl = "https://github.com/ibrahim-karim-22/reactNativePortfolioProject";
// Reserve each original image's aspect ratio before its lazy load completes.
const implementationDimensions = {
  [folgerSlice]: [1150, 1590],
  [mitSlice]: [1151, 1446],
  [bardSignUp]: [1617, 1361],
  [bardLogin]: [1144, 864],
  [playsRoot]: [1363, 1613],
  [quizCode]: [1059, 1950],
  [medalsCode]: [1086, 1009],
  [certificateCode]: [1611, 1512],
  [freeFolger]: [901, 1301],
  [freeSynopsis]: [895, 1377],
  [readFolger]: [1030, 1514],
};

function ActLabel({ act, title, folio }) {
  return <div className="bard-act-line"><p className="bard-eyebrow">{act} <span aria-hidden="true">/</span> {title}</p><span className="bard-folio" aria-hidden="true">{folio}</span></div>;
}

// Individually measured alpha bounds include the existing perspective and rotation.
const phoneBounds = {
  [phoneBardHome]: [424, 12, 947, 1192],
  [phoneBardSideMenu]: [352, 5, 1109, 1202],
  [phoneBardProfile]: [467, 0, 972, 1193],
  [phoneBardInfo]: [433, 34, 976, 1197],
  [phoneBardCourse]: [435, 13, 927, 1208],
  [phoneBardSynopsis]: [453, 17, 908, 1203],
  [phoneBardQuiz]: [243, 108, 968, 1163],
  [phoneBardQuizOne]: [448, 27, 914, 1199],
  [phoneBardMedals]: [453, 17, 908, 1203],
  [phoneBardPerformance]: [411, 41, 963, 1137],
  [phoneBardHowTo]: [321, 27, 921, 1201],
};

function PhoneFigure({ src, name, number, role = "ensemble" }) {
  const [left, top, right, bottom] = phoneBounds[src];
  // Keep a small clear edge around the complete device; trim transparent canvas only.
  const x = Math.max(0, left - 24), y = Math.max(0, top - 24);
  const width = Math.min(1367, right + 24) - x, height = Math.min(1221, bottom + 24) - y;
  return (
    <figure className={`bard-phone-figure bard-phone-figure--${role}`} style={{
      "--bard-device-ratio": width / height,
      "--bard-image-width": `${1367 / width * 100}%`,
      "--bard-image-left": `${-x / width * 100}%`,
      "--bard-image-top": `${-y / height * 100}%`,
    }}>
      <div className="bard-phone-mount"><ProjectImage src={src} alt={`Bard app: ${name}`} width="1367" height="1221" loading="lazy" decoding="async" /></div>
      <figcaption><span aria-hidden="true">FIG. {number}</span><span>{name}</span></figcaption>
    </figure>
  );
}

function ImplementationFigure({ src, name, number }) {
  const [width, height] = implementationDimensions[src];
  return (
    <figure className="bard-implementation-figure">
      <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`Open ${name} at full size (opens in a new tab)`}>
        <ProjectImage src={src} alt={`Bard implementation: ${name}`} width={width} height={height} loading="lazy" decoding="async" />
      </a>
      <figcaption><span aria-hidden="true">EXCERPT {number}</span><span>{name}<a className="bard-full-size-link" href={src} target="_blank" rel="noopener noreferrer" aria-label={`View ${name} at full size (opens in a new tab)`}>View full size <span aria-hidden="true">↗</span></a></span></figcaption>
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
          <span className="bard-modal-header-text-two">Online Course</span>
          <span className="bard-masthead-note" aria-hidden="true">The Shakespeare programme</span>
        </ModalHeader>

        <div id="bard-programme-stage" className="bard-stage" data-curtain-state={curtain.performance.phase}>
        <ModalBody className="bard-modal-body-main" tabIndex={0} role="region" aria-label="BARD programme" aria-hidden={curtain.isManualClosed || undefined} inert={curtain.isManualClosed ? "" : undefined}>
          <BardProgramme>
            <section className="bard-hero" aria-labelledby="bard-project-title">
              <div className="bard-proscenium" aria-hidden="true" />
              <div className="bard-opening-spread">
                <div className="bard-opening-line"><span>Act I / Prologue</span><span>38 plays. One course.</span></div>
                <div className="bard-title-entrance">
                  <p className="bard-eyebrow">A Shakespeare learning experience</p>
                  <h1 id="bard-project-title">BARD</h1>
                  <p className="bard-hero-subtitle">Online Course</p>
                  <p className="bard-hero-deck">Read the plays. Learn the stories.<br /><em>Take your place in the world of Shakespeare.</em></p>
                </div>
                <div className="bard-opening-credits">
                  <div><span className="bard-eyebrow">Platform</span><p>React Native</p></div>
                  <div><span className="bard-eyebrow">The programme</span><p>Reading / Quizzes / Video</p></div>
                  <div><span className="bard-eyebrow">Recognition</span><p>Nucamp Front-End<br />Honors Award</p></div>
                </div>
                <div className="bard-opening-bottom"><span>A project by Ibrahim Karim</span><span aria-hidden="true">The curtain rises <span className="bard-down-arrow">↓</span></span></div>
              </div>
            </section>

            <section className="bard-prologue bard-spread" aria-labelledby="bard-prologue-title">
              <ActLabel act="Act I" title="The introduction" folio="01" />
              <div className="bard-prologue-layout">
                <div className="bard-prologue-copy">
                  <h2 id="bard-prologue-title" data-bard-cue>A way into<br /><em>Shakespeare.</em></h2>
                  <p className="bard-intro-lead" data-bard-cue>I created an <span className="bard-editorial-emphasis">online course</span> platform for all <span className="bard-editorial-emphasis">38 of Shakespeare’s plays.</span></p>
                  <p>This application aims to provide an engaging way for users to explore Shakespeare’s works through a combination of reading, quizzes, and video content.</p>
                  <div className="bard-native-credit"><ProjectImage src={native} width={275} height={300} alt="" /><span>Built with React Native<br /><small>A literary experience on mobile</small></span></div>
                </div>
                <div className="bard-prologue-exhibit">
                  <PhoneFigure src={phoneBardHome} name="Home — the invitation to learn" number="01" role="hero" />
                  <p className="bard-vertical-note">Nucamp Front-End Honors Award</p>
                </div>
              </div>
              <div className="bard-interface-index">
                <div className="bard-interface-heading"><p className="bard-eyebrow">Inside the application</p><p>A programme in your pocket.</p></div>
                <div className="bard-interface-gallery">
                  <PhoneFigure src={phoneBardSideMenu} name="The navigation menu" number="02" />
                  <PhoneFigure src={phoneBardProfile} name="Your profile and progress" number="03" />
                  <PhoneFigure src={phoneBardInfo} name="About the course" number="04" />
                </div>
              </div>
            </section>

            <section className="bard-sources bard-spread" aria-labelledby="bard-sources-title">
              <ActLabel act="Act II" title="The sources" folio="02" />
              <div className="bard-section-heading"><h2 id="bard-sources-title" data-bard-cue>The text behind<br /><em>the stage.</em></h2><p>Two APIs bring the plays into the application: the story’s essentials, and the complete text.</p></div>
              <div className="bard-source-columns">
                <article className="bard-source">
                  <div className="bard-source-heading"><span className="bard-source-number" aria-hidden="true">I.</span><div><p className="bard-eyebrow">Synopsis + character data</p><h3>Folger</h3></div></div>
                  <p>Folger Shakespeare Library’s official API fetches the synopsis and character lists for each play.</p>
                  <ImplementationFigure src={folgerSlice} name="Folger synopsis and character data" number="01" />
                </article>
                <article className="bard-source">
                  <div className="bard-source-heading"><span className="bard-source-number" aria-hidden="true">II.</span><div><p className="bard-eyebrow">Full public-domain play text</p><h3>MIT</h3></div></div>
                  <p>The MIT public-domain API fetches the complete texts of the plays, for reading beyond the synopsis.</p>
                  <ImplementationFigure src={mitSlice} name="MIT full-text data" number="02" />
                </article>
              </div>
            </section>

            <section className="bard-accounts bard-spread" aria-labelledby="bard-accounts-title">
              <ActLabel act="Interlude" title="User account" folio="03" />
              <div className="bard-account-layout">
                <div>
                  <h2 id="bard-accounts-title">Your place<br /><em>in the story.</em></h2>
                  <p>Users create accounts and receive a unique profile, with an email, password, an updateable default profile picture, and progress through the plays.</p>
                  <p>Account data is stored in Google Firestore. On login, that data updates the Redux state of completed quiz levels so users can resume their progress.</p>
                  <ul className="bard-technology-credits" aria-label="Account technologies">
                    {[["Firebase", firebase, 219, 300], ["Firestore", firestore, 256, 300], ["Redux", redux, 300, 285]].map(([name, logo, width, height]) => <li key={name}><ProjectImage src={logo} width={width} height={height} alt="" /><span>{name}</span></li>)}
                  </ul>
                  <PhoneFigure src={phoneBardCourse} name="The course and its levels" number="05" role="supporting" />
                </div>
                <div className="bard-account-excerpts">
                  <ImplementationFigure src={bardSignUp} name="Account creation" number="03" />
                  <ImplementationFigure src={bardLogin} name="Login and progress restoration" number="04" />
                </div>
              </div>
            </section>

            <section className="bard-features" aria-labelledby="bard-features-title">
              <div className="bard-feature-frontispiece bard-spread">
                <ActLabel act="Act III" title="The experience" folio="04" />
                <h2 id="bard-features-title" data-bard-cue><span>Main</span><em>Features</em></h2>
                <div className="bard-feature-guide"><p>Read. Understand. Progress.</p><span className="bard-eyebrow">A course through 38 plays</span></div>
              </div>

              <article className="bard-feature-spread bard-spread bard-feature-spread--paper" aria-labelledby="bard-levels-title">
                <div className="bard-feature-copy"><span className="bard-feature-number" aria-hidden="true">01</span><p className="bard-eyebrow">The learning path</p><h3 id="bard-levels-title">Level<br /><em>System.</em></h3><p>Users progress through the plays in an order that typically starts with those familiar from high school, such as “The Tempest.” The levels range from easier to more challenging plays.</p></div>
                <ImplementationFigure src={playsRoot} name="The play level sequence" number="05" />
              </article>

              <article className="bard-feature-spread bard-spread bard-feature-spread--reverse" aria-labelledby="bard-quiz-title">
                <div className="bard-feature-copy"><span className="bard-feature-number" aria-hidden="true">02</span><p className="bard-eyebrow">Read / Recall</p><h3 id="bard-quiz-title">Synopsis<br /><em>& Quizzes.</em></h3><p>Each level begins with a synopsis. Users can take a quiz after reading it, or choose to read the entire play first.</p><p>Each quiz has 7 questions. A perfect score earns a medal and unlocks the next level.</p><ImplementationFigure src={quizCode} name="The quiz logic" number="06" /></div>
                <div className="bard-phone-duet"><PhoneFigure src={phoneBardSynopsis} name="Read a play synopsis" number="06" role="lead" /><PhoneFigure src={phoneBardQuiz} name="Choose a quiz" number="07" /><PhoneFigure src={phoneBardQuizOne} name="Answer the questions" number="08" /></div>
              </article>

              <article className="bard-feature-spread bard-spread bard-feature-spread--aubergine" aria-labelledby="bard-medals-title">
                <div className="bard-feature-copy"><span className="bard-feature-number" aria-hidden="true">03</span><p className="bard-eyebrow">Unlock / Achieve</p><h3 id="bard-medals-title">A play.<br />A medal.<br /><em>A milestone.</em></h3><p>Plays are initially locked and must be completed in sequence. Successfully completing each play awards a medal and unlocks the next.</p><p>Collecting all 38 medals grants a certificate.</p><PhoneFigure src={phoneBardMedals} name="The medal collection" number="09" role="supporting" /></div>
                <div className="bard-achievement-excerpts"><ImplementationFigure src={medalsCode} name="Unlocking plays and awarding medals" number="07" /><ImplementationFigure src={certificateCode} name="The course certificate" number="08" /></div>
              </article>
            </section>

            <section className="bard-additional bard-spread" aria-labelledby="bard-additional-title">
              <ActLabel act="Act IV" title="Additional features" folio="05" />
              <h2 id="bard-additional-title">Beyond<br /><em>the course.</em></h2>
              <div className="bard-free-read-heading"><span className="bard-feature-number" aria-hidden="true">04</span><div><p className="bard-eyebrow">Explore at your own pace</p><h3>Free Read</h3></div><p>Follow the synopsis and quizzes in sequence, or explore all synopses and full play texts in any order, without following the course structure.</p></div>
              <div className="bard-reading-excerpts"><ImplementationFigure src={freeFolger} name="Free reading of full plays" number="09" /><ImplementationFigure src={freeSynopsis} name="Exploring synopses freely" number="10" /><ImplementationFigure src={readFolger} name="The play reading view" number="11" /></div>
              <div className="bard-video-feature">
                <div className="bard-feature-copy"><span className="bard-feature-number" aria-hidden="true">05</span><p className="bard-eyebrow">Watch / Discover</p><h3>From page<br /><em>to performance.</em></h3><p>The platform includes “Great Performances” and “How To” videos on Shakespeare, sourced from YouTube, to enhance the learning experience.</p></div>
                <div className="bard-performance-phones"><PhoneFigure src={phoneBardPerformance} name="Great Performances videos" number="10" /><PhoneFigure src={phoneBardHowTo} name="How To videos on Shakespeare" number="11" /></div>
              </div>
            </section>

            <section className="bard-screening bard-spread" aria-labelledby="bard-screening-title">
              <ActLabel act="Screening" title="Honors Video Submission" folio="06" />
              <div className="bard-section-heading"><h2 id="bard-screening-title" data-bard-cue>A look behind<br /><em>the curtain.</em></h2><p>The project’s honors video submission.<br />Take a seat for the demonstration.</p></div>
              <figure className="bard-screening-figure">
                <div className="bard-screening-frame"><iframe className="bard-modal-honors-video" width="560" height="315" src="https://www.youtube.com/embed/mDVozMvFYb8?si=ep73q8kv4df0j77v" title="BARD — Honors Video Submission" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
                <figcaption><span>BARD / Honors Video Submission</span><span aria-hidden="true">End of programme</span></figcaption>
              </figure>
              <div className="bard-endnote"><p className="bard-eyebrow">The credits</p><p>JavaScript · React Native · Android Studio<br />Redux · Firebase · Firestore</p><span><Copyright /></span></div>
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
          <a className="bard-action bard-apk-download-btn" href={apkUrl} target="_blank" rel="noopener noreferrer">APK! <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
          <a className="bard-action bard-modal-github-btn" href={githubUrl} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
        </ModalFooter>
      </>}
    </Modal>
  );
}

export default BardModal;
