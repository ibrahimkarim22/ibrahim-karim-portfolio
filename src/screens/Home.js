import { useRef } from 'react';
import '../SCSS/App.scss';
import { Canvas, useFrame } from '@react-three/fiber';

function Cube({ size = [2, 2, 2], speed = 0.01, color = 'steelblue', position = [0, 0, 0] }) {
    const meshRef = useRef(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += speed;
            meshRef.current.rotation.y += speed;
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

const Home = () => {
    return (
        <Canvas style={{ width: '100%', height: '100vh' }}>
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} />
            <Cube size={[3, 3, 3]} speed={0.003} color="steelblue" position={[0, 0, 0]} />
            <Cube size={[2, 2, 2]} speed={0.002} color="red" position={[5, 0, 0]} />
            <Cube size={[1, 1, 1]} speed={0.001} color="green" position={[-5, 0, 0]} />
        </Canvas>
    );
};

export default Home;
