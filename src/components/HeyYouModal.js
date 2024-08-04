import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import HorizontalScroll from "./HorizontalScroll";
import express from "../images/express.png";
import mongo from "../images/mongo.png";
import node from "../images/node.png";
import socketio from "../images/socketio.png";
import socketJoin from "../images/socketJoin.png";
import socketCreate from "../images/socketCreate.png";
import socketLocation from "../images/socketLocation.png";
import socketMessage from "../images/socketMessage.png";
import googleMaps from "../images/googleMaps.png";
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
              messages, and location data.
            </div>
          </div>
          <div className="hey-you-modal-react-native-page-container hey-you-page">
            <div className="hey-you-modal-react-native-title">React Native</div>
          </div>
          <div className="hey-you-modal-realtime-page-container hey-you-page">
            <div className="real-time-second-bg-container"></div>
            <div className="socket-io-logo-container">
              <img
                src={socketio}
                className="socket-io-logo"
                alt="socket.io logo"
              />
            </div>
            <div className="socket-io-logo-container-two">
              <img
                src={socketio}
                className="socket-io-logo-two"
                alt="socket.io logo"
              />
            </div>
            <div className="socket-io-logo-container-three">
              <img
                src={socketio}
                className="socket-io-logo-three"
                alt="socket.io logo"
              />
            </div>
            <div className="socket-io-logo-container-four">
              <img
                src={socketio}
                className="socket-io-logo-four"
                alt="socket.io logo"
              />
            </div>
            <div className="socket-io-logo-container-five">
              <img
                src={socketio}
                className="socket-io-logo-five"
                alt="socket.io logo"
              />
            </div>

            <div className="socket-io-create-img-container">
              <img
                className="socket-io-create-img"
                src={socketCreate}
                alt="socket.emit createGroup"
              />
            </div>
            <div className="socket-io-join-img-container">
              <img
                src={socketJoin}
                className="socket-io-join-img"
                alt="socket.emit joinGroup"
              />
            </div>
            <div className="socket-io-location-img-container">
              <img
                src={socketLocation}
                className="socket-io-location-img"
                alt="socket.emit locationUpdate"
              />
            </div>
            <div className="socket-io-message-img-container">
              <img
                src={socketMessage}
                className="socket-io-message-img"
                alt="socket.emit messageUpdate"
              />
            </div>

            <div className="hey-you-modal-realtime-title">
              Real-Time Updates
            </div>
            <div className="hey-you-modal-realtime-paragraph">
              To instantly update users' messages and location coordinates in
              the MongoDB database and emit that information in real-time, I
              decided to use Socket.io. Without Socket.io, updates would occur
              with delays, as the app would have to rely on periodic polling or
              manual refreshes. Socket.io solves this problem by enabling
              real-time, bidirectional communication between clients and
              servers, providing users with the most current information for
              location tracking, messaging, and group management in the HeyYou
              app.
            </div>
          </div>
          <div className="google-maps-api-page-container hey-you-page">
            <div className="google-maps-api-title">Google Maps API</div>
            <div className="google-maps-api-paragraph">
              The HeyYou app integrates with the Google Maps API to provide
              real-time location tracking. The current locations of users are
              fetched using the expo-location module and updated on the map,
              offering an accurate and interactive visual representation of
              users' movements.
            </div>

            <div className="google-maps-api-logos-container">
              <div className="google-maps-api-logo-one-container">
                <img
                  src={googleMaps}
                  className="google-maps-api-logo-one"
                  alt="google maps logo"
                />
              </div>

              <div className="google-maps-api-logo-two-container">
                <img
                  src={googleMaps}
                  className="google-maps-api-logo-two"
                  alt="google maps logo two"
                />
              </div>
            </div>
          </div>
          <div className="saftey-features-page-container hey-you-page">
            <div className="saftey-features-title">Saftey Features</div>
            <div className="safety-features-paragraph">
              To facilitate tracking between multiple devices, I implemented an
              access key system using uuidv4(). This key can be shared between
              devices, allowing any number of devices with the same access key
              to view each other's locations and messages.
            </div>
            <div className="safety-features-paragraph-two">
              To protect user privacy, location data is deleted from the MonogDB
              database upon logout. Also, no tracking happens unless the user
              has the map displayed and manually inputs the group access key.
            </div>
          </div>
          <div className="hey-you-modal-deployment-page-container hey-you-page">
            <div className="hey-you-modal-deployment-title">App Deployment</div>
            <div className="hey-you-modal-deployment-paragraph">
              For the backend, I containerized the application using Docker,
              creating an image with a Dockerfile. This image was then uploaded
              to Google Cloud Run for hosting the server. For the frontend, I
              built and deployed the Android APK using React Native and Expo,
              generating an APK that is easily accessible on Android devices.
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
