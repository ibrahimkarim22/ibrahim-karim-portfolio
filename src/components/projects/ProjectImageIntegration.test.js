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

it.each([
  ["never loads", "pending"],
  ["has a slow decode", "slow"],
  ["rejects decode", "reject"],
  ["fails to load", "error"],
])("reveals a loaded HeyYou hero independently when its peer %s", async (description, peerState) => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  render(<HeyYouModal isOpen closeModal={jest.fn()} />);
  const map = screen.getByRole("img", { name: "HeyYou group map on an Android phone" });
  const chat = screen.getByRole("img", { name: "HeyYou messages on an Android phone" });
  for (const phone of [map, chat]) {
    expect(phone).toHaveAttribute("loading", "eager");
    expect(phone).toHaveAttribute("fetchpriority", "high");
    expect(phone).toHaveAttribute("width", "1367");
    expect(phone).toHaveAttribute("height", "1221");
    Object.defineProperty(phone, "naturalWidth", { value: 1367, configurable: true });
  }
  map.decode = jest.fn(() => new Promise(() => {}));
  chat.decode = peerState === "reject"
    ? jest.fn().mockRejectedValue(new Error("Peer decode rejected"))
    : jest.fn(() => new Promise(() => {}));
  await act(async () => {
    if (peerState === "slow" || peerState === "reject") fireEvent.load(chat);
    if (peerState === "error") fireEvent.error(chat);
    fireEvent.load(map);
  });
  expect(map).toHaveAttribute("data-image-state", "ready");
  expect(map.style.clipPath).toBe("");
  expect(map.decode).not.toHaveBeenCalled();
  expect(chat).toHaveAttribute("data-image-state", peerState === "pending" ? "loading" : peerState === "error" ? "error" : "ready");
  expect(chat.decode).not.toHaveBeenCalled();
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

const modalCases = [
  ["HeyYou", HeyYouModal], ["BARD", BardModal], ["KRISPY", KrispyModal],
  ["Whack a Mole", WhackaModal], ["TUH-DOO", KanbanBoardModal], ["Portfolio", ThisPortfolioModal],
];

it.each(modalCases)("reserves every %s image and keeps noncritical imagery lazy", (name, Component) => {
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

it.each(modalCases)("reveals every %s image on its own native load even if decode never settles", async (name, Component) => {
  render(<Component isOpen closeModal={jest.fn()} />);
  const images = [...screen.getByRole("dialog").querySelectorAll("img")];
  expect(images.length).toBeGreaterThan(0);
  images.forEach((image) => {
    Object.defineProperty(image, "naturalWidth", { value: Number(image.getAttribute("width")), configurable: true });
    image.decode = jest.fn(() => new Promise(() => {}));
  });
  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    await act(async () => { fireEvent.load(image); });
    expect(image).toHaveAttribute("data-image-state", "ready");
    expect(image.style.clipPath).toBe("");
    expect(image.decode).not.toHaveBeenCalled();
    images.slice(index + 1).forEach((pending) => expect(pending).toHaveAttribute("data-image-state", "loading"));
  }
});

it.each(modalCases)("reveals cached %s images on reopening without another load event", async (name, Component) => {
  const cachedSources = new Set();
  jest.spyOn(HTMLImageElement.prototype, "complete", "get").mockImplementation(function () {
    return cachedSources.has(this.getAttribute("src"));
  });
  jest.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockImplementation(function () {
    return cachedSources.has(this.getAttribute("src")) ? Number(this.getAttribute("width")) : 0;
  });
  const originalDecode = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "decode");
  Object.defineProperty(HTMLImageElement.prototype, "decode", { configurable: true, writable: true, value: undefined });
  try {
    const { rerender } = render(<Component isOpen closeModal={jest.fn()} />);
    const firstImages = [...screen.getByRole("dialog").querySelectorAll("img")];
    expect(firstImages.length).toBeGreaterThan(0);
    await act(async () => {
      firstImages.forEach((image) => {
        cachedSources.add(image.getAttribute("src"));
        fireEvent.load(image);
      });
    });
    firstImages.forEach((image) => expect(image).toHaveAttribute("data-image-state", "ready"));
    rerender(<Component isOpen={false} closeModal={jest.fn()} />);
    firstImages.forEach((image) => expect(image).not.toBeInTheDocument());
    const decode = jest.fn(() => new Promise(() => {}));
    HTMLImageElement.prototype.decode = decode;
    await act(async () => { rerender(<Component isOpen closeModal={jest.fn()} />); });
    const reopenedImages = [...screen.getByRole("dialog").querySelectorAll("img")];
    expect(reopenedImages).toHaveLength(firstImages.length);
    reopenedImages.forEach((image, index) => {
      expect(image).not.toBe(firstImages[index]);
      expect(image).toHaveAttribute("data-image-state", "ready");
      expect(image.style.clipPath).toBe("");
    });
    expect(decode).not.toHaveBeenCalled();
  } finally {
    if (originalDecode) Object.defineProperty(HTMLImageElement.prototype, "decode", originalDecode);
    else delete HTMLImageElement.prototype.decode;
  }
});
