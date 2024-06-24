import '../SCSS/App.scss';
import { PerspectiveCamera } from '@react-three/drei';
import  { Canvas } from '@react-three/fiber';


const Home = () => {
    return (
    <Canvas>
      <PerspectiveCamera fov={75} position={[0, 0, 5]} />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
    </Canvas>
    )
}

export default Home;