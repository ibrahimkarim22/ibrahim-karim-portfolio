import { useEffect, useRef, useState } from "react";
import { Modal, ModalHeader, ModalFooter } from "reactstrap";
import Copyright from "./Copyright";
import PortfolioSystem from "./portfolioProcess/PortfolioSystem";
import ProjectLogic from "./portfolioProcess/ProjectLogic";
import PortfolioMedia, { SourceCrop } from "./portfolioProcess/PortfolioMedia";
import {
  OpeningAssembly,
  MotionStudies,
  MotionTimeline,
  AssetPipeline,
  QualitySheet,
  FinalAssembly,
  useExhibitionScenes,
} from "./portfolioProcess/PortfolioExhibition";
import connection from "../images/portfolio-process/heyyou-connection.jpg";
import connectionTablet from "../images/portfolio-process/heyyou-connection-tablet.jpg";
import connectionMobile from "../images/portfolio-process/heyyou-connection-mobile.jpg";
import whale from "../images/portfolio-process/heyyou-whale.jpg";
import whaleLoop from "../images/portfolio-process/heyyou-whale-loop.webm";
import curtain from "../images/portfolio-process/bard-curtain.jpg";
import board from "../images/portfolio-process/tuhdoo-board.jpg";
import cinema from "../images/portfolio-process/krispy-cinema.jpg";
import arcade from "../images/portfolio-process/whackamole-arcade.jpg";
import signature from "../images/portfolio-process/portfolio-signature.jpg";
import profile from "../images/portfolio-process/portfolio-profile.jpg";
import logoModel from "../images/logoModel.png";
import resumeModel from "../images/resumeModel.png";
import whaleKeyframes from "../images/whaleKeyframes.png";
import splashKeyframes from "../images/splashKeyframes.png";
import useEffectCode from "../images/useEffectCode.png";

const chapters = [
  ["concept", "Concept"],
  ["heyyou", "HeyYou"],
  ["bard", "BARD"],
  ["portfolio", "Portfolio"],
  ["tuhdoo", "Tuh-Doo"],
  ["krispy", "KRISPY"],
  ["whackamole", "Whack a Mole"],
  ["experience", "Loading"],
  ["quality", "Quality"],
  ["deployment", "Ship"],
];
const worlds = [
  {
    id: "heyyou",
    name: "HeyYou",
    src: connection,
    width: 1280,
    height: 756,
    direction: "Connection / playful geometry",
    motion:
      "Signals converge between two phones; a whale carries the deployment story.",
    note: "A shared place. A moving signal.",
  },
  {
    id: "bard",
    name: "BARD",
    src: curtain,
    width: 1280,
    height: 771,
    direction: "Theatre / literary programme",
    motion:
      "Weighted curtains open onto the programme, with Draw and Raise controls.",
    note: "A stage for the story.",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    src: signature,
    width: 1440,
    height: 900,
    direction: "Portfolio / scenes and interaction",
    motion:
      "The shared shell connects project case studies, live Blender scenes and navigation.",
    note: "One place for the work.",
  },
  {
    id: "tuhdoo",
    name: "Tuh-Doo",
    src: board,
    width: 1312,
    height: 830,
    direction: "Workflow / organized surfaces",
    motion:
      "An organizing hero board settles, then advances one task at a time.",
    note: "Order, with momentum.",
  },
  {
    id: "krispy",
    name: "KRISPY",
    src: cinema,
    width: 1440,
    height: 625,
    direction: "Cinema / a streaming programme",
    motion:
      "House lights shift the viewing presentation; film posters lead into the collection.",
    note: "An invitation to watch.",
  },
  {
    id: "whackamole",
    name: "Whack a Mole",
    src: arcade,
    width: 1144,
    height: 602,
    direction: "Arcade / playful interaction",
    motion:
      "Technology logos rise from mole holes, with a little point feedback for every hit.",
    note: "A minute. Make it count.",
  },
];
const openingWorlds = worlds.filter(({ id }) =>
  ["heyyou", "bard", "tuhdoo"].includes(id),
);

function WorldIntro({ world, number }) {
  return (
    <article className={`tp-world tp-world--${world.id} tp-scene`}>
      <div className="tp-contact-label"><span>{number} / PROJECT WORLD</span><span>CURRENT EXPERIENCE</span></div>
      <PortfolioMedia src={world.src} width={world.width} height={world.height}
        name={`${world.name} current case study`}
        alt={`${world.name} current case study: ${world.note}`} caption={world.note} />
      <div className="tp-world-copy">
        <span className="tp-world-numeral" aria-hidden="true">{number}</span>
        <h2 id={`tp-${world.id}-title`} tabIndex={-1}>{world.name}</h2>
        <p className="tp-world-direction">{world.direction}</p>
        <p>{world.motion}</p>
      </div>
    </article>
  );
}

function SectionHeading({ number, label, id, title, children }) {
  return (
    <header className="tp-section-heading">
      <svg
        className="tp-section-number"
        viewBox="0 0 280 200"
        aria-hidden="true"
        focusable="false"
      >
        <text x="0" y="160">
          {number}
        </text>
      </svg>
      <div>
        <p className="tp-label">
          <span>{number}</span> / {label}
        </p>
        <h2 id={id} tabIndex={-1}>
          {title}
        </h2>
      </div>
      {children && <p className="tp-section-deck">{children}</p>}
    </header>
  );
}

function StudioAtlas({ closeModal }) {
  const bodyRef = useRef(null);
  useExhibitionScenes(bodyRef);
  const [chapter, setChapter] = useState("concept");
  const [assetStage, setAssetStage] = useState(0);
  useEffect(() => {
    const index = bodyRef.current.querySelector(".tp-index");
    const active = index.querySelector('[aria-current="step"]');
    if (active && index.scrollWidth > index.clientWidth) {
      index.scrollTo?.({
        left: Math.max(
          0,
          active.offsetLeft - index.clientWidth / 2 + active.offsetWidth / 2,
        ),
        behavior: "auto",
      });
    }
  }, [chapter]);
  function measureChapter() {
    const body = bodyRef.current;
    if (!body) return;
    const threshold =
      body.getBoundingClientRect().top + Math.min(180, body.clientHeight * 0.3);
    let active = "concept";
    chapters.forEach(([id]) => {
      if (
        body.querySelector(`#tp-${id}`)?.getBoundingClientRect().top <=
        threshold
      )
        active = id;
    });
    if (body.scrollHeight - body.scrollTop - body.clientHeight <= 2)
      active = "deployment";
    setChapter(active);
  }
  function goTo(id) {
    const body = bodyRef.current;
    const target = body.querySelector(`#tp-${id}-title`);
    const index = body.querySelector(".tp-index");
    if (target)
      body.scrollTo?.({
        top:
          body.scrollTop +
          (body.querySelector(`#tp-${id}`) || target).getBoundingClientRect().top -
          body.getBoundingClientRect().top -
          index.offsetHeight -
          16,
        behavior: "instant",
      });
    target?.focus({ preventScroll: true });
    setChapter(id);
  }
  return (
    <>
      <ModalHeader
        tag="div"
        toggle={closeModal}
        closeAriaLabel="Close project"
        className="tp-header"
      >
        <span className="tp-studio-mark" aria-hidden="true">
          ▧
        </span>
        <span className="tp-header-name">THIS PORTFOLIO</span>
        <span className="tp-header-context">STUDIO ATLAS / SYSTEM INDEX</span>
      </ModalHeader>
      <div
        ref={bodyRef}
        className="modal-body tp-body"
        tabIndex={0}
        role="region"
        aria-label="Portfolio studio atlas"
        onScroll={measureChapter}
      >
        <nav className="tp-index" aria-label="Studio atlas chapters">
          {chapters.map(([id, name], index) => (
            <button
              type="button"
              key={id}
              aria-label={`${String(index + 1).padStart(2, "0")} ${name}`}
              aria-current={chapter === id ? "step" : undefined}
              onClick={() => goTo(id)}
            >
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>{" "}
              {name}
            </button>
          ))}
        </nav>
        <main className="tp-atlas">
          <section
            className="tp-hero tp-section"
            id="tp-concept"
            aria-labelledby="tp-concept-title"
          >
            <div className="tp-project-line">
              <span>IBRAHIM KARIM / DESIGN & DEVELOPMENT</span>
              <span>THE PORTFOLIO, AS A PROJECT</span>
            </div>
            <div className="tp-hero-layout">
              <div className="tp-hero-copy">
                <p className="tp-label">
                  <span className="tp-orange-square" aria-hidden="true" /> 01 /
                  CONCEPT
                </p>
                <h1 id="tp-project-title">
                  THIS
                  <br />
                  PORTFOLIO
                  <span className="tp-title-dot" aria-hidden="true">
                    .
                  </span>
                </h1>
                <h2 id="tp-concept-title" tabIndex={-1}>
                  Designing the system
                  <br />
                  behind the projects.
                </h2>
                <p className="tp-hero-description">
                  A portfolio built as a system of interactive project worlds.
                  The work is the starting point; the interface gives each
                  project its own space.
                </p>
                <button
                  type="button"
                  className="tp-text-link"
                  onClick={() => goTo("portfolio")}
                >
                  Explore the construction <span aria-hidden="true">↓</span>
                </button>
              </div>
              <OpeningAssembly worlds={openingWorlds} />
            </div>
            <ul className="tp-materials" aria-label="Portfolio technologies">
              <li>
                React <span>/ interface</span>
              </li>
              <li>
                SCSS + CSS <span>/ motion</span>
              </li>
              <li>
                Blender <span>/ assets</span>
              </li>
              <li>
                React Three Fiber <span>/ 3D</span>
              </li>
              <li>
                Firebase <span>/ hosting</span>
              </li>
            </ul>
            <div className="tp-concept-note">
              <span aria-hidden="true">↳</span>
              <p>
                Case studies were redesigned to present earlier projects through
                the current portfolio system; original project media is
                preserved where relevant.
              </p>
            </div>
          </section>

          <section className="tp-section tp-project-section tp-motion-section" id="tp-heyyou" aria-labelledby="tp-heyyou-title">
            <WorldIntro world={worlds[0]} number="02" />
            <ProjectLogic project="heyyou" />
            <MotionStudies project="heyyou" />
            <MotionTimeline source={whaleKeyframes} whale={whale} loop={whaleLoop} />
            <details className="tp-archive">
              <summary>Open the splash motion source</summary>
              <SourceCrop
                src={splashKeyframes}
                width={1626}
                height={1416}
                top={380}
                crop={300}
                cropWidth={1025}
                name="splash keyframes"
                alt="Process archive: splash animation keyframes"
                note="20–25% / original splash timing"
              />
            </details>
          </section>

          <section className="tp-section tp-project-section tp-worlds-section" id="tp-bard" aria-labelledby="tp-bard-title">
            <WorldIntro world={worlds[1]} number="03" />
            <ProjectLogic project="bard" />
            <MotionStudies project="bard" />
          </section>

          <section className="tp-section tp-project-section tp-portfolio-section" id="tp-portfolio" aria-labelledby="tp-portfolio-title">
            <WorldIntro world={worlds[2]} number="04" />
          <section
            className="tp-project-process tp-assets-section"
            id="tp-assets"
            aria-labelledby="tp-assets-title"
          >
            <SectionHeading
              number="04"
              label="3D + ASSETS / THE STUDIO PROCESS"
              id="tp-assets-title"
              title={
                <>
                  From Blender
                  <br />
                  to the browser.
                </>
              }
            >
              Some assets become live scenes. Others become rendered images.
              Each has a place in the interface.
            </SectionHeading>
            <AssetPipeline selected={assetStage} onSelect={setAssetStage} />
            <div className="tp-process-grid" data-stage={assetStage}>
              <PortfolioMedia
                src={logoModel}
                width="1918"
                height="990"
                name="Blender signature source"
                alt="Process archive: Blender signature model in its original modeling workspace"
                label="PROCESS ARCHIVE / BLENDER"
                caption="The signature, at its source."
              />
              <PortfolioMedia
                src={signature}
                width="1440"
                height="900"
                name="portfolio signature in the browser"
                alt="Current portfolio home shell with the rendered 3D signature"
                label="CURRENT EXPERIENCE / LIVE SCENE"
                caption="logo.glb → the home signature."
              />
              <PortfolioMedia
                src={resumeModel}
                width="1918"
                height="984"
                name="Blender profile source"
                alt="Process archive: Blender 3D profile environment and skill buildings"
                label="PROCESS ARCHIVE / BLENDER"
                caption="A profile built as a landscape."
              />
              <PortfolioMedia
                src={profile}
                width="706"
                height="808"
                name="portfolio 3D profile"
                alt="Current portfolio 3D profile scene with interactive camera controls"
                label="CURRENT EXPERIENCE / LIVE SCENE"
                caption="landscape2.glb → the 3D Profile."
              />
            </div>
            <div
              className="tp-source-pair tp-integration-evidence"
              data-stage={assetStage}
            >
              <div>
                <p className="tp-label">SOURCE / ANIMATION INTEGRATION</p>
                <h3>From a clip to a frame.</h3>
                <p>
                  This earlier source capture shows the same integration pattern
                  used by the live scenes: create an animation mixer, play the
                  model’s clips, and update the mixer from React Three Fiber’s
                  frame loop.
                </p>
                <p>
                  Rendered phone views use images; the signature and profile use
                  live GLB scenes. Choose the medium for the moment.
                </p>
              </div>
              <SourceCrop
                src={useEffectCode}
                width={821}
                height={360}
                top={0}
                crop={360}
                name="3D animation mixer"
                alt="Process archive: Three.js AnimationMixer setup and clip playback"
                note="AnimationMixer / original implementation capture"
              />
            </div>
          </section>


          <section
            className="tp-project-process tp-system-section"
            id="tp-system"
            aria-labelledby="tp-system-title"
          >
            <SectionHeading
              number="04"
              label="SYSTEM / CONSTRUCTION DRAWING"
              id="tp-system-title"
              title={
                <>
                  One structure.
                  <br />
                  Room for expression.
                </>
              }
            >
              The shell stays in place. Routes select a view or project. A
              shared host opens the selected case study.
            </SectionHeading>
            <PortfolioSystem />
            <div className="tp-support-strip">
              <span>SUPPORTING MATERIALS</span>
              <span>SCSS / layout</span>
              <span>CSS / choreography</span>
              <span>GLB + images / assets</span>
              <span>Jest + browser review / QA</span>
            </div>
          </section>


          </section>

          {worlds.slice(3).map((world, index) => (
            <section
              className={`tp-section tp-project-section ${world.id === "krispy" ? "tp-motion-section" : "tp-worlds-section"}`}
              id={`tp-${world.id}`}
              aria-labelledby={`tp-${world.id}-title`}
              key={world.id}
            >
              <WorldIntro world={world} number={String(index + 5).padStart(2, "0")} />
              <ProjectLogic project={world.id} />
              {world.id === "tuhdoo" && <MotionStudies project="tuhdoo" />}
            </section>
          ))}

          <section
            className="tp-section tp-experience-section"
            id="tp-experience"
            aria-labelledby="tp-experience-title"
          >
            <SectionHeading
              number="08"
              label="CODE + LOADING / EXPERIENCE"
              id="tp-experience-title"
              title="Bring in what belongs."
            >
              Loading and mounting follow the active view. The interface keeps
              the surrounding navigation available.
            </SectionHeading>
            <div className="tp-experience-blocks">
              <article>
                <span className="tp-block-number">01</span>
                <h3>Mount the selected project.</h3>
                <p>
                  The catalog imports the project components. The modal host
                  renders the selected one; closing it removes that presentation
                  and its local state.
                </p>
                <small>Conditional rendering / React</small>
              </article>
              <article>
                <span className="tp-block-number">02</span>
                <h3>Contain model loading.</h3>
                <p>
                  GLB loading suspends inside each Canvas. Scene readiness sets{" "}
                  <code>aria-busy</code>; the 3D Profile enables its controls
                  when the camera is ready.
                </p>
                <small>Suspense / useGLTF / readiness</small>
              </article>
              <article>
                <span className="tp-block-number">03</span>
                <h3>Defer supporting media.</h3>
                <p>
                  Case-study images and video embeds use native lazy loading.
                  Media dimensions reserve space before the images arrive.
                </p>
                <small>loading="lazy" / image dimensions</small>
              </article>
            </div>
          </section>

          <section
            className="tp-section tp-quality-section"
            id="tp-quality"
            aria-labelledby="tp-quality-title"
          >
            <SectionHeading
              number="09"
              label="ACCESSIBILITY / QUALITY"
              id="tp-quality-title"
              title="Considered, down to the details."
            />
            <QualitySheet
              previews={{
                desktop: { src: connection, width: 1280, height: 756 },
                tablet: { src: connectionTablet, width: 768, height: 737 },
                mobile: { src: connectionMobile, width: 390, height: 1141 },
              }}
            />
          </section>

          <section
            className="tp-section tp-deployment-section"
            id="tp-deployment"
            aria-labelledby="tp-deployment-title"
          >
            <SectionHeading
              number="10"
              label="DEPLOYMENT / THE FINAL LAYER"
              id="tp-deployment-title"
              title={
                <>
                  A place for
                  <br />
                  the complete system.
                </>
              }
            >
              Firebase Hosting is configured to serve the production build, with
              routes rewritten to the application entry point.
            </SectionHeading>
            <div className="tp-deploy-path tp-scene">
              <span>REACT APPLICATION</span>
              <span aria-hidden="true">→</span>
              <span>PRODUCTION BUILD</span>
              <span aria-hidden="true">→</span>
              <span>FIREBASE HOSTING</span>
              <span aria-hidden="true">→</span>
              <span>ROUTED EXPERIENCE</span>
            </div>
            <div className="tp-deploy-note">
              <code>firebase.json</code>
              <p>
                <code>public: "build"</code>
                <br />
                <code>** → /index.html</code>
              </p>
              <p>
                Direct project links return to the same application shell. React
                Router selects the view inside it.
              </p>
            </div>
            <div className="tp-complete">
              <FinalAssembly />
              <p className="tp-label">11 / COMPLETE SYSTEM</p>
              <h2>
                Many layers.
                <br />
                One experience.
              </h2>
              <p>
                Content, interface, motion and assets brought into alignment. A
                portfolio that shows the work—and the craft behind its
                presentation.
              </p>
              <span className="tp-complete-stamp">
                DESIGNED / BUILT / CONNECTED
              </span>
            </div>
            <div className="tp-copyright">
              <Copyright />
              <span>THIS PORTFOLIO / STUDIO ATLAS</span>
            </div>
          </section>
        </main>
      </div>
      <ModalFooter
        className="tp-footer"
        role="group"
        aria-label="Portfolio project actions"
      >
        <span className="tp-footer-note">
          THE SYSTEM BEHIND THE WORK <span aria-hidden="true">↗</span>
        </span>
        <button type="button" className="tp-action" onClick={closeModal}>
          Close
        </button>
        <a className="tp-action" href="mailto:22ibrahimkarim@gmail.com">
          Email
        </a>
        <a
          className="tp-action tp-action--primary"
          href="https://github.com/ibrahim-karim-22/ibrahim-karim-portfolio"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub <span aria-hidden="true">↗</span>
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </ModalFooter>
    </>
  );
}

export default function ThisPortfolioModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      fade={false}
      trapFocus
      labelledBy="tp-project-title"
      className="this-portfolio-modal-main-div"
    >
      {isOpen && <StudioAtlas closeModal={closeModal} />}
    </Modal>
  );
}
