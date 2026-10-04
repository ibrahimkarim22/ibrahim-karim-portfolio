import { Box3, BoxGeometry, Group, Mesh, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three-stdlib/controls/OrbitControls.cjs";
import { applyProfileFrame, fitSkyline, getSkylineBounds } from "./profileCamera";

const skyline = new Box3(new Vector3(-130, -246, -108), new Vector3(43, 162, 100));

function corners(bounds) {
  return [bounds.min.x, bounds.max.x].flatMap((x) =>
    [bounds.min.y, bounds.max.y].flatMap((y) =>
      [bounds.min.z, bounds.max.z].map((z) => new Vector3(x, y, z))));
}

test("skyline bounds include the four towers and their artwork but exclude the distant star shell", () => {
  const scene = new Group();
  ["ibrahimBuilding", "nucampBuilding", "wayneStateBuilding", "skillsBuilding"].forEach((name, i) => {
    const tower = new Group();
    tower.name = name;
    tower.position.set(i * 20, 0, 0);
    const mesh = new Mesh(new BoxGeometry(10, 40, 10));
    mesh.position.y = 20;
    tower.add(mesh);
    scene.add(tower);
  });
  const sign = new Mesh(new BoxGeometry(4, 4, 4));
  sign.position.set(0, 42, 8);
  scene.children[0].add(sign);
  scene.add(new Mesh(new BoxGeometry(4000, 4000, 4000)));
  const bounds = getSkylineBounds(scene);
  expect(bounds.min.toArray()).toEqual([-5, 0, -5]);
  expect(bounds.max.toArray()).toEqual([65, 44, 10]);
  expect(scene.children[0].position.toArray()).toEqual([0, 0, 0]);
});

test.each([0.3, 0.55, 0.8, 1, 2, 4.3])("the entire skyline fits with breathing room at Canvas aspect %s", (aspect) => {
  const frame = fitSkyline(skyline, aspect);
  const camera = new PerspectiveCamera(frame.fov, aspect, 1, 20000);
  camera.position.copy(frame.position);
  camera.lookAt(frame.target);
  camera.updateMatrixWorld();
  corners(skyline).forEach((point) => {
    const projected = point.project(camera);
    expect(Math.abs(projected.x)).toBeLessThanOrEqual(0.93);
    expect(Math.abs(projected.y)).toBeLessThanOrEqual(0.93);
    expect(projected.z).toBeGreaterThan(-1);
    expect(projected.z).toBeLessThan(1);
  });
});

test("narrow framing retreats when width, rather than height, limits the composition", () => {
  const wide = fitSkyline(skyline, 2);
  const narrow = fitSkyline(skyline, 0.3);
  expect(narrow.position.distanceTo(narrow.target)).toBeGreaterThan(wide.position.distanceTo(wide.target));
});

test("Reset restores camera, target and zoom without residual OrbitControls drift", () => {
  const camera = new PerspectiveCamera(80, 1, 1, 20000);
  camera.position.set(100, 0, 0);
  const controls = new OrbitControls(camera);
  controls.enableDamping = true;
  controls.maxDistance = 180;
  controls.setAzimuthalAngle(Math.PI / 4);
  controls.setPolarAngle(1.1);
  controls.target.set(10, 20, 30);
  camera.zoom = 2;
  const frame = {
    position: new Vector3(300, 90, 360), target: new Vector3(-30, -20, -10),
    fov: 60, aspect: 0.75, zoom: 1, maxDistance: 1500,
  };
  applyProfileFrame(camera, controls, frame);
  for (let i = 0; i < 20; i += 1) controls.update();
  expect(camera.position.x).toBeCloseTo(300, 8);
  expect(camera.position.y).toBeCloseTo(90, 8);
  expect(camera.position.z).toBeCloseTo(360, 8);
  expect(controls.target.toArray()).toEqual([-30, -20, -10]);
  expect(camera.zoom).toBe(1);
  expect(camera.aspect).toBe(0.75);
  expect(controls.object).toBe(camera);
  expect(controls.enableDamping).toBe(true);
  controls.dispose();
});
