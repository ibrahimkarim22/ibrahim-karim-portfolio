import ProjectArtwork, { BardAudience } from "./ProjectArtwork";
import { preloadProjectImages } from "./projectImageLoading";

export default function ProjectSelector({
  projects, onSelectProject, previewProjectId,
  onPreviewEnter, onPreviewLeave,
}) {
  return (
    <section
      id="project-selector"
      className="project-selector"
      aria-label="Projects"
    >
      <ul className="project-selector__list">
        {projects.map((project, index) => (
          <li className="project-selector__item" key={project.id}>
            <button
              className="project-selector__button"
              type="button"
              data-project-id={project.id}
              aria-labelledby={`project-${project.id}-name project-${project.id}-description`}
              aria-describedby={`project-${project.id}-stack`}
              data-previewed={previewProjectId === project.id ? "true" : undefined}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") {
                  preloadProjectImages(project.id);
                  onPreviewEnter?.(project.id, "hovered");
                }
              }}
              onPointerLeave={() => onPreviewLeave?.(project.id, "hovered")}
              onFocus={() => {
                preloadProjectImages(project.id);
                onPreviewEnter?.(project.id, "focused");
              }}
              onBlur={() => onPreviewLeave?.(project.id, "focused")}
              onPointerDown={() => preloadProjectImages(project.id)}
              onClick={(event) => {
                preloadProjectImages(project.id);
                onSelectProject(project.id, event.currentTarget);
              }}
            >
              <span className="project-selector__edition" aria-hidden="true">
                <span className="project-selector__number">{String(index + 1).padStart(2, "0")}</span>
              </span>
              <span className="project-selector__copy">
                <span id={`project-${project.id}-name`} className="project-selector__name">{project.name}</span>
                <span id={`project-${project.id}-description`} className="project-selector__description">{project.description}</span>
                <ProjectArtwork projectId={project.id} />
              </span>
              <span className="project-selector__build" aria-hidden="true">
                {project.id === "bard" && <BardAudience />}
                <span className="project-selector__build-label">Built with</span>
                <span className="project-selector__technologies" aria-hidden="true">
                  {project.technologies.slice(0, 3).map((technology) => technology.replace(/ /g, "\u00a0")).join(" / ")}
                  {project.technologies.length > 3 && <span className="project-selector__more"> +{project.technologies.length - 3}</span>}
                </span>
              </span>
              <span id={`project-${project.id}-stack`} className="visually-hidden">
                Technologies: {project.technologies.join(", ")}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
