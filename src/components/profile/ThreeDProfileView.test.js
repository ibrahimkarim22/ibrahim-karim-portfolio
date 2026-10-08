import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { PortfolioRoutes } from "../../App";
import ThreeDProfileView from "./ThreeDProfileView";
import { beginNavigationMotion } from "../home/navigationMotion";

const mockResetView = jest.fn();
let mockCameraReady;

jest.mock("../3dEnvironment", () => {
  const React = require("react");
  return React.forwardRef(function MockBlenderEnvironment({ onReady }, ref) {
    React.useImperativeHandle(ref, () => ({ resetView: mockResetView }));
    React.useEffect(() => { onReady?.(mockCameraReady); }, [onReady]);
    return <canvas role="img" aria-label="3D profile scene" />;
  });
});
jest.mock("../Logo", () => function MockLogo() {
  return <canvas aria-label="Animated signature" />;
});

let originalMatchMedia;
let compactMedia;
let touchMedia;
let mediaListeners;

beforeEach(() => {
  jest.useFakeTimers();
  mockResetView.mockClear();
  mockCameraReady = true;
  originalMatchMedia = window.matchMedia;
  mediaListeners = new Set();
  compactMedia = {
    matches: false,
    addEventListener: (event, listener) => mediaListeners.add(listener),
    removeEventListener: (event, listener) => mediaListeners.delete(listener),
  };
  touchMedia = { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
  window.matchMedia = (query) => query === "(pointer: coarse)" ? touchMedia : compactMedia;
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  jest.clearAllTimers();
  jest.useRealTimers();
});

test("exposes accurate controls immediately and starts a direct scene after shell paint", () => {
  const { unmount } = render(<ThreeDProfileView />);
  expect(screen.queryByRole("img", { name: "3D profile scene" })).not.toBeInTheDocument();
  act(() => jest.advanceTimersByTime(32));
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(screen.queryByText(/^\d+%$/)).not.toBeInTheDocument();
  expect(screen.getByRole("img", { name: "3D profile scene" }))
    .toBeInTheDocument();
  const controls = screen.getByRole("region", { name: "3D controls" });
  expect(controls).toHaveTextContent("DragRotate");
  expect(controls).toHaveTextContent("Right-dragPan");
  expect(controls).toHaveTextContent("ScrollZoom");
  expect(screen.getByRole("button", { name: "Reset View" })).toBeEnabled();
  expect(screen.queryByRole("button", { name: "Back to Menu" }))
    .not.toBeInTheDocument();

  unmount();

  expect(jest.getTimerCount()).toBe(0);
  expect(screen.queryByRole("img", { name: "3D profile scene" }))
    .not.toBeInTheDocument();
});

test("pending camera readiness does not introduce a simulated loading timer", () => {
  mockCameraReady = false;
  const { unmount } = render(<ThreeDProfileView />);
  act(() => jest.advanceTimersByTime(32));
  expect(screen.getByRole("button", { name: "Reset View" })).toBeDisabled();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(jest.getTimerCount()).toBe(0);
  unmount();

  expect(jest.getTimerCount()).toBe(0);
});

function loadProfile(compact = false, touch = compact) {
  compactMedia.matches = compact;
  touchMedia.matches = touch;
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<ThreeDProfileView />);
  act(() => jest.advanceTimersByTime(32));
  return user;
}

test("Reset View calls the mounted environment's camera API without restarting loading", async () => {
  const user = loadProfile();
  const scene = screen.getByRole("img", { name: "3D profile scene" });
  const reset = screen.getByRole("button", { name: "Reset View" });
  reset.focus();
  await user.keyboard("{Enter}");
  expect(mockResetView).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("img", { name: "3D profile scene" })).toBe(scene);
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test("Reset View remains disabled until the camera has been framed", () => {
  mockCameraReady = false;
  loadProfile();
  expect(screen.getByRole("button", { name: "Reset View" })).toBeDisabled();
});

test("compact controls start closed and reveal the supported touch gestures", async () => {
  const user = loadProfile(true);
  const trigger = screen.getByRole("button", { name: "Controls" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("region", { name: "3D controls" })).not.toBeInTheDocument();
  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  const panel = screen.getByRole("region", { name: "3D controls" });
  expect(panel).toHaveTextContent("DragRotate");
  expect(panel).toHaveTextContent("PinchZoom");
  expect(panel).toHaveTextContent("Two-finger dragPan");
  await user.click(screen.getByRole("button", { name: "Reset View" }));
  expect(mockResetView).toHaveBeenCalledTimes(1);
  expect(panel).toBeInTheDocument();
});

test("a narrow fine-pointer layout keeps mouse guidance inside the compact disclosure", async () => {
  const user = loadProfile(true, false);
  await user.click(screen.getByRole("button", { name: "Controls" }));
  const panel = screen.getByRole("region", { name: "3D controls" });
  expect(panel).toHaveTextContent("DragRotate");
  expect(panel).toHaveTextContent("Right-dragPan");
  expect(panel).toHaveTextContent("ScrollZoom");
  expect(panel).not.toHaveTextContent("Pinch");
  expect(panel).not.toHaveTextContent("Two-finger drag");
});

test.each(["toggle", "close", "Escape"])("compact controls close via %s and restore trigger focus", async (method) => {
  const user = loadProfile(true);
  const trigger = screen.getByRole("button", { name: "Controls" });
  await user.click(trigger);
  if (method === "toggle") await user.click(trigger);
  else if (method === "close") await user.click(screen.getByRole("button", { name: "Close controls" }));
  else await user.keyboard("{Escape}");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("region", { name: "3D controls" })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test("switching to a compact layout does not leave the desktop controls permanently open", () => {
  loadProfile();
  act(() => mediaListeners.forEach((listener) => listener({ matches: true })));
  expect(screen.getByRole("button", { name: "Controls" })).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("region", { name: "3D controls" })).not.toBeInTheDocument();
});

function RouteProbe() {
  const location = useLocation();
  return <output aria-label="Route and entry">{location.pathname}:{location.key}</output>;
}

test("Reset leaves the 3D route, history entry and mounted scene intact, then Back restores Home", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const { container } = render(
    <MemoryRouter initialEntries={["/threeDeeResume"]}>
      <PortfolioRoutes />
      <RouteProbe />
    </MemoryRouter>
  );
  act(() => jest.advanceTimersByTime(32));
  const entry = screen.getByLabelText("Route and entry").textContent;
  const canvas = screen.getByRole("img", { name: "3D profile scene" });
  const navigation = screen.getByRole("navigation", { name: "Portfolio navigation" });
  expect(within(navigation).getByRole("button", { name: "Megaracer", exact: true })).toHaveAttribute("aria-controls", "megaracer-view");
  expect(screen.queryByTitle("Megaracer / TypeRacer profile preview")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Reset View" }));
  expect(mockResetView).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText("Route and entry")).toHaveTextContent(entry);
  expect(screen.getByRole("img", { name: "3D profile scene" })).toBe(canvas);
  expect(container.querySelectorAll("canvas")).toHaveLength(1);
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "3D Profile" }));
  expect(screen.getByLabelText("Route and entry")).toHaveTextContent(entry);
  await user.click(screen.getByRole("button", { name: "Home" }));
  expect(screen.getByLabelText("Route and entry")).toHaveTextContent(/^\/:/);
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBeInTheDocument();
  expect(screen.getByLabelText("Animated signature")).toBeInTheDocument();
  expect(canvas).not.toBeInTheDocument();
  expect(container.querySelectorAll("canvas")).toHaveLength(1);
  await user.click(screen.getByRole("button", { name: "3D Profile" }));
  act(() => jest.advanceTimersByTime(32));
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(container.querySelectorAll("canvas")).toHaveLength(1);
  expect(screen.getByRole("img", { name: "3D profile scene" })).not.toBe(canvas);
});


test('the destination shell is prompt but Canvas waits for the real outgoing pull and a paint', () => {
  const release = beginNavigationMotion();
  const { unmount } = render(<ThreeDProfileView />);
  try {
  expect(screen.getByRole('region', { name: '3D controls' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reset View' })).toBeDisabled();
  expect(screen.queryByRole('img', { name: '3D profile scene' })).not.toBeInTheDocument();
  act(() => jest.advanceTimersByTime(2000));
  expect(screen.queryByRole('img', { name: '3D profile scene' })).not.toBeInTheDocument();
  act(release);
  act(() => jest.advanceTimersByTime(16));
  expect(screen.queryByRole('img', { name: '3D profile scene' })).not.toBeInTheDocument();
  act(() => jest.advanceTimersByTime(16));
  expect(screen.getByRole('img', { name: '3D profile scene' })).toBeInTheDocument();
  } finally { unmount(); release(); }
});

test('new motion cancels a pending Canvas start and route exit cancels its paint callbacks', () => {
  const { unmount } = render(<ThreeDProfileView />);
  act(() => jest.advanceTimersByTime(16));
  let release;
  act(() => { release = beginNavigationMotion(); });
  act(() => jest.advanceTimersByTime(80));
  expect(screen.queryByRole('img', { name: '3D profile scene' })).not.toBeInTheDocument();
  act(release);
  unmount();
  expect(jest.getTimerCount()).toBe(0);
  act(() => jest.advanceTimersByTime(100));
  expect(screen.queryByRole('img', { name: '3D profile scene' })).not.toBeInTheDocument();
});


test('reduced-motion direct entry starts after paint and subsequent pulls keep its scene mounted', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  const { unmount } = render(<ThreeDProfileView />);
  act(() => jest.advanceTimersByTime(32));
  const canvas = screen.getByRole('img', { name: '3D profile scene' });
  let release;
  act(() => { release = beginNavigationMotion(); });
  expect(screen.getByRole('img', { name: '3D profile scene' })).toBe(canvas);
  act(release);
  expect(screen.getByRole('img', { name: '3D profile scene' })).toBe(canvas);
  unmount();
});
