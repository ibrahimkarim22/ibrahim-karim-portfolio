export const RESUME_PDF_PATH = "/Ibrahim_Karim_Full_Stack_Resume.pdf";

export default function ResumeContext({ className = "" }) {
  return (
    <div className={`home-context-panel__caption resume-context ${className}`}>
      <p className="home-context-panel__label">RESUME</p>
      <h2 className="home-context-panel__heading">Experience &amp; practice.</h2>
      <p className="home-context-panel__description">
        Web development, software projects, technical tools, and a background in visual design.
      </p>
      <a className="resume-download" href={RESUME_PDF_PATH} download>
        Download Resume
      </a>
    </div>
  );
}
