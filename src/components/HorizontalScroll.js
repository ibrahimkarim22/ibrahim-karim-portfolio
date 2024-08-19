import { useEffect, useRef } from "react";

const HorizontalScroll = ({ children, className }) => {
  const scrollContainerRef = useRef(null);
  let scrollTimeout;

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const onWheel = (event) => {
      if (event.deltaY !== 0) {
        event.preventDefault();
        scrollContainer.scrollLeft += event.deltaY * 3;
      }
    };

    const onScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        alignScroll();
      }, 150);
    };

    const alignScroll = () => {
      const pages = scrollContainer.querySelectorAll(".hey-you-page");
      const pagesPositions = Array.from(pages).map((page) => page.offsetLeft);
      const scrollLeft = scrollContainer.scrollLeft;
      const nearestPosition = pagesPositions.reduce((prev, curr) => {
        return Math.abs(curr - scrollLeft) < Math.abs(prev - scrollLeft)
          ? curr
          : prev;
      });
      scrollContainer.scrollTo({ left: nearestPosition, behavior: "smooth" });
    };

    scrollContainer.addEventListener("wheel", onWheel);
    scrollContainer.addEventListener("scroll", onScroll);

    return () => {
      scrollContainer.removeEventListener("wheel", onWheel);
      scrollContainer.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={scrollContainerRef} className={className}>
      {children}
    </div>
  );
};

export default HorizontalScroll;
