import '../SCSS/App.scss';
import BlenderEnvironment from './3dEnvironment';

import { animated, useSpring } from '@react-spring/web';

import { Parallax, ParallaxLayer } from '@react-spring/parallax';
function Home() {

    const [props, api] = useSpring(() => ({
        from: { x: 0 }, 
    }))
    const handleClick = () => {
        api.start({
            from: { 
                x: 0, 
            },
            to: { 
                x: 800,
             },
        })
    }
    return (
        <>
            <animated.div
            onClick={handleClick}
                style={{
                    width: 50,
                    height: 50,
                    backgroundColor: 'red',
                    borderRadius: 8,
                    ...props
                }}
            />
            <Parallax pages={2} style={{ top: 0, left: '0' }}>
                <ParallaxLayer offset={0} speed={2.5}>
            <div className="blender-environment">
                <BlenderEnvironment />
            </div>
            </ParallaxLayer>
            </Parallax>
        </>
    );
}

export default Home;
