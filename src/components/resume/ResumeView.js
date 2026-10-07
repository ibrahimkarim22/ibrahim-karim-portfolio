import ResumeContext, { RESUME_PDF_PATH } from "./ResumeContext";

export default function ResumeView() {
  return (
    <section id="resume-view" className="resume-view" aria-label="Resume document">
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
