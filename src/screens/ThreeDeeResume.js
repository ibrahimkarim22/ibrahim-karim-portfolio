import { useState, useEffect } from "react";
import BlenderEnvironment from "../components/3dEnvironment";
import Progress from "../components/Progress";

function ThreeDeeResume() {
  const [progress, setProgress] = useState(0);

  const handleProjects = () => {
    console.log("projects clicked");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return 100;
        }
      });
    }, 50);

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  return (
    <>
      {progress < 100 ? (
        <Progress progress={progress} />
      ) : (
        <div className="blender-environment" align="center">
          <BlenderEnvironment setProgress={setProgress} />
          <div className="orbit-instructions">
            <p>
              <span style={{ color: "blue" }}>RC</span> Pan
              <br />
              <span style={{ color: "blue" }}>LC</span> Rotate
              <br />
              <span style={{ color: "blue" }}>MW</span> Zoom
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ThreeDeeResume;
