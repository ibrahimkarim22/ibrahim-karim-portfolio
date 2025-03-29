import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import firebase from "../images/firebase.png";
import firestore from "../images/firestore.png";
import sass from "../images/sass.png";
import js from "../images/js.png";
import reactLogo from "../images/reactLogo.png";

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
      {isOpen && <ModalBody className="kanban-modal-main">
        
          <div className="kanban-software">
            <img src={js} alt="javaScript" className="kanban-js"/>
            <img src={sass} alt="sass"  className="kanban-sass" />
            <img src={reactLogo} alt="React" className="kanban-react" />
            <img src={firebase} alt="firebase" className="kanban-firebase" />
            <img src={firestore} alt="firestore" className="kanban-firestore" />

          </div>
        
        </ModalBody>}
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
