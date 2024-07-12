import { useState, useEffect } from 'react';
import BlenderEnvironment from '../components/3dEnvironment';

import { animated, useSpring } from '@react-spring/web';

import Progress from '../components/Progress';

import { Parallax, ParallaxLayer } from '@react-spring/parallax';
function Home() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev < 100) {
                    return prev + 1;
                } else {
                    clearInterval(interval);
                    return 100;
                }
            });
        }, 50);
    }, []);

    // const [props, api] = useSpring(() => ({
    //     from: { y: 0 },
    // }))
    // const handleClick = () => {
    //     api.start({
    //         from: {
    //             y: 0,
    //         },
    //         to: {
    //             y: 1700,
    //         },
    //     })
    // }
    return (
        <>
            {progress < 100 ? (
                <Progress progress={progress} />
            ) : (

                <>
                        <div className="blender-environment" style={{ display: 'inline-block' }}>
                            <BlenderEnvironment setProgress={setProgress} />
                        </div>
                        <div style={{
                            width: 100,
                            height: 100,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 8,
                            display: 'inline-block'
                            // ...props
                        }}>
                            
                        </div>
                    {/* <animated.div
                        onClick={handleClick}
                        style={{
                            width: 100,
                            height: 100,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 8,
                            position: 'relative',
                            ...props
                        }}
                    /> */}
                    {/* <Parallax pages={2}>
                        <ParallaxLayer offset={1} speed={0.5} style={{ justifyContent: 'flex-end' }}>
                            <div className='topAd'
                                style={{ width: 100, height: 100, backgroundColor: 'rgba(255, 25, 25, 1)', borderRadius: 1, position: 'relative', top: 100, left: 100 }}
                            >
                            </div>
                        </ParallaxLayer>
                    </Parallax> */}

                    {/* <Parallax pages={2} style={{ top: 250, left: '0' , overflow: 'hidden' }}>
                        <ParallaxLayer offset={4} speed={2.5} >
                        </ParallaxLayer>
                    </Parallax> */}
                </>
            )}
        </>
    );
}

export default Home;
