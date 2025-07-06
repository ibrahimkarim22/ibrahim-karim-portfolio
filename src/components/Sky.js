import React from "react";
import { useEffect, useState } from "react";
const Sky = () => {
  
  const [delays, setDelays] = useState([]);
  const [startSnow, setStartSnow] = useState(false);
  const [snowProps, setSnowProps] = useState([]);


  const snow = [
    // { id: "snow1", gridColumn: "1 / 2" },
    // { id: "snow2", gridColumn: "2 / 4" },
    // { id: "snow3", gridColumn: "4 / 5" },
    // { id: "snow4", gridColumn: "5 / 6" },
    // { id: "snow5", gridColumn: "6 / 7" },
    // { id: "snow6", gridColumn: "7 / 8" },
    // { id: "snow7", gridColumn: "8 / 9" },
    { id: "snow1" },
    { id: "snow2" },
    { id: "snow3" },
    { id: "snow4" },
    { id: "snow5" },
    { id: "snow6" },
    { id: "snow7" },
  ];

  const zIndex = Math.random() < 0.5 ? -1 : 3000;

  useEffect(() => {
    setDelays(snow.map(() => `${Math.random() * 5}s`));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStartSnow(true);
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const generateProps = () => {
      return snow.map(() => ({
        rayColor: `hsl(${Math.random() * 360}, 100%, 80%)`,
        height: `${Math.random() * 500 + 100}px`,
        left: `${Math.random() * 100}vw`,
      }));
    };
      
setSnowProps(generateProps());

const interval = setInterval(() => {
  setSnowProps(generateProps());
}, 10000)

return () => clearInterval(interval);
    }, [snow]);

    return (
    <div className="sky" style={{zIndex: zIndex}}>
      {startSnow && 
        snowProps.length > 0 &&
        snow.map((i, index) => {
          const { rayColor, height, left } = snowProps[index] || {};
          
        return (
          <div
            key={i.id}
            className="snow"
            style={{
              animation: `snow 2s infinite`,
              animationDelay: delays[index],
              gridColumn: i.gridColumn,
              // zIndex: zIndex,
              height: height,
              backgroundColor: rayColor,
              boxShadow: `0 0 50px 10px ${rayColor}`,
              position: "absolute",
              left: left,
              top: 0,
            }}
          ></div>
        );
      })}
    </div>
  );
};

export default React.memo(Sky);
