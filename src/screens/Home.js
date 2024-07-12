import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Alert, Button } from "reactstrap";
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
            <Row>
              <Col>
                <div className="blender-environment" align="center">
                  <BlenderEnvironment setProgress={setProgress} />
                </div>
              </Col>
            </Row>
                <Row>
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
                        marginTop: 100,
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
