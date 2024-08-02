import { useEffect, useRef } from "react";

const HorizontalScroll = ({ children, className }) => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const onWheel = (event) => {
      if (event.deltaY !== 0) {
        event.preventDefault();
        scrollContainer.scrollLeft += event.deltaY * 7;
      }
    };

    scrollContainer.addEventListener("wheel", onWheel);

    return () => {
      scrollContainer.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div ref={scrollContainerRef} className={className}>
      {children}
    </div>
  );
};

export default HorizontalScroll;
