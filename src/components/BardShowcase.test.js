import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BardShowcase from "./BardShowcase";

const quiz = { id: "quiz", label: "Quiz", caption: "A quiz answer", description: "Read the passage behind an answer." };
const medals = { id: "medals", label: "Medals", caption: "A medal award", description: "Explore the medal collection." };
const originalObserver = window.IntersectionObserver;
const originalMatchMedia = window.matchMedia;
let observe, preference, play, pause;

beforeEach(() => {
  window.IntersectionObserver = class {
    constructor(callback) {
      observe = (ratio) => act(() => callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]));
    }
    observe() {}
    disconnect() {}
  };
  preference = Object.assign(new EventTarget(), { matches: false });
  window.matchMedia = () => preference;
  // jsdom does not implement playback. Emulate the media events the browser sends.
  play = jest.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function () {
    Object.defineProperty(this, "paused", { value: false, configurable: true });
    fireEvent.play(this);
    return Promise.resolve();
  });
  pause = jest.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function () {
    Object.defineProperty(this, "paused", { value: true, configurable: true });
    fireEvent.pause(this);
  });
});

afterEach(() => {
  window.IntersectionObserver = originalObserver;
  window.matchMedia = originalMatchMedia;
  jest.restoreAllMocks();
});

const showcase = (stageOpen = true) => <BardShowcase scene={quiz} stageOpen={stageOpen} />;
const handset = (action) => screen.getByRole("button", { name: `${action} Quiz recording` });

it("shows each feature's heading, description and looping recording together without selection", () => {
  render(<>
    <BardShowcase scene={quiz} stageOpen><h2>Quiz feedback</h2></BardShowcase>
    <BardShowcase scene={medals} stageOpen><h2>Medal collection</h2></BardShowcase>
  </>);
  expect(screen.getByRole("heading", { name: "Quiz feedback" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Medal collection" })).toBeVisible();
  const video = screen.getByLabelText("A quiz answer");
  expect(video.loop).toBe(true);
  expect(video.muted).toBe(true);
  expect(video.playsInline).toBe(true);
  expect(video.preload).toBe("none");
  expect(video.controls).toBe(false);
  expect(video).toHaveAttribute("disablepictureinpicture");
  expect(video).toHaveAttribute("poster", "/media/bard/quiz.jpg");
  expect(handset("Play")).toContainElement(video);
  expect(handset("Play")).toHaveAccessibleDescription(quiz.description);
  expect(screen.getByRole("button", { name: "Play Medals recording" })).toHaveAccessibleDescription(medals.description);
  expect(screen.getByLabelText("A medal award")).toHaveAttribute("src", "/media/bard/medals.mp4");
  expect(screen.getAllByRole("button")).toHaveLength(2);
  expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

it("waits for the open stage and enough of the phone to be visible, and preserves a manual pause", () => {
  const { rerender } = render(showcase(false));
  observe(1);
  expect(play).not.toHaveBeenCalled();
  rerender(showcase());
  observe(0.2);
  expect(play).not.toHaveBeenCalled();
  observe(0.5);
  expect(handset("Pause")).toBeEnabled();
  observe(0);
  expect(pause).toHaveBeenCalledTimes(1);
  observe(0.6);
  fireEvent.click(handset("Pause"));
  observe(0);
  observe(1);
  expect(handset("Play")).toBeEnabled();
  expect(play).toHaveBeenCalledTimes(2);
});

it("requires opt-in for reduced motion, pauses in the background, and resumes the user's selection", async () => {
  preference.matches = true;
  const hidden = jest.spyOn(document, "hidden", "get").mockReturnValue(false);
  render(showcase());
  observe(0.9);
  expect(play).not.toHaveBeenCalled();
  const user = userEvent.setup();
  handset("Play").focus();
  await user.keyboard("{Enter}");
  observe(0.6);
  expect(handset("Pause")).toBeEnabled();
  hidden.mockReturnValue(true);
  fireEvent(document, new Event("visibilitychange"));
  expect(handset("Play")).toBeEnabled();
  hidden.mockReturnValue(false);
  fireEvent(document, new Event("visibilitychange"));
  expect(handset("Pause")).toBeEnabled();
  observe(0);
  expect(handset("Play")).toBeEnabled();
});

it("waits for a fresh visibility measurement when the curtain reopens after manual playback", () => {
  preference.matches = true;
  const { rerender } = render(showcase());
  observe(0.5);
  fireEvent.click(handset("Play"));
  rerender(showcase(false));
  rerender(showcase());
  expect(play).toHaveBeenCalledTimes(1);
  observe(0);
  expect(play).toHaveBeenCalledTimes(1);
  observe(0.5);
  expect(handset("Pause")).toBeEnabled();
});

it("allows a tap after blocked autoplay and restores the source poster and description if the clip fails", async () => {
  play.mockRejectedValueOnce(new DOMException("Gesture required", "NotAllowedError"));
  render(showcase());
  observe(1);
  fireEvent.click(handset("Play"));
  expect(handset("Pause")).toBeEnabled();
  fireEvent.error(screen.getByLabelText("A quiz answer"));
  expect(await screen.findByRole("img", { name: "A quiz answer" })).toHaveAttribute("src", "/media/bard/quiz.jpg");
  expect(screen.getByText(quiz.description)).toBeVisible();
  expect(screen.queryByRole("button", { name: /Quiz recording/ })).not.toBeInTheDocument();
});
