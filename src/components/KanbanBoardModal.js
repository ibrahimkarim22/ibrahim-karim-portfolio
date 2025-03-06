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
                    <ModalBody className='kanband-modal-main'>

                    </ModalBody>
                )}
            </Modal>
    )
}

export default KanbanBoardModal;