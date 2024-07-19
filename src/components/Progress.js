import { useState, useEffect } from 'react';
import moss from '../images/moss.jpg';


const Progress = ({ progress }) => {
    return (
        <div className='progress-container'>
            <img
                src={moss}
                className='progress-image'
                style={{ filter: `brightness(${progress}%)` }}
                alt='Ibrahim Image'
            />
        </div>
    );
}

export default Progress;