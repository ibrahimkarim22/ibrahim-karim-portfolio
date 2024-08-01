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
            <div className="hey-you-modal-main-title">HeyYou</div>
          </div>
          <div className="hey-you-modal-tools-container">
            <div className="hey-you-modal-bg-container"></div>
            <div className="hey-you-modal-backend-container">
              <div className="hey-you-modal-backend-text">
                <div>Backend</div>
                <div>Node.js, Express.js, MongoDB Atlas</div>
              </div>
            </div>
            <div className="hey-you-modal-real-time-container">
              <div className="hey-you-modal-real-time-text">
                <div>Real-time Updates</div>
                <div>Socket.io</div>
              </div>
            </div>
            <div className="hey-you-modal-containerization-container">
              <div className="hey-you-modal-containerization-text">
                <div>Containerization</div>
                <div>Docker, Google Cloud Run</div>
              </div>
            </div>
            <div className="hey-you-modal-frontend-container">
              <div className="hey-you-modal-frontend-text">
                <div>Frontend</div>
                <div>React Native, Expo</div>
              </div>
            </div>
            <div className="hey-you-modal-location-services-container">
              <div className="hey-you-modal-location-services-text">
                <div>Location Services</div>
                <div>Google Maps API, expo-location </div>
              </div>
            </div>
            <div className="hey-you-modal-access-key-container">
              <div className="hey-you-modal-access-key-text">
                <div>Access Key System</div>
                <div>uui4vd()</div>
              </div>
            </div>
            <div className="hey-you-modal-ibrahim-container">
              <div className="hey-you-modal-ibrahim-text">
                <div>Ibrahim</div>
                <div>
                  <i class="fa-solid fa-heart" style={{ color: "red", margin: "2px" }}></i>
                  <i class="fa-solid fa-heart" style={{ color: "red", margin: "2px" }}></i>
                  <i class="fa-solid fa-grin-squint" style={{ color: "gold", margin: "2px" }}></i>
                  <i class="fa-solid fa-smile" style={{ color: "gold", margin: "2px" }}></i>
                </div>
            </div>
                <div className="hey-you-modal-text-box-container">
                  <div className="hey-you-modal-text-box">
                    <div className="hey-you-modal-text-box-text">
                      It looks like you're 5 minutes away!
                    </div>
                  </div>
                </div>
            {/* <div className="hey-you-modal-tools"> */}
              {/* <div className="js-logo-hey-you-container">
              <img className="js-logo-hey-you" src={js} alt="js logo" />
            </div>
            <div className="docker-logo-hey-you-container">
              <img
                className="docker-logo-hey-you"
                src={docker}
                alt="docker logo"
              />
            </div> */}
            {/* </div> */}
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
