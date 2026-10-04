import { createRef } from "react";
import { render } from "@testing-library/react";
import { Box3, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three-stdlib/controls/OrbitControls.cjs";
import ProfileCameraRig from "./ProfileCameraRig";

let mockState;
jest.mock("@react-three/fiber", () => ({ useThree: (selector) => selector(mockState) }));

let camera;
let controls;
let controlsRef;
let interactionRef;
let resetRef;
const bounds = new Box3(new Vector3(-130, -246, -108), new Vector3(43, 162, 100));

beforeEach(() => {
  camera = new PerspectiveCamera(60, 2, 1, 20000);
  camera.position.set(100, 0, 0);
  controls = new OrbitControls(camera);
  controlsRef = { current: controls };
  interactionRef = { current: false };
  resetRef = createRef();
  mockState = { camera, size: { width: 600, height: 300 } };
});
afterEach(() => controls.dispose());

function rigProps() {
  return { bounds, controlsRef, interactionRef, ref: resetRef };
}

test("an untouched initial view adapts its framing to the Canvas aspect", () => {
  const { rerender } = render(<ProfileCameraRig {...rigProps()} />);
  const originalDistance = controls.getDistance();
  mockState.size = { width: 150, height: 500 };
  rerender(<ProfileCameraRig {...rigProps()} />);
  expect(camera.aspect).toBe(0.3);
  expect(controls.getDistance()).toBeGreaterThan(originalDistance);
  expect(controls.target.toArray()).toEqual([-43.5, -42, -4]);
});

test("resize preserves an intentionally moved camera and target while correcting projection", () => {
  const { rerender } = render(<ProfileCameraRig {...rigProps()} />);
  interactionRef.current = true;
  camera.position.set(400, 50, 300);
  controls.target.set(10, 20, 30);
  camera.zoom = 1.5;
  controls.update();
  const moved = camera.position.clone();
  const projection = camera.projectionMatrix.clone();
  mockState.size = { width: 150, height: 500 };
  rerender(<ProfileCameraRig {...rigProps()} />);
  expect(camera.position.distanceTo(moved)).toBeLessThan(1e-8);
  expect(controls.target.toArray()).toEqual([10, 20, 30]);
  expect(camera.zoom).toBe(1.5);
  expect(camera.aspect).toBe(0.3);
  expect(camera.projectionMatrix.equals(projection)).toBe(false);
});

test("explicit reset uses the latest aspect and enables untouched framing again", () => {
  const { rerender } = render(<ProfileCameraRig {...rigProps()} />);
  interactionRef.current = true;
  camera.position.set(400, 50, 300);
  controls.target.set(10, 20, 30);
  mockState.size = { width: 150, height: 500 };
  rerender(<ProfileCameraRig {...rigProps()} />);
  resetRef.current.resetView();
  expect(controls.target.toArray()).toEqual([-43.5, -42, -4]);
  expect(camera.aspect).toBe(0.3);
  expect(camera.zoom).toBe(1);
  expect(interactionRef.current).toBe(false);
  const portraitDistance = controls.getDistance();
  mockState.size = { width: 700, height: 250 };
  rerender(<ProfileCameraRig {...rigProps()} />);
  expect(controls.getDistance()).toBeLessThan(portraitDistance);
});

test("the camera API is cleared when its Canvas lifecycle ends", () => {
  const { unmount } = render(<ProfileCameraRig {...rigProps()} />);
  expect(resetRef.current.resetView).toBeInstanceOf(Function);
  unmount();
  expect(resetRef.current).toBeNull();
});
