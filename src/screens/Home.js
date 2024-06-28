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
    const { scene } = useGLTF(path);
    return <primitive object={scene} />;
}

function Home() {
    const cameraRef = useRef();
    const controlsRef = useRef();

    return (
        <Canvas style={{ width: '70%', height: '70vh' }}>
            <BackgroundColor color="black" />
            <ambientLight intensity={1} />
            <SpotLight position={[10, 15, 10]} intensity={4} angle={1} scale={10} />
            <pointLight position={[-10, -10, -10]} intensity={1} />
            <PerspectiveCamera
                makeDefault
                ref={cameraRef}
                position={[22, 222, 222]}
                fov={70}
                near={5}
                far={10000}
            />
            <Landscape path={landscape} />
            <OrbitControls
                ref={controlsRef}
                enableZoom={true}
                minDistance={10}
                maxDistance={500}
                zoomSpeed={4}
            />
        </Canvas>
    );
}

export default Home;
