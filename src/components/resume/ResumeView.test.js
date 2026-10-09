import { fireEvent, render, screen, within } from "@testing-library/react";
import ResumeContext from "./ResumeContext";
import ResumeView from "./ResumeView";
import * as resumeSource from "./resumeSource";

const previewUrl = "https://drive.google.com/file/d/1ur7krnoyejgUwa6azvwzmWAas6kzIiVT/preview";
const openUrl = "https://drive.google.com/file/d/1ur7krnoyejgUwa6azvwzmWAas6kzIiVT/view";
const downloadUrl = "https://drive.google.com/uc?export=download&id=1ur7krnoyejgUwa6azvwzmWAas6kzIiVT";

afterEach(() => jest.restoreAllMocks());

test.each(["desktop", "mobile"])("%s resume actions navigate to the same Drive file as the preview", (layout) => {
  render(<>
    <aside aria-label="Desktop resume context"><ResumeContext /></aside>
    <ResumeView />
  </>);

  const context = layout === "desktop"
    ? screen.getByRole("complementary", { name: "Desktop resume context" })
    : screen.getByRole("region", { name: "Resume document" });

  expect(screen.getByTitle("Ibrahim Karim resume PDF")).toHaveAttribute("src", previewUrl);
  const open = within(context).getByRole("link", { name: "Open Resume" });
  const download = within(context).getByRole("link", { name: "Download Resume" });
  expect(open).toHaveAttribute("href", openUrl);
  expect(download).toHaveAttribute("href", downloadUrl);
  [open, download].forEach((link) => {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).not.toHaveAttribute("download");
  });
});

test("active resume access never falls back to a bundled PDF", () => {
  const { container } = render(<ResumeView />);
  container.querySelectorAll("iframe[src], a[href]").forEach((element) => {
    const url = new URL(element.getAttribute("src") || element.getAttribute("href"), "https://portfolio.example");
    expect(url.origin).toBe("https://drive.google.com");
    expect(url.pathname).not.toMatch(/\.pdf$/i);
  });
});

test("reopening the resume on a later date keeps stable file links", () => {
  jest.useFakeTimers();
  try {
    jest.setSystemTime(new Date("2026-10-09T17:00:00Z"));
    const first = render(<ResumeView />);
    first.unmount();
    jest.setSystemTime(new Date("2027-04-01T17:00:00Z"));
    render(<ResumeView />);
    expect(screen.getByTitle("Ibrahim Karim resume PDF")).toHaveAttribute("src", previewUrl);
    expect(screen.getByRole("link", { name: "Open Resume" })).toHaveAttribute("href", openUrl);
    expect(screen.getByRole("link", { name: "Download Resume" })).toHaveAttribute("href", downloadUrl);
  } finally {
    jest.useRealTimers();
  }
});

test("opaque iframe load and error events leave independent Drive actions available", () => {
  render(<ResumeView />);
  const viewer = screen.getByTitle("Ibrahim Karim resume PDF");
  // These events cannot reveal whether Drive rendered a PDF or an access-denied page.
  fireEvent.load(viewer);
  fireEvent.error(viewer);
  expect(viewer).toHaveAccessibleDescription(/If the preview is unavailable, use Open Resume/);
  expect(screen.getByRole("link", { name: "Open Resume" })).toHaveAttribute("href", openUrl);
  expect(screen.getByRole("link", { name: "Download Resume" })).toHaveAttribute("href", downloadUrl);
  expect(screen.queryByText(/resume loaded|resume ready/i)).not.toBeInTheDocument();
});

test.each(["", " ", null, "../../local.pdf", "file?revision=old"])("missing or malformed file ID %p does not produce a resume destination", (fileId) => {
  expect(resumeSource.getResumeSource(fileId)).toBeNull();
});

test("missing resume configuration renders an unavailable message without broken links or a local fallback", () => {
  jest.spyOn(resumeSource, "getResumeSource").mockReturnValue(null);
  render(<ResumeView />);
  expect(screen.getByRole("status")).toHaveTextContent("The resume is temporarily unavailable. Please try again later.");
  expect(screen.queryByTitle("Ibrahim Karim resume PDF")).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Open Resume" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Download Resume" })).not.toBeInTheDocument();
});
