import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { Parallax, ParallaxProvider } from "react-scroll-parallax";
import folger from "../images/folger.jpg";
import mit from "../images/mit.png";
import firebase from "../images/firebase.png";
import firestore from "../images/firestore.png";
import folgerSlice from "../images/folgerSlice.png";
import mitSlice from "../images/mitSlice.png";
import redux from "../images/redux.png";
import bardSignUp from "../images/bardSignUp.png";
import bardLogin from "../images/bardLogin.png";
import playsRoot from "../images/playsRoot.png";
import medalsCode from "../images/medalsCode.png";
import quizCode from "../images/quizCode.png";
import certificateCode from "../images/certificateCode.png";
import freeFolger from "../images/freeFolger.png";
import freeSynopsis from "../images/freeSynopsis.png";
import readFolger from "../images/readFolger.png";
import phoneBardHome from "../images/phoneBardHome.png";
import phoneBardProfile from "../images/phoneBardProfile.png";
import phoneBardSideMenu from "../images/phoneBardSideMenu.png";
import phoneBardCourse from "../images/phoneBardCourse.png";
import phoneBardQuiz from "../images/phoneBardQuiz.png";
import phoneBardQuizOne from "../images/phoneBardQuizOne.png";
import phoneBardMedals from "../images/phoneBardMedals.png";
import phoneBardInfo from "../images/phoneBardInfo.png";
import phoneBardSynopsis from "../images/phoneBardSynopsis.png";
import phoneBardPerformance from "../images/phoneBardPerformance.png";
import phoneBardHowTo from "../images/phoneBardHowTo.png";
import native from "../images/native.png";

function BardModal({ isOpen, closeModal }) {
  return (
    // <ParallaxProvider>
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="bard-modal-main-div"
    >
      {isOpen && (
        <ModalHeader toggle={closeModal} className="bard-modal-header">
          <div className="bard-modal-header-text">BARD</div>
          <div className="bard-modal-header-text-two">Online Course</div>
        </ModalHeader>
      )}
      {isOpen && (
        <ModalBody className="bard-modal-body-main">
          <div className="bard-modal-main-flex-container">
            <div className="bard-modal-intro-page-one-container">
              {/* <Parallax x={[50, -50]} tagOuter="div"> */}
              <div className="curtain-container">
                <div className="curtain-shadow-one-container">
                  <div className="curtain-shadow-one"></div>
                </div>
                <div className="curtain-shadow-two-container">
                  <div className="curtain-shadow-two"></div>
                </div>
                <div className="curtain-shadow-three-container">
                  <div className="curtain-shadow-three"></div>
                </div>
                <div className="curtain-shadow-four-container">
                  <div className="curtain-shadow-four"></div>
                </div>
                <div className="curtain-shadow-five-container">
                  <div className="curtain-shadow-five"></div>
                </div>
                <div className="curtain-shadow-six-container">
                  <div className="curtain-shadow-six"></div>
                </div>
                <div className="curtain-shadow-seven-container">
                  <div className="curtain-shadow-seven"></div>
                </div>
                <div className="curtain-shadow-eight-container">
                  <div className="curtain-shadow-eight"></div>
                </div>
                <div className="curtain-shadow-nine-container">
                  <div className="curtain-shadow-nine"></div>
                </div>
                <div className="curtain-shadow-ten-container">
                  <div className="curtain-shadow-ten"></div>
                </div>
              </div>
            </div>

            <div className="bard-modal-page-two-container">
              <div className="bard-modal-intro-text-container">
                <div className="bard-modal-intro-text">
                  I created an{" "}
                  <span className="online-course-animation">online</span>{" "}
                  <span className="online-course-animation">course</span>{" "}
                  platform for all 38 of{" "}
                  <span className="shakespeare">Shakespeare</span>'s plays. This
                  application aims to provide an engaging way for users to
                  explore <span className="shakespeareTwo">Shakespeare</span>'s
                  works through a combination of reading, quizzes, and video
                  content.
                </div>
              </div>
              <div className="bard-honors-award-text-container">
                <div className="bard-honors-award-text">
                  Nucamp Front-End Honors Award
                </div>
              </div>
            </div>

            <div className="bard-modal-page-three-container">
              <div className="bard-react-native-container">
                <img
                  src={native}
                  alt="React Native logo"
                  className="bard-react-native-logo"
                />
              </div>
              <div className="phone-bard-home-container">
                <img
                  src={phoneBardHome}
                  alt="Bard app home page"
                  className="phone-bard-home"
                />
              </div>
              <div className="phone-bard-profile-container">
                <img
                  src={phoneBardProfile}
                  alt="Bard app profile page"
                  className="phone-bard-profile"
                />
              </div>
              <div className="phone-bard-side-menu-container">
                <img
                  src={phoneBardSideMenu}
                  alt="Bard app side menu"
                  className="phone-bard-side-menu"
                />
              </div>
              <div className="phone-bard-course-container">
                <img
                  src={phoneBardCourse}
                  alt="Bard app course page"
                  className="phone-bard-course"
                />
              </div>
              <div className="phone-bard-quiz-container">
                <img
                  src={phoneBardQuiz}
                  alt="Bard app quiz page"
                  className="phone-bard-quiz"
                />
              </div>
              <div className="phone-bard-quiz-one-container">
                <img
                  src={phoneBardQuizOne}
                  alt="Bard app quiz one page"
                  className="phone-bard-quiz-one"
                />
              </div>
              <div className="phone-bard-medals-container">
                <img
                  src={phoneBardMedals}
                  alt="Bard app medals page"
                  className="phone-bard-medals"
                />
              </div>
              <div className="phone-bard-synopsis-container">
                <img
                  src={phoneBardSynopsis}
                  alt="Bard app synopsis page"
                  className="phone-bard-synopsis"
                />
              </div>
              <div className="phone-bard-info-container">
                <img
                  src={phoneBardInfo}
                  alt="Bard app info page"
                  className="phone-bard-info"
                />
              </div>
            </div>

            <div className="bard-modal-page-four-container">
              <div className="bard-modal-api-title-container">
                <div className="bard-modal-api-title">APIs</div>
              </div>
              <div className="bard-modal-folger-text-container">
                <div className="bard-modal-folger-text">
                  <span className="api-text">
                    Folger Shakespeare Library's official API
                  </span>{" "}
                  <span className="blue-text">
                    {" "}
                    for fetching the synopsis and character lists for each play
                  </span>
                  .
                </div>
              </div>
              <div className="bard-modal-folger-logo-container">
                <img
                  src={folger}
                  alt="folger logo"
                  className="folger-logo"
                ></img>
              </div>

              <div className="bard-modal-mit-text-container">
                <div className="bard-modal-mit-text">
                  <span className="api-text">MIT public domain API</span>{" "}
                  <span className="blue-text">
                    for fetching the complete texts of the plays
                  </span>
                  .
                </div>
              </div>
              <div className="bard-modal-mit-logo-container">
                <img src={mit} alt="MIT logo" className="mit-logo"></img>
              </div>
              <div className="mit-slice-container">
                <img src={mitSlice} alt="MIT slice" className="mit-slice" />
              </div>
              <div className="folger-slice-container">
                <img
                  src={folgerSlice}
                  alt="Folger slice"
                  className="folger-slice"
                />
              </div>
            </div>

            <div className="bard-modal-page-five-container">
              <div className="bard-modal-user-title-container">
                <div className="bard-modal-user-title">User Account</div>
              </div>
              <div className="bard-modal-firebase-text-container">
                <div className="bard-modal-firebase-text">
                  Users create accounts, which are securely stored in{" "}
                  <span className="blue-text">G</span>
                  <span className="red-text">o</span>
                  <span className="yellow-text">o</span>
                  <span className="blue-text">g</span>
                  <span className="highlighter-green-text">l</span>
                  <span className="red-text">e</span>{" "}
                  <span className="orange-text">Firestore</span>. Upon account
                  creation, each user receives a unique profile that includes
                  their email, password, a default profile picture (which can be
                  updated), and their progress through the plays. Upon login the
                  data from firestore is used to update the redux state of the
                  completed quiz levels and resume user's progress.
                </div>
              </div>
              <div className="bard-modal-firebase-logo-container">
                <img
                  src={firebase}
                  alt="firebase logo"
                  className="bard-modal-firebase-logo"
                />
              </div>
              <div className="bard-modal-firestore-logo-container">
                <img
                  src={firestore}
                  alt="firestore logo"
                  className="bard-modal-firestore-logo"
                />
              </div>
              <div className="bard-modal-redux-container">
                <img
                  src={redux}
                  alt="redux logo"
                  className="bard-modal-redux"
                />
              </div>
              <div className="bard-sign-up-container">
                <img
                  src={bardSignUp}
                  alt="bard sign up"
                  className="bard-sign-up"
                />
              </div>
              <div className="bard-login-container">
                <img src={bardLogin} alt="bard login" className="bard-login" />
              </div>
            </div>

            <div className="bard-modal-page-six-container">
              <div className="main-features-title-container">
                <div className="main-features-title">Main Features</div>
              </div>
              <div className="bard-modal-features-text-one-container">
                <div className="bard-modal-features-text-one">
                  <span className="bold-text">Level System</span>: Users
                  progress through the plays in an order that typically starts
                  with those familiar from high school, such as "The Tempest."
                  The levels range from easier to more challenging plays.
                </div>
              </div>
              <div className="plays-root-container">
                <img src={playsRoot} alt="plays root" className="plays-root" />
              </div>

              <div className="bard-modal-features-text-two-container">
                <div className="bard-modal-features-text-two">
                  <span className="bold-text">Synopsis & Quizzes</span>: Each
                  level begins with a synopsis of the play. Users can choose to
                  take a quiz after reading the synopsis, with the option to
                  read the entire play before attempting the quiz. Quizzes
                  consist of 7 questions, and users must achieve a perfect score
                  to earn a medal and unlock the next level.
                </div>
              </div>
              <div className="quiz-code-container">
                <img
                  src={quizCode}
                  alt="quiz code code"
                  className="quiz-code"
                />
              </div>

              <div className="bard-modal-features-text-three-container">
                <div className="bard-modal-features-text-three">
                  <span className="bold-text">
                    Unlocking Plays and Earning Medals
                  </span>
                  : Plays are locked initially, and users must complete them in
                  sequence to unlock the next. Successfully completing each play
                  awards a medal, and collecting all 38 medals grants a
                  certificate.
                </div>
              </div>
              <div className="medals-code-container">
                <img
                  src={medalsCode}
                  alt="medals code"
                  className="medals-code"
                />
              </div>
              <div className="certificate-code-container">
                <img
                  src={certificateCode}
                  alt="certificate code"
                  className="certificate-code"
                />
              </div>
            </div>
            <div className="bard-modal-page-seven-container">
              <div className="additional-features-title-container">
                <div className="additional-features-title">
                  Additional Features
                </div>
              </div>
              <div className="bard-modal-additional-features-text-one-container">
                <div className="bard-modal-additional-features-text-one">
                  <span className="bold-text">Free Read</span>: Users can read
                  synopsis and attempt quizzes in sequence, or they can choose
                  to read the full plays at their discretion. Also, users can
                  explore all synopsis or full texts in any order without
                  following the course structure.
                </div>
              </div>

              <div className="free-folger-container">
                <img
                  src={freeFolger}
                  alt="free folger code"
                  className="free-folger"
                />
              </div>
              <div className="free-synopsis-container">
                <img
                  src={freeSynopsis}
                  alt="free synopsis code"
                  className="free-synopsis"
                />
              </div>
              <div className="read-folger-container">
                <img
                  src={readFolger}
                  alt="read folger code"
                  className="read-folger"
                />
              </div>
              <div className="bard-modal-additional-features-text-two-container">
                <div className="bard-modal-additional-features-text-two">
                  <span className="bold-text">Video Content</span>: The platform
                  includes sections for watching 'Great Performances' and 'How
                  To' videos on Shakespeare, sourced from YouTube, enhancing the
                  learning experience.
                </div>
              </div>
              <div className="phone-bard-performance-container">
                <img
                  src={phoneBardPerformance}
                  alt="phone bard performance"
                  className="phone-bard-performance"
                />
              </div>
              <div className="phone-bard-how-to-container">
                <img
                  src={phoneBardHowTo}
                  alt="phone bard how to"
                  className="phone-bard-how-to"
                />
              </div>
            </div>
            <div className="bard-modal-page-eight-container">
              <div className="bard-modal-honors-title-container">
                <div className="bard-modal-honors-title">
                  Honors Video Submission
                </div>
              </div>
              <div className="bard-modal-honors-video-container">
                <iframe
                  className="bard-modal-honors-video"
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/mDVozMvFYb8?si=ep73q8kv4df0j77v"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                ></iframe>
              </div>
              <div className="bard-copyright-container">
                <div className="copyright-text">&copy; 2024 Ibrahim Karim.</div>
              </div>
            </div>
          </div>
        </ModalBody>
      )}
      {isOpen && (
        <ModalFooter className="bard-modal-footer">
          <Button
            color="danger"
            className="bard-modal-close-btn"
            onClick={closeModal}
          >
            EXIT
          </Button>
          <Button
            color="warning"
            className="bard-apk-download-btn"
            onClick={(src) =>
              window.open(
                "https://drive.google.com/file/d/1kblapPn0vab5BiiJwcaMAioJ5yW14cCf/view?usp=drive_link",
                "_blank"
              )
            }
          >
            APK!
          </Button>
          <Button
            color="info"
            className="bard-modal-github-btn"
            onClick={(src) =>
              window.open(
                "https://github.com/ibrahim-karim-22/reactNativePortfolioProject"
              )
            }
          >
            GitHub
          </Button>
        </ModalFooter>
      )}
    </Modal>
    // </ParallaxProvider>
  );
}

export default BardModal;
