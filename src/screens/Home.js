import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Progress from "../components/Progress";

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
                href="https://github.com/ibrahim-karim-22"
                rel="noopener noreferrer"
                target="_blank"
                className="github"
                style={{ textDecoration: "none" }}
              >
                Github
              </a>
              <a
                href="mailto:hema-thechamp@yahoo.com"
                rel="noopener noreferrer"
                target="_blank"
                className="gmail"
                style={{ textDecoration: "none" }}
              >
                Gmail
              </a>
            </div>
            <div className="bio-div-main-container">
              <div className="bio-div-main">
                Hey You! I'm a developer who loves turning ideas into reality,
                much like a director bringing a script to life on stage. Whether
                it’s through 2D and 3D design, animation, or video editing,
                every play has its five acts, and every line of code adds to the
                story. When I’m not crafting the next scene, you’ll find me
                dreaming about CSS units or solving coding puzzles in my sleep
                (it’s all a part of the job, right?). After all, the show must
                go on—even in my dreams.
              </div>
            </div>

            <div className="logo-div-container">
              <Logo className="logo-div" setProgress={setProgress} />
            </div>

            <div className="full-stack-div">Full-Stack Developer</div>
            <div className="menu-items">
              <Link to="/projects" style={{ textDecoration: "none" }}>
                <div className="projects-title-div-container">
                  <div className="projects-title-div">Projects</div>
                </div>
              </Link>
              <a
                href="https://drive.google.com/file/d/1Mc2SdmCu-oop6GbOgkBhhYwq8rDUKLsO/view?usp=sharing"
                rel="noopener noreferrer"
                target="_blank"
                style={{ textDecoration: "none" }}
              >
                <div className="pdfResume-title-div-container">
                  <div className="pdfResume-title-div">Resume</div>
                </div>
              </a>
              <Link to="/threeDeeResume" style={{ textDecoration: "none" }}>
                <div className="threeResume-title-div-container">
                  <div className="threeResume-title-div">3D Profile</div>
                </div>
              </Link>

              <div className="megaracer-container">
                <div className="megaracer">Megaracer</div>
                <a
                  href="https://data.typeracer.com/pit/profile?user=ib_ra_heem_22&ref=badge"
                  target="_blank"
                >
                  <img
                    src="https://data.typeracer.com/misc/badge?user=ib_ra_heem_22"
                    border="0"
                    alt="TypeRacer.com scorecard for user ib_ra_heem_22"
                    className="typeracer"
                  />
                </a>
              </div>
            </div>
            <div className="home-copyright-container">
              <div className="copyright-text">&copy; 2024 Ibrahim Karim.</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Home;
