import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeCandle from "./HomeCandle";
import { PortfolioLightingContext, usePortfolioLighting } from "./portfolioLighting";

function Harness({ view = "home" }) {
  const lighting = usePortfolioLighting(view);
  return <PortfolioLightingContext.Provider value={lighting}>
    <div data-testid="lighting" data-theme={lighting.theme} data-cycle={lighting.cycle} style={lighting.style}>
      <HomeCandle />
    </div>
  </PortfolioLightingContext.Provider>;
}

// Temporary artwork is intentionally hidden from accessibility APIs.
function decoration(selector) {
  // eslint-disable-next-line testing-library/no-node-access
  return document.querySelector(selector);
}
function particles(selector) {
  // eslint-disable-next-line testing-library/no-node-access
  return document.querySelectorAll(selector);
}
function smokeArtwork() {
  return particles(".portfolio-candle-click__smoke, .portfolio-candle-click__smoke-mote");
}
const advance = (ms) => act(() => jest.advanceTimersByTime(ms));
let originalMatchMedia;
let reduced;
const motionListeners = new Set();
beforeEach(() => {
  jest.useFakeTimers();
  reduced = false;
  originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => ({
    media: query,
    get matches() { return reduced && query === "(prefers-reduced-motion: reduce)"; },
    addEventListener: (_, callback) => motionListeners.add(callback),
    removeEventListener: (_, callback) => motionListeners.delete(callback),
  });
});
afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
  motionListeners.clear();
  jest.clearAllTimers();
  jest.useRealTimers();
});

test("Home strike gives a brief wick spark and local glow without lighting the candle or changing the theme", () => {
  render(<Harness />);
  const lighting = screen.getByTestId("lighting");
  const style = lighting.getAttribute("style");
  fireEvent.click(screen.getByRole("button", { name: "Strike candle" }));
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "off");
  expect(decoration(".portfolio-candle-click")).toHaveAttribute("data-candle-interaction", "spark");
  expect(decoration(".portfolio-candle-click__wick-flash")).toBeInTheDocument();
  expect(particles(".portfolio-candle-click__spark")).toHaveLength(5);
  advance(180);
  expect(decoration(".portfolio-candle-click__wick-flash")).not.toBeInTheDocument();
  expect(particles(".portfolio-candle-click__spark")).toHaveLength(0);
  expect(decoration(".portfolio-candle-click__light")).toBeInTheDocument();
  advance(1420);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "off");
  expect(lighting).toHaveAttribute("data-theme", "home");
  expect(lighting).toHaveAttribute("data-cycle", "0");
  expect(lighting).toHaveAttribute("style", style);
  expect(jest.getTimerCount()).toBe(0);
});

test("Home ignores repeated activations until the original strike ends", () => {
  render(<Harness />);
  const button = screen.getByRole("button", { name: "Strike candle" });
  fireEvent.click(button);
  const original = decoration(".portfolio-candle-click");
  expect(button).toHaveAttribute("aria-disabled", "true");
  advance(300);
  fireEvent.click(button);
  expect(decoration(".portfolio-candle-click")).toBe(original);
  advance(1300);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(button).toHaveAttribute("aria-disabled", "false");
  fireEvent.click(button);
  expect(decoration(".portfolio-candle-click")).toBeInTheDocument();
});

test("a repeated non-Home press regenerates one fresh fire and preserves the current section lighting", () => {
  render(<Harness view="resume" />);
  const lighting = screen.getByTestId("lighting");
  const style = lighting.getAttribute("style");
  const flame = decoration(".portfolio-candle__flame");
  const button = screen.getByRole("button", { name: "Create candle flame burst" });
  fireEvent.click(button);
  advance(330);
  const original = decoration(".portfolio-candle-click");
  expect(button).toHaveAttribute("aria-disabled", "false");
  fireEvent.click(button);
  expect(decoration(".portfolio-candle-click")).not.toBe(original);
  expect(particles(".portfolio-candle-click")).toHaveLength(1);
  expect(particles(".portfolio-candle-click__fire")).toHaveLength(1);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "burst");
  expect(particles(".portfolio-candle-click__smoke, .portfolio-candle-click__smoke-mote, .portfolio-candle-click__spark, .portfolio-candle-click__ember")).toHaveLength(0);
  expect(decoration(".portfolio-candle__flame")).toBe(flame);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(lighting).toHaveAttribute("data-theme", "resume");
  expect(lighting).toHaveAttribute("data-cycle", "0");
  expect(lighting).toHaveAttribute("style", style);
  advance(3380);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle__flame")).toBe(flame);
  expect(jest.getTimerCount()).toBe(0);
});

test("silence after the latest press controls the ending and earlier deadlines cannot finish a new fire", () => {
  render(<Harness view="projects" />);
  const button = screen.getByRole("button", { name: "Create candle flame burst" });
  fireEvent.click(button);
  advance(1400);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "collapse");
  fireEvent.click(button);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "burst");
  advance(200);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "burst");
  expect(particles(".portfolio-candle-click__smoke")).toHaveLength(0);
  advance(10);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "full");
  advance(770);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "collapse");
  advance(620);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "out");
  expect(particles(".portfolio-candle-click__smoke")).toHaveLength(6);
  expect(particles(".portfolio-candle-click__smoke-mote")).toHaveLength(6);
  advance(380);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "out");
  expect(particles(".portfolio-candle-click")).toHaveLength(1);
  advance(1400);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(jest.getTimerCount()).toBe(0);
});

test("rapid repeated presses keep fresh fire visible and bounded until the presses stop", () => {
  render(<Harness view="resume" />);
  const button = screen.getByRole("button", { name: "Create candle flame burst" });
  fireEvent.click(button);
  for (let press = 0; press < 20; press += 1) {
    advance(30);
    fireEvent.click(button);
    expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "burst");
    expect(particles(".portfolio-candle-click")).toHaveLength(1);
    expect(particles(".portfolio-candle-click__fire")).toHaveLength(1);
    expect(particles(".portfolio-candle-click__ember")).toHaveLength(0);
  }
  advance(209);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "burst");
  advance(1);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "full");
  expect(particles(".portfolio-candle-click__ember")).toHaveLength(10);
  expect(particles(".portfolio-candle-click")).toHaveLength(1);
  advance(3170);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(jest.getTimerCount()).toBe(0);
});

test.each([[1600, "out"], [2600, "strike"], [2780, "strike-gap"], [2960, "strike-again"], [3140, "relight"]])("pressing at %ims during %s regenerates fire and postpones the ending", (elapsed, phase) => {
  render(<Harness view="projects" />);
  const lighting = screen.getByTestId("lighting");
  const style = lighting.getAttribute("style");
  const button = screen.getByRole("button", { name: "Create candle flame burst" });
  fireEvent.click(button);
  advance(elapsed);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", phase);
  const previous = decoration(".portfolio-candle-click");
  expect(button).toHaveAttribute("aria-disabled", "false");
  fireEvent.click(button);
  expect(decoration(".portfolio-candle-click")).not.toBe(previous);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "burst");
  expect(particles(".portfolio-candle-click")).toHaveLength(1);
  expect(particles(".portfolio-candle-click__fire")).toHaveLength(1);
  expect(particles(".portfolio-candle-click__smoke, .portfolio-candle-click__smoke-mote, .portfolio-candle-click__spark, .portfolio-candle-click__ember")).toHaveLength(0);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(lighting).toHaveAttribute("data-cycle", "0");
  expect(lighting).toHaveAttribute("style", style);
  advance(3380);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(lighting).toHaveAttribute("style", style);
  expect(jest.getTimerCount()).toBe(0);
});

test("reduced repeated presses regenerate a calm flare and restart the quiet ending from the latest press", () => {
  reduced = true;
  render(<Harness view="resume" />);
  const button = screen.getByRole("button", { name: "Create candle flame burst" });
  fireEvent.click(button);
  advance(450);
  expect(particles(".portfolio-candle-click__smoke")).toHaveLength(1);
  expect(particles(".portfolio-candle-click__smoke-mote")).toHaveLength(0);
  const previous = decoration(".portfolio-candle-click");
  expect(button).toHaveAttribute("aria-disabled", "false");
  fireEvent.click(button);
  expect(decoration(".portfolio-candle-click")).not.toBe(previous);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "full");
  expect(particles(".portfolio-candle-click")).toHaveLength(1);
  expect(particles(".portfolio-candle-click__fire")).toHaveLength(1);
  expect(particles(".portfolio-candle-click__smoke, .portfolio-candle-click__smoke-mote, .portfolio-candle-click__spark, .portfolio-candle-click__ember")).toHaveLength(0);
  advance(450);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "out");
  advance(1070);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "strike");
  expect(particles(".portfolio-candle-click__spark, .portfolio-candle-click__ember")).toHaveLength(0);
  advance(450);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(jest.getTimerCount()).toBe(0);
});

test("lit click collapses directly to a one-second smoke pause, then strikes twice before relighting", () => {
  render(<Harness view="resume" />);
  const lighting = screen.getByTestId("lighting");
  const style = lighting.getAttribute("style");
  const flame = decoration(".portfolio-candle__flame");
  fireEvent.click(screen.getByRole("button", { name: "Create candle flame burst" }));
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "compress");
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  advance(120);
  expect(decoration(".portfolio-candle-click__fire")).toBeInTheDocument();
  expect(decoration(".portfolio-candle-click")).toHaveAttribute("data-interaction-phase", "burst");
  advance(210);
  expect(decoration(".portfolio-candle-click")).toHaveAttribute("data-interaction-phase", "full");
  expect(decoration(".portfolio-candle-click__light")).toHaveAttribute("data-light-boost", "fire");
  expect(particles(".portfolio-candle-click__ember")).toHaveLength(10);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(decoration(".portfolio-candle-smoke")).not.toBeInTheDocument();
  advance(650);
  expect(decoration(".portfolio-candle-click")).toHaveAttribute("data-interaction-phase", "collapse");
  advance(619);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "collapse");
  advance(1);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "out");
  expect(decoration(".portfolio-candle-click__fire")).not.toBeInTheDocument();
  expect(particles(".portfolio-candle-click__ember")).toHaveLength(0);
  expect(decoration(".portfolio-candle__flame")).toBe(flame);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(decoration(".portfolio-candle-smoke")).not.toBeInTheDocument();
  expect(particles(".portfolio-candle-click__smoke")).toHaveLength(6);
  expect(particles(".portfolio-candle-click__smoke-mote")).toHaveLength(6);
  expect(decoration(".portfolio-candle-click")).toHaveAttribute("aria-hidden", "true");
  expect(decoration(".portfolio-candle-smoke")).not.toBeInTheDocument();
  const button = screen.getByRole("button", { name: "Create candle flame burst" });
  expect(button).toHaveAttribute("aria-disabled", "false");
  advance(999);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "out");
  expect(decoration(".portfolio-candle-click__wick-flash")).not.toBeInTheDocument();
  advance(1);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "strike");
  expect(particles(".portfolio-candle-click__smoke")).toHaveLength(0);
  expect(particles(".portfolio-candle-click__smoke-mote")).toHaveLength(0);
  expect(decoration(".portfolio-candle-click__wick-flash")).toBeInTheDocument();
  expect(particles(".portfolio-candle-click__spark")).toHaveLength(5);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(button).toHaveAttribute("aria-disabled", "false");
  const firstFlash = decoration(".portfolio-candle-click__wick-flash");
  advance(180);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "strike-gap");
  expect(decoration(".portfolio-candle-click__wick-flash")).not.toBeInTheDocument();
  expect(particles(".portfolio-candle-click__spark, .portfolio-candle-click__smoke, .portfolio-candle-click__smoke-mote")).toHaveLength(0);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(button).toHaveAttribute("aria-disabled", "false");
  advance(180);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "strike-again");
  const secondFlash = decoration(".portfolio-candle-click__wick-flash");
  expect(secondFlash).toBeInTheDocument();
  expect(secondFlash).not.toBe(firstFlash);
  expect(particles(".portfolio-candle-click__spark")).toHaveLength(5);
  expect(button).toHaveAttribute("aria-disabled", "false");
  advance(180);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "relight");
  expect(decoration(".portfolio-candle-click__wick-flash")).not.toBeInTheDocument();
  expect(particles(".portfolio-candle-click__spark")).toHaveLength(0);
  expect(decoration(".portfolio-candle__flame")).toBe(flame);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  advance(240);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "idle");
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(button).toHaveAttribute("aria-disabled", "false");
  expect(lighting).toHaveAttribute("data-theme", "resume");
  expect(lighting).toHaveAttribute("data-cycle", "0");
  expect(lighting).toHaveAttribute("style", style);
  expect(jest.getTimerCount()).toBe(0);
});

test.each([
  ["home", "Strike candle", "{Enter}"], ["home", "Strike candle", " "],
])("%s supports keyboard activation with %s via %s", async (view, name, key) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<Harness view={view} />);
  await user.tab();
  expect(screen.getByRole("button", { name })).toHaveFocus();
  await user.keyboard(key);
  expect(decoration(".portfolio-candle-click")).toBeInTheDocument();
});

test.each(["{Enter}", " "])("lit candle keyboard %s regenerates fire and finishes only after silence", async (key) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<Harness view="resume" />);
  await user.tab();
  expect(screen.getByRole("button", { name: "Create candle flame burst" })).toHaveFocus();
  await user.keyboard(key);
  expect(decoration(".portfolio-candle-click")).toBeInTheDocument();
  advance(330);
  const original = decoration(".portfolio-candle-click");
  await user.keyboard(key);
  expect(decoration(".portfolio-candle-click")).not.toBe(original);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "burst");
  advance(1600);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "out");
  expect(particles(".portfolio-candle-click__smoke")).toHaveLength(6);
  expect(particles(".portfolio-candle-click__smoke-mote")).toHaveLength(6);
  advance(1780);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
});

test("navigation away from a Home strike cancels its glow and leaves the original navigation ignition intact", () => {
  const view = render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: "Strike candle" }));
  advance(100);
  view.rerender(<Harness view="resume" />);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "igniting");
  expect(particles(".portfolio-candle__sparkle")).toHaveLength(14);
  advance(900);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(particles(".portfolio-candle__sparkle")).toHaveLength(14);
  advance(1300);
  expect(particles(".portfolio-candle__sparkle")).toHaveLength(0);
  expect(jest.getTimerCount()).toBe(0);
});

test("returning Home during fire cancels click layers and preserves the existing extinguish smoke", () => {
  const view = render(<Harness view="projects" />);
  fireEvent.click(screen.getByRole("button", { name: "Create candle flame burst" }));
  advance(330);
  view.rerender(<Harness view="home" />);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "extinguishing");
  const smoke = decoration(".portfolio-candle-smoke");
  expect(smoke).toBeInTheDocument();
  advance(900);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "off");
  expect(decoration(".portfolio-candle-smoke")).toBe(smoke);
  advance(7400);
  expect(decoration(".portfolio-candle-smoke")).not.toBeInTheDocument();
});

test.each(["home", "resume"])("reduced %s keeps a calmer brief interaction with no traveling particles", (view) => {
  reduced = true;
  render(<Harness view={view} />);
  fireEvent.click(screen.getByRole("button", { name: view === "home" ? "Strike candle" : "Create candle flame burst" }));
  expect(decoration(".portfolio-candle-click")).toHaveAttribute("data-interaction-motion", "reduced");
  expect(particles(".portfolio-candle-click__spark, .portfolio-candle-click__ember")).toHaveLength(0);
  advance(150);
  expect(decoration(".portfolio-candle-click__light")).toBeInTheDocument();
  advance(view === "home" ? 350 : 1820);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", view === "home" ? "off" : "lit");
  expect(jest.getTimerCount()).toBe(0);
});

test("motion preference changes and unmount cancel smoke and pending relight work", () => {
  const view = render(<Harness view="resume" />);
  fireEvent.click(screen.getByRole("button", { name: "Create candle flame burst" }));
  advance(1600);
  expect(particles(".portfolio-candle-click__smoke")).toHaveLength(6);
  expect(particles(".portfolio-candle-click__smoke-mote")).toHaveLength(6);
  act(() => { reduced = true; motionListeners.forEach((callback) => callback()); });
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(jest.getTimerCount()).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "Create candle flame burst" }));
  advance(450);
  expect(particles(".portfolio-candle-click__smoke")).toHaveLength(1);
  expect(particles(".portfolio-candle-click__smoke-mote")).toHaveLength(0);
  view.unmount();
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(jest.getTimerCount()).toBe(0);
  expect(motionListeners.size).toBe(0);
});

test.each([
  ["projects", "#b92436"], ["resume", "#80729b"],
  ["3d-profile", "#ffb45e"], ["megaracer", "#c6ff00"],
])("%s retains its authoritative color and lighting state during click smoke and relight", (view, color) => {
  render(<Harness view={view} />);
  const lighting = screen.getByTestId("lighting");
  const style = lighting.getAttribute("style");
  const flame = decoration(".portfolio-candle__flame");
  fireEvent.click(screen.getByRole("button", { name: "Create candle flame burst" }));
  advance(1600);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "out");
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(lighting).toHaveAttribute("data-theme", view);
  expect(lighting).toHaveAttribute("data-cycle", "0");
  expect(lighting.style.getPropertyValue("--candle-flame-color")).toBe(color);
  advance(1000);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "strike");
  expect(lighting.style.getPropertyValue("--candle-flame-color")).toBe(color);
  advance(180);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "strike-gap");
  advance(180);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "strike-again");
  expect(lighting.style.getPropertyValue("--candle-flame-color")).toBe(color);
  advance(180);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "relight");
  expect(decoration(".portfolio-candle__flame")).toBe(flame);
  expect(lighting.style.getPropertyValue("--candle-flame-color")).toBe(color);
  expect(lighting).toHaveAttribute("style", style);
  advance(240);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(jest.getTimerCount()).toBe(0);
});

test("reduced motion goes directly from flare to a one-second smoke pause and two calm strikes before relighting", () => {
  reduced = true;
  render(<Harness view="resume" />);
  const button = screen.getByRole("button", { name: "Create candle flame burst" });
  fireEvent.click(button);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "full");
  advance(450);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "out");
  expect(particles(".portfolio-candle-click__smoke")).toHaveLength(1);
  expect(particles(".portfolio-candle-click__smoke-mote")).toHaveLength(0);
  expect(decoration(".portfolio-candle-click")).toHaveAttribute("data-interaction-motion", "reduced");
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  advance(999);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "out");
  expect(button).toHaveAttribute("aria-disabled", "false");
  advance(1);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "strike");
  expect(decoration(".portfolio-candle-click__wick-flash")).toBeInTheDocument();
  expect(particles(".portfolio-candle-click__smoke, .portfolio-candle-click__smoke-mote, .portfolio-candle-click__spark, .portfolio-candle-click__ember")).toHaveLength(0);
  const firstFlash = decoration(".portfolio-candle-click__wick-flash");
  advance(100);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "strike-gap");
  expect(decoration(".portfolio-candle-click__wick-flash")).not.toBeInTheDocument();
  expect(particles(".portfolio-candle-click__spark, .portfolio-candle-click__smoke, .portfolio-candle-click__smoke-mote")).toHaveLength(0);
  expect(button).toHaveAttribute("aria-disabled", "false");
  advance(140);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "strike-again");
  const secondFlash = decoration(".portfolio-candle-click__wick-flash");
  expect(secondFlash).toBeInTheDocument();
  expect(secondFlash).not.toBe(firstFlash);
  expect(particles(".portfolio-candle-click__spark")).toHaveLength(0);
  advance(100);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "relight");
  expect(decoration(".portfolio-candle-click__wick-flash")).not.toBeInTheDocument();
  advance(180);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "lit");
  expect(button).toHaveAttribute("aria-disabled", "false");
  expect(jest.getTimerCount()).toBe(0);
});

test.each([
  [30, "compress", "false"],
  [1400, "collapse", "true"], [1600, "out", "true"], [2600, "strike", "true"],
  [2780, "strike-gap", "true"], [2960, "strike-again", "true"], [3140, "relight", "false"],
])("returning Home at %ims during %s cancels the click tail and preserves navigation extinguishing", (elapsed, phase, darkHandoff) => {
  const view = render(<Harness view="projects" />);
  fireEvent.click(screen.getByRole("button", { name: "Create candle flame burst" }));
  advance(elapsed);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", phase);
  view.rerender(<Harness view="home" />);
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(particles(".portfolio-candle-click__smoke, .portfolio-candle-click__smoke-mote, .portfolio-candle-click__spark")).toHaveLength(0);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "extinguishing");
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-dark-handoff", darkHandoff);
  expect(decoration(".portfolio-candle-smoke")).toBeInTheDocument();
  advance(8300);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "off");
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-dark-handoff", "false");
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle-smoke")).not.toBeInTheDocument();
  expect(jest.getTimerCount()).toBe(0);
});

test("returning Home from a regenerated burst keeps the flame dark and cancels every pending ending", () => {
  const view = render(<Harness view="projects" />);
  const button = screen.getByRole("button", { name: "Create candle flame burst" });
  fireEvent.click(button);
  advance(330);
  fireEvent.click(button);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-interaction-phase", "burst");
  view.rerender(<Harness view="home" />);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "extinguishing");
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-dark-handoff", "true");
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(decoration(".portfolio-candle-smoke")).toBeInTheDocument();
  advance(8300);
  expect(decoration(".portfolio-candle")).toHaveAttribute("data-candle-state", "off");
  expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
  expect(jest.getTimerCount()).toBe(0);
});

test("click origins follow the actual wick and compact screens receive fewer embers", () => {
  const originalWidth = window.innerWidth;
  window.innerWidth = 390;
  try {
    render(<Harness view="resume" />);
    jest.spyOn(decoration(".portfolio-candle"), "getBoundingClientRect").mockReturnValue({ left: 16, top: 740, width: 36, height: 97.5 });
    fireEvent.click(screen.getByRole("button", { name: "Create candle flame burst" }));
    const effect = decoration(".portfolio-candle-click");
    expect(parseFloat(effect.style.getPropertyValue("--click-origin-x"))).toBeCloseTo(34.375);
    expect(parseFloat(effect.style.getPropertyValue("--click-origin-y"))).toBeCloseTo(770.375);
    advance(330);
    expect(particles(".portfolio-candle-click__ember")).toHaveLength(6);
    fireEvent.scroll(window);
    expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
    expect(jest.getTimerCount()).toBe(0);
  } finally { window.innerWidth = originalWidth; }
});

test("full-motion surge reaches above the viewport from the measured wick", () => {
  render(<Harness view="resume" />);
  jest.spyOn(decoration(".portfolio-candle"), "getBoundingClientRect").mockReturnValue({ left: 56, top: 650, width: 96, height: 260 });
  fireEvent.click(screen.getByRole("button", { name: "Create candle flame burst" }));
  // This fixture puts the wick at y=731. The flame must reach past that distance
  // to keep its organic tip at the top of the viewport during the full phase.
  expect(parseFloat(decoration(".portfolio-candle-click").style.getPropertyValue("--click-fire-height"))).toBeGreaterThan(731);
});

test.each([
  ["desktop", 1440, { left: 56, top: 650, width: 96, height: 260 }, 731, 6],
  ["mobile", 390, { left: 16, top: 540, width: 36, height: 97.5 }, 570.375, 4],
])("%s smoke crosses above the viewport from its measured wick and finishes before the first strike", (layout, width, bounds, originY, count) => {
  const originalWidth = window.innerWidth;
  window.innerWidth = width;
  try {
    render(<Harness view="resume" />);
    jest.spyOn(decoration(".portfolio-candle"), "getBoundingClientRect").mockReturnValue(bounds);
    fireEvent.click(screen.getByRole("button", { name: "Create candle flame burst" }));
    expect(smokeArtwork()).toHaveLength(0);
    advance(1599);
    expect(smokeArtwork()).toHaveLength(0);
    advance(1);
    const effect = decoration(".portfolio-candle-click");
    expect(effect).toHaveAttribute("data-interaction-phase", "out");
    expect(Number.parseFloat(effect.style.getPropertyValue("--click-origin-y"))).toBe(originY);
    // The travel distance must independently exceed the known wick-to-top
    // distance; a short puff near the wick cannot satisfy this contract.
    expect(Number.parseFloat(effect.style.getPropertyValue("--click-smoke-rise"))).toBeLessThan(-originY);
    expect(particles(".portfolio-candle-click__smoke")).toHaveLength(count);
    expect(particles(".portfolio-candle-click__smoke-mote")).toHaveLength(count);
    smokeArtwork().forEach((particle) => {
      const delay = Number.parseFloat(particle.style.getPropertyValue("--click-smoke-delay"));
      const duration = Number.parseFloat(particle.style.getPropertyValue("--click-smoke-duration"));
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(duration).toBeGreaterThan(0);
      expect(delay + duration).toBe(1000);
    });
    expect(effect).toHaveAttribute("aria-hidden", "true");
    advance(999);
    expect(effect).toHaveAttribute("data-interaction-phase", "out");
    advance(1);
    expect(effect).toHaveAttribute("data-interaction-phase", "strike");
    expect(smokeArtwork()).toHaveLength(0);
    advance(780);
    expect(decoration(".portfolio-candle-click")).not.toBeInTheDocument();
    expect(jest.getTimerCount()).toBe(0);
  } finally { window.innerWidth = originalWidth; }
});
