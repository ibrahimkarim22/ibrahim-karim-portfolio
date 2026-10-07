import { act, fireEvent, render, screen } from "@testing-library/react";
import ProjectImage, { ProjectImageGroup } from "./ProjectImage";

function fixture(image, decode) {
  Object.defineProperty(image, "naturalWidth", { value: 640, configurable: true });
  image.decode = decode;
}

it("retains native lazy loading without starting a detached request and reveals only after decode", async () => {
  const detached = jest.spyOn(window, "Image");
  render(<ProjectImage src="screenshot.png" width={640} height={360} alt="Screenshot" />);
  const image = screen.getByRole("img");
  expect(detached).not.toHaveBeenCalled();
  detached.mockRestore();
  expect(image).toHaveAttribute("loading", "lazy");
  expect(image.style.aspectRatio).toBe("640 / 360");
  expect(image).toHaveStyle({ clipPath: "inset(50%)" });
  let resolve;
  fixture(image, () => new Promise((done) => { resolve = done; }));
  fireEvent.load(image);
  expect(image).toHaveAttribute("data-image-state", "loading");
  await act(async () => { resolve(); });
  expect(image).toHaveAttribute("data-image-state", "ready");
  expect(image.style.visibility).toBe("");
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
  error.mockRestore();
});

it("releases a decoded peer when another image in the group fails", async () => {
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  render(<ProjectImageGroup sources={["one.png", "two.png"]}>
    <ProjectImage src="one.png" width={640} height={360} alt="One" />
    <ProjectImage src="two.png" width={640} height={360} alt="Two" />
  </ProjectImageGroup>);
  const one = screen.getByRole("img", { name: "One" });
  fixture(one, () => Promise.resolve());
  await act(async () => { fireEvent.load(one); });
  expect(one).toHaveAttribute("data-image-state", "loading");
  fireEvent.error(screen.getByRole("img", { name: "Two" }));
  expect(one).toHaveAttribute("data-image-state", "ready");
  error.mockRestore();
});

it("falls back to a complete image after rejected decode", async () => {
  const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
  render(<ProjectImage src="fallback.png" width={640} height={360} alt="Screenshot" />);
  fixture(screen.getByRole("img"), () => Promise.reject(new Error("Unsupported")));
  await act(async () => { fireEvent.load(screen.getByRole("img")); });
  expect(screen.getByRole("img")).toHaveAttribute("data-image-state", "ready");
  expect(warning).toHaveBeenCalled();
  warning.mockRestore();
});

it("does not let an old decode reveal a replacement source or update after unmount", async () => {
  const { rerender, unmount } = render(<ProjectImage src="old.png" width={640} height={360} alt="Screenshot" />);
  let finishOld;
  fixture(screen.getByRole("img"), () => new Promise((done) => { finishOld = done; }));
  fireEvent.load(screen.getByRole("img"));
  rerender(<ProjectImage src="new.png" width={640} height={360} alt="Screenshot" />);
  await act(async () => { finishOld(); });
  expect(screen.getByRole("img")).toHaveAttribute("data-image-state", "loading");
  let finishNew;
  fixture(screen.getByRole("img"), () => new Promise((done) => { finishNew = done; }));
  fireEvent.load(screen.getByRole("img"));
  unmount();
  await act(async () => { finishNew(); });
});

it("handles an already cached native image even if its load event preceded mounting", async () => {
  const complete = jest.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
  const width = jest.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(640);
  const originalDecode = HTMLImageElement.prototype.decode;
  HTMLImageElement.prototype.decode = () => Promise.resolve();
  try {
    await act(async () => { render(<ProjectImage src="cached.png" width={640} height={360} alt="Screenshot" critical />); });
    expect(screen.getByRole("img")).toHaveAttribute("data-image-state", "ready");
    expect(screen.getByRole("img")).toHaveAttribute("loading", "eager");
    expect(screen.getByRole("img")).toHaveAttribute("fetchpriority", "high");
  } finally {
    complete.mockRestore(); width.mockRestore();
    HTMLImageElement.prototype.decode = originalDecode;
  }
});

it("decodes a newly selected picture source and ignores the older source's pending decode", async () => {
  render(<ProjectImage src="fallback.png" width={640} height={360} alt="Screenshot" />);
  const image = screen.getByRole("img");
  let finishOld, finishNew;
  Object.defineProperty(image, "currentSrc", { configurable: true, value: "wide.png" });
  fixture(image, () => new Promise((done) => { finishOld = done; }));
  fireEvent.load(image);
  Object.defineProperty(image, "currentSrc", { configurable: true, value: "narrow.png" });
  image.decode = () => new Promise((done) => { finishNew = done; });
  fireEvent.load(image);
  await act(async () => { finishOld(); });
  expect(image).toHaveAttribute("data-image-state", "loading");
  await act(async () => { finishNew(); });
  expect(image).toHaveAttribute("data-image-state", "ready");
});

it("keeps a load error concealed even when its pending decode subsequently resolves", async () => {
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  render(<ProjectImage src="interrupted.png" width={640} height={360} alt="Screenshot" />);
  const image = screen.getByRole("img");
  let finish;
  fixture(image, () => new Promise((done) => { finish = done; }));
  fireEvent.load(image);
  fireEvent.error(image);
  await act(async () => { finish(); });
  expect(image).toHaveAttribute("data-image-state", "error");
  expect(image).toHaveStyle({ visibility: "hidden" });
  error.mockRestore();
});
