import Logo from "../Logo";
import ProjectSelector from "../projects/ProjectSelector";
import { PROJECTS } from "../projects/projectCatalog";
import ThreeDProfileView from "../profile/ThreeDProfileView";
import ResumeView from "../resume/ResumeView";
import MegaracerView from "../megaracer/MegaracerView";
import { PORTFOLIO_VIEWS } from "./portfolioRouteState";

const VIEW_LABELS = {
  [PORTFOLIO_VIEWS.HOME]: "Home",
  [PORTFOLIO_VIEWS.PROJECTS]: "Projects",
  [PORTFOLIO_VIEWS.RESUME]: "Resume",
  [PORTFOLIO_VIEWS.THREE_D_PROFILE]: "3D Profile",
  [PORTFOLIO_VIEWS.MEGARACER]: "Megaracer",
};

export default function HomeCenterView({ activeView, onSelectProject, projectPreview, headingRef }) {
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
          onSelectProject={onSelectProject}
          previewProjectId={projectPreview.previewProjectId}
          onPreviewEnter={projectPreview.onPreviewEnter}
          onPreviewLeave={projectPreview.onPreviewLeave}
        />
      ) : activeView === PORTFOLIO_VIEWS.RESUME ? (
        <ResumeView />
      ) : activeView === PORTFOLIO_VIEWS.MEGARACER ? (
        <MegaracerView />
      ) : activeView === PORTFOLIO_VIEWS.THREE_D_PROFILE ? (
        <div className="home-profile-view">
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
