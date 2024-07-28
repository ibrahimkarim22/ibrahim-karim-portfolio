import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";


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
            <ModalBody className="this-portfolio-modal-body">
                <div className="this-portfolio-modal-header-sub-text-container">
                    <div className="this-portfolio-modal-header-sub-text">Tools I used to build this portfolio:
                       JavaScript, React, Firebase, React Fiber, Reactstrap, SCSS, SASS, Blender, Photoshop.</div>
                </div>
                <div className="this-portfolio-modal-info">
                  I built this portfolio with the idea of 3d objects and animations. I used blender to create the site's logo and the 3d Resume.
                  I exported them as gltf files and imported them using react fiber. 
                </div>
                </ModalBody>
            <ModalFooter className="this-portfolio-modal-footer">
                <Button color="danger" className="this-portfolio-modal-close-btn" onClick={closeModal}>
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

    )

}

export default ThisPortfolioModal;