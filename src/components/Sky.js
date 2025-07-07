import React from "react";
import { useEffect, useState } from "react";

const Sky = () => {
  const rayCount = 20;
  const [rayProps, setRayProps] = useState(
    Array.from({ length: rayCount }, () => generateRayStyle())
  );

  function generateRayStyle() {
    return {
      color: `hsl(${Math.random() * 360}, 100%, 80%)`,
      height: `${Math.random() * 500 + 100}px`,
      left: `${Math.random() * 100}vw`,
      delay: `${Math.random() * 5}s`,
      // zIndex: `${Math.random() < 0.5 ? -1 : 4000}`,
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setRayProps((prev) => prev.map(() => generateRayStyle()));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="base">
      {rayProps.map((props, index) => (
        <div
          key={`ray-${index}`}
          className="ray"
          style={{
            animation: `ray 2s infinite`,
            animationDelay: props.delay,
            height: props.height,
            backgroundColor: props.color,
            boxShadow: `0 0 50px 10px ${props.color}`,
            position: "absolute",
            left: props.left,
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
