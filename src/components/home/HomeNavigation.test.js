import { act, cleanup, createEvent, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import Home from "../../screens/Home";
import HomeNavigation from "./HomeNavigation";

jest.mock("../Logo", () => function Logo() { return <div aria-label="Portfolio logo" />; });
jest.mock("../profile/ThreeDProfileView", () => function Profile() { return <div aria-label="Interactive 3D profile" />; });

function NavigationHarness({ isNarrowLayout = true, initialView = "projects", routeKey, onBack = jest.fn() }) {
  const [activeView, setActiveView] = useState(initialView);
  const [lighting, setLighting] = useState(initialView);
  const [lightingActivations, setLightingActivations] = useState(0);
  const [megaracerSelections, setMegaracerSelections] = useState(0);
  const previousViewRef = useRef(activeView);
  const headingRef = useRef(null);

  useEffect(() => {
    if (previousViewRef.current === activeView) return;
    previousViewRef.current = activeView;
    const frame = requestAnimationFrame(() => headingRef.current.focus());
    return () => cancelAnimationFrame(frame);
  }, [activeView]);

  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>{activeView} destination</h1>
      <HomeNavigation
        activeView={activeView}
        routeKey={routeKey}
        isNarrowLayout={isNarrowLayout}
        onToggleProjects={() => setActiveView("projects")}
        onToggleResume={() => setActiveView("resume")}
        onToggleThreeDProfile={() => setActiveView("3d-profile")}
        onToggleMegaracer={() => { setMegaracerSelections((count) => count + 1); setActiveView("megaracer"); }}
        onBackHome={() => setActiveView("home")}
        onBack={onBack}
        onLightingSelect={(view) => { setLighting(view); setLightingActivations((count) => count + 1); }}
      />
      <output aria-label="Selected lighting">{lighting}</output>
      <output aria-label="Lighting activations">{lightingActivations}</output>
      <output aria-label="Megaracer selections">{megaracerSelections}</output>
      <button type="button">Outside navigation</button>
    </>
  );
}

let originalHeight;
let originalMatchMedia;
let originalOverflow;
let originalPriority;

beforeEach(() => {
  jest.useFakeTimers();
  originalHeight = window.innerHeight;
  originalMatchMedia = window.matchMedia;
  originalOverflow = document.body.style.getPropertyValue("overflow");
  originalPriority = document.body.style.getPropertyPriority("overflow");
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 900, writable: true });
  window.matchMedia = jest.fn((query) => ({
    matches: query === "(max-width: 1250px)",
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
});

afterEach(() => {
  cleanup();
  Object.defineProperty(window, "innerHeight", { configurable: true, value: originalHeight, writable: true });
  window.matchMedia = originalMatchMedia;
  document.body.style.setProperty("overflow", originalOverflow, originalPriority);
  jest.clearAllTimers();
  jest.useRealTimers();
});

function openIndex(user) {
  return user.click(screen.getByRole("button", { name: "Navigate" }));
}

function emulateKeyboardFocusVisible(control) {
  // JSDOM reports :focus-visible false even after keyboard focus; emulate the
  // native browser state without replacing the actual keyboard/focus events.
  const matches = control.matches.bind(control);
  jest.spyOn(control, "matches").mockImplementation((selector) => selector === ":focus-visible" || matches(selector));
}

function decorativeHomePart(control, selector) {
  // The moon is deliberately hidden from accessible queries; stable animation
  // layers must survive label feedback and actual Home navigation.
  // eslint-disable-next-line testing-library/no-node-access
  return control.querySelector(selector);
}

function navigationSvgs(control) {
  // Decorative SVGs are deliberately excluded from accessible image queries.
  // eslint-disable-next-line testing-library/no-node-access
  return control.querySelectorAll("svg");
}

function destinationWord(control) {
  // Query the painted text layer so hover, focus and repeated activation cannot
  // silently remount it or swap in old decorative lettering.
  // eslint-disable-next-line testing-library/no-node-access
  return control.querySelector(".navigation-word");
}

function expectPlainDestination(control, label) {
  expect(control).toHaveAccessibleName(label);
  const word = destinationWord(control);
  expect(word).toHaveTextContent(label === "3D Profile" ? "3D profile" : label);
  expect(control).not.toHaveAttribute("data-motion-phase");
  expect(control).not.toHaveAttribute("data-motion-source");
  expect(word).not.toHaveAttribute("data-motion-finish");
  // Mechanical glyph fittings remain; retired independent art never returns.
  // eslint-disable-next-line testing-library/no-node-access
  expect(control.querySelectorAll(".navigation-project-letter, .navigation-document-assembly, .navigation-document-page, .navigation-channel, .navigation-racer-spell, .navigation-print-marker, .navigation-stereo-register, .navigation-racer-sigil, .navigation-wheel__glyph")).toHaveLength(0);
}

function navigationFrames(control) {
  // A navigation hover must never create an embedded network profile.
  // eslint-disable-next-line testing-library/no-node-access
  return control.querySelectorAll("iframe");
}

test.each([["home", false], ["projects", false], ["home", true]])("%s artwork navigation at narrow=%s exposes one shared Home control first", (initialView, isNarrowLayout) => {
  render(<NavigationHarness initialView={initialView} isNarrowLayout={isNarrowLayout} />);
  const nav = screen.getByRole("navigation", { name: "Portfolio navigation" });
  const home = within(nav).getByRole("button", { name: "Home", exact: true });
  expect(home).toHaveClass("navigation-home");
  expect(home).toHaveAttribute("type", "button");
  expect(within(nav).getAllByRole("button")[0]).toBe(home);
  expect(screen.getAllByRole("button", { name: "Home", exact: true })).toHaveLength(1);
});

test("compact navigation puts Home inside the wheel and selecting it restores Home lighting and focus", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness />);
  expect(screen.queryByRole("button", { name: "Home", exact: true })).not.toBeInTheDocument();
  await openIndex(user);
  const dialog = screen.getByRole("dialog", { name: "Choose a destination" });
  const home = within(dialog).getByRole("button", { name: "Home", exact: true });
  await user.click(home);
  act(() => jest.advanceTimersByTime(20));
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("home");
  expect(screen.getByRole("heading", { name: "home destination" })).toHaveFocus();
});

test("Home press feedback restarts on repeated pointer and keyboard activation without replacing its button", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="home" isNarrowLayout={false} />);
  const home = screen.getByRole("button", { name: "Home", exact: true });
  emulateKeyboardFocusVisible(home);
  await user.click(home);
  expect(home).toHaveAttribute("data-home-activation", "2");
  await user.keyboard("{Enter}");
  expect(home).toHaveAttribute("data-home-activation", "3");
  await user.keyboard(" ");
  expect(home).toHaveAttribute("data-home-activation", "4");
  expect(screen.getByRole("button", { name: "Home", exact: true })).toBe(home);
  expect(screen.getByRole("heading", { name: "home destination" })).toBeInTheDocument();
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("home");
});

test("artwork Home hover replays its pulse without selecting lighting or navigating", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness isNarrowLayout={false} />);
  const home = screen.getByRole("button", { name: "Home", exact: true });
  await user.hover(home);
  expect(home).toHaveAttribute("data-home-activation", "1");
  await user.unhover(home);
  await user.hover(home);
  expect(home).toHaveAttribute("data-home-activation", "2");
  expect(screen.getByRole("button", { name: "Home", exact: true })).toBe(home);
  expect(screen.getByRole("heading", { name: "projects destination" })).toBeInTheDocument();
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("projects");
});

test("the decorative moon shares Home's target and keeps its animation nodes through hover, focus and click", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness isNarrowLayout={false} />);
  const home = screen.getByRole("button", { name: "Home", exact: true });
  emulateKeyboardFocusVisible(home);
  const selectors = [".navigation-home__activation", ".navigation-home__moon", ".navigation-home__moonlight", ".navigation-home__moon-float", ".navigation-home__moon-scale", ".navigation-home__moon-icon", ".navigation-home__moon-drift"];
  const parts = selectors.map((selector) => decorativeHomePart(home, selector));
  expect(parts.every(Boolean)).toBe(true);
  const moon = parts[1];
  expect(moon).toHaveAttribute("aria-hidden", "true");
  expect(parts[5]).toHaveAttribute("focusable", "false");
  expect(parts[6].tagName.toLowerCase()).toBe("g");
  expect(within(home).queryByRole("img")).not.toBeInTheDocument();
  const originalLabel = within(home).getByText("Home", { selector: ".navigation-home__label" });

  await user.hover(moon);
  expect(home).toHaveAttribute("data-home-activation", "1");
  expect(within(home).getByText("Home", { selector: ".navigation-home__label" })).toBe(originalLabel);
  selectors.forEach((selector, index) => expect(decorativeHomePart(home, selector)).toBe(parts[index]));
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("projects");

  await user.tab();
  expect(home).toHaveFocus();
  expect(home).toHaveAttribute("data-home-activation", "2");
  selectors.forEach((selector, index) => expect(decorativeHomePart(home, selector)).toBe(parts[index]));
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("projects");

  await user.click(moon);
  act(() => jest.advanceTimersByTime(20));
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("home");
  expect(screen.getByRole("heading", { name: "home destination" })).toHaveFocus();
  expect(screen.getByRole("button", { name: "Home", exact: true })).toBe(home);
  selectors.forEach((selector, index) => expect(decorativeHomePart(home, selector)).toBe(parts[index]));
});

test("keyboard focus pulses Home before native activation selects it", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness isNarrowLayout={false} />);
  const home = screen.getByRole("button", { name: "Home", exact: true });
  emulateKeyboardFocusVisible(home);
  await user.tab();
  expect(home).toHaveFocus();
  expect(home).toHaveAttribute("data-home-activation", "1");
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("projects");
  expect(screen.getByRole("heading", { name: "projects destination" })).toBeInTheDocument();
  await user.keyboard("{Enter}");
  expect(home).toHaveAttribute("data-home-activation", "2");
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("home");
});

test("touch pointer entry does not simulate Home hover feedback", () => {
  render(<NavigationHarness isNarrowLayout={false} />);
  const home = screen.getByRole("button", { name: "Home", exact: true });
  const event = createEvent.pointerOver(home);
  Object.defineProperty(event, "pointerType", { value: "touch" });
  fireEvent(home, event);
  expect(home).toHaveAttribute("data-home-activation", "0");
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("projects");
});

test.each(["pointer", "keyboard"])("Megaracer activation keeps its readable lettering and native button for %s input", async (source) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="megaracer" isNarrowLayout={false} />);
  const racer = screen.getByRole("button", { name: "Megaracer", exact: true });
  const word = destinationWord(racer);
  expectPlainDestination(racer, "Megaracer");
  if (source === "pointer") await user.hover(word);
  else for (let index = 0; index < 5; index += 1) await user.tab();
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
  if (source === "pointer") await user.click(racer);
  else await user.keyboard("{Enter}");
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("1");
  expect(screen.getByLabelText("Megaracer selections")).toHaveTextContent("0");
  expect(screen.getByRole("button", { name: "Megaracer", exact: true })).toBe(racer);
  expect(destinationWord(racer)).toBe(word);
  expectPlainDestination(racer, "Megaracer");
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  if (source === "pointer") await user.unhover(racer);
  else await user.tab();
  expect(destinationWord(racer)).toBe(word);
});

test.each([false, true])("navigation retains one Home moon and plain destination labels at narrow=%s", async (isNarrowLayout) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness isNarrowLayout={isNarrowLayout} />);
  if (isNarrowLayout) await openIndex(user);
  const scope = within(isNarrowLayout
    ? screen.getByRole("dialog", { name: "Choose a destination" })
    : screen.getByRole("navigation", { name: "Portfolio navigation" }));
  const home = scope.getByRole("button", { name: "Home", exact: true });
  const moon = decorativeHomePart(home, ".navigation-home__moon-icon");
  expect(navigationSvgs(home)).toHaveLength(1);
  expect(moon).toBeInTheDocument();
  const destinations = ["Projects", "Resume", "3D Profile", "Megaracer"]
    .map((name) => ({ name, control: scope.getByRole("button", { name, exact: true }) }));
  await user.tab();
  expect(home).toHaveFocus();
  for (const { control, name } of destinations) {
    const word = destinationWord(control);
    await user.tab();
    expect(control).toHaveFocus();
    expectPlainDestination(control, name);
    await user.hover(control);
    expectPlainDestination(control, name);
    await user.unhover(control);
    expect(destinationWord(control)).toBe(word);
  }
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
  expect(screen.getByRole("heading", { name: "projects destination" })).toBeInTheDocument();
  expect(navigationSvgs(home)).toHaveLength(1);
  expect(decorativeHomePart(home, ".navigation-home__moon-icon")).toBe(moon);
});

test.each([false, true])("Projects retains one accessible label and glyph attachment without a split letter fan at narrow=%s", async (isNarrowLayout) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness isNarrowLayout={isNarrowLayout} />);
  if (isNarrowLayout) await openIndex(user);
  const projects = screen.getByRole("button", { name: "Projects", exact: true });
  const word = destinationWord(projects);
  expect(projects).toHaveAttribute("aria-label", "Projects");
  expectPlainDestination(projects, "Projects");
  await user.hover(projects);
  expect(screen.getAllByRole("button", { name: "Projects", exact: true })).toEqual([projects]);
  expect(destinationWord(projects)).toBe(word);
  expectPlainDestination(projects, "Projects");
  await user.unhover(projects);
  expect(destinationWord(projects)).toBe(word);
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
});

test.each([["home", false], ["home", true], ["projects", true]])("destination titles retain the lighting palette at %s narrow=%s", async (initialView, isNarrowLayout) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView={initialView} isNarrowLayout={isNarrowLayout} />);
  if (initialView === "projects" && isNarrowLayout) await openIndex(user);
  for (const [name, color] of [["Projects", "#b92436"], ["3D Profile", "#ffb45e"], ["Megaracer", "#c6ff00"]]) {
    expect(screen.getByRole("button", { name, exact: true }).style.getPropertyValue("--destination-source")).toBe(color);
  }
});

test("hover, focus and shell rerenders preserve destination lettering without activating the lamp", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const { rerender } = render(<NavigationHarness initialView="home" isNarrowLayout={false} />);
  const projects = screen.getByRole("button", { name: "Projects" });
  const word = destinationWord(projects);
  await user.hover(projects);
  rerender(<NavigationHarness initialView="home" isNarrowLayout={false} routeKey="rerendered" />);
  expect(screen.getByRole("button", { name: "Projects" })).toBe(projects);
  expect(destinationWord(projects)).toBe(word);
  await user.unhover(projects);
  await user.tab();
  await user.tab();
  expect(projects).toHaveFocus();
  expectPlainDestination(projects, "Projects");
  expect(destinationWord(projects)).toBe(word);
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
  expect(screen.getByRole("heading", { name: "home destination" })).toBeInTheDocument();
});

test("moving between titles and old animation completion events cannot trigger navigation or lighting", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="home" isNarrowLayout={false} />);
  const projects = screen.getByRole("button", { name: "Projects" });
  const resume = screen.getByRole("button", { name: "Resume" });
  await user.hover(projects);
  await user.hover(resume);
  fireEvent.animationEnd(destinationWord(projects), { animationName: "navigation-projects-settle" });
  fireEvent.animationEnd(destinationWord(resume), { animationName: "navigation-document-word" });
  expectPlainDestination(projects, "Projects");
  expectPlainDestination(resume, "Resume");
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
  expect(screen.getByRole("heading", { name: "home destination" })).toBeInTheDocument();
});

test.each([false, true])("Megaracer hover at narrow=%s preserves its label without selecting a view or loading a profile", async (isNarrowLayout) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="home" isNarrowLayout={isNarrowLayout} />);
  const nav = screen.getByRole("navigation", { name: "Portfolio navigation" });
  const racer = screen.getByRole("button", { name: "Megaracer" });
  const word = destinationWord(racer);
  await user.hover(racer);
  expectPlainDestination(racer, "Megaracer");
  expect(destinationWord(racer)).toBe(word);
  expect(screen.getByRole("heading", { name: "home destination" })).toBeInTheDocument();
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("home");
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
  expect(screen.getByLabelText("Megaracer selections")).toHaveTextContent("0");
  expect(within(nav).queryByRole("link")).not.toBeInTheDocument();
  expect(navigationFrames(nav)).toHaveLength(0);
  await user.hover(screen.getByRole("button", { name: "Outside navigation" }));
  expect(destinationWord(racer)).toBe(word);
});

test.each(["Projects", "Resume", "3D Profile", "Megaracer"])("%s keyboard focus and decorative attachment add no navigation or focus stop", async (name) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="home" isNarrowLayout={false} />);
  const control = screen.getByRole("button", { name, exact: true });
  const word = destinationWord(control);
  for (let index = 0; index < 5 && document.activeElement !== control; index += 1) await user.tab();
  expect(control).toHaveFocus();
  expectPlainDestination(control, name);
  // Fittings are decorative parts of the existing button, never extra tab stops.
  // eslint-disable-next-line testing-library/no-node-access
  expect(control.querySelectorAll("button, a, [tabindex], input, select, textarea")).toHaveLength(0);
  expect(destinationWord(control)).toBe(word);
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
  expect(screen.getByRole("heading", { name: "home destination" })).toBeInTheDocument();
});

test("window blur preserves plain destination lettering without a held visual state", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="home" isNarrowLayout={false} />);
  const racer = screen.getByRole("button", { name: "Megaracer" });
  const word = destinationWord(racer);
  await user.hover(racer);
  fireEvent.blur(window);
  expectPlainDestination(racer, "Megaracer");
  expect(destinationWord(racer)).toBe(word);
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
});

test("reduced motion retains readable titles and native activation without an animation completion event", async () => {
  window.matchMedia = jest.fn((query) => ({ matches: query === "(prefers-reduced-motion: reduce)", media: query, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="home" isNarrowLayout={false} />);
  const racer = screen.getByRole("button", { name: "Megaracer" });
  await user.hover(racer);
  expectPlainDestination(racer, "Megaracer");
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
  await user.click(racer);
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("1");
  expect(screen.getByRole("heading", { name: "megaracer destination" })).toBeInTheDocument();
  expectPlainDestination(racer, "Megaracer");
});

test("touch press and release retain the same readable word and activate only on native click", () => {
  render(<NavigationHarness initialView="home" isNarrowLayout={false} />);
  const racer = screen.getByRole("button", { name: "Megaracer" });
  const word = destinationWord(racer);
  for (const create of [createEvent.pointerDown, createEvent.pointerUp]) {
    const event = create(racer);
    Object.defineProperty(event, "pointerType", { value: "touch" });
    fireEvent(racer, event);
    expectPlainDestination(racer, "Megaracer");
    expect(destinationWord(racer)).toBe(word);
    expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
  }
  fireEvent.click(racer);
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("1");
  expect(destinationWord(racer)).toBe(word);
});

test("changing reduced motion preserves destination focus and does not replay lighting", async () => {
  const listeners = new Set();
  const reducedMedia = { matches: false, media: "(prefers-reduced-motion: reduce)", addEventListener: (event, handler) => listeners.add(handler), removeEventListener: (event, handler) => listeners.delete(handler) };
  window.matchMedia = jest.fn((query) => query === reducedMedia.media ? reducedMedia : { matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="home" isNarrowLayout={false} />);
  const resume = screen.getByRole("button", { name: "Resume" });
  const word = destinationWord(resume);
  await user.tab();
  await user.tab();
  await user.tab();
  expect(resume).toHaveFocus();
  act(() => { reducedMedia.matches = true; listeners.forEach((handler) => handler({ matches: true })); });
  expect(resume).toHaveFocus();
  expectPlainDestination(resume, "Resume");
  expect(destinationWord(resume)).toBe(word);
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
  await user.keyboard("{Enter}");
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("1");
  expect(screen.getByRole("heading", { name: "resume destination" })).toBeInTheDocument();
});

test.each(["pointer", "Enter", "Space"])("native %s activation selects the Megaracer center view and lights it once", async (source) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="home" isNarrowLayout={false} />);
  const title = screen.getByRole("button", { name: "Megaracer" });
  expect(title).toHaveAttribute("type", "button");
  expect(title).toHaveAttribute("aria-controls", "megaracer-view");
  expect(title).toHaveAttribute("aria-expanded", "false");
  expect(title).toHaveAttribute("aria-pressed", "false");
  expect(title).not.toHaveAttribute("href");
  expect(title).not.toHaveAttribute("target");
  if (source === "pointer") await user.click(title);
  else {
    for (let index = 0; index < 5; index += 1) await user.tab();
    await user.keyboard(source === "Enter" ? "{Enter}" : " ");
  }
  act(() => jest.advanceTimersByTime(20));
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("megaracer");
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("1");
  expect(screen.getByLabelText("Megaracer selections")).toHaveTextContent("1");
  expect(screen.getByRole("heading", { name: "megaracer destination" })).toHaveFocus();
  expect(screen.getByRole("button", { name: "Megaracer", exact: true })).toBe(title);
  expect(title).toHaveAttribute("aria-expanded", "true");
  expect(title).toHaveAttribute("aria-pressed", "true");
  expect(title).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("button", { name: "Projects" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(navigationFrames(screen.getByRole("navigation", { name: "Portfolio navigation" }))).toHaveLength(0);
});

test("keyboard focus passes directly from Megaracer to the next control without a popup or decorative stop", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="home" isNarrowLayout={false} />);
  const title = screen.getByRole("button", { name: "Megaracer" });
  await user.tab();
  await user.tab();
  await user.tab();
  await user.tab();
  await user.tab();
  expect(title).toHaveFocus();
  expectPlainDestination(title, "Megaracer");
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  await user.tab();
  expect(screen.getByRole("button", { name: "Outside navigation" })).toHaveFocus();
  expectPlainDestination(title, "Megaracer");
});

test("repeated selected Megaracer activation replays lighting once per press without selecting the route again", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="megaracer" isNarrowLayout={false} />);
  const title = screen.getByRole("button", { name: "Megaracer" });
  await user.click(title);
  await user.click(title);
  expectPlainDestination(title, "Megaracer");
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("2");
  await user.keyboard("{Enter}");
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("3");
  expect(screen.getByLabelText("Megaracer selections")).toHaveTextContent("0");
  expect(screen.getByRole("heading", { name: "megaracer destination" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Megaracer", exact: true })).toBe(title);
  expect(title).toHaveAttribute("aria-current", "page");
});

test("Megaracer selection closes the narrow wheel and hands focus to its destination heading", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness />);
  await openIndex(user);
  const dialog = screen.getByRole("dialog", { name: "Choose a destination" });
  await user.click(within(dialog).getByRole("button", { name: "Megaracer" }));
  act(() => jest.advanceTimersByTime(20));
  expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("megaracer");
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("1");
  expect(screen.getByRole("heading", { name: "megaracer destination" })).toHaveFocus();
  expect(screen.getByRole("button", { name: "Navigate" })).not.toHaveFocus();
  expect(document.body).not.toHaveClass("modal-open");
});

test("the first complete Escape press from Megaracer focus closes the index and restores Navigate", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness />);
  await openIndex(user);
  const dialog = screen.getByRole("dialog", { name: "Choose a destination" });
  const title = within(dialog).getByRole("button", { name: "Megaracer" });
  act(() => title.focus());
  expect(title).toHaveFocus();

  const escape = { key: "Escape", code: "Escape", keyCode: 27, which: 27 };
  fireEvent.keyDown(title, escape);
  fireEvent.keyUp(title, escape);
  expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Navigate" })).toHaveFocus();
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
});

test.each([["projects", "Projects"], ["resume", "Resume"], ["3d-profile", "3D Profile"]])("returning from Megaracer to %s restores its section lighting", async (view, label) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView={view} isNarrowLayout={false} />);
  await user.click(screen.getByRole("button", { name: "Megaracer" }));
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("megaracer");
  await user.click(screen.getByRole("button", { name: label }));
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent(view);
  expect(screen.getByRole("heading", { name: `${view} destination` })).toBeInTheDocument();
});

test("choosing the current Megaracer in the sheet restores Navigate and replays only its lighting", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="megaracer" />);
  await openIndex(user);
  const racer = within(screen.getByRole("dialog", { name: "Choose a destination" })).getByRole("button", { name: "Megaracer" });
  expect(racer).toHaveAttribute("aria-current", "page");
  expect(racer).toHaveAttribute("aria-pressed", "true");
  expect(racer).toHaveAttribute("aria-expanded", "true");
  await user.click(racer);
  expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Navigate" })).toHaveFocus();
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("1");
  expect(screen.getByLabelText("Megaracer selections")).toHaveTextContent("0");
});

test("narrow Home keeps the native destinations visible while internal pages use a single dialog trigger", () => {
  const { rerender } = render(<NavigationHarness initialView="home" />);
  const nav = screen.getByRole("navigation", { name: "Portfolio navigation" });
  ["Projects", "Resume", "3D Profile"].forEach((name) => expect(within(nav).getByRole("button", { name })).toBeEnabled());
  expect(within(nav).getByRole("button", { name: "Megaracer" })).toHaveAttribute("type", "button");
  expect(within(nav).queryByRole("button", { name: "Navigate" })).not.toBeInTheDocument();
  rerender(<NavigationHarness key="internal" initialView="projects" />);
  expect(screen.queryByRole("button", { name: "Projects" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Navigate" })).toHaveAttribute("aria-haspopup", "dialog");
});

test("the compact wheel identifies the current destination and contains all five native destination controls", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness />);
  await openIndex(user);
  const dialog = screen.getByRole("dialog", { name: "Choose a destination" });
  expect(dialog).toHaveAttribute("aria-modal", "true");
  const current = within(dialog).getByRole("button", { name: "Projects" });
  expect(current).toHaveAttribute("aria-current", "page");
  expect(current).toHaveAttribute("aria-pressed", "true");
  expect(within(dialog).getByRole("button", { name: "Resume" })).toHaveAttribute("aria-pressed", "false");
  const racer = within(dialog).getByRole("button", { name: "Megaracer" });
  expect(racer).toHaveAttribute("aria-controls", "megaracer-view");
  expect(racer).toHaveAttribute("aria-pressed", "false");
  expect(racer).toHaveAttribute("aria-expanded", "false");
  expect(racer).not.toHaveAttribute("href");
  expect(racer).not.toHaveAttribute("target");
  expect(within(dialog).queryByRole("link")).not.toBeInTheDocument();
  expect(navigationFrames(dialog)).toHaveLength(0);
  const home = within(dialog).getByRole("button", { name: "Home", exact: true });
  expect(home).toHaveClass("navigation-home");
  expect(screen.getAllByRole("button", { name: "Home", exact: true })).toHaveLength(1);
  ["Home", "Projects", "Resume", "3D Profile", "Megaracer"].forEach((name) => {
    expect(within(dialog).getByRole("button", { name, exact: true })).toHaveAttribute("type", "button");
  });
  expect(within(dialog).getAllByRole("button")).toHaveLength(6);
  // Reactstrap places the controlled id on its nested modal-dialog container.
  // eslint-disable-next-line testing-library/no-node-access
  expect(dialog).toContainElement(document.getElementById("portfolio-navigation-dialog"));
  expect(within(dialog).getByRole("button", { name: "Close navigation" })).toHaveFocus();
  expect(document.body).toHaveClass("modal-open");
});

test.each(["Close navigation", "Projects", "Escape", "backdrop"])("closing the wheel with %s restores the visible trigger", async (method) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness />);
  const trigger = screen.getByRole("button", { name: "Navigate" });
  await openIndex(user);
  const dialog = screen.getByRole("dialog", { name: "Choose a destination" });
  if (method === "Escape") fireEvent.keyUp(within(dialog).getByRole("button", { name: "Close navigation" }), { key: "Escape", code: "Escape", keyCode: 27, which: 27 });
  else if (method === "backdrop") await user.click(dialog);
  else await user.click(within(dialog).getByRole("button", { name: method }));
  expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(document.body).not.toHaveClass("modal-open");
  expect(screen.getByRole("heading", { name: "projects destination" })).toBeInTheDocument();
});

test("the wheel traps focus inside Close and all five destinations while the page stays behind it", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness />);
  await openIndex(user);
  const dialog = screen.getByRole("dialog", { name: "Choose a destination" });
  const close = within(dialog).getByRole("button", { name: "Close navigation" });
  const racer = within(dialog).getByRole("button", { name: "Megaracer" });
  fireEvent.keyDown(close, { key: "Tab", keyCode: 9, which: 9, shiftKey: true });
  expect(racer).toHaveFocus();
  fireEvent.keyDown(racer, { key: "Tab", keyCode: 9, which: 9 });
  expect(close).toHaveFocus();
  screen.getByRole("button", { name: "Outside navigation", exact: true }).focus();
  expect(close).toHaveFocus();
});

test("the compact header contains only Navigate and Go back, without a separate Home shortcut", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const onBack = jest.fn();
  render(<NavigationHarness onBack={onBack} />);
  const nav = screen.getByRole("navigation", { name: "Portfolio navigation" });
  const trigger = within(nav).getByRole("button", { name: "Navigate", exact: true });
  expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  expect(trigger).toHaveAttribute("aria-controls", "portfolio-navigation-dialog");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(within(nav).queryByRole("button", { name: "Home", exact: true })).not.toBeInTheDocument();
  expect(within(nav).getAllByRole("button")).toHaveLength(2);
  await user.click(within(nav).getByRole("button", { name: "Go back", exact: true }));
  expect(onBack).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("0");
});

test("shared Home leaves the Megaracer section, extinguishes its theme and focuses Home", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness initialView="megaracer" isNarrowLayout={false} />);
  await user.click(screen.getByRole("button", { name: "Home", exact: true }));
  act(() => jest.advanceTimersByTime(20));
  expect(screen.getByRole("heading", { name: "home destination" })).toHaveFocus();
  expect(screen.getByLabelText("Selected lighting")).toHaveTextContent("home");
  expect(screen.getByLabelText("Lighting activations")).toHaveTextContent("1");
  expect(screen.getByRole("button", { name: "Megaracer" })).toHaveAttribute("aria-pressed", "false");
});

test.each([["Home", "home"], ["Resume", "resume"], ["3D Profile", "3d-profile"], ["Megaracer", "megaracer"]])("choosing %s closes the wheel and lets the destination heading receive focus", async (label, view) => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness />);
  await openIndex(user);
  await user.click(within(screen.getByRole("dialog", { name: "Choose a destination" })).getByRole("button", { name: label }));
  act(() => jest.advanceTimersByTime(20));
  expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: `${view} destination` })).toHaveFocus();
});

test("widening an open wheel closes it and focuses the visible current destination", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const { rerender } = render(<NavigationHarness />);
  await openIndex(user);
  rerender(<NavigationHarness isNarrowLayout={false} />);
  expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Projects" })).toHaveFocus();
  expect(document.body).not.toHaveClass("modal-open");
  expect(navigationFrames(screen.getByRole("navigation", { name: "Portfolio navigation" }))).toHaveLength(0);
});

test("a history entry change within Projects dismisses the index without restoring trigger focus", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const { rerender } = render(<NavigationHarness routeKey="projects-index" />);
  await openIndex(user);
  expect(screen.getByRole("dialog", { name: "Choose a destination" })).toBeInTheDocument();
  rerender(<NavigationHarness routeKey="project-detail" />);
  expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Navigate" })).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("button", { name: "Navigate" })).not.toHaveFocus();
  expect(screen.getByRole("heading", { name: "projects destination" })).toBeInTheDocument();
});

test("short desktop viewports use the compact wheel and restore visible navigation when height increases", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  window.innerHeight = 700;
  render(<NavigationHarness isNarrowLayout={false} />);
  await openIndex(user);
  act(() => { window.innerHeight = 701; window.dispatchEvent(new Event("resize")); });
  expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Projects" })).toHaveFocus();
});

test("resizing within the compact layout dismisses the sheet and restores its still-visible trigger", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<NavigationHarness />);
  await openIndex(user);
  act(() => { window.innerHeight = 850; window.dispatchEvent(new Event("resize")); });
  expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Navigate" })).toHaveFocus();
  expect(document.body).not.toHaveClass("modal-open");
});

test("wheel Home restores Home's original inline overflow and priority", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  document.body.style.setProperty("overflow", "auto", "important");
  render(<MemoryRouter initialEntries={["/projects"]}><Home /></MemoryRouter>);
  await openIndex(user);
  await user.click(within(screen.getByRole("dialog", { name: "Choose a destination" })).getByRole("button", { name: "Home", exact: true }));
  act(() => jest.advanceTimersByTime(20));
  expect(screen.getByRole("heading", { name: "Home view" })).toHaveFocus();
  expect(document.body).not.toHaveClass("modal-open", "portfolio-bounded-view-open");
  expect(document.body.style.getPropertyValue("overflow")).toBe("auto");
  expect(document.body.style.getPropertyPriority("overflow")).toBe("important");
});

test("closing the Resume index leaves body locking to the bounded shell instead of a stale modal inline value", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  document.body.style.setProperty("overflow", "auto", "important");
  render(<MemoryRouter initialEntries={["/resume"]}><Home /></MemoryRouter>);
  await openIndex(user);
  await user.click(screen.getByRole("button", { name: "Close navigation" }));
  expect(document.body).toHaveClass("portfolio-bounded-view-open");
  expect(document.body).not.toHaveClass("modal-open");
  expect(document.body.style.getPropertyValue("overflow")).toBe("");
});
