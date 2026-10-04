import { Suspense } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { BoxGeometry, Group, Mesh, PerspectiveCamera, Vector3 } from "three";
import { PortfolioRoutes } from "../App";
import Logo from "./Logo";

let mockAsset;
let mockSceneState;

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
    useFrame: () => {},
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
      && args[0] === "primitive") return;
    reportError(message, ...args);
  });
  originalMatchMedia = window.matchMedia;
  window.matchMedia = () => ({
    matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn(),
  });
  const scene = new Group();
  ["ibrahimBuilding", "nucampBuilding", "wayneStateBuilding", "skillsBuilding"].forEach((name, index) => {
    const tower = new Mesh(new BoxGeometry(10, 30, 10));
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
  mockSceneState = { scene: new Group(), camera: new PerspectiveCamera(60), size: { width: 600, height: 300 } };
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

async function finishAsset() {
  await act(async () => {
    mockAsset.resolve();
    await mockAsset.promise;
  });
}

test("the name contains a cold GLB suspension inside its existing Canvas", async () => {
  const { container, rerender } = render(
    <Suspense fallback={<p>Outside scene suspension</p>}><Logo /></Suspense>
  );
  expect(screen.queryByText("Outside scene suspension")).not.toBeInTheDocument();
  const canvas = screen.getByLabelText("Scene canvas");
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
  expect(screen.getByRole("link", { name: "Github" })).toBeInTheDocument();
  expect(screen.getByText(`© ${new Date().getFullYear()} Ibrahim Karim.`)).toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(screen.queryByText("Outside scene suspension")).not.toBeInTheDocument();
  const canvas = screen.getByLabelText("Scene canvas");
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
  expect(screen.getByRole("button", { name: "Back to Home" })).toBeEnabled();
  expect(screen.getByRole("link", { name: "Github" })).toBeInTheDocument();
  expect(screen.getByText(`© ${new Date().getFullYear()} Ibrahim Karim.`)).toBeInTheDocument();
  expect(screen.queryByText("Outside scene suspension")).not.toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  const canvas = screen.getByLabelText("Scene canvas");
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
  await user.click(screen.getByRole("button", { name: "Back to Home" }));
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBeInTheDocument();
  expect(canvas).not.toBeInTheDocument();
  expect(container.querySelectorAll("canvas")).toHaveLength(1);
  expect(screen.getByRole("navigation", { name: "Portfolio navigation" })).toBe(navigation);
  await user.click(screen.getByRole("button", { name: "3D Profile" }));
  expect(container.querySelectorAll("canvas")).toHaveLength(1);
  expect(container.querySelector(".blender-environment")).toHaveAttribute("aria-busy", "false");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test("leaving Profile during cold loading stays usable and late completion cannot restore it", async () => {
  const user = userEvent.setup();
  const { container } = renderPortfolio("/threeDeeResume");
  await user.click(screen.getByRole("button", { name: "Back to Home" }));
  expect(screen.getByLabelText("Route entry")).toHaveTextContent(/^\/:/);
  expect(screen.getByText(/Hello! I’m Ibrahim/)).toBeInTheDocument();
  expect(screen.queryByText("Outside scene suspension")).not.toBeInTheDocument();
  await finishAsset();
  expect(screen.getByLabelText("Route entry")).toHaveTextContent(/^\/:/);
  expect(container.querySelector(".blender-environment")).not.toBeInTheDocument();
  expect(container.querySelectorAll("canvas")).toHaveLength(1);
  expect(container.querySelector(".logo-canvas")).toHaveAttribute("aria-busy", "false");
});
