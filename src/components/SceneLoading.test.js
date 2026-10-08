import { Suspense } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import * as THREE from "three";
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, PerspectiveCamera, Vector3 } from "three";
import { PortfolioRoutes } from "../App";
import Logo from "./Logo";

let mockAsset;
let mockSceneState;
let mockSceneFrames;

// JSDOM cannot render WebGL. Substitute only the GPU/loader boundary: the real
// model components, Suspense, shell, readiness and camera rig still execute.
jest.mock("@react-three/fiber", () => {
  const React = require("react");
  return {
    Canvas: ({ children, className }) => (
      <div className={className}>
        <canvas aria-label="Scene canvas" />
        {React.Children.toArray(children).filter((child) => typeof child.type !== "string")}
      </div>
    ),
    useFrame: (callback, priority) => {
      React.useLayoutEffect(() => {
        if (priority !== 1) return undefined;
        mockSceneFrames.add(callback);
        return () => mockSceneFrames.delete(callback);
      }, [callback, priority]);
    },
    useThree: (selector) => selector ? selector(mockSceneState) : mockSceneState,
  };
});
jest.mock("@react-three/drei", () => {
  const React = require("react");
  const { Vector3 } = require("three");
  return {
    useGLTF: () => {
      if (!mockAsset.ready) throw mockAsset.promise;
      return mockAsset.value;
    },
    PerspectiveCamera: React.forwardRef(() => null),
    OrbitControls: React.forwardRef(function MockControls(props, ref) {
      const controls = React.useMemo(() => ({
        object: mockSceneState.camera,
        target: new Vector3(),
        update: jest.fn(),
        saveState: jest.fn(),
      }), []);
      React.useImperativeHandle(ref, () => controls, [controls]);
      return null;
    }),
  };
});

let originalMatchMedia;
let sceneHostWarning;

beforeEach(() => {
  // Only silence the known DOM-renderer warning for R3F's primitive host tag.
  // Other React errors still reach the console; this is not a GPU/visual test.
  const reportError = console.error;
  sceneHostWarning = jest.spyOn(console, "error").mockImplementation((message, ...args) => {
    if (typeof message === "string" && message.startsWith("Warning: The tag <%s> is unrecognized")
      && ["primitive", "group"].includes(args[0])) return;
    reportError(message, ...args);
  });
  mockSceneFrames = new Set();
  originalMatchMedia = window.matchMedia;
  window.matchMedia = () => ({
    matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn(),
  });
  const scene = new Group();
  const logoMaterialNames = ["Material.001", "Material.003", "Material.004", "Material.007"];
  ["ibrahimBuilding", "nucampBuilding", "wayneStateBuilding", "skillsBuilding"].forEach((name, index) => {
    const material = new MeshStandardMaterial({ color: "#ffffff" });
    material.name = logoMaterialNames[index];
    const tower = new Mesh(new BoxGeometry(10, 30, 10), material);
    tower.name = name;
    tower.position.set(index * 15, 15, 0);
    scene.add(tower);
  });
  let resolve;
  mockAsset = {
    ready: false,
    promise: new Promise((done) => { resolve = done; }),
    value: { scene, animations: [] },
    resolve: () => { mockAsset.ready = true; resolve(); },
  };
  mockSceneState = { scene: new Group(), camera: new PerspectiveCamera(60), size: { width: 600, height: 300 },
    gl: { compile: () => new Set(), properties: { get: () => ({}) }, clear: jest.fn(), render: jest.fn() },
  };
});

afterEach(() => {
  sceneHostWarning.mockRestore();
  window.matchMedia = originalMatchMedia;
});

function RouteProbe() {
  const location = useLocation();
  return <output aria-label="Route entry">{location.pathname}:{location.key}</output>;
}

function renderPortfolio(path = "/") {
  return render(
    <Suspense fallback={<p>Outside scene suspension</p>}>
      <MemoryRouter initialEntries={[path]}>
        <PortfolioRoutes />
        <RouteProbe />
      </MemoryRouter>
    </Suspense>
  );
}

async function finishAsset({ renderFrame = true } = {}) {
  // Canvas startup now follows a real paint opportunity before asset readiness.
  await screen.findByLabelText("Scene canvas");
  await act(async () => {
    mockAsset.resolve();
    await mockAsset.promise;
  });
  if (renderFrame) act(() => Array.from(mockSceneFrames).forEach(frame => frame(mockSceneState, 1 / 60)));
}

test("the Home name scene uses the shared opaque near-black environment color", async () => {
  render(<Logo />);
  await screen.findByLabelText("Scene canvas");
  expect(mockSceneState.scene.background?.getHexString()).toBe("050505");
});

test("the Home name clones and recolors only its four named materials", async () => {
  const originalMaterials = mockAsset.value.scene.children.map(({ material }) => material);
  const sceneClone = jest.spyOn(mockAsset.value.scene, "clone");
  const { unmount } = render(<Logo />);
  await finishAsset();
  const homeScene = sceneClone.mock.results[0].value;
  const homeMaterials = homeScene.children.map(({ material }) => material);
  expect(homeMaterials.map(({ color }) => color.getHexString())).toEqual([
    "6a1e2d", "14090d", "ff3131", "ff3131",
  ]);
  homeMaterials.forEach((material, index) => expect(material).not.toBe(originalMaterials[index]));
  expect(originalMaterials.map(({ color }) => color.getHexString())).toEqual([
    "ffffff", "ffffff", "ffffff", "ffffff",
  ]);
  unmount();
  expect(mockAsset.value.scene.children.map(({ material }) => material)).toEqual(originalMaterials);
  expect(homeScene.children.map(({ material }) => material)).toEqual(originalMaterials);
  sceneClone.mockRestore();
});

test("only previously filled lettering gets sign lighting while hollow interiors retain their original dark red depth", async () => {
  const accent = "#efd09b";
  document.documentElement.style.setProperty("--home-logo-moonlight", accent);
  const sourceMaterial = mockAsset.value.scene.children[2].material;
  const depthMaterial = mockAsset.value.scene.children[1].material;
  const sourceGeometry = new BoxGeometry(1, 1, 1);
  const names = ["inner", "inner.001", "inner.002", "inner.003"];
  names.forEach((name) => {
    const node = new Group();
    node.name = THREE.PropertyBinding.sanitizeNodeName(name);
    node.userData.name = name;
    const inset = new Mesh(sourceGeometry, sourceMaterial);
    inset.name = `inset-${name}`;
    node.add(inset);
    const hollow = new Mesh(sourceGeometry, depthMaterial);
    hollow.name = `hollow-${name}`;
    node.add(hollow);
    mockAsset.value.scene.add(node);
  });
  const sceneClone = jest.spyOn(mockAsset.value.scene, "clone");
  const { unmount } = render(<Logo />);
  try {
    await finishAsset();
    const scene = sceneClone.mock.results[0].value;
    const shaders = names.map((name) => {
      const mesh = scene.getObjectByName(`inset-${name}`);
      expect(mesh.material.emissive.getHexString()).toBe("ff3131");
      const hollow = scene.getObjectByName(`hollow-${name}`);
      expect(hollow.material.color.getHexString()).toBe("14090d");
      expect(hollow.material.emissive.getHexString()).toBe("000000");
      const hollowShader = { uniforms: {}, vertexShader: THREE.ShaderLib.standard.vertexShader, fragmentShader: THREE.ShaderLib.standard.fragmentShader };
      hollow.material.onBeforeCompile(hollowShader, {});
      expect(hollowShader.fragmentShader).toBe(THREE.ShaderLib.standard.fragmentShader);
      expect(mesh.geometry).toBe(sourceGeometry);
      expect(mesh.material.roughness).toBe(sourceMaterial.roughness);
      expect(mesh.material.metalness).toBe(sourceMaterial.metalness);
      const shader = { uniforms: {}, vertexShader: THREE.ShaderLib.standard.vertexShader, fragmentShader: THREE.ShaderLib.standard.fragmentShader };
      mesh.material.onBeforeCompile(shader, {});
      return shader;
    });
    // Reusing the GLB's material across words must not couple their lamps.
    const firstFill = scene.getObjectByName("inset-inner").material;
    const nextFill = scene.getObjectByName("inset-inner.001").material;
    expect(firstFill).not.toBe(nextFill);
    shaders.forEach((shader) => {
      expect(shader.uniforms.homeMoonlightColor.value.getHexString()).toBe("efd09b");
      // All front faces now use moonlight, including the initial i and phonetics.
      expect(shader.vertexShader).toContain("abs(normal.y)");
      expect(shader.fragmentShader.indexOf("gl_FragColor.rgb = homeMoonlightColor")).toBeGreaterThan(shader.fragmentShader.indexOf("#include <tonemapping_fragment>"));
      expect(shader.fragmentShader.indexOf("gl_FragColor.rgb = homeMoonlightColor")).toBeLessThan(shader.fragmentShader.indexOf("#include <colorspace_fragment>"));
    });
    expect(sourceMaterial.color.getHexString()).toBe("ffffff");
    expect(sourceMaterial.onBeforeCompile.toString()).not.toContain("homeMoonlightColor");
    unmount();
    names.forEach((name) => expect(scene.getObjectByName(`inset-${name}`).material).toBe(sourceMaterial));
  } finally {
    unmount();
    sceneClone.mockRestore();
    document.documentElement.style.removeProperty("--home-logo-moonlight");
  }
});

test("the Home name warms only its imported blue directional lights and restores them", async () => {
  expect(THREE.PropertyBinding.sanitizeNodeName("Sun.001")).toBe("Sun001");
  const sun = new THREE.DirectionalLight("#0000ff", 5000);
  sun.name = "Sun";
  sun.userData.name = "Sun";
  const animatedSun = new THREE.DirectionalLight("#0000ff", 5000);
  // GLTFLoader removes reserved dots from live Object3D names but retains the
  // authored node name in userData.
  animatedSun.name = "Sun001";
  animatedSun.userData.name = "Sun.001";
  const unrelatedLight = new THREE.DirectionalLight("#00ff00", 25);
  unrelatedLight.name = "Other";
  mockAsset.value.scene.add(sun, animatedSun, unrelatedLight);
  const sceneClone = jest.spyOn(mockAsset.value.scene, "clone");

  const { unmount } = render(<Logo />);
  await finishAsset();

  const lights = [];
  sceneClone.mock.results[0].value.traverse((object) => {
    if (object.isDirectionalLight) lights.push(object);
  });
  expect(lights.map((light) => light.color.getHexString())).toEqual(["f2e2c4", "f2e2c4", "00ff00"]);
  expect(lights.map((light) => light.intensity)).toEqual([5000, 5000, 25]);
  // Neither GLTF-cache nodes nor their original materials/lights are mutated.
  expect(sun.color.getHexString()).toBe("0000ff");
  expect(animatedSun.color.getHexString()).toBe("0000ff");
  expect(unrelatedLight.color.getHexString()).toBe("00ff00");

  unmount();
  expect(sun.color.getHexString()).toBe("0000ff");
  expect(animatedSun.color.getHexString()).toBe("0000ff");
  sceneClone.mockRestore();
});

test("the Home name uses one weighted fly-system entrance and never starts the baked mixer", async () => {
  mockAsset.value.animations = [{ name: "outerAction.002" }, { name: "innerAction.002" }];
  const mixerSpy = jest.spyOn(THREE, "AnimationMixer");
  try {
    const { container } = render(<Logo />);
    await finishAsset();
    expect(mixerSpy).not.toHaveBeenCalled();
    expect(container.querySelectorAll("primitive")).toHaveLength(1);
  } finally {
    mixerSpy.mockRestore();
  }
});

test("reduced motion leaves the Home name at rest without starting its mixer", async () => {
  window.matchMedia = () => ({
    matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn(),
  });
  mockAsset.value.animations = [{ name: "outerAction.002" }, { name: "innerAction.002" }];
  const mixerSpy = jest.spyOn(THREE, "AnimationMixer");
  try {
    render(<Logo />);
    await finishAsset();
    expect(mixerSpy).not.toHaveBeenCalled();
  } finally {
    mixerSpy.mockRestore();
  }
});

test("the name contains a cold GLB suspension inside its existing Canvas", async () => {
  const { container, rerender } = render(
    <Suspense fallback={<p>Outside scene suspension</p>}><Logo /></Suspense>
  );
  expect(screen.queryByText("Outside scene suspension")).not.toBeInTheDocument();
  const canvas = await screen.findByLabelText("Scene canvas");
  const region = container.querySelector(".logo-canvas");
  expect(region).toHaveAttribute("aria-busy", "true");
  await finishAsset();
  expect(region).toHaveAttribute("aria-busy", "false");
  expect(screen.getByLabelText("Scene canvas")).toBe(canvas);
  rerender(<Suspense fallback={<p>Outside scene suspension</p>}><Logo /></Suspense>);
  expect(region).toHaveAttribute("aria-busy", "false");
  expect(screen.getByLabelText("Scene canvas")).toBe(canvas);
});

test("Home biography, navigation and footer exist while the real name is pending", async () => {
  const { container } = renderPortfolio();
  const biography = screen.getByText(/Hello! I’m Ibrahim/);
  const navigation = screen.getByRole("navigation", { name: "Portfolio navigation" });
  const shell = container.querySelector(".menu-div-main");
  expect(shell).toHaveClass("home-entry");
  expect(screen.getByRole("region", { name: "Home view" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
  expect(screen.getByText(`© ${new Date().getFullYear()} Ibrahim Karim.`)).toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(screen.queryByText("Outside scene suspension")).not.toBeInTheDocument();
  const canvas = await screen.findByLabelText("Scene canvas");
  const classChanges = [];
  const observer = new MutationObserver((records) => classChanges.push(...records));
  observer.observe(shell, { attributes: true, attributeFilter: ["class"] });
  try {
    await finishAsset();
    expect(classChanges).toHaveLength(0);
    expect(shell).toHaveClass("home-entry");
  } finally {
    observer.disconnect();
  }
  expect(container.querySelector(".logo-canvas")).toHaveAttribute("aria-busy", "false");
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBe(biography);
  expect(screen.getByRole("navigation", { name: "Portfolio navigation" })).toBe(navigation);
  expect(screen.getByLabelText("Scene canvas")).toBe(canvas);
});

test("direct Profile exposes its shell before GLB readiness and resets without remounting", async () => {
  const user = userEvent.setup();
  const { container } = renderPortfolio("/threeDeeResume");
  const entry = screen.getByLabelText("Route entry").textContent;
  const navigation = screen.getByRole("navigation", { name: "Portfolio navigation" });
  expect(screen.getByRole("button", { name: "Home" })).toBeEnabled();
  expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
  expect(screen.getByText(`© ${new Date().getFullYear()} Ibrahim Karim.`)).toBeInTheDocument();
  expect(screen.queryByText("Outside scene suspension")).not.toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  const canvas = await screen.findByLabelText("Scene canvas");
  const sceneRegion = container.querySelector(".blender-environment");
  expect(sceneRegion).toHaveAttribute("aria-busy", "true");
  expect(screen.getByRole("button", { name: "Reset View" })).toBeDisabled();
  await finishAsset();
  expect(sceneRegion).toHaveAttribute("aria-busy", "false");
  expect(screen.getByRole("button", { name: "Reset View" })).toBeEnabled();
  const framedPosition = mockSceneState.camera.position.clone();
  expect(framedPosition.equals(new Vector3())).toBe(false);
  mockSceneState.camera.position.set(1, 2, 3);
  await user.click(screen.getByRole("button", { name: "Reset View" }));
  expect(mockSceneState.camera.position.equals(framedPosition)).toBe(true);
  expect(screen.getByLabelText("Route entry")).toHaveTextContent(entry);
  expect(screen.getByLabelText("Scene canvas")).toBe(canvas);
  expect(sceneRegion).toHaveAttribute("aria-busy", "false");
  await user.click(screen.getByRole("button", { name: "Home" }));
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBeInTheDocument();
  expect(canvas).not.toBeInTheDocument();
  await screen.findByLabelText("Scene canvas");
  expect(container.querySelectorAll("canvas")).toHaveLength(1);
  expect(screen.getByRole("navigation", { name: "Portfolio navigation" })).toBe(navigation);
  await user.click(screen.getByRole("button", { name: "3D Profile" }));
  await screen.findByLabelText("Scene canvas");
  expect(container.querySelectorAll("canvas")).toHaveLength(1);
  expect(container.querySelector(".blender-environment")).toHaveAttribute("aria-busy", "true");
  act(() => Array.from(mockSceneFrames).forEach(frame => frame(mockSceneState, 1 / 60)));
  expect(container.querySelector(".blender-environment")).toHaveAttribute("aria-busy", "false");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test("leaving Profile during cold loading stays usable and late completion cannot restore it", async () => {
  const user = userEvent.setup();
  const { container } = renderPortfolio("/threeDeeResume");
  await user.click(screen.getByRole("button", { name: "Home" }));
  expect(screen.getByLabelText("Route entry")).toHaveTextContent(/^\/:/);
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBeInTheDocument();
  expect(screen.queryByText("Outside scene suspension")).not.toBeInTheDocument();
  await finishAsset();
  expect(screen.getByLabelText("Route entry")).toHaveTextContent(/^\/:/);
  expect(container.querySelector(".blender-environment")).not.toBeInTheDocument();
  expect(container.querySelectorAll("canvas")).toHaveLength(1);
  expect(container.querySelector(".logo-canvas")).toHaveAttribute("aria-busy", "false");
});


test('camera framing alone does not announce Profile ready before its first populated frame', async () => {
  const { container, unmount } = renderPortfolio('/threeDeeResume');
  await screen.findByLabelText('Scene canvas');
  await finishAsset({ renderFrame: false });
  expect(container.querySelector('.blender-environment')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('button', { name: 'Reset View' })).toBeDisabled();
  act(() => Array.from(mockSceneFrames).forEach(frame => frame(mockSceneState, 1 / 60)));
  expect(container.querySelector('.blender-environment')).toHaveAttribute('aria-busy', 'false');
  expect(screen.getByRole('button', { name: 'Reset View' })).toBeEnabled();
  unmount();
  expect(mockSceneFrames.size).toBe(0);
});
