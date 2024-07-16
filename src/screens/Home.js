import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button } from "reactstrap";
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
          <div className="menu-div-main">
            <div className="logo-div">
              <Logo setProgress={setProgress} />
            </div>

            <div className="projects-title-div" onClick={handleProjects}>
              Projects
            </div>
            <div className="pdfResume-title-div" onClick={handleProjects}>
              One Page Resume
            </div>
            <div className="threeResume-title-div" onClick={handleProjects}>
              3D Resume
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
