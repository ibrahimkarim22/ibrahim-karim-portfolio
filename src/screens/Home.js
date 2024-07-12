import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import BlenderEnvironment from "../components/3dEnvironment";
import Progress from "../components/Progress";
import { Parallax, ParallaxProvider } from "react-scroll-parallax";
// import { animated, useSpring } from "@react-spring/web";
// import { Parallax, ParallaxLayer } from '@react-spring/parallax';
function Home() {
  const [progress, setProgress] = useState(0);

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

          <Container>
            <ParallaxProvider>
              <Parallax
                translateY={[100, -100]}
                scale={[.9, .8]}
                // rotate={[0.5, 1]}
                // translateX={[3, 4]}
              >

            <Row>
              <Col >
                <div
                  className="ad1-main"
                >
                  <div
                    className="ad1-01"
                  >
                    Relax your mind.
                  </div>
             
                </div>
              </Col>
            </Row>
            </Parallax>
            </ParallaxProvider>
            <Row>
              <Col>
                <div className="blender-environment" align="center">
                  <BlenderEnvironment setProgress={setProgress} />
                </div>
              </Col>
              <ParallaxProvider>
                <Parallax
                  y={[0, 1]}
                  scale={[1, 2]}
                  rotate={[0.5, 7]}
                  translateX={[3, 4]}
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
              </ParallaxProvider>
            </Row>
          </Container>
        </>
      )}
    </>
  );
}

export default Home;
