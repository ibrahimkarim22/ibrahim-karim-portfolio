import { Link } from "react-router-dom";

const Projects = () => {
  return (
    <div className="projects-div-main">
      <Link to="/" style={{ textDecoration: "none" }}>
        <div className="mmBtn">Main Menu</div>
      </Link>
    </div>
  );
};

export default Projects;
