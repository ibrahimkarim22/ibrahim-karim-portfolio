import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import chaplinVagabond from "../images/chaplinVagabond.jpg";
import chaplinAutoRace from "../images/chaplinAutoRace.jpg";
import chaplinBehindTheScreen from "../images/chaplinBehindTheScreen.jpg";
import chaplinInThePark from "../images/chaplinInThePark.jpg";
import chaplinOneAM from "../images/chaplinOneAM.jpg";
import chaplinANightInTheShow from "../images/chaplinANightInTheShow.jpg";
import chaplinTheCure from "../images/chaplinTheCure.webp";
import chaplinCharlot from "../images/chaplinCharlot.jpg";
import fox from "../images/fox.png";
import natGeoWild from "../images/natGeoWild.jpg";
import nasaTV from "../images/nasaTV.webp";
import euronews from "../images/euronews.jpg";
import france from "../images/france.jpg";
import nbc from "../images/nbc.webp";
import js from "../images/js.png";
import reactLogo from "../images/reactLogo.png";
import sass from "../images/sass.png";
import firebase from "../images/firebase.png";
import bootstrapLogo from "../images/bootstrapLogo.png";
import redux from "../images/redux.png";
import kirspyFavorite from "../images/krispyFavorite.png";
import krispyFavoriteGif from "../images/krispyFavoriteGif.gif";
import krispyMapCode from "../images/krispyMapCode.png";
import krispyRoutingCode from "../images/krispyRoutingCode.png";
import krispyBootstrapCode from "../images/krispyBootstrapCode.png";
import krispyParallaxCode from "../images/krispyParallaxCode.png";

function KrispyModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="krispy-modal-main-div"
    >
      {isOpen && (
      <ModalHeader toggle={closeModal} className="krispy-modal-header">
        <div className="krispy-modal-header-text">KRISPY</div>
        <div className="krispy-modal-header-text-two">Streaming Service</div>
      </ModalHeader>
      )}
      {isOpen && (
      <ModalBody className="krispy-modal-body-main">
        {/* <div className="krispy-modal-header-sub-text-container">
          <div className="krispy-modal-header-sub-text">
            Streaming Service: JavaScript, React, Firebase, Firestore, Redux,
            SCSS, SASS.
          </div>
        </div> */}
        <div className="krispy-modal-flex-main">
          <div className="krispy-modal-page-one">
            <div className="krispy-modal-js-logo-container">
              <img
                className="krispy-modal-js-logo"
                src={js}
                alt="javascript logo"
              />
            </div>
            <div className="krispy-modal-react-logo-container">
              <img
                className="krispy-modal-react-logo"
                src={reactLogo}
                alt="react logo"
              />
            </div>
            <div className="krispy-modal-redux-logo-container">
              <img
                className="krispy-modal-redux-logo"
                src={redux}
                alt="redux logo"
              />
            </div>
            <div className="krispy-modal-sass-logo-container">
              <img
                className="krispy-modal-sass-logo"
                src={sass}
                alt="sass logo"
              />
            </div>
            <div className="krispy-modal-firebase-logo-container">
              <img
                className="krispy-modal-firebase-logo"
                src={firebase}
                alt="firebase logo"
              />
            </div>
            <div className="krispy-modal-firestore-logo-container">
              <img
                className="krispy-modal-firestore-logo"
                src={bootstrapLogo}
                alt="firestore logo"
              />
            </div>

            <div className="krispy-modal-info-container">
              <div className="krispy-modal-info">
                Krispy is a streaming service I created with React, Redux,
                firebase, Bootstrap and SCSS. Watch live TV streams, live feeds
                from the globe, and a collection of Charlie Chaplin's public
                domain films.
              </div>
            </div>
            <div className="chaplin-vagabond-container">
              <img
                className="chaplin-vagabond"
                src={chaplinVagabond}
                alt="charlie chaplin Vagabond"
              />
            </div>
            <div className="chaplin-auto-race-container">
              <img
                className="chaplin-auto-race"
                src={chaplinAutoRace}
                alt="charlie chaplin Auto Race"
              />
            </div>
            <div className="chaplin-behind-the-screen-container">
              <img
                className="chaplin-behind-the-screen"
                src={chaplinBehindTheScreen}
                alt="charlie chaplin behind the screen"
              />
            </div>

            <div className="chaplin-in-the-park-container">
              <img
                className="chaplin-in-the-park"
                src={chaplinInThePark}
                alt="charlie chaplin in the park"
              />
            </div>

            <div className="chaplin-one-am-container">
              <img
                className="chaplin-one-am"
                src={chaplinOneAM}
                alt="charlie chaplin one am"
              />
            </div>

            <div className="chaplin-a-night-in-the-show-container">
              <img
                className="chaplin-a-night-in-the-show"
                src={chaplinANightInTheShow}
                alt="charlie chaplin a night in the show"
              />
            </div>
            <div className="chaplin-charlot-container">
              <img
                className="chaplin-charlot"
                src={chaplinCharlot}
                alt="charlie chaplin charlot"
              />
            </div>

            <div className="chaplin-the-cure-container">
              <img
                className="chaplin-the-cure"
                src={chaplinTheCure}
                alt="charlie chaplin the cure"
              />
            </div>
            <div className="fox-container">
              <img className="fox" src={fox} alt="fox news" />
            </div>
            <div className="natgeo-container">
              <img className="natgeo" src={natGeoWild} alt="nat geo wild" />
            </div>
            <div className="nasa-container">
              <img className="nasa" src={nasaTV} alt="nasa tv" />
            </div>
            <div className="euronews-container">
              <img className="euronews" src={euronews} alt="euronews" />
            </div>
            <div className="france-container">
              <img className="france" src={france} alt="france" />
            </div>
            <div className="nbc-container">
              <img className="nbc" src={nbc} alt="nbc news" />
            </div>
          </div>
          <div className="krispy-modal-page-two">
            <div className="krispy-modal-redux-title-container">
              <div className="krispy-modal-redux-title">
                Redux for State Management
              </div>
            </div>
            <div className="krispy-modal-redux-info-container">
              <div className="krispy-modal-redux-info">
                In this project, I utilized Redux for centralized state
                management, specifically handling the addition and removal of
                favorites across multiple categories like Movies, TV Channels,
                and Globe Locations.
              </div>
            </div>
             <div className="favorite-code-container">
              <img
                className="favorite-code"
                src={kirspyFavorite}
                alt="krispy favorites code implementation"
                />
            </div>
            <div className="favorite-gif-container">
              <img
                className="favorite-gif"
                src={krispyFavoriteGif}
                alt="krispy favorite gif"
                />
            </div>
          </div>
          <div className="krispy-page-three">
            <div className="map-title-container">
              <div className="map-title">
                Dynamic Rendering with Map Methods
              </div>
            </div>
            <div className="map-info-container">
              <div className="map-info">
                I implemented dynamic rendering throughout the application using
                JavaScript's .map() method to display lists of movies, TV
                channels, and globe locations.
              </div>
            </div>
            <div className="map-info-two-container">
              <div className="map-info-two">
                The use of conditional rendering further improves user
                experience by displaying content based on the presence of user
                favorites or by selected genre.
              </div>
            </div>
            <div className="map-code-container">
              <img
                className="map-code"
                src={krispyMapCode}
                alt="krispy map code"
                />
            </div>
          </div>
          <div className="krispy-page-four">
            <div className="routing-title-container">
              <div className="routing-title">Routing with React Router</div>
            </div>
            <div className="routing-info-container">
              <div className="routing-info">
                React Router plays a crucial role in managing the navigation of
                this application. With nested routing and dynamic URL
                parameters, users can easily navigate between various sections
                like movies, TV channels, and live globe streams.
              </div>
            </div>
            <div className="routing-code-container">
              <img
                className="routing-code"
                src={krispyRoutingCode}
                alt="krispy routing"
                />
            </div>
          </div>
          <div className="krispy-page-five">
            <div className="bootstrap-title-container">
              <div className="bootstrap-title">
                Responsive Design with Bootstrap
              </div>
            </div>
            <div className="bootstrap-info-container">
              <div className="bootstrap-info">
                To ensure the application is responsive across various devices,
                I incorporated Bootstrap alongside custom SCSS for styling.
                Using Bootstrap's grid system and responsive utilities, I
                maintained a consistent and visually appealing layout,
                regardless of screen size.
              </div>
            </div>
      
            <div className="bootstrap-code-container">
              <img
                className="bootstrap-code"
                src={krispyBootstrapCode}
                alt="krispy bootstrap code example"
                />
            </div>
          </div>
          <div className="krispy-page-six">
            <div className="parallax-title-container">
              <div className="parallax-title">React Scroll Parallax</div>
            </div>
            <div className="parallax-info-container">
              <div className="parallax-info">
                React Router plays a crucial role in managing the navigation of
                this application. With nested routing and dynamic URL
                parameters, users can easily navigate between various sections
                like movies, TV channels, and live globe streams.
              </div>
            </div>
            <div className="parallax-code-container">
              <img
                className="parallax-code"
                src={krispyParallaxCode}
                alt="krispy parallax"
                />
            </div>
            {/* <div className="parallax-gif-container">
              <img
                className="parallax-gif"
                src={krispyParallaxGif}
                alt="krispy parallax gif"
                />
          </div> */}
            </div> 
                
        </div>
      </ModalBody>
      )}
      {isOpen && (
      <ModalFooter className="krispy-modal-footer">
        <Button
          color="danger"
          className="krispy-modal-close-btn"
          onClick={closeModal}
        >
          Close
        </Button>
        <Button
          color="warning"
          className="krispy-site-btn"
          onClick={(src) => window.open("https://krispy22.web.app", "_blank")}
        >
          Watch Now!
        </Button>
        <Button
          color="info"
          className="krispy-modal-github-btn"
          onClick={(src) =>
            window.open(
              "https://github.com/ibrahim-karim-22/portfolioProjectReact"
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

export default KrispyModal;
