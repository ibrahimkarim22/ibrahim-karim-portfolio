import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, PerspectiveCamera } from "@react-three/drei";
import logo from "../models/logo.glb";
import "../SCSS/App.scss";

function BackgroundColor({ color }) {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(color);
  }, [scene, color]);
  return null;
}

function LogoInit({ path, position, onReady }) {
  const group = useRef();
  const { scene, animations } = useGLTF(path, true);
  const mixer = useRef();

  useEffect(() => { onReady(); }, [scene, onReady]);

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
  });

  return <primitive ref={group} object={scene} position={position} />;
}

function Logo() {
  const [sceneReady, setSceneReady] = useState(false);
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const cameraRef = useRef();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cameraPosition = windowWidth <= 1250 ? [0.5, 0.5, 4] : [0.45, 0.4, 2];

  return (
    <div className="logo-canvas-container">
      <div className="logo-canvas" aria-busy={!sceneReady}>
        <Canvas className="signature-canvas">
          <BackgroundColor color="snow" />
          <Suspense fallback={null}>
            <LogoInit path={logo} position={[0.5, 0, 0]} onReady={onSceneReady} />
          </Suspense>
          <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            position={cameraPosition}
            fov={30}
          />
          <ambientLight intensity={0.1} />
        </Canvas>
      </div>
    </div>
  );
}

export default Logo;
