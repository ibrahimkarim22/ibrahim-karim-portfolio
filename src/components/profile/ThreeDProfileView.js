import { useState, useRef, useCallback } from "react";
import BlenderEnvironment from "../3dEnvironment";
import ProfileControls from "./ProfileControls";

function ThreeDProfileView() {
  const [cameraReady, setCameraReady] = useState(false);
  const environmentRef = useRef(null);
  const onCameraReady = useCallback((ready) => setCameraReady(ready), []);

  return (
    <div className="three-dee-profile-view">
      <div className="blender-environment" align="center" aria-busy={!cameraReady}>
        <BlenderEnvironment ref={environmentRef} onReady={onCameraReady} />
        <ProfileControls ready={cameraReady} onReset={() => environmentRef.current?.resetView()} />
      </div>
    </div>
  );
}

export default ThreeDProfileView;
