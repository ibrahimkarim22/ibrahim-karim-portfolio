import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeCenterView from "../home/HomeCenterView";
import HomeContextPanel from "../home/HomeContextPanel";

jest.mock("../Logo", () => function Logo() { return <div />; });
jest.mock("../profile/ThreeDProfileView", () => function Profile() { return <div />; });

let originalResizeObserver;
let resizePreview;
let previewViewport;
let observerDisconnected;

beforeEach(() => {
  originalResizeObserver = window.ResizeObserver;
  observerDisconnected = false;
  window.ResizeObserver = class {
    constructor(callback) { resizePreview = callback; }
    observe(viewport) { previewViewport = viewport; }
    disconnect() { observerDisconnected = true; }
  };
});

afterEach(() => {
  cleanup();
  window.ResizeObserver = originalResizeObserver;
});

test("Megaracer renders its online profile as one native external link in the center", () => {
  render(<HomeCenterView activeView="megaracer" />);
  expect(screen.getByRole("heading", { name: "Megaracer view" })).toBeInTheDocument();
  const preview = within(screen.getByRole("region", { name: "Megaracer profile" }));
  const link = preview.getByRole("link", { name: "Visit Megaracer / TypeRacer profile" });
  expect(preview.getAllByRole("link")).toHaveLength(1);
  expect(link).toHaveAttribute("href", "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(preview.queryByText("Visit profile")).not.toBeInTheDocument();
  const frame = preview.getByTitle("Megaracer / TypeRacer profile preview");
  expect(frame).toHaveAttribute("src", "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22");
  expect(frame).toHaveAttribute("aria-hidden", "true");
  expect(frame).toHaveAttribute("tabindex", "-1");
});

test("keyboard traversal has one profile stop before leaving the preview", async () => {
  const user = userEvent.setup();
  render(<><HomeCenterView activeView="megaracer" /><button>Outside preview</button></>);
  await user.tab();
  expect(screen.getByRole("link", { name: "Visit Megaracer / TypeRacer profile" })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole("button", { name: "Outside preview" })).toHaveFocus();
});

test("repeat selection and lighting renders keep the profile iframe mounted", () => {
  const { rerender } = render(<div style={{ "--section-light": "#ccdd88" }}><HomeCenterView activeView="megaracer" /></div>);
  const frame = screen.getByTitle("Megaracer / TypeRacer profile preview");
  const link = screen.getByRole("link", { name: "Visit Megaracer / TypeRacer profile" });
  rerender(<div style={{ "--section-light": "#ddee99" }}><HomeCenterView activeView="megaracer" /></div>);
  expect(screen.getByTitle("Megaracer / TypeRacer profile preview")).toBe(frame);
  expect(screen.getByRole("link", { name: "Visit Megaracer / TypeRacer profile" })).toBe(link);
});

test("resizing fits the full logical profile width without replacing the iframe", () => {
  const { unmount } = render(<HomeCenterView activeView="megaracer" />);
  const frame = screen.getByTitle("Megaracer / TypeRacer profile preview");
  jest.spyOn(previewViewport, "getBoundingClientRect").mockReturnValue({ width: 550, height: 330 });
  act(() => resizePreview());
  expect(frame).toHaveStyle({ width: "1100px", height: "660px", transform: "scale(0.5)" });
  jest.spyOn(previewViewport, "getBoundingClientRect").mockReturnValue({ width: 990, height: 594 });
  act(() => resizePreview());
  expect(frame).toHaveStyle({ width: "1100px", height: "660px", transform: "scale(0.9)" });
  expect(screen.getByTitle("Megaracer / TypeRacer profile preview")).toBe(frame);
  unmount();
  expect(observerDisconnected).toBe(true);
});

test("the Megaracer context describes typing activity and links its purpose to visiting the profile", () => {
  render(<HomeContextPanel activeView="megaracer" />);
  const context = within(screen.getByRole("complementary", { name: "Portfolio context" }));
  expect(context.getByText("MEGARACER")).toBeInTheDocument();
  expect(context.getByRole("heading", { name: "Typing, at speed." })).toBeInTheDocument();
  expect(context.getByText(/typing races/i)).toBeInTheDocument();
  expect(context.getByText(/Visit the live profile/i)).toBeInTheDocument();
  const visit = context.getByRole("link", { name: "Visit profile" });
  expect(visit).toHaveAttribute("href", "https://data.typeracer.com/pit/profile?user=ib_ra_heem_22");
  expect(visit).toHaveAttribute("target", "_blank");
  expect(visit).toHaveAttribute("rel", "noopener noreferrer");
});
