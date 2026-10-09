import { getResumeSource } from "./resumeSource";

export default function ResumeContext({ className = "" }) {
  const source = getResumeSource();
  return (
    <div className={`home-context-panel__caption resume-context ${className}`}>
      <p className="home-context-panel__label">RESUME</p>
      <h2 className="home-context-panel__heading">Experience &amp; practice.</h2>
      <p className="home-context-panel__description">
        Web development, software projects, technical tools, and a background in visual design.
      </p>
      {source && (
        <div className="resume-context__actions">
          <a className="resume-download" href={source.downloadUrl} target="_blank" rel="noopener noreferrer">
            Download Resume
          </a>
          <a className="resume-view__open" href={source.openUrl} target="_blank" rel="noopener noreferrer">
            Open Resume
          </a>
        </div>
      )}
    </div>
  );
}
