import { act, render, screen } from "@testing-library/react";
import ThreeDProfileView from "./ThreeDProfileView";

jest.mock("../3dEnvironment", () => function MockBlenderEnvironment() {
  return <div role="img" aria-label="3D profile scene" />;
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test("shows contained loading then the scene and orbit instructions after five seconds", () => {
  const { unmount } = render(<ThreeDProfileView />);

  expect(screen.getByText("Loading...").closest(".progress-container"))
    .toHaveClass("progress-container--contained");
  expect(screen.getByText("0%")).toBeInTheDocument();
  expect(screen.queryByRole("img", { name: "3D profile scene" }))
    .not.toBeInTheDocument();
  expect(screen.queryByText("RC")).not.toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(5000);
  });

  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(screen.getByRole("img", { name: "3D profile scene" }))
    .toBeInTheDocument();
  expect(screen.getByText("RC").closest("p")).toHaveTextContent(
    "RC PanLC RotateMW Zoom"
  );
  expect(screen.queryByRole("button", { name: "Back to Menu" }))
    .not.toBeInTheDocument();

  unmount();

  expect(jest.getTimerCount()).toBe(0);
  expect(screen.queryByRole("img", { name: "3D profile scene" }))
    .not.toBeInTheDocument();
});

test("clears simulated loading when the profile unmounts before the scene loads", () => {
  const { unmount } = render(<ThreeDProfileView />);

  act(() => {
    jest.advanceTimersByTime(1250);
  });

  expect(screen.getByText("25%")).toBeInTheDocument();

  unmount();

  expect(jest.getTimerCount()).toBe(0);
});
