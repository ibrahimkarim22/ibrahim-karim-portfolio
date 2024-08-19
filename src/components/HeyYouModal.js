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
import native from "../images/native.png";
import run from "../images/run.png";
import expo from "../images/expo.png";
import phoneHeyYouMenu from "../images/phoneHeyYouMenu.png";
import phoneHeyYouMain from "../images/phoneHeyYouMain.png";
import phoneHeyYouGenerate from "../images/phoneHeyYouGenerate.png";
import phoneHeyYouJoined from "../images/phoneHeyYouJoined.png";
import phoneHeyYouMap from "../images/phoneHeyYouMap.png";
import phoneHeyYouChat from "../images/phoneHeyYouChat.png";

function HeyYouModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="hey-you-modal-main-div"
    >
      {isOpen && (
        <ModalHeader toggle={closeModal} className="hey-you-modal-header">
          <div className="hey-you-modal-header-text">HeyYou</div>
          <div className="hey-you-modal-header-text-two">
            Location Tracking & Messaging
          </div>
        </ModalHeader>
      )}
      {isOpen && (
        <ModalBody className="hey-you-modal-body-main">
          <HorizontalScroll className="hey-you-horizontal-scroll">
            <div className="hey-you-main-title-page-container hey-you-page">
              <div className="hey-you-modal-main-title">HeyYou</div>
              <div className="hey-you-honors-title-container">
                <div className="hey-you-honors-title">
                  Nucamp Full-Stack Honors Award
                </div>
              </div>
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
                I developed a React Native app for real-time location tracking
                and messaging. The server was created using Express.js and
                Node.js, and I used MongoDB Atlas for storing user account
                information, messages, and location data.
              </div>
            </div>
            <div className="hey-you-modal-react-native-page-container hey-you-page">
              <div className="hey-you-phone-flex-container">
                <div className="hey-you-phone-menu-container">
                  <img
                    src={phoneHeyYouMenu}
                    className="hey-you-phone-menu"
                    alt="phone menu"
                  />
                </div>
                <div className="hey-you-phone-main-container">
                  <img
                    src={phoneHeyYouMain}
                    className="hey-you-phone-main"
                    alt="phone main"
                  />
                </div>
                <div className="hey-you-phone-generate-container">
                  <img
                    src={phoneHeyYouGenerate}
                    className="hey-you-phone-generate"
                    alt="phone generate"
                  />
                </div>
                <div className="hey-you-phone-joined-container">
                  <img
                    src={phoneHeyYouJoined}
                    className="hey-you-phone-joined"
                    alt="phone joined"
                  />
                </div>
                <div className="hey-you-phone-map-container">
                  <img
                    src={phoneHeyYouMap}
                    className="hey-you-phone-map"
                    alt="phone map"
                  />
                </div>
                <div className="hey-you-phone-chat-container">
                  <img
                    src={phoneHeyYouChat}
                    className="hey-you-phone-chat"
                    alt="phone chat"
                  />
                </div>
              </div>
            </div>
            <div className="hey-you-modal-realtime-page-container hey-you-page">
              <div className="real-time-second-bg-container"></div>

              <div className="socket-io-logo-container-two">
                <img
                  src={socketio}
                  className="socket-io-logo-two"
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
                with delays, as the app would have to rely on periodic polling
                or manual refreshes. Socket.io solves this problem by enabling
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
              <i class="fas fa-user-secret"></i>
              <div className="safety-features-paragraph">
                To facilitate tracking between multiple devices, I implemented
                an access key system using uuidv4(). This key can be shared
                between devices, allowing any number of devices with the same
                access key to view each other's locations and messages.
              </div>
              <div className="safety-features-paragraph-two">
                To protect user privacy, location data is deleted from the
                MonogDB database upon logout. Also, no tracking happens unless
                the user has the map displayed and manually inputs the group
                access key.
              </div>
              <i class="fas fa-key"></i>
            </div>
            <div className="hey-you-modal-deployment-page-container hey-you-page">
              <div className="hey-you-modal-deployment-title-container"></div>
              <div className="hey-you-modal-deployment-title">
                App Deployment
              </div>
              <div className="hey-you-modal-deployment-paragraph-backend">
                For the backend, I containerized the application using Docker,
                creating an image with a Dockerfile. This image was then
                uploaded to Google Cloud Run for hosting the server.
              </div>
              <div className="moon-container">
                <div className="moon"></div>
              </div>
              <div className="stars-grid-container">
                <div className="star-one-container">
                  <div className="star-one"></div>
                </div>

                <div className="star-two-container">
                  <div className="star-two"></div>
                </div>

                <div className="star-three-container">
                  <div className="star-three"></div>
                </div>

                <div className="star-four-container">
                  <div className="star-four"></div>
                </div>
              </div>
              <div className="water-div-at-distance"></div>

              <div className="water-div-further"></div>
              <div className="water-div-closer"></div>
              <div className="water-particle-one"></div>
              <div className="water-particle-two"></div>

              <div className="docker-logo-container">
                <img src={docker} className="docker-logo" alt="docker logo" />
              </div>
              <div className="google-cloud-run-building"></div>
              <div className="google-cloud-run-building-title">Cloud Run</div>
              <div className="google-cloud-run-logo-container">
                <img
                  src={run}
                  className="google-cloud-run-logo"
                  alt="google cloud run logo"
                />
              </div>
              <div className="expo-building"></div>
              <div className="expo-building-title">Expo</div>
              <div className="expo-logo-container">
                <img src={expo} className="expo-logo" alt="expo logo" />
              </div>
              <div className="react-native-building"></div>

              <div className="react-native-logo-container">
                <img
                  src={native}
                  className="react-native-logo"
                  alt="react native logo"
                />
              </div>
              <div className="hey-you-modal-deployment-paragraph-frontend">
                For the frontend, I built and deployed the Android APK using
                React Native and Expo, generating an APK that is easily
                accessible on Android devices.
              </div>
            </div>
            <div className="hey-you-modal-project-video-page-container hey-you-page">
              <div className="hey-you-modal-project-video-title">
                Honors Project Video Submission
              </div>
              <div className="hey-you-modal-project-video-container">
                <iframe
                  className="hey-you-modal-project-video"
                  title="Honor Project Video Submission"
                  width="1024"
                  height="576"
                  src="https://www.youtube.com/embed/CShAZT8jykY?si=ruBs8fOIFK2vkVzq"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </HorizontalScroll>
        </ModalBody>
      )}
      {isOpen && (
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
            APK!
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
      )}
    </Modal>
  );
}

export default HeyYouModal;
