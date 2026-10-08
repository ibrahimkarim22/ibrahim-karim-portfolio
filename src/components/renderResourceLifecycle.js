import { useEffect, useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";

// GLTF cache entries retain CPU geometry and image data. Renderer-specific GPU
// disposal listeners must be released when their final live consumer exits.
const resourceOwners = new WeakMap();
const rendererOwners = new WeakMap();

function sceneResources(scene) {
  const resources = new Set();
  const texture = (value) => {
    if (value?.isTexture) resources.add(value);
    else if (Array.isArray(value)) value.forEach(texture);
  };
  scene?.traverse?.((object) => {
    if (object.geometry?.isBufferGeometry) resources.add(object.geometry);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (!material?.isMaterial) return;
      resources.add(material);
      Object.values(material).forEach(texture);
      Object.values(material.uniforms || {}).forEach((uniform) => texture(uniform?.value));
    });
  });
  return resources;
}

export function retainSceneResources(scene) {
  const resources = sceneResources(scene);
  resources.forEach((resource) => resourceOwners.set(resource, (resourceOwners.get(resource) || 0) + 1));
  let released = false;
  return () => {
    if (released) return;
    released = true;
    resources.forEach((resource) => {
      const remaining = (resourceOwners.get(resource) || 1) - 1;
      if (remaining) resourceOwners.set(resource, remaining);
      else {
        resourceOwners.delete(resource);
        // Three's dispose event releases backend allocations/listeners. It does
        // not delete CPU attributes, material settings or cached image data.
        resource.dispose();
      }
    });
    resources.clear();
  };
}

export function useCachedSceneResources(scene) {
  // Only committed consumers acquire ownership; abandoned renders cannot leak.
  useLayoutEffect(() => retainSceneResources(scene), [scene]);
}

export function retainRenderer(renderer) {
  if (typeof renderer?.dispose !== "function") return () => {};
  let entry = rendererOwners.get(renderer);
  if (!entry) {
    entry = { count: 0, generation: 0 };
    rendererOwners.set(renderer, entry);
  }
  entry.count += 1;
  entry.generation += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    entry.count -= 1;
    const generation = ++entry.generation;
    if (entry.count) return;
    // StrictMode can clean up and reacquire the SAME renderer synchronously.
    // This renderer-local microtask also lets child asset cleanup finish first.
    Promise.resolve().then(() => {
      if (entry.count === 0 && entry.generation === generation) {
        rendererOwners.delete(renderer);
        renderer.dispose();
      }
    });
  };
}

// Mount outside model Suspense so failed or interrupted loading also releases
// the Canvas renderer. Existing R3F teardown still stops frames/loses context.
export function RendererCleanup() {
  const renderer = useThree((state) => state.gl);
  useEffect(() => retainRenderer(renderer), [renderer]);
  return null;
}
