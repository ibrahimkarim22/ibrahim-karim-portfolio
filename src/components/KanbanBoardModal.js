import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';



function KanbanBoardModal({ isOpen, closeModal }) {
    return (
        <Modal
            isOpen={isOpen}
            toggle={closeModal}
            fullscreen
            className='kanban-modal-main-div'
            >

                {isOpen && (
                    <ModalHeader toggle={closeModal} className='kanban-modal-header'>
                        <div className='kanban-modal-header-text'>KANBAN BOARD</div>
                        <div className='kanban-modal-header-text-two'>To Do List</div>
                    </ModalHeader>
                )}
                {isOpen && (
                    <ModalBody className='kanban-modal-main'>
                        <h1>Page Under Construction</h1>
                        <h3>Kanban Board can be accssed from <a href='https://kanbanboardtodolist.web.app/'>here</a></h3>
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
              window.open(
                "https://github.com/ibrahimkarim22/kanbanboard"
              )
            }
          >
            GitHub
          </Button>
        </ModalFooter>
      )}
            </Modal>
    )
}

export default KanbanBoardModal;