import karim from '../images/karim.jpeg';

const Progress = ({ progress }) => {
    return (
        <div className='progress-container'>
            <img
                src={karim}
                className='progress-image'
                style={{ filter: `brightness(${progress}%)` }}
                alt='Loading Image'
            />
            <div className='progress-text'>
                Loading... {progress}%
            </div>
        </div>
    );
}

export default Progress;
