import React from "react";
import { useEffect, useState } from "react";

const Sky = () => {
  const [rayStyles, setRayStyles] = useState([]);
  
  const generateRayStyle = () => ({
      color: `hsl(${Math.random() * 360}, 100%, 80%)`,
      height: `${Math.random() * 500 + 100}px`,
      left: `${Math.random() * 100}vw`,
      delay: `${Math.random() * 5}s`,
      // zIndex: `${Math.random() < 0.5 ? -1 : 4000}`,
    });

    

  /* useEffect(() => {
    const interval = setInterval(() => {
      setRayStyle((prev) => prev.map(() => generateRayStyle()));
    }, 4000);

    return () => clearInterval(interval);
  }, []); */


  useEffect(() => {
    const updateRayStyles = () => {
      const rayCount = window.innerWidth <= 1100 ? 7 : 22;
      const newStyles = Array.from({ length: rayCount }, generateRayStyle);
      setRayStyles(newStyles);
    }

    updateRayStyles();

    const handleResize = () => {
      updateRayStyles();
    }
    window.addEventListener("resize", handleResize);

    const interval = setInterval(() => {
      updateRayStyles();
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    }
  }, [])

  return (
    <div className="base">
      {rayStyles.map((styles, index) => (
        <div
          key={`ray-${index}`}
          className="ray"
          style={{
            animation: `ray 2s infinite`,
            animationDelay: styles.delay,
            height: styles.height,
            backgroundColor: styles.color,
            boxShadow: `0 0 50px 10px ${styles.color}`,
            position: "absolute",
            left: styles.left,
            top: 0,
            width: "4px",
            borderRadius: "2px",
            transition: "none",
            // zIndex: props.zIndex,
   
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(Sky);
