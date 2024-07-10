import '../SCSS/App.scss';
import BlenderEnvironment from './3dEnvironment';

import { animated, useSpring } from '@react-spring/web';
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
             delay: 100
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
            <div className="blender-environment">
                <BlenderEnvironment />
            </div>

        </>
    );
}

export default Home;
