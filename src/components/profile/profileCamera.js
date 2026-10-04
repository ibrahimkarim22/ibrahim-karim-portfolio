import { Box3, MathUtils, Vector3 } from "three";

const SKYLINE_NAMES = ["ibrahimBuilding", "nucampBuilding", "wayneStateBuilding", "skillsBuilding"];
const VIEW_DIRECTION = new Vector3(1, 0.24, 1).normalize();

// The GLB also contains a 4,000-unit star shell. Fit the actual city, not that
// background, and include each tower's child artwork without moving any objects.
export function getSkylineBounds(scene) {
  const bounds = new Box3();
  SKYLINE_NAMES.forEach((name) => {
    const tower = scene.getObjectByName(name);
    if (tower) bounds.union(new Box3().setFromObject(tower));
  });
  return bounds;
}

export function fitSkyline(bounds, aspect, fov = 60) {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const target = bounds.getCenter(new Vector3());
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), VIEW_DIRECTION).normalize();
  const up = new Vector3().crossVectors(VIEW_DIRECTION, right).normalize();
  const verticalSlope = Math.tan(MathUtils.degToRad(fov / 2)) * 0.88;
  const horizontalSlope = verticalSlope * safeAspect;
  let distance = 1;

  // Fit all eight corners in camera space, accounting for depth as well as the
  // limiting horizontal/vertical field of view. Keep 12% edge breathing room.
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const offset = new Vector3(x, y, z).sub(target);
        const depth = offset.dot(VIEW_DIRECTION);
        distance = Math.max(distance,
          depth + Math.abs(offset.dot(right)) / horizontalSlope,
          depth + Math.abs(offset.dot(up)) / verticalSlope,
          depth + 1);
      }
    }
  }

  return {
    target, position: target.clone().addScaledVector(VIEW_DIRECTION, distance),
    fov, aspect: safeAspect, zoom: 1, maxDistance: Math.max(180, distance * 3),
  };
}

export function applyProfileFrame(camera, controls, frame) {
  const damping = controls.enableDamping;
  controls.enableDamping = false;
  try {
    // Drain pending orbit/pan inertia before setting the intended frame. A plain
    // controls.reset() retains that inertia and can move the camera afterward.
    controls.update();
    camera.position.copy(frame.position);
    controls.target.copy(frame.target);
    camera.fov = frame.fov;
    camera.aspect = frame.aspect;
    camera.zoom = frame.zoom;
    controls.maxDistance = frame.maxDistance;
    camera.updateProjectionMatrix();
    controls.update();
    controls.saveState();
    camera.updateMatrixWorld();
  } finally {
    controls.enableDamping = damping;
  }
}
