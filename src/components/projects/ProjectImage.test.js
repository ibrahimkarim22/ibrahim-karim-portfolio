import { fireEvent, render, screen } from "@testing-library/react";
import ProjectImage from "./ProjectImage";

function loaded(image) {
  Object.defineProperty(image, "naturalWidth", { value: 640, configurable: true });
  fireEvent.load(image);
}
afterEach(() => jest.restoreAllMocks());

it("retains lazy loading and unclipped geometry until an offscreen image loads", () => {
  const detached = jest.spyOn(window, "Image");
  render(<div style={{ overflow: "auto", height: 400 }}>
    <div style={{ height: 2000 }} />
    <ProjectImage src="screenshot.png" width={640} height={360} alt="Screenshot" />
  </div>);
  const image = screen.getByRole("img");
  expect(detached).not.toHaveBeenCalled();
  expect(image).toHaveAttribute("loading", "lazy");
  expect(image).toHaveAttribute("data-image-state", "loading");
  expect(image.style.aspectRatio).toBe("640 / 360");
  expect(image.style.clipPath).toBe("");
  expect(image.style.visibility).toBe("");
  loaded(image);
  expect(image).toHaveAttribute("data-image-state", "ready");
});

it.each([
  ["slow", () => new Promise(() => {})],
  ["rejected", () => Promise.reject(new Error("Unsupported"))],
  ["resolved", () => Promise.resolve()],
])("reveals a successful native load without waiting for a %s decode", (name, decode) => {
  render(<ProjectImage src="screenshot.png" width={640} height={360} alt="Screenshot" />);
  const image = screen.getByRole("img");
  image.decode = jest.fn(decode);
  loaded(image);
  expect(image).toHaveAttribute("data-image-state", "ready");
  expect(image.style.clipPath).toBe("");
  // Native async decoding owns painting; no extra full-size decode is needed.
  expect(image.decode).not.toHaveBeenCalled();
  expect(image).toHaveAttribute("decoding", "async");
});

it("loads multiple images independently even when a peer never loads", () => {
  render(<>
    <ProjectImage src="one.png" width={640} height={360} alt="One" />
    <ProjectImage src="two.png" width={640} height={360} alt="Two" />
    <ProjectImage src="three.png" width={640} height={360} alt="Three" />
  </>);
  loaded(screen.getByRole("img", { name: "Two" }));
  expect(screen.getByRole("img", { name: "Two" })).toHaveAttribute("data-image-state", "ready");
  expect(screen.getByRole("img", { name: "One" })).toHaveAttribute("data-image-state", "loading");
  loaded(screen.getByRole("img", { name: "One" }));
  expect(screen.getByRole("img", { name: "One" })).toHaveAttribute("data-image-state", "ready");
  expect(screen.getByRole("img", { name: "Three" })).toHaveAttribute("data-image-state", "loading");
});

it("conceals a failed image while preserving its dimensions and reporting its path", () => {
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  render(<ProjectImage src="missing.png" width={640} height={360} alt="Screenshot" />);
  const image = screen.getByRole("img");
  fireEvent.error(image);
  expect(image).toHaveAttribute("data-image-state", "error");
  expect(image).toHaveStyle({ visibility: "hidden" });
  expect(image.style.aspectRatio).toBe("640 / 360");
  expect(image).toHaveAttribute("width", "640");
  expect(error.mock.calls[0][0]).toContain("missing.png");
});

it("treats a completed image with no intrinsic width as a failure", () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
  render(<ProjectImage src="broken-cache.png" width={640} height={360} alt="Screenshot" />);
  expect(screen.getByRole("img", { hidden: true })).toHaveAttribute("data-image-state", "error");
});

it("handles cached images whose load events preceded mounting", () => {
  jest.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
  jest.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(640);
  render(<ProjectImage src="cached.png" width={640} height={360} alt="Screenshot" critical />);
  const image = screen.getByRole("img");
  expect(image).toHaveAttribute("data-image-state", "ready");
  expect(image).toHaveAttribute("loading", "eager");
  expect(image).toHaveAttribute("fetchpriority", "high");
});

it("does not let an old load reveal a replacement source or update after unmount", () => {
  const { rerender, unmount } = render(<ProjectImage src="old.png" width={640} height={360} alt="Screenshot" />);
  const oldImage = screen.getByRole("img");
  rerender(<ProjectImage src="new.png" width={640} height={360} alt="Screenshot" />);
  loaded(oldImage);
  const newImage = screen.getByRole("img");
  expect(newImage).toHaveAttribute("src", "new.png");
  expect(newImage).toHaveAttribute("data-image-state", "loading");
  loaded(newImage);
  expect(newImage).toHaveAttribute("data-image-state", "ready");
  unmount();
  fireEvent.error(newImage);
});

it("handles successive picture sources without an older decode changing state", () => {
  render(<ProjectImage src="fallback.png" width={640} height={360} alt="Screenshot" />);
  const image = screen.getByRole("img");
  Object.defineProperty(image, "currentSrc", { configurable: true, value: "wide.png" });
  image.decode = () => new Promise(() => {});
  loaded(image);
  expect(image).toHaveAttribute("data-image-state", "ready");
  Object.defineProperty(image, "currentSrc", { configurable: true, value: "narrow.png" });
  loaded(image);
  expect(image).toHaveAttribute("data-image-state", "ready");
});

it("handles an error after loading and recovers on a later successful load", () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  render(<ProjectImage src="interrupted.png" width={640} height={360} alt="Screenshot" />);
  const image = screen.getByRole("img");
  image.decode = () => new Promise(() => {});
  loaded(image);
  fireEvent.error(image);
  expect(image).toHaveAttribute("data-image-state", "error");
  expect(image).toHaveStyle({ visibility: "hidden" });
  loaded(image);
  expect(image).toHaveAttribute("data-image-state", "ready");
  expect(image.style.visibility).toBe("");
});
