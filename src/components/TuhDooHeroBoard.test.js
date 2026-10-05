import { act, createEvent, fireEvent, render, screen } from "@testing-library/react";
import TuhDooHeroBoard from "./TuhDooHeroBoard";

let setVisible;
let setReduced;
let disconnect;
const originalObserver = window.IntersectionObserver;
const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  jest.useFakeTimers();
  disconnect = jest.fn();
  window.IntersectionObserver = class {
    constructor(callback) { setVisible = (visible) => callback([{ isIntersecting: visible, intersectionRatio: visible ? 1 : 0 }]); }
    observe() {}
    disconnect = disconnect;
  };
  window.matchMedia = () => ({ matches: false, addEventListener: (_, callback) => { setReduced = callback; }, removeEventListener: jest.fn() });
});

afterEach(() => {
  jest.useRealTimers();
  window.IntersectionObserver = originalObserver;
  window.matchMedia = originalMatchMedia;
});

const hero = () => screen.getByRole("img", { name: /Illustrated task workflow/ });
const advance = (milliseconds) => act(() => jest.advanceTimersByTime(milliseconds));
const card = (name) => screen.getByText(name);
// Presentation state is an observable DOM contract for these decorative cards.
// eslint-disable-next-line testing-library/no-node-access
const cardState = (name) => card(name).closest("[data-hero-column]").getAttribute("data-hero-column");

it("finishes the one-time opening before starting slow, single-card ambient moves", () => {
  render(<TuhDooHeroBoard />);
  act(() => setVisible(true));
  advance(2600);
  expect(hero()).toHaveAttribute("data-ambient-phase", "opening");
  advance(100);
  expect(hero()).toHaveAttribute("data-ambient-phase", "organized");
  advance(3199);
  expect(cardState("Sketch the layout")).toBe("0");
  advance(1);
  expect(hero()).toHaveAttribute("data-ambient-phase", "archive");
  advance(3200);
  expect(cardState("Sketch the layout")).toBe("1");
  advance(3200);
  expect(cardState("Sketch the layout")).toBe("2");
  advance(3200);
  expect(cardState("Plan the next step")).toBe("0");
});

it("pauses offscreen and resumes the remaining wait from the same logical state", () => {
  render(<TuhDooHeroBoard />);
  act(() => setVisible(true));
  advance(4700);
  act(() => setVisible(false));
  expect(jest.getTimerCount()).toBe(0);
  advance(30000);
  expect(hero()).toHaveAttribute("data-ambient-phase", "organized");
  act(() => setVisible(true));
  advance(1199);
  expect(hero()).toHaveAttribute("data-ambient-phase", "organized");
  advance(1);
  expect(hero()).toHaveAttribute("data-ambient-phase", "archive");
});

it("pauses in a hidden tab and cleans up its timer and observer on unmount", () => {
  const { unmount } = render(<TuhDooHeroBoard />);
  act(() => setVisible(true));
  advance(2700);
  Object.defineProperty(document, "hidden", { configurable: true, value: true });
  fireEvent(document, new Event("visibilitychange"));
  expect(jest.getTimerCount()).toBe(0);
  advance(30000);
  expect(hero()).toHaveAttribute("data-ambient-phase", "organized");
  Object.defineProperty(document, "hidden", { configurable: true, value: false });
  fireEvent(document, new Event("visibilitychange"));
  expect(jest.getTimerCount()).toBe(1);
  unmount();
  expect(jest.getTimerCount()).toBe(0);
  expect(disconnect).toHaveBeenCalled();
});

it("renders the final state immediately for reduced motion and never schedules ambient work", () => {
  window.matchMedia = () => ({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  render(<TuhDooHeroBoard />);
  expect(hero()).toHaveAttribute("data-ambient-phase", "organized");
  advance(60000);
  expect(cardState("Sketch the layout")).toBe("0");
  expect(jest.getTimerCount()).toBe(0);
});

it("stops ambient motion immediately when the motion preference changes", () => {
  render(<TuhDooHeroBoard />);
  act(() => setVisible(true));
  advance(12300);
  expect(cardState("Sketch the layout")).toBe("2");
  act(() => setReduced({ matches: true }));
  expect(hero()).toHaveAttribute("data-ambient-phase", "organized");
  expect(cardState("Sketch the layout")).toBe("0");
  expect(jest.getTimerCount()).toBe(0);
});

it("uses animation completion to settle early without replaying the opening on visibility changes", () => {
  render(<TuhDooHeroBoard />);
  act(() => setVisible(true));
  const event = createEvent.animationEnd(hero());
  Object.defineProperty(event, "animationName", { value: "td-card-sort" });
  fireEvent(hero(), event);
  expect(hero()).toHaveAttribute("data-ambient-phase", "organized");
  act(() => setVisible(false));
  act(() => setVisible(true));
  expect(hero()).toHaveAttribute("data-ambient-phase", "organized");
});
