import { act, render, screen, within } from "@testing-library/react";
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
    within(center).queryByLabelText("Interactive 3D profile"),
  ].filter(Boolean);
  expect(renderedViews).toHaveLength(1);
  return center;
}

function expectPreservedContent() {
  const biography = screen.getByText(/Hello! I’m Ibrahim, a full-stack web and mobile developer/i);
  expect(biography.parentElement.querySelectorAll("p")).toHaveLength(2);
  expect(screen.getByText(/I work with technologies like JavaScript, CSS, React/i)).toBeInTheDocument();
  expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
  expect(screen.getByText("© 2023-2042 Ibrahim Karim.")).toBeInTheDocument();
  const resume = screen.getByRole("link", { name: "Resume" });
  expect(resume).toHaveAttribute("href", "/Ibrahim_Karim_Full_Stack_Resume.pdf");
  expect(resume).toHaveAttribute("target", "_blank");
  expect(resume).toHaveAttribute("rel", "noopener noreferrer");
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

beforeEach(() => {
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
  jest.clearAllTimers();
  jest.useRealTimers();
});

test("initial home shows its full-page loader for 5,000 ms before the shell and Logo", () => {
  renderPortfolio();
  expect(screen.getByText("Loading...").closest(".progress-container")).not.toHaveClass("progress-container--contained");
  expect(screen.queryByText("Full-Stack Developer")).not.toBeInTheDocument();
  advance(4950);
  expect(screen.getByText("Loading...")).toBeInTheDocument();
  advance(50);
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
  expect(within(expectCenter("Home")).getByLabelText("Portfolio logo")).toBeInTheDocument();
});

test("initial projects renders the shell and all six choices immediately", () => {
  renderPortfolio(["/projects"]);
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
  const selector = within(expectCenter("Projects")).getByRole("region", { name: "Projects" });
  expect(within(selector).getAllByRole("button")).toHaveLength(6);
  projectCases.forEach(([, name]) => expect(within(selector).getByRole("button", { name: new RegExp(name) })).toBeInTheDocument());
});

test("Projects toggles the route with expanded and pressed state", async () => {
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
  expectPath("/");
  expect(projects).toHaveAttribute("aria-expanded", "false");
  expect(projects).toHaveAttribute("aria-pressed", "false");
  expectCenter("Home");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test("3D Profile toggles in the same tab and restores Logo on close", async () => {
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
  expectPath("/");
  expect(profile).toHaveAttribute("aria-pressed", "false");
  expect(within(expectCenter("Home")).getByLabelText("Portfolio logo")).toBeInTheDocument();
});

test("switching child routes preserves the biography node and shows one center view", async () => {
  const user = renderPortfolio(["/projects"]);
  const biography = screen.getByText(/Hello! I’m Ibrahim/);
  const center = expectCenter("Projects");
  await user.click(screen.getByRole("button", { name: "3D Profile" }));
  expectPath("/threeDeeResume");
  expect(expectCenter("3D Profile")).toBe(center);
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBe(biography);
  expect(screen.getByRole("button", { name: "Projects" })).toHaveAttribute("aria-expanded", "false");
  await user.click(screen.getByRole("button", { name: "Projects" }));
  expectPath("/projects");
  expect(expectCenter("Projects")).toBe(center);
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBe(biography);
  expect(screen.getByRole("button", { name: "3D Profile" })).toHaveAttribute("aria-pressed", "false");
});

test("initial 3D deep link and its return home never show the Home loader", async () => {
  const user = renderPortfolio(["/threeDeeResume"]);
  expectCenter("3D Profile");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "3D Profile" }));
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

test("preserves biography, contacts, title, copyright, Resume, and MegaRacer in every view", async () => {
  const user = renderPortfolio(["/"], new Date("2042-06-15T12:00:00Z"));
  advance();
  expectPreservedContent();
  await user.click(screen.getByRole("button", { name: "Projects" }));
  expectPreservedContent();
  await user.click(screen.getByRole("button", { name: "3D Profile" }));
  expectPreservedContent();
});

test("copyright shows only the start year at the 2023 boundary", () => {
  renderPortfolio(["/projects"], new Date("2023-06-15T12:00:00Z"));
  expect(screen.getByText("© 2023 Ibrahim Karim.")).toBeInTheDocument();
});

test.each(["/about", "/PROJECTS", "/THREEDEERESUME"])("unsupported path %s renders no portfolio shell", (path) => {
  renderPortfolio([path]);
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
