import { Suspense, forwardRef, useState, useEffect, useRef, useMemo, useLayoutEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import landscape from "../models/landscape2.glb";
import { RendererCleanup, useCachedSceneResources } from "./renderResourceLifecycle";
import ProfileCameraRig from "./profile/ProfileCameraRig";
import { createProfileRenderGate } from "./profile/profileScenePreparation";
import { getSkylineBounds } from "./profile/profileCamera";

function BackgroundColor({ color }) {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color(color);
  }, [scene, color]);

  return null;
}

function Landscape({ path, onBoundsReady, onFirstFrame }) {
  const group = useRef();
  const { scene, animations } = useGLTF(path, true);
  useCachedSceneResources(scene);
  const mixer = useRef();
  const renderGate = useRef(null);
  const rendered = useRef(false);
  const { gl, scene: renderScene } = useThree();
  useLayoutEffect(() => {
    const gate = createProfileRenderGate(gl, renderScene);
    renderGate.current = gate;
    rendered.current = false;
    return () => { gate.dispose(); renderGate.current = null; };
  }, [gl, renderScene]);
  const bounds = useMemo(() => getSkylineBounds(scene), [scene]);

  useLayoutEffect(() => { onBoundsReady(bounds); }, [bounds, onBoundsReady]);

  useEffect(() => {
    if (animations.length) {
      mixer.current = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => {
        const action = mixer.current.clipAction(clip);
        action.setLoop(THREE.LoopRepeat);
        action.play();
      });
    }
  }, [scene, animations]);

  useFrame((state, delta) => {
    mixer.current?.update(delta);
    if (renderGate.current?.render(state.camera) && !rendered.current) {
      rendered.current = true;
      onFirstFrame();
    }
  }, 1);

  return <primitive ref={group} object={scene} />;
}

const BlenderEnvironment = forwardRef(function BlenderEnvironment({ onReady }, ref) {
  const [bounds, setBounds] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const onFirstFrame = useCallback(() => setFrameReady(true), []);
  useEffect(() => { onReady?.(cameraReady && frameReady); }, [cameraReady, frameReady, onReady]);
  const cameraRef = useRef();
  const controlsRef = useRef();
  const interactionRef = useRef(false);

  return (
    <div className="blender-environment-canvas">
      <Canvas
        className="resume-canvas"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <RendererCleanup />
        <BackgroundColor color="black" />
        <ambientLight intensity={0} />
        <PerspectiveCamera
          makeDefault
          ref={cameraRef}
          fov={60}
          near={1}
          far={20000}
        />
        <Suspense fallback={null}>
          <Landscape path={landscape} onBoundsReady={setBounds} onFirstFrame={onFirstFrame} />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          minDistance={10}
          zoomSpeed={4}
          onStart={() => { interactionRef.current = true; }}
        />
        <ProfileCameraRig ref={ref} bounds={bounds} controlsRef={controlsRef}
          interactionRef={interactionRef} onReady={setCameraReady} />
      </Canvas>
    </div>
  );
});

export default BlenderEnvironment;
