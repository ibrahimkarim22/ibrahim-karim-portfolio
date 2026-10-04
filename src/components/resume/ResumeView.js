import ResumeContext, { RESUME_PDF_PATH } from "./ResumeContext";

export default function ResumeView({ onBackHome }) {
  return (
    <section id="resume-view" className="resume-view" aria-label="Resume document">
      <header className="resume-view__header">
        <button className="resume-view__back" type="button" onClick={onBackHome}>
          <span aria-hidden="true">←</span>
          <span>Back to Home</span>
        </button>
        <a className="resume-view__open" href={RESUME_PDF_PATH} target="_blank" rel="noopener noreferrer">
          Open Resume
        </a>
      </header>
      {/* Exactly one context presentation is visible at each shell breakpoint. */}
      <ResumeContext className="resume-view__context" />
      <div className="resume-view__document">
        <iframe
          className="resume-view__pdf"
          title="Ibrahim Karim resume PDF"
          src={`${RESUME_PDF_PATH}#toolbar=0&navpanes=0&view=FitH`}
        />
      </div>
    </section>
  );
}
