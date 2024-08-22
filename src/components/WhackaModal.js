import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import js from "../images/js.png";
import html from "../images/html.png";
import css from "../images/css.png";
import sass from "../images/sass.png";
import whacka from "../images/whacka.gif";
import whackaCode from "../images/whackaCode.png";

function WhackaModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="whacka-modal-main-div"
    >
      {isOpen && (
        <ModalHeader toggle={closeModal} className="whacka-modal-header">
          <div className="whacka-modal-header-text">Whack a Mole</div>

          <div className="whacka-modal-header-text-two">Online Game</div>
        </ModalHeader>
      )}
      {isOpen && (
        <ModalBody className="whacka-modal-main">
          <div className="whacka-modal-flex-main">
            <div className="whacka-modal-page-one">
              <div className="whacka-modal-info-container">
                <div className="whacka-modal-info">
                  <span className="red-text">Whack a Mole</span> is an online
                  game developed collaboratively by my colleagues,
                  <span className="higlighter-green-text">
                    {" "}
                    Brandon O'Shea
                  </span>{" "}
                  and <span className="higlighter-green-text">
                    Sam Golshan
                  </span>{" "}
                  , and <span className="higlighter-green-text">myself</span>.
                  The project emphasized teamwork, utilizing{" "}
                  <span className="blue-text">Git</span>,{" "}
                  <span className="blue-text"> GitHub</span>, and{" "}
                  <span className="blue-text"> VS Code Live Share</span> for
                  collaboration. The game itself is a 2D challenge where your
                  goal is to click as many moles as possible. But be careful—you
                  only have one life! Avoid hitting empty cells, don't miss the
                  extra points mole, and definitely steer clear of the Nuke!
                </div>
              </div>
              <div className="whacka-modal-js-logo-container">
                <img src={js} alt="js logo" className="whacka-modal-js-image" />
              </div>
              <div className="whacka-modal-html-logo-container">
                <img
                  src={html}
                  alt="html logo"
                  className="whacka-modal-html-image"
                />
              </div>

              <div className="whacka-modal-sass-logo-container">
                <img
                  src={sass}
                  alt="sass logo"
                  className="whacka-modal-sass-image"
                />
              </div>
            </div>

            <div className="whacka-modal-page-two">
              <div className="whacka-paragraph-two-container">
                <div className="whacka-paragraph-two">
                  The game was created using{" "}
                  <span className="blue-text">HTML</span>,{" "}
                  <span className="yellow-text">vanilla JavaScript</span>, and{" "}
                  <span className="pink-text">SCSS</span>.
                </div>
              </div>
              <div className="whacka-gif-container">
                <img
                  src={whacka}
                  alt="whacka mole gif"
                  className="whacka-gif"
                />
              </div>
            </div>
            <div className="whacka-modal-page-three">
              <div className="event-listeners-title-container">
                <div className="event-listeners-title">Event listeners!</div>
              </div>
              <div className="button-clicks-text-container">
                <div className="button-clicks-text">
                  <span className="blue-text">Button Clicks:</span> Event
                  listeners were attached to buttons like{" "}
                  <span className="highlighter-green-text">"startGameBtn</span>,{" "}
                  <span className="highlighter-green-text">"endGameBtn"</span>,
                  and <span className="highlighter-green-text">goBackBtn"</span>{" "}
                  to handle the start, end, and go back buttons.
                </div>
              </div>
              <div className="grid-interactions-text-container">
                <div className="grid-interactions-text">
                  <span className="yellow-text">Grid Interactions:</span> Each{" "}
                  <span className="highlighter-green-text">
                    grid cell (button)
                  </span>{" "}
                  was assigned a click event listener to{" "}
                  <span className="highlighter-green-text">
                    handle scoring actions
                  </span>{" "}
                  when the player clicks on moles or other game elements such as
                  extra points moles. Players can also lose points by clicking
                  empty cells or end the game by clicking the nuke.
                </div>
              </div>
              <div className="sound-text-container">
                <div className="sound-text">
                  <span className="violet-text">Sound:</span> Event listeners
                  were set up to{" "}
                  <span className="highlighter-green-text">
                    trigger sound effects at key moments in the game
                  </span>
                  . For example, distinct sounds play when the game starts, when
                  a player successfully clicks on a mole, hits an extra points
                  mole, misses by clicking on an empty cell, or accidentally
                  clicks on a nuke.
                </div>
              </div>
              <div className="timers-text-container">
                <div className="timers-text">
                  <span className="pink-text">Timers and Intervals:</span> Event
                  listeners are used to manage game timing, including{" "}
                  <span className="highlighter-green-text">
                    countdown timers
                  </span>{" "}
                  and <span className="highlighter-green-text">intervals</span>{" "}
                  that control object appearances and sounds. For instance, a 'teasing' sound plays during the
                  first 10 seconds to engage players from the start, while
                  a distinct countdown sound intensifies the final 10 seconds,
                  increasing the urgency.
                </div>
              </div>

              <div className="whacka-code-image-container">
                <img
                  src={whackaCode}
                  alt="whacka mole code"
                  className="whacka-code-image"
                />
              </div>
              <div className="whacka-copyright-container">
                <div className="copyright-text">&copy; 2024 Ibrahim Karim.</div>
              </div>
            </div>
          </div>
        </ModalBody>
      )}
      {isOpen && (
        <ModalFooter className="whacka-modal-footer">
          <Button
            color="danger"
            className="modal-close-btn"
            onClick={closeModal}
          >
            Close
          </Button>
          <Button
            color="warning"
            className="whacka-play-btn"
            onClick={(src) =>
              window.open("https://whackamolewhackamole.web.app", "_blank")
            }
          >
            Play!
          </Button>
          <Button
            color="info"
            className="whacka-modal-github-btn"
            onClick={(src) =>
              window.open(
                "https://github.com/ibrahim-karim-22/portfolioprojectgame"
              )
            }
          >
            GitHub
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}

export default WhackaModal;
