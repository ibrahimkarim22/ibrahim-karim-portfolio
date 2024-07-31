import { useEffect, useRef } from "react";

const HorizontalScroll = ({ children }) => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const onWheel = (event) => {
      if (event.deltaY !== 0) {
        event.preventDefault();
        scrollContainer.scrollLeft += event.deltaY;
      }
    };

    scrollContainer.addEventListener("wheel", onWheel);

    return () => {
      scrollContainer.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div
      ref={scrollContainerRef}
          className="hey-you-modal-body"
    >
      {children}
    </div>
  );
};

export default HorizontalScroll;
