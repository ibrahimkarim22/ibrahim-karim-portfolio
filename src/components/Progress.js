import karim from "../images/karim.jpeg";

const Progress = ({ progress, contained = false }) => {
  return (
    <div className={`progress-container${contained ? " progress-container--contained" : ""}`}>
      {/* <img
        src={karim}
        className="progress-image"
        style={{ filter: `brightness(${progress}%)` }}
        alt="Loading Image"
      /> */}
      <div className="progress-info">
      <div className="progress-text">Loading...</div>
      <div className="progress-percentage">{progress}%</div>
    </div>
    </div>
  );
};

export default Progress;
