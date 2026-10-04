import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WhackaModal from "./WhackaModal";

it("names the open dialog with the project heading", () => {
  render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);

  const dialog = screen.getByRole("dialog", { name: "Whack a Mole" });
  expect(within(dialog).getByRole("heading", { level: 1, name: "Whack a Mole" }))
    .toBeInTheDocument();
  expect(within(dialog).getByRole("img", { name: /whack a mole gameplay/i }))
    .toHaveAttribute("src", "whacka.gif");
});

it("exposes the existing game and repository as safe external links", () => {
  render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);

  const hero = within(screen.getByRole("region", { name: "Whack a Mole" }));
  const play = hero.getByRole("link", { name: /play/i });
  const github = hero.getByRole("link", { name: /github/i });
  expect(play).toHaveAttribute("href", "https://whackamolewhackamole.web.app");
  expect(github).toHaveAttribute("href", "https://github.com/ibrahim-karim-22/portfolioprojectgame");
  [play, github].forEach((link) => {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

it("keeps persistent project links separate from the footer Close action", () => {
  render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);

  const actions = within(screen.getByRole("group", { name: "Persistent project actions" }));
  const play = actions.getByRole("link", { name: /play/i });
  const github = actions.getByRole("link", { name: /github/i });
  expect(play).toHaveAttribute("href", "https://whackamolewhackamole.web.app");
  expect(github).toHaveAttribute("href", "https://github.com/ibrahim-karim-22/portfolioprojectgame");
  [play, github].forEach(link => {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
  expect(actions.queryByRole("button", { name: "Close", exact: true })).not.toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /play/i })).toHaveLength(2);
  expect(screen.getAllByRole("link", { name: /github/i })).toHaveLength(2);
});

it("tabs through footer Play, GitHub, and then the separate Close control", async () => {
  const user = userEvent.setup();
  render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);

  const actions = within(screen.getByRole("group", { name: "Persistent project actions" }));
  actions.getByRole("link", { name: /play/i }).focus();
  await user.tab();
  expect(actions.getByRole("link", { name: /github/i })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole("button", { name: "Close", exact: true })).toHaveFocus();
});

it.each(["Close project", "Close"])("closes through the %s control", (name) => {
  const closeModal = jest.fn();
  render(<WhackaModal isOpen={true} closeModal={closeModal} />);

  fireEvent.click(screen.getByRole("button", { name, exact: true }));

  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("does not mount the case study when closed", () => {
  render(<WhackaModal isOpen={false} closeModal={jest.fn()} />);

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /play/i })).not.toBeInTheDocument();
});

it("identifies the game in the header with the approved labels", () => {
  render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);

  expect(screen.getByText("Whack a Mole")).toBeInTheDocument();
  expect(screen.getByText("Online Game")).toBeInTheDocument();
  expect(screen.queryByText("Project showcase")).not.toBeInTheDocument();
});

describe("whackable technology logos", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  // JSDOM has no layout: provide the browser geometry consumed by hit detection.
  function setVisibleArea(target, visibleHeight = 48) {
    const targetBounds = {
      top: 100, bottom: 148, left: 100, right: 148, width: 48, height: 48,
    };
    const windowBounds = {
      top: 100, bottom: 100 + visibleHeight, left: 100, right: 148, width: 48, height: visibleHeight,
    };
    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
      return this === target ? targetBounds : windowBounds;
    });
  }

  it("exposes three named targets without making their wrappers focusable", () => {
    render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);

    const stage = screen.getByRole("group", { name: "Interactive technology logos" });
    const targets = within(stage).getAllByRole("button");
    expect(targets).toHaveLength(3);
    ["JavaScript", "HTML", "Sass"].forEach((name) => {
      expect(within(stage).getByRole("button", { name: `Whack ${name} logo` }))
        .toHaveAttribute("type", "button");
    });
    expect(stage).not.toHaveAttribute("tabindex");
  });

  it.each(["JavaScript", "HTML", "Sass"])("shows temporary +5 feedback for a visible %s hit", (name) => {
    render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);
    const target = screen.getByRole("button", { name: `Whack ${name} logo` });
    setVisibleArea(target);

    fireEvent.click(target);

    expect(screen.getByRole("status", { name: `5 points for ${name}` })).toHaveTextContent("+5");
    act(() => jest.advanceTimersByTime(800));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each([0, 10, 23])("rejects a target with only %s pixels visible", (visibleHeight) => {
    render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);
    const target = screen.getByRole("button", { name: "Whack JavaScript logo" });
    setVisibleArea(target, visibleHeight);

    fireEvent.click(target);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("rejects a masked target even when its box overlaps the hole", () => {
    render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);
    const target = screen.getByRole("button", { name: "Whack JavaScript logo" });
    setVisibleArea(target);
    target.style.pointerEvents = "none";

    fireEvent.click(target);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each(["{Enter}", " "])("supports native keyboard activation with %p", async (key) => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);
    const target = screen.getByRole("button", { name: "Whack HTML logo" });
    setVisibleArea(target);
    target.focus();

    await user.keyboard(key);

    expect(screen.getByRole("status", { name: "5 points for HTML" })).toHaveTextContent("+5");
  });

  it("keeps repeated hits bounded and allows a fresh hit after cleanup", () => {
    render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);
    const target = screen.getByRole("button", { name: "Whack Sass logo" });
    setVisibleArea(target);

    for (let hit = 0; hit < 20; hit += 1) fireEvent.click(target);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    act(() => jest.advanceTimersByTime(800));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    fireEvent.click(target);
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("cleans up a hit when closed and reopens without stale feedback", () => {
    const { rerender } = render(<WhackaModal isOpen={true} closeModal={jest.fn()} />);
    const target = screen.getByRole("button", { name: "Whack JavaScript logo" });
    setVisibleArea(target);
    fireEvent.click(target);

    rerender(<WhackaModal isOpen={false} closeModal={jest.fn()} />);
    act(() => jest.advanceTimersByTime(1000));
    rerender(<WhackaModal isOpen={true} closeModal={jest.fn()} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Whack JavaScript logo" })).toBeInTheDocument();
  });
});
