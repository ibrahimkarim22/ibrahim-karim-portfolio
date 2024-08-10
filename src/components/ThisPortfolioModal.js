import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

function ThisPortfolioModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="this-portfolio-modal-main-div"
    >
      <ModalHeader toggle={closeModal} className="this-portfolio-modal-header">
        <div className="this-portfolio-modal-header-text">This Portfolio</div>
      </ModalHeader>
      <ModalBody className="this-portfolio-modal-body-main">
        {/* <div className="this-portfolio-modal-header-sub-text-container">
          <div className="this-portfolio-modal-header-sub-text">
            Tools I used to build this portfolio: JavaScript, React, Firebase,
            React Fiber, Reactstrap, SCSS, SASS, Blender, Photoshop.
          </div>
        </div> */}
        <div className="this-portfolio-main-flex-container">
          {/* PAGE 1 */}
          <div className="this-portfolio-page-one">
            <div className="this-portfolio-modal-info-container">
              <div className="this-portfolio-modal-info">
                For this portfolio, I set out to challenge my design and styling
                skills. I used React for the UI and JavaScript to implement
                horizontal scrolling and loading progress on launch. Blender was
                essential for modeling and animating 3D objects like the
                portfolio title, Android phones, and the 3D resume. To optimize
                for various viewports, I applied modern grid displays with flex
                containers, which also played a key role in creating the stage
                curtain. CSS animations and keyframes brought the Docker whale
                and other animations to life.
              </div>
            </div>
          </div>

          {/* PAGE 2 */}
          <div className="this-portfolio-page-two">
            <div className="grid-title-text-container">
              <div className="grid-title-text">Grid Layout</div>
            </div>
          </div>
          {/* PAGE 3 */}
          <div className="this-portfolio-page-three">
            <div className="css-animation-title-text-container">
              <div className="css-animation-title-text">
                CSS animations and keyframes
              </div>
            </div>
          </div>
          {/* PAGE 4 */}
          <div className="this-portfolio-page-four">
            <div className="three-dee-implementation-title-text-container">
              <div className="three-dee-implementation-title-text">
                3D Implementation
              </div>
            </div>
          </div>

          {/* PAGE 5 */}
          <div className="this-portfolio-page-five"></div>

          {/* PAGE 6 */}
          <div className="this-portfolio-page-six"></div>

          {/* PAGE 7 */}
          <div className="this-portfolio-page-seven"></div>
        </div>
      </ModalBody>
      <ModalFooter className="this-portfolio-modal-footer">
        <Button
          color="danger"
          className="this-portfolio-modal-close-btn"
          onClick={closeModal}
        >
          Close
        </Button>
        <Button
          color="warning"
          className="this-portfolio-site-btn"
          onClick={(src) => "mailto:ib2ra2heem@gmail.com"}
        >
          Email Me!
        </Button>
        <Button
          color="info"
          className="this-portfolio-modal-github-btn"
          onClick={(src) =>
            window.open(
              "https://github.com/ibrahim-karim-22/ibrahim-karim-portfolio"
            )
          }
        >
          GitHub
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ThisPortfolioModal;
