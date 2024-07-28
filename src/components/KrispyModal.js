import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";


function KrispyModal({ isOpen, closeModal }) {
    return (
        <Modal
            isOpen={isOpen}
            toggle={closeModal}
            fullscreen
            className="krispy-modal-main-div"
        >
            <ModalHeader toggle={closeModal} className="krispy-modal-header">
                <div className="krispy-modal-header-text">KRISPY</div>
            </ModalHeader>
            <ModalBody className="krispy-modal-body">
                <div className="krispy-modal-header-sub-text-container">
                    <div className="krispy-modal-header-sub-text">Streaming Service: JavaScript, React, Firebase, Firestore, Redux, SCSS, SASS.</div>
                </div>
                <div className="krispy-modal-info">
                   Krispy is a streaming service I created using React and Firebase. 
                   Watch all of Charlie Chaplin's public domain films.
                   Watch live streams from "Nat Geo Wild", "National Geography", 
                   "Disney XD", "Disney Channel" "DW News", "NBC News", "France 24", "FOX News",
                   "Dateline NBC", "Aljazeera Arabic", "DW Arabic", Sky News", "NASA TV", "euronews",
                   and "ABC News".
                   Krispy also includes live streams from "Venice, Italy", "London, UK", "New York", "Amsterdam, Netherlands", 
                   "Rio de Janero, Brazil", "Miami, Florida", and "Tokyo, Japan".
                </div>
                </ModalBody>
            <ModalFooter className="krispy-modal-footer">
                <Button color="danger" className="krispy-modal-close-btn" onClick={closeModal}>
                    Close
                </Button>
                <Button
          color="warning"
          className="krispy-site-btn"
          onClick={(src) =>
            window.open("https://krispy22.web.app", "_blank")
          }
        >
          Watch Now!
        </Button>
        <Button
          color="info"
          className="whacka-modal-github-btn"
          onClick={(src) =>
            window.open(
              "https://github.com/ibrahim-karim-22/portfolioProjectReact"
            )
          }
        >
          GitHub
        </Button>
            </ModalFooter>
        </Modal>    

    )

}

export default KrispyModal;