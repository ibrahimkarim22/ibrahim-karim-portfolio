import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Modal } from "reactstrap";
import HomeBiography from "./HomeBiography";

export default function AboutMeSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const originalOverflowRef = useRef(null);

  // Reactstrap restores computed overflow on unmount. Preserve the original
  // inline value and priority after this sheet has finished closing instead.
  useLayoutEffect(() => {
    if (!isOpen && originalOverflowRef.current) {
      const { value, priority } = originalOverflowRef.current;
      document.body.style.setProperty("overflow", value, priority);
      originalOverflowRef.current = null;
    }
  }, [isOpen]);

  // Resizing or leaving Home can unmount an open sheet. Restore after the
  // child modal's unmount cleanup, just as we do when its close control is used.
  useEffect(() => () => {
    if (originalOverflowRef.current) {
      const { value, priority } = originalOverflowRef.current;
      document.body.style.setProperty("overflow", value, priority);
    }
  }, []);

  function openSheet() {
    originalOverflowRef.current = {
      value: document.body.style.getPropertyValue("overflow"),
      priority: document.body.style.getPropertyPriority("overflow"),
    };
    setIsOpen(true);
  }

  return (
    <div className="home-about">
      <button
        className="home-about__trigger"
        type="button"
        aria-haspopup="dialog"
        aria-controls="about-me-dialog"
        aria-expanded={isOpen}
        onClick={openSheet}
      >
        About Me
      </button>
      {isOpen && (
        <Modal
          id="about-me-dialog"
          isOpen
          toggle={() => setIsOpen(false)}
          labelledBy="about-me-heading"
          modalClassName="about-me-modal"
          className="about-me-sheet"
          contentClassName="about-me-sheet__content"
          backdropClassName="about-me-backdrop"
          fade={false}
          autoFocus={false}
          keyboard
          backdrop
          trapFocus
          returnFocusAfterClose
        >
          <header className="about-me-sheet__header">
            <h2 id="about-me-heading">About Me</h2>
            <button
              className="about-me-sheet__close"
              type="button"
              aria-label="Close About Me"
              autoFocus
              onClick={() => setIsOpen(false)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <div className="about-me-sheet__body">
            <HomeBiography />
          </div>
        </Modal>
      )}
    </div>
  );
}
