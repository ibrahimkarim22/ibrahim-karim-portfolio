import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BardModal from "./BardModal";

// The decorative overlay has no accessible role; dispatch the real CSS completion.
function curtainEnd(name = "bardCurtainOpenRight") {
  // eslint-disable-next-line testing-library/no-node-access
  const panel = document.querySelector(".bard-curtain-performance .bard-curtain-panel--right");
  expect(panel).not.toBeNull();
  const event = new Event("animationend", { bubbles: true });
  Object.defineProperty(event, "animationName", { value: name });
  fireEvent(panel, event);
}

it("uses one physical curtain pair for every performance, including the visible open wings", () => {
  render(<BardModal isOpen closeModal={jest.fn()} />);
  // Structural regression: duplicate stationary fabric caused detached side extensions.
  // eslint-disable-next-line testing-library/no-node-access
  expect(document.querySelectorAll(".bard-curtain-panel")).toHaveLength(2);
  curtainEnd();
  // eslint-disable-next-line testing-library/no-node-access
  expect(document.querySelectorAll(".bard-curtain-panel")).toHaveLength(2);
  // eslint-disable-next-line testing-library/no-node-access
  expect(document.querySelectorAll(".bard-hero .bard-curtain-panel")).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Draw curtain" }));
  // eslint-disable-next-line testing-library/no-node-access
  expect(document.querySelectorAll(".bard-curtain-panel")).toHaveLength(2);
});

it("gives the programme an accessible dialog name and a navigable heading hierarchy", () => {
  render(<BardModal isOpen closeModal={jest.fn()} />);
  const dialog = screen.getByRole("dialog", { name: "BARD" });
  expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(within(dialog).getByRole("heading", { level: 1, name: "BARD" })).toBeInTheDocument();
  expect(within(dialog).getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(4);
});

it.each([
  ["APK!", "https://drive.google.com/file/d/1kblapPn0vab5BiiJwcaMAioJ5yW14cCf/view?usp=drive_link"],
  ["GitHub", "https://github.com/ibrahim-karim-22/reactNativePortfolioProject"],
])("preserves the %s destination as a native keyboard-accessible link", async (name, href) => {
  render(<BardModal isOpen closeModal={jest.fn()} />);
  const link = screen.getByRole("link", { name: new RegExp(name.replace("!", "\\!")) });
  expect(link).toHaveAttribute("href", href);
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  const activate = jest.fn((event) => event.preventDefault());
  link.addEventListener("click", activate);
  link.focus();
  await userEvent.setup().keyboard("{Enter}");
  expect(activate).toHaveBeenCalledTimes(1);
});

it.each(["Close project", "EXIT"])("finishes the curtain call before closing from %s", async (name) => {
  const closeModal = jest.fn();
  render(<BardModal isOpen closeModal={closeModal} />);
  await userEvent.setup().click(screen.getByRole("button", { name, exact: true }));
  expect(closeModal).not.toHaveBeenCalled();
  curtainEnd("bardCurtainCloseRight");
  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("lets Escape interrupt manual drawing immediately and cancels delayed callbacks", () => {
  jest.useFakeTimers();
  try {
    const closeModal = jest.fn();
    render(<BardModal isOpen closeModal={closeModal} />);
    curtainEnd();
    fireEvent.click(screen.getByRole("button", { name: "Draw curtain" }));
    fireEvent.keyUp(screen.getByRole("dialog"), { key: "Escape", keyCode: 27 });
    expect(closeModal).toHaveBeenCalledTimes(1);
    act(() => jest.advanceTimersByTime(10000));
    expect(closeModal).toHaveBeenCalledTimes(1);
  } finally { jest.useRealTimers(); }
});

it("recovers from missing animation-end events and cleans up on external unmount", () => {
  jest.useFakeTimers();
  try {
    const closeModal = jest.fn();
    const { unmount } = render(<BardModal isOpen closeModal={closeModal} />);
    const draw = screen.getByRole("button", { name: "Draw curtain" });
    act(() => jest.advanceTimersByTime(4000));
    expect(draw).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "EXIT", exact: true }));
    act(() => jest.advanceTimersByTime(1100));
    expect(closeModal).toHaveBeenCalledTimes(1);
    unmount();
    act(() => jest.advanceTimersByTime(10000));
    expect(closeModal).toHaveBeenCalledTimes(1);
    const pendingClose = jest.fn();
    const { unmount: cancelPendingClose } = render(<BardModal isOpen closeModal={pendingClose} />);
    fireEvent.click(screen.getByRole("button", { name: "EXIT", exact: true }));
    cancelPendingClose();
    act(() => jest.advanceTimersByTime(10000));
    expect(pendingClose).not.toHaveBeenCalled();
  } finally { jest.useRealTimers(); }
});

it("draws the curtain into Intermission, then raises it over the same programme and scroll position", () => {
  jest.useFakeTimers();
  try {
    const closeModal = jest.fn();
    render(<BardModal isOpen closeModal={closeModal} />);
    const draw = screen.getByRole("button", { name: "Draw curtain", exact: true });
    expect(draw).toBeDisabled();
    curtainEnd();
    const programme = screen.getByRole("region", { name: "BARD programme" });
    programme.scrollTop = 1379;
    draw.focus();
    fireEvent.click(draw);
    fireEvent.click(draw);
    expect(draw).toBeDisabled();
    expect(screen.queryByRole("region", { name: "BARD intermission" })).not.toBeInTheDocument();
    curtainEnd("bardCurtainCloseRight");
    const intermission = screen.getByRole("region", { name: "BARD intermission" });
    const raise = within(intermission).getByRole("button", { name: "Raise curtain", exact: true });
    expect(raise).toHaveFocus();
    expect(programme).toHaveAttribute("aria-hidden", "true");
    expect(programme).toHaveAttribute("inert");
    act(() => jest.advanceTimersByTime(10000));
    expect(intermission).toBeInTheDocument();
    expect(closeModal).not.toHaveBeenCalled();
    fireEvent.click(raise);
    fireEvent.click(raise);
    expect(screen.queryByRole("region", { name: "BARD intermission" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close project" })).toHaveFocus();
    curtainEnd("bardCurtainCloseRight"); // Ignore an old closing event during the raise.
    expect(screen.getByRole("button", { name: "Draw curtain" })).toBeDisabled();
    curtainEnd();
    expect(screen.getByRole("region", { name: "BARD programme" })).toBe(programme);
    expect(programme.scrollTop).toBe(1379);
    expect(programme).not.toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Draw curtain" })).toHaveFocus();
  } finally { jest.useRealTimers(); }
});

it.each(["EXIT", "Close project", "Escape"])("exits Intermission immediately from %s without another closing performance", (action) => {
  const closeModal = jest.fn();
  render(<BardModal isOpen closeModal={closeModal} />);
  curtainEnd();
  fireEvent.click(screen.getByRole("button", { name: "Draw curtain" }));
  curtainEnd("bardCurtainCloseRight");
  if (action === "Escape") fireEvent.keyUp(screen.getByRole("dialog"), { key: "Escape", keyCode: 27 });
  else fireEvent.click(screen.getByRole("button", { name: action, exact: true }));
  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("gives exit priority during manual drawing and never shows Intermission on exit", () => {
  const closeModal = jest.fn();
  render(<BardModal isOpen closeModal={closeModal} />);
  curtainEnd();
  fireEvent.click(screen.getByRole("button", { name: "Draw curtain" }));
  fireEvent.click(screen.getByRole("button", { name: "EXIT", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "EXIT", exact: true }));
  curtainEnd("bardCurtainCloseRight");
  expect(closeModal).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("region", { name: "BARD intermission" })).not.toBeInTheDocument();
});

it("recovers manual Draw/Raise when animation-end events are missing", () => {
  jest.useFakeTimers();
  try {
    render(<BardModal isOpen closeModal={jest.fn()} />);
    act(() => jest.advanceTimersByTime(4000));
    fireEvent.click(screen.getByRole("button", { name: "Draw curtain" }));
    act(() => jest.advanceTimersByTime(1100));
    const intermission = screen.getByRole("region", { name: "BARD intermission" });
    fireEvent.click(within(intermission).getByRole("button", { name: "Raise curtain" }));
    act(() => jest.advanceTimersByTime(3800));
    expect(screen.getByRole("button", { name: "Draw curtain" })).toBeDisabled();
    act(() => jest.advanceTimersByTime(200));
    expect(screen.getByRole("button", { name: "Draw curtain" })).toBeEnabled();
  } finally { jest.useRealTimers(); }
});

it("keeps manual Draw/Raise functional with instant reduced-motion transitions", () => {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = () => ({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  try {
    const closeModal = jest.fn();
    render(<BardModal isOpen closeModal={closeModal} />);
    const programme = screen.getByRole("region", { name: "BARD programme" });
    programme.scrollTop = 777;
    fireEvent.click(screen.getByRole("button", { name: "Draw curtain" }));
    const intermission = screen.getByRole("region", { name: "BARD intermission" });
    fireEvent.click(within(intermission).getByRole("button", { name: "Raise curtain" }));
    expect(screen.getByRole("button", { name: "Draw curtain" })).toBeEnabled();
    expect(programme.scrollTop).toBe(777);
    fireEvent.click(screen.getByRole("button", { name: "Draw curtain" }));
    fireEvent.click(screen.getByRole("button", { name: "EXIT", exact: true }));
    expect(closeModal).toHaveBeenCalledTimes(1);
  } finally { window.matchMedia = originalMatchMedia; }
});

it("skips performances for reduced motion, including a preference change during exit", () => {
  const originalMatchMedia = window.matchMedia;
  const listeners = new Set();
  let reduced = true;
  window.matchMedia = () => ({ matches: reduced, addEventListener: (_, callback) => listeners.add(callback), removeEventListener: (_, callback) => listeners.delete(callback) });
  try {
    const closeModal = jest.fn();
    const { rerender } = render(<BardModal isOpen closeModal={closeModal} />);
    expect(screen.getByRole("button", { name: "Draw curtain" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "EXIT", exact: true }));
    expect(closeModal).toHaveBeenCalledTimes(1);
    rerender(<BardModal isOpen={false} closeModal={closeModal} />);
    reduced = false;
    act(() => listeners.forEach((listener) => listener({ matches: false })));
    rerender(<BardModal isOpen closeModal={closeModal} />);
    curtainEnd();
    fireEvent.click(screen.getByRole("button", { name: "EXIT", exact: true }));
    expect(closeModal).toHaveBeenCalledTimes(1);
    reduced = true;
    act(() => listeners.forEach((listener) => listener({ matches: true })));
    expect(closeModal).toHaveBeenCalledTimes(2);
  } finally { window.matchMedia = originalMatchMedia; }
});

it("keeps Escape connected to the project close action", () => {
  const closeModal = jest.fn();
  render(<BardModal isOpen closeModal={closeModal} />);
  fireEvent.keyUp(screen.getByRole("dialog"), { key: "Escape", keyCode: 27 });
  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("lets keyboard users focus the programme to scroll its content", async () => {
  render(<BardModal isOpen closeModal={jest.fn()} />);
  curtainEnd();
  const programme = screen.getByRole("region", { name: "BARD programme" });
  screen.getByRole("button", { name: "Close project", exact: true }).focus();
  const user = userEvent.setup();
  await user.tab();
  expect(screen.getByRole("button", { name: "Draw curtain" })).toHaveFocus();
  await user.tab();
  expect(programme).toHaveFocus();
});

it("contains keyboard focus and restores the opener after closing", async () => {
  const { rerender } = render(<><button>Open Bard</button><BardModal isOpen={false} closeModal={jest.fn()} /></>);
  const opener = screen.getByRole("button", { name: "Open Bard" });
  opener.focus();
  rerender(<><button>Open Bard</button><BardModal isOpen closeModal={jest.fn()} /></>);
  await waitFor(() => expect(screen.getByRole("dialog")).toHaveFocus());
  const last = screen.getByRole("link", { name: /GitHub/ });
  last.focus();
  fireEvent.keyDown(last, { key: "Tab", keyCode: 9, which: 9 });
  const first = screen.getByRole("button", { name: "Close project" });
  expect(first).toHaveFocus();
  fireEvent.keyDown(first, { key: "Tab", keyCode: 9, which: 9, shiftKey: true });
  expect(last).toHaveFocus();
  rerender(<><button>Open Bard</button><BardModal isOpen={false} closeModal={jest.fn()} /></>);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(opener).toHaveFocus();
});

it("preserves all existing phone and implementation media and names the screening", () => {
  render(<BardModal isOpen closeModal={jest.fn()} />);
  expect(screen.getAllByRole("img", { name: /^Bard app:/ })).toHaveLength(11);
  expect(screen.getAllByRole("img", { name: /^Bard implementation:/ })).toHaveLength(11);
  expect(screen.getAllByRole("img", { name: /^Bard app:/ }).map((image) => image.getAttribute("src"))).toEqual(expect.arrayContaining([
    "phoneBardHome.png", "phoneBardProfile.png", "phoneBardSideMenu.png", "phoneBardCourse.png",
    "phoneBardQuiz.png", "phoneBardQuizOne.png", "phoneBardMedals.png", "phoneBardInfo.png",
    "phoneBardSynopsis.png", "phoneBardPerformance.png", "phoneBardHowTo.png",
  ]));
  expect(screen.getAllByRole("img", { name: /^Bard implementation:/ }).map((image) => image.getAttribute("src"))).toEqual(expect.arrayContaining([
    "folgerSlice.png", "mitSlice.png", "bardSignUp.png", "bardLogin.png", "playsRoot.png", "medalsCode.png",
    "quizCode.png", "certificateCode.png", "freeFolger.png", "freeSynopsis.png", "readFolger.png",
  ]));
  expect(screen.getByTitle("BARD — Honors Video Submission")).toHaveAttribute("src", "https://www.youtube.com/embed/mDVozMvFYb8?si=ep73q8kv4df0j77v");
});

it("offers the original implementation images at full size for reading on small screens", () => {
  render(<BardModal isOpen closeModal={jest.fn()} />);
  const fullSizeLinks = screen.getAllByRole("link", { name: /Open .* at full size/ });
  expect(fullSizeLinks).toHaveLength(11);
  fullSizeLinks.forEach((link) => {
    expect(link).toHaveAttribute("href", within(link).getByRole("img").getAttribute("src"));
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

it("makes every View full size caption a native image link that also activates with Enter", async () => {
  render(<BardModal isOpen closeModal={jest.fn()} />);
  const captionLinks = screen.getAllByRole("link", { name: /^View .* at full size/ });
  const imageLinks = screen.getAllByRole("link", { name: /^Open .* at full size/ });
  expect(captionLinks).toHaveLength(11);
  captionLinks.forEach((link, index) => {
    expect(link).toHaveAttribute("href", imageLinks[index].getAttribute("href"));
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
  const activate = jest.fn((event) => event.preventDefault());
  captionLinks[0].addEventListener("click", activate);
  captionLinks[0].focus();
  await userEvent.setup().keyboard("{Enter}");
  expect(activate).toHaveBeenCalledTimes(1);
});

it("starts a fresh curtain presentation on reopening", async () => {
  const { rerender } = render(<BardModal isOpen closeModal={jest.fn()} />);
  const firstTitle = screen.getByRole("heading", { level: 1, name: "BARD" });
  rerender(<BardModal isOpen={false} closeModal={jest.fn()} />);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  rerender(<BardModal isOpen closeModal={jest.fn()} />);
  expect(screen.getByRole("heading", { level: 1, name: "BARD" })).not.toBe(firstTitle);
});

it("reveals stage cues once, then clears pending motion when the preference changes", () => {
  const originalObserver = window.IntersectionObserver;
  const originalMatchMedia = window.matchMedia;
  let reveal;
  const preferenceListeners = new Set();
  const disconnect = jest.fn();
  const unobserve = jest.fn();
  window.IntersectionObserver = class {
    constructor(callback) { reveal = callback; }
    observe() {}
    unobserve = unobserve;
    disconnect = disconnect;
  };
  window.matchMedia = () => ({
    matches: false,
    addEventListener: (event, callback) => { preferenceListeners.add(callback); },
    removeEventListener: (event, callback) => { preferenceListeners.delete(callback); },
  });
  try {
    const { unmount } = render(<BardModal isOpen closeModal={jest.fn()} />);
    const cue = screen.getByRole("heading", { name: /A way into/ });
    // This test inspects the observer's presentation state on the real programme.
    // eslint-disable-next-line testing-library/no-node-access
    const programme = cue.closest(".bard-modal-main-flex-container");
    expect(programme).toHaveClass("bard-motion-enabled");
    act(() => reveal([{ target: cue, isIntersecting: true }]));
    expect(cue).toHaveAttribute("data-bard-revealed", "true");
    expect(unobserve).toHaveBeenCalledWith(cue);
    act(() => preferenceListeners.forEach((callback) => callback({ matches: true })));
    expect(programme).not.toHaveClass("bard-motion-enabled");
    expect(disconnect).toHaveBeenCalled();
    unmount();
  } finally {
    window.IntersectionObserver = originalObserver;
    window.matchMedia = originalMatchMedia;
  }
});
