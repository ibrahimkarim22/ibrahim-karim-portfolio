import ResumeContext from "./ResumeContext";
import { getResumeSource } from "./resumeSource";

export default function ResumeView() {
  const source = getResumeSource();
  return (
    <section id="resume-view" className="resume-view" aria-label="Resume document">
      {/* Exactly one context presentation is visible at each shell breakpoint. */}
      <ResumeContext className="resume-view__context" />
      <div className="resume-view__document">
        {source ? (
          <>
            {/* Cross-origin iframe events cannot distinguish a PDF from a Drive error page.
                Keep the independent Open Resume action available in both contexts. */}
            <p id="resume-preview-help" className="visually-hidden">
              If the preview is unavailable, use Open Resume to view the document in Google Drive.
            </p>
            <iframe
              className="resume-view__pdf"
              title="Ibrahim Karim resume PDF"
              src={source.previewUrl}
              aria-describedby="resume-preview-help"
            />
          </>
        ) : <p role="status">The resume is temporarily unavailable. Please try again later.</p>}
      </div>
    </section>
  );
}
