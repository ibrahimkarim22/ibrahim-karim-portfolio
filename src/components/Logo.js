import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, PerspectiveCamera } from "@react-three/drei";
import logo from "../models/logo.glb";
import Progress from "./Progress";
import "../SCSS/App.scss";

function BackgroundColor({ color }) {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(color);
  }, [scene, color]);
  return null;
}

function LogoInit({ path, position, setProgress }) {
  const group = useRef();
  const { scene, animations } = useGLTF(path, true, (xhr) => {
    setProgress((xhr.loaded / xhr.total) * 100);
  });
  const mixer = useRef();

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
  const [progress, setProgress] = useState(0);
  const cameraRef = useRef();

  return (
    <div className="logo-canvas-container">
    <div className="logo-canvas">
      <Canvas>
        <BackgroundColor color="snow" />
        <LogoInit
          path={logo}
          position={[0.5, 0, 0]}
          setProgress={setProgress}
        />
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[0.45, 0.4, 2.2]}
          fov={36}
        />
        <ambientLight intensity={0.1} />
      </Canvas>
      {progress > 0 && progress < 100 ? <Progress progress={progress} /> : null}
    </div>
    </div>
  );
}

export default Logo;
