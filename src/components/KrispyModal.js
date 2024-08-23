import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import chaplinVagabond from "../images/chaplinVagabond.jpg";
import chaplinOneAM from "../images/chaplinOneAM.jpg";
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
          <div className="krispy-modal-flex-main">
            <div className="krispy-modal-page-one">
              <div className="krispy-logos-container">
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
                <div className="krispy-modal-bootstrap-logo-container">
                  <img
                    className="krispy-modal-bootstrap-logo"
                    src={bootstrapLogo}
                    alt="bootstrap logo"
                  />
                </div>
              </div>

              <div className="krispy-modal-info-container">
                <div className="krispy-modal-info">
                  Krispy is a streaming service I created with{" "}
                  <span className="red-text bold-text">JavaScript</span>,{" "}
                  <span className="red-text bold-text">React</span>,{" "}
                  <span className="red-text bold-text">Redux</span>,{" "}
                  <span className="red-text bold-text">Firebase</span>,{" "}
                  <span className="red-text bold-text">Firestore</span>,{" "}
                  <span className="red-text bold-text">Bootstrap</span> and{" "}
                  <span className="red-text bold-text">SCSS</span> Watch live TV
                  streams, live feeds from the globe, and a collection of
                  Charlie Chaplin's public domain films.
                </div>
              </div>
              <div className="film-container">
                <div
                  className="chaplin-vagabond-container"
                  onClick={() =>
                    window.open("https://krispy22.web.app/movie/3", "_blank")
                  }
                >
                  <img
                    className="chaplin-vagabond"
                    src={chaplinVagabond}
                    alt="charlie chaplin Vagabond"
                  />
                </div>

                <div
                  className="chaplin-one-am-container"
                  onClick={() =>
                    window.open("https://krispy22.web.app/movie/1", "_blank")
                  }
                >
                  <img
                    className="chaplin-one-am"
                    src={chaplinOneAM}
                    alt="charlie chaplin one am"
                  />
                </div>
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
                  In this project,{" "}
                  <span style={{ fontWeight: "900" }}>
                    {" "}
                    I used Redux for centralized state management
                  </span>
                  , specifically handling the addition and removal of favorites
                  across multiple categories like Movies, TV Channels, and Globe
                  Locations.
                </div>
              </div>
              <div className="favorite-code-main-container">
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
            </div>
            <div className="krispy-page-three">
              <div className="map-title-container">
                <div className="map-title">
                  Dynamic Rendering with Map Methods
                </div>
              </div>
              <div className="map-info-container">
                <div className="map-info">
                  I implemented{" "}
                  <span className="bold-text">dynamic rendering</span>{" "}
                  throughout the application using JavaScript's{" "}
                  <span className="bold-text" style={{ color: "hotpink" }}>
                    .map( )
                  </span>{" "}
                  method to display lists of movies, TV channels, and globe
                  locations.
                </div>
              </div>
              <div className="map-info-two-container">
                <div className="map-info-two">
                  The use of{" "}
                  <span className="bold-text">conditional rendering </span>{" "}
                  allows further improves user experience by displaying content
                  based on the presence of user favorites or by selected genre.
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
                <div className="routing-title">
                  <span className="bold-text">R</span>outing with{" "}
                  <span className="bold-text">R</span>eact{" "}
                  <span className="bold-text">R</span>outer
                </div>
              </div>
              <div className="routing-info-container">
                <div className="routing-info">
                  React Router plays a crucial role in managing the navigation
                  between pages. With{" "}
                  <span className="red-text" style={{ fontSize: "20px" }}>
                    nested routing and dynamic URL parameters
                  </span>
                  , users can easily navigate between movies, TV channels, and
                  live globe streams.
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
                <div className="bootstrap-title">Bootstrap</div>
              </div>
              <div className="bootstrap-info-container">
                <div className="bootstrap-info">
                  <span style={{ fontSize: "19px" }}>
                    For a{" "}
                    <span className="bold-text">
                      responsive design across various devices
                    </span>
                    , I incorporated{" "}
                  </span>{" "}
                  Bootstrap alongside custom{" "}
                  <span className="bold-text">SCSS</span> for styling. Using{" "}
                  <span className="bold-text">Bootstrap's</span> responsive
                  utilities and{" "}
                  <span className="bold-text">flex containers</span>, I
                  maintained a consistent design
                  <span style={{ fontSize: "80px", marginLeft: "40px" }}>
                    regardless of screen size
                  </span>
                  .
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
                  For the Home page, I decided to use{" "}
                  <span className="bold-text">React Scroll Parallax</span>. It
                  was much easier to implement than React Spring Parallax. I
                  just wrapped all the elements with{" "}
                  <code className="bold-text" style={{ fontSize: "50px" }}>
                    &lt;Parallax&gt;
                  </code>{" "}
                  and used{" "}
                  <code className="bold-text" style={{ fontSize: "50px" }}>
                    &lt;ParallaxLayer&gt;
                  </code>{" "}
                  for individual layers.
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
              <div className="krispy-copyright-container">
                <div className="copyright-text">&copy; 2024 Ibrahim Karim.</div>
              </div>
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
            Watch!
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
