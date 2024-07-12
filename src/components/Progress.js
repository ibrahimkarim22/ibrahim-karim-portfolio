import { useState, useEffect } from 'react';


const Progress = ({ progress }) => {
    return (
        <div className='progress-container'>
            <img
                src='../../public/logo192.png'
                className='progress-image'
                style={{ filter: `brightness(${progress}%)` }}
                alt='Ibrahim Image'
            />
        </div>
    );
}

export default Progress;