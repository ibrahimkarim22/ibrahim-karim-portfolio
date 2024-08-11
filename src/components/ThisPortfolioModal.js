import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import heyYouGrid from "../images/heyYouGrid.png";
import whaleKeyframes from "../images/whaleKeyframes.png";
import splashKeyframes from "../images/splashKeyframes.png";
import animationSplashHeyYou from "../images/animationSplashHeyYou.png";
import animationWhaleHeyYou from "../images/animationWhaleHeyYou.png";
import curtainGrid from "../images/curtainGrid.png";
import useEffectCode from "../images/useEffectCode.png";
import resumeCanvas from "../images/resumeCanvas.png";
import logoCanvas from "../images/logoCanvas.png"; 
import logoModel from "../images/logoModel.png";
import resumeModel from "../images/resumeModel.png";
function ThisPortfolioModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="this-portfolio-modal-main-div"
    >
      <ModalHeader toggle={closeModal} className="this-portfolio-modal-header">
        <div className="this-portfolio-modal-header-text">This Portfolio</div>
      </ModalHeader>
      <ModalBody className="this-portfolio-modal-body-main">
        {/* <div className="this-portfolio-modal-header-sub-text-container">
          <div className="this-portfolio-modal-header-sub-text">
            Tools I used to build this portfolio: JavaScript, React, Firebase,
            React Fiber, Reactstrap, SCSS, SASS, Blender, Photoshop.
          </div>
        </div> */}
        <div className="this-portfolio-main-flex-container">
          {/* PAGE 1 */}
          <div className="this-portfolio-page-one">
            <div className="this-portfolio-modal-info-container">
              <div className="this-portfolio-modal-info">
                For this portfolio, I set out to challenge my design and styling
                skills. I used React for the UI and JavaScript to implement
                horizontal scrolling and loading progress on launch. Blender was
                essential for modeling and animating 3D objects like the
                portfolio title, Android phones, and the 3D resume. To optimize
                for various viewports, I applied modern grid displays with flex
                containers, which also played a key role in creating the stage
                curtain. CSS animations and keyframes brought the Docker whale
                and other animations to life.
              </div>
            </div>
          </div>

          {/* PAGE 2 */}
          <div className="this-portfolio-page-two">
            <div className="grid-title-text-container">
              <div className="grid-title-text">Grid Layout</div>
            </div>
            <div className="grid-paragraph-container">
              <div className="grid-paragraph">
                I’ve become highly proficient with grid layouts and flex
                containers. When I first learned about grid displays, I was
                amazed at how straightforward they were to implement. Creating
                sub-grids within main grids allowed me to align items
                effortlessly, and using media queries made it easy to adapt
                layouts for different devices. This approach has significantly
                simplified the process of aligning and organizing content across
                my portfolio.
              </div>
            </div>
            <div className="grid-image-hey-you-container">
              <img
                src={heyYouGrid}
                className="grid-image-hey-you"
                alt="grid image from hey you modal"
              />
            </div>
            <div className="curtain-grid-image-container">
              <img
                src={curtainGrid}
                className="curtain-grid-image"
                alt="curtain grid image"
              />
            </div>
          </div>
          {/* PAGE 3 */}
          <div className="this-portfolio-page-three">
            <div className="css-animation-title-text-container">
              <div className="css-animation-title-text">
                CSS animations and keyframes
              </div>
            </div>

            <div className="css-animation-paragraph-container">
              <div className="css-animation-paragraph">
                I have a deep passion for working on animations. It fascinates
                me how countless elements come together frame by frame, which
                ties into my love for theatre and storytelling. Using keyframes
                felt natural, as it closely resembles animating 3D objects in
                Blender and 2D in ToonBoom Harmony. Both involve manipulating x,
                y, and z coordinates on an animation timeline. While coding
                keyframes required more mental visualization compared to the
                visual interfaces of Blender and ToonBoom, sketching ideas on
                paper made everything click.
              </div>
            </div>
            <div className="whale-keyframes-image-hey-you-container">
              <img
                src={whaleKeyframes}
                className="whale-keyframes-image-hey-you"
                alt="whale keyframes from css for hey you modal"
              />
            </div>
            <div className="animation-whale-hey-you-container">
              <img
                src={animationWhaleHeyYou}
                className="animation-whale-hey-you"
                alt="hey you modal whale animation"
              />
            </div>

            <div className="splash-keyframes-image-hey-you-container">
              <img
                src={splashKeyframes}
                className="splash-keyframes-image-hey-you"
                alt="splash keyframes from css for hey you modal"
              />
            </div>
            <div className="animation-splash-hey-you-container">
              <img
                src={animationSplashHeyYou}
                className="animation-splash-hey-you"
                alt="splash animation from hey you modal"
              />
            </div>
          </div>
          {/* PAGE 4 */}
          <div className="this-portfolio-page-four">
            <div className="three-dee-implementation-title-text-container">
              <div className="three-dee-implementation-title-text">
                3D Implementation
              </div>
            </div>
            <div className="three-dee-paragraph-container">
              <div className="three-dee-paragraph">
                I designed and animated the portfolio logo and the 3D resume
                using Blender. After creating these models, I exported them as
                GLTF files and used React Three Fiber to import and render them
                within React. This allowed me to integrate the 3D
                elements into the interactive scene.
              </div>
            </div>
            <div className="use-effect-image-container">
              <img src={useEffectCode} className="use-effect-image" alt="use effect" />
            </div>
            <div className="resume-canvas-image-container">
              <img
                src={resumeCanvas}
                className="resume-canvas-image"
                alt="resume canvas"
              />
            </div>
            <div className="logo-canvas-image-container">
              <img
                src={logoCanvas}
                className="logo-canvas-image"
                alt="logo canvas"
              />
            </div>

            <div className="logo-model-image-container">
              <img
                src={logoModel}
                className="logo-model-image"
                alt="logo model"
              />
            </div>

            <div className="resume-model-image-container">
              <img
                src={resumeModel}
                className="resume-model-image"
                alt="resume model"
              />
            </div>

            

          </div>

          {/* PAGE 5 */}
          <div className="this-portfolio-page-five">
            <div className="java-script-title-text-container">
              <div className="java-script-title-text">
                Java Script
              </div>
            </div>
            <div className="java-script-paragraph-container">
              <div className="java-script-paragraph">
                I needed to create a loading screen in order to give time for 
                the gltf files to load. otherwise there wont be a smooth transition.
                I used Java Script 
              </div>
            </div>
          </div>

          {/* PAGE 6 */}
          <div className="this-portfolio-page-six"></div>

          {/* PAGE 7 */}
          <div className="this-portfolio-page-seven"></div>
        </div>
      </ModalBody>
      <ModalFooter className="this-portfolio-modal-footer">
        <Button
          color="danger"
          className="this-portfolio-modal-close-btn"
          onClick={closeModal}
        >
          Close
        </Button>
        <Button
          color="warning"
          className="this-portfolio-site-btn"
          onClick={(src) => "mailto:ib2ra2heem@gmail.com"}
        >
          Email Me!
        </Button>
        <Button
          color="info"
          className="this-portfolio-modal-github-btn"
          onClick={(src) =>
            window.open(
              "https://github.com/ibrahim-karim-22/ibrahim-karim-portfolio"
            )
          }
        >
          GitHub
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ThisPortfolioModal;
