import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import WhaleLoop from "./WhaleLoop";

const initialSeek = { time: 0, revision: 0 };

function Player() {
  const [time, setTime] = useState(0);
  return (
    <>
      <WhaleLoop
        src="whale.webm"
        poster="whale.jpg"
        reduced={false}
        paused={false}
        onPausedChange={() => {}}
        onTime={setTime}
        seek={initialSeek}
      />
      <output aria-label="Marker media time">{time}</output>
    </>
  );
}

let decoded;
let presentation;
let nextHandle;
let originalRequest;
let originalCancel;

beforeEach(() => {
  decoded = new Map();
  presentation = new Map();
  nextHandle = 0;
  originalRequest = HTMLVideoElement.prototype.requestVideoFrameCallback;
  originalCancel = HTMLVideoElement.prototype.cancelVideoFrameCallback;
  HTMLVideoElement.prototype.requestVideoFrameCallback = (callback) => {
    decoded.set(++nextHandle, callback);
    return nextHandle;
  };
  HTMLVideoElement.prototype.cancelVideoFrameCallback = (handle) =>
    decoded.delete(handle);
  jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    presentation.set(++nextHandle, callback);
    return nextHandle;
  });
  jest
    .spyOn(window, "cancelAnimationFrame")
    .mockImplementation((handle) => presentation.delete(handle));
  jest.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  jest.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  HTMLVideoElement.prototype.requestVideoFrameCallback = originalRequest;
  HTMLVideoElement.prototype.cancelVideoFrameCallback = originalCancel;
});

function start() {
  const view = render(<Player />);
  const video = screen.getByLabelText("Actual HeyYou whale animation");
  Object.defineProperty(video, "paused", { configurable: true, value: false });
  Object.defineProperty(video, "readyState", { configurable: true, value: 4 });
  return { ...view, video };
}

function deliver(queue, metadata) {
  const pending = [...queue];
  queue.clear();
  act(() => pending.forEach(([, callback]) => callback(0, metadata)));
}

it("does not rewind the marker when an older decoded frame arrives after seeked", () => {
  const { video } = start();
  video.currentTime = 9.2;
  fireEvent.seeked(video);
  expect(
    screen.getByRole("status", { name: "Marker media time" }),
  ).toHaveTextContent("9.2");
  video.currentTime = 9.21;
  // The decoder can report an older rendered timestamp than the media clock.
  deliver(decoded, { mediaTime: 9, presentedFrames: 217 });
  expect(
    screen.getByRole("status", { name: "Marker media time" }),
  ).toHaveTextContent("9.21");
});

it("keeps following native loops when decoded-frame callbacks stop arriving", () => {
  const { video } = start();
  video.currentTime = 9;
  deliver(decoded, { mediaTime: 9, presentedFrames: 217 });
  expect(
    screen.getByRole("status", { name: "Marker media time" }),
  ).toHaveTextContent("9");
  // Native playback continues, but no further decoded callback is delivered.
  // Each value is read from the actual video property, not an elapsed timer.
  for (const time of [17.95, 0.01, 9.25, 17.95, 0.02, 9.5, 17.98, 0.01, 9.75]) {
    video.currentTime = time;
    deliver(presentation);
    expect(
      screen.getByRole("status", { name: "Marker media time" }).textContent,
    ).toBe(String(time));
  }
});

it("stops both frame update chains when the player unmounts", () => {
  const { unmount } = start();
  unmount();
  expect(presentation.size).toBe(0);
  expect(decoded.size).toBe(0);
});
