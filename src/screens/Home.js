import React, { useEffect, useRef } from 'react';
import '../SCSS/App.scss';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { SpotLight, OrbitControls, useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import landscape from '../models/landscape2.glb';

function BackgroundColor({ color }) {
    const { scene } = useThree();

    useEffect(() => {
        scene.background = new THREE.Color(color);
    }, [scene, color]);

    return null;
}

function Landscape({ path }) {
    const group = useRef();
    const { scene, animations } = useGLTF(path);
    console.log('ANIMATIONS',animations);
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

function Home() {
    const cameraRef = useRef();
    const controlsRef = useRef();

    return (
        <Canvas className='canvas-container'>
            <BackgroundColor color="black" />
            <ambientLight intensity={0} />
            <PerspectiveCamera
                makeDefault
                ref={cameraRef}
                position={[33, 220, 120]} 
                fov={70}
                near={1}
                far={10000}
            />
            <Landscape path={landscape} />
            <OrbitControls
                ref={controlsRef}
                enableZoom={true}
                minDistance={10}
                maxDistance={180}
                zoomSpeed={4}
            />
        </Canvas>
    );
}

export default Home;
