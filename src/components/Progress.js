import { useState, useEffect } from 'react';
import karim from '../images/karim.jpeg';


const Progress = ({ progress }) => {
    return (
        <div className='progress-container'>
            <img
                src={karim}
                className='progress-image'
                style={{ filter: `brightness(${progress}%)` }}
                alt='Ibrahim Image'
            />
        </div>
    );
}

export default Progress;