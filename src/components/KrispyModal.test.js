import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KrispyModal from "./KrispyModal";

const films = [
  ["The Vagabond", "https://krispy22.web.app/movie/film-vagabond?collection=chaplin&watch=1"],
  ["One A.M.", "https://krispy22.web.app/movie/film-one-am?collection=chaplin&watch=1"],
];

// JSDOM has no media engine; real playback is checked in the browser review.
beforeAll(() => jest.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

it("names the dialog and exposes the film collection and technical story", () => {
  render(<KrispyModal isOpen closeModal={jest.fn()} />);

  const dialog = screen.getByRole("dialog", { name: "KRISPY" });
  expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(within(dialog).getByRole("heading", { name: "Charlie Chaplin Collection" })).toBeInTheDocument();
  expect(within(dialog).getByRole("heading", { name: "Behind the screen" })).toBeInTheDocument();
  expect(within(dialog).getByRole("heading", { name: "A personal collection" })).toBeInTheDocument();
});

it("presents the current technology stack and explains account storage accurately", () => {
  render(<KrispyModal isOpen closeModal={jest.fn()} />);

  const dialog = within(screen.getByRole("dialog", { name: "KRISPY" }));
  const technologyList = dialog.getByRole("list", { name: "Main technology stack" });
  expect(within(technologyList).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
    "JavaScript", "React", "Firebase Authentication", "Cloud Firestore", "HLS.js", "CSS",
  ]);
  expect(dialog.getByText("Firebase Authentication handles email/password accounts. Saving to My List requires login. Favorites are stored in Cloud Firestore and sync across devices signed in to the same account. Playback progress and recently viewed titles stay in this browser, separately for each account.", { exact: true })).toBeInTheDocument();
  expect(dialog.getByText("React Context shares library state, with a browser cache for favorites and a one-time import of existing saved titles. My List shows sync status and offers Retry sync when a save fails.", { exact: true })).toBeInTheDocument();
});

it("presents all nine chapter screenshots in order with reserved lazy image geometry", () => {
  render(<KrispyModal isOpen closeModal={jest.fn()} />);

  const dialog = screen.getByRole("dialog");
  const groups = [...dialog.querySelectorAll(".krispy-chapter .krispy-favorites-demo")];
  const screenshots = [...dialog.querySelectorAll(".krispy-chapter .krispy-favorites-demo img")];
  expect(groups.map((group) => within(group).getAllByRole("img").length)).toEqual([2, 3, 3, 1]);
  expect(screenshots.map((image) => ["src", "alt", "width", "height"].map((attribute) => image.getAttribute(attribute)))).toEqual([
    ["krispyMovies.png", "KRISPY movies page with Big Buck Bunny featured above the film collection", "1920", "919"],
    ["krispyFilmPreview.png", "KRISPY film preview for The Adventurer over the movie collection", "1919", "919"],
    ["krispyLiveTV.png", "KRISPY Live TV page with Danish Parliament and UN Web TV", "1920", "919"],
    ["krispyLiveTVPreview.png", "KRISPY Live TV preview for the Danish Parliament channel", "1919", "915"],
    ["krispyLiveTVDetails.png", "KRISPY UN Web TV page with channel details and source information", "1920", "919"],
    ["krispyLogin.png", "KRISPY email login screen for saving favorites", "1920", "919"],
    ["krispyMyList.png", "KRISPY My List page with saved films and collection filters", "1920", "919"],
    ["krispyAccount.png", "Earlier KRISPY account screen showing local favorites storage", "1920", "919"],
    ["krispyGlobe.png", "KRISPY Globe page with Alveus Sanctuary and Abisko webcams", "1920", "919"],
  ]);
  screenshots.forEach((image) => {
    expect(image).toHaveAttribute("loading", "lazy");
  });
  groups.forEach((group) => {
    expect(group.closest(".krispy-chapter").children[2]).toBe(group);
    expect(group.querySelector('source[media*="prefers-reduced-motion"]')).toBeNull();
  });
});

it("keeps project links free of decorative arrow glyphs, including the movie error action", () => {
  render(<KrispyModal isOpen closeModal={jest.fn()} />);
  fireEvent.error(screen.getByLabelText("The Vagabond (1916), Charlie Chaplin"));

  const links = [...screen.getByRole("dialog").querySelectorAll("a")];
  links.forEach((link) => expect(link.textContent).not.toMatch(/[\u2190-\u21ff]/));
});

it("reaches every chapter screenshot preview in order with the keyboard", async () => {
  const user = userEvent.setup();
  render(<KrispyModal isOpen closeModal={jest.fn()} />);

  const dialog = screen.getByRole("dialog");
  await waitFor(() => expect(dialog).toHaveFocus());
  screen.getByRole("link", { name: "Watch film: One A.M. (opens in a new tab)" }).focus();
  const screenshots = [...dialog.querySelectorAll(".krispy-chapter img")];

  for (const screenshot of screenshots) {
    await user.tab();
    expect(screenshot.closest("figure")).toHaveFocus();
  }

  await user.tab();
  expect(screen.getByLabelText("The Vagabond (1916), Charlie Chaplin")).toHaveFocus();
});

it("reveals focused screenshot previews only when their row overflows", async () => {
  render(<KrispyModal isOpen closeModal={jest.fn()} />);
  const dialog = screen.getByRole("dialog");
  await waitFor(() => expect(dialog).toHaveFocus());

  const row = dialog.querySelector(".krispy-favorites-demo");
  const [firstPreview, secondPreview] = within(row).getAllByRole("figure");
  Object.defineProperties(row, {
    clientWidth: { value: 300, configurable: true },
    scrollWidth: { value: 600, configurable: true },
  });
  firstPreview.scrollIntoView = jest.fn();
  secondPreview.scrollIntoView = jest.fn();

  secondPreview.focus();
  expect(secondPreview).toHaveFocus();
  expect(secondPreview.scrollIntoView).toHaveBeenCalledWith({ block: "nearest", inline: "nearest" });

  Object.defineProperty(row, "scrollWidth", { value: 300 });
  firstPreview.focus();
  expect(firstPreview).toHaveFocus();
  expect(firstPreview.scrollIntoView).not.toHaveBeenCalled();
});

it.each(films)("keeps %s as a safe, keyboard-accessible film link", async (title, url) => {
  const user = userEvent.setup();
  render(<KrispyModal isOpen closeModal={jest.fn()} />);
  const link = screen.getByRole("link", { name: `Watch ${title} (opens in a new tab)` });
  expect(link).toHaveAttribute("href", url);
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(within(link).getByRole("img")).toHaveAccessibleName(/charlie chaplin/i);

  // Observe native link activation without navigating JSDOM to an external site.
  const activated = jest.fn((event) => event.preventDefault());
  link.addEventListener("click", activated);
  link.focus();
  expect(link).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(activated).toHaveBeenCalledTimes(1);
  await user.click(link);
  expect(activated).toHaveBeenCalledTimes(2);
});

it("keeps all three original footer actions and safe external destinations", () => {
  render(<KrispyModal isOpen closeModal={jest.fn()} />);
  const footer = screen.getByRole("group", { name: "Krispy project actions" });
  expect(within(footer).getByRole("button", { name: "Close", exact: true })).toBeInTheDocument();
  const watch = within(footer).getByRole("link", { name: /watch!/i });
  const github = within(footer).getByRole("link", { name: /github/i });
  expect(watch).toHaveAttribute("href", "https://krispy22.web.app");
  expect(github).toHaveAttribute("href", "https://github.com/ibrahimkarim22/krispy");
  [watch, github].forEach((link) => {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

it.each(["Close project", "Close"])("closes through the %s control", async (name) => {
  const closeModal = jest.fn();
  const user = userEvent.setup();
  render(<KrispyModal isOpen closeModal={closeModal} />);
  await user.click(screen.getByRole("button", { name, exact: true }));
  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("closes with Escape", () => {
  const closeModal = jest.fn();
  render(<KrispyModal isOpen closeModal={closeModal} />);
  fireEvent.keyUp(screen.getByRole("dialog"), { key: "Escape", keyCode: 27 });
  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("contains keyboard focus and restores it to the opener when closed", async () => {
  const { rerender } = render(<><button>Open Krispy</button><KrispyModal isOpen={false} closeModal={jest.fn()} /></>);
  const opener = screen.getByRole("button", { name: "Open Krispy" });
  opener.focus();
  rerender(<><button>Open Krispy</button><KrispyModal isOpen closeModal={jest.fn()} /></>);
  const dialog = screen.getByRole("dialog");
  await waitFor(() => expect(dialog).toHaveFocus());
  const lastAction = within(dialog).getByRole("link", { name: /github/i });
  lastAction.focus();
  // Reactstrap reads the legacy `which` field, which user-event leaves at zero.
  fireEvent.keyDown(lastAction, { key: "Tab", keyCode: 9, which: 9 });
  expect(within(dialog).getByRole("button", { name: "Close project" })).toHaveFocus();
  fireEvent.keyDown(within(dialog).getByRole("button", { name: "Close project" }), { key: "Tab", keyCode: 9, which: 9, shiftKey: true });
  expect(lastAction).toHaveFocus();
  opener.focus();
  expect(within(dialog).getByRole("button", { name: "Close project" })).toHaveFocus();

  rerender(<><button>Open Krispy</button><KrispyModal isOpen={false} closeModal={jest.fn()} /></>);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(opener).toHaveFocus();
});

it("remounts the animated presentation after closing and reopening", async () => {
  const { rerender } = render(<KrispyModal isOpen closeModal={jest.fn()} />);
  const firstTitle = screen.getByRole("heading", { name: "KRISPY", exact: true });
  expect(screen.getByRole("document")).toHaveClass("krispy-modal-frame-open");
  rerender(<KrispyModal isOpen={false} closeModal={jest.fn()} />);
  expect(firstTitle).not.toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  rerender(<KrispyModal isOpen closeModal={jest.fn()} />);
  expect(screen.getByRole("heading", { name: "KRISPY", exact: true })).not.toBe(firstTitle);
  expect(screen.getByRole("document")).toHaveClass("krispy-modal-frame-open");
});

it("does not expose the presentation or actions while closed", () => {
  render(<KrispyModal isOpen={false} closeModal={jest.fn()} />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

it("presents the exact requested movie with paused native inline controls", () => {
  render(<KrispyModal isOpen closeModal={jest.fn()} />);
  const movie = screen.getByLabelText("The Vagabond (1916), Charlie Chaplin");
  expect(movie.tagName).toBe("VIDEO");
  expect(movie).toHaveAttribute("src", "https://publicdomainmovie.net/movie.php?id=CC_1916_07_10_TheVagabond&type=.mp4");
  expect(movie).toHaveAttribute("controls");
  expect(movie).toHaveAttribute("playsinline");
  expect(movie).toHaveAttribute("preload", "metadata");
  expect(movie).toHaveAttribute("tabindex", "0");
  expect(movie).not.toHaveAttribute("autoplay");
  expect(movie).not.toHaveAttribute("loop");
});

it("explains a video loading error and keeps the original source available", () => {
  render(<KrispyModal isOpen closeModal={jest.fn()} />);
  fireEvent.error(screen.getByLabelText("The Vagabond (1916), Charlie Chaplin"));
  expect(screen.getByRole("status")).toHaveTextContent("The film could not load from its original source.");
  expect(within(screen.getByRole("status")).getByRole("link", { name: /open the original movie source/i })).toHaveAttribute("href", "https://publicdomainmovie.net/movie.php?id=CC_1916_07_10_TheVagabond&type=.mp4");
});

it("pauses the movie when the presentation closes", () => {
  const { rerender } = render(<KrispyModal isOpen closeModal={jest.fn()} />);
  const movie = screen.getByLabelText("The Vagabond (1916), Charlie Chaplin");
  movie.pause.mockClear();
  Object.defineProperty(movie, "paused", { value: false, configurable: true });
  rerender(<KrispyModal isOpen={false} closeModal={jest.fn()} />);
  expect(movie.pause).toHaveBeenCalledTimes(1);
  expect(movie).not.toBeInTheDocument();
});

it("does not invoke playback controls for an already paused movie on close", () => {
  const { rerender } = render(<KrispyModal isOpen closeModal={jest.fn()} />);
  const movie = screen.getByLabelText("The Vagabond (1916), Charlie Chaplin");
  movie.pause.mockClear();
  rerender(<KrispyModal isOpen={false} closeModal={jest.fn()} />);
  expect(movie.pause).not.toHaveBeenCalled();
});

it.each(films)("makes the %s caption a separate keyboard-accessible film link", async (title, url) => {
  const user = userEvent.setup();
  render(<KrispyModal isOpen closeModal={jest.fn()} />);
  const link = screen.getByRole("link", { name: `Watch film: ${title} (opens in a new tab)` });
  expect(link).toHaveAttribute("href", url);
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(within(link).queryByRole("link")).not.toBeInTheDocument();
  const activated = jest.fn((event) => event.preventDefault());
  link.addEventListener("click", activated);
  link.focus();
  await user.keyboard("{Enter}");
  await user.click(link);
  expect(activated).toHaveBeenCalledTimes(2);
});

it("switches house lights with the keyboard without replacing the movie or screenshots", async () => {
  const user = userEvent.setup();
  render(<KrispyModal isOpen closeModal={jest.fn()} />);
  const lights = screen.getByRole("button", { name: "House lights", exact: true });
  const movie = screen.getByLabelText("The Vagabond (1916), Charlie Chaplin");
  const demo = screen.getByRole("img", { name: "KRISPY My List page with saved films and collection filters" });
  const originalBodyStyle = document.body.getAttribute("style");
  const originalBodyClass = document.body.className;
  expect(lights).toHaveAttribute("aria-pressed", "false");
  expect(lights).toHaveAccessibleDescription(/Matinee.*Dim the lights/);
  lights.focus();
  await user.keyboard("{Enter}");
  expect(lights).toHaveAttribute("aria-pressed", "true");
  expect(lights).toHaveAccessibleDescription(/Screening.*Bring up the lights/);
  expect(screen.getByRole("document")).toHaveClass("krispy-screening");
  expect(screen.getByLabelText("The Vagabond (1916), Charlie Chaplin")).toBe(movie);
  expect(screen.getByRole("img", { name: "KRISPY My List page with saved films and collection filters" })).toBe(demo);
  expect(demo.getAttribute("src")).toMatch(/krispyMyList\.png$/);
  expect(document.body.getAttribute("style")).toBe(originalBodyStyle);
  expect(document.body.className).toBe(originalBodyClass);
  await user.keyboard(" ");
  expect(lights).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("document")).not.toHaveClass("krispy-screening");
  expect(screen.queryByRole("button", { name: /pause motion/i })).not.toBeInTheDocument();
});

it("resets house lights for the next modal session", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<KrispyModal isOpen closeModal={jest.fn()} />);
  await user.click(screen.getByRole("button", { name: "House lights", exact: true }));
  rerender(<KrispyModal isOpen={false} closeModal={jest.fn()} />);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  rerender(<KrispyModal isOpen closeModal={jest.fn()} />);
  expect(screen.getByRole("button", { name: "House lights", exact: true })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("document")).not.toHaveClass("krispy-screening");
});

it("presents the project and technical chapters before the film and final credits", () => {
  render(<KrispyModal isOpen closeModal={jest.fn()} />);
  const regions = screen.getAllByRole("region");
  expect(regions.map((region) => region.getAttribute("aria-labelledby") || region.getAttribute("aria-label"))).toEqual([
    "krispy-project-title", "krispy-collection-title", "krispy-story-title", "krispy-technical-title", "krispy-movie-title", "Final credits",
  ]);
});
