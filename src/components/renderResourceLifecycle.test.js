import { act, render } from "@testing-library/react";
import { StrictMode, Suspense } from "react";
import * as THREE from "three";
import { RendererCleanup, retainRenderer, retainSceneResources } from "./renderResourceLifecycle";
const mockRenderer = { dispose: jest.fn() };
jest.mock("@react-three/fiber", () => ({ useThree: (select) => select({ gl: mockRenderer }) }));

function source(geometry, material) { const scene = new THREE.Group(); scene.add(new THREE.Mesh(geometry, material)); return scene; }
beforeEach(() => mockRenderer.dispose.mockClear());

test("cached resources release GPU listeners only after the last shared scene exits, preserving CPU data", () => {
  const geometry = new THREE.BoxGeometry(1, 2, 3), texture = new THREE.Texture({ width: 4, height: 4 });
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const geometryDisposed = jest.spyOn(geometry, "dispose"), materialDisposed = jest.spyOn(material, "dispose"), textureDisposed = jest.spyOn(texture, "dispose");
  const positions = geometry.attributes.position.array, image = texture.image;
  const releaseFirst = retainSceneResources(source(geometry, material));
  const releaseSecond = retainSceneResources(source(geometry, material));
  releaseFirst(); releaseFirst();
  expect(geometryDisposed).not.toHaveBeenCalled();
  expect(materialDisposed).not.toHaveBeenCalled();
  expect(textureDisposed).not.toHaveBeenCalled();
  releaseSecond();
  expect(geometryDisposed).toHaveBeenCalledTimes(1);
  expect(materialDisposed).toHaveBeenCalledTimes(1);
  expect(textureDisposed).toHaveBeenCalledTimes(1);
  expect(geometry.attributes.position.array).toBe(positions);
  expect(texture.image).toBe(image);
  expect(positions.length).toBeGreaterThan(0);
  const releaseReused = retainSceneResources(source(geometry, material)); releaseReused();
  expect(geometryDisposed).toHaveBeenCalledTimes(2);
  expect(texture.image).toBe(image);
});

test("material arrays and shader-uniform textures are deduplicated without destroying the scene", () => {
  const texture = new THREE.Texture({ width: 8, height: 8 });
  const material = new THREE.ShaderMaterial({ uniforms: { image: { value: texture }, layers: { value: [texture, texture] } } });
  const geometry = new THREE.BoxGeometry();
  const scene = source(geometry, [material, material]);scene.add(new THREE.Mesh(geometry, material));
  const disposeTexture = jest.spyOn(texture, "dispose");
  const children = [...scene.children];
  const release = retainSceneResources(scene);release();
  expect(disposeTexture).toHaveBeenCalledTimes(1);
  expect(scene.children).toEqual(children);
  expect(scene.children[0].geometry).toBe(geometry);
});

test("last asset release invokes backend listeners so a renderer closure no longer stays in the cache", () => {
  const geometry = new THREE.BoxGeometry(); const material = new THREE.MeshBasicMaterial();
  const staleRendererCallback = jest.fn(() => geometry.removeEventListener("dispose", staleRendererCallback));
  geometry.addEventListener("dispose", staleRendererCallback);
  const release = retainSceneResources(source(geometry, material));release();
  expect(staleRendererCallback).toHaveBeenCalledTimes(1);
  expect(geometry.hasEventListener("dispose", staleRendererCallback)).toBe(false);
});

test("renderer disposal waits for final ownership and is canceled by StrictMode-style reacquisition", async () => {
  const renderer = { dispose: jest.fn() };const release = retainRenderer(renderer);release();
  const finalRelease = retainRenderer(renderer);
  await Promise.resolve();expect(renderer.dispose).not.toHaveBeenCalled();
  finalRelease();finalRelease();await Promise.resolve();
  expect(renderer.dispose).toHaveBeenCalledTimes(1);
});

test("StrictMode replay keeps the live renderer and unmount disposes it once", async () => {
  const view = render(<StrictMode><RendererCleanup /></StrictMode>);
  await act(async () => { await Promise.resolve(); });
  expect(mockRenderer.dispose).not.toHaveBeenCalled();
  await act(async () => { view.unmount(); await Promise.resolve(); });
  expect(mockRenderer.dispose).toHaveBeenCalledTimes(1);
});

test("the renderer releases even if its model never finishes suspending", async () => {
  const pending = new Promise(() => {});const WaitingModel = () => { throw pending; };
  const view = render(<><RendererCleanup /><Suspense fallback={null}><WaitingModel /></Suspense></>);
  await act(async () => { view.unmount(); await Promise.resolve(); });
  expect(mockRenderer.dispose).toHaveBeenCalledTimes(1);
});
