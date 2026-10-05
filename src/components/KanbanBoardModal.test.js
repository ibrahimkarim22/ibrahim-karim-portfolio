import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KanbanBoardModal from "./KanbanBoardModal";

const openProject = () => render(<KanbanBoardModal isOpen closeModal={jest.fn()} />);
const sampleBoard = () => screen.getByRole("region", { name: "Interactive sample board" });
const column = (name) => within(sampleBoard()).getByRole("region", { name });
const sampleTask = () => within(sampleBoard()).getByRole("listitem", { name: "Outline the idea" });

it("names the dialog and exposes a focusable case study", () => {
  openProject();
  expect(screen.getByRole("dialog", { name: "TUH-DOO" })).toHaveAttribute("aria-modal", "true");
  expect(screen.getByRole("region", { name: "Tuh-Doo case study" })).toHaveAttribute("tabindex", "0");
});

it("moves focus to the workflow without creating a browser-history entry", async () => {
  openProject();
  const before = window.location.href;
  await userEvent.setup().click(screen.getByRole("button", { name: "Try the workflow" }));
  expect(screen.getByRole("heading", { name: "Good work moves forward." })).toHaveFocus();
  expect(window.location.href).toBe(before);
});

it("moves a task by keyboard, retains focus, announces completion, and allows undo", async () => {
  openProject();
  const user = userEvent.setup();
  const next = within(sampleTask()).getByRole("button", { name: "Move Outline the idea to In Progress" });
  next.focus();
  await user.keyboard("{Enter}");
  expect(within(column("Backlog")).queryByRole("listitem", { name: "Outline the idea" })).not.toBeInTheDocument();
  expect(within(column("In Progress")).getByRole("listitem", { name: "Outline the idea" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Move Outline the idea to Complete" })).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(within(column("Complete")).getByRole("listitem", { name: "Outline the idea" })).toBeInTheDocument();
  expect(within(sampleBoard()).getByRole("status")).toHaveTextContent("Outline the idea completed. 2 of 5 tasks complete.");
  expect(screen.getByRole("button", { name: "Move Outline the idea to In Progress" })).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(within(column("In Progress")).getByRole("listitem", { name: "Outline the idea" })).toBeInTheDocument();
  expect(within(sampleBoard()).getAllByRole("listitem")).toHaveLength(5);
});

it("supports native drag to another state without duplicating cards", () => {
  openProject();
  const values = {};
  const dataTransfer = { setData: (key, value) => { values[key] = value; }, getData: (key) => values[key] || "", effectAllowed: "" };
  fireEvent.dragStart(sampleTask(), { dataTransfer });
  fireEvent.dragOver(column("Complete"), { dataTransfer });
  fireEvent.drop(column("Complete"), { dataTransfer });
  expect(within(column("Complete")).getByRole("listitem", { name: "Outline the idea" })).toBeInTheDocument();
  expect(within(sampleBoard()).getAllByRole("listitem")).toHaveLength(5);
  fireEvent.drop(column("Backlog"), { dataTransfer });
  expect(within(column("Complete")).getByRole("listitem", { name: "Outline the idea" })).toBeInTheDocument();
});

it("ignores foreign and same-column drops", () => {
  openProject();
  const foreign = { getData: () => "TD-01" };
  fireEvent.drop(column("Complete"), { dataTransfer: foreign });
  expect(within(column("Backlog")).getByRole("listitem", { name: "Outline the idea" })).toBeInTheDocument();
  const values = {};
  const dataTransfer = { setData: (key, value) => { values[key] = value; }, getData: (key) => values[key] || "" };
  fireEvent.dragStart(sampleTask(), { dataTransfer });
  fireEvent.drop(column("Backlog"), { dataTransfer });
  expect(within(sampleBoard()).getAllByRole("listitem")).toHaveLength(5);
  expect(within(sampleBoard()).getByRole("status")).toBeEmptyDOMElement();
});

it("restores the initial sample tasks with Reset board", async () => {
  openProject();
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Move Outline the idea to In Progress" }));
  await user.click(screen.getByRole("button", { name: "Reset board" }));
  expect(within(column("Backlog")).getByRole("listitem", { name: "Outline the idea" })).toBeInTheDocument();
  expect(within(column("Backlog")).getAllByRole("listitem")).toHaveLength(2);
  expect(within(column("In Progress")).getAllByRole("listitem")).toHaveLength(2);
  expect(within(column("Complete")).getAllByRole("listitem")).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Reset board" })).toHaveFocus();
});

it("tracks reading progress and safely handles a body with no scroll distance", () => {
  openProject();
  const body = screen.getByRole("region", { name: "Tuh-Doo case study" });
  Object.defineProperties(body, { scrollHeight: { configurable: true, value: 2000 }, clientHeight: { configurable: true, value: 500 } });
  body.scrollTop = 750;
  fireEvent.scroll(body);
  expect(screen.getByRole("progressbar", { name: "Case study progress" })).toHaveAttribute("aria-valuenow", "50");
  body.scrollTop = 1500;
  fireEvent.scroll(body);
  expect(screen.getByRole("progressbar", { name: "Case study progress" })).toHaveAttribute("aria-valuetext", "Complete");
  body.scrollTop = 0;
  fireEvent.scroll(body);
  expect(screen.getByRole("progressbar", { name: "Case study progress" })).toHaveAttribute("aria-valuenow", "0");
  Object.defineProperty(body, "scrollHeight", { configurable: true, value: 500 });
  fireEvent.scroll(body);
  expect(screen.getByRole("progressbar", { name: "Case study progress" })).toHaveAttribute("aria-valuenow", "100");
});

it("preserves all app and implementation captures with meaningful descriptions and full-size access", () => {
  openProject();
  expect(screen.getAllByRole("img", { name: /^Tuh-Doo app:/ }).map((img) => img.getAttribute("src"))).toEqual([
    "tuhdoo1.png", "tuhdoo2.png", "tuhdoo3.png",
  ]);
  expect(screen.getAllByRole("img", { name: /^Tuh-Doo implementation:/ }).map((img) => img.getAttribute("src"))).toEqual(expect.arrayContaining([
    "kanbanReact.png", "kanbanReactTwo.png", "kanbanJS.png", "kanbanFirebase.png", "kanbanFirebaseLogin.png", "kanbanFirestore.png", "kanbanSass1.png", "kanbanSass2.png", "kanbanSass3.png",
  ]));
  const links = screen.getAllByRole("link", { name: /^View .* at full size/ });
  expect(links).toHaveLength(12);
  links.forEach((link) => {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
  expect(screen.getByRole("link", { name: /Open board/ })).toHaveAttribute("href", "https://kanbanboardtodolist.web.app/");
  expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/ibrahimkarim22/kanbanboard");
});

it.each(["Close project", "Close"])("connects %s to the close action", async (name) => {
  const closeModal = jest.fn();
  render(<KanbanBoardModal isOpen closeModal={closeModal} />);
  await userEvent.setup().click(screen.getByRole("button", { name, exact: true }));
  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("connects Escape to close", () => {
  const closeModal = jest.fn();
  render(<KanbanBoardModal isOpen closeModal={closeModal} />);
  fireEvent.keyUp(screen.getByRole("dialog"), { key: "Escape", keyCode: 27 });
  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("contains focus, restores the opener, and resets local state on reopening", async () => {
  const project = (isOpen) => <><button>Open Tuh-Doo</button><KanbanBoardModal isOpen={isOpen} closeModal={jest.fn()} /></>;
  const { rerender } = render(project(false));
  const opener = screen.getByRole("button", { name: "Open Tuh-Doo" });
  opener.focus();
  rerender(project(true));
  await waitFor(() => expect(screen.getByRole("dialog")).toHaveFocus());
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Move Outline the idea to In Progress" }));
  const last = screen.getByRole("link", { name: /GitHub/ });
  last.focus();
  fireEvent.keyDown(last, { key: "Tab", keyCode: 9, which: 9 });
  expect(screen.getByRole("button", { name: "Close project" })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("button", { name: "Close project" }), { key: "Tab", keyCode: 9, which: 9, shiftKey: true });
  expect(last).toHaveFocus();
  rerender(project(false));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(opener).toHaveFocus();
  rerender(project(true));
  expect(within(column("Backlog")).getByRole("listitem", { name: "Outline the idea" })).toBeInTheDocument();
  expect(screen.getByRole("progressbar", { name: "Case study progress" })).toHaveAttribute("aria-valuenow", "0");
});
