import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import mm from '../models/mm.glb';

function BackgroundColor({ color }) {
    const { scene } = useThree();
    useEffect(() => {
        scene.background = new THREE.Color(color);
    }, [scene, color]);
    return null;
}

function MmInit({ path, position }) {
    const group = useRef();
    const { scene, animations } = useGLTF(path);
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

function Mm() {
    const cameraRef = useRef();
    const controlsRef = useRef();

    return (
        <Canvas
            style={{
                // border: '1px solid black',
                width: '10vw',
                height: '18vh',
            }}
        >
            <BackgroundColor color='snow' />
            <MmInit path={mm} position={[0.5, 0, 0]} />
            <PerspectiveCamera 
                ref={cameraRef}
                makeDefault
                position={[.5, .01, 2.2]}
                fov={40}
            />
            <ambientLight intensity={2} />
            {/* <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        minDistance={10}
        maxDistance={1800}
        zoomSpeed={4}
      /> */}
            {/* <pointLight position={[10, 10, 10]} intensity={0.5} />
            <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                intensity={0.5}
                castShadow
                shadow-bias={-0.0001}
            /> */}
        </Canvas>
    );
}

export default Mm;
