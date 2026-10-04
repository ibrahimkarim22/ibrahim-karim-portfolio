import { PORTFOLIO_VIEWS } from "./portfolioRouteState";
import { getProjectById } from "../projects/projectCatalog";
import { PROJECT_CAPTIONS } from "../projects/projectCaptions";
import ResumeContext from "../resume/ResumeContext";
import HomeBiography from "./HomeBiography";

export default function HomeContextPanel({ activeView, previewProjectId }) {
  const project = getProjectById(previewProjectId);
  const caption = project && PROJECT_CAPTIONS[project.id];

  return (
    <aside className="bio-div-main-container home-context-panel" aria-label="Portfolio context">
      {activeView === PORTFOLIO_VIEWS.HOME ? (
        <div className="bio-div-main home-context-panel__bio" key="biography">
          <HomeBiography />
        </div>
      ) : activeView === PORTFOLIO_VIEWS.PROJECTS ? (
        <div className="home-context-panel__caption" key={caption ? project.id : "selected-work"}>
          <p className="home-context-panel__label">{caption ? project.name : "SELECTED WORK"}</p>
          <h2 className="home-context-panel__heading">
            {caption ? caption.heading : "A selection of things I’ve made."}
          </h2>
          <p className="home-context-panel__description">
            {caption ? caption.description : "Web applications, mobile experiences, interactive projects, and experiments in design."}
          </p>
          <p className="home-context-panel__detail">
            {caption ? caption.technologies.join(" · ") : "Select a project to view its details."}
          </p>
        </div>
      ) : activeView === PORTFOLIO_VIEWS.RESUME ? (
        <ResumeContext key="resume" />
      ) : (
        <div className="home-context-panel__caption" key="interactive-profile">
          <h2 className="home-context-panel__heading">Interactive Profile</h2>
          <p className="home-context-panel__description">
            Left-drag to rotate, right-drag to pan, and use the mouse wheel to zoom.
          </p>
        </div>
      )}
    </aside>
  );
}
