import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { PortfolioRoutes } from "./App";
import WhackaModal from "./components/WhackaModal";
import KrispyModal from "./components/KrispyModal";
import HeyYouModal from "./components/HeyYouModal";
import BardModal from "./components/BardModal";
import ThisPortfolioModal from "./components/ThisPortfolioModal";
import KanbanBoardModal from "./components/KanbanBoardModal";
import HomeContextPanel from "./components/home/HomeContextPanel";

jest.mock("./components/Logo", () => function MockLogo() {
  return <div aria-label="Portfolio logo" />;
});
jest.mock("./components/profile/ThreeDProfileView", () => function MockThreeDProfileView() {
  return <div aria-label="Interactive 3D profile" />;
});
jest.mock("./components/WhackaModal", () => jest.fn());
jest.mock("./components/KrispyModal", () => jest.fn());
jest.mock("./components/HeyYouModal", () => jest.fn());
jest.mock("./components/BardModal", () => jest.fn());
jest.mock("./components/ThisPortfolioModal", () => jest.fn());
jest.mock("./components/KanbanBoardModal", () => jest.fn());

const projectCases = [
  ["whackamole", "Whack a Mole", WhackaModal],
  ["krispy", "KRISPY", KrispyModal],
  ["heyyou", "HeyYou", HeyYouModal],
  ["bard", "BARD", BardModal],
  ["thisportfolio", "Portfolio", ThisPortfolioModal],
  ["kanban", "Tuh-Doo / Kanban Board", KanbanBoardModal],
];

function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div>
      <output aria-label="Current path">{location.pathname}</output>
      <output aria-label="Current entry">{location.key}</output>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
    </div>
  );
}

function renderPortfolio(initialEntries = ["/"], now) {
  if (now) jest.setSystemTime(now);
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <PortfolioRoutes />
      <LocationProbe />
    </MemoryRouter>
  );
  return user;
}

function advance(milliseconds = 5000) {
  act(() => jest.advanceTimersByTime(milliseconds));
}

function expectPath(path) {
  expect(screen.getByLabelText("Current path")).toHaveTextContent(new RegExp(`^${path}$`));
}

function expectCenter(view) {
  const center = screen.getByRole("region", { name: `${view} view` });
  expect(center).toHaveAttribute("id", "home-center-view");
  const renderedViews = [
    within(center).queryByLabelText("Portfolio logo"),
    within(center).queryByRole("region", { name: "Projects" }),
    within(center).queryByTitle("Ibrahim Karim resume PDF"),
    within(center).queryByLabelText("Interactive 3D profile"),
  ].filter(Boolean);
  expect(renderedViews).toHaveLength(1);
  return center;
}

function expectPreservedContent(view = "Home") {
  if (view === "Home") {
    const biography = screen.getByText(/Hello! I’m Ibrahim, a full-stack web and mobile developer/i);
    expect(biography.parentElement.querySelectorAll("p")).toHaveLength(2);
    expect(screen.getByText(/I work with technologies like JavaScript, CSS, React/i)).toBeInTheDocument();
  } else {
    expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
  }
  expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
  expect(screen.getByText("© 2042 Ibrahim Karim.")).toBeInTheDocument();
  const resume = screen.getByRole("button", { name: "Resume" });
  expect(resume).toHaveAttribute("aria-pressed", view === "Resume" ? "true" : "false");
  expect(resume).not.toHaveAttribute("href");
  expect(resume).not.toHaveAttribute("target");
  [
    ["Linkedin", "https://www.linkedin.com/in/ibrahim-karim-abaa952a7/"],
    ["Github", "https://github.com/ibrahimkarim22"],
    ["Gmail", "mailto:22ibrahimkarim@gmail.com"],
    ["Megaracer", "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22"],
  ].forEach(([name, href]) => {
    const link = screen.getByRole("link", { name });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
  const preview = screen.getByTitle("TypeRacer profile for ib_ra_heem_22");
  expect(preview).toHaveAttribute("src", "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22");
  expect(preview.closest("a")).toHaveAttribute("href", "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22");
  expect(screen.queryByAltText("TypeRacer.com scorecard for user ib_ra_heem_22")).not.toBeInTheDocument();
}

let originalMatchMedia;
let desktopHoverMedia;
let desktopHoverListeners;
let narrowLayoutMedia;
let narrowLayoutListeners;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
  desktopHoverListeners = new Set();
  desktopHoverMedia = {
    matches: true,
    media: "(min-width: 1251px) and (min-height: 701px) and (hover: hover) and (pointer: fine)",
    addEventListener: jest.fn((event, listener) => desktopHoverListeners.add(listener)),
    removeEventListener: jest.fn((event, listener) => desktopHoverListeners.delete(listener)),
  };
  narrowLayoutListeners = new Set();
  narrowLayoutMedia = {
    matches: false,
    media: "(max-width: 1250px)",
    addEventListener: jest.fn((event, listener) => narrowLayoutListeners.add(listener)),
    removeEventListener: jest.fn((event, listener) => narrowLayoutListeners.delete(listener)),
  };
  window.matchMedia = jest.fn((query) => query === "(max-width: 1250px)" ? narrowLayoutMedia : desktopHoverMedia);
  jest.useFakeTimers();
  jest.clearAllMocks();
  projectCases.forEach(([id, name, Component]) => {
    Component.mockImplementation(({ isOpen, closeModal }) => (
      <Modal isOpen={isOpen} toggle={closeModal} labelledBy={`modal-${id}`} fade={false}>
        <ModalHeader id={`modal-${id}`} toggle={closeModal}>{name}</ModalHeader>
        <ModalBody>{name} project details</ModalBody>
      </Modal>
    ));
  });
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  jest.clearAllTimers();
  jest.useRealTimers();
});

test("initial Home renders its biography, navigation and center without a percentage gate", () => {
  renderPortfolio();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(screen.queryByText(/^\d+%$/)).not.toBeInTheDocument();
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: "Portfolio navigation" })).toBeInTheDocument();
  expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
  expect(within(expectCenter("Home")).getByLabelText("Portfolio logo")).toBeInTheDocument();
  expect(jest.getTimerCount()).toBe(0);
});

describe("Home entrance lifecycle", () => {
  test("initial Home starts its entrance with semantic content available immediately", () => {
    renderPortfolio();
    expect(expectCenter("Home").closest(".menu-div-main")).toHaveClass("home-entry");
    expect(screen.getByRole("button", { name: "Projects" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Resume" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "3D Profile" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Github" })).toBeInTheDocument();
    expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
    expect(screen.getByText(/Hello! I’m Ibrahim/)).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(jest.getTimerCount()).toBe(0);
  });

  test.each([
    ["Projects", "/projects"],
    ["Resume", "/resume"],
    ["3D Profile", "/threeDeeResume"],
  ])("%s removes the entrance and returning Home restores it without remounting the shell", async (label, path) => {
    const user = renderPortfolio();
    const shell = expectCenter("Home").closest(".menu-div-main");
    const navigation = screen.getByRole("navigation", { name: "Portfolio navigation" });
    expect(shell).toHaveClass("home-entry");

    await user.click(within(navigation).getByRole("button", { name: label }));
    expectPath(path);
    expect(expectCenter(label).closest(".menu-div-main")).toBe(shell);
    expect(shell).not.toHaveClass("home-entry");

    await user.click(screen.getByRole("button", { name: "Back to Home" }));
    expectPath("/");
    expect(expectCenter("Home").closest(".menu-div-main")).toBe(shell);
    expect(shell).toHaveClass("home-entry");
    expect(screen.getByRole("navigation", { name: "Portfolio navigation" })).toBe(navigation);
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  test("browser Back and Forward apply the entrance only when the route returns to Home", async () => {
    const user = renderPortfolio(["/projects", "/"]);
    const shell = expectCenter("Home").closest(".menu-div-main");
    expect(shell).toHaveClass("home-entry");
    await user.click(screen.getByRole("button", { name: "Back" }));
    expectPath("/projects");
    expect(expectCenter("Projects").closest(".menu-div-main")).toBe(shell);
    expect(shell).not.toHaveClass("home-entry");
    await user.click(screen.getByRole("button", { name: "Forward" }));
    expectPath("/");
    expect(shell).toHaveClass("home-entry");
  });

  test("hover, focus and a parent rerender do not reapply the Home entrance or replace its content", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const portfolio = (revision) => (
      <MemoryRouter>
        <PortfolioRoutes />
        <output aria-label="Parent revision">{revision}</output>
      </MemoryRouter>
    );
    const { rerender } = render(portfolio(0));
    const shell = expectCenter("Home").closest(".menu-div-main");
    const biography = screen.getByText(/Hello! I’m Ibrahim/);
    const title = screen.getByText("Full-Stack Developer");
    const navigation = screen.getByRole("navigation", { name: "Portfolio navigation" });
    const contacts = screen.getByRole("link", { name: "Github" }).parentElement;
    expect(shell).toHaveClass("home-entry");
    const classChanges = [];
    const observer = new MutationObserver((records) => classChanges.push(...records));
    observer.observe(shell, { attributes: true, attributeFilter: ["class"] });
    try {
      await user.hover(within(navigation).getByRole("button", { name: "Projects" }));
      act(() => within(navigation).getByRole("button", { name: "Resume" }).focus());
      rerender(portfolio(1));
      await act(async () => { await Promise.resolve(); });
      expect(classChanges).toHaveLength(0);
      expect(shell).toHaveClass("home-entry");
      expect(screen.getByText(/Hello! I’m Ibrahim/)).toBe(biography);
      expect(screen.getByText("Full-Stack Developer")).toBe(title);
      expect(screen.getByRole("navigation", { name: "Portfolio navigation" })).toBe(navigation);
      expect(screen.getByRole("link", { name: "Github" }).parentElement).toBe(contacts);
    } finally {
      observer.disconnect();
    }
  });

  test("mobile Home keeps About Me usable without replaying the entrance on sheet open or close", async () => {
    narrowLayoutMedia.matches = true;
    const user = renderPortfolio();
    const shell = expectCenter("Home").closest(".menu-div-main");
    const navigation = screen.getByRole("navigation", { name: "Portfolio navigation" });
    const about = screen.getByRole("button", { name: "About Me" });
    expect(shell).toHaveClass("home-entry");
    expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
    expect(about).toBeEnabled();
    const classChanges = [];
    const observer = new MutationObserver((records) => classChanges.push(...records));
    observer.observe(shell, { attributes: true, attributeFilter: ["class"] });
    try {
      await user.click(about);
      expect(screen.getByRole("dialog", { name: "About Me" })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Close About Me" }));
      await act(async () => { await Promise.resolve(); });
      expectPath("/");
      expect(classChanges).toHaveLength(0);
      expect(shell).toHaveClass("home-entry");
      expect(screen.getByRole("button", { name: "About Me" })).toBe(about);
      expect(screen.getByRole("navigation", { name: "Portfolio navigation" })).toBe(navigation);
    } finally {
      observer.disconnect();
    }
  });
});

test("navigation and Home restoration work before the old artificial completion time", async () => {
  const user = renderPortfolio();
  const navigation = screen.getByRole("navigation", { name: "Portfolio navigation" });
  await user.click(within(navigation).getByRole("button", { name: "Projects" }));
  expectPath("/projects");
  await user.click(screen.getByRole("button", { name: "Back to Home" }));
  expectPath("/");
  const biography = screen.getByText(/Hello! I’m Ibrahim/);
  expect(screen.getByRole("navigation", { name: "Portfolio navigation" })).toBe(navigation);
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  advance(5000);
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBe(biography);
  expect(screen.queryByText(/^\d+%$/)).not.toBeInTheDocument();
});

test("initial projects renders the shell and all six choices immediately", () => {
  renderPortfolio(["/projects"]);
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
  const selector = within(expectCenter("Projects")).getByRole("region", { name: "Projects" });
  expect(within(within(selector).getByRole("list")).getAllByRole("button")).toHaveLength(6);
  projectCases.forEach(([, name]) => expect(within(selector).getByRole("button", { name: new RegExp(name) })).toBeInTheDocument());
});

test.each([
  ["/", "Home", "home"],
  ["/projects", "Projects", "projects"],
  ["/projects/bard", "Projects", "projects"],
  ["/resume", "Resume", "resume"],
  ["/threeDeeResume", "3D Profile", "3d-profile"],
])("the shell exposes its route-derived view at %s", (path, label, activeView) => {
  renderPortfolio([path]);
  if (path === "/") advance();
  expect(expectCenter(label).closest(".menu-div-main")).toHaveAttribute("data-active-view", activeView);
});

test.each(["Projects", "Resume", "3D Profile"])("%s manages the bounded-view body class while preserving unrelated classes", async (label) => {
  document.body.classList.add("existing-page-class");
  try {
    const user = renderPortfolio();
    advance();
    expect(document.body).not.toHaveClass("portfolio-bounded-view-open");
    const toggle = screen.getByRole("button", { name: label });

    await user.click(toggle);
    expect(document.body).toHaveClass("portfolio-bounded-view-open", "existing-page-class");

    await user.click(screen.getByRole("button", { name: "Back to Home" }));
    expectCenter("Home");
    expect(document.body).not.toHaveClass("portfolio-bounded-view-open");
    expect(document.body).toHaveClass("existing-page-class");
  } finally {
    document.body.classList.remove("existing-page-class");
  }
});

test.each(["/projects", "/resume", "/threeDeeResume"])("unmounting %s removes the bounded-view body class", (path) => {
  const { unmount } = render(
    <MemoryRouter initialEntries={[path]}>
      <PortfolioRoutes />
    </MemoryRouter>
  );
  expect(document.body).toHaveClass("portfolio-bounded-view-open");
  unmount();
  expect(document.body).not.toHaveClass("portfolio-bounded-view-open");
});

describe("body overflow ownership with Reactstrap", () => {
  let style;
  let originalBodyStyle;

  beforeEach(() => {
    originalBodyStyle = document.body.getAttribute("style");
    document.body.style.removeProperty("overflow");
    // CRA omits imported SCSS in Jest; apply only the bounded viewport rule
    // without a media query because JSDOM does not evaluate viewport media.
    style = document.createElement("style");
    style.textContent = "body { overflow: auto; } body.portfolio-bounded-view-open { overflow: hidden !important; }";
    document.head.appendChild(style);
  });

  afterEach(() => {
    cleanup();
    style.remove();
    if (originalBodyStyle === null) document.body.removeAttribute("style");
    else document.body.setAttribute("style", originalBodyStyle);
    document.body.classList.remove("existing-page-class");
  });

  test("selector modal close keeps Projects locked and returning Home restores scrolling", async () => {
    const user = renderPortfolio(["/projects"]);
    expect(window.getComputedStyle(document.body).overflow).toBe("hidden");
    await user.click(screen.getByRole("button", { name: /^BARD / }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expectPath("/projects");
    expect(window.getComputedStyle(document.body).overflow).toBe("hidden");

    await user.click(screen.getByRole("button", { name: "Back to Home" }));
    expectCenter("Home");
    expect(document.body.style.getPropertyValue("overflow")).toBe("");
    expect(window.getComputedStyle(document.body).overflow).toBe("auto");
  });

  test("direct modal close keeps Projects locked and unmount restores the original overflow", async () => {
    const user = renderPortfolio(["/projects/bard"]);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expectPath("/projects");
    expect(window.getComputedStyle(document.body).overflow).toBe("hidden");

    cleanup();
    expect(document.body.style.getPropertyValue("overflow")).toBe("");
    expect(document.body.style.getPropertyPriority("overflow")).toBe("");
    expect(window.getComputedStyle(document.body).overflow).toBe("auto");
  });

  test.each(["Home", "unmount"])("restores pre-Home inline overflow and priority on %s without touching unrelated styles", async (exit) => {
    document.body.style.setProperty("overflow", "scroll", "important");
    document.body.style.setProperty("color", "purple", "important");
    document.body.classList.add("existing-page-class");
    const user = renderPortfolio(["/projects/bard"]);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(window.getComputedStyle(document.body).overflow).toBe("hidden");
    if (exit === "Home") await user.click(screen.getByRole("button", { name: "Back to Home" }));
    else cleanup();

    expect(document.body.style.getPropertyValue("overflow")).toBe("scroll");
    expect(document.body.style.getPropertyPriority("overflow")).toBe("important");
    expect(window.getComputedStyle(document.body).overflow).toBe("scroll");
    expect(document.body.style.getPropertyValue("color")).toBe("purple");
    expect(document.body.style.getPropertyPriority("color")).toBe("important");
    expect(document.body).toHaveClass("existing-page-class");
    expect(document.body).not.toHaveClass("portfolio-bounded-view-open");
  });
});

test("Projects remains active on repeat activation and Back to Home clears expanded and pressed state", async () => {
  const user = renderPortfolio();
  advance();
  const projects = screen.getByRole("button", { name: "Projects" });
  expect(projects).toHaveAttribute("aria-controls", "project-selector");
  expect(projects).toHaveAttribute("aria-expanded", "false");
  expect(projects).toHaveAttribute("aria-pressed", "false");
  await user.click(projects);
  expectPath("/projects");
  expect(projects).toHaveAttribute("aria-expanded", "true");
  expect(projects).toHaveAttribute("aria-pressed", "true");
  await user.click(projects);
  expectPath("/projects");
  expect(projects).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "Back to Home" }));
  expectPath("/");
  expect(projects).toHaveAttribute("aria-expanded", "false");
  expect(projects).toHaveAttribute("aria-pressed", "false");
  expectCenter("Home");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test("Back to Home restores the Logo and browser Back returns to Projects", async () => {
  const user = renderPortfolio(["/projects"]);
  const backToHome = screen.getByRole("button", { name: "Back to Home" });

  await user.click(backToHome);
  expectPath("/");
  expect(within(expectCenter("Home")).getByLabelText("Portfolio logo")).toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Back" }));
  expectPath("/projects");
  expectCenter("Projects");
});

test("3D Profile remains active on repeat activation and Back to Home restores Logo", async () => {
  const user = renderPortfolio();
  advance();
  const profile = screen.getByRole("button", { name: "3D Profile" });
  expect(profile).not.toHaveAttribute("target");
  expect(profile).toHaveAttribute("aria-pressed", "false");
  await user.click(profile);
  expectPath("/threeDeeResume");
  expect(profile).toHaveAttribute("aria-pressed", "true");
  expect(within(expectCenter("3D Profile")).getByLabelText("Interactive 3D profile")).toBeInTheDocument();
  expect(screen.queryByLabelText("Portfolio logo")).not.toBeInTheDocument();
  await user.click(profile);
  expectPath("/threeDeeResume");
  expect(profile).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "Back to Home" }));
  expectPath("/");
  expect(profile).toHaveAttribute("aria-pressed", "false");
  expect(within(expectCenter("Home")).getByLabelText("Portfolio logo")).toBeInTheDocument();
});

test("switching child routes updates context while preserving the shell and one center view", async () => {
  const user = renderPortfolio(["/projects"]);
  expect(screen.getByText("SELECTED WORK")).toBeInTheDocument();
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
  const center = expectCenter("Projects");
  await user.click(screen.getByRole("button", { name: "3D Profile" }));
  expectPath("/threeDeeResume");
  expect(expectCenter("3D Profile")).toBe(center);
  expect(screen.getByRole("heading", { name: "Interactive Profile" })).toBeInTheDocument();
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Projects" })).toHaveAttribute("aria-expanded", "false");
  await user.click(screen.getByRole("button", { name: "Projects" }));
  expectPath("/projects");
  expect(expectCenter("Projects")).toBe(center);
  expect(screen.getByText("SELECTED WORK")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "3D Profile" })).toHaveAttribute("aria-pressed", "false");
});

test("initial 3D deep link and its return home never show the Home loader", async () => {
  const user = renderPortfolio(["/threeDeeResume"]);
  expectCenter("3D Profile");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Back to Home" }));
  expectCenter("Home");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test("moves focus to the center heading on view changes and history navigation, but not initially", async () => {
  const user = renderPortfolio(["/projects"]);
  advance(20);
  const projectsHeading = within(expectCenter("Projects")).getByRole("heading", { name: "Projects view" });
  expect(projectsHeading).toHaveAttribute("tabindex", "-1");
  expect(projectsHeading).not.toHaveFocus();
  await user.click(screen.getByRole("button", { name: "3D Profile" }));
  advance(20);
  expect(screen.getByRole("heading", { name: "3D Profile view" })).toHaveFocus();
  await user.click(screen.getByRole("button", { name: "Back" }));
  advance(20);
  expect(screen.getByRole("heading", { name: "Projects view" })).toHaveFocus();
});

test("preserves Home biography and contacts, title, copyright, Resume, and Megaracer in every view", async () => {
  const user = renderPortfolio(["/"], new Date("2042-06-15T12:00:00Z"));
  advance();
  expectPreservedContent();
  await user.click(screen.getByRole("button", { name: "Projects" }));
  expectPreservedContent("Projects");
  await user.click(screen.getByRole("button", { name: "Resume" }));
  expectPreservedContent("Resume");
  await user.click(screen.getByRole("button", { name: "3D Profile" }));
  expectPreservedContent("3D Profile");
});

const previewCases = [
  ["Whack a Mole", "A playful test of timing.", "A browser game built around quick reactions and a ticking score clock.", "JavaScript · HTML · SCSS"],
  ["KRISPY", "Streams, cinema, and discovery.", "A web streaming project bringing live TV, global feeds, and public-domain films together.", "React · Redux · Firebase"],
  ["HeyYou", "Location sharing meets conversation.", "A mobile app combining real-time location sharing and group messaging.", "React Native · Node.js · Socket.io"],
  ["BARD", "A new way into Shakespeare.", "A mobile learning project exploring Shakespeare’s plays through reading, quizzes, and video.", "React Native · Redux · Firebase"],
  ["Portfolio", "Code with a visual signature.", "A developer portfolio combining a React interface with modeled and animated 3D scenes.", "React · Blender 3D · React Three Fiber"],
  ["Tuh-Doo / Kanban Board", "From to-do to done.", "A task board with drag-and-drop columns and saved work tied to each user’s account.", "React · Firebase · SCSS"],
];

function expectRestingContext() {
  const context = screen.getByRole("complementary", { name: "Portfolio context" });
  expect(within(context).getByText("SELECTED WORK")).toBeInTheDocument();
  expect(within(context).getByRole("heading", { name: "A selection of things I’ve made." })).toBeInTheDocument();
  expect(within(context).getByText("Web applications, mobile experiences, interactive projects, and experiments in design.")).toBeInTheDocument();
  expect(within(context).getByText("Select a project to view its details.")).toBeInTheDocument();
  expect(within(context).queryByText("Where code meets form.")).not.toBeInTheDocument();
  expect(within(context).queryByText(/Hover (over a project to explore|to learn more)\./)).not.toBeInTheDocument();
  return context;
}

test.each(previewCases)("hover previews %s without navigating and leaving restores Selected Work", async (name, heading, description, technologies) => {
  const user = renderPortfolio(["/projects"]);
  const context = expectRestingContext();
  const card = within(screen.getByRole("region", { name: "Projects" })).getByRole("button", { name: new RegExp(`^${name} `) });
  await user.hover(card);
  expect(within(context).getByText(name, { exact: true })).toBeInTheDocument();
  expect(within(context).getByRole("heading", { name: heading })).toBeInTheDocument();
  expect(within(context).getByText(description)).toBeInTheDocument();
  expect(within(context).getByText(technologies)).toBeInTheDocument();
  expectPath("/projects");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.unhover(card);
  expectRestingContext();
});

test("keyboard focus previews cards and leaving pointer hover falls back to the focused card", async () => {
  const user = renderPortfolio(["/projects"]);
  await user.tab(); // Back to Home
  await user.tab(); // Whack a Mole
  const focused = screen.getByRole("button", { name: /^Whack a Mole / });
  expect(focused).toHaveFocus();
  const context = screen.getByRole("complementary", { name: "Portfolio context" });
  expect(within(context).getByRole("heading", { name: "A playful test of timing." })).toBeInTheDocument();
  const hovered = screen.getByRole("button", { name: /^HeyYou / });
  await user.hover(hovered);
  expect(within(context).getByRole("heading", { name: "Location sharing meets conversation." })).toBeInTheDocument();
  await user.unhover(hovered);
  expect(within(context).getByRole("heading", { name: "A playful test of timing." })).toBeInTheDocument();
  await user.tab();
  expect(within(context).getByRole("heading", { name: "Streams, cinema, and discovery." })).toBeInTheDocument();
  for (let i = 0; i < 5; i += 1) await user.tab();
  expectRestingContext();
});

test("new keyboard focus supersedes an existing hover and blur returns to the hovered card", async () => {
  const user = renderPortfolio(["/projects"]);
  await user.hover(screen.getByRole("button", { name: /^HeyYou / }));
  await user.tab();
  await user.tab();
  const context = screen.getByRole("complementary", { name: "Portfolio context" });
  expect(within(context).getByRole("heading", { name: "A playful test of timing." })).toBeInTheDocument();
  await user.tab({ shift: true });
  expect(within(context).getByRole("heading", { name: "Location sharing meets conversation." })).toBeInTheDocument();
});

test("rapid pointer changes supersede earlier captions and do not add history entries", async () => {
  const user = renderPortfolio(["/", "/projects"]);
  const cards = within(screen.getByRole("region", { name: "Projects" })).getAllByRole("listitem").map((item) => within(item).getByRole("button"));
  const context = expectRestingContext();
  for (let index = 0; index < cards.length; index += 1) {
    await user.hover(cards[index]);
    expect(within(context).getByRole("heading", { name: previewCases[index][1] })).toBeInTheDocument();
    expect(within(context).getAllByRole("heading")).toHaveLength(1);
  }
  // A leave event belonging to an older card must not clear the newest preview.
  fireEvent.pointerLeave(cards[0]);
  expect(within(context).getByRole("heading", { name: "From to-do to done." })).toBeInTheDocument();
  await user.unhover(cards[5]);
  advance(1000);
  expectRestingContext();
  await user.click(screen.getByRole("button", { name: "Back" }));
  expectPath("/");
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBeInTheDocument();
});

test("previewed card opens its modal in one action and close restores focus, caption, and history", async () => {
  const user = renderPortfolio(["/projects"]);
  const trigger = screen.getByRole("button", { name: /^KRISPY / });
  await user.hover(trigger);
  await user.click(trigger);
  expectPath("/projects/krispy");
  expect(screen.getByRole("dialog", { name: "KRISPY" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Close" }));
  advance(20);
  expectPath("/projects");
  expect(trigger).toHaveFocus();
  const context = screen.getByRole("complementary", { name: "Portfolio context" });
  expect(within(context).getByRole("heading", { name: "Streams, cinema, and discovery." })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Forward" }));
  expectPath("/projects/krispy");
  expect(screen.getByRole("dialog", { name: "KRISPY" })).toBeInTheDocument();
});

test("Back to Home clears preview state and restores the biography and signature", async () => {
  const user = renderPortfolio(["/projects"]);
  await user.hover(screen.getByRole("button", { name: /^BARD / }));
  await user.click(screen.getByRole("button", { name: "Back to Home" }));
  expectPath("/");
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBeInTheDocument();
  expect(screen.getByText(/I work with technologies like JavaScript, CSS, React/)).toBeInTheDocument();
  expect(within(expectCenter("Home")).getByLabelText("Portfolio logo")).toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Projects" }));
  expectRestingContext();
});

test("3D Profile supplies existing mouse-control guidance and clears the transient project preview", async () => {
  const user = renderPortfolio(["/projects"]);
  await user.hover(screen.getByRole("button", { name: /^HeyYou / }));
  await user.click(screen.getByRole("button", { name: "3D Profile" }));
  const context = screen.getByRole("complementary", { name: "Portfolio context" });
  expect(within(context).getByRole("heading", { name: "Interactive Profile" })).toBeInTheDocument();
  expect(within(context).getByText("Left-drag to rotate, right-drag to pan, and use the mouse wheel to zoom.")).toBeInTheDocument();
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
  expectCenter("3D Profile");
  await user.click(screen.getByRole("button", { name: "Projects" }));
  expectRestingContext();
});

test.each(["/about", "/PROJECTS", "/RESUME", "/THREEDEERESUME"])("unsupported path %s renders no portfolio shell", (path) => {
  renderPortfolio([path]);
  expect(document.body).not.toHaveClass("portfolio-bounded-view-open");
  expect(screen.queryByText("Full-Stack Developer")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Projects" })).not.toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test.each(projectCases)("deep link /projects/%s opens only its modal with Projects active", (id, name) => {
  renderPortfolio([`/projects/${id}`]);
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByRole("dialog", { name })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Projects" })).toHaveAttribute("aria-pressed", "true");
  expectCenter("Projects");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test.each(projectCases)("selecting %s writes its exact lowercase URL and opens only its modal", async (id, name) => {
  const user = renderPortfolio(["/projects"]);
  await user.click(screen.getByRole("button", { name: new RegExp(`^${name} `) }));
  expectPath(`/projects/${id}`);
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByRole("dialog", { name })).toBeInTheDocument();
});

test("selector-opened Close goes Back and Forward reopens the modal", async () => {
  const user = renderPortfolio(["/projects"]);
  await user.click(screen.getByRole("button", { name: /^BARD / }));
  await user.click(screen.getByRole("button", { name: "Close" }));
  expectPath("/projects");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expectCenter("Projects");
  await user.click(screen.getByRole("button", { name: "Forward" }));
  expectPath("/projects/bard");
  expect(screen.getByRole("dialog", { name: "BARD" })).toBeInTheDocument();
});

test("browser Back closes a selected project and retains the selector", async () => {
  const user = renderPortfolio(["/projects"]);
  const selector = screen.getByRole("region", { name: "Projects" });
  await user.click(screen.getByRole("button", { name: /^HeyYou / }));
  await user.click(screen.getByRole("button", { name: "Back" }));
  expectPath("/projects");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Projects" })).toBe(selector);
});

test("direct-deep-link Close replaces the URL so Back reaches the preceding entry", async () => {
  const user = renderPortfolio(["/sentinel", "/projects/bard"]);
  await user.click(screen.getByRole("button", { name: "Close" }));
  expectPath("/projects");
  expectCenter("Projects");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Back" }));
  expectPath("/sentinel");
  expect(screen.queryByText("Full-Stack Developer")).not.toBeInTheDocument();
});

test("an invalid project ID replaces with the selector without adding a history entry", async () => {
  const user = renderPortfolio(["/sentinel", "/projects/NOT-REAL"]);
  expectPath("/projects");
  expectCenter("Projects");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Back" }));
  expectPath("/sentinel");
});

test("closing a selector-opened modal restores focus to its exact invoking button", async () => {
  const user = renderPortfolio(["/projects"]);
  const trigger = screen.getByRole("button", { name: /^KRISPY / });
  await user.click(trigger);
  await user.click(screen.getByRole("button", { name: "Close" }));
  advance(20);
  expect(trigger).toHaveFocus();
});

test("navigation keeps four semantic controls, decorative desktop wrappers, and the external TypeRacer preview", () => {
  renderPortfolio(["/projects"]);
  const nav = screen.getByRole("navigation", { name: "Portfolio navigation" });
  expect(within(nav).getAllByRole("button")).toHaveLength(3);
  [["Projects", "projects-title-div"], ["Resume", "pdfResume-title-div"], ["3D Profile", "threeResume-title-div"]].forEach(([name, className]) => {
    const button = within(nav).getByRole("button", { name });
    expect(button).toHaveAttribute("type", "button");
    expect(within(button).getByText(name)).toHaveClass(className);
    expect(button).not.toHaveAttribute("target");
  });
  const megaracer = within(nav).getByRole("link", { name: "Megaracer" });
  expect(megaracer).toHaveAttribute("href", "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22");
  expect(megaracer).toHaveAttribute("target", "_blank");
  expect(megaracer).toHaveAttribute("rel", "noopener noreferrer");
  expect(within(megaracer).getByText("Megaracer")).toHaveClass("megaracer");
  expect(within(nav).getByTitle("TypeRacer profile for ib_ra_heem_22")).toHaveAttribute("src", "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22");
});

test("keyboard activation of Resume changes the route and center while preserving the Home shell", async () => {
  const user = renderPortfolio();
  advance();
  const center = expectCenter("Home");
  const nav = screen.getByRole("navigation", { name: "Portfolio navigation" });
  const biography = screen.getByText(/Hello! I’m Ibrahim/);
  await user.tab();
  await user.tab();
  const resume = within(nav).getByRole("button", { name: "Resume" });
  expect(resume).toHaveFocus();
  expect(resume).toHaveAttribute("aria-pressed", "false");
  await user.keyboard("{Enter}");
  expectPath("/resume");
  expect(expectCenter("Resume")).toBe(center);
  expect(screen.getByRole("navigation", { name: "Portfolio navigation" })).toBe(nav);
  expect(biography).not.toBeInTheDocument();
  expect(resume).toHaveAttribute("aria-controls", "resume-view");
  expect(resume).toHaveAttribute("aria-expanded", "true");
  expect(resume).toHaveAttribute("aria-pressed", "true");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  advance(20);
  expect(screen.getByRole("heading", { name: "Resume view" })).toHaveFocus();
});

test("direct /resume shows Resume context and the existing PDF without mounting either 3D scene", () => {
  renderPortfolio(["/resume"]);
  const center = expectCenter("Resume");
  const context = screen.getByRole("complementary", { name: "Portfolio context" });
  expect(within(context).getByText("RESUME")).toBeInTheDocument();
  expect(within(context).getByRole("heading", { name: "Experience & practice." })).toBeInTheDocument();
  expect(within(context).getByText("Web development, software projects, technical tools, and a background in visual design.")).toBeInTheDocument();
  const viewer = within(center).getByTitle("Ibrahim Karim resume PDF");
  expect(viewer.tagName).toBe("IFRAME");
  expect(new URL(viewer.getAttribute("src"), "http://localhost").pathname).toBe("/Ibrahim_Karim_Full_Stack_Resume.pdf");
  expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Github" })).toBeInTheDocument();
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Portfolio logo")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Interactive 3D profile")).not.toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test("Resume offers real Download links and a keyboard-usable Open Resume fallback for the same PDF", async () => {
  const user = renderPortfolio(["/resume"]);
  const center = expectCenter("Resume");
  const context = screen.getByRole("complementary", { name: "Portfolio context" });
  const desktopDownload = within(context).getByRole("link", { name: "Download Resume" });
  [desktopDownload, within(center).getByRole("link", { name: "Download Resume" })].forEach((download) => {
    expect(download.tagName).toBe("A");
    expect(download).toHaveAttribute("href", "/Ibrahim_Karim_Full_Stack_Resume.pdf");
    expect(download).toHaveAttribute("download");
  });
  const description = within(context).getByText("Web development, software projects, technical tools, and a background in visual design.");
  expect(description.compareDocumentPosition(desktopDownload) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(within(center).getByRole("heading", { name: "Experience & practice." })).toBeInTheDocument();
  const open = within(center).getByRole("link", { name: "Open Resume" });
  expect(open).toHaveAttribute("href", "/Ibrahim_Karim_Full_Stack_Resume.pdf");
  expect(open).toHaveAttribute("target", "_blank");
  expect(open).toHaveAttribute("rel", "noopener noreferrer");
  await user.tab(); // Desktop context download link.
  expect(desktopDownload).toHaveFocus();
  await user.tab(); // Back to Home.
  await user.tab(); // Open Resume, available even if the iframe cannot render.
  expect(open).toHaveFocus();
});

test("Resume Back to Home returns Home without a loader and Back restores Resume", async () => {
  const user = renderPortfolio(["/resume"]);
  await user.click(screen.getByRole("button", { name: "Back to Home" }));
  expectPath("/");
  expect(within(expectCenter("Home")).getByLabelText("Portfolio logo")).toBeInTheDocument();
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBeInTheDocument();
  expect(screen.getByText(/I work with technologies like JavaScript, CSS, React/)).toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Resume" })).toHaveAttribute("aria-pressed", "false");
  await user.click(screen.getByRole("button", { name: "Back" }));
  expectPath("/resume");
  expectCenter("Resume");
  expect(screen.getByRole("button", { name: "Resume" })).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "Forward" }));
  expectPath("/");
  expectCenter("Home");
});

test("Back and Forward traverse all four in-page views without remounting the shell", async () => {
  const user = renderPortfolio();
  advance();
  const center = expectCenter("Home");
  const nav = screen.getByRole("navigation", { name: "Portfolio navigation" });
  for (const [label, path] of [["Projects", "/projects"], ["Resume", "/resume"], ["3D Profile", "/threeDeeResume"]]) {
    await user.click(within(nav).getByRole("button", { name: label }));
    expectPath(path);
    expect(expectCenter(label)).toBe(center);
    ["Projects", "Resume", "3D Profile"].forEach((name) => expect(within(nav).getByRole("button", { name })).toHaveAttribute("aria-pressed", name === label ? "true" : "false"));
  }
  for (const [label, path] of [["Resume", "/resume"], ["Projects", "/projects"], ["Home", "/"]]) {
    await user.click(screen.getByRole("button", { name: "Back" }));
    expectPath(path);
    expect(expectCenter(label)).toBe(center);
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  }
  for (const [label, path] of [["Projects", "/projects"], ["Resume", "/resume"], ["3D Profile", "/threeDeeResume"]]) {
    await user.click(screen.getByRole("button", { name: "Forward" }));
    expectPath(path);
    expect(expectCenter(label)).toBe(center);
  }
  expect(screen.getByRole("navigation", { name: "Portfolio navigation" })).toBe(nav);
});

test("switching from a project preview to Resume clears the preview when Projects returns", async () => {
  const user = renderPortfolio(["/projects"]);
  await user.hover(screen.getByRole("button", { name: /^HeyYou / }));
  await user.click(screen.getByRole("button", { name: "Resume" }));
  expectPath("/resume");
  expectCenter("Resume");
  await user.click(screen.getByRole("button", { name: "Projects" }));
  expectRestingContext();
});

test.each([true, false])("Projects resting copy communicates selection with desktop pointer capability %s", (desktopPointer) => {
  desktopHoverMedia.matches = desktopPointer;
  renderPortfolio(["/projects"]);
  expectRestingContext();
});

test("ordinary context rerenders preserve the Home paragraphs instead of replaying their reveal", () => {
  const { rerender } = render(<HomeContextPanel activeView="home" previewProjectId={null} />);
  const first = screen.getByText(/Hello! I’m Ibrahim/);
  const second = screen.getByText(/I work with technologies like JavaScript, CSS, React/);
  const biography = first.parentElement;

  rerender(<HomeContextPanel activeView="home" previewProjectId="bard" />);

  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBe(first);
  expect(screen.getByText(/I work with technologies like JavaScript, CSS, React/)).toBe(second);
  expect(first.parentElement).toBe(biography);
  expect(biography.querySelectorAll("p")).toHaveLength(2);
});

test.each(["Projects", "Resume", "3D Profile"])("returning from %s remounts the unchanged Home biography for its reveal", async (view) => {
  const user = renderPortfolio();
  advance();
  const original = screen.getByText(/Hello! I’m Ibrahim/);
  const originalSecond = screen.getByText(/I work with technologies like JavaScript, CSS, React/);
  const toggle = screen.getByRole("button", { name: view });

  await user.click(toggle);
  expect(original).not.toBeInTheDocument();
  expect(originalSecond).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Back to Home" }));

  expectPath("/");
  expectCenter("Home");
  const restored = screen.getByText(/Hello! I’m Ibrahim/);
  const restoredSecond = screen.getByText(/I work with technologies like JavaScript, CSS, React/);
  expect(restored).not.toBe(original);
  expect(restoredSecond).not.toBe(originalSecond);
  expect(restored).toHaveTextContent(original.textContent);
  expect(restoredSecond).toHaveTextContent(originalSecond.textContent);
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

const activeViewCases = [
  ["Projects", "/projects"],
  ["Resume", "/resume"],
  ["3D Profile", "/threeDeeResume"],
];

test.each(activeViewCases)("repeat %s activation preserves the current history entry and view", async (label, path) => {
  const user = renderPortfolio(["/", path]);
  const center = expectCenter(label);
  const entry = screen.getByLabelText("Current entry").textContent;
  await user.click(screen.getByRole("button", { name: label }));
  await user.click(screen.getByRole("button", { name: label }));
  expectPath(path);
  expect(screen.getByLabelText("Current entry")).toHaveTextContent(entry);
  expect(expectCenter(label)).toBe(center);
  expect(screen.getByRole("button", { name: label })).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "Back" }));
  expectPath("/");
  await user.click(screen.getByRole("button", { name: "Forward" }));
  expectPath(path);
});

test.each([
  ["/projects", "Resume", "/resume"], ["/projects", "3D Profile", "/threeDeeResume"],
  ["/resume", "Projects", "/projects"], ["/resume", "3D Profile", "/threeDeeResume"],
  ["/threeDeeResume", "Projects", "/projects"], ["/threeDeeResume", "Resume", "/resume"],
])("switching from %s directly to %s preserves Back/Forward", async (origin, label, target) => {
  const user = renderPortfolio([origin]);
  await user.click(screen.getByRole("button", { name: label }));
  expectPath(target);
  expectCenter(label);
  await user.click(screen.getByRole("button", { name: "Back" }));
  expectPath(origin);
  await user.click(screen.getByRole("button", { name: "Forward" }));
  expectPath(target);
});

test.each(["/", "/projects", "/resume", "/threeDeeResume"])("narrow %s retains all three native social destinations", (path) => {
  narrowLayoutMedia.matches = true;
  renderPortfolio([path]);
  if (path === "/") advance();
  [
    ["LinkedIn", "https://www.linkedin.com/in/ibrahim-karim-abaa952a7/"],
    ["GitHub", "https://github.com/ibrahimkarim22"],
    ["Gmail", "mailto:22ibrahimkarim@gmail.com"],
  ].forEach(([name, href]) => {
    const link = screen.getByRole("link", { name: new RegExp(`^${name}$`, "i") });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

const existingBiography = [
  "Hello! I’m Ibrahim, a full-stack web and mobile developer with a background in fine arts and a strong interest in UI/UX. I enjoy combining development and design to create experiences that are functional, intuitive, and visually engaging.",
  "I work with technologies like JavaScript, CSS, React, React Native, Node.js, APIs, and cloud tools, while also exploring 2D/3D design, animation, and visual storytelling. I’m always learning, building, and looking for better ways to turn ideas into useful digital experiences.",
];

function renderNarrowHome() {
  narrowLayoutMedia.matches = true;
  const user = renderPortfolio();
  advance();
  return user;
}

test("narrow Home offers About Me instead of inline biography and does not auto-open it", () => {
  renderNarrowHome();
  const about = screen.getByRole("button", { name: "About Me" });
  expect(about).toHaveAttribute("type", "button");
  expect(about).toHaveAttribute("aria-haspopup", "dialog");
  expect(about).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
  expect(screen.queryByRole("dialog", { name: "About Me" })).not.toBeInTheDocument();
  expectPath("/");
  const title = screen.getByText("Full-Stack Developer");
  const nav = screen.getByRole("navigation", { name: "Portfolio navigation" });
  expect(title.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(about.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test("About Me opens with the exact biography, dialog semantics, and keyboard focus without navigation", async () => {
  const user = renderNarrowHome();
  const trigger = screen.getByRole("button", { name: "About Me" });
  const entry = screen.getByLabelText("Current entry").textContent;
  trigger.focus();
  await user.keyboard("{Enter}");
  advance(20);
  const dialog = screen.getByRole("dialog", { name: "About Me" });
  expect(dialog).toHaveAttribute("aria-modal", "true");
  existingBiography.forEach((text) => expect(within(dialog).getByText(text)).toBeInTheDocument());
  expect(within(dialog).getByRole("button", { name: "Close About Me" })).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expectPath("/");
  expect(screen.getByLabelText("Current entry")).toHaveTextContent(entry);
});

test.each(["close button", "backdrop", "Escape"])("About Me closes via %s and returns focus to its trigger", async (method) => {
  const user = renderNarrowHome();
  const trigger = screen.getByRole("button", { name: "About Me" });
  await user.click(trigger);
  advance(20);
  const dialog = screen.getByRole("dialog", { name: "About Me" });
  if (method === "close button") await user.click(within(dialog).getByRole("button", { name: "Close About Me" }));
  else if (method === "backdrop") await user.click(dialog);
  else fireEvent.keyUp(document.activeElement, { key: "Escape", code: "Escape", keyCode: 27, which: 27 });
  advance(20);
  expect(screen.queryByRole("dialog", { name: "About Me" })).not.toBeInTheDocument();
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(document.body).not.toHaveClass("modal-open");
  expectPath("/");
});

test.each(activeViewCases)("narrow %s has an explicit Home exit and no About Me or inline biography", async (label, path) => {
  narrowLayoutMedia.matches = true;
  const user = renderPortfolio([path]);
  expect(screen.queryByRole("button", { name: "About Me" })).not.toBeInTheDocument();
  expect(screen.queryByRole("dialog", { name: "About Me" })).not.toBeInTheDocument();
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Back to Home" }));
  expectPath("/");
  expect(screen.getByRole("button", { name: "About Me" })).toBeInTheDocument();
  expect(screen.queryByRole("dialog", { name: "About Me" })).not.toBeInTheDocument();
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
});

test("widening Home closes About Me and restores the desktop biography without changing its route", async () => {
  const user = renderNarrowHome();
  await user.click(screen.getByRole("button", { name: "About Me" }));
  advance(20);
  act(() => narrowLayoutListeners.forEach((listener) => listener({ matches: false })));
  expect(screen.queryByRole("dialog", { name: "About Me" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "About Me" })).not.toBeInTheDocument();
  existingBiography.forEach((text) => expect(screen.getByText(text)).toBeInTheDocument());
  expect(document.body).not.toHaveClass("modal-open");
  expectPath("/");
});

test("browser history leaving Home dismisses About Me instead of carrying it into an alternate view", async () => {
  narrowLayoutMedia.matches = true;
  const user = renderPortfolio(["/projects", "/"]);
  advance();
  await user.click(screen.getByRole("button", { name: "About Me" }));
  advance(20);
  // Browser history can change while a dialog is open; it is not a dialog control.
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expectPath("/projects");
  expect(screen.queryByRole("dialog", { name: "About Me" })).not.toBeInTheDocument();
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
  expect(document.body).not.toHaveClass("modal-open");
  expect(document.body).toHaveClass("portfolio-bounded-view-open");
});

test("About Me retains keyboard focus inside the sheet and can reopen after closing", async () => {
  const user = renderNarrowHome();
  const trigger = screen.getByRole("button", { name: "About Me" });
  await user.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "About Me" });
  const close = within(dialog).getByRole("button", { name: "Close About Me" });
  // Reactstrap reads legacy key codes, which user-event does not populate.
  fireEvent.keyDown(close, { key: "Tab", code: "Tab", keyCode: 9, which: 9 });
  expect(close).toHaveFocus();
  fireEvent.keyDown(close, { key: "Tab", code: "Tab", keyCode: 9, which: 9, shiftKey: true });
  expect(close).toHaveFocus();
  await user.click(within(dialog).getByText(existingBiography[0]));
  expect(dialog).toBeInTheDocument();
  await user.click(close);
  expect(trigger).toHaveFocus();
  await user.keyboard("{Enter}");
  const reopened = screen.getByRole("dialog", { name: "About Me" });
  expect(within(reopened).getByRole("button", { name: "Close About Me" })).toHaveFocus();
  expectPath("/");
});

test.each(["close", "widen", "unmount"])("About Me restores pre-existing inline overflow and its priority after %s", async (method) => {
  const previousValue = document.body.style.getPropertyValue("overflow");
  const previousPriority = document.body.style.getPropertyPriority("overflow");
  document.body.style.setProperty("overflow", "auto", "important");
  try {
    const user = renderNarrowHome();
    await user.click(screen.getByRole("button", { name: "About Me" }));
    expect(document.body).toHaveClass("modal-open");
    if (method === "close") await user.click(screen.getByRole("button", { name: "Close About Me" }));
    else if (method === "widen") act(() => narrowLayoutListeners.forEach((listener) => listener({ matches: false })));
    else cleanup();
    expect(document.body).not.toHaveClass("modal-open");
    expect(document.body.style.getPropertyValue("overflow")).toBe("auto");
    expect(document.body.style.getPropertyPriority("overflow")).toBe("important");
  } finally {
    cleanup();
    document.body.style.setProperty("overflow", previousValue, previousPriority);
  }
});
