import { PORTFOLIO_VIEWS } from "./portfolioRouteState";

export default function HomeNavigation({
  activeView,
  onToggleProjects,
  onToggleThreeDProfile,
}) {
  const projectsActive = activeView === PORTFOLIO_VIEWS.PROJECTS;

  return (
    <nav className="menu-items" aria-label="Portfolio navigation">
      <button
        type="button"
        className="home-navigation-button"
        aria-controls="project-selector"
        aria-expanded={projectsActive}
        aria-pressed={projectsActive}
        onClick={onToggleProjects}
      >
        <span className="projects-title-div-container">
          <span className="projects-title-div">Projects</span>
        </span>
      </button>
      <a
        href="/Ibrahim_Karim_Full_Stack_Resume.pdf"
        rel="noopener noreferrer"
        target="_blank"
        style={{ textDecoration: "none" }}
      >
        <div className="pdfResume-title-div-container">
          <div className="pdfResume-title-div">Resume</div>
        </div>
      </a>
      <button
        type="button"
        className="home-navigation-button"
        aria-pressed={activeView === PORTFOLIO_VIEWS.THREE_D_PROFILE}
        onClick={onToggleThreeDProfile}
      >
        <span className="threeResume-title-div-container">
          <span className="threeResume-title-div">3D Profile</span>
        </span>
      </button>
      <div className="megaracer-container">
        <a
          href="https://data.typeracer.com/pit/profile?user=ib_ra_heem_22"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <div className="megaracer">Megaracer</div>
        </a>
        <a
          href="https://data.typeracer.com/pit/profile?user=ib_ra_heem_22"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="typeracer">
            <iframe
              src="https://data.typeracer.com/pit/profile?user=ib_ra_heem_22"
              title="TypeRacer profile for ib_ra_heem_22"
              className="typeracer-profile"
              loading="lazy"
            />
          </div>
        </a>
      </div>
    </nav>
  );
}
