import { render, screen } from "@testing-library/react";
import Progress from "./Progress";

test("keeps viewport progress as the default with its existing loading copy", () => {
  const { container } = render(<Progress progress={25} />);

  expect(container.firstChild).toHaveClass("progress-container");
  expect(container.firstChild).not.toHaveClass("progress-container--contained");
  expect(screen.getByText("Loading...")).toBeInTheDocument();
  expect(screen.getByText("25%")).toBeInTheDocument();
});

test("allows progress to fit its parent without changing the loading copy", () => {
  const { container } = render(<Progress progress={25} contained />);

  expect(container.firstChild).toHaveClass("progress-container");
  expect(container.firstChild).toHaveClass("progress-container--contained");
  expect(screen.getByText("Loading...")).toBeInTheDocument();
  expect(screen.getByText("25%")).toBeInTheDocument();
});
