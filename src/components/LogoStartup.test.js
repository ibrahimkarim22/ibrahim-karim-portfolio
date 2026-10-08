import { StrictMode } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import Logo from "./Logo";
import { beginNavigationMotion } from "./home/navigationMotion";

const mockCanvasStarts = jest.fn();
const mockCanvasStops = jest.fn();
jest.mock("@react-three/fiber", () => {
  const React = require("react");
  return {
    Canvas: () => {
      React.useEffect(() => { mockCanvasStarts(); return mockCanvasStops; }, []);
      return <canvas aria-label="Home scene canvas" />;
    },
    useFrame: jest.fn(), useThree: jest.fn(),
  };
});
jest.mock("@react-three/drei", () => ({ useGLTF: jest.fn(), PerspectiveCamera: () => null }));

let frames, nextFrame, releases, originalMatchMedia;
beforeEach(() => {
  jest.useFakeTimers();
  frames = new Map(); nextFrame = 0; releases = [];
  jest.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
    const id = ++nextFrame; frames.set(id, callback); return id;
  });
  jest.spyOn(window, "cancelAnimationFrame").mockImplementation(id => frames.delete(id));
  originalMatchMedia = window.matchMedia;
  window.matchMedia = () => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  mockCanvasStarts.mockClear(); mockCanvasStops.mockClear();
});
afterEach(() => {
  cleanup();
  act(() => releases.forEach(release => release()));
  jest.restoreAllMocks(); jest.useRealTimers();
  window.matchMedia = originalMatchMedia;
});
function motion() {
  let release;
  act(() => { release = beginNavigationMotion(); });
  releases.push(release);
  return () => act(() => release());
}
function paint() {
  act(() => {
    const pending = [...frames.values()]; frames.clear();
    pending.forEach(callback => callback(performance.now()));
  });
}

test("Home keeps its measured layout while Canvas waits for actual fixture motion completion", () => {
  const release = motion();
  const { container } = render(<Logo />);
  const wrapper = container.querySelector(".logo-canvas-container");
  const slot = container.querySelector(".logo-canvas");
  const stage = slot.firstElementChild;
  expect(slot).toHaveAttribute("aria-busy", "true");
  expect(stage.style.position).toBe("absolute");
  expect(screen.queryByLabelText("Home scene canvas")).not.toBeInTheDocument();
  act(() => jest.advanceTimersByTime(2000));
  paint(); paint();
  expect(mockCanvasStarts).not.toHaveBeenCalled();
  release();
  paint();
  expect(mockCanvasStarts).not.toHaveBeenCalled();
  paint();
  expect(screen.getByLabelText("Home scene canvas")).toBeInTheDocument();
  expect(container.querySelector(".logo-canvas-container")).toBe(wrapper);
  expect(container.querySelector(".logo-canvas")).toBe(slot);
  expect(slot.firstElementChild).toBe(stage);
  expect(mockCanvasStarts).toHaveBeenCalledTimes(1);
});

test("direct Home entry gets a paint opportunity before its Canvas starts", () => {
  render(<Logo />);
  expect(mockCanvasStarts).not.toHaveBeenCalled();
  paint(); expect(mockCanvasStarts).not.toHaveBeenCalled();
  paint(); expect(mockCanvasStarts).toHaveBeenCalledTimes(1);
});

test("a new pull cancels pending GPU startup, while a started Canvas survives later Home pulls", () => {
  render(<Logo />);
  paint();
  const release = motion();
  paint(); paint();
  expect(mockCanvasStarts).not.toHaveBeenCalled();
  release();
  paint(); paint();
  const canvas = screen.getByLabelText("Home scene canvas");
  const releaseAgain = motion();
  paint(); paint(); releaseAgain(); paint(); paint();
  expect(screen.getByLabelText("Home scene canvas")).toBe(canvas);
  expect(mockCanvasStarts).toHaveBeenCalledTimes(1);
  expect(mockCanvasStops).not.toHaveBeenCalled();
});

test("leaving Home cancels pending frames and a fresh visit starts independently", () => {
  const first = render(<Logo />);
  paint();
  first.unmount();
  expect(frames.size).toBe(0);
  paint();
  expect(mockCanvasStarts).not.toHaveBeenCalled();
  const release = motion();
  const second = render(<Logo />);
  second.unmount(); release(); paint(); paint();
  expect(frames.size).toBe(0);
  expect(mockCanvasStarts).not.toHaveBeenCalled();
  render(<Logo />); paint(); paint();
  expect(mockCanvasStarts).toHaveBeenCalledTimes(1);
});

test("reduced-motion direct entry and strict effect replay do not strand startup", () => {
  window.matchMedia = () => ({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  const { unmount } = render(<StrictMode><Logo /></StrictMode>);
  expect(frames.size).toBe(1);
  paint(); paint();
  expect(screen.getByLabelText("Home scene canvas")).toBeInTheDocument();
  unmount();
  expect(frames.size).toBe(0);
});

test("an unavailable animation scheduler still permits an idle Home scene", () => {
  window.requestAnimationFrame.mockImplementation(() => { throw new Error("scheduler unavailable"); });
  render(<Logo />);
  expect(screen.getByLabelText("Home scene canvas")).toBeInTheDocument();
});
