import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { applyProfileFrame, fitSkyline } from "./profileCamera";

const ProfileCameraRig = forwardRef(function ProfileCameraRig({ bounds, controlsRef, interactionRef, onReady }, ref) {
  const camera = useThree((state) => state.camera);
  const { width, height } = useThree((state) => state.size);
  const aspect = height > 0 ? width / height : 1;

  const resetView = useCallback(() => {
    const controls = controlsRef.current;
    if (!bounds || bounds.isEmpty() || !controls || controls.object !== camera) return;
    applyProfileFrame(camera, controls, fitSkyline(bounds, aspect));
    interactionRef.current = false;
    onReady?.(true);
  }, [aspect, bounds, camera, controlsRef, interactionRef, onReady]);

  useImperativeHandle(ref, () => ({ resetView }), [resetView]);

  useLayoutEffect(() => {
    if (!interactionRef.current) resetView();
    else {
      // Keep an intentionally chosen viewpoint, including its zoom. Only the
      // projection changes; explicit Reset opts back into aspect-aware fitting.
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
  }, [aspect, camera, interactionRef, resetView]);

  return null;
});

export default ProfileCameraRig;
