import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import js from "../images/js.png";
import html from "../images/html.png";
import css from "../images/css.png";
import sass from "../images/sass.png";

function WhackaModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="whacka-modal-main-div"
    >
      <ModalHeader toggle={closeModal} className="whacka-modal-header">
        <div className="whacka-modal-header-text">Whack a Mole</div>
        <div className="whacka-modal-header-text-two">Online Game</div>
      </ModalHeader>
      <ModalBody className="whacka-modal-main">
        <div className="whacka-modal-flex-main">
          <div className="whacka-modal-page-one">
            <div className="whacka-modal-info-container">
              <div className="whacka-modal-info">
                Whack a Mole is a JavaScript game created by my two colleagues
                (Brandon O'Shea and Sam Golshan) and I. Team work though Git and
                GitHub plus VS Code Live Share was the most important aspect of
                this project. It is a 2D game where you have to hit as many
                moles as you can. Don't forget: you have 1 life. Don't hit the
                empty holes. Don't miss the extra points mole. Do Not click on
                the Nuke!
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
            <div className="whacka-modal-css-logo-container">
              <img
                src={css}
                alt="css logo"
                className="whacka-modal-css-image"
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
                In this interactive "Whack-a-Mole" game, players engage with a
                grid where moles, extra point moles, and bombs appear randomly.
                The goal is to score points by clicking on the moles while
                avoiding bombs, which end the game if clicked. Each action is
                accompanied by sound effects, and timers control the pace,
                making the gameplay both challenging and immersive.
              </div>
            </div>
            <div className="whacka-gif-container">
              <img
                src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif"
                alt="whacka mole gif"
                className="whacka-gif"
              />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="whacka-modal-footer">
        <Button color="danger" className="modal-close-btn" onClick={closeModal}>
          Close
        </Button>
        <Button
          color="warning"
          className="whacka-play-btn"
          onClick={(src) =>
            window.open("https://whackamolewhackamole.web.app", "_blank")
          }
        >
          Play Now!
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
    </Modal>
  );
}

export default WhackaModal;
