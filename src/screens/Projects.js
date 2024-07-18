import { Link } from "react-router-dom";
import Mm from "../components/Mm";

const Projects = () => {
  return (
    <div className="projects-div-main">
      {/* <Link to="/" style={{ textDecoration: "none" }}> */}
        <div className="mmBtn">
          <Mm />
        </div>
      {/* </Link> */}
    </div>
  );
};

export default Projects;
