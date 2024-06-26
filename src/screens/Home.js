// import { useRef, useState } from 'react';
import '../SCSS/App.scss';
import { Canvas, useFrame } from '@react-three/fiber';
import { SpotLight, OrbitControls, useGLTF } from '@react-three/drei';
import landscape from '../models/landscape.glb';

function Landscape({ path }) {
    const { scene } = useGLTF(path);
    return <primitive object={scene} />;
}

function Home() {
    return (
        <Canvas style={{ width: '100%', height: '100vh' }} camera={{ position: [0, 0, 10], fov: 50 }}>
            <ambientLight intensity={1} />
            <SpotLight position={[10, 15, 10]} intensity={2} angle={0.4} />
            <pointLight position={[-10, -10, -10]} intensity={1} />
            <Landscape path={landscape} />
            <OrbitControls />
        </Canvas>
    );
}

export default Home;
