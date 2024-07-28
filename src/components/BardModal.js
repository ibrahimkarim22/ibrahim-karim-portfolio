import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

function BardModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="bard-modal-main-div"
    >
      <ModalHeader toggle={closeModal} className="bard-modal-header">
        <div className="bard-modal-header-text">BARD</div>
      </ModalHeader>
      <ModalBody className="bard-modal-body">
        <div className="bard-modal-header-sub-text-container">
          <div className="bard-modal-header-sub-text">
            Shakespeare Online Course: JavaScript, React, Firebase, Firestore, Redux,
            SCSS, SASS. complete quizzes and earn medals, reach your certrificate!
          </div>
        </div>
        <div className="bard-modal-info">
          Created an online course platform for all Shakespeare’s plays with
          interactive quizzes, medals, certificates and more. Integrated
          Firebase (firestore) for secure and scalable backend, guaranteeing
          reliable data management and user authentication. Optimized user
          state management by leveraging Redux.
        </div>
      </ModalBody>
      <ModalFooter className="bard-modal-footer">
        <Button
          color="danger"
          className="bard-modal-close-btn"
          onClick={closeModal}
        >
          Close
        </Button>
        <Button
          color="warning"
          className="bard-apk-download-btn"
          onClick={(src) =>
            window.open(
              "https://drive.google.com/file/d/1kblapPn0vab5BiiJwcaMAioJ5yW14cCf/view?usp=drive_link",
              "_blank"
            )
          }
        >
          Download Android APK!
        </Button>
        <Button
          color="info"
          className="bard-modal-github-btn"
          onClick={(src) =>
            window.open(
              "https://github.com/ibrahim-karim-22/reactNativePortfolioProject"
            )
          }
        >
          GitHub
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default BardModal;
