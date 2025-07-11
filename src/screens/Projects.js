import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Sky from "../components/Sky";
import WhackaModal from "../components/WhackaModal";
import KrispyModal from "../components/KrispyModal";
import HeyYouModal from "../components/HeyYouModal";
import BardModal from "../components/BardModal";
import ThisPortfolioModal from "../components/ThisPortfolioModal";
import KanbanBoardModal from "../components/KanbanBoardModal";
import karim from "../images/karim.jpeg";
import { useEffect, useState, useRef } from "react";
import static1 from "../images/static1.png";
import static2 from "../images/static2.png";

const Projects = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const modalName = location.pathname.split("/")[2]?.toLowerCase();

  const openModal = (modalName) => {
    navigate(`/projects/${modalName.toLowerCase()}`);
  };

  const closeModal = () => {
    navigate("/projects");
  };

  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setBgImage(static2);
      setTimeout(() => {
        setBgImage("");
      }, 700);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const mouseXRef = useRef(0);
  const prevXRef = useRef(0);
  const mouseYRef = useRef(0);
  const prevYRef = useRef(0);
  const navRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const dist = 50;
    const interval = setInterval(() => {
      const deltaX = Math.abs(mouseXRef.current - prevXRef.current);
      const deltaY = Math.abs(mouseYRef.current - prevYRef.current);
      if (deltaX >= dist || deltaY >= dist) {
        prevXRef.current = mouseXRef.current;
        prevYRef.current = mouseYRef.current;

        const navShadowColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        const navShadowSize = `${Math.random() * 100 + 7000}px`;
        const nav = document.getElementById("nav-lights");
        if (nav) {
          nav.style.boxShadow = `0 0 ${navShadowSize} ${navShadowColor}`;
        }
      }
    }, 50);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, []);

useEffect(() => {
  if (!navRef.current) return;

  let lastScrollY = window.scrollY;

  const interval = setInterval(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY !== lastScrollY) {
      const isScrollingDown = currentScrollY > lastScrollY;

      const navShadowColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      const navShadowSize = isScrollingDown
        ? `${Math.random() * 100 + 6000}px`
        : `${Math.random() * 100 + 8000}px`;

      navRef.current.style.boxShadow = `0 0 ${navShadowSize} ${navShadowColor}`;
      lastScrollY = currentScrollY;
    }
  }, 100);

  return () => clearInterval(interval);
}, []);


  return (
    <>
      <div
        className="projects-div-main"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundColor: "black",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100vw 100vh",
        }}
        
      >
        <Sky />

        <div className="nav-div-main" id="nav-lights" ref={navRef}>
          <div className="pages-container">
            <Link className="nav-home-btn" to="/">
              Home
            </Link>
            <a
              href="https://docs.google.com/document/d/1WG92jYd5XDt1nloZyuQvcS0ih_0wK6c4oY8u4rhxwUM/edit?usp=sharing"
              className="nav-resume-btn"
              rel="noopener noreferrer"
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              Resume
            </a>
            <Link
              className="nav-three-dee-resume-btn"
              to="/threeDeeResume"
              target="_blank"
            >
              3D Profile
            </Link>
          </div>

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
              GitHub
            </a>
            <a
              href="mailto:22ibrahimkarim@gmail.com"
              rel="noopener noreferrer"
              target="_blank"
              className="nav-gmail-btn"
              style={{ textDecoration: "none" }}
            >
              <span className="gg">G</span>
              <span className="gm">m</span>
              <span className="ga">a</span>
              <span className="gi">i</span>
              <span className="gl">l</span>
            </a>
            <div className="image-div-main">
              <img
                className="profile-image"
                src={karim}
                alt="ibrahim's profile"
                onClick={() => window.open(karim, "_blank")}
              />
            </div>
          </div>
        </div>
        {/* <div className="profile-div-main">
            <div className="ibrahim-karim">Ibrahim Karim</div>
            <div className="location">Livonia, Michigan</div>
            </div> */}

        <div
          className="whacka-div-main"
          onClick={() => openModal("whackamole")}
        >
          <WhackaModal
            isOpen={modalName === "whackamole"}
            closeModal={closeModal}
          />
          <div className="whacka-text">Whack a Mole</div>
          <div className="whacka-software-text-container">
            <div className="whacka-js">JavaScript</div>
            <div className="whacka-html">HTML</div>
            <div className="whacka-scss">SCSS</div>
          </div>
          <div className="whacka-description-text">Online Game</div>
        </div>

        <div className="krispy-div-main" onClick={() => openModal("krispy")}>
          <KrispyModal
            isOpen={modalName === "krispy"}
            closeModal={closeModal}
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

        <div className="hey-you-div-main" onClick={() => openModal("heyyou")}>
          <HeyYouModal
            isOpen={modalName === "heyyou"}
            closeModal={closeModal}
          />
          <div className="hey-you-text">HeyYou</div>
          <div className="hey-you-software-text-container">
            <div className="hey-you-js">JavaScript</div>
            <div className="hey-you-react">React Native</div>
            <div className="hey-you-studio">Android Studio</div>
            <div className="hey-you-socketio">Socket.io</div>
            <div className="hey-you-mongodb">MongoDB</div>
            <div className="hey-you-nodejs">Node.js</div>
            <div className="hey-you-docker">Docker</div>
            <div className="hey-you-googlecloud">
              <span style={{ color: "rgb(132, 167, 255)" }}>G</span>
              <span style={{ color: "red" }}>o</span>
              <span style={{ color: "yellow" }}>o</span>
              <span style={{ color: "rgb(132, 167, 255)" }}>g</span>
              <span style={{ color: "green" }}>l</span>
              <span style={{ color: "red" }}>e</span>
              <span style={{ color: "rgba(215, 215, 215, 0.126)" }}>-</span>
              <span style={{ color: "white" }}>Cloud</span>
            </div>
          </div>
          <div className="hey-you-description-text">Location & Chat</div>
        </div>

        <div className="bard-div-main" onClick={() => openModal("bard")}>
          <BardModal isOpen={modalName === "bard"} closeModal={closeModal} />
          <div className="bard-text">BARD</div>
          <div className="bard-software-text-container">
            <div className="bard-js">JavaScript</div>
            <div className="bard-react-native">React Native</div>
            <div className="bard-studio">Android Studio</div>
            <div className="bard-redux">Redux</div>
            <div className="bard-firebase">Firebase</div>
            <div className="bard-firestore">Firestore</div>
          </div>
          <div className="bard-description-text">Online Course</div>
        </div>

        <div
          className="this-portfolio-div-main"
          onClick={() => openModal("thisportfolio")}
        >
          <ThisPortfolioModal
            isOpen={modalName === "thisportfolio"}
            closeModal={closeModal}
          />
          <div className="this-portfolio-text">Portfolio</div>
          <div className="this-portfolio-software-text-container">
            <div className="this-portfolio-js">JavaScript </div>
            <div className="this-portfolio-react">React</div>
            <div className="this-portfolio-firebase">Firebase</div>
            <div className="this-portfolio-scss">SCSS</div>
            <div className="this-portfolio-blender">Blender 3D</div>
            <div className="this-portfolio-react-fiber">React Three Fiber</div>
          </div>
          <div className="this-portfolio-description-text">This Portfolio</div>
        </div>

        <div className="kanban-div-main" onClick={() => openModal("kanban")}>
          <KanbanBoardModal
            isOpen={modalName === "kanban"}
            closeModal={closeModal}
          />
          <div className="kanban-text tuh-doo">Tuh-Doo</div>
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

        <div className="footer-main">
          <div className="above-footer2"></div>
          <div className="above-footer1"></div>
          <div className="above-footer"></div>
          <div className="footer-div-main">
            <div className="socials-icons">
              <a
                href="https://www.instagram.com/iiibrahimkarim/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-instagram instagram-link"></i>
              </a>
              <a
                href="https://github.com/ibrahimkarim22"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-square-github github-link"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/ibrahim-karim-abaa952a7/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-linkedin linkedin-link"></i>
              </a>
              <a href="mailto:22ibrahimkarim@gmail.com">
                <i className="fa-solid fa-square-envelope gmail-link"></i>
              </a>
              <a
                href="https://www.youtube.com/@iiibrahimKarim"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-square-youtube youtube-link"></i>
              </a>
            </div>

            <div className="pages-links">
              <a
                href="https://ibrahimkarim-34158.web.app/"
                className="home-link"
              >
                Home
              </a>
              <a
                href="https://docs.google.com/document/d/1WG92jYd5XDt1nloZyuQvcS0ih_0wK6c4oY8u4rhxwUM/edit?usp=sharing"
                className="resume-link"
                rel="noopener noreferrer"
                target="_blank"
              >
                Resume
              </a>
              <a
                href="https://ibrahimkarim-34158.web.app/threeDeeResume"
                className="profile-link"
                rel="noopener noreferrer"
              >
                3D Profile
              </a>
              <a
                href="https://data.typeracer.com/pit/profile?user=ib_ra_heem_22&ref=badge"
                className="megaracer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Megaracer
              </a>
            </div>

            <div className="projects-copyright-container">
              <div className="copyright-text">&copy; 2025 Ibrahim Karim. </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Projects;
