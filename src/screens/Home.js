import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Progress from "../components/Progress";
import Copyright from "../components/Copyright";

function Home() {
  const [progress, setProgress] = useState(0);
  const [loadLogo, setLoadLogo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return 100;
        }
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setLoadLogo(true);
    }
  }, [progress]);

  return (
    <>
      {progress < 100 ? (
        <Progress progress={progress} />
      ) : (
        <>
          <div className="menu-div-main">
            <div className="bio-div-main-container">
              <div className="bio-div-main">
                <p>
                  Hello! I’m Ibrahim, a full-stack web and mobile developer with
                  a background in fine arts and a strong interest in UI/UX. I
                  enjoy combining development and design to create experiences
                  that are functional, intuitive, and visually engaging.
                </p>
                <p>
                  I work with technologies like JavaScript, CSS, React, React
                  Native, Node.js, APIs, and cloud tools, while also exploring
                  2D/3D design, animation, and visual storytelling. I’m always
                  learning, building, and looking for better ways to turn ideas
                  into useful digital experiences.
                </p>
              </div>
            </div>

            <div className="logo-div-container">
              <Logo className="logo-div" setProgress={setProgress} />
            </div>

            <div className="menu-items">
              <Link to="/projects" style={{ textDecoration: "none" }}>
                <div className="projects-title-div-container">
                  <div className="projects-title-div">Projects</div>
                </div>
              </Link>
              <a
                href="/Ibrahim_Karim_Full_Stack_Resume.pdf"
                rel="noopener noreferrer"
                target="_blank"
                style={{ textDecoration: "none" }}
              >
                <div className="pdfResume-title-div-container">
                  <div className="pdfResume-title-div">Resume</div>
                </div>
              </a>
              <Link to="/threeDeeResume" style={{ textDecoration: "none" }} target="_blank">
                <div className="threeResume-title-div-container">
                  <div className="threeResume-title-div">3D Profile</div>
                </div>
              </Link>

              <div className="megaracer-container">
                <a
                  href="https://data.typeracer.com/pit/profile?user=ib_ra_heem_22"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <div className="megaracer">Megaracer</div>
                </a>
                <a
                  href="https://data.typeracer.com/pit/profile?user=ib_ra_heem_22"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="typeracer">
                    <iframe
                      src="https://data.typeracer.com/pit/profile?user=ib_ra_heem_22"
                      title="TypeRacer profile for ib_ra_heem_22"
                      className="typeracer-profile"
                      loading="lazy"
                    />
                  </div>
                </a>
              </div>
            </div>
            <div className="contact-items">
              <a
                href="https://www.linkedin.com/in/ibrahim-karim-abaa952a7/"
                rel="noopener noreferrer"
                target="_blank"
                className="linkedin"
                style={{ textDecoration: "none" }}
              >
                Linkedin
              </a>
              <a
                href="https://github.com/ibrahimkarim22"
                rel="noopener noreferrer"
                target="_blank"
                className="github"
                style={{ textDecoration: "none" }}
              >
                Github
              </a>
              <a
                href="mailto:22ibrahimkarim@gmail.com"
                rel="noopener noreferrer"
                target="_blank"
                className="gmail"
                style={{ textDecoration: "none" }}
              >
                Gmail
              </a>
            </div>
            <div className="full-stack-div">Full-Stack Developer</div>
            <div className="home-copyright-container">
              <div className="copyright-text">
                <Copyright />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Home;
