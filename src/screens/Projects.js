import { useState } from "react";
import { Link } from "react-router-dom";
import WhackaModal from "../components/WhackaModal";
import KrispyModal from "../components/KrispyModal";
import HeyYouModal from "../components/HeyYouModal";
import BardModal from "../components/BardModal";
import ThisPortfolioModal from "../components/ThisPortfolioModal";
import karim from "../images/karim.jpeg";

const Projects = () => {
  const [modalOpen, setModalOpen] = useState({
    WhackaModal: false,
    KrispyModal: false,
  });

  const openModal = (modal) => {
    setModalOpen({ ...modalOpen, [modal]: true });
  };

  const closeModal = (modal) => {
    setModalOpen({ ...modalOpen, [modal]: false });
  };

  return (
    <div className="projects-div-main">
      <div className="nav-div-main">
        <div className="ibrahim-karim-mobile">Ibrahim Karim</div>
        <Link className="nav-home-btn" to="/">
          <div>Home</div>
        </Link>
        <a
          href="https://docs.google.com/document/d/1SrhaOl38FXR0at186piaVMLwN0TuQGOmt9q56TYvaBE/edit?usp=sharing"
          className="nav-resume-btn"
          rel="noopener noreferrer"
          target="_blank"
          style={{ textDecoration: "none" }}
        >
          Resume
        </a>
        <Link className="nav-three-dee-resume-btn" to="/threeDeeResume">
          <div>3D Profile</div>
        </Link>
        <div className="social-container">
          <a
            href="https://www.linkedin.com/in/ibrahim-karim-abaa952a7/"
            target="_blank"
            className="nav-linkedin-btn"
            style={{ textDecoration: "none" }}
            rel="noopener noreferrer"
          >
            Linkedin
          </a>

          <a
            href="https://github.com/ibrahimkarim22"
            rel="noopener noreferrer"
            target="_blank"
            className="nav-github-btn"
            style={{ textDecoration: "none" }}
          >
            Github
          </a>
          <a
            href="mailto:22ibrahimkarim@gmail.com"
            rel="noopener noreferrer"
            target="_blank"
            className="nav-gmail-btn"
            style={{ textDecoration: "none" }}
          >
            Gmail
          </a>
        </div>
        <div className="profile-image-container">
          <img
            className="profile-image"
            src={karim}
            alt="ibrahim's profile image"
            onClick={() => window.open(karim, '_blank')}
          />
        </div>
        <div className="profile-div-main">
          <div className="ibrahim-karim">Ibrahim Karim</div>
          <div className="location">Livonia, Michigan</div>
          <div className="phone">(248) 499-2327</div>
        </div>
      </div>
      <div className="profile-main-mobile">
        <div className="profile-div-main-mobile">
          <div className="location">Livonia, Michigan</div>
          <div className="phone">(248) 499-2327</div>
        </div>
        <div className="social-container-mobile">
          <Link className="nav-linkedin-btn" to="/">
            <div>Linkedin</div>
          </Link>
          <Link
            className="nav-github-btn"
            to="https://github.com/ibrahimkarim22"
          >
            <div>GitHub</div>
          </Link>
          <Link className="nav-gmail-btn" to="mailto:22ibrahimkarim@gmail.com">
            <div> Gmail</div>
          </Link>
        </div>
      </div>
      <div className="whacka-div-main" onClick={() => openModal("WhackaModal")}>
        <WhackaModal
          isOpen={modalOpen.WhackaModal}
          closeModal={() => closeModal("WhackaModal")}
        />
        <div className="whacka-text">Whack a Mole</div>
        <div className="whacka-software-text-container">
          <div className="whacka-js">JavaScript</div>
          <div className="whacka-html">HTML</div>
          <div className="whacka-scss">SCSS</div>
        </div>
        <div className="whacka-description-text">Online Game</div>
      </div>
      <div className="krispy-div-main" onClick={() => openModal("KrispyModal")}>
        <KrispyModal
          isOpen={modalOpen.KrispyModal}
          closeModal={() => closeModal("KrispyModal")}
        />
        <div className="krispy-text">KRISPY</div>
        <div className="krispy-software-text-container">
          <div className="krispy-js">JavaScript</div>
          <div className="krispy-react">React</div>
          <div className="krispy-firebase">Firebase</div>
          <div className="krispy-redux">Redux</div>
          <div className="krispy-bootstrap">Bootstrap</div>
          <div className="krispy-scss">SCSS</div>
        </div>
        <div className="krispy-description-text">Streaming Service</div>
      </div>
      <div
        className="hey-you-div-main"
        onClick={() => openModal("HeyYouModal")}
      >
        <HeyYouModal
          isOpen={modalOpen.HeyYouModal}
          closeModal={() => closeModal("HeyYouModal")}
        />
        <div className="hey-you-text">HeyYou</div>
        <div className="hey-you-software-text-container">
          <div className="hey-you-js">JavaScript</div>
          <div className="hey-you-react">React Native</div>
          <div className="hey-you-socketio">Socket.io</div>
          <div className="hey-you-mongodb">MongoDB</div>
          <div className="hey-you-nodejs">Node.js</div>
          <div className="hey-you-docker">Docker</div>
          <div className="hey-you-googlecloud">Google Cloud</div>
        </div>
        <div className="hey-you-description-text">Location & Chat</div>
      </div>
      <div className="bard-div-main" onClick={() => openModal("BardModal")}>
        <BardModal
          isOpen={modalOpen.BardModal}
          closeModal={() => closeModal("BardModal")}
        />
        <div className="bard-text">BARD</div>
        <div className="bard-software-text-container">
          <div className="bard-js">JavaScript</div>
          <div className="bard-react-native">React Native</div>
          <div className="bard-redux">Redux</div>
          <div className="bard-firebase">Firebase</div>
          <div className="bard-firestore">Firestore</div>
        </div>
        <div className="bard-description-text">Online Course</div>
      </div>
      <div
        className="this-portfolio-div-main"
        onClick={() => openModal("ThisPortfolioModal")}
      >
        <ThisPortfolioModal
          isOpen={modalOpen.ThisPortfolioModal}
          closeModal={() => closeModal("ThisPortfolioModal")}
        />
        <div className="this-portfolio-text">Portfolio</div>
        <div className="this-portfolio-software-text-container">
          <div className="this-portfolio-js">JavaScript </div>
          <div className="this-portfolio-react">React</div>
          <div className="this-portfolio-firebase">Firebase</div>
          <div className="this-portfolio-scss">SCSS</div>
          <div className="this-portfolio-blender">Blender</div>
          <div className="this-portfolio-react-fiber">React Three</div>
        </div>
        <div className="this-portfolio-description-text">This Portfolio</div>
      </div>

      <div className="footer-div-main">
        <div className="projects-copyright-container">
          <div className="copyright-text">&copy; 2024 Ibrahim Karim. </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
