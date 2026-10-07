import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Home from "../../screens/Home";
import { usePortfolioLighting } from "./portfolioLighting";

jest.mock("../Logo", () => function Logo() { return <div />; });
jest.mock("../profile/ThreeDProfileView", () => function Profile() { return <div />; });

let originalMatchMedia;
let reduced = false;
const listeners = new Set();

beforeEach(() => {
  jest.useFakeTimers();
  reduced = false;
  originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => ({
    media: query,
    matches: query === "(prefers-reduced-motion: reduce)" && reduced,
    addEventListener: (_, handler) => listeners.add(handler),
    removeEventListener: (_, handler) => listeners.delete(handler),
  });
});

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
  listeners.clear();
  jest.clearAllTimers();
  jest.useRealTimers();
});

function open(path = "/projects") {
  return render(<MemoryRouter initialEntries={[path]}><Home /></MemoryRouter>);
}

// Lighting is intentionally hidden from assistive technology; inspect its
// visible lifecycle through this test utility, while navigation uses roles.
function sources(selector) {
  // eslint-disable-next-line testing-library/no-node-access
  return document.querySelectorAll(selector);
}

test.each([
  ["/", "home", "#e6dabf"],
  ["/projects", "projects", "#b92436"],
  ["/resume", "resume", "#80729b"],
  ["/threeDeeResume", "3d-profile", "#ffb45e"],
  ["/megaracer", "megaracer", "#c6ff00"],
])("direct entry at %s starts with synchronized sources and no ignition", (path, theme, color) => {
  open(path);
  const environment = sources(".menu-div-main")[0];
  expect(environment).toHaveAttribute("data-light-theme", theme);
  expect(environment.style.getPropertyValue("--section-light")).toBe(color);
  expect(environment.style.getPropertyValue("--candle-flame-color")).toBe(color);
  expect(environment).toHaveAttribute("data-light-cycle", "0");
  expect(environment).toHaveAttribute("data-light-phase", "settled");
  expect(sources(".portfolio-candle")[0]).toHaveAttribute("aria-hidden", "true");
  expect(sources(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", theme === "home" ? "off" : "lit");
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(0);
});

test("a destination click produces one ignition cycle after its route synchronizes", () => {
  open();
  const environment = sources(".menu-div-main")[0];
  fireEvent.click(screen.getByRole("button", { name: "Resume", exact: true }));
  expect(environment).toHaveAttribute("data-active-view", "resume");
  expect(environment).toHaveAttribute("data-light-theme", "resume");
  expect(environment).toHaveAttribute("data-light-cycle", "1");
  expect(environment).toHaveAttribute("data-light-phase", "changing");
  expect(environment.style.getPropertyValue("--bulb-pulse-name")).toBe("portfolio-bulb-change");
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(14);
  act(() => jest.advanceTimersByTime(900));
  expect(environment).toHaveAttribute("data-light-phase", "settled");
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(14);
  act(() => jest.advanceTimersByTime(1300));
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(0);
});

test("reselecting the current section restarts its source and particle cleanup deadlines", () => {
  open();
  const environment = sources(".menu-div-main")[0];
  fireEvent.click(screen.getByRole("button", { name: "Projects", exact: true }));
  expect(environment).toHaveAttribute("data-light-cycle", "1");
  expect(environment.style.getPropertyValue("--bulb-pulse-name")).toBe("portfolio-bulb-change");
  const firstBulb = sources(".portfolio-light__transition")[0];
  const firstBurst = sources(".portfolio-candle-magic")[0];
  act(() => jest.advanceTimersByTime(500));
  fireEvent.click(screen.getByRole("button", { name: "Projects", exact: true }));
  expect(environment).toHaveAttribute("data-light-theme", "projects");
  expect(environment).toHaveAttribute("data-light-cycle", "2");
  expect(environment.style.getPropertyValue("--bulb-pulse-name")).toBe("portfolio-bulb-change-replay");
  expect(sources(".portfolio-light__transition")[0]).not.toBe(firstBulb);
  expect(sources(".portfolio-candle-magic")[0]).not.toBe(firstBurst);
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(14);
  act(() => jest.advanceTimersByTime(899));
  expect(environment).toHaveAttribute("data-light-phase", "changing");
  act(() => jest.advanceTimersByTime(1));
  expect(environment).toHaveAttribute("data-light-phase", "settled");
  act(() => jest.advanceTimersByTime(800));
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(14);
  act(() => jest.advanceTimersByTime(499));
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(14);
  act(() => jest.advanceTimersByTime(1));
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(0);
});

test("rapid section changes cancel the previous cleanup and settle only the newest ignition", () => {
  open();
  const environment = sources(".menu-div-main")[0];
  fireEvent.click(screen.getByRole("button", { name: "Resume", exact: true }));
  act(() => jest.advanceTimersByTime(500));
  fireEvent.click(screen.getByRole("button", { name: "3D Profile", exact: true }));
  act(() => jest.advanceTimersByTime(400));
  expect(environment).toHaveAttribute("data-light-theme", "3d-profile");
  expect(environment).toHaveAttribute("data-light-cycle", "2");
  expect(environment).toHaveAttribute("data-light-phase", "changing");
  act(() => jest.advanceTimersByTime(500));
  expect(environment).toHaveAttribute("data-light-phase", "settled");
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(14);
  act(() => jest.advanceTimersByTime(1300));
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(0);
});

test("the Home candle ignites on destination selection and extinguishes when returning Home", () => {
  open("/");
  expect(sources(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "off");
  fireEvent.click(screen.getByRole("button", { name: "Projects", exact: true }));
  expect(sources(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "igniting");
  act(() => jest.advanceTimersByTime(900));
  expect(sources(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "lit");
  fireEvent.click(screen.getByRole("button", { name: "Home", exact: true }));
  expect(sources(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "extinguishing");
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(0);
  act(() => jest.advanceTimersByTime(900));
  expect(sources(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "off");
  expect(sources(".menu-div-main")[0]).toHaveAttribute("data-light-theme", "home");
});

test("browser history synchronizes lighting and extinguishes Home without duplicate click cycles", () => {
  function HistoryControls() {
    const navigate = useNavigate();
    return <button type="button" onClick={() => navigate(-1)}>History back</button>;
  }
  render(<MemoryRouter initialEntries={["/"]}><Home /><HistoryControls /></MemoryRouter>);
  const environment = sources(".menu-div-main")[0];
  fireEvent.click(screen.getByRole("button", { name: "Projects", exact: true }));
  expect(environment).toHaveAttribute("data-light-cycle", "1");
  fireEvent.click(screen.getByRole("button", { name: "Resume", exact: true }));
  expect(environment).toHaveAttribute("data-light-cycle", "2");
  fireEvent.click(screen.getByRole("button", { name: "History back" }));
  expect(environment).toHaveAttribute("data-active-view", "projects");
  expect(environment).toHaveAttribute("data-light-theme", "projects");
  expect(environment).toHaveAttribute("data-light-cycle", "3");
  fireEvent.click(screen.getByRole("button", { name: "History back" }));
  expect(environment).toHaveAttribute("data-active-view", "home");
  expect(environment).toHaveAttribute("data-light-theme", "home");
  expect(environment).toHaveAttribute("data-light-cycle", "4");
  expect(sources(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "extinguishing");
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(0);
  act(() => jest.advanceTimersByTime(900));
  expect(sources(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "off");
});

test.each(["unknown", "constructor", "__proto__"])("invalid theme %s cannot activate a source cycle", (theme) => {
  const { result } = renderHook(() => usePortfolioLighting("home"));
  act(() => result.current.selectTheme(theme));
  expect(result.current.theme).toBe("home");
  expect(result.current.cycle).toBe(0);
  expect(result.current.changing).toBe(false);
  expect(jest.getTimerCount()).toBe(0);
});

test("Megaracer selects its page and highlighter green lighting, then Projects restores its page color", () => {
  open();
  const environment = sources(".menu-div-main")[0];
  fireEvent.click(screen.getByRole("button", { name: "Megaracer", exact: true }));
  expect(environment).toHaveAttribute("data-active-view", "megaracer");
  expect(environment).toHaveAttribute("data-light-theme", "megaracer");
  expect(environment.style.getPropertyValue("--section-light")).toBe("#c6ff00");
  fireEvent.click(screen.getByRole("button", { name: "Megaracer", exact: true }));
  expect(environment).toHaveAttribute("data-light-cycle", "2");
  fireEvent.click(screen.getByRole("button", { name: "Projects", exact: true }));
  expect(environment).toHaveAttribute("data-light-theme", "projects");
  expect(environment).toHaveAttribute("data-light-cycle", "3");
});

test("reduced motion replaces traveling particles with a short source fade", () => {
  reduced = true;
  open();
  const environment = sources(".menu-div-main")[0];
  fireEvent.click(screen.getByRole("button", { name: "Resume", exact: true }));
  expect(environment).toHaveAttribute("data-light-motion", "reduced");
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(0);
  act(() => jest.advanceTimersByTime(240));
  expect(environment).toHaveAttribute("data-light-phase", "settled");
  fireEvent.click(screen.getByRole("button", { name: "Resume", exact: true }));
  expect(environment).toHaveAttribute("data-light-cycle", "2");
  expect(environment).toHaveAttribute("data-light-phase", "changing");
  expect(sources(".portfolio-candle__sparkle")).toHaveLength(0);
  act(() => jest.advanceTimersByTime(239));
  expect(environment).toHaveAttribute("data-light-phase", "changing");
  act(() => jest.advanceTimersByTime(1));
  expect(environment).toHaveAttribute("data-light-phase", "settled");
});

test("opening the wheel during ignition preserves the single page bulb and candle without replaying their effects", () => {
  const originalHeight = window.innerHeight;
  window.innerHeight = 600;
  try {
    open();
    fireEvent.click(screen.getByRole("button", { name: "Navigate", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Resume", exact: true }));
    act(() => jest.advanceTimersByTime(200));
    const bulb = sources(".portfolio-light")[0];
    const candle = sources(".portfolio-candle")[0];
    const environment = sources(".menu-div-main")[0];
    fireEvent.click(screen.getByRole("button", { name: "Navigate", exact: true }));
    expect(screen.getByRole("dialog", { name: "Choose a destination" })).toBeInTheDocument();
    expect(sources(".portfolio-light")).toHaveLength(1);
    expect(sources(".portfolio-candle")).toHaveLength(1);
    expect(sources(".portfolio-light")[0]).toBe(bulb);
    expect(sources(".portfolio-candle")[0]).toBe(candle);
    expect(bulb).toHaveAttribute("data-light-phase", "changing");
    expect(environment).toHaveAttribute("data-light-phase", "changing");
    expect(environment).toHaveAttribute("data-light-cycle", "1");
    fireEvent.click(screen.getByRole("button", { name: "Megaracer", exact: true }));
    expect(sources(".portfolio-light")).toHaveLength(1);
    expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
    expect(sources(".menu-div-main")[0]).toHaveAttribute("data-active-view", "megaracer");
    expect(sources(".portfolio-light")[0]).toHaveAttribute("data-light-phase", "changing");
  } finally {
    window.innerHeight = originalHeight;
  }
});

test("unmount during ignition removes its timer, listeners and restores inherited body color variables", () => {
  document.body.style.setProperty("--section-light", "#123456", "important");
  const utils = open();
  fireEvent.click(screen.getByRole("button", { name: "Resume", exact: true }));
  act(() => jest.advanceTimersByTime(300));
  fireEvent.click(screen.getByRole("button", { name: "Resume", exact: true }));
  expect(sources(".menu-div-main")[0]).toHaveAttribute("data-light-cycle", "2");
  expect(document.body.style.getPropertyValue("--section-light")).toBe("#80729b");
  utils.unmount();
  expect(document.body.style.getPropertyValue("--section-light")).toBe("#123456");
  expect(document.body.style.getPropertyPriority("--section-light")).toBe("important");
  expect(listeners.size).toBe(0);
  expect(jest.getTimerCount()).toBe(0);
  document.body.style.removeProperty("--section-light");
});
