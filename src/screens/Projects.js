import { useState } from "react";
import { Link } from "react-router-dom";
import WhackaModal from "../components/WhackaModal";
import KrispyModal from "../components/KrispyModal";
import HeyYouModal from "../components/HeyYouModal";
import BardModal from "../components/BardModal";
import ThisPortfolioModal from "../components/ThisPortfolioModal";
import { Parallax } from "@react-spring/parallax";


const Projects = () => {
  const [modalOpen, setModalOpen] = useState({ WhackaModal: false, KrispyModal: false });

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
        <div className="whacka-software-text">JavaScript HTML SCSS SASS</div>
        <div className="whacka-description-text">Online Game</div>
      </div>
      <div className="krispy-div-main" onClick={() => openModal("KrispyModal")}>
        <KrispyModal isOpen={modalOpen.KrispyModal} closeModal={() => closeModal("KrispyModal")} />
        <div className="krispy-text">KRISPY</div>
        <div className="krispy-software-text">JavaScript React Firebase Firestore Redux Bootstrap SCSS SASS</div>
        <div className="krispy-description-text">Streaming Service</div>
      </div>
      <div className="hey-you-div-main" onClick={() => openModal("HeyYouModal")}>
   
        <HeyYouModal isOpen={modalOpen.HeyYouModal} closeModal={() => closeModal("HeyYouModal")} />

        <div className="hey-you-text">HeyYou</div>
        <div className="hey-you-software-text">JavaScript Socket.io Atlas MongoDB Docker GoogleCloud Node.js Express.js</div>
        <div className="hey-you-description-text">Location Tracking App</div>
      </div>
      <div className="bard-div-main" onClick={() => openModal("BardModal")}>
        <BardModal isOpen={modalOpen.BardModal} closeModal={() => closeModal("BardModal")} />
        <div className="bard-text">BARD</div>
        <div className="bard-software-text">JavaScript ReactNative Firebase Firestore Redux</div>
        <div className="bard-description-text">Online Course App</div>
      </div>
      <div className="this-portfolio-div-main" onClick={() => openModal("ThisPortfolioModal")}>
        <ThisPortfolioModal isOpen={modalOpen.ThisPortfolioModal} closeModal={() => closeModal("ThisPortfolioModal")} />
        <div className="this-portfolio-text">This Portfolio</div>
        <div className="this-portfolio-software-text">JavaScript React Firebase Blender Photoshop ReactFiber Reactstrap SCSS SASS</div>
        <div className="this-portfolio-description-text">This Portfolio</div>
      </div>
      <div className="footer-div-main"></div>
    </div>
  );
};

export default Projects;
