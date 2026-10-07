let loader, images, imageConstructor;

beforeEach(() => {
  images = [];
  imageConstructor = jest.spyOn(window, "Image").mockImplementation(() => {
    const image = { complete: false, naturalWidth: 0, decode: jest.fn().mockResolvedValue() };
    images.push(image);
    return image;
  });
  jest.isolateModules(() => { loader = require("./projectImageLoading"); });
});
afterEach(() => jest.restoreAllMocks());

function load(image) {
  image.complete = true;
  image.naturalWidth = 1367;
  image.onload();
}

it("preloads no images at import and isolates each project's critical URLs", async () => {
  expect(imageConstructor).not.toHaveBeenCalled();
  const result = loader.preloadProjectImages("heyyou");
  expect(images.map(({ src }) => src)).toEqual(["phoneHeyYouMap.png", "phoneHeyYouChat.png"]);
  images.forEach((image) => {
    expect(image.fetchPriority).toBe("high");
    load(image);
  });
  await expect(result).resolves.toEqual([true, true]);
});

it("shares in-flight work and retains decoded URLs across repeated openings", async () => {
  const first = loader.preloadImage("hero.png");
  expect(loader.preloadImage("hero.png")).toBe(first);
  expect(images).toHaveLength(1);
  let decoded;
  images[0].decode = () => new Promise((resolve) => { decoded = resolve; });
  load(images[0]);
  let settled = false;
  first.then(() => { settled = true; });
  await Promise.resolve();
  expect(settled).toBe(false);
  decoded();
  await expect(first).resolves.toBe(true);
  expect(loader.preloadImage("hero.png")).toBe(first);
  expect(images).toHaveLength(1);
});

it("uses a successfully loaded image when decode rejects, and reports the URL", async () => {
  const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
  const result = loader.preloadImage("decode-fallback.png");
  images[0].decode.mockRejectedValue(new Error("Decode unsupported for this image"));
  load(images[0]);
  await expect(result).resolves.toBe(true);
  expect(warning.mock.calls[0][0]).toContain("decode-fallback.png");
});

it("supports browsers without decode", async () => {
  const result = loader.preloadImage("legacy.png");
  images[0].decode = undefined;
  load(images[0]);
  await expect(result).resolves.toBe(true);
});

it("handles load errors without rejection and permits a subsequent intentional retry", async () => {
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  const result = loader.preloadImage("missing.png");
  images[0].onerror();
  await expect(result).resolves.toBe(false);
  expect(error.mock.calls[0][0]).toContain("missing.png");
  const retry = loader.preloadImage("missing.png");
  expect(images).toHaveLength(2);
  load(images[1]);
  await expect(retry).resolves.toBe(true);
});

it.each(["bard", "krispy", "kanban", "megaracer", "unknown", null])("does not preload raster imagery for %s", async (id) => {
  const result = loader.preloadProjectImages(id);
  expect(images).toHaveLength(0);
  await expect(result).resolves.toEqual([]);
});
