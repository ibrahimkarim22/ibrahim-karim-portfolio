import Logo from "../Logo";
import ProjectSelector from "../projects/ProjectSelector";
import { PROJECTS } from "../projects/projectCatalog";
import ThreeDProfileView from "../profile/ThreeDProfileView";
import ResumeView from "../resume/ResumeView";
import { PORTFOLIO_VIEWS } from "./portfolioRouteState";

const VIEW_LABELS = {
  [PORTFOLIO_VIEWS.HOME]: "Home",
  [PORTFOLIO_VIEWS.PROJECTS]: "Projects",
  [PORTFOLIO_VIEWS.RESUME]: "Resume",
  [PORTFOLIO_VIEWS.THREE_D_PROFILE]: "3D Profile",
};

export default function HomeCenterView({ activeView, onBackHome, onSelectProject, projectPreview, headingRef }) {
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
        <ProjectSelector
          projects={PROJECTS}
          onBackHome={onBackHome}
          onSelectProject={onSelectProject}
          previewProjectId={projectPreview.previewProjectId}
          onPreviewEnter={projectPreview.onPreviewEnter}
          onPreviewLeave={projectPreview.onPreviewLeave}
        />
      ) : activeView === PORTFOLIO_VIEWS.RESUME ? (
        <ResumeView onBackHome={onBackHome} />
      ) : activeView === PORTFOLIO_VIEWS.THREE_D_PROFILE ? (
        <div className="home-profile-view">
          <header className="home-profile-view__header">
            <button className="home-profile-view__back" type="button" onClick={onBackHome}>
              <span aria-hidden="true">←</span>
              <span>Back to Home</span>
            </button>
          </header>
          <div className="home-profile-view__scene">
            <ThreeDProfileView />
          </div>
        </div>
      ) : (
        <div className="logo-div-container">
          <Logo className="logo-div" />
        </div>
      )}
    </section>
  );
}
