import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./screens/Home";
import Projects from "./screens/Projects";

jest.mock("./components/Logo", () => function MockLogo() {
  return <div aria-label="Portfolio logo" />;
});

jest.mock("./components/Sky", () => function MockSky() {
  return null;
});

jest.mock("./components/WhackaModal", () => function MockWhackaModal() {
  return null;
});

jest.mock("./components/KrispyModal", () => function MockKrispyModal() {
  return null;
});

jest.mock("./components/HeyYouModal", () => function MockHeyYouModal() {
  return null;
});

jest.mock("./components/BardModal", () => function MockBardModal() {
  return null;
});

jest.mock("./components/ThisPortfolioModal", () => function MockThisPortfolioModal() {
  return null;
});

jest.mock("./components/KanbanBoardModal", () => function MockKanbanBoardModal() {
  return null;
});

function renderLoadedHome(now) {
  jest.useFakeTimers();
  if (now) {
    jest.setSystemTime(now);
  }

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  act(() => {
    jest.advanceTimersByTime(5000);
  });
}

function renderProjects(now) {
  jest.useFakeTimers();
  if (now) {
    jest.setSystemTime(now);
  }

  render(
    <MemoryRouter initialEntries={["/projects"]}>
      <Projects />
    </MemoryRouter>
  );
}

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test("shows Ibrahim's updated general-purpose bio", () => {
  renderLoadedHome();

  expect(
    screen.getByText(/Hello! I’m Ibrahim, a full-stack web and mobile developer/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(/I work with technologies like JavaScript, CSS, React/i)
  ).toBeInTheDocument();
});

test("opens the current PDF resume from the homepage", () => {
  renderLoadedHome();

  expect(screen.getByRole("link", { name: "Resume" })).toHaveAttribute(
    "href",
    "/Ibrahim_Karim_Full_Stack_Resume.pdf"
  );
});

test("opens the current PDF resume from both Projects links", () => {
  renderProjects();

  const resumeLinks = screen.getAllByRole("link", { name: "Resume" });
  expect(resumeLinks).toHaveLength(2);
  resumeLinks.forEach((link) => {
    expect(link).toHaveAttribute(
      "href",
      "/Ibrahim_Karim_Full_Stack_Resume.pdf"
    );
  });
});

test("uses the supported TypeRacer profile for the MegaRacer hover preview", () => {
  renderLoadedHome();

  const profilePreview = screen.getByTitle(
    "TypeRacer profile for ib_ra_heem_22"
  );
  expect(profilePreview).toHaveAttribute(
    "src",
    "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22"
  );
  expect(profilePreview.closest("a")).toHaveAttribute(
    "href",
    "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22"
  );
  expect(
    screen.queryByAltText("TypeRacer.com scorecard for user ib_ra_heem_22")
  ).not.toBeInTheDocument();
});

test("shows the copyright range through the current year on the homepage", () => {
  renderLoadedHome(new Date("2042-06-15T12:00:00Z"));

  expect(screen.getByText("© 2023–2042 Ibrahim Karim.")).toBeInTheDocument();
});

test("shows the same copyright range on the Projects page", () => {
  renderProjects(new Date("2042-06-15T12:00:00Z"));

  expect(screen.getByText("© 2023–2042 Ibrahim Karim.")).toBeInTheDocument();
});

test("shows only the start year when the current year is 2023", () => {
  renderLoadedHome(new Date("2023-06-15T12:00:00Z"));

  expect(screen.getByText("© 2023 Ibrahim Karim.")).toBeInTheDocument();
});

test("opens the visible MegaRacer item in a safe new tab", () => {
  renderLoadedHome();

  const megaracerLink = screen.getByRole("link", { name: "Megaracer" });
  expect(megaracerLink).toHaveAttribute(
    "href",
    "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22"
  );
  expect(megaracerLink).toHaveAttribute("target", "_blank");
  expect(megaracerLink).toHaveAttribute("rel", "noopener noreferrer");
});
