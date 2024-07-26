import { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

function WhackaModal({ isOpen, closeModal }) {
  return (
    <Modal isOpen={isOpen} toggle={closeModal} fullscreen>
      <ModalHeader toggle={closeModal} className="whacka-modal-header">
        <div className="whacka-modal-header-text">Whack a Mole</div>
      </ModalHeader>
      <ModalBody className="whacka-modal-body">
        <p className="whacka-modal-info">
          Whack a Mole is a JavaScript game created by my two colleagues
          (Brandon O'Shea and Sam Golshan) and I. Team work though Git and
          GitHub plus live share was the pinnacle point of this expeirence. It
          is a 2d game where you have to hit as many moles as you can. Don't
          forget: you have 1 life. Don't miss the extra points mole. Do Not
          click on the Nuke!
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={closeModal}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default WhackaModal;
