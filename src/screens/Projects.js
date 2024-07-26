import { useState } from "react";
import { Link } from "react-router-dom";
import WhackaModal from "../components/WhackaModal";

const Projects = () => {
  const [modalOpen, setModalOpen] = useState({ WhackaModal: false });

  const openModal = (modal) => {
    setModalOpen({ ...modalOpen, [modal]: true });
  };

  const closeModal = (modal) => {
    setModalOpen({ ...modalOpen, [modal]: false });
  };

  return (
    <div className="projects-div-main">
      <div className="nav-div-main">
        <Link className="nav-home-btn" to="/">
          <div>Home</div>
        </Link>
        <Link className="nav-resume-btn" to="/">
          <div>Resume</div>
        </Link>
        <Link className="nav-three-dee-resume-btn" to="/">
          <div>3D Resume</div>
        </Link>
        <Link className="nav-linkedin-btn" to="/">
          <div>Linkedin</div>
        </Link>
        <Link className="nav-github-btn" to="https://github.com/ibrahim-karim-22">
          <div>GitHub</div>
        </Link>
        <Link className="nav-gmail-btn" to="mailto:ib2ra2heem@gmail.com">
          <div> Gmail</div>
        </Link>
      </div>
      <div className="whacka-div-main" onClick={() => openModal("WhackaModal")}>
        <WhackaModal isOpen={modalOpen.WhackaModal} closeModal={() => closeModal("WhackaModal")} />
        <div className="whacka-text">Whack a Mole</div>
        <div className="whacka-description-text">Online Game</div>
      </div>
      <div className="krispy-div-main">
        <div className="krispy-text">KRISPY</div>
        <div className="krispy-description-text">Streaming Service</div>
      </div>
      <div className="hey-you-div-main">
        <div className="hey-you-text">HeyYou</div>
        <div className="hey-you-description-text">Location Tracking App</div>
      </div>
      <div className="bard-div-main">
        <div className="bard-text">BARD</div>
        <div className="bard-description-text">Online Course App</div>
      </div>
      <div className="this-portfolio-div-main">
        <div className="this-portfolio-text">This Portfolio</div>
        <div className="this-portfolio-description-text">This Portfolio</div>
      </div>
      <div className="footer-div-main"></div>
    </div>
  );
};

export default Projects;
