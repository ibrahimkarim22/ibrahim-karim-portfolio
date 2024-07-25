import { Link } from "react-router-dom";
import Mm from "../components/Mm";

const Projects = () => {
  return (
    <div className="projects-div-main">
        <div className="whacka-div-main">
          <div className="whacka-text">Whack a Mole</div>
          <div className="whacka-description-text">Online Game</div>
        </div>
        <div className="krispy-div-main">
          <div className="krispy-text">KRISPY</div>
          <div className="krispy-description-text">Streaming Service</div>
        </div>
        <div className="hey-you-div-main">
          <div className="hey-you-text">HeyYou</div>
          <div className="hey-you-description-text">Location Tracking App</div>
        </div> 
        <div className="bard-div-main">
          <div className="bard-text">BARD</div>
          <div className="bard-description-text">Online Course App</div>
        </div>
        <div className="this-portfolio-div-main">
          <div className="this-portfolio-text">This Portfolio</div>
          <div className="this-portfolio-description-text">This Portfolio</div>
        </div>
      {/* <div className="mmBtn">
        <Link to="/">
          <Mm />
        </Link>
      </div> */}
    </div>
  );
};

export default Projects;
