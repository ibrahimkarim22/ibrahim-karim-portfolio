import { act, fireEvent, render, screen } from "@testing-library/react";
import HeyYouModal from "../HeyYouModal";
import BardModal from "../BardModal";
import KrispyModal from "../KrispyModal";
import WhackaModal from "../WhackaModal";
import KanbanBoardModal from "../KanbanBoardModal";
import ThisPortfolioModal from "../ThisPortfolioModal";
import ProjectSelector from "./ProjectSelector";
import ProjectModalHost from "./ProjectModalHost";

beforeEach(() => {
  // JSDOM has no media playback; keep the real modal and image lifecycle intact.
  jest.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  jest.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

const projects = [
  { id: "heyyou", name: "HeyYou", description: "Location & Chat", technologies: [] },
  { id: "whackamole", name: "Whack a Mole", description: "Game", technologies: [] },
];

it("warms only the intended project's hero images on hover, focus and activation", () => {
  const images = [];
  jest.spyOn(window, "Image").mockImplementation(() => {
    const image = { complete: false, naturalWidth: 0 };
    images.push(image);
    return image;
  });
  try {
    render(<ProjectSelector projects={projects} onSelectProject={jest.fn()} />);
    expect(images).toHaveLength(0);
    const card = screen.getByRole("button", { name: "HeyYou Location & Chat" });
    fireEvent.pointerEnter(card, { pointerType: "mouse" });
    expect(images.map(({ src }) => src)).toEqual(["phoneHeyYouMap.png", "phoneHeyYouChat.png"]);
    fireEvent.focus(card);
    fireEvent.pointerDown(card);
    fireEvent.click(card);
    expect(images).toHaveLength(2);
  } finally {
    jest.restoreAllMocks();
  }
});

it("keeps both HeyYou phones concealed until both finish decoding", async () => {
  render(<HeyYouModal isOpen closeModal={jest.fn()} />);
  const map = screen.getByRole("img", { name: "HeyYou group map on an Android phone" });
  const chat = screen.getByRole("img", { name: "HeyYou messages on an Android phone" });
  for (const phone of [map, chat]) {
    expect(phone).toHaveAttribute("loading", "eager");
    expect(phone).toHaveAttribute("fetchpriority", "high");
    expect(phone).toHaveAttribute("width", "1367");
    expect(phone).toHaveAttribute("height", "1221");
    expect(phone).toHaveStyle({ clipPath: "inset(50%)" });
    Object.defineProperty(phone, "naturalWidth", { value: 1367 });
  }
  let finishMap, finishChat;
  map.decode = () => new Promise((resolve) => { finishMap = resolve; });
  chat.decode = () => new Promise((resolve) => { finishChat = resolve; });
  fireEvent.load(map);
  fireEvent.load(chat);
  await act(async () => { finishMap(); });
  expect(map).toHaveAttribute("data-image-state", "loading");
  await act(async () => { finishChat(); });
  expect(map).toHaveAttribute("data-image-state", "ready");
  expect(chat).toHaveAttribute("data-image-state", "ready");
});

it("warms the direct route's assembly only and reuses it on reopening", () => {
  const images = [];
  jest.spyOn(window, "Image").mockImplementation(() => {
    const image = { complete: false, naturalWidth: 0 };
    images.push(image);
    return image;
  });
  const { rerender } = render(<ProjectModalHost selectedProjectId={null} onClose={jest.fn()} />);
  expect(images).toHaveLength(0);
  rerender(<ProjectModalHost selectedProjectId="thisportfolio" onClose={jest.fn()} />);
  expect(images.map(({ src }) => src)).toEqual(["heyyou-connection.jpg", "bard-curtain.jpg", "tuhdoo-board.jpg"]);
  rerender(<ProjectModalHost selectedProjectId={null} onClose={jest.fn()} />);
  rerender(<ProjectModalHost selectedProjectId="thisportfolio" onClose={jest.fn()} />);
  expect(images).toHaveLength(3);
});

it("starts warming at touch selection before invoking navigation", () => {
  const images = [];
  jest.spyOn(window, "Image").mockImplementation(() => {
    const image = { complete: false, naturalWidth: 0 };
    images.push(image);
    return image;
  });
  const selected = jest.fn(() => expect(images).toHaveLength(1));
  render(<ProjectSelector projects={projects} onSelectProject={selected} />);
  const card = screen.getByRole("button", { name: "Whack a Mole Game" });
  fireEvent.pointerDown(card, { pointerType: "touch" });
  expect(images.map(({ src }) => src)).toEqual(["whacka.gif"]);
  fireEvent.click(card);
  expect(selected).toHaveBeenCalledWith("whackamole", card);
});

it.each([
  ["HeyYou", HeyYouModal], ["BARD", BardModal], ["KRISPY", KrispyModal],
  ["Whack a Mole", WhackaModal], ["TUH-DOO", KanbanBoardModal], ["Portfolio", ThisPortfolioModal],
])("reserves every %s image and keeps noncritical imagery lazy", (name, Component) => {
  render(<Component isOpen closeModal={jest.fn()} />);
  const images = [...screen.getByRole("dialog").querySelectorAll("img")];
  expect(images.length).toBeGreaterThan(0);
  images.forEach((image) => {
    expect(Number(image.getAttribute("width"))).toBeGreaterThan(0);
    expect(Number(image.getAttribute("height"))).toBeGreaterThan(0);
    expect(image).toHaveAttribute("data-image-state", "loading");
    if (image.getAttribute("fetchpriority") !== "high") expect(image).toHaveAttribute("loading", "lazy");
  });
  if (["BARD", "KRISPY", "TUH-DOO"].includes(name)) {
    expect(images.every((image) => image.getAttribute("loading") === "lazy")).toBe(true);
  }
});
