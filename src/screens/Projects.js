import { useRef } from "react";
import { Parallax, ParallaxLayer, IParallax } from '@react-spring/parallax'
import { useLocation, useNavigate} from "react-router-dom";
import { Link } from "react-router-dom";
import WhackaModal from "../components/WhackaModal";
import KrispyModal from "../components/KrispyModal";
import HeyYouModal from "../components/HeyYouModal";
import BardModal from "../components/BardModal";
import ThisPortfolioModal from "../components/ThisPortfolioModal";
import KanbanBoardModal from "../components/KanbanBoardModal";
import karim from "../images/karim.jpeg";

const Projects = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const modalName = location.pathname.split("/")[2]?.toLowerCase();

  const parallax = useRef(null);

  const openModal = (modalName) => {
    navigate(`/projects/${modalName.toLowerCase()}`);
  };

  const closeModal = () => {
    navigate("/projects")
  };

  return (
            <Parallax ref={parallax} pages={6} className="parallax-container">
    <div className="projects-div-main">


            <ParallaxLayer offset={0.3} speed={-0.3}>

      <div className="nav-div-main">
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

        <div className="profile-div-main">
          <div className="ibrahim-karim">Ibrahim Karim</div>
          <div className="location">Livonia, Michigan</div>
        </div>

        <div className='image-div-main'>

          <img
            className="profile-image"
            src={karim}
            alt="ibrahim's profile image"
            onClick={() => window.open(karim, '_blank')}
          />
        </div>
      </div>
        </ParallaxLayer>

      <ParallaxLayer offset={0.3} speed={-0.3}>
      <div className="whacka-div-main" onClick={() => openModal("whackamole")}>
        <WhackaModal isOpen={modalName === "whackamole"} closeModal={closeModal} />
        <div className="whacka-text">Whack a Mole</div>
        <div className="whacka-software-text-container">
          <div className="whacka-js">JavaScript</div>
          <div className="whacka-html">HTML</div>
          <div className="whacka-scss">SCSS</div>
        </div>
        <div className="whacka-description-text">Online Game</div>
      </div>
      </ParallaxLayer>

      <ParallaxLayer offset={0.3} speed={-0.3}>
      <div className="krispy-div-main" onClick={() => openModal("krispy")}>
      <KrispyModal isOpen={modalName === "krispy"} closeModal={closeModal} />
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
</ParallaxLayer>

      <ParallaxLayer offset={0.3} speed={-0.3}>
      <div
        className="hey-you-div-main" onClick={() => openModal("heyyou")}>
        <HeyYouModal isOpen={modalName === "heyyou"} closeModal={closeModal} />
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
      </ParallaxLayer>

      <ParallaxLayer offset={0.3} speed={-0.3}>
      <div className="bard-div-main" onClick={() => openModal("bard")}>
      <BardModal isOpen={modalName === "bard"} closeModal={closeModal} />
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
      </ParallaxLayer>

      <ParallaxLayer offset={0.3} speed={-0.3}>
      <div
        className="this-portfolio-div-main" onClick={() => openModal("thisportfolio")}>
        <ThisPortfolioModal isOpen={modalName === "thisportfolio"} closeModal={closeModal} />
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
      </ParallaxLayer>

      <ParallaxLayer offset={0.3} speed={-0.3}>
      <div className="kanban-div-main" onClick={() => openModal("kanban")}>
        <KanbanBoardModal isOpen={modalName === "kanban"} closeModal={closeModal} />
        <div className="kanban-text">Kanban Board</div>
        <div className="kanban-software-text-container">
          <div className="kanban-js">Java Script</div>
          <div className="kanban-react">React</div>
          <div className="kanban-scss">SCSS</div>
          <div className="kanban-firebase">Firebase</div>
          <div className="kanban-firestore">Firestore</div>
        </div>
        <div className="kanban-description-text">To Do List</div>
      </div>
      </ParallaxLayer>

      <ParallaxLayer offset={0.3} speed={-0.3}>
      <div className="footer-div-main">
        <div className="projects-copyright-container">
          <div className="copyright-text">&copy; 2024 Ibrahim Karim. </div>
        </div>
      </div>
      </ParallaxLayer>

    </div>
      </Parallax>
  );
};

export default Projects;
