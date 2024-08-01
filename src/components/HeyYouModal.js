import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
// import {
//   Parallax,
//   ParallaxProvider,
//   ParallaxBanner,
// } from "react-scroll-parallax";
import HorizontalScroll from "./HorizontalScroll";
import js from "../images/js.png";
import docker from "../images/docker.png";

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
      <ModalBody className="hey-you-modal-body-main">
        <HorizontalScroll className="hey-you-horizontal-scroll">
          <div className="hey-you-main-title-container">
            <div className="hey-you-modal-header-sub-text-container">
              <div className="hey-you-modal-header-sub-text">
                Location Tracker/Chat Service: JavaScript, React Native, Atlas,
                MongoDB, Docker, Socket.io, Google Maps API, Google Cloud,
                Google Run, Node.js, Express.js, SCSS, SASS.
              </div>
            </div>
            <div className="hey-you-modal-main-title">HeyYou</div>
            <div className="js-logo-hey-you-container">
              <img className="js-logo-hey-you" src={js} alt="js logo" />
            </div>
            <div className="docker-logo-hey-you-container">
              <img className="docker-logo-hey-you" src={docker} alt="docker logo" />
            </div>
          </div>
          <div className="hey-you-modal-info-container">
            <div className="hey-you-modal-info">
              Developed a React Native app for real-time location tracking and
              messaging, enhancing seamless communication. Utilized Atlas,
              Docker, Google Cloud, Node.js, Express.js, and Socket.io,
              achieving 99.9% data transmission reliability and scalability.
              Developed secure group access keys, boosting data privacy by
              roughly 30% through advanced encryption techniques.
            </div>


          </div>
        </HorizontalScroll>
      </ModalBody>
      <ModalFooter className="hey-you-modal-footer">
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
          onClick={() =>
            window.open(
              "https://drive.google.com/file/d/1qS72H4LG1BF-wKSWfJiPhMNqGe5kkRZ_/view?usp=drive_link",
              "_blank"
            )
          }
        >
          Request APK!
        </Button>
        <Button
          color="info"
          className="hey-you-modal-github-btn"
          onClick={() =>
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
