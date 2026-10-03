import Logo from "../Logo";
import ProjectSelector from "../projects/ProjectSelector";
import { PROJECTS } from "../projects/projectCatalog";
import ThreeDProfileView from "../profile/ThreeDProfileView";
import { PORTFOLIO_VIEWS } from "./portfolioRouteState";

const VIEW_LABELS = {
  [PORTFOLIO_VIEWS.HOME]: "Home",
  [PORTFOLIO_VIEWS.PROJECTS]: "Projects",
  [PORTFOLIO_VIEWS.THREE_D_PROFILE]: "3D Profile",
};

export default function HomeCenterView({ activeView, onSelectProject, headingRef }) {
  return (
    <section
      id="home-center-view"
      className="home-center-view"
      aria-labelledby="home-center-heading"
      data-active-view={activeView}
    >
      <h1 id="home-center-heading" className="visually-hidden" tabIndex={-1} ref={headingRef}>
        {VIEW_LABELS[activeView]} view
      </h1>
      {activeView === PORTFOLIO_VIEWS.PROJECTS ? (
        <ProjectSelector projects={PROJECTS} onSelectProject={onSelectProject} />
      ) : activeView === PORTFOLIO_VIEWS.THREE_D_PROFILE ? (
        <ThreeDProfileView />
      ) : (
        <div className="logo-div-container">
          <Logo className="logo-div" />
        </div>
      )}
    </section>
  );
}
