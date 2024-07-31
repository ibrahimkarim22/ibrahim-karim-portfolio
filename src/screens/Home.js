import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import { Link } from "react-router-dom";
import BlenderEnvironment from "../components/3dEnvironment";
import Logo from "../components/Logo";
import Progress from "../components/Progress";

import { Parallax, ParallaxProvider } from "react-scroll-parallax";
// import { animated, useSpring } from "@react-spring/web";
// import { Parallax, ParallaxLayer } from '@react-spring/parallax';
function Home() {
  const [progress, setProgress] = useState(0);

  const handleProjects = () => {
    console.log("projects clicked");
  };

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
  }, []);

  // const [props, api] = useSpring(() => ({
  //     from: { y: 0 },
  // }))
  // const handleClick = () => {
  //     api.start({
  //         from: {
  //             y: 0,
  //         },
  //         to: {
  //             y: 1700,
  //         },
  //     })
  // }
  return (
    <>
      {progress < 100 ? (
        <Progress progress={progress} />
      ) : (
        <>
          {/* <div className="static">
          
        </div> */}
          <div className="menu-div-main">
            <div className="contact-div">
              <div className="linkedin">Linkedin</div>
              <div className="github">Github</div>
              <div className="gmail">Gmail</div>
            </div>
            <div className="bio-div-main">
              <div>
                I am a developer with some 2D and 3D editing, design, and
                animation skills. I love learning on the process of creating
                something that seems imossible at first. My strong suit I would
                say is debugging.
              </div>
            </div>

            <div className="logo-div">
              <Logo setProgress={setProgress} />
            </div>

            <div className="full-stack-div">Full-Stack Developer</div>
            <div className="menu-items">
              <Link to="/projects" style={{ textDecoration: "none" }}>
                <div className="projects-title-div">Projects</div>
              </Link>
              <div className="pdfResume-title-div" onClick={handleProjects}>
                Resume
              </div>
              <Link to="/threeDeeResume" style={{ textDecoration: "none" }}>
                <div className="threeResume-title-div">3DResume</div>
              </Link>
              ;
            </div>
          </div>
          {/* <animated.div
    onClick={handleClick}
    style={{
        width: 100,
        height: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        position: 'relative',
        ...props
    }}
/> */}

          {/* <Container> */}

          {/* <Row>
              <Col>
                <div className="blender-environment" align="center">
                  <BlenderEnvironment setProgress={setProgress} />
                  <div className="orbit-instructions">
                    <p>
                      <span style={{ color: "blue" }}>RC</span> Pan
                      <br />
                      <span style={{ color: "blue" }}>LC</span> Rotate
                      <br />
                      <span style={{ color: "blue" }}>MW</span> Zoom
                    </p>
                  </div>
                </div>
              </Col>
            </Row> */}
          {/* <ParallaxProvider>
                <Parallax
                  y={[10, 20]}
                  scale={[1, 2]}
                  rotate={[0.5, 7]}
                  // translateX={[200, -600]}
           
                  
                >
                  <Col>
                    <div
                      className="topAd"
                      style={{
                        width: 100,
                        height: 300,
                        backgroundColor: "rgba(255, 255, 255, 1)",
                        borderRadius: 8,
                     
                      }}
                    ></div>
                  </Col>
                </Parallax>
              </ParallaxProvider> */}
          {/* </Container> */}
        </>
      )}
    </>
  );
}

export default Home;
