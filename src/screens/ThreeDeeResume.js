import { useState, useEffect } from "react";
import BlenderEnvironment from "../components/3dEnvironment";
import Progress from "../components/Progress";

function ThreeDeeResume() {
  const [progress, setProgress] = useState(0);
  const [loadModel, setLoadModel] = useState(false);

  useEffect(() => {
    // Simulate loading progress
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

    return () => clearInterval(interval); 
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setLoadModel(true); 
    }
  }, [progress]);

  return (
    <div className="three-dee-resume-page">
      {progress < 100 ? (
        <Progress progress={progress} />
      ) : (
        <div className="blender-environment" align="center">
          {loadModel && <BlenderEnvironment />} 
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
    </div>
  );
}

export default ThreeDeeResume;
