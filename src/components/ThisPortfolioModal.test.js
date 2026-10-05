import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThisPortfolioModal from "./ThisPortfolioModal";

const open = () => render(<ThisPortfolioModal isOpen closeModal={jest.fn()} />);

beforeEach(() => {
  jest.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  jest.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

it("shows the real whale loop with an explicit pause control and poster fallback", async () => {
  open();
  const video = screen.getByLabelText("Actual HeyYou whale animation");
  expect(video.tagName).toBe("VIDEO");
  expect(video).toHaveAttribute("src", "heyyou-whale-loop.webm");
  expect(video).toHaveAttribute("poster", "heyyou-whale.jpg");
  expect(video).toHaveAttribute("loop");
  expect(video).toHaveAttribute("playsinline");
  expect(video.muted).toBe(true);
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Pause whale loop" }));
  expect(
    screen.getByRole("button", { name: "Play whale loop" }),
  ).toBeInTheDocument();
  fireEvent.error(video);
  expect(
    screen.getByRole("img", {
      name: "HeyYou whale above the moonlit deployment ocean",
    }),
  ).toHaveAttribute("src", "heyyou-whale.jpg");
  expect(
    screen.queryByLabelText("Actual HeyYou whale animation"),
  ).not.toBeInTheDocument();
});

it("shows a strong still whale poster without mounting a video for reduced motion", () => {
  const original = window.matchMedia;
  window.matchMedia = jest.fn(() => ({ matches: true }));
  try {
    open();
    expect(
      screen.queryByLabelText("Actual HeyYou whale animation"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "HeyYou whale above the moonlit deployment ocean",
      }),
    ).toHaveAttribute("src", "heyyou-whale.jpg");
    expect(
      screen.getByRole("status", { name: "Whale timeline pose" }),
    ).toHaveTextContent("50% / Rise");
  } finally {
    window.matchMedia = original;
  }
});

it("uses the video clock and seeks both views when a source pose is selected", async () => {
  open();
  const video = screen.getByLabelText("Actual HeyYou whale animation");
  video.currentTime = 9;
  fireEvent.seeked(video);
  expect(
    screen.getByRole("status", { name: "Whale timeline pose" }),
  ).toHaveTextContent("50% / Rise");
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("button", { name: "Inspect whale pose at 29 percent" }),
  );
  expect(video.currentTime).toBeCloseTo(5.22);
  expect(
    screen.getByRole("button", { name: "Play whale loop" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("status", { name: "Whale timeline pose" }),
  ).toHaveAttribute("aria-live", "polite");
  await user.click(
    screen.getByRole("button", { name: "Replay source timeline" }),
  );
  expect(video.currentTime).toBe(0);
  expect(
    screen.getByRole("button", { name: "Pause whale loop" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("status", { name: "Whale timeline pose" }),
  ).toHaveTextContent("0% / Below the surface");
  expect(
    screen.getByRole("status", { name: "Whale timeline pose" }),
  ).toHaveAttribute("aria-live", "off");
});

it("omits the Projects-page showcase while that interface is awaiting redesign", () => {
  open();
  const dialog = within(screen.getByRole("dialog"));
  const images = [
    ...dialog.getAllByRole("img", { hidden: true }),
    ...dialog.queryAllByRole("presentation", { hidden: true }),
  ];
  images.forEach((image) => {
    expect(image.getAttribute("src") || "").not.toMatch(
      /portfolio-(shell|tablet|mobile)\.jpg/,
    );
  });
  expect(
    screen.queryByText(/Desktop, tablet and mobile views adapt the shell/),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "Considered, down to the details." }),
  ).toBeInTheDocument();
});

it("names the dialog and makes the studio atlas keyboard scrollable", () => {
  open();
  expect(
    screen.getByRole("dialog", { name: "THIS PORTFOLIO" }),
  ).toHaveAttribute("aria-modal", "true");
  expect(
    screen.getByRole("region", { name: "Portfolio studio atlas" }),
  ).toHaveAttribute("tabindex", "0");
});

it("presents current project worlds and preserves contextual process evidence", () => {
  open();
  const worlds = screen.getByRole("region", {
    name: "One system. Different worlds.",
  });
  ["HeyYou", "BARD", "Tuh-Doo"].forEach((name) =>
    expect(within(worlds).getByRole("heading", { name })).toBeInTheDocument(),
  );
  expect(
    within(worlds)
      .getAllByRole("img")
      .map((img) => img.getAttribute("src")),
  ).toEqual(["heyyou-connection.jpg", "bard-curtain.jpg", "tuhdoo-board.jpg"]);
  expect(screen.getByText(/Case studies were redesigned/)).toBeInTheDocument();
  expect(
    screen.getByRole("img", { name: /Process archive: Blender signature/ }),
  ).toHaveAttribute("src", "logoModel.png");
  expect(
    screen.getByRole("img", { name: /Process archive: whale keyframes/ }),
  ).toHaveAttribute("src", "whaleKeyframes.png");
});

it("selects actual architecture nodes and reveals their source responsibilities", async () => {
  open();
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("button", { name: "Inspect Project catalog" }),
  );
  expect(
    screen.getByRole("button", { name: "Inspect Project catalog" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("region", { name: "System detail" }),
  ).toHaveTextContent("projectCatalog.js");
  await user.click(screen.getByRole("button", { name: "Inspect Modal host" }));
  expect(
    screen.getByRole("region", { name: "System detail" }),
  ).toHaveTextContent("ProjectModalHost.js");
});

it("allows keyboard and tap selection of exploded layers without a drag gesture", async () => {
  open();
  const button = screen.getByRole("button", {
    name: "Inspect Motion + assets layer",
  });
  button.focus();
  await userEvent.setup().keyboard("{Enter}");
  expect(button).toHaveAttribute("aria-pressed", "true");
  expect(button).toHaveFocus();
  expect(
    screen.getByRole("region", { name: "Layer detail" }),
  ).toHaveTextContent("CSS keyframes");
  await userEvent
    .setup()
    .click(
      screen.getByRole("button", { name: "Inspect Project experience layer" }),
    );
  expect(
    screen.getByRole("region", { name: "Layer detail" }),
  ).toHaveTextContent("SCSS");
});

it("offers separate, replayable motion interpretations with honest source context", async () => {
  open();
  const study = screen.getByRole("region", {
    name: "Three worlds. Three motion languages.",
  });
  for (const name of ["HeyYou", "BARD", "Tuh-Doo"]) {
    const replay = within(study).getByRole("button", {
      name: `Replay ${name} motion study`,
    });
    replay.focus();
    await userEvent.setup().keyboard("{Enter}");
    expect(replay).toHaveFocus();
    expect(
      within(study).getByLabelText(`${name} simplified motion study`),
    ).toHaveAttribute("data-run", "2");
  }
  expect(within(study).getByText(/Simplified studies/)).toBeInTheDocument();
});

it("lets a visitor inspect real CSS timeline poses without running the animation", async () => {
  open();
  await userEvent
    .setup()
    .click(
      screen.getByRole("button", { name: "Inspect whale pose at 29 percent" }),
    );
  expect(
    screen.getByRole("status", { name: "Whale timeline pose" }),
  ).toHaveTextContent("29% / Dive");
  expect(
    screen.getByRole("button", { name: "Inspect whale pose at 29 percent" }),
  ).toHaveAttribute("aria-pressed", "true");
});

it("connects selectable asset stages to actual integration evidence", async () => {
  open();
  const control = screen.getByRole("button", {
    name: "Inspect Integrate stage",
  });
  control.focus();
  await userEvent.setup().keyboard(" ");
  expect(control).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("region", { name: "Asset pipeline detail" }),
  ).toHaveTextContent("useGLTF");
});

it("keeps responsive and accessibility inspection interactive without Projects-page media", async () => {
  open();
  await userEvent
    .setup()
    .click(
      screen.getByRole("button", { name: "Inspect Reduced motion practice" }),
    );
  expect(
    screen.getByRole("region", { name: "Quality inspection detail" }),
  ).toHaveTextContent("assembled");
  await userEvent
    .setup()
    .click(
      screen.getByRole("button", { name: "View Mobile responsive preview" }),
    );
  expect(
    screen.getByRole("button", { name: "View Mobile responsive preview" }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const [size, src, width] of [
    ["Desktop", "heyyou-connection.jpg", "1280"],
    ["Tablet", "heyyou-connection-tablet.jpg", "768"],
    ["Mobile", "heyyou-connection-mobile.jpg", "390"],
  ]) {
    await userEvent
      .setup()
      .click(
        screen.getByRole("button", { name: `View ${size} responsive preview` }),
      );
    const image = screen.getByRole("img", {
      name: /HeyYou responsive preview:/,
    });
    expect(image).toHaveAttribute("src", src);
    expect(image).toHaveAttribute("width", width);
  }
});

it("keeps native full-size links and legitimate project actions accessible", () => {
  open();
  const links = screen.getAllByRole("link", { name: /^View .* at full size/ });
  expect(links.length).toBeGreaterThanOrEqual(10);
  links.forEach((link) => {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.getAttribute("href")).toBeTruthy();
  });
  expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
    "href",
    "https://github.com/ibrahim-karim-22/ibrahim-karim-portfolio",
  );
  expect(screen.getByRole("link", { name: "Email" })).toHaveAttribute(
    "href",
    "mailto:22ibrahimkarim@gmail.com",
  );
});

it.each(["Close project", "Close"])(
  "connects %s to the existing close action",
  async (name) => {
    const closeModal = jest.fn();
    render(<ThisPortfolioModal isOpen closeModal={closeModal} />);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name, exact: true }));
    expect(closeModal).toHaveBeenCalledTimes(1);
  },
);

it("closes immediately on Escape", () => {
  const closeModal = jest.fn();
  render(<ThisPortfolioModal isOpen closeModal={closeModal} />);
  fireEvent.keyUp(screen.getByRole("dialog"), { key: "Escape", keyCode: 27 });
  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("contains focus, restores the opener and resets presentation state on reopening", async () => {
  const project = (isOpen) => (
    <>
      <button>Open portfolio</button>
      <ThisPortfolioModal isOpen={isOpen} closeModal={jest.fn()} />
    </>
  );
  const { rerender } = render(project(false));
  const opener = screen.getByRole("button", { name: "Open portfolio" });
  opener.focus();
  rerender(project(true));
  await waitFor(() => expect(screen.getByRole("dialog")).toHaveFocus());
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Inspect Modal host" }));
  const last = screen.getByRole("link", { name: /GitHub/ });
  last.focus();
  fireEvent.keyDown(last, { key: "Tab", keyCode: 9, which: 9 });
  expect(screen.getByRole("button", { name: "Close project" })).toHaveFocus();
  rerender(project(false));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(opener).toHaveFocus();
  rerender(project(true));
  expect(
    screen.getByRole("button", { name: "Inspect Portfolio shell" }),
  ).toHaveAttribute("aria-pressed", "true");
});

it("retains all layer information when reduced motion is requested", async () => {
  const original = window.matchMedia;
  window.matchMedia = jest.fn(() => ({ matches: true }));
  try {
    open();
    await userEvent
      .setup()
      .click(
        screen.getByRole("button", { name: "Inspect Application shell layer" }),
      );
    expect(
      screen.getByRole("region", { name: "Layer detail" }),
    ).toHaveTextContent("Home");
    expect(
      screen.getByRole("heading", { name: "THIS PORTFOLIO" }),
    ).toBeInTheDocument();
  } finally {
    window.matchMedia = original;
  }
});

it("moves the index destination into keyboard focus without altering the URL", async () => {
  open();
  const before = window.location.href;
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "03 Worlds" }));
  expect(
    screen.getByRole("heading", { name: "One system. Different worlds." }),
  ).toHaveFocus();
  expect(window.location.href).toBe(before);
});
