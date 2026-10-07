import * as THREE from "three";
import {
  LOGO_SUSPENSION,
  advanceLogoSuspension,
  configureLogoSuspension,
  createLogoSuspension,
  disposeLogoSuspension,
  setLogoCameraViewport,
  updateLogoCables,
} from "./logoSuspension";

const PAIRS = [
  ["ibrahim", "outer", "inner", 0.25, 0.7, 0.12],
  ["karim", "outer.001", "inner.001", 0.025, 0.55, 0.12],
  ["ibrahimPronunciation", "outer.002", "inner.002", 0.385, 0.25, 0.035],
  ["karimPronunciation", "outer.003", "inner.003", -0.11, 0.24, 0.035],
];

function specimen() {
  const scene = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: "#6a1e2d", metalness: 0.85, roughness: 0.19,
  });
  material.name = "Material.001";
  PAIRS.forEach(([, outerName, innerName, y, width, height]) => {
    [outerName, innerName].forEach((name, index) => {
      const authored = new THREE.Group();
      authored.name = THREE.PropertyBinding.sanitizeNodeName(name);
      authored.userData.name = name;
      authored.rotation.x = Math.PI / 2;
      authored.position.set(0, y, index ? 0.004 : 0);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width * (index ? 0.94 : 1), 0.025, height),
        material
      );
      mesh.name = `${authored.name}Mesh`;
      authored.add(mesh);
      if (!index && ["outer", "outer.002"].includes(name)) {
        const light = new THREE.PointLight("#f2e2c4", 12);
        light.name = name === "outer" ? "Point" : "Point002";
        light.userData.name = name === "outer" ? "Point" : "Point.002";
        light.position.set(0.02, 0.035, 0.04);
        authored.add(light);
      }
      scene.add(authored);
    });
  });
  scene.updateMatrixWorld(true);
  return scene;
}

function configuredRig(width = 1440, height = 740) {
  const source = specimen();
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
  camera.position.set(...(width < 700 ? [0.5, 0.5, 4] : [0.45, 0.4, 2]));
  camera.updateMatrixWorld(true);
  const rig = createLogoSuspension(source);
  configureLogoSuspension(rig, { camera, position: [0.5, 0, 0], width });
  updateLogoCables(rig);
  return { source, camera, rig };
}

function step(rig, duration, observer = () => {}, reducedMotion = false) {
  const count = Math.ceil(duration / 0.04);
  for (let index = 0; index < count; index += 1) {
    advanceLogoSuspension(rig, duration / count, { reducedMotion });
    updateLogoCables(rig);
    observer(rig);
  }
}

function supports(rig) {
  return rig.pieces.flatMap((piece) => piece.supports);
}

function worldAttachment(piece, support) {
  piece.group.updateWorldMatrix(true, false);
  return piece.group.localToWorld(support.attachment.clone());
}

function snapshot(scene) {
  const nodes = [];
  scene.traverse((node) => nodes.push({
    node,
    parent: node.parent,
    position: node.position.clone(),
    quaternion: node.quaternion.clone(),
    scale: node.scale.clone(),
    material: node.material,
    geometry: node.geometry,
  }));
  return nodes;
}

test("eight visible cables support the requested letters while the original motion topology remains intact", () => {
  const { rig } = configuredRig();
  expect(rig.pieces.map((piece) => piece.id)).toEqual(PAIRS.map(([id]) => id));
  expect(rig.pieces.map((piece) => piece.supports.length)).toEqual([2, 2, 2, 2]);
  expect(rig.pieces.map((piece) => piece.motionSupports.length)).toEqual([2, 2, 1, 1]);
  expect(supports(rig)).toHaveLength(8);
  rig.pieces.forEach((piece, index) => {
    if (index < 2) {
      expect(piece.supports.map((support) => support.side)).toEqual(["left", "right"]);
      expect(piece.supports[0].attachment.x).toBeLessThan(piece.supports[1].attachment.x);
      expect(piece.supports[1].attachment.x - piece.supports[0].attachment.x)
        .toBeGreaterThan(piece.size.x * 0.3);
    } else {
      expect(piece.supports.map((support) => support.label)).toEqual(index === 2 ? ["ee", "heem"] : ["kuh", "m"]);
      expect(piece.motionSupports[0].side).toBe("center");
    }
    piece.supports.forEach((support) => {
      expect(support.attachment.y).toBeGreaterThan(piece.bounds.getCenter(new THREE.Vector3()).y);
    });
  });
  disposeLogoSuspension(rig);
});

test("imported point lights preserve their authored parent relationship and follow the same rigid hanging piece", () => {
  const { source, rig } = configuredRig();
  for (const [pieceId, lightName, parentName] of [
    ["ibrahim", "Point", "outer"],
    ["ibrahimPronunciation", "Point002", "outer002"],
  ]) {
    const sourceLight = source.getObjectByName(lightName);
    const light = rig.scene.getObjectByName(lightName);
    const piece = rig.pieces.find(({ id }) => id === pieceId);
    expect(light).not.toBe(sourceLight);
    expect(light.parent.name).toBe(parentName);
    expect(light.position.equals(sourceLight.position)).toBe(true);
    expect(light.color.getHexString()).toBe(sourceLight.color.getHexString());
    expect(light.intensity).toBe(sourceLight.intensity);
    const relative = piece.group.worldToLocal(light.getWorldPosition(new THREE.Vector3()));
    piece.group.position.y -= 0.03;
    piece.group.rotation.z += 0.2;
    rig.root.updateMatrixWorld(true);
    const expected = piece.group.localToWorld(relative.clone());
    expect(light.getWorldPosition(new THREE.Vector3()).distanceTo(expected)).toBeLessThan(1e-7);
  }
  disposeLogoSuspension(rig);
});

test("an imported directional light keeps its actual cloned child target and authored world direction", () => {
  const source = specimen();
  source.rotation.set(0.17, -0.25, 0.05);
  const light = new THREE.DirectionalLight("#f2e2c4", 3500);
  light.name = "Sun";
  light.position.set(0.2, 0.4, 0.3);
  light.rotation.set(0.7, 0.2, -0.15);
  const target = new THREE.Object3D();
  target.name = "SunTarget";
  target.position.set(0, 0, -1);
  light.add(target);
  light.target = target;
  source.add(light);
  source.updateMatrixWorld(true);
  const originalDirection = target.getWorldPosition(new THREE.Vector3())
    .sub(light.getWorldPosition(new THREE.Vector3())).normalize();
  const rig = createLogoSuspension(source);
  rig.root.position.set(0.5, 0, 0);
  rig.root.updateMatrixWorld(true);
  const clonedLight = rig.scene.getObjectByName("Sun");
  const clonedTarget = rig.scene.getObjectByName("SunTarget");
  expect(clonedTarget).not.toBe(target);
  expect(clonedLight.target).toBe(clonedTarget);
  const direction = clonedLight.target.getWorldPosition(new THREE.Vector3())
    .sub(clonedLight.getWorldPosition(new THREE.Vector3())).normalize();
  expect(direction.distanceTo(originalDirection)).toBeLessThan(1e-7);
  disposeLogoSuspension(rig);
});

test("wrappers synchronize the outer and inner artwork without modifying the imported scene or resources", () => {
  const source = specimen();
  const original = snapshot(source);
  const rig = createLogoSuspension(source);
  expect(rig.scene).not.toBe(source);
  rig.pieces.forEach((piece, index) => {
    const authoredNames = [];
    piece.group.traverse((node) => authoredNames.push(node.userData.name));
    expect(authoredNames).toContain(PAIRS[index][1]);
    expect(authoredNames).toContain(PAIRS[index][2]);
    expect(piece.group.rotation.x).toBe(0);
  });
  const clonedMeshes = [];
  rig.scene.traverse((node) => { if (node.isMesh) clonedMeshes.push(node); });
  const originalMeshes = original.filter(({ node }) => node.isMesh);
  expect(clonedMeshes).toHaveLength(originalMeshes.length);
  clonedMeshes.forEach((mesh, index) => {
    expect(mesh.geometry).toBe(originalMeshes[index].geometry);
    expect(mesh.material).toBe(originalMeshes[index].material);
  });
  const camera = new THREE.PerspectiveCamera(30, 1440 / 740, 0.1, 1000);
  camera.position.set(0.45, 0.4, 2);
  camera.updateMatrixWorld(true);
  configureLogoSuspension(rig, { camera, position: [0.5, 0, 0], width: 1440 });
  step(rig, 24);
  original.forEach(({ node, parent, position, quaternion, scale, material, geometry }) => {
    expect(node.parent).toBe(parent);
    expect(node.position.equals(position)).toBe(true);
    expect(node.quaternion.equals(quaternion)).toBe(true);
    expect(node.scale.equals(scale)).toBe(true);
    expect(node.material).toBe(material);
    expect(node.geometry).toBe(geometry);
  });
  disposeLogoSuspension(rig);
});

test("cable endpoints use each moving wrapper's actual world attachment and remain behind the artwork", () => {
  const { rig } = configuredRig();
  const piece = rig.pieces[0];
  piece.group.rotation.z = 0.18;
  piece.group.position.add(new THREE.Vector3(0.012, -0.033, 0));
  updateLogoCables(rig);
  const buffer = rig.lines.geometry.attributes.position;
  const verticesPerCable = buffer.count / supports(rig).length;
  let cableIndex = 0;
  rig.pieces.forEach((element) => element.supports.forEach((support) => {
    const expected = worldAttachment(element, support);
    expect(support.endpoint.distanceTo(expected)).toBeLessThan(1e-7);
    const bufferStart = new THREE.Vector3().fromBufferAttribute(buffer, cableIndex * verticesPerCable);
    const bufferEnd = new THREE.Vector3().fromBufferAttribute(buffer, (cableIndex + 1) * verticesPerCable - 1);
    rig.lines.localToWorld(bufferStart);
    rig.lines.localToWorld(bufferEnd);
    expect(bufferStart.distanceTo(support.anchor)).toBeLessThan(1e-6);
    expect(bufferEnd.distanceTo(expected)).toBeLessThan(1e-6);
    expect(support.attachment.z).toBeLessThanOrEqual(element.bounds.min.z + 1e-5);
    cableIndex += 1;
  }));
  expect(rig.lines.material.depthTest).toBe(true);
  expect(rig.lines.material.depthWrite).toBe(false);
  expect(rig.lines.material.opacity).toBeGreaterThan(0.34);
  disposeLogoSuspension(rig);
});

test.each([[1440, 740], [1000, 640], [390, 520]])(
  "ceiling anchors stay fixed above the %ipx viewport throughout entrance, idle and a slip",
  (width, height) => {
    const { rig, camera } = configuredRig(width, height);
    const original = supports(rig).map((support) => support.anchor.clone());
    original.forEach((anchor) => expect(anchor.clone().project(camera).y).toBeGreaterThan(1));
    let greatestAnchorDrift = 0;
    step(rig, 34, () => {
      supports(rig).forEach((support, index) => {
        greatestAnchorDrift = Math.max(greatestAnchorDrift, support.anchor.distanceTo(original[index]));
      });
    });
    expect(greatestAnchorDrift).toBeLessThan(1e-9);
    disposeLogoSuspension(rig);
  }
);

test("the expanded viewport entrance clears the top edge for every corner of artwork at authored depth", () => {
  const source = specimen();
  source.children.forEach((node) => { node.position.z -= 1.05; });
  source.updateMatrixWorld(true);
  const camera = new THREE.PerspectiveCamera(30, 884 / 500, 0.1, 1000);
  camera.position.set(0.45, 0.4, 2);
  setLogoCameraViewport(camera, { width: 884, height: 500, topExtension: 163, bottomExtension: 163 });
  camera.updateMatrixWorld(true);
  const rig = createLogoSuspension(source);
  configureLogoSuspension(rig, { camera, position: [0.5, 0, 0], width: 884 });
  advanceLogoSuspension(rig, 0.04, { reducedMotion: false });
  rig.root.updateMatrixWorld(true);
  rig.pieces.forEach((piece) => {
    for (const x of [piece.bounds.min.x, piece.bounds.max.x]) {
      for (const y of [piece.bounds.min.y, piece.bounds.max.y]) {
        for (const z of [piece.bounds.min.z, piece.bounds.max.z]) {
          const projected = piece.group.localToWorld(new THREE.Vector3(x, y, z)).project(camera);
          expect(projected.y).toBeGreaterThan(1);
        }
      }
    }
  });
  disposeLogoSuspension(rig);
});

test.each([[1440, 740], [1000, 640], [390, 520]])(
  "the %ipx entrance begins above the viewport and the final slot remains visible during slips",
  (width, height) => {
    const { rig, camera } = configuredRig(width, height);
    advanceLogoSuspension(rig, 0.04, { reducedMotion: false });
    rig.root.updateMatrixWorld(true);
    rig.pieces.forEach((piece) => {
      const bottom = new THREE.Vector3(0, piece.bounds.min.y, 0);
      expect(piece.group.localToWorld(bottom).project(camera).y).toBeGreaterThan(1);
    });
    let lowestProjection = Infinity;
    let greatestHorizontalProjection = 0;
    step(rig, 45, () => {
      if (rig.time < 5) return;
      rig.pieces.forEach((piece) => {
        for (const x of [piece.bounds.min.x, piece.bounds.max.x]) {
          for (const y of [piece.bounds.min.y, piece.bounds.max.y]) {
            const projected = piece.group.localToWorld(new THREE.Vector3(x, y, 0)).project(camera);
            lowestProjection = Math.min(lowestProjection, projected.y);
            greatestHorizontalProjection = Math.max(greatestHorizontalProjection, Math.abs(projected.x));
          }
        }
      });
    });
    expect(lowestProjection).toBeGreaterThan(-1);
    expect(greatestHorizontalProjection).toBeLessThan(1);
    disposeLogoSuspension(rig);
  }
);

test("continuous hanging motion remains visible after the entrance and well beyond the first slip", () => {
  const { rig } = configuredRig();
  step(rig, 75);
  const observed = rig.pieces.map(() => ({ min: Infinity, max: -Infinity }));
  let idleFrames = 0;
  step(rig, 22, () => {
    if (rig.activeSlip) return;
    idleFrames += 1;
    rig.pieces.forEach((piece, index) => {
      observed[index].min = Math.min(observed[index].min, piece.group.rotation.z);
      observed[index].max = Math.max(observed[index].max, piece.group.rotation.z);
    });
  });
  expect(idleFrames).toBeGreaterThan(50);
  observed.slice(0, 2).forEach(({ min, max }) => {
    expect(max - min).toBeGreaterThan(THREE.MathUtils.degToRad(0.4));
  });
  observed.slice(2).forEach(({ min, max }) => {
    expect(max - min).toBeGreaterThan(THREE.MathUtils.degToRad(0.1));
    expect(Math.max(Math.abs(min), Math.abs(max))).toBeLessThan(THREE.MathUtils.degToRad(3));
  });
  disposeLogoSuspension(rig);
});

test("a slip releases one main-name support while the opposite endpoint catches and recovery reels it back", () => {
  const { rig } = configuredRig();
  let firstEvent;
  let caughtEndpoint;
  let caughtLength;
  let releasedLengthIncreased = false;
  let greatestAngle = 0;
  let greatestFall = 0;
  let catchRebounded = false;
  let recoveredPiece;
  step(rig, 48, () => {
    if (!firstEvent && rig.activeSlip) {
      firstEvent = rig.activeSlip;
      expect(["ibrahim", "karim"]).toContain(firstEvent.pieceId);
    }
    if (!firstEvent) return;
    const piece = rig.pieces.find(({ id }) => id === firstEvent.pieceId);
    if (rig.activeSlip === firstEvent) {
      const released = piece.motionSupports.find(({ side }) => side === firstEvent.side);
      const surviving = piece.motionSupports.find(({ side }) => side !== firstEvent.side);
      if (["release", "catch", "hold"].includes(firstEvent.phase)) {
        if (!caughtEndpoint) {
          caughtEndpoint = surviving.endpoint.clone();
          caughtLength = surviving.length;
        }
        expect(surviving.endpoint.distanceTo(caughtEndpoint)).toBeLessThan(2e-4);
        expect(Math.abs(surviving.length - caughtLength)).toBeLessThan(2e-4);
      }
      releasedLengthIncreased ||= released.targetLength > released.nominalLength + piece.size.y * 0.1;
      greatestAngle = Math.max(greatestAngle, Math.abs(piece.group.rotation.z));
      greatestFall = Math.max(greatestFall, piece.nominalPosition.y - piece.group.position.y);
      const releaseDirection = firstEvent.side === "right" ? -1 : 1;
      if (firstEvent.phase === "catch" && piece.state.angularVelocity * releaseDirection < -0.005) {
        catchRebounded = true;
      }
      const other = rig.pieces.find(({ id }) => id !== piece.id && ["ibrahim", "karim"].includes(id));
      expect(Math.abs(other.group.rotation.z)).toBeLessThan(THREE.MathUtils.degToRad(5));
    } else if (!recoveredPiece) {
      recoveredPiece = piece;
      piece.motionSupports.forEach((support) => {
        expect(Math.abs(support.targetLength - support.nominalLength)).toBeLessThan(0.015);
      });
      expect(Math.abs(piece.group.rotation.z)).toBeLessThan(THREE.MathUtils.degToRad(3));
      expect(Math.abs(piece.group.position.y - piece.nominalPosition.y)).toBeLessThan(piece.size.y * 0.3);
    }
  });
  expect(firstEvent).toBeDefined();
  expect(caughtEndpoint).toBeDefined();
  expect(releasedLengthIncreased).toBe(true);
  expect(catchRebounded).toBe(true);
  expect(greatestAngle).toBeGreaterThan(THREE.MathUtils.degToRad(7));
  expect(recoveredPiece).toBeDefined();
  expect(greatestFall).toBeGreaterThan(recoveredPiece.size.y * 0.15);
  disposeLogoSuspension(rig);
});

test("a throttled browser frame cannot skip into an uncontrolled fall", () => {
  const { rig } = configuredRig();
  step(rig, 3);
  const before = rig.pieces.map((piece) => piece.group.position.clone());
  const time = rig.time;
  advanceLogoSuspension(rig, 120, { reducedMotion: false });
  expect(rig.time - time).toBeLessThanOrEqual(0.100001);
  expect(rig.activeSlip).toBeNull();
  rig.pieces.forEach((piece, index) => {
    expect(Number.isFinite(piece.state.angularVelocity)).toBe(true);
    expect(piece.group.position.distanceTo(before[index])).toBeLessThan(0.05);
  });
  disposeLogoSuspension(rig);
});

test("the first slip starts one second after every piece completes its entrance and settle", () => {
  const { rig } = configuredRig();
  const expectedStart = LOGO_SUSPENSION.entrancePause + LOGO_SUSPENSION.descent
    + LOGO_SUSPENSION.settling + Math.max(...rig.pieces.map((piece) => piece.delay)) + 1;
  step(rig, expectedStart - 0.12);
  expect(rig.activeSlip).toBeNull();
  let firstStart;
  step(rig, 0.24, () => {
    if (firstStart === undefined && rig.activeSlip) firstStart = rig.activeSlip.startedAt;
  });
  expect(firstStart).toBeGreaterThanOrEqual(expectedStart);
  expect(firstStart).toBeLessThan(expectedStart + 1 / 120 + 1e-6);
  disposeLogoSuspension(rig);
});

test("seeded slips are irregular, do not repeat the same piece and side consecutively, and never overlap", () => {
  function observe() {
    const { rig } = configuredRig();
    const events = [];
    let previous = null;
    let greatestSimultaneousDrops = 0;
    const dramaticPieceIds = new Set();
    step(rig, 105, () => {
      if (rig.activeSlip && rig.activeSlip !== previous) {
        events.push({ pieceId: rig.activeSlip.pieceId, side: rig.activeSlip.side, time: rig.time });
      }
      previous = rig.activeSlip;
      const majorPieces = rig.pieces.filter((piece) => Math.abs(piece.group.rotation.z) > THREE.MathUtils.degToRad(5));
      greatestSimultaneousDrops = Math.max(greatestSimultaneousDrops, majorPieces.length);
      majorPieces.forEach((piece) => dramaticPieceIds.add(piece.id));
    });
    expect(greatestSimultaneousDrops).toBeLessThanOrEqual(1);
    [...dramaticPieceIds].forEach((id) => expect(["ibrahim", "karim"]).toContain(id));
    disposeLogoSuspension(rig);
    return events;
  }
  const first = observe();
  const second = observe();
  expect(first).toEqual(second);
  expect(first.length).toBeGreaterThanOrEqual(4);
  const intervals = first.slice(1).map((event, index) => event.time - first[index].time);
  expect(new Set(intervals.map((interval) => interval.toFixed(1))).size).toBeGreaterThan(1);
  first.slice(1).forEach((event, index) => {
    expect(`${event.pieceId}:${event.side}`).not.toBe(`${first[index].pieceId}:${first[index].side}`);
  });
});

test("resizing recalculates anchors and responsive caps without replaying entrance or resetting an active event", () => {
  const { rig, camera } = configuredRig();
  while (!rig.activeSlip && rig.time < 40) step(rig, 0.04);
  expect(rig.activeSlip).not.toBeNull();
  const time = rig.time;
  const event = rig.activeSlip;
  const nextSlipTime = rig.nextSlipTime;
  camera.aspect = 390 / 520;
  camera.position.set(0.5, 0.5, 4);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  configureLogoSuspension(rig, { camera, position: [0.5, 0, 0], width: 390 });
  updateLogoCables(rig);
  expect(rig.time).toBe(time);
  expect(rig.activeSlip).toBe(event);
  expect(rig.nextSlipTime).toBe(nextSlipTime);
  supports(rig).forEach((support) => {
    expect(support.anchor.clone().project(camera).y).toBeGreaterThan(1);
    expect(Number.isFinite(support.length)).toBe(true);
  });
  step(rig, 5);
  rig.pieces.forEach((piece) => {
    expect(Number.isFinite(piece.group.position.y)).toBe(true);
    expect(Number.isFinite(piece.group.rotation.z)).toBe(true);
  });
  disposeLogoSuspension(rig);
});

test("resizing during a catch rebases cable constraints to the new ceiling without replacing or restarting the event", () => {
  const { rig, camera } = configuredRig();
  while (rig.activeSlip?.phase !== "catch" && rig.time < 40) step(rig, 0.04);
  const event = rig.activeSlip;
  expect(event?.phase).toBe("catch");
  const piece = rig.pieces.find(({ id }) => id === event.pieceId);
  const time = rig.time;
  const startedAt = event.startedAt;
  const previousHeldLength = event.heldLength;
  const previousGoalLength = event.goalLength;
  camera.position.y += 1.5;
  camera.updateMatrixWorld(true);
  configureLogoSuspension(rig, { camera, position: [0.5, 0, 0], width: 1440 });
  expect(rig.activeSlip).toBe(event);
  expect(rig.time).toBe(time);
  expect(event.startedAt).toBe(startedAt);
  expect(event.phase).toBe("catch");
  const heldLength = event.held.anchor.distanceTo(worldAttachment(piece, event.held));
  const axis = new THREE.Vector3(0, 0, 1);
  const releasedGoal = event.released.attachment.clone().applyAxisAngle(axis, event.goalAngle)
    .sub(event.held.attachment.clone().applyAxisAngle(axis, event.goalAngle))
    .add(event.pin);
  piece.group.parent.localToWorld(releasedGoal);
  const goalLength = event.released.anchor.distanceTo(releasedGoal);
  expect(heldLength).toBeGreaterThan(previousHeldLength + 1);
  expect(goalLength).toBeGreaterThan(previousGoalLength + 1);
  expect(event.heldLength).toBeCloseTo(heldLength, 6);
  expect(event.goalLength).toBeCloseTo(goalLength, 6);
  expect(event.held.targetLength).toBeCloseTo(heldLength, 6);
  expect(event.released.targetLength).toBeCloseTo(goalLength, 6);
  disposeLogoSuspension(rig);
});

test("turning reduced motion on during a slip cancels it and resuming starts gentle idle at the final arrangement", () => {
  const { rig } = configuredRig();
  while (!rig.activeSlip && rig.time < 40) step(rig, 0.04);
  expect(rig.activeSlip).not.toBeNull();
  advanceLogoSuspension(rig, 0.04, { reducedMotion: true });
  expect(rig.activeSlip).toBeNull();
  rig.pieces.forEach((piece) => {
    expect(piece.group.position.distanceTo(piece.nominalPosition)).toBeLessThan(1e-9);
    expect(piece.group.quaternion.angleTo(new THREE.Quaternion())).toBeLessThan(1e-9);
    expect(piece.state.angularVelocity).toBe(0);
  });
  step(rig, 2, () => {}, true);
  advanceLogoSuspension(rig, 0.04, { reducedMotion: false });
  expect(rig.activeSlip).toBeNull();
  expect(rig.nextSlipTime).toBeGreaterThan(rig.time);
  expect(rig.nextSlipTime - rig.time).toBeGreaterThanOrEqual(7.9);
  expect(rig.nextSlipTime - rig.time).toBeLessThanOrEqual(18.1);
  rig.pieces.forEach((piece) => {
    expect(piece.group.position.distanceTo(piece.nominalPosition)).toBeLessThan(0.01);
    expect(Math.abs(piece.group.rotation.z)).toBeLessThan(THREE.MathUtils.degToRad(0.2));
  });
  disposeLogoSuspension(rig);
});

test("reduced motion renders the final hanging arrangement immediately and never advances idle or slips", () => {
  const { rig } = configuredRig();
  advanceLogoSuspension(rig, 0.04, { reducedMotion: true });
  updateLogoCables(rig);
  const final = rig.pieces.map((piece) => ({ position: piece.group.position.clone(), quaternion: piece.group.quaternion.clone() }));
  rig.pieces.forEach((piece) => {
    expect(piece.group.position.distanceTo(piece.nominalPosition)).toBeLessThan(1e-9);
    expect(Math.abs(piece.group.rotation.z)).toBeLessThan(1e-9);
  });
  const time = rig.time;
  step(rig, 35, () => {
    expect(rig.activeSlip).toBeNull();
    rig.pieces.forEach((piece, index) => {
      expect(piece.group.position.equals(final[index].position)).toBe(true);
      expect(piece.group.quaternion.equals(final[index].quaternion)).toBe(true);
    });
  }, true);
  expect(rig.time).toBe(time);
  disposeLogoSuspension(rig);
});

test.each([[1440, 740, 180, 100], [1000, 640, 145, 90], [390, 520, 110, 70]])(
  "extending the render region preserves existing logo-slot projection at %ipx width",
  (width, height, topExtension, bottomExtension) => {
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    camera.position.set(0.45, 0.4, 2);
    camera.updateMatrixWorld(true);
    const points = [new THREE.Vector3(0.15, 0.28, 0), new THREE.Vector3(0.8, 0.05, 0.015)];
    const before = points.map((point) => point.clone().project(camera));
    setLogoCameraViewport(camera, { width, height, topExtension, bottomExtension });
    const overlayHeight = height + topExtension + bottomExtension;
    points.forEach((point, index) => {
      const after = point.clone().project(camera);
      expect((after.x + 1) * width / 2).toBeCloseTo((before[index].x + 1) * width / 2, 5);
      expect((1 - after.y) * overlayHeight / 2 - topExtension)
        .toBeCloseTo((1 - before[index].y) * height / 2, 5);
    });
  }
);

test("cleanup disposes only runtime cable resources", () => {
  const { rig, source } = configuredRig();
  const lineGeometry = jest.spyOn(rig.lines.geometry, "dispose");
  const lineMaterial = jest.spyOn(rig.lines.material, "dispose");
  const sourceMesh = source.getObjectByName("outerMesh");
  const sourceGeometry = jest.spyOn(sourceMesh.geometry, "dispose");
  const sourceMaterial = jest.spyOn(sourceMesh.material, "dispose");
  disposeLogoSuspension(rig);
  expect(lineGeometry).toHaveBeenCalledTimes(1);
  expect(lineMaterial).toHaveBeenCalledTimes(1);
  expect(sourceGeometry).not.toHaveBeenCalled();
  expect(sourceMaterial).not.toHaveBeenCalled();
});
