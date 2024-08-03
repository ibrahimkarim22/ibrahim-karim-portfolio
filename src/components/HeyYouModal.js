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
import express from "../images/express.png";
import mongo from "../images/mongo.png";
import node from "../images/node.png";
import socketio from "../images/socketio.png";

function HeyYouModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="hey-you-modal-main-div"
    >
      <ModalHeader toggle={closeModal} className="hey-you-modal-header">
        <div className="hey-you-modal-header-text">
          Location Tracking & Messaging
        </div>
      </ModalHeader>
      <ModalBody className="hey-you-modal-body-main">
        <HorizontalScroll className="hey-you-horizontal-scroll">
          <div className="hey-you-main-title-page-container hey-you-page">
            <div className="hey-you-modal-main-title">HeyYou</div>
          </div>
          <div className="hey-you-modal-backend-page-container hey-you-page">
            <div className="hey-you-modal-backend">
              <div className="hey-you-modal-backend-text">Backend</div>
              <div className="bg-light-hey-you-modal"></div>
              <div className="bg-light-hey-you-modal-two"></div>
              <div className="bg-light-hey-you-modal-three"></div>
              
              <div className="node-hey-you-modal-container">
                <img
                  src={node}
                  className="node-hey-you-modal"
                  alt="node.js logo"
                />
              </div>
              <div className="express-hey-you-modal-container">
                <img
                  src={express}
                  className="express-hey-you-modal"
                  alt="express logo"
                />
              </div>
              <div className="mongo-hey-you-modal-container">
                <img
                  src={mongo}
                  className="mongo-hey-you-modal"
                  alt="mongodb logo"
                />
              </div>
              <div className="hey-you-modal-backend-logo-names">
                Node.js, Express.js, MongoDB Atlas
              </div>
            </div>
            
                <div className="hey-you-bg-logo-one">HeyYou</div>
           
            <div className="hey-you-modal-backend-paragraph">
              I developed a React Native app for real-time location tracking and
              messaging. The server was created using Express.js and Node.js,
              and I used MongoDB Atlas for storing user account information,
              messages, and location data. User location data is deleted from
              the database upon logout to ensure privacy.
            </div>
          </div>
          <div className='hey-you-modal-realtime-page-container hey-you-page'>
            <div className="socket-io-logo-container">
              <img
                src={socketio}
                className="socket-io-logo"
                alt="socket.io logo"
              />
               </div>
               <div className="hey-you-modal-realtime-title">Real-Time Updates</div>

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
