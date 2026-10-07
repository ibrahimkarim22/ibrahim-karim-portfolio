import * as THREE from "three";
import {
  advanceLogoSuspension,
  configureLogoSuspension,
  createLogoSuspension,
  disposeLogoSuspension,
  LOGO_SUSPENSION,
  updateLogoCables,
} from "./logoSuspension";

// Preserve the loaded GLB's differing main-name and pronunciation depths.
const PIECES = [
  ["ibrahim", "outer", "inner", 0.25, 0.7, 0.12, -1.05],
  ["karim", "outer.001", "inner.001", 0.025, 0.55, 0.12, -1.05],
  ["ibrahimPronunciation", "outer.002", "inner.002", 0.385, 0.25, 0.035, -0.82],
  ["karimPronunciation", "outer.003", "inner.003", -0.11, 0.24, 0.035, -0.82],
];

const nameOf = (object) => object.userData?.name ?? object.name;

function specimen() {
  const scene = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: "#6a1e2d", metalness: 0.85, roughness: 0.19 });
  material.name = "Material.001";
  PIECES.forEach(([, outer, inner, y, width, height, z]) => {
    [outer, inner].forEach((name, index) => {
      const node = new THREE.Group();
      node.name = THREE.PropertyBinding.sanitizeNodeName(name);
      node.userData.name = name;
      node.position.set(0, y, z + (index ? 0.004 : 0));
      node.rotation.x = Math.PI / 2;
      node.add(new THREE.Mesh(
        new THREE.BoxGeometry(width * (index ? 0.94 : 1), 0.025, height), material
      ));
      scene.add(node);
    });
  });
  scene.updateMatrixWorld(true);
  return scene;
}

function configuredRig(width = 1440, height = 740) {
  const source = specimen();
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
  camera.position.set(...(width <= 700 ? [0.5, 0.5, 4] : [0.45, 0.4, 2]));
  camera.updateMatrixWorld(true);
  const rig = createLogoSuspension(source);
  configureLogoSuspension(rig, { camera, position: [0.5, 0, 0], width });
  return { rig, source, camera };
}

function step(rig, seconds, observer = () => {}) {
  const frames = Math.ceil(seconds / 0.04);
  for (let frame = 0; frame < frames; frame += 1) {
    advanceLogoSuspension(rig, seconds / frames);
    observer(rig);
  }
}

function worldAttachment(piece, support) {
  return piece.group.localToWorld(support.attachment.clone());
}

function pieceArtworkBounds(piece) {
  const result = new THREE.Box3();
  piece.group.updateWorldMatrix(true, true);
  piece.group.traverse((object) => {
    if (!object.isMesh) return;
    const positions = object.geometry.attributes.position;
    for (let index = 0; index < positions.count; index += 1) {
      result.expandByPoint(new THREE.Vector3().fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld));
    }
  });
  return result;
}

function cableVertices(rig) {
  const supports = rig.pieces.flatMap((piece) => piece.supports);
  const positions = rig.lines.geometry.attributes.position;
  const count = positions.count / supports.length;
  return supports.map((support, cable) => ({
    support,
    points: Array.from({ length: count }, (_, index) => rig.lines.localToWorld(
      new THREE.Vector3().fromBufferAttribute(positions, cable * count + index)
    )),
  }));
}

function assertStraightEndpoints(rig) {
  expect(rig.lines.isLineSegments).toBe(true);
  expect(rig.lines.geometry.attributes.position.count).toBe(16);
  cableVertices(rig).forEach(({ support, points }) => {
    expect(points).toHaveLength(2);
    const piece = rig.pieces.find((candidate) => candidate.supports.includes(support));
    expect(points[0].distanceTo(support.anchor)).toBeLessThan(1e-6);
    expect(points[1].distanceTo(worldAttachment(piece, support))).toBeLessThan(1e-6);
  });
}

test("all eight cables remain direct two-point segments throughout entrance, idle, slip, catch and recovery", () => {
  const { rig } = configuredRig();
  expect(rig.pieces.map((piece) => piece.supports.length)).toEqual([2, 2, 2, 2]);
  expect(rig.pieces.map((piece) => piece.motionSupports.length)).toEqual([2, 2, 1, 1]);
  expect(rig.pieces.map((piece) => piece.isMainName)).toEqual([true, true, false, false]);
  expect(rig.pieces.map((piece) => piece.supports.map((support) => support.side)))
    .toEqual(Array.from({ length: 4 }, () => ["left", "right"]));
  expect(rig.pieces.map((piece) => piece.supports.map((support) => support.label)))
    .toEqual([["left", "m"], ["left", "m"], ["ee", "heem"], ["kuh", "m"]]);
  const phases = new Set();
  let samples = 0;
  const anchors = rig.pieces.flatMap((piece) => piece.supports.map((support) => support.anchor.clone()));
  step(rig, 11, () => {
    if (rig.activeSlip) phases.add(rig.activeSlip.phase);
    if (samples++ % 7 !== 0) return;
    assertStraightEndpoints(rig);
    cableVertices(rig).forEach(({ support, points }, index) => {
      const piece = rig.pieces.find((candidate) => candidate.supports.includes(support));
      expect(points[0].distanceTo(anchors[index])).toBeLessThan(1e-6);
      expect(points[1].z).toBeLessThan(pieceArtworkBounds(piece).min.z);
    });
  });
  expect(phases).toEqual(new Set(["release", "catch", "hold", "recovery"]));
  // Paint the translucent cable before the lettering, so letter surfaces
  // naturally cover it without putting the line in the late transparent queue.
  expect(rig.lines.material.transparent).toBe(false);
  expect(rig.lines.material.blending).toBe(THREE.CustomBlending);
  expect(rig.lines.material.blendSrc).toBe(THREE.SrcAlphaFactor);
  expect(rig.lines.material.blendDst).toBe(THREE.OneMinusSrcAlphaFactor);
  expect(rig.lines.material.opacity).toBe(0.7);
  expect(rig.lines.material.depthTest).toBe(true);
  expect(rig.lines.material.depthWrite).toBe(false);
  expect(rig.lines.renderOrder).toBeLessThan(0);
  disposeLogoSuspension(rig);
});

test("Ibrahim pronunciation has one cable at its filled EE upper stroke and another at HEEM", () => {
  const source = specimen();
  const inner = source.children.find((node) => nameOf(node) === "inner.002");
  const material = new THREE.MeshStandardMaterial({ color: "#ff3131" });
  material.name = "Material.004";
  [
    ["PronunciationEE", -0.095, 0.035],
    ["PronunciationEEM", 0.075, 0.06],
  ].forEach(([name, x, width]) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.01, 0.016), material);
    mesh.name = name;
    mesh.position.set(x, 0, -0.012);
    inner.add(mesh);
  });
  source.updateMatrixWorld(true);
  const rig = createLogoSuspension(source);
  rig.root.updateMatrixWorld(true);
  expect(rig.pieces.map((piece) => piece.supports.length)).toEqual([2, 2, 2, 2]);
  const pronunciation = rig.pieces.find(({ id }) => id === "ibrahimPronunciation");
  const attachment = pronunciation.supports[0].attachment;
  const ee = rig.scene.getObjectByName("PronunciationEE");
  const eeBounds = new THREE.Box3();
  const toPiece = pronunciation.group.matrixWorld.clone().invert().multiply(ee.matrixWorld);
  const positions = ee.geometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    eeBounds.expandByPoint(new THREE.Vector3().fromBufferAttribute(positions, index).applyMatrix4(toPiece));
  }
  expect(attachment.x).toBeGreaterThanOrEqual(eeBounds.min.x);
  expect(attachment.x).toBeLessThanOrEqual(eeBounds.max.x);
  expect(attachment.x).toBeLessThan(-0.05);
  expect(attachment.y).toBeGreaterThan(eeBounds.getCenter(new THREE.Vector3()).y);
  expect(attachment.y).toBeLessThanOrEqual(eeBounds.max.y);
  expect(attachment.z).toBeLessThan(pronunciation.bounds.min.z);
  const heemAttachment = pronunciation.supports[1].attachment;
  const heem = rig.scene.getObjectByName("PronunciationEEM");
  const heemBounds = new THREE.Box3();
  const heemToPiece = pronunciation.group.matrixWorld.clone().invert().multiply(heem.matrixWorld);
  const heemPositions = heem.geometry.attributes.position;
  for (let index = 0; index < heemPositions.count; index += 1) {
    heemBounds.expandByPoint(new THREE.Vector3().fromBufferAttribute(heemPositions, index).applyMatrix4(heemToPiece));
  }
  expect(heemAttachment.x).toBeGreaterThanOrEqual(heemBounds.min.x);
  expect(heemAttachment.x).toBeLessThanOrEqual(heemBounds.max.x);
  expect(heemAttachment.x).toBeLessThan(heemBounds.getCenter(new THREE.Vector3()).x);
  expect(heemAttachment.y).toBeGreaterThan(heemBounds.getCenter(new THREE.Vector3()).y);
  expect(pronunciation.supports.map((support) => support.label)).toEqual(["ee", "heem"]);
  disposeLogoSuspension(rig);
});

test.each(["ibrahim", "karim"])("the %s right cable lands on terminal M rather than the neighboring raised i-dot", (pieceId) => {
  const source = specimen();
  const definition = PIECES.find(([id]) => id === pieceId);
  const inner = source.children.find((node) => nameOf(node) === definition[2]);
  const material = new THREE.MeshStandardMaterial({ color: "#ff3131" });
  material.name = "Material.007";
  [
    ["InitialI", -0.22, 0.022, -0.095, 0.018],
    ["TerminalIDot", 0.145, 0.025, -0.12, 0.018],
    ["TerminalM", 0.225, 0.12, -0.035, 0.04],
  ].forEach(([name, x, width, z, height]) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.01, height), material);
    mesh.name = name;
    mesh.position.set(x, 0, z);
    inner.add(mesh);
  });
  // The rig attaches to the letter's outer rim, which sits slightly above its
  // luminous inset. Model that genuine M surface instead of treating the cap
  // face itself as the only valid upper attachment.
  const outerMaterial = new THREE.MeshStandardMaterial({ color: "#6a1e2d" });
  outerMaterial.name = "Material.001";
  const mOuter = new THREE.Mesh(new THREE.BoxGeometry(0.124, 0.012, 0.056), outerMaterial);
  mOuter.name = "TerminalMOuter";
  mOuter.position.set(0.225, 0, -0.035);
  inner.add(mOuter);
  source.updateMatrixWorld(true);
  const rig = createLogoSuspension(source);
  rig.root.updateMatrixWorld(true);
  const piece = rig.pieces.find(({ id }) => id === pieceId);
  const right = piece.supports.find((support) => support.side === "right");
  const boundsInPiece = (mesh) => {
    const bounds = new THREE.Box3();
    const matrix = piece.group.matrixWorld.clone().invert().multiply(mesh.matrixWorld);
    const position = mesh.geometry.attributes.position;
    for (let index = 0; index < position.count; index += 1) {
      bounds.expandByPoint(new THREE.Vector3().fromBufferAttribute(position, index).applyMatrix4(matrix));
    }
    return bounds;
  };
  const mBounds = boundsInPiece(rig.scene.getObjectByName("TerminalM"));
  const mOuterBounds = boundsInPiece(rig.scene.getObjectByName("TerminalMOuter"));
  const dotBounds = boundsInPiece(rig.scene.getObjectByName("TerminalIDot"));
  expect(right.label).toBe("m");
  expect(right.attachment.x).toBeGreaterThan(dotBounds.max.x);
  expect(right.attachment.x).toBeGreaterThanOrEqual(mBounds.min.x);
  expect(right.attachment.x).toBeLessThanOrEqual(mBounds.max.x);
  expect(right.attachment.y).toBeGreaterThan(mOuterBounds.getCenter(new THREE.Vector3()).y);
  expect(right.attachment.y).toBeLessThanOrEqual(mOuterBounds.max.y);
  expect(right.attachment.y).toBeLessThan(dotBounds.min.y);
  disposeLogoSuspension(rig);
});

test("a slipping side follows its attachment directly while the opposite straight support retains its fixed pivot", () => {
  const { rig } = configuredRig();
  let event;
  let supportingPoint;
  let heldLength;
  let initialReleasedPoint;
  let greatestReleasedTravel = 0;
  const cableAngles = { min: Infinity, max: -Infinity };
  let recoverySamples = 0;
  let sawRecovery = false;
  let greatestAngle = 0;
  step(rig, 11, () => {
    if (!event && rig.activeSlip) event = rig.activeSlip;
    if (rig.activeSlip !== event || !event) return;
    const piece = rig.pieces.find(({ id }) => id === event.pieceId);
    const { held, released } = event;
    assertStraightEndpoints(rig);
    greatestAngle = Math.max(greatestAngle, Math.abs(piece.group.rotation.z));
    if (!initialReleasedPoint) initialReleasedPoint = released.endpoint.clone();
    greatestReleasedTravel = Math.max(greatestReleasedTravel, released.endpoint.distanceTo(initialReleasedPoint));
    const cableAngle = Math.atan2(released.endpoint.x - released.anchor.x, released.anchor.y - released.endpoint.y);
    cableAngles.min = Math.min(cableAngles.min, cableAngle);
    cableAngles.max = Math.max(cableAngles.max, cableAngle);
    if (["release", "catch", "hold"].includes(event.phase)) {
      if (!supportingPoint) {
        supportingPoint = held.endpoint.clone();
        heldLength = held.length;
      }
      expect(held.endpoint.distanceTo(supportingPoint)).toBeLessThan(1e-7);
      expect(held.length).toBeCloseTo(heldLength, 7);
    }
    if (event.phase === "recovery") {
      sawRecovery = true;
      recoverySamples += 1;
    }
  });
  expect(event).toBeDefined();
  expect(greatestReleasedTravel).toBeGreaterThan(0.04);
  expect(cableAngles.max - cableAngles.min).toBeGreaterThan(0.001);
  expect(sawRecovery).toBe(true);
  expect(recoverySamples).toBeGreaterThan(20);
  expect(greatestAngle).toBeGreaterThan(THREE.MathUtils.degToRad(10));
  disposeLogoSuspension(rig);
});

test.each(["ibrahim", "karim"])("tilting %s changes only each cable's lower endpoint and keeps its ceiling fixed", (pieceId) => {
  const { rig } = configuredRig();
  rig.nextSlipTime = Infinity;
  step(rig, 8);
  const piece = rig.pieces.find(({ id }) => id === pieceId);
  const previous = piece.supports.map((support) => ({
    anchor: support.anchor.clone(), endpoint: support.endpoint.clone(),
  }));
  piece.group.rotation.z += 0.25;
  piece.group.position.add(new THREE.Vector3(0.03, -0.08, 0));
  updateLogoCables(rig);
  assertStraightEndpoints(rig);
  const horizontalSpans = [];
  piece.supports.forEach((support, index) => {
    expect(support.anchor.distanceTo(previous[index].anchor)).toBeLessThan(1e-9);
    expect(support.endpoint.distanceTo(previous[index].endpoint)).toBeGreaterThan(0.01);
    const cable = cableVertices(rig).find((candidate) => candidate.support === support);
    horizontalSpans.push(Math.abs(cable.points[1].x - cable.points[0].x));
  });
  expect(Math.max(...horizontalSpans)).toBeGreaterThan(0.002);
  disposeLogoSuspension(rig);
});

test("responsive resize recomputes above-viewport anchors and current attachment endpoints without introducing control vertices", () => {
  const { rig, camera } = configuredRig();
  step(rig, 5);
  camera.aspect = 390 / 520;
  camera.position.set(0.5, 0.5, 4);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  configureLogoSuspension(rig, { camera, position: [0.5, 0, 0], width: 390 });
  assertStraightEndpoints(rig);
  rig.pieces.forEach((piece) => piece.supports.forEach((support) => {
    expect(support.anchor.clone().project(camera).y).toBeGreaterThan(1);
  }));
  step(rig, 1, () => assertStraightEndpoints(rig));
  disposeLogoSuspension(rig);
});

test("reduced motion keeps each direct two-point cable fixed at its stable final attachment", () => {
  const { rig } = configuredRig();
  advanceLogoSuspension(rig, 0.04, { reducedMotion: true });
  assertStraightEndpoints(rig);
  const positions = Array.from(rig.lines.geometry.attributes.position.array);
  for (let frame = 0; frame < 20; frame += 1) {
    advanceLogoSuspension(rig, 0.04, { reducedMotion: true });
    assertStraightEndpoints(rig);
    expect(Array.from(rig.lines.geometry.attributes.position.array)).toEqual(positions);
  }
  disposeLogoSuspension(rig);
});

test("quiet hanging motion stays independently readable and changes the support angles without repeated slips", () => {
  const { rig } = configuredRig();
  rig.nextSlipTime = Infinity;
  step(rig, 8);
  const measurements = rig.pieces.map(() => ({ angleMin: Infinity, angleMax: -Infinity, cableMin: Infinity, cableMax: -Infinity }));
  let greatestNameDifference = 0;
  step(rig, 24, () => {
    expect(rig.activeSlip).toBeNull();
    greatestNameDifference = Math.max(greatestNameDifference,
      Math.abs(rig.pieces[0].group.rotation.z - rig.pieces[1].group.rotation.z));
    rig.pieces.forEach((piece, index) => {
      const observed = measurements[index];
      observed.angleMin = Math.min(observed.angleMin, piece.group.rotation.z);
      observed.angleMax = Math.max(observed.angleMax, piece.group.rotation.z);
      const cable = piece.supports[0];
      const angle = Math.atan2(cable.endpoint.x - cable.anchor.x, cable.anchor.y - cable.endpoint.y);
      observed.cableMin = Math.min(observed.cableMin, angle);
      observed.cableMax = Math.max(observed.cableMax, angle);
    });
  });
  measurements.slice(0, 2).forEach((observed) => {
    expect(observed.angleMax - observed.angleMin).toBeGreaterThan(THREE.MathUtils.degToRad(0.8));
    expect(observed.cableMax - observed.cableMin).toBeGreaterThan(0.0001);
  });
  measurements.slice(2).forEach((observed) => {
    expect(observed.angleMax - observed.angleMin).toBeGreaterThan(THREE.MathUtils.degToRad(0.08));
    expect(Math.max(Math.abs(observed.angleMin), Math.abs(observed.angleMax)))
      .toBeLessThan(THREE.MathUtils.degToRad(0.75));
  });
  expect(greatestNameDifference).toBeGreaterThan(THREE.MathUtils.degToRad(0.6));
  disposeLogoSuspension(rig);
});

test("pronunciation is slightly smaller and nearer its associated name without scaling the physics wrapper or editing source nodes", () => {
  const source = specimen();
  const original = source.children.map((node) => ({ node, parent: node.parent,
    position: node.position.clone(), quaternion: node.quaternion.clone(), scale: node.scale.clone() }));
  const rig = createLogoSuspension(source);
  rig.root.updateMatrixWorld(true);
  [2, 3].forEach((index) => {
    const piece = rig.pieces[index];
    const associated = rig.pieces[index - 2];
    const originalSize = new THREE.Box3().setFromObject(source.children[index * 2]).getSize(new THREE.Vector3());
    const measuredSize = pieceArtworkBounds(piece).getSize(new THREE.Vector3());
    expect(measuredSize.x).toBeCloseTo(originalSize.x * 0.92, 6);
    expect(piece.size.x).toBeCloseTo(measuredSize.x, 6);
    expect(piece.group.scale.equals(new THREE.Vector3(1, 1, 1))).toBe(true);
    const oldCenterY = PIECES[index][3];
    const oldNameY = PIECES[index - 2][3];
    expect(Math.abs(piece.nominalPosition.y - associated.nominalPosition.y))
      .toBeCloseTo(Math.abs(oldCenterY - oldNameY) * 0.96, 6);
    const support = piece.supports[0];
    expect(support.attachment.y).toBeLessThanOrEqual(piece.bounds.max.y + 1e-6);
    expect(support.attachment.z).toBeLessThan(piece.bounds.min.z);
    const authoredNodes = [];
    piece.group.traverse((node) => {
      if (PIECES[index].slice(1, 3).includes(nameOf(node))) authoredNodes.push(node);
    });
    expect(authoredNodes).toHaveLength(2);
    authoredNodes.forEach((node) => expect(node.rotation.x).toBeCloseTo(Math.PI / 2, 8));
  });
  original.forEach(({ node, parent, position, quaternion, scale }) => {
    expect(node.parent).toBe(parent);
    expect(node.position.equals(position)).toBe(true);
    expect(node.quaternion.equals(quaternion)).toBe(true);
    expect(node.scale.equals(scale)).toBe(true);
  });
  disposeLogoSuspension(rig);
});

test("a desktop-to-mobile resize caps an active event goal without snapping the current rigid piece transform", () => {
  const { rig, camera } = configuredRig();
  while (rig.activeSlip?.phase !== "catch" && rig.time < 10) step(rig, 0.04);
  const event = rig.activeSlip;
  expect(event?.phase).toBe("catch");
  const piece = rig.pieces.find(({ id }) => id === event.pieceId);
  const position = piece.group.position.clone();
  const quaternion = piece.group.quaternion.clone();
  const time = rig.time;
  const startedAt = event.startedAt;
  camera.aspect = 390 / 520;
  camera.position.set(0.5, 0.5, 4);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  configureLogoSuspension(rig, { camera, position: [0.5, 0, 0], width: 390 });
  expect(rig.activeSlip).toBe(event);
  expect(rig.time).toBe(time);
  expect(event.startedAt).toBe(startedAt);
  expect(piece.group.position.equals(position)).toBe(true);
  expect(piece.group.quaternion.equals(quaternion)).toBe(true);
  expect(Math.abs(event.goalAngle))
    .toBeLessThanOrEqual(THREE.MathUtils.degToRad(LOGO_SUSPENSION.compactSlipDegrees) + 1e-8);
  expect(Math.abs(event.goalAngle))
    .toBeLessThanOrEqual(piece.slipLimits[event.side] + 1e-8);
  step(rig, 8);
  expect(rig.activeSlip).toBeNull();
  expect(piece.group.position.distanceTo(piece.nominalPosition)).toBeLessThan(piece.size.y * 0.2);
  expect(Number.isFinite(piece.state.angularVelocity)).toBe(true);
  disposeLogoSuspension(rig);
});

test("an undersized camera envelope disables unsafe slips instead of retaining a minimum fall angle", () => {
  const { rig, camera } = configuredRig();
  camera.fov = 2;
  camera.aspect = 0.6;
  camera.updateProjectionMatrix();
  configureLogoSuspension(rig, { camera, position: [0.5, 0, 0], width: 390 });
  rig.pieces.slice(0, 2).forEach((piece) => {
    expect(piece.slipLimits.left).toBe(0);
    expect(piece.slipLimits.right).toBe(0);
  });
  step(rig, 25);
  expect(rig.activeSlip).toBeNull();
  disposeLogoSuspension(rig);
});

test("the seeded schedule remains irregular and avoids a third successive event on the same name or same side", () => {
  function observe() {
    const { rig } = configuredRig();
    const events = [];
    let previous;
    step(rig, 240, () => {
      if (rig.activeSlip && rig.activeSlip !== previous) {
        events.push({ pieceId: rig.activeSlip.pieceId, side: rig.activeSlip.side, start: rig.activeSlip.startedAt });
      }
      previous = rig.activeSlip;
    });
    disposeLogoSuspension(rig);
    return events;
  }
  const events = observe();
  expect(events).toEqual(observe());
  expect(events.length).toBeGreaterThan(12);
  events.slice(2).forEach((event, index) => {
    const previous = events.slice(index, index + 2);
    expect(previous.every(({ pieceId }) => pieceId === event.pieceId)).toBe(false);
    expect(previous.every(({ side }) => side === event.side)).toBe(false);
  });
  const gaps = events.slice(1).map((event, index) => event.start - events[index].start);
  expect(Math.min(...gaps)).toBeGreaterThanOrEqual(8 - 0.04);
  expect(Math.max(...gaps)).toBeLessThanOrEqual(18 + 0.04);
  expect(new Set(gaps.map((gap) => gap.toFixed(1))).size).toBeGreaterThan(4);
});
