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
                  Whack a Mole is an online game developed collaboratively by my
                  colleagues, Brandon O'Shea and Sam Golshan, and myself. The
                  project emphasized teamwork, utilizing Git, GitHub, and VS
                  Code Live Share for collaboration. The game itself is
                  a 2D challenge where your goal is to click as many moles as
                  possible. But be careful—you only have one life! Avoid hitting
                  empty cells, don't miss the extra points mole, and definitely
                  steer clear of the Nuke!
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
                  The game was created using vanilla JavaScript, HTML, and SCSS.
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
                <div className="event-listeners-title">Event listeners</div>
              </div>
              <div className="button-clicks-text-container">
                <div className="button-clicks-text">
                  Event listeners were attached to buttons like startGameBtn,
                  endGameBtn, and goBackBtn to trigger functions such as
                  starting the game, ending it, or navigating back.
                </div>
              </div>
              <div className="grid-interactions-text-container">
                <div className="grid-interactions-text">
                  Grid Interactions: Each grid cell (button) was assigned a
                  click event listener to handle scoring actions when the player
                  clicks on moles or other game elements like bombs.
                </div>
              </div>
              <div className="sound-text-container">
                <div className="sound-text">
                  Specific event listeners were set up to play sounds when
                  certain actions occurred, like starting the game, clicking on
                  a mole, an extra points mole, an empty cell, or a nuke.
                </div>
              </div>
              <div className="timers-text-container">
                <div className="timers-text">
                  Timers and Intervals: Event listeners were used to manage game
                  timing, including countdown timers and intervals that control
                  mole appearance, bomb handling, and sound playback.
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
