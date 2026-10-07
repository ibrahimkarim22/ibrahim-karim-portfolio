import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import HomeCandle from "./HomeCandle";
import { PortfolioLightingContext, usePortfolioLighting } from "./portfolioLighting";

function CandleHarness({ initialView = "home" }) {
  const lighting = usePortfolioLighting(initialView);
  return (
    <PortfolioLightingContext.Provider value={lighting}>
      <div style={lighting.style}><HomeCandle /></div>
      <button onClick={() => lighting.selectTheme("home")}>Home lighting</button>
      <button onClick={() => lighting.selectTheme("projects")}>Projects lighting</button>
      <button onClick={() => lighting.selectTheme("resume")}>Resume lighting</button>
      <button onClick={() => lighting.selectTheme("3d-profile")}>Profile lighting</button>
      <button onClick={() => lighting.selectTheme("megaracer")}>Megaracer lighting</button>
    </PortfolioLightingContext.Provider>
  );
}

let originalMatchMedia;
let reduced = false;
const motionListeners = new Set();

beforeEach(() => {
  jest.useFakeTimers();
  reduced = false;
  originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => ({
    media: query,
    get matches() { return query === "(prefers-reduced-motion: reduce)" && reduced; },
    addEventListener: (_, listener) => motionListeners.add(listener),
    removeEventListener: (_, listener) => motionListeners.delete(listener),
  });
});

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
  motionListeners.clear();
  jest.clearAllTimers();
  jest.useRealTimers();
});

// The candle is decorative and hidden from assistive technology. Its stable
// animation nodes must survive real theme cycles without restarting the flame.
function candleParts(selector) {
  // eslint-disable-next-line testing-library/no-node-access
  return document.querySelectorAll(selector);
}

test("flame and breathing glow stay mounted across color changes and ignition cleanup", () => {
  render(<CandleHarness />);
  const flame = candleParts(".portfolio-candle__flame")[0];
  const glow = candleParts(".portfolio-candle__glow")[0];

  fireEvent.click(screen.getByRole("button", { name: "Resume lighting" }));
  expect(candleParts(".portfolio-candle__flame")[0]).toBe(flame);
  expect(candleParts(".portfolio-candle__glow")[0]).toBe(glow);
  expect(candleParts(".portfolio-candle__sparkle")).toHaveLength(14);

  act(() => jest.advanceTimersByTime(500));
  fireEvent.click(screen.getByRole("button", { name: "Profile lighting" }));
  expect(candleParts(".portfolio-candle__flame")[0]).toBe(flame);
  expect(candleParts(".portfolio-candle__glow")[0]).toBe(glow);
  act(() => jest.advanceTimersByTime(900));
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-light-phase", "settled");
  expect(candleParts(".portfolio-candle__sparkle")).toHaveLength(14);
  act(() => jest.advanceTimersByTime(1300));
  expect(candleParts(".portfolio-candle__sparkle")).toHaveLength(0);
  expect(candleParts(".portfolio-candle__flame")[0]).toBe(flame);
  expect(candleParts(".portfolio-candle__glow")[0]).toBe(glow);
});

test("reduced motion retains the same flame and glow during the short color transition", () => {
  reduced = true;
  render(<CandleHarness />);
  const flame = candleParts(".portfolio-candle__flame")[0];
  const glow = candleParts(".portfolio-candle__glow")[0];
  fireEvent.click(screen.getByRole("button", { name: "Resume lighting" }));
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-light-motion", "reduced");
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "igniting");
  expect(candleParts(".portfolio-candle__flame")[0]).toBe(flame);
  expect(candleParts(".portfolio-candle__glow")[0]).toBe(glow);
  expect(candleParts(".portfolio-candle__sparkle")).toHaveLength(0);
  act(() => jest.advanceTimersByTime(240));
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-light-phase", "settled");
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "lit");
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "extinguishing");
  act(() => jest.advanceTimersByTime(240));
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "off");
});

test("Home starts unlit with stable ambient nodes and no traveling particles", () => {
  render(<CandleHarness />);
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "off");
  expect(candleParts(".portfolio-candle__flame")).toHaveLength(1);
  expect(candleParts(".portfolio-candle__glow")).toHaveLength(1);
  expect(candleParts(".portfolio-candle__sparkle")).toHaveLength(0);
});

test.each([["projects", "Projects"], ["resume", "Resume"], ["3d-profile", "Profile"], ["megaracer", "Megaracer"]])("selecting %s from Home ignites and its portal burst outlives the color cycle", (_, label) => {
  render(<CandleHarness />);
  fireEvent.click(screen.getByRole("button", { name: `${label} lighting` }));
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "igniting");
  const burst = candleParts(".portfolio-candle-magic")[0];
  expect(burst).toHaveAttribute("aria-hidden", "true");
  // eslint-disable-next-line testing-library/no-node-access
  expect(burst.parentElement).toBe(document.body);
  expect(candleParts(".portfolio-candle__sparkle")).toHaveLength(14);
  act(() => jest.advanceTimersByTime(900));
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "lit");
  expect(candleParts(".portfolio-candle-magic")[0]).toBe(burst);
  act(() => jest.advanceTimersByTime(1300));
  expect(candleParts(".portfolio-candle-magic")).toHaveLength(0);
});

test.each(["projects", "resume", "3d-profile", "megaracer"])("direct entry with %s lighting is lit without an arrival burst", (initialView) => {
  render(<CandleHarness initialView={initialView} />);
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "lit");
  expect(candleParts(".portfolio-candle__sparkle")).toHaveLength(0);
});

test("returning to Home extinguishes without replacing ambient nodes and cancels the burst", () => {
  render(<CandleHarness />);
  const flame = candleParts(".portfolio-candle__flame")[0];
  const glow = candleParts(".portfolio-candle__glow")[0];
  fireEvent.click(screen.getByRole("button", { name: "Resume lighting" }));
  act(() => jest.advanceTimersByTime(900));
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "extinguishing");
  expect(candleParts(".portfolio-candle-magic")).toHaveLength(0);
  act(() => jest.advanceTimersByTime(900));
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "off");
  expect(candleParts(".portfolio-candle__flame")[0]).toBe(flame);
  expect(candleParts(".portfolio-candle__glow")[0]).toBe(glow);
});

test("reselecting a theme replays its burst and renews cleanup while keeping ambient nodes", () => {
  render(<CandleHarness />);
  const flame = candleParts(".portfolio-candle__flame")[0];
  const glow = candleParts(".portfolio-candle__glow")[0];
  fireEvent.click(screen.getByRole("button", { name: "Resume lighting" }));
  const burst = candleParts(".portfolio-candle-magic")[0];
  expect(burst).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(900));
  fireEvent.click(screen.getByRole("button", { name: "Resume lighting" }));
  const nextBurst = candleParts(".portfolio-candle-magic")[0];
  expect(nextBurst).not.toBe(burst);
  expect(nextBurst).toHaveAttribute("data-candle-burst", "2");
  expect(candleParts(".portfolio-candle__flame")[0]).toBe(flame);
  expect(candleParts(".portfolio-candle__glow")[0]).toBe(glow);
  act(() => jest.advanceTimersByTime(1300));
  expect(candleParts(".portfolio-candle-magic")[0]).toBe(nextBurst);
  act(() => jest.advanceTimersByTime(900));
  expect(candleParts(".portfolio-candle-magic")).toHaveLength(0);
});

test("rapid theme changes replace the burst and cancel the previous cleanup", () => {
  render(<CandleHarness />);
  fireEvent.click(screen.getByRole("button", { name: "Resume lighting" }));
  const burst = candleParts(".portfolio-candle-magic")[0];
  act(() => jest.advanceTimersByTime(800));
  fireEvent.click(screen.getByRole("button", { name: "Profile lighting" }));
  const nextBurst = candleParts(".portfolio-candle-magic")[0];
  expect(nextBurst).not.toBe(burst);
  act(() => jest.advanceTimersByTime(1400));
  expect(candleParts(".portfolio-candle-magic")[0]).toBe(nextBurst);
  act(() => jest.advanceTimersByTime(800));
  expect(candleParts(".portfolio-candle-magic")).toHaveLength(0);
});

test("changing to reduced motion cancels an in-flight burst without restarting it", () => {
  render(<CandleHarness />);
  fireEvent.click(screen.getByRole("button", { name: "Resume lighting" }));
  expect(candleParts(".portfolio-candle__sparkle")).toHaveLength(14);
  act(() => { reduced = true; motionListeners.forEach((listener) => listener({ matches: true })); });
  expect(candleParts(".portfolio-candle-magic")).toHaveLength(0);
  act(() => { reduced = false; motionListeners.forEach((listener) => listener({ matches: false })); });
  expect(candleParts(".portfolio-candle-magic")).toHaveLength(0);
});

test("unmount removes the portal and both finite cleanup timers", () => {
  const view = render(<CandleHarness />);
  fireEvent.click(screen.getByRole("button", { name: "Resume lighting" }));
  expect(candleParts(".portfolio-candle__sparkle")).toHaveLength(14);
  view.unmount();
  expect(candleParts(".portfolio-candle-magic")).toHaveLength(0);
  expect(jest.getTimerCount()).toBe(0);
});

test("the burst starts at the flame's position in the current candle bounds", () => {
  render(<CandleHarness />);
  jest.spyOn(candleParts(".portfolio-candle")[0], "getBoundingClientRect").mockReturnValue({ left: 80, top: 400, width: 80, height: 200 });
  fireEvent.click(screen.getByRole("button", { name: "Resume lighting" }));
  const burst = candleParts(".portfolio-candle-magic")[0];
  expect(burst.style.getPropertyValue("--magic-origin-x")).toBe("120px");
  expect(burst.style.getPropertyValue("--magic-origin-y")).toBe("440px");
});

test("an offscreen candle on a long Projects page emits from the visible bottom edge", () => {
  render(<CandleHarness initialView="projects" />);
  jest.spyOn(candleParts(".portfolio-candle")[0], "getBoundingClientRect").mockReturnValue({ left: 16, top: 3000, width: 56, height: 96 });
  fireEvent.click(screen.getByRole("button", { name: "Resume lighting" }));
  expect(candleParts(".portfolio-candle-magic")[0].style.getPropertyValue("--magic-origin-y")).toBe(`${window.innerHeight - 16}px`);
});

test("extinguishing emits wick smoke that outlives the flame fade and cleans up", () => {
  render(<CandleHarness initialView="resume" />);
  jest.spyOn(candleParts(".portfolio-candle")[0], "getBoundingClientRect").mockReturnValue({ left: 80, top: 400, width: 96, height: 260 });
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  const smoke = candleParts(".portfolio-candle-smoke")[0];
  expect(smoke).toBeInTheDocument();
  expect(smoke).toHaveAttribute("aria-hidden", "true");
  expect(smoke).toHaveAttribute("data-smoke-motion", "full");
  // eslint-disable-next-line testing-library/no-node-access
  expect(smoke.parentElement).toBe(document.body);
  expect(smoke.style.getPropertyValue("--smoke-origin-x")).toBe("129px");
  expect(smoke.style.getPropertyValue("--smoke-origin-y")).toBe("481px");
  expect(candleParts(".portfolio-candle__smoke-wisp")).toHaveLength(4);
  expect(candleParts(".portfolio-candle-magic")).toHaveLength(0);
  act(() => jest.advanceTimersByTime(900));
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "off");
  expect(candleParts(".portfolio-candle-smoke")[0]).toBe(smoke);
  act(() => jest.advanceTimersByTime(6500));
  expect(candleParts(".portfolio-candle-smoke")[0]).toBe(smoke);
  act(() => jest.advanceTimersByTime(900));
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(0);
});

test("cold Home and inactive Home activation do not emit smoke", () => {
  render(<CandleHarness />);
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(0);
  act(() => jest.advanceTimersByTime(900));
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(0);
});

test("another Home activation neither restarts smoke nor extends its deadline", () => {
  render(<CandleHarness initialView="projects" />);
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  const smoke = candleParts(".portfolio-candle-smoke")[0];
  expect(smoke).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(1000));
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  expect(candleParts(".portfolio-candle-smoke")[0]).toBe(smoke);
  act(() => jest.advanceTimersByTime(1500));
  expect(candleParts(".portfolio-candle-smoke")[0]).toBe(smoke);
  act(() => jest.advanceTimersByTime(5800));
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(0);
});

test("relighting cancels smoke and a later extinguish owns a fresh cleanup", () => {
  render(<CandleHarness initialView="projects" />);
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  const smoke = candleParts(".portfolio-candle-smoke")[0];
  expect(smoke).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(700));
  fireEvent.click(screen.getByRole("button", { name: "Resume lighting" }));
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(0);
  expect(candleParts(".portfolio-candle__sparkle")).toHaveLength(14);
  act(() => jest.advanceTimersByTime(600));
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  const nextSmoke = candleParts(".portfolio-candle-smoke")[0];
  expect(nextSmoke).toBeInTheDocument();
  expect(nextSmoke).not.toBe(smoke);
  act(() => jest.advanceTimersByTime(7000));
  expect(candleParts(".portfolio-candle-smoke")[0]).toBe(nextSmoke);
  act(() => jest.advanceTimersByTime(1300));
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(0);
});

test("reduced extinguishing shows one brief stationary wick wisp", () => {
  reduced = true;
  render(<CandleHarness initialView="resume" />);
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  const smoke = candleParts(".portfolio-candle-smoke")[0];
  expect(smoke).toBeInTheDocument();
  expect(smoke).toHaveAttribute("data-smoke-motion", "reduced");
  const wisps = candleParts(".portfolio-candle__smoke-wisp");
  expect(wisps).toHaveLength(1);
  expect(wisps[0].style.getPropertyValue("--smoke-rise")).toBe("0px");
  act(() => jest.advanceTimersByTime(240));
  expect(candleParts(".portfolio-candle")[0]).toHaveAttribute("data-candle-state", "off");
  expect(candleParts(".portfolio-candle-smoke")[0]).toBe(smoke);
  act(() => jest.advanceTimersByTime(360));
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(0);
});

test("enabling reduced motion cancels traveling smoke without replay on reenable", () => {
  render(<CandleHarness initialView="resume" />);
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  expect(candleParts(".portfolio-candle__smoke-wisp")).toHaveLength(4);
  act(() => { reduced = true; motionListeners.forEach((listener) => listener({ matches: true })); });
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(0);
  act(() => { reduced = false; motionListeners.forEach((listener) => listener({ matches: false })); });
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(0);
});

test("unmount removes extinguish smoke and its cleanup timer", () => {
  const view = render(<CandleHarness initialView="resume" />);
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(1);
  view.unmount();
  expect(candleParts(".portfolio-candle-smoke")).toHaveLength(0);
  expect(jest.getTimerCount()).toBe(0);
});

test("smoke uses the actual wick even when its candle is below the viewport", () => {
  render(<CandleHarness initialView="projects" />);
  jest.spyOn(candleParts(".portfolio-candle")[0], "getBoundingClientRect").mockReturnValue({ left: 16, top: 3000, width: 96, height: 260 });
  fireEvent.click(screen.getByRole("button", { name: "Home lighting" }));
  const smoke = candleParts(".portfolio-candle-smoke")[0];
  expect(smoke).toBeInTheDocument();
  expect(smoke.style.getPropertyValue("--smoke-origin-x")).toBe("65px");
  expect(smoke.style.getPropertyValue("--smoke-origin-y")).toBe("3081px");
});
