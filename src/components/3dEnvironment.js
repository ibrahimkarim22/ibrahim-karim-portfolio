import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import Progress from "./Progress";
import landscape from "../models/landscape2.glb";

function BackgroundColor({ color }) {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color(color);
  }, [scene, color]);

  return null;
}

function Landscape({ path, setProgress }) {
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

  return <primitive ref={group} object={scene} />;
}

function BlenderEnvironment() {
  const [progress, setProgress] = useState(0);
  const cameraRef = useRef();
  const controlsRef = useRef();

  return (
    <div>
      <Canvas
        className="resume-canvas"
        style={{
          borderColor: "white",
          borderStyle: "ridge",
          borderWidth: "3px",
          width: "100%",
          height: "100vh",
        }}
      >
        <BackgroundColor color="black" />
        <ambientLight intensity={0} />
        <PerspectiveCamera
          makeDefault
          ref={cameraRef}
          position={[100, 0, 0]}
          fov={80}
          near={1}
          far={20000}
        />
        <Landscape path={landscape} setProgress={setProgress} />
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          minDistance={10}
          maxDistance={180}
          zoomSpeed={4}
        />
      </Canvas>
      {progress > 0 && progress < 100 ? <Progress progress={progress} /> : null}
    </div>
  );
}

export default BlenderEnvironment;
