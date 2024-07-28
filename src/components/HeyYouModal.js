import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

function HeyYouModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="hey-you-modal-main-div"
    >
      <ModalHeader toggle={closeModal} className="hey-you-modal-header">
        <div className="hey-you-modal-header-text">HeyYou</div>
      </ModalHeader>
      <ModalBody className="hey-you-modal-body">
        <div className="hey-you-modal-header-sub-text-container">
          <div className="hey-you-modal-header-sub-text">
            Location Tracker/Chat Service: JavaScript, React Native, Atlas,
            MongoDB, Docker, Socket.io, Google Maps API, Google Cloud, Google Run, Node.js, Express.js, SCSS,
            SASS.
          </div>
        </div>
        <div className="hey-you-modal-info">
          Developed a React Native app for real-time location tracking
          and messaging, enhancing seamless communication. Utilized Atlas,
          Docker, Google Cloud, Node.js, Express.js, and Socket.io, achieving
          99.9% data transmission reliability and scalability. Developed
          secure group access keys, boosting data privacy by roughly 30% through
          advanced encryption techniques.
        </div>
      </ModalBody>
      <ModalFooter className="Hey-you-modal-footer">
        <Button
          color="danger"
          className="hey-you-modal-close-btn"
          onClick={closeModal}
        >
          Close
        </Button>
        <Button
          color="warning"
          className="hey-you-request-apk-btn"
          onClick={(src) => window.open("https://drive.google.com/file/d/1qS72H4LG1BF-wKSWfJiPhMNqGe5kkRZ_/view?usp=drive_link", "_blank")}
        >
          Watch Now!
        </Button>
        <Button
          color="info"
          className="hey-you-modal-github-btn"
          onClick={(src) =>
            window.open(
              "https://github.com/ibrahim-karim-22/fullStackPortfolioProject"
            )
          }
        >
          GitHub
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default HeyYouModal;
