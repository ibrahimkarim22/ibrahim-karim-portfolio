import { useState, useRef, useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { getNavigationMotionSnapshot, subscribeNavigationMotion } from "../home/navigationMotion";
import BlenderEnvironment from "../3dEnvironment";
import ProfileControls from "./ProfileControls";

function ThreeDProfileView() {
  const [cameraReady, setCameraReady] = useState(false);
  const navigationMoving = useSyncExternalStore(subscribeNavigationMotion, getNavigationMotionSnapshot, () => false);
  const [startRequested, setStartRequested] = useState(false);
  const sceneStarted = useRef(false);
  const startScene = sceneStarted.current || (startRequested && !navigationMoving);
  useLayoutEffect(() => { if (startScene) sceneStarted.current = true; }, [startScene]);
  useEffect(() => {
    if (sceneStarted.current) return undefined;
    if (navigationMoving) { setStartRequested(false); return undefined; }
    let frame = null;
    let cancelled = false;
    const start = () => {
      if (!cancelled && !getNavigationMotionSnapshot()) setStartRequested(true);
    };
    // The shell can paint while the outgoing title is still releasing. A real
    // completed gesture, followed by a paint opportunity, permits GPU startup.
    try {
      frame = requestAnimationFrame(() => {
        try { frame = requestAnimationFrame(start); } catch { start(); }
      });
    } catch { start(); }
    return () => { cancelled = true; if (frame !== null) cancelAnimationFrame(frame); };
  }, [navigationMoving]);
  const environmentRef = useRef(null);
  const onCameraReady = useCallback((ready) => setCameraReady(ready), []);

  return (
    <div className="three-dee-profile-view">
      <div className="blender-environment" align="center" aria-busy={!cameraReady}>
        {startScene && <BlenderEnvironment ref={environmentRef} onReady={onCameraReady} />}
        <ProfileControls ready={cameraReady} onReset={() => environmentRef.current?.resetView()} />
      </div>
    </div>
  );
}

export default ThreeDProfileView;
