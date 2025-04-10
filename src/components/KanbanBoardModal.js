import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import firebase from "../images/firebase.png";
import firestore from "../images/firestore.png";
import sass from "../images/sass.png";
import js from "../images/js.png";
import reactLogo from "../images/reactLogo.png";
import kanbanReact from "../images/kanbanReact.png";
import kanbanReactTwo from "../images/kanbanReactTwo.png";
import kanbanJS from "../images/kanbanJS.png";
import kanbanFirebase from "../images/kanbanFirebase.png";
import kanbanFirebaseLogin from "../images/kanbanFirebaseLogin.png";
import kanbanFirestore from "../images/kanbanFirestore.png";
import kanbanSass1 from "../images/kanbanSass1.png";
import kanbanSass2 from "../images/kanbanSass2.png";
import kanbanSass3 from "../images/kanbanSass3.png";

function KanbanBoardModal({ isOpen, closeModal }) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      fullscreen
      className="kanban-modal-main-div"
    >
      {isOpen && (
        <ModalHeader toggle={closeModal} className="kanban-modal-header">
          <div className="kanban-modal-header-text">KANBAN BOARD</div>
          <div className="kanban-modal-header-text-two">To Do List</div>
        </ModalHeader>
      )}
      {isOpen && (
        <ModalBody className="kanban-modal-main">
          <div className="kanban-software">
            <img src={js} alt="javaScript" className="kanban-js" />
            <img src={sass} alt="sass" className="kanban-sass" />
            <img src={reactLogo} alt="React" className="kanban-react" />
            <img src={firebase} alt="firebase" className="kanban-firebase" />
            <img src={firestore} alt="firestore" className="kanban-firestore" />
          </div>

          <div className="kanban-react-section">
            <div className="kanban-react-section-title">React</div>
            <div className="kanban-react-section-paragraph">
              I used React.JS to create this This Kanban board was built with
              React.js using functional components and React Hooks. I used
              useState to manage local state and useEffect for side effects such
              as fetching/saving data to Firebase. The main file, App.jsx,
              handles the global state and passes props down to: Signup.jsx and
              Login.jsx for authentication TaskInput.jsx for adding tasks and
              toggling themes DroppableArea.jsx for drag-and-drop functionality
              in the "To Do", "In Progress", and "Completed" columns The
              drag-and-drop system is implemented using the native HTML Drag API
              and custom logic in DroppableArea.jsx.
            </div>
            <img src={kanbanReactTwo} alt="kanban react code" className="kanban-react-two-code"/>
            <img src={kanbanReact} alt="kanban react code" className="kanban-react-code"/>

          </div>

          <div className="kanban-js-section">
            <div className="kanban-js-section-title">JavaScript</div>
            <div className="kanban-js-section-paragraph">
              I used JavaScript for core logic such as managing task arrays,
              filtering, and handling asynchronous data fetching. Key features
              like map, filter, destructuring, and async/await are used
              throughout the app—for example, to add or delete tasks and update
              the UI in real time.
            </div>
            <img src={kanbanJS} alt="kanban javascript" className="kanban-js-code"/>
          </div>

          <div className="kanban-firebase-section">
            <div className="kanban-firebase-section-title">
              {" "}
              Firebase authentication
            </div>
            <div className="kanban-firebase-section-paragraph">
              I integrated Firebase Authentication to allow users to sign up and
              log in securely. The Signup.jsx component uses
              createUserWithEmailAndPassword, while Login.jsx uses
              signInWithEmailAndPassword. After a successful login or signup,
              the user’s UID is used to store and retrieve their data in
              Firestore.
            </div>
            <img src={kanbanFirebase} alt="kanban firebase signup" className="kanban-firebase-code" />
            <img src={kanbanFirebaseLogin} alt="kanban firebase login" className="kanban-firebase-login-code"/>
          </div>

          <div className="kanban-firestore-section">
            <div className="kanban-firestore-section-title">
              Firebase Firestore
            </div>
            <div className="kanban-firestore-section-paragraph">
              All user-specific data (tasks, in-progress items, completed items,
              and theme preference) are saved in Firestore under the user’s UID.
              I used Firebase’s setDoc and getDoc functions to read and write
              data. The app syncs with Firestore automatically when the user
              logs in, and updates are saved using a useEffect that triggers
              every time the task state changes.
            </div>
            <img src={kanbanFirestore} alt="kanban firestore" className="kanban-firestore-code"/>
          </div>

          <div className="kanban-sass-section">
            <div className="kanban-sass-section-title">Sass (SCSS)</div>I
            <div className="kanban-sass-section-paragraph">
              used Sass to organize the app’s styling into clean,
              component-based blocks. Variables and nested rules made it easier
              to maintain and tweak the visual theme. The app includes a toggle
              between light and dark mode, implemented using React state to
              control conditional class names, styled in SCSS. The main task
              board (.droppable-areas-container) uses CSS Grid to lay out the
              three droppable areas: "To Do", "In Progress", and "Completed".
            </div>
            <img src={kanbanSass1} alt="kanban sass 1" className="kanban-sass1-code"/>
            <img src={kanbanSass2} alt="kanban sass 2"  className="kanban-sass2-code"/>
            <img src={kanbanSass3} alt="kanban sass 2"  className="kanban-sass3-code"/>
          </div>
        </ModalBody>
      )}
      {isOpen && (
        <ModalFooter className="kanban-modal-footer">
          <Button
            color="danger"
            className="kanban-modal-close-btn"
            onClick={closeModal}
          >
            Close
          </Button>
          <Button
            className="kanban-site-btn"
            onClick={(src) =>
              window.open("https://kanbanboardtodolist.web.app/", "_blank")
            }
          >
            Board
          </Button>
          <Button
            color="info"
            className="kanban-modal-github-btn"
            onClick={(src) =>
              window.open("https://github.com/ibrahimkarim22/kanbanboard")
            }
          >
            GitHub
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}

export default KanbanBoardModal;
