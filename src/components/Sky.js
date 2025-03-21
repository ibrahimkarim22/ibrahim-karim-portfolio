import { useEffect, useState } from "react";
const Sky = () => {
  const [delays, setDelays] = useState([]);
  const snow = [
    { id: "snow1", gridColumn: "1 / 2", zIndex: "-1" },
    { id: "snow2", gridColumn: "2 / 4", zIndex: "1" },
    { id: "snow3", gridColumn: "4 / 5", zIndex: "-1" },
    { id: "snow4", gridColumn: "5 / 6", zIndex: "1" },
    { id: "snow5", gridColumn: "6 / 7", zIndex: "-1" },
    { id: "snow6", gridColumn: "7 / 8", zIndex: "1" },
    { id: "snow7", gridColumn: "8 / 9", zIndex: "-1" },
  ];

  useEffect(() => {
    setDelays(snow.map(() => `${Math.random() * 10}s`));
  }, []);

  return (
    <div className="sky">
      {snow.map((i, index) => (
        <div
          key={i.id}
          className="snow"
          style={{
            animation: `snow 11s linear infinite`,
            animationDelay: delays[index],
            gridColumn: i.gridColumn,
            zIndex: i.zIndex,
          }}
        ></div>
      ))}
    </div>
  );
};

export default Sky;
