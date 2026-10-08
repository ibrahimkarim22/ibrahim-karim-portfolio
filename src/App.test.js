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
  ["kanban", "Tuh-Doo / Kanban Board", KanbanBoardModal],
  ["thisportfolio", "Portfolio", ThisPortfolioModal],
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

async function selectCompactDestination(user, name) {
  await user.click(screen.getByRole("button", { name: "Navigate", exact: true }));
  const dialog = screen.getByRole("dialog", { name: "Choose a destination" });
  await user.click(within(dialog).getByRole("button", { name, exact: true }));
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
    within(center).queryByTitle("Megaracer / TypeRacer profile preview"),
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
    ["LinkedIn", "https://www.linkedin.com/in/ibrahim-karim-abaa952a7/"],
    ["GitHub", "https://github.com/ibrahimkarim22"],
    ["Email", "mailto:22ibrahimkarim@gmail.com"],
  ].forEach(([name, href]) => {
    const link = screen.getByRole("link", { name });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
  expect(screen.getByRole("button", { name: "Megaracer", exact: true })).not.toHaveAttribute("href");
  const preview = screen.queryByTitle("Megaracer / TypeRacer profile preview");
  if (view === "Megaracer") {
    expect(preview).toHaveAttribute("src", "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22");
    expect(preview.closest("a")).toHaveAttribute("href", "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22");
    expect(preview.closest("a")).toHaveAttribute("target", "_blank");
    expect(preview.closest("a")).toHaveAttribute("rel", "noopener noreferrer");
  } else {
    expect(preview).not.toBeInTheDocument();
  }
  expect(screen.queryByAltText("TypeRacer.com scorecard for user ib_ra_heem_22")).not.toBeInTheDocument();
}

let originalMatchMedia;
let desktopHoverMedia;
let desktopHoverListeners;
let narrowLayoutMedia;
let narrowLayoutListeners;
let compactProjectsMedia;
let compactProjectsListeners;
let shortViewportMatches;

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
  compactProjectsListeners = new Set();
  shortViewportMatches = false;
  compactProjectsMedia = {
    get matches() { return narrowLayoutMedia.matches || shortViewportMatches; },
    media: "(max-width: 1250px), (max-height: 700px)",
    addEventListener: jest.fn((event, listener) => compactProjectsListeners.add(listener)),
    removeEventListener: jest.fn((event, listener) => compactProjectsListeners.delete(listener)),
  };
  window.matchMedia = jest.fn((query) => {
    if (query === narrowLayoutMedia.media) return narrowLayoutMedia;
    if (query === compactProjectsMedia.media) return compactProjectsMedia;
    return desktopHoverMedia;
  });
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
    expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
    expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
    expect(screen.getByText(/Hello! I’m Ibrahim/)).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(jest.getTimerCount()).toBe(0);
  });

  test.each([
    ["Projects", "/projects"],
    ["Resume", "/resume"],
    ["3D Profile", "/threeDeeResume"],
    ["Megaracer", "/megaracer"],
  ])("%s removes the entrance and returning Home restores it without remounting the shell", async (label, path) => {
    const user = renderPortfolio();
    const shell = expectCenter("Home").closest(".menu-div-main");
    const navigation = screen.getByRole("navigation", { name: "Portfolio navigation" });
    expect(shell).toHaveClass("home-entry");

    await user.click(within(navigation).getByRole("button", { name: label }));
    expectPath(path);
    expect(expectCenter(label).closest(".menu-div-main")).toBe(shell);
    expect(shell).not.toHaveClass("home-entry");

    await user.click(screen.getByRole("button", { name: "Home" }));
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
    const contacts = screen.getByRole("link", { name: "GitHub" }).parentElement;
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
      expect(screen.getByRole("link", { name: "GitHub" }).parentElement).toBe(contacts);
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
  await user.click(screen.getByRole("button", { name: "Home" }));
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

test.each(["Resume", "3D Profile"])("%s manages the bounded-view body class while preserving unrelated classes", async (label) => {
  document.body.classList.add("existing-page-class");
  try {
    const user = renderPortfolio();
    advance();
    expect(document.body).not.toHaveClass("portfolio-bounded-view-open");
    const toggle = screen.getByRole("button", { name: label });

    await user.click(toggle);
    expect(document.body).toHaveClass("portfolio-bounded-view-open", "existing-page-class");

    await user.click(screen.getByRole("button", { name: "Home" }));
    expectCenter("Home");
    expect(document.body).not.toHaveClass("portfolio-bounded-view-open");
    expect(document.body).toHaveClass("existing-page-class");
  } finally {
    document.body.classList.remove("existing-page-class");
  }
});

test.each(["/resume", "/threeDeeResume"])("unmounting %s removes the bounded-view body class", (path) => {
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

  test("selector modal close restores Projects document scrolling and Home scrolling", async () => {
    const user = renderPortfolio(["/projects"]);
    expect(window.getComputedStyle(document.body).overflow).toBe("auto");
    await user.click(screen.getByRole("button", { name: /^BARD / }));
    expect(window.getComputedStyle(document.body).overflow).toBe("hidden");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expectPath("/projects");
    expect(window.getComputedStyle(document.body).overflow).toBe("auto");

    await user.click(screen.getByRole("button", { name: "Home" }));
    expectCenter("Home");
    expect(document.body.style.getPropertyValue("overflow")).toBe("");
    expect(window.getComputedStyle(document.body).overflow).toBe("auto");
  });

  test("direct modal close restores Projects document scrolling and unmount restores the original overflow", async () => {
    const user = renderPortfolio(["/projects/bard"]);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expectPath("/projects");
    expect(window.getComputedStyle(document.body).overflow).toBe("auto");

    cleanup();
    expect(document.body.style.getPropertyValue("overflow")).toBe("");
    expect(document.body.style.getPropertyPriority("overflow")).toBe("");
    expect(window.getComputedStyle(document.body).overflow).toBe("auto");
  });

  test("history from the navigation wheel into a project closes the wheel and keeps the project scroll lock", async () => {
    narrowLayoutMedia.matches = true;
    const utils = renderPortfolio(["/projects"]);
    await utils.click(screen.getByRole("button", { name: /^BARD / }));
    await utils.click(screen.getByRole("button", { name: "Close", exact: true }));
    await utils.click(screen.getByRole("button", { name: "Navigate", exact: true }));
    expect(screen.getByRole("dialog", { name: "Choose a destination" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Forward", exact: true }));
    expectPath("/projects/bard");
    expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "BARD" })).toBeInTheDocument();
    expect(window.getComputedStyle(document.body).overflow).toBe("hidden");
    await utils.click(screen.getByRole("button", { name: "Close", exact: true }));
    expectPath("/projects");
    expect(document.body).toHaveClass("portfolio-bounded-view-open");
    expect(window.getComputedStyle(document.body).overflow).toBe("hidden");
    expect(screen.getByRole("button", { name: /^BARD / })).toHaveFocus();
  });

  test.each([
    ["mobile", true, false, true],
    ["short desktop", false, true, true],
    ["desktop", false, false, false],
  ])("%s Projects bounds document scrolling only for a compact viewport", (label, narrow, short, bounded) => {
    narrowLayoutMedia.matches = narrow;
    shortViewportMatches = short;
    renderPortfolio(["/projects"]);
    const gallery = within(expectCenter("Projects")).getByRole("region", { name: "Projects" });
    expect(within(gallery).getAllByRole("button")).toHaveLength(6);
    expect(document.body.classList.contains("portfolio-bounded-view-open")).toBe(bounded);
    expect(window.getComputedStyle(document.body).overflow).toBe(bounded ? "hidden" : "auto");
    expect(screen.getByRole("button", { name: narrow ? "Go back" : "Home", exact: true })).toBeEnabled();
  });

  test("mobile project modal close preserves the gallery node and its scroll position while keeping the document bounded", async () => {
    narrowLayoutMedia.matches = true;
    const user = renderPortfolio(["/projects"]);
    const gallery = within(expectCenter("Projects")).getByRole("region", { name: "Projects" });
    gallery.scrollTop = 350;
    const trigger = within(gallery).getByRole("button", { name: /^BARD / });
    await user.click(trigger);
    expectPath("/projects/bard");
    await user.click(screen.getByRole("button", { name: "Close", exact: true }));
    expectPath("/projects");
    expect(within(expectCenter("Projects")).getByRole("region", { name: "Projects" })).toBe(gallery);
    expect(gallery.scrollTop).toBe(350);
    expect(trigger).toHaveFocus();
    expect(document.body).toHaveClass("portfolio-bounded-view-open");
    expect(window.getComputedStyle(document.body).overflow).toBe("hidden");
    expect(document.body.style.getPropertyValue("overflow")).toBe("");
  });

  test("narrowing Projects bounds the document without remounting the gallery or losing its scroll position", () => {
    renderPortfolio(["/projects"]);
    const gallery = within(expectCenter("Projects")).getByRole("region", { name: "Projects" });
    gallery.scrollTop = 220;
    expect(document.body).not.toHaveClass("portfolio-bounded-view-open");
    narrowLayoutMedia.matches = true;
    act(() => {
      narrowLayoutListeners.forEach((listener) => listener({ matches: true }));
      compactProjectsListeners.forEach((listener) => listener({ matches: true }));
    });
    expect(within(expectCenter("Projects")).getByRole("region", { name: "Projects" })).toBe(gallery);
    expect(gallery.scrollTop).toBe(220);
    expect(document.body).toHaveClass("portfolio-bounded-view-open");
    expect(window.getComputedStyle(document.body).overflow).toBe("hidden");
  });

  test("mobile direct project modal close keeps the existing gallery and releases the inline modal lock to the bounded viewport", async () => {
    narrowLayoutMedia.matches = true;
    const user = renderPortfolio(["/projects/bard"]);
    const gallery = within(expectCenter("Projects")).getByRole("region", { name: "Projects" });
    gallery.scrollTop = 180;
    await user.click(screen.getByRole("button", { name: "Close", exact: true }));
    expectPath("/projects");
    expect(within(expectCenter("Projects")).getByRole("region", { name: "Projects" })).toBe(gallery);
    expect(gallery.scrollTop).toBe(180);
    expect(document.body).toHaveClass("portfolio-bounded-view-open");
    expect(document.body.style.getPropertyValue("overflow")).toBe("");
    expect(window.getComputedStyle(document.body).overflow).toBe("hidden");
  });

  test("closing the mobile Projects navigation wheel does not restore inline overflow over the gallery's document lock", async () => {
    document.body.style.setProperty("overflow", "scroll", "important");
    narrowLayoutMedia.matches = true;
    const user = renderPortfolio(["/projects"]);
    const center = expectCenter("Projects");
    const gallery = within(center).getByRole("region", { name: "Projects" });
    const entry = screen.getByLabelText("Current entry").textContent;
    gallery.scrollTop = 240;
    await user.click(screen.getByRole("button", { name: "Navigate", exact: true }));
    expect(screen.getByRole("dialog", { name: "Choose a destination" })).toBeInTheDocument();
    expectPath("/projects");
    expect(screen.getByLabelText("Current entry")).toHaveTextContent(entry);
    expect(expectCenter("Projects")).toBe(center);
    expect(within(center).getByRole("region", { name: "Projects" })).toBe(gallery);
    expect(gallery.scrollTop).toBe(240);
    await user.click(screen.getByRole("button", { name: "Close navigation", exact: true }));
    expect(screen.queryByRole("dialog", { name: "Choose a destination" })).not.toBeInTheDocument();
    expect(document.body).toHaveClass("portfolio-bounded-view-open");
    expect(document.body.style.getPropertyValue("overflow")).toBe("");
    expect(window.getComputedStyle(document.body).overflow).toBe("hidden");
    expect(within(expectCenter("Projects")).getByRole("region", { name: "Projects" })).toBe(gallery);
    expect(gallery.scrollTop).toBe(240);
  });

  test.each(["Home", "unmount", "widen"])("compact Projects restores original overflow and priority on %s without leaving a body lock", async (exit) => {
    document.body.style.setProperty("overflow", "scroll", "important");
    document.body.style.setProperty("color", "purple", "important");
    document.body.classList.add("existing-page-class");
    narrowLayoutMedia.matches = true;
    const user = renderPortfolio(["/projects"]);
    expect(document.body).toHaveClass("portfolio-bounded-view-open");
    expect(document.body.style.getPropertyValue("overflow")).toBe("");
    if (exit === "Home") await selectCompactDestination(user, "Home");
    else if (exit === "unmount") cleanup();
    else {
      narrowLayoutMedia.matches = false;
      act(() => {
        narrowLayoutListeners.forEach((listener) => listener({ matches: false }));
        compactProjectsListeners.forEach((listener) => listener({ matches: false }));
      });
      expectCenter("Projects");
    }
    expect(document.body).not.toHaveClass("portfolio-bounded-view-open");
    expect(document.body.style.getPropertyValue("overflow")).toBe("scroll");
    expect(document.body.style.getPropertyPriority("overflow")).toBe("important");
    expect(document.body.style.getPropertyValue("color")).toBe("purple");
    expect(document.body.style.getPropertyPriority("color")).toBe("important");
    expect(document.body).toHaveClass("existing-page-class");
  });

  test.each(["Home", "unmount"])("restores pre-Home inline overflow and priority on %s without touching unrelated styles", async (exit) => {
    document.body.style.setProperty("overflow", "scroll", "important");
    document.body.style.setProperty("color", "purple", "important");
    document.body.classList.add("existing-page-class");
    const user = renderPortfolio(["/projects/bard"]);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(window.getComputedStyle(document.body).overflow).toBe("scroll");
    if (exit === "Home") await user.click(screen.getByRole("button", { name: "Home" }));
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

test("Projects remains active on repeat activation and Home clears expanded and pressed state", async () => {
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
  await user.click(screen.getByRole("button", { name: "Home" }));
  expectPath("/");
  expect(projects).toHaveAttribute("aria-expanded", "false");
  expect(projects).toHaveAttribute("aria-pressed", "false");
  expectCenter("Home");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test("Home restores the Logo and browser Back returns to Projects", async () => {
  const user = renderPortfolio(["/projects"]);
  const backToHome = screen.getByRole("button", { name: "Home" });

  await user.click(backToHome);
  expectPath("/");
  expect(within(expectCenter("Home")).getByLabelText("Portfolio logo")).toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Back" }));
  expectPath("/projects");
  expectCenter("Projects");
});

test("3D Profile remains active on repeat activation and Home restores Logo", async () => {
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
  await user.click(screen.getByRole("button", { name: "Home" }));
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
  await user.click(screen.getByRole("button", { name: "Home" }));
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
  await user.click(screen.getByRole("button", { name: "Megaracer", exact: true }));
  expectPreservedContent("Megaracer");
});

const previewCases = [
  ["HeyYou", "Location sharing meets conversation.", "A mobile app combining real-time location sharing and group messaging.", "JavaScript · React Native · Android Studio · Socket.io · MongoDB · Node.js · Docker · Google Cloud"],
  ["BARD", "A new way into Shakespeare.", "A mobile learning project exploring Shakespeare’s plays through reading, quizzes, and video.", "JavaScript · React Native · Android Studio · Redux · Firebase · Firestore"],
  ["Portfolio", "Code with a visual signature.", "A developer portfolio combining a React interface with modeled and animated 3D scenes.", "JavaScript · React · Firebase · SCSS · Blender 3D · React Three Fiber"],
  ["KRISPY", "Streams, cinema, and discovery.", "A web streaming project bringing live TV, global feeds, and public-domain films together.", "JavaScript · React · Firebase · Redux · Bootstrap · SCSS"],
  ["Tuh-Doo / Kanban Board", "From to-do to done.", "A task board with drag-and-drop columns and saved work tied to each user’s account.", "JavaScript · React · SCSS · Firebase · Firestore"],
  ["Whack a Mole", "A playful test of timing.", "A browser game built around quick reactions and a ticking score clock.", "JavaScript · HTML · SCSS"],
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
  await user.tab(); // HeyYou
  const focused = screen.getByRole("button", { name: /^HeyYou / });
  expect(focused).toHaveFocus();
  const context = screen.getByRole("complementary", { name: "Portfolio context" });
  expect(within(context).getByRole("heading", { name: "Location sharing meets conversation." })).toBeInTheDocument();
  const hovered = screen.getByRole("button", { name: /^Whack a Mole / });
  await user.hover(hovered);
  expect(within(context).getByRole("heading", { name: "A playful test of timing." })).toBeInTheDocument();
  await user.unhover(hovered);
  expect(within(context).getByRole("heading", { name: "Location sharing meets conversation." })).toBeInTheDocument();
  await user.tab();
  expect(within(context).getByRole("heading", { name: "A new way into Shakespeare." })).toBeInTheDocument();
  for (let i = 0; i < 5; i += 1) await user.tab();
  expectRestingContext();
});

test("new keyboard focus supersedes an existing hover and blur returns to the hovered card", async () => {
  const user = renderPortfolio(["/projects"]);
  await user.hover(screen.getByRole("button", { name: /^Whack a Mole / }));
  await user.tab();
  const context = screen.getByRole("complementary", { name: "Portfolio context" });
  expect(within(context).getByRole("heading", { name: "Location sharing meets conversation." })).toBeInTheDocument();
  await user.tab({ shift: true });
  expect(within(context).getByRole("heading", { name: "A playful test of timing." })).toBeInTheDocument();
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
  expect(within(context).getByRole("heading", { name: "A playful test of timing." })).toBeInTheDocument();
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

test("Home clears preview state and restores the biography and signature", async () => {
  const user = renderPortfolio(["/projects"]);
  await user.hover(screen.getByRole("button", { name: /^BARD / }));
  await user.click(screen.getByRole("button", { name: "Home" }));
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

test.each(projectCases)("deep link /projects/%s opens only its modal with Projects active and hidden ropes", (id, name) => {
  renderPortfolio([`/projects/${id}`]);
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByRole("dialog", { name })).toBeInTheDocument();
  expect(document.querySelector(".navigation-ropes")).toHaveStyle({ display: "none" });
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

test("selector-opened Close goes Back and Forward reopens the modal and toggles rope visibility", async () => {
  const user = renderPortfolio(["/projects"]);
  const ropes = document.querySelector(".navigation-ropes");
  expect(ropes.style.display).not.toBe("none");
  await user.click(screen.getByRole("button", { name: /^BARD / }));
  expect(ropes).toHaveStyle({ display: "none" });
  await user.click(screen.getByRole("button", { name: "Close" }));
  expectPath("/projects");
  expect(document.querySelector(".navigation-ropes")).toBe(ropes);
  expect(ropes.style.display).not.toBe("none");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expectCenter("Projects");
  await user.click(screen.getByRole("button", { name: "Forward" }));
  expectPath("/projects/bard");
  expect(ropes).toHaveStyle({ display: "none" });
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

test("navigation keeps five semantic controls and decorative wrappers without an external hover preview", () => {
  renderPortfolio(["/projects"]);
  const nav = screen.getByRole("navigation", { name: "Portfolio navigation" });
  expect(within(nav).getAllByRole("button")).toHaveLength(5);
  expect(within(nav).getByRole("button", { name: "Home", exact: true })).toHaveAttribute("type", "button");
  [["Projects", "Projects", "projects-title-div"], ["Resume", "Resume", "pdfResume-title-div"], ["3D Profile", "3D profile", "threeResume-title-div"]].forEach(([name, visibleName, className]) => {
    const button = within(nav).getByRole("button", { name });
    expect(button).toHaveAttribute("type", "button");
    // Each label includes its tied letter without changing the visible wording.
    // eslint-disable-next-line testing-library/no-node-access
    expect(button.querySelector(`.${className}`)).toHaveTextContent(visibleName);
    expect(button).not.toHaveAttribute("target");
  });
  const megaracer = within(nav).getByRole("button", { name: "Megaracer", exact: true });
  expect(megaracer).not.toHaveAttribute("href");
  expect(megaracer).not.toHaveAttribute("target");
  // eslint-disable-next-line testing-library/no-node-access
  expect(megaracer.querySelector(".megaracer")).toHaveTextContent("Megaracer");
  expect(megaracer).toHaveAttribute("aria-controls", "megaracer-view");
  expect(within(nav).queryByRole("link", { name: "Visit Megaracer / TypeRacer profile" })).not.toBeInTheDocument();
  expect(screen.queryByTitle("Megaracer / TypeRacer profile preview")).not.toBeInTheDocument();
});

test.each(["/megaracer", "/megaracer/"])("direct entry at %s selects one center profile and its navigation", (path) => {
  renderPortfolio([path]);
  const center = expectCenter("Megaracer");
  expect(screen.getByRole("button", { name: "Megaracer", exact: true })).toHaveAttribute("aria-current", "page");
  expect(within(center).getByRole("link", { name: "Visit Megaracer / TypeRacer profile" })).toBeInTheDocument();
  expect(screen.queryByLabelText("Portfolio logo")).not.toBeInTheDocument();
});

test("Megaracer hover leaves Home intact; selection and repeat clicks preserve the center frame and history", async () => {
  const utils = renderPortfolio();
  const center = expectCenter("Home");
  const racer = screen.getByRole("button", { name: "Megaracer", exact: true });
  await utils.hover(racer);
  expectPath("/");
  expect(screen.queryByTitle("Megaracer / TypeRacer profile preview")).not.toBeInTheDocument();
  await utils.click(racer);
  expectPath("/megaracer");
  expect(expectCenter("Megaracer")).toBe(center);
  const frame = screen.getByTitle("Megaracer / TypeRacer profile preview");
  const entry = screen.getByLabelText("Current entry").textContent;
  advance(20);
  expect(screen.getByRole("heading", { name: "Megaracer view" })).toHaveFocus();
  await utils.click(racer);
  expect(screen.getByTitle("Megaracer / TypeRacer profile preview")).toBe(frame);
  expect(screen.getByLabelText("Current entry")).toHaveTextContent(entry);
  await utils.click(screen.getByRole("button", { name: "Back", exact: true }));
  expectPath("/");
  expectCenter("Home");
  expect(frame).not.toBeInTheDocument();
  await utils.click(screen.getByRole("button", { name: "Forward", exact: true }));
  expectPath("/megaracer");
  expectCenter("Megaracer");
  expect(screen.getByRole("button", { name: "Megaracer", exact: true })).toHaveAttribute("aria-current", "page");
});

test("keyboard activation of Resume changes the route and center while preserving the Home shell", async () => {
  const user = renderPortfolio();
  advance();
  const center = expectCenter("Home");
  const nav = screen.getByRole("navigation", { name: "Portfolio navigation" });
  const biography = screen.getByText(/Hello! I’m Ibrahim/);
  await user.tab(); // Home.
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
  expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Portfolio logo")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Interactive 3D profile")).not.toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test("Resume stacks Download and Open links in the context while the PDF starts without a header", async () => {
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
  const open = within(context).getByRole("link", { name: "Open Resume" });
  expect(desktopDownload.compareDocumentPosition(open) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(open).toHaveAttribute("href", "/Ibrahim_Karim_Full_Stack_Resume.pdf");
  expect(open).toHaveAttribute("target", "_blank");
  expect(open).toHaveAttribute("rel", "noopener noreferrer");
  expect(within(center).queryByRole("banner")).not.toBeInTheDocument();
  await user.tab(); // Desktop context download link.
  expect(desktopDownload).toHaveFocus();
  await user.tab(); // Open Resume directly below Download Resume.
  expect(open).toHaveFocus();
});

test("Resume Home returns Home without a loader and Back restores Resume", async () => {
  const user = renderPortfolio(["/resume"]);
  await user.click(screen.getByRole("button", { name: "Home" }));
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
  await user.click(screen.getByRole("button", { name: "Home" }));

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
    ["Email", "mailto:22ibrahimkarim@gmail.com"],
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

test.each(activeViewCases)("narrow %s has Home inside the wheel and no separate Home shortcut, About Me or inline biography", async (label, path) => {
  narrowLayoutMedia.matches = true;
  const user = renderPortfolio([path]);
  expect(screen.queryByRole("button", { name: "About Me" })).not.toBeInTheDocument();
  expect(screen.queryByRole("dialog", { name: "About Me" })).not.toBeInTheDocument();
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Home", exact: true })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Go back", exact: true })).toBeEnabled();
  await selectCompactDestination(user, "Home");
  expectPath("/");
  expect(screen.getByRole("button", { name: "About Me" })).toBeInTheDocument();
  expect(screen.queryByRole("dialog", { name: "About Me" })).not.toBeInTheDocument();
  expect(screen.queryByText(/Hello! I’m Ibrahim/)).not.toBeInTheDocument();
});

test("compact Go back returns to the previous visited section without creating a new history entry", async () => {
  narrowLayoutMedia.matches = true;
  const user = renderPortfolio();
  await user.click(screen.getByRole("button", { name: "Projects", exact: true }));
  const projectsEntry = screen.getByLabelText("Current entry").textContent;
  await selectCompactDestination(user, "Resume");
  expectPath("/resume");
  await user.click(screen.getByRole("button", { name: "Go back", exact: true }));
  advance(20);
  expectPath("/projects");
  expect(screen.getByLabelText("Current entry")).toHaveTextContent(projectsEntry);
  expect(screen.getByRole("heading", { name: "Projects view" })).toHaveFocus();
  expect(document.body).not.toHaveClass("modal-open");
  expect(document.body).toHaveClass("portfolio-bounded-view-open");
  await user.click(screen.getByRole("button", { name: "Go back", exact: true }));
  expectPath("/");
  expect(screen.getByRole("button", { name: "About Me", exact: true })).toBeInTheDocument();
});

test.each(activeViewCases)("direct compact entry at %s uses Home as the Go back fallback", async (label, path) => {
  narrowLayoutMedia.matches = true;
  const user = renderPortfolio([path]);
  await user.click(screen.getByRole("button", { name: "Go back", exact: true }));
  advance(20);
  expectPath("/");
  expect(screen.getByRole("heading", { name: "Home view" })).toHaveFocus();
  expect(document.body).not.toHaveClass("modal-open", "portfolio-bounded-view-open");
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
