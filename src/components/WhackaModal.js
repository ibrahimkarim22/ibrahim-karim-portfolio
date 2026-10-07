import { useEffect, useRef, useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import js from "../images/js.png";
import html from "../images/html.png";
import sass from "../images/sass.png";
import whacka from "../images/whacka.gif";
import Copyright from "./Copyright";

function WhackaMoleTarget({ logo, name, index }) {
  const [isHit, setIsHit] = useState(false);
  const [hasBeenHit, setHasBeenHit] = useState(false);
  const hitTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(hitTimer.current), []);

  function whackLogo(event) {
    const target = event.currentTarget;
    const bounds = target.getBoundingClientRect();
    const windowBounds = target.parentElement.getBoundingClientRect();
    const visibleHeight = Math.min(bounds.bottom, windowBounds.bottom) - Math.max(bounds.top, windowBounds.top);
    const visibleWidth = Math.min(bounds.right, windowBounds.right) - Math.max(bounds.left, windowBounds.left);

    // CSS gates the masked part of the cycle; geometry also rejects clipped targets.
    if (
      hitTimer.current !== null ||
      window.getComputedStyle(target).pointerEvents === "none" ||
      bounds.height <= 0 || bounds.width <= 0 ||
      visibleHeight < bounds.height / 2 || visibleWidth < bounds.width / 2
    ) return;

    setHasBeenHit(true);
    setIsHit(true);
    hitTimer.current = window.setTimeout(() => {
      setIsHit(false);
      hitTimer.current = null;
    }, 800);
  }

  return (
    <div className={`whacka-mole-hole whacka-mole-hole-${index + 1}`}>
      <div className="whacka-mole-window">
        <button
          type="button"
          className={`whacka-mole-target${hasBeenHit ? " has-been-hit" : ""}${isHit ? " is-hit" : ""}`}
          aria-label={`Whack ${name} logo`}
          onClick={whackLogo}
        >
          <img src={logo} alt="" className="whacka-mole-logo" />
        </button>
      </div>
      {isHit && (
        <span className="whacka-hit-feedback" role="status" aria-label={`5 points for ${name}`}>
          +5
        </span>
      )}
    </div>
  );
}

function WhackaModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      fade={false}
      modalClassName="whacka-modal-presentation"
      labelledBy="whacka-project-title"
      className={`whacka-modal-main-div${isOpen ? " whacka-modal-frame-open" : ""}`}
    >
      {isOpen && (
        <>
          <ModalHeader
            toggle={closeModal}
            closeAriaLabel="Close project"
            tag="div"
            className="whacka-modal-header"
          >
            <span className="whacka-header-project">
              <svg className="whacka-game-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M7 6h10c2 0 3.5 1.4 4 3.4l1 5.5c.4 2-1.8 3.3-3.2 1.9L16 14H8l-2.8 2.8C3.8 18.2 1.6 16.9 2 14.9l1-5.5C3.5 7.4 5 6 7 6Z" />
                <path d="M7 9v4M5 11h4" />
                <circle cx="16" cy="10" r="0.7" />
                <circle cx="19" cy="12" r="0.7" />
              </svg>
              Whack a Mole
            </span>
            <span className="whacka-header-label">Online Game</span>
          </ModalHeader>

          <ModalBody className="whacka-modal-main">
            <article className="whacka-case-study" aria-labelledby="whacka-project-title">
              <section className="whacka-hero" aria-labelledby="whacka-project-title">
                <div className="whacka-hero-copy">
                  <p className="whacka-eyebrow">Online game / Team project</p>
                  <h1 id="whacka-project-title">
                    <span>Whack a</span>{" "}<span className="whacka-title-accent">Mole</span>
                  </h1>
                  <p className="whacka-summary">
                    Sixty seconds, quick reactions, and one nuke to avoid: a playful
                    browser arcade game built together.
                  </p>
                  <div className="whacka-actions">
                    <a
                      className="whacka-action whacka-action-primary"
                      href="https://whackamolewhackamole.web.app"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Play! <span aria-hidden="true">↗</span>
                    </a>
                    <a
                      className="whacka-action whacka-action-secondary"
                      href="https://github.com/ibrahim-karim-22/portfolioprojectgame"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                  <ul className="whacka-stack" aria-label="Project technologies">
                    <li>Vanilla JavaScript</li>
                    <li>HTML</li>
                    <li>SCSS</li>
                  </ul>
                </div>

                <figure className="whacka-showcase">
                  <div className="whacka-showcase-heading">
                    <h2>A minute. Make it count.</h2>
                    <span className="whacka-round-label">60 sec</span>
                  </div>
                  <div className="whacka-gif-frame">
                    <img
                      src={whacka}
                      width={1920}
                      height={1080}
                      alt="Whack a Mole gameplay showing the grid, score, and countdown"
                      className="whacka-gif"
                    />
                  </div>
                  <figcaption>
                    Catch the moles. Collect the hearts. Watch the clock.
                  </figcaption>
                </figure>

                <div className="whacka-mole-stage" role="group" aria-label="Interactive technology logos">
                  <span className="whacka-stage-label">The tools behind the game</span>
                  <div className="whacka-mole-holes">
                    {[{ logo: js, name: "JavaScript" }, { logo: html, name: "HTML" }, { logo: sass, name: "Sass" }].map(({ logo, name }, index) => (
                      <WhackaMoleTarget logo={logo} name={name} index={index} key={name} />
                    ))}
                  </div>
                </div>
              </section>

              <section className="whacka-overview" aria-labelledby="whacka-story-title">
                <div className="whacka-story">
                  <p className="whacka-eyebrow">01 / The story</p>
                  <h2 id="whacka-story-title">Small game. Shared effort.</h2>
                  <p>
                    I developed Whack a Mole with Brandon O&apos;Shea and Sam Golshan.
                    As one of three developers, I collaborated on a browser game
                    built with HTML, vanilla JavaScript, and SCSS.
                  </p>
                  <p>
                    We used Git, GitHub, and VS Code Live Share to work together.
                    The result pairs a simple click-to-score loop with bonus hearts,
                    costly misses, sound effects, and a game-ending nuke.
                  </p>
                </div>
                <div className="whacka-rules" aria-labelledby="whacka-rules-title">
                  <p className="whacka-eyebrow">The rules</p>
                  <h3 id="whacka-rules-title">Every click counts.</h3>
                  <dl className="whacka-score-grid">
                    <div><dt>Mole</dt><dd>+5 <span>points</span></dd></div>
                    <div><dt>Heart</dt><dd>+30 <span>points</span></dd></div>
                    <div><dt>Empty cell</dt><dd>−5 <span>points</span></dd></div>
                    <div><dt>Nuke</dt><dd className="whacka-game-over">Game over</dd></div>
                  </dl>
                  <p className="whacka-rule-note">Build your score before the 60-second timer runs out.</p>
                </div>
              </section>

              <section className="whacka-technical" aria-labelledby="whacka-technical-title">
                <p className="whacka-eyebrow">02 / Under the hood</p>
                <h2 id="whacka-technical-title">Simple tools. Playful details.</h2>
                <div className="whacka-highlight-grid">
                  <div className="whacka-highlight">
                    <span className="whacka-highlight-number" aria-hidden="true">01</span>
                    <h3>Events &amp; scoring</h3>
                    <p>JavaScript click listeners handle start, end, and back controls. Grid clicks award points, deduct misses, or end the round.</p>
                  </div>
                  <div className="whacka-highlight">
                    <span className="whacka-highlight-number" aria-hidden="true">02</span>
                    <h3>Timers &amp; intervals</h3>
                    <p>A countdown sets the pace, while intervals control object appearances and timed sound cues.</p>
                  </div>
                  <div className="whacka-highlight">
                    <span className="whacka-highlight-number" aria-hidden="true">03</span>
                    <h3>Sound feedback</h3>
                    <p>Distinct sounds mark hits, bonuses, misses, and the nuke. A final-ten-second cue adds urgency.</p>
                  </div>
                  <div className="whacka-highlight">
                    <span className="whacka-highlight-number" aria-hidden="true">04</span>
                    <h3>Style &amp; collaboration</h3>
                    <p>SCSS shapes the interface. Git, GitHub, and VS Code Live Share supported our shared development workflow.</p>
                  </div>
                </div>
              </section>
            </article>
          </ModalBody>

          <ModalFooter className="whacka-modal-footer">
            <span className="whacka-footer-credit"><Copyright /></span>
            <div className="whacka-footer-controls" role="group" aria-label="Persistent project actions">
              <a className="whacka-action whacka-action-primary whacka-footer-play" href="https://whackamolewhackamole.web.app" target="_blank" rel="noopener noreferrer">
                Play! <span aria-hidden="true">↗</span>
              </a>
              <a className="whacka-action whacka-action-secondary whacka-footer-github" href="https://github.com/ibrahim-karim-22/portfolioprojectgame" target="_blank" rel="noopener noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
              <Button type="button" color="link" className="whacka-close-action" onClick={closeModal}>Close</Button>
            </div>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}

export default WhackaModal;
