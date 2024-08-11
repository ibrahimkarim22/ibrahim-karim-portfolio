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
function KrispyModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="krispy-modal-main-div"
    >
      <ModalHeader toggle={closeModal} className="krispy-modal-header">
        <div className="krispy-modal-header-text">KRISPY</div>
        <div className="krispy-modal-header-text-two">Streaming Service</div>
      </ModalHeader>
      <ModalBody className="krispy-modal-body-main">
        {/* <div className="krispy-modal-header-sub-text-container">
          <div className="krispy-modal-header-sub-text">
            Streaming Service: JavaScript, React, Firebase, Firestore, Redux,
            SCSS, SASS.
          </div>
        </div> */}
        <div className="krispy-modal-flex-main">
          <div className="krispy-modal-page-one">
            <div className="krispy-modal-info-container">
              <div className="krispy-modal-info">
                Krispy is a streaming service I created using React and
                Firebase. Watch all of Charlie Chaplin's public domain films.
                Watch live streams from "Nat Geo Wild", "National Geography",
                "Disney XD", "Disney Channel" "DW News", "NBC News", "France
                24", "FOX News", "Dateline NBC", "Aljazeera Arabic", "DW
                Arabic", Sky News", "NASA TV", "euronews", and "ABC News".
                Krispy also includes live streams from "Venice, Italy", "London,
                UK", "New York", "Amsterdam, Netherlands", "Rio de Janero,
                Brazil", "Miami, Florida", and "Tokyo, Japan".
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
          </div>
        </div>
      </ModalBody>
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
    </Modal>
  );
}

export default KrispyModal;
