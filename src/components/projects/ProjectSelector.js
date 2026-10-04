export default function ProjectSelector({
  projects, onBackHome, onSelectProject, previewProjectId,
  onPreviewEnter, onPreviewLeave,
}) {
  return (
    <section
      id="project-selector"
      className="project-selector"
      aria-labelledby="project-selector-heading"
    >
      <header className="project-selector__header">
        <h2 id="project-selector-heading" className="project-selector__heading">
          Projects
        </h2>
        <button className="project-selector__back" type="button" onClick={onBackHome}>
          <span aria-hidden="true">←</span>
          <span>Back to Home</span>
        </button>
      </header>
      <ul className="project-selector__list">
        {projects.map((project) => (
          <li className="project-selector__item" key={project.id}>
            <button
              className="project-selector__button"
              type="button"
              data-project-id={project.id}
              data-previewed={previewProjectId === project.id ? "true" : undefined}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") onPreviewEnter?.(project.id, "hovered");
              }}
              onPointerLeave={() => onPreviewLeave?.(project.id, "hovered")}
              onFocus={() => onPreviewEnter?.(project.id, "focused")}
              onBlur={() => onPreviewLeave?.(project.id, "focused")}
              onClick={(event) => onSelectProject(project.id, event.currentTarget)}
            >
              <span className="project-selector__name">{project.name}</span>
              <span className="project-selector__description">{project.description}</span>
              <span className="project-selector__technologies">
                {project.technologies.map((technology) => (
                  <span className="project-selector__technology" key={technology}>
                    {technology}
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
