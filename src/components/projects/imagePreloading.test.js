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

it("deduplicates pending requests before an image has loaded", async () => {
  const first = loader.preloadImage("pending.png");
  expect(loader.preloadImage("pending.png")).toBe(first);
  expect(images).toHaveLength(1);
  let settled = false;
  first.then(() => { settled = true; });
  await Promise.resolve();
  expect(settled).toBe(false);
  load(images[0]);
  await expect(first).resolves.toBe(true);
});

it("settles and caches a native load even when decode never settles", async () => {
  const first = loader.preloadImage("hero.png");
  images[0].decode.mockImplementation(() => new Promise(() => {}));
  let settled;
  first.then((success) => { settled = success; });
  load(images[0]);
  await Promise.resolve();
  expect(settled).toBe(true);
  await expect(first).resolves.toBe(true);
  expect(images[0].decode).not.toHaveBeenCalled();
  expect(loader.preloadImage("hero.png")).toBe(first);
  expect(images).toHaveLength(1);
});

it("settles a successful native load without invoking explicit decode", async () => {
  const result = loader.preloadImage("loaded.png");
  load(images[0]);
  await expect(result).resolves.toBe(true);
  expect(images[0].decode).not.toHaveBeenCalled();
});

it("uses a successfully loaded image without invoking its rejecting decode method", async () => {
  const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
  const result = loader.preloadImage("decode-fallback.png");
  images[0].decode.mockRejectedValue(new Error("Decode unsupported for this image"));
  load(images[0]);
  await expect(result).resolves.toBe(true);
  expect(images[0].decode).not.toHaveBeenCalled();
  expect(warning).not.toHaveBeenCalled();
});

it("supports browsers without decode", async () => {
  const result = loader.preloadImage("legacy.png");
  images[0].decode = undefined;
  load(images[0]);
  await expect(result).resolves.toBe(true);
});

it("does not cache a load event without image pixels", async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  const result = loader.preloadImage("empty.png");
  images[0].complete = true;
  images[0].onload();
  await expect(result).resolves.toBe(false);
  const retry = loader.preloadImage("empty.png");
  expect(images).toHaveLength(2);
  load(images[1]);
  await expect(retry).resolves.toBe(true);
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
