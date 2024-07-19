import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import logo from '../models/logo.glb';
import '../SCSS/App.scss';


function BackgroundColor({ color }) {
    const { scene } = useThree();
    useEffect(() => {
        scene.background = new THREE.Color(color);
    }, [scene, color]);
    return null;
}

function LogoInit({ path, position }) {
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

function Logo({ setProgress }) {
    const cameraRef = useRef();
    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(
            logo,
            (gltf) => {
                console.log('MODEL LOADED');
            },
            (xhr) => {
                setProgress((xhr.loaded / xhr.total) * 100);
            },
            (error) => {
                console.log(error);
            }
        );
    }, [setProgress]);

    return (
        <Canvas className='logo-canvas'
            style={{
                borderRadius: '22px',
            // // border: '1px solid black',
                width: '80%',
                height: '70vh',
            }}
        >
            <BackgroundColor color='snow' />
            <LogoInit path={logo} position={[0.5, 0, 0]}/>
            <PerspectiveCamera 
                ref={cameraRef}
                makeDefault
                position={[0.4, .4, 2.2]}
                fov={33}
            
            />
            <ambientLight intensity={0.1} />
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

export default Logo;
