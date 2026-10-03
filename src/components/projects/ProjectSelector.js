export default function ProjectSelector({ projects, onSelectProject }) {
  return (
    <section
      id="project-selector"
      className="project-selector"
      aria-labelledby="project-selector-heading"
    >
      <h2 id="project-selector-heading" className="project-selector__heading">
        Projects
      </h2>
      <ul className="project-selector__list">
        {projects.map((project) => (
          <li className="project-selector__item" key={project.id}>
            <button
              className="project-selector__button"
              type="button"
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
