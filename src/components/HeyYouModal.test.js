import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeyYouModal from "./HeyYouModal";

it("names the dialog and makes the mobile product and technical story discoverable", () => {
  render(<HeyYouModal isOpen closeModal={jest.fn()} />);
  const dialog = screen.getByRole("dialog", { name: "HEYYOU" });
  expect(dialog).toHaveAttribute("aria-modal", "true");
  ["Live connection.", "How the signal moves.", "Updates, without the refresh.", "A place for every person.", "Share with intent.", "From code to cloud.", "See it in action."].forEach((name) => {
    expect(within(dialog).getByRole("heading", { name })).toBeInTheDocument();
  });
  expect(screen.getAllByRole("img", { name: /HeyYou app:/ })).toHaveLength(6);
});

it.each(["Close project", "Close"])("closes through the %s control", async (name) => {
  const closeModal = jest.fn();
  render(<HeyYouModal isOpen closeModal={closeModal} />);
  await userEvent.setup().click(screen.getByRole("button", { name, exact: true }));
  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("closes with Escape", () => {
  const closeModal = jest.fn();
  render(<HeyYouModal isOpen closeModal={closeModal} />);
  fireEvent.keyUp(screen.getByRole("dialog"), { key: "Escape", keyCode: 27 });
  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("contains keyboard focus and restores the opener on close", async () => {
  const { rerender } = render(<><button>Open HeyYou</button><HeyYouModal isOpen={false} closeModal={jest.fn()} /></>);
  const opener = screen.getByRole("button", { name: "Open HeyYou" });
  opener.focus();
  rerender(<><button>Open HeyYou</button><HeyYouModal isOpen closeModal={jest.fn()} /></>);
  const dialog = screen.getByRole("dialog");
  await waitFor(() => expect(dialog).toHaveFocus());
  const last = within(screen.getByRole("group", { name: "HeyYou project actions" })).getByRole("link", { name: /GitHub/ });
  last.focus();
  fireEvent.keyDown(last, { key: "Tab", keyCode: 9, which: 9 });
  const first = screen.getByRole("button", { name: "Close project" });
  expect(first).toHaveFocus();
  fireEvent.keyDown(first, { key: "Tab", keyCode: 9, which: 9, shiftKey: true });
  expect(last).toHaveFocus();
  opener.focus();
  expect(first).toHaveFocus();
  rerender(<><button>Open HeyYou</button><HeyYouModal isOpen={false} closeModal={jest.fn()} /></>);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(opener).toHaveFocus();
});

it("remounts the title and opening signal on every modal session", async () => {
  const { rerender } = render(<HeyYouModal isOpen closeModal={jest.fn()} />);
  const title = screen.getByRole("heading", { name: "HEYYOU", exact: true });
  const signal = screen.getByLabelText("Location signal illustration");
  rerender(<HeyYouModal isOpen={false} closeModal={jest.fn()} />);
  expect(title).not.toBeInTheDocument();
  expect(signal).not.toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  rerender(<HeyYouModal isOpen closeModal={jest.fn()} />);
  expect(screen.getByRole("heading", { name: "HEYYOU", exact: true })).not.toBe(title);
  expect(screen.getByLabelText("Location signal illustration")).not.toBe(signal);
});

it("preserves and safely activates the original APK and GitHub destinations", async () => {
  const user = userEvent.setup();
  render(<HeyYouModal isOpen closeModal={jest.fn()} />);
  const footer = screen.getByRole("group", { name: "HeyYou project actions" });
  const apk = within(footer).getByRole("link", { name: /APK!/ });
  const github = within(footer).getByRole("link", { name: /GitHub/ });
  expect(apk).toHaveAttribute("href", "https://drive.google.com/file/d/1qS72H4LG1BF-wKSWfJiPhMNqGe5kkRZ_/view?usp=drive_link");
  expect(github).toHaveAttribute("href", "https://github.com/ibrahim-karim-22/fullStackPortfolioProject");
  for (const link of [apk, github]) {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    const activated = jest.fn((event) => event.preventDefault());
    link.addEventListener("click", activated);
    link.focus();
    await user.keyboard("{Enter}");
    await user.click(link);
    expect(activated).toHaveBeenCalledTimes(2);
  }
});

it("keeps the whale and its night-ocean deployment scene together", () => {
  render(<HeyYouModal isOpen closeModal={jest.fn()} />);
  const scene = screen.getByRole("img", { name: /Docker whale/ });
  expect(scene).toBeInTheDocument();
  expect(scene).toHaveAccessibleName(/jumping and diving through a moonlit ocean/);
  expect(scene).toHaveTextContent("Cloud Run");
  expect(scene).toHaveTextContent("Expo");
});

it("resizes the ocean geometry when ResizeObserver is unavailable", () => {
  let width = 600;
  let height = 300;
  const widthGetter = jest.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
  const heightGetter = jest.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(() => height);
  try {
    render(<HeyYouModal isOpen closeModal={jest.fn()} />);
    const scene = screen.getByRole("img", { name: /Docker whale/ });
    expect(scene.style.getPropertyValue("--hey-you-scene-unit-x")).toBe("6px");
    expect(scene.style.getPropertyValue("--hey-you-scene-unit-y")).toBe("3px");
    width = 1000;
    height = 500;
    fireEvent(window, new Event("resize"));
    expect(scene.style.getPropertyValue("--hey-you-scene-unit-x")).toBe("10px");
    expect(scene.style.getPropertyValue("--hey-you-scene-unit-y")).toBe("5px");
  } finally {
    widthGetter.mockRestore();
    heightGetter.mockRestore();
  }
});

it("supports live reduced-motion preferences with legacy media-query listeners", () => {
  const originalMatchMedia = window.matchMedia;
  let notify;
  const preference = { matches: false, addListener: jest.fn((listener) => { notify = listener; }), removeListener: jest.fn() };
  window.matchMedia = () => preference;
  try {
    const { unmount } = render(<HeyYouModal isOpen closeModal={jest.fn()} />);
    preference.matches = true;
    act(() => notify());
    // eslint-disable-next-line testing-library/no-node-access -- Inspect the native scroller under the accessible gallery group.
    const gallery = screen.getByRole("group", { name: "App screenshots" }).firstElementChild;
    gallery.scrollTo = jest.fn();
    fireEvent.click(screen.getByRole("button", { name: "Next app screen" }));
    expect(gallery.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "auto" }));
    unmount();
    expect(preference.removeListener).toHaveBeenCalledWith(notify);
  } finally {
    if (originalMatchMedia) window.matchMedia = originalMatchMedia;
    else delete window.matchMedia;
  }
});

it("scrolls the page with wheel gestures at either gallery boundary", () => {
  render(<HeyYouModal isOpen closeModal={jest.fn()} />);
  // eslint-disable-next-line testing-library/no-node-access -- Wheel geometry belongs to the native scroller under the accessible gallery group.
  const gallery = screen.getByRole("group", { name: "App screenshots" }).firstElementChild;
  // eslint-disable-next-line testing-library/no-node-access -- Verify the real scroll parent receives the exhausted gesture.
  const body = gallery.closest(".hey-you-modal-body-main");
  Object.defineProperties(gallery, { scrollWidth: { value: 1200 }, clientWidth: { value: 400 } });
  const wheel = (deltaY) => {
    const event = new WheelEvent("wheel", { deltaY, bubbles: true, cancelable: true });
    fireEvent(gallery, event);
    return event;
  };
  gallery.scrollLeft = 200;
  expect(wheel(100).defaultPrevented).toBe(true);
  expect(gallery.scrollLeft).toBe(500);
  gallery.scrollLeft = 799.5;
  expect(wheel(100).defaultPrevented).toBe(true);
  expect(gallery.scrollLeft).toBe(799.5);
  expect(body.scrollTop).toBe(100);
  gallery.scrollLeft = 0;
  expect(wheel(-100).defaultPrevented).toBe(true);
  expect(gallery.scrollLeft).toBe(0);
  expect(body.scrollTop).toBe(0);
});

it("keeps the honors demo without autoplay and offers its original video link", () => {
  render(<HeyYouModal isOpen closeModal={jest.fn()} />);
  const video = screen.getByTitle("HeyYou Honors Project Video Submission");
  expect(video).toHaveAttribute("src", "https://www.youtube.com/embed/CShAZT8jykY?si=ruBs8fOIFK2vkVzq");
  expect(video).toHaveAttribute("allowfullscreen");
  expect(video).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  expect(video.getAttribute("src")).not.toMatch(/autoplay=1/);
  expect(screen.getByRole("link", { name: /Watch on YouTube/ })).toHaveAttribute("href", "https://www.youtube.com/watch?v=CShAZT8jykY");
});

it("does not expose project actions or media when closed", () => {
  render(<HeyYouModal isOpen={false} closeModal={jest.fn()} />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(screen.queryByTitle("HeyYou Honors Project Video Submission")).not.toBeInTheDocument();
});
