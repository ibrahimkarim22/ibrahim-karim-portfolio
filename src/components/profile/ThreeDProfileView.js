import { useState, useEffect } from "react";
import BlenderEnvironment from "../3dEnvironment";
import Progress from "../Progress";

function ThreeDProfileView() {
  const [progress, setProgress] = useState(0);
  const [loadModel, setLoadModel] = useState(false);

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

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setLoadModel(true);
    }
  }, [progress]);

  return (
    <div className="three-dee-profile-view">
      {progress < 100 ? (
        <Progress progress={progress} contained />
      ) : (
        <div className="blender-environment" align="center">
          {loadModel && <BlenderEnvironment />}
          <div className="orbit-instructions">
            <p>
              <span className="red-text">RC</span> Pan
              <br />
              <span className="red-text">LC</span> Rotate
              <br />
              <span className="red-text">MW</span> Zoom
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThreeDProfileView;
