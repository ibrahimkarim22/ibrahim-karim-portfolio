import * as THREE from "three";
import { getLogoFilledRegions } from "./logoMoonlight";

// The authored roots lie in their local X/Z planes. All rigging therefore lives
// in scene-aligned wrapper groups; the baked node transforms remain untouched.
const PIECES = [
  { id: "ibrahim", names: ["outer", "inner"], supports: ["left", "right"], delay: 0 },
  { id: "karim", names: ["outer.001", "inner.001"], supports: ["left", "right"], delay: 0.14 },
  { id: "ibrahimPronunciation", names: ["outer.002", "inner.002"], supports: ["center"], delay: 0.06 },
  { id: "karimPronunciation", names: ["outer.003", "inner.003"], supports: ["center"], delay: 0.2 },
];

export const LOGO_SUSPENSION = Object.freeze({
  entrancePause: 0.12,
  descent: 1.9,
  settling: 1.1,
  mainIdleDegrees: 3.2,
  pronunciationIdleDegrees: 0.7,
  idleVerticalRatio: 0.045,
  idleHorizontalRatio: 0.016,
  slipDegrees: 18,
  compactSlipDegrees: 10,
  release: 0.34,
  catch: 0.9,
  hold: 0.75,
  recovery: 3.6,
  minimumInterval: 8,
  intervalVariation: 10,
  firstSlipDelay: 1,
  cableColor: "#8A7043",
  cableOpacity: 0.7,
  pronunciationScale: 0.92,
  pronunciationAssociation: 0.04,
  releasedPayoutRatio: 0.16,
});

const STEP = 1 / 120;
const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smooth = (value) => {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const entranceDuration = LOGO_SUSPENSION.entrancePause
  + LOGO_SUSPENSION.descent + LOGO_SUSPENSION.settling + 0.2;
const eventDuration = LOGO_SUSPENSION.release + LOGO_SUSPENSION.catch
  + LOGO_SUSPENSION.hold + LOGO_SUSPENSION.recovery;
const authoredName = (object) => object.userData?.name ?? object.name;

function random(rig) {
  // Separate seeded scheduler from the continuous motion. Frame rate and
  // rendering do not consume randomness or determine the event order.
  rig.seed = (Math.imul(1664525, rig.seed) + 1013904223) >>> 0;
  return rig.seed / 4294967296;
}

function noise(time, seed) {
  const cell = Math.floor(time);
  const sample = (index) => {
    let value = Math.imul(index + seed, 374761393);
    value = Math.imul(value ^ (value >>> 13), 1274126177);
    return ((value ^ (value >>> 16)) >>> 0) / 2147483648 - 1;
  };
  return THREE.MathUtils.lerp(sample(cell), sample(cell + 1), smooth(time - cell));
}

function idlePose(piece, elapsed) {
  const main = piece.isMainName;
  const phase = piece.index * 2.17;
  const signal = 0.56 * Math.sin(elapsed * (main ? 0.48 : 0.57) + phase)
    + 0.27 * noise(elapsed / 8.7 + piece.index, 41 + piece.index * 73)
    + 0.17 * Math.sin(elapsed * 0.29 + phase * 0.63);
  const fade = smooth(elapsed / 2.2);
  const strength = main ? 1 : 0.32;
  return {
    angle: THREE.MathUtils.degToRad(main
      ? LOGO_SUSPENSION.mainIdleDegrees : LOGO_SUSPENSION.pronunciationIdleDegrees)
      * signal * fade,
    x: piece.size.x * LOGO_SUSPENSION.idleHorizontalRatio * strength
      * (0.65 * Math.sin(elapsed * 0.31 + phase) + 0.35 * noise(elapsed / 11.3, 91 + piece.index)) * fade,
    y: piece.size.y * LOGO_SUSPENSION.idleVerticalRatio * strength
      * (0.6 * Math.sin(elapsed * 0.39 + phase + 0.7) + 0.4 * noise(elapsed / 6.9, 117 + piece.index)) * fade,
  };
}

function spring(value, velocity, target, frequency, damping, dt) {
  const acceleration = frequency * frequency * (target - value) - 2 * damping * frequency * velocity;
  const nextVelocity = velocity + acceleration * dt;
  return [value + nextVelocity * dt, nextVelocity];
}

function rotatedPoint(point, angle, result = new THREE.Vector3()) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return result.set(point.x * cosine - point.y * sine, point.x * sine + point.y * cosine, point.z);
}

function scenePoint(piece, support, pose) {
  return rotatedPoint(support.attachment, pose.angle)
    .add(piece.nominalPosition).add(new THREE.Vector3(pose.x, pose.y, 0));
}

function worldPoint(piece, support, pose) {
  return piece.group.parent.localToWorld(scenePoint(piece, support, pose));
}

function measurePiece(scene, nodes) {
  scene.updateMatrixWorld(true);
  const inverse = scene.matrixWorld.clone().invert();
  const vertices = [];
  const bounds = new THREE.Box3();
  const point = new THREE.Vector3();
  nodes.forEach((node) => node.traverse((mesh) => {
    const positions = mesh.isMesh && mesh.geometry?.attributes.position;
    if (!positions) return;
    const matrix = inverse.clone().multiply(mesh.matrixWorld);
    for (let i = 0; i < positions.count; i += 1) {
      point.fromBufferAttribute(positions, i).applyMatrix4(matrix);
      bounds.expandByPoint(point);
      vertices.push(point.clone());
    }
  }));
  return { bounds, vertices };
}

function attachmentOnStroke(bounds, vertices, side, nodes, scene, options = {}) {
  const size = bounds.getSize(new THREE.Vector3());
  const fraction = options.fraction ?? (side === "left" ? 0.18 : side === "right" ? 0.82 : 0.5);
  const targetX = bounds.min.x + size.x * fraction;
  const band = size.x * 0.055;
  // Intersect a downward ray with the actual top surface where possible.
  // Sparse geometry (e.g. a straight stroke with only corner vertices) still
  // needs an attachment on its surface, rather than at a distant AABB corner.
  const origin = scene.localToWorld(new THREE.Vector3(targetX,
    bounds.max.y + size.y, (bounds.min.z + bounds.max.z) / 2));
  const direction = new THREE.Vector3(0, -1, 0).transformDirection(scene.matrixWorld);
  const hit = new THREE.Raycaster(origin, direction).intersectObjects(nodes, true)[0];
  let candidate = hit ? scene.worldToLocal(hit.point.clone()) : undefined;
  if (side === "center") {
    const raycaster = new THREE.Raycaster();
    // A pronunciation's exact middle may be a short stroke. Keep its single
    // support near center, but choose a genuine upper surface in that small band.
    for (const offset of options.offsets ?? [-0.055, -0.045, -0.035, -0.025, -0.015, -0.005,
      0.005, 0.015, 0.025, 0.035, 0.045, 0.055]) {
      const rayOrigin = scene.localToWorld(new THREE.Vector3(targetX + size.x * offset,
        bounds.max.y + size.y, (bounds.min.z + bounds.max.z) / 2));
      raycaster.set(rayOrigin, direction);
      const surface = raycaster.intersectObjects(nodes, true)[0];
      if (!surface) continue;
      const point = scene.worldToLocal(surface.point.clone());
      if (!candidate || point.y > candidate.y + 1e-6) candidate = point;
    }
  }
  if (!candidate) vertices.forEach((point) => {
    if (Math.abs(point.x - targetX) <= band && (!candidate || point.y > candidate.y)) candidate = point;
  });
  if (!candidate) {
    candidate = vertices.reduce((nearest, point) => (
      Math.abs(point.x - targetX) < Math.abs(nearest.x - targetX)
        || (Math.abs(point.x - targetX) === Math.abs(nearest.x - targetX) && point.y > nearest.y)
        ? point : nearest
    ), vertices[0]);
  }
  // Inset into the actual top stroke and put the termination behind the rear
  // envelope. Lettering paints over the straight cable at its attachment.
  return new THREE.Vector3(candidate.x, candidate.y - (options.insetHeight ?? size.y) * 0.012,
    bounds.min.z - Math.max(0.003, size.z * 0.06));
}

export function createLogoSuspension(sourceScene) {
  sourceScene.updateMatrixWorld(true);
  const scene = sourceScene.clone(true);
  // Three's light.copy clones .target separately from child targets. GLTFLoader
  // parents those targets to the light, so reconnect the corresponding cloned
  // descendants instead of silently changing the authored lighting direction.
  const clonedObjects = new Map();
  const matchClones = (source, clone) => {
    clonedObjects.set(source, clone);
    source.children.forEach((child, index) => matchClones(child, clone.children[index]));
  };
  matchClones(sourceScene, scene);
  sourceScene.traverse((source) => {
    if (!(source.isDirectionalLight || source.isSpotLight)) return;
    const clone = clonedObjects.get(source);
    if (clonedObjects.has(source.target)) clone.target = clonedObjects.get(source.target);
    else clone.target.position.copy(source.target.getWorldPosition(new THREE.Vector3()));
  });
  const root = new THREE.Group();
  root.name = "HomeLogoFlySystem";
  root.add(scene);
  const byName = new Map();
  scene.traverse((object) => byName.set(authoredName(object), object));
  const pieces = PIECES.flatMap((definition, index) => {
    const nodes = definition.names.map((name) => byName.get(name)).filter(Boolean);
    if (!nodes.length) return [];
    const { bounds, vertices } = measurePiece(scene, nodes);
    if (bounds.isEmpty()) return [];
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const attachments = definition.supports.map((side) => ({
      side, attachment: attachmentOnStroke(bounds, vertices, side, nodes, scene).sub(center),
    }));
    const group = new THREE.Group();
    group.name = `Suspended-${definition.id}`;
    group.position.copy(center);
    scene.add(group);
    group.updateMatrixWorld(true);
    nodes.forEach((node) => group.attach(node));
    const artworkScale = definition.supports.length === 1 ? LOGO_SUSPENSION.pronunciationScale : 1;
    if (artworkScale !== 1) {
      const artwork = new THREE.Group();
      artwork.name = `Artwork-${definition.id}`;
      group.add(artwork);
      nodes.forEach((node) => artwork.attach(node));
      artwork.scale.setScalar(artworkScale);
    }
    const localBounds = bounds.clone().translate(center.clone().negate());
    localBounds.min.multiplyScalar(artworkScale);
    localBounds.max.multiplyScalar(artworkScale);
    size.multiplyScalar(artworkScale);
    return [{
      ...definition, index, group, size, artworkScale, isMainName: definition.supports.length === 2,
      nominalPosition: center,
      bounds: localBounds,
      supports: attachments.map(({ side, attachment }) => ({
        side, attachment: attachment.multiplyScalar(artworkScale),
        anchor: new THREE.Vector3(),
        endpoint: new THREE.Vector3(),
        nominalLength: 0, targetLength: 0, length: 0, paidOutLength: 0, slack: 0, tension: 1,
      })),
      state: { angle: 0, angularVelocity: 0, x: 0, y: 0, xVelocity: 0, yVelocity: 0 },
      slipLimits: { left: 0, right: 0 },
    }];
  });
  pieces.filter((piece) => piece.supports.length === 1).forEach((piece) => {
    const main = pieces.find(({ id }) => id === piece.id.replace("Pronunciation", ""));
    if (!main) return;
    piece.nominalPosition.y += (main.nominalPosition.y - piece.nominalPosition.y)
      * LOGO_SUSPENSION.pronunciationAssociation;
    piece.group.position.copy(piece.nominalPosition);
  });
  const pronunciation = pieces.find(({ id }) => id === "ibrahimPronunciation");
  if (pronunciation) {
    const regions = getLogoFilledRegions(pronunciation);
    if (regions.length > 1) {
      // The first filled region is EE; the hollow BRAH lies between it and EEM.
      // Use this actual mesh region's depth to intersect its slanted upper stroke.
      const eeBounds = regions[0].clone().translate(pronunciation.nominalPosition);
      const nodes = pronunciation.names.map((name) => byName.get(name)).filter(Boolean);
      const { vertices } = measurePiece(scene, nodes);
      const attachment = attachmentOnStroke(eeBounds, vertices, "center", nodes, scene, {
        offsets: [-0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15],
        insetHeight: pronunciation.size.y,
      }).sub(pronunciation.nominalPosition);
      attachment.z = pronunciation.bounds.min.z - Math.max(0.003, pronunciation.size.z * 0.06);
      pronunciation.supports[0].attachment.copy(attachment);
    }
  }
  pieces.forEach((piece) => {
    // Keep the working pose solver and its original pivots intact. Visible
    // rigging may attach to other strokes without rechoreographing the logo.
    piece.motionSupports = piece.supports;
    const nodes = piece.names.map((name) => byName.get(name)).filter(Boolean);
    const { vertices } = measurePiece(scene, nodes);
    const crop = (bounds, from, to) => {
      const result = bounds.clone();
      const width = bounds.max.x - bounds.min.x;
      result.min.x = bounds.min.x + width * from;
      result.max.x = bounds.min.x + width * to;
      return result;
    };
    const pointOn = (bounds, options = {}) => {
      const point = attachmentOnStroke(bounds.clone().translate(piece.nominalPosition), vertices,
        "center", nodes, scene, { insetHeight: piece.size.y, ...options }).sub(piece.nominalPosition);
      point.z = piece.bounds.min.z - Math.max(0.003, piece.size.z * 0.06);
      return point;
    };
    const visibleSupport = (side, label, attachment) => ({
      side, label, attachment: attachment.clone(), anchor: new THREE.Vector3(), endpoint: new THREE.Vector3(),
      nominalLength: 0, targetLength: 0, length: 0, paidOutLength: 0, slack: 0, tension: 1,
    });
    const mRegions = getLogoFilledRegions(piece, new Set(["Material.007"]));
    const mBounds = mRegions[mRegions.length - 1];
    if (piece.isMainName) {
      const right = pointOn(mBounds ?? crop(piece.bounds, 0.78, 0.96), {
        offsets: [-0.08, -0.04, 0, 0.04, 0.08],
      });
      piece.supports = [visibleSupport("left", "left", piece.motionSupports[0].attachment),
        visibleSupport("right", "m", right)];
    } else if (piece.id === "ibrahimPronunciation") {
      const eRegions = getLogoFilledRegions(piece, new Set(["Material.004"]));
      const eBounds = eRegions[eRegions.length - 1] ?? crop(piece.bounds, 0.62, 0.84);
      const firstE = pointOn(crop(eBounds, 0, 0.35), {
        fraction: 0.9, offsets: [-0.1, -0.05, 0, 0.05, 0.1],
      });
      piece.supports = [visibleSupport("left", "ee", piece.motionSupports[0].attachment),
        visibleSupport("right", "heem", firstE)];
    } else {
      const kuh = pointOn(crop(piece.bounds, 0, 0.35), {
        fraction: 0.55, offsets: [-0.2, -0.1, 0, 0.1, 0.2],
      });
      const endM = pointOn(mBounds ? crop(mBounds, 0.65, 1) : crop(piece.bounds, 0.8, 0.97), {
        fraction: 0.75, offsets: [-0.1, -0.05, 0, 0.05, 0.1],
      });
      piece.supports = [visibleSupport("left", "kuh", kuh), visibleSupport("right", "m", endM)];
    }
  });
  const supportCount = pieces.reduce((sum, piece) => sum + piece.supports.length, 0);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(
    new Float32Array(supportCount * 2 * 3), 3
  ));
  const material = new THREE.LineBasicMaterial({
    color: LOGO_SUSPENSION.cableColor,
    opacity: LOGO_SUSPENSION.cableOpacity,
    // Paint before the opaque letters without writing depth. Explicit alpha
    // blending preserves the existing brass opacity in this earlier pass.
    transparent: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquationAlpha: THREE.AddEquation,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    depthTest: true,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.name = "HomeLogoSuspensionCables";
  lines.renderOrder = -1;
  lines.frustumCulled = false;
  root.add(lines);
  const rig = {
    scene, root, pieces, lines, time: 0, seed: 0x1b7a3,
    activeSlip: null, previousEvent: null, recentEvents: [], configured: false, wasReduced: false,
    raisedOffset: 0, nextSlipTime: Infinity,
  };
  rig.nextSlipTime = entranceDuration + LOGO_SUSPENSION.firstSlipDelay;
  return rig;
}

// Enlarge only the renderable region, preserving the original slot's pixel
// projection. Position, FOV, scale and the final composition are unchanged.
export function setLogoCameraViewport(camera, { width, height, topExtension = 0, bottomExtension = 0 }) {
  camera.setViewOffset(width, height, 0, -topExtension, width, height + topExtension + bottomExtension);
  camera.updateProjectionMatrix();
}

function viewportAt(camera, z) {
  camera.updateMatrixWorld(true);
  const project = (x, y) => {
    const ray = new THREE.Vector3(x, y, 0.5).unproject(camera).sub(camera.position);
    return camera.position.clone().addScaledVector(ray, (z - camera.position.z) / ray.z);
  };
  const topLeft = project(-1, 1);
  const bottomRight = project(1, -1);
  return { left: topLeft.x, right: bottomRight.x, top: topLeft.y, bottom: bottomRight.y };
}

function constrainedPose(piece, heldSupport, pin, angle) {
  const rotated = rotatedPoint(heldSupport.attachment, angle);
  return {
    angle,
    x: pin.x - rotated.x - piece.nominalPosition.x,
    y: pin.y - rotated.y - piece.nominalPosition.y,
  };
}

function safeSlipLimit(piece, side, camera, width) {
  const held = piece.motionSupports.find((support) => support.side !== side);
  const pin = scenePoint(piece, held, { angle: 0, x: 0, y: 0 });
  const nominal = width <= 700 ? LOGO_SUSPENSION.compactSlipDegrees : LOGO_SUSPENSION.slipDegrees;
  const direction = side === "right" ? -1 : 1;
  // Reserve room for the underdamped catch's overshoot. A projection envelope
  // checks the rigid piece at its most displaced pose, including both corners.
  for (let degrees = nominal; degrees >= 1; degrees -= 0.5) {
    const angle = THREE.MathUtils.degToRad(degrees * 1.28) * direction;
    const pose = constrainedPose(piece, held, pin, angle);
    let fits = true;
    for (const x of [piece.bounds.min.x, piece.bounds.max.x]) {
      for (const y of [piece.bounds.min.y, piece.bounds.max.y]) {
        for (const z of [piece.bounds.min.z, piece.bounds.max.z]) {
          const point = rotatedPoint(new THREE.Vector3(x, y, z), angle)
            .add(piece.nominalPosition).add(new THREE.Vector3(pose.x, pose.y, 0));
          piece.group.parent.localToWorld(point);
          point.project(camera);
          if (point.x < -0.95 || point.x > 0.95 || point.y < -0.95 || point.y > 0.95) fits = false;
        }
      }
    }
    if (fits) return THREE.MathUtils.degToRad(degrees);
  }
  return 0;
}

export function configureLogoSuspension(rig, { camera, position = [0.5, 0, 0], width = 1920 }) {
  rig.root.position.set(...position);
  rig.root.updateMatrixWorld(true);
  const totalBounds = rig.pieces.reduce((box, piece) => box.union(
    piece.bounds.clone().translate(piece.nominalPosition)
  ), new THREE.Box3());
  const totalHeight = totalBounds.isEmpty() ? 1 : totalBounds.max.y - totalBounds.min.y;
  const totalDepth = totalBounds.isEmpty() ? 0 : totalBounds.max.z - totalBounds.min.z;
  const rear = new THREE.Vector3(0, 0, totalBounds.min.z - Math.max(0.003, totalDepth * 0.035));
  rig.scene.localToWorld(rear);
  rig.cableRearZ = rear.z;
  let greatestViewportTop = viewportAt(camera, position[2]).top;
  let raisedOffset = 0;
  let highestAttachment = -Infinity;
  rig.pieces.forEach((piece) => {
    // The logo's actual depth is well behind the root's z=0 plane. Evaluate
    // each corner at its own depth, including the initial lean, so the lowest
    // piece also begins completely beyond the browser's upper edge.
    for (const x of [piece.bounds.min.x, piece.bounds.max.x]) {
      for (const y of [piece.bounds.min.y, piece.bounds.max.y]) {
        for (const z of [piece.bounds.min.z, piece.bounds.max.z]) {
          const point = rotatedPoint(new THREE.Vector3(x, y, z), THREE.MathUtils.degToRad(-0.24))
            .add(piece.nominalPosition);
          piece.group.parent.localToWorld(point);
          const top = viewportAt(camera, point.z).top;
          greatestViewportTop = Math.max(greatestViewportTop, top);
          raisedOffset = Math.max(raisedOffset, top - point.y + totalHeight * 0.06);
        }
      }
    }
    piece.motionSupports.forEach((support) => {
      highestAttachment = Math.max(highestAttachment, worldPoint(piece, support, { angle: 0, x: 0, y: 0 }).y);
    });
  });
  rig.raisedOffset = raisedOffset;
  const ceilingY = Math.max(greatestViewportTop + totalHeight * 1.2,
    viewportAt(camera, rig.cableRearZ).top + totalHeight * 1.2,
    highestAttachment + raisedOffset + totalHeight * 0.2);
  rig.pieces.forEach((piece) => {
    [...piece.motionSupports, ...piece.supports].forEach((support) => {
      const nominalPoint = worldPoint(piece, support, { angle: 0, x: 0, y: 0 });
      const spread = piece.isMainName ? (support.side === "left" ? -0.025 : support.side === "right" ? 0.025 : 0) : 0;
      support.anchor.set(nominalPoint.x + piece.size.x * spread, ceilingY, rig.cableRearZ);
      support.nominalLength = support.anchor.distanceTo(nominalPoint);
      if (!rig.configured) support.targetLength = support.nominalLength;
    });
    if (piece.isMainName) {
      piece.slipLimits.left = safeSlipLimit(piece, "left", camera, width);
      piece.slipLimits.right = safeSlipLimit(piece, "right", camera, width);
    }
  });
  const event = rig.activeSlip;
  if (event) {
    const piece = rig.pieces.find(({ id }) => id === event.pieceId);
    // Recompute the goal envelope on resize, retaining the current rigid pose,
    // velocity, pivot and event clock rather than resetting the sign.
    event.goalAngle = (event.side === "right" ? -1 : 1)
      * Math.min(Math.abs(event.goalAngle), piece.slipLimits[event.side]);
    event.heldLength = event.held.anchor.distanceTo(piece.group.parent.localToWorld(event.pin.clone()));
    event.initialLength = event.released.anchor.distanceTo(worldPoint(piece, event.released,
      constrainedPose(piece, event.held, event.pin, event.initialAngle)));
    event.goalLength = event.released.anchor.distanceTo(worldPoint(piece, event.released,
      constrainedPose(piece, event.held, event.pin, event.goalAngle)));
    if (event.phase !== "recovery") {
      event.held.targetLength = event.heldLength;
      const progress = clamp01((rig.time - event.startedAt) / LOGO_SUSPENSION.release);
      event.released.targetLength = event.phase === "release"
        ? THREE.MathUtils.lerp(event.initialLength, event.goalLength, progress * progress)
        : event.goalLength;
    } else {
      const recoveryStart = LOGO_SUSPENSION.release + LOGO_SUSPENSION.catch + LOGO_SUSPENSION.hold;
      const reel = smooth((rig.time - event.startedAt - recoveryStart) / LOGO_SUSPENSION.recovery);
      const idle = idlePose(piece, rig.time);
      const pin = event.pin.clone().lerp(scenePoint(piece, event.held, idle), reel);
      const angle = THREE.MathUtils.lerp(event.goalAngle, idle.angle, reel);
      event.held.targetLength = event.held.anchor.distanceTo(piece.group.parent.localToWorld(pin.clone()));
      event.released.targetLength = event.released.anchor.distanceTo(worldPoint(piece, event.released,
        constrainedPose(piece, event.held, pin, angle)));
    }
  }
  rig.configured = true;
  updateLogoCables(rig);
}

function entrancePose(elapsed, raisedOffset) {
  const loweringTime = elapsed - LOGO_SUSPENSION.entrancePause;
  if (loweringTime <= 0) return { x: 0, y: raisedOffset, angle: THREE.MathUtils.degToRad(-0.24) };
  if (loweringTime < LOGO_SUSPENSION.descent) {
    const t = loweringTime / LOGO_SUSPENSION.descent;
    return { x: 0.0025 * Math.sin(Math.PI * t) * (1 - t),
      y: raisedOffset * (1 - smooth(t)), angle: THREE.MathUtils.degToRad(-0.24) * (1 - smooth(t)) };
  }
  const settleTime = loweringTime - LOGO_SUSPENSION.descent;
  if (settleTime >= LOGO_SUSPENSION.settling) return { x: 0, y: 0, angle: 0 };
  const t = settleTime / LOGO_SUSPENSION.settling;
  const decay = (1 - t) ** 2;
  return {
    x: 0.006 * Math.sin(Math.PI * 2.1 * t) * decay,
    y: -raisedOffset * 0.018 * Math.sin(Math.PI * 2.4 * t) * decay,
    angle: THREE.MathUtils.degToRad(0.34) * Math.sin(Math.PI * 2.2 * t) * decay,
  };
}

function startSlip(rig) {
  const choices = rig.pieces.filter((piece) => piece.isMainName)
    .flatMap((piece) => ["left", "right"].map((side) => ({ piece, side })))
    .filter(({ piece, side }) => piece.slipLimits[side] >= THREE.MathUtils.degToRad(4)
      && !(rig.previousEvent?.pieceId === piece.id && rig.previousEvent.side === side)
      && !(rig.recentEvents.length === 2 && rig.recentEvents.every((event) => event.pieceId === piece.id))
      && !(rig.recentEvents.length === 2 && rig.recentEvents.every((event) => event.side === side)));
  if (!choices.length) { rig.nextSlipTime = rig.time + LOGO_SUSPENSION.minimumInterval; return; }
  const { piece, side } = choices[Math.floor(random(rig) * choices.length)];
  const held = piece.motionSupports.find((support) => support.side !== side);
  const released = piece.motionSupports.find((support) => support.side === side);
  const pin = scenePoint(piece, held, piece.state);
  const goalAngle = (side === "right" ? -1 : 1)
    * piece.slipLimits[side] * (0.92 + random(rig) * 0.08);
  const goalPose = constrainedPose(piece, held, pin, goalAngle);
  rig.activeSlip = {
    pieceId: piece.id, side, phase: "release", startedAt: rig.time,
    pin, held, released, initialAngle: piece.state.angle, goalAngle,
    heldLength: held.length,
    initialLength: released.length,
    goalLength: released.anchor.distanceTo(worldPoint(piece, released, goalPose)),
  };
  held.targetLength = held.length;
}

function angleForLength(piece, event, pin, length) {
  let low = 0;
  let high = 1;
  const increasing = event.goalLength >= event.initialLength;
  for (let i = 0; i < 18; i += 1) {
    const mid = (low + high) / 2;
    const pose = constrainedPose(piece, event.held, pin,
      THREE.MathUtils.lerp(event.initialAngle, event.goalAngle, mid));
    const actual = event.released.anchor.distanceTo(worldPoint(piece, event.released, pose));
    if ((actual < length) === increasing) low = mid;
    else high = mid;
  }
  return THREE.MathUtils.lerp(event.initialAngle, event.goalAngle, (low + high) / 2);
}

function stepSlip(rig, piece, dt) {
  const event = rig.activeSlip;
  const elapsed = rig.time - event.startedAt;
  const catchEnd = LOGO_SUSPENSION.release + LOGO_SUSPENSION.catch;
  const recoveryStart = catchEnd + LOGO_SUSPENSION.hold;
  const idle = idlePose(piece, rig.time);
  let pin = event.pin;
  let angularTarget;
  let frequency = 11;
  let damping = 0.62;
  if (elapsed < LOGO_SUSPENSION.release) {
    event.phase = "release";
    const progress = clamp01(elapsed / LOGO_SUSPENSION.release);
    event.released.targetLength = THREE.MathUtils.lerp(event.initialLength, event.goalLength, progress * progress);
    angularTarget = angleForLength(piece, event, pin, event.released.targetLength);
    frequency = 16;
    damping = 0.32;
  } else if (elapsed < recoveryStart) {
    event.phase = elapsed < catchEnd ? "catch" : "hold";
    event.released.targetLength = event.goalLength;
    angularTarget = event.goalAngle;
    if (event.phase === "hold") { frequency = 8; damping = 0.95; }
  } else {
    event.phase = "recovery";
    const progress = clamp01((elapsed - recoveryStart) / LOGO_SUSPENSION.recovery);
    const reel = smooth(progress);
    const nominalPin = scenePoint(piece, event.held, idle);
    // Keep the catching side constrained during the drop, then gently return
    // that support to its moving nominal point as the winch reels the other in.
    pin = event.pin.clone().lerp(nominalPin, reel);
    angularTarget = THREE.MathUtils.lerp(event.goalAngle, idle.angle, reel);
    const targetPose = constrainedPose(piece, event.held, pin, angularTarget);
    event.released.targetLength = event.released.anchor.distanceTo(worldPoint(piece, event.released, targetPose));
    event.held.targetLength = event.held.anchor.distanceTo(piece.group.parent.localToWorld(pin.clone()));
    frequency = 4.5;
    damping = 1.02;
  }
  const state = piece.state;
  [state.angle, state.angularVelocity] = spring(state.angle, state.angularVelocity, angularTarget, frequency, damping, dt);
  const pose = constrainedPose(piece, event.held, pin, state.angle);
  state.xVelocity = (pose.x - state.x) / dt;
  state.yVelocity = (pose.y - state.y) / dt;
  state.x = pose.x;
  state.y = pose.y;
  if (elapsed >= eventDuration) {
    rig.previousEvent = { pieceId: event.pieceId, side: event.side, startedAt: event.startedAt, endedAt: rig.time };
    rig.recentEvents.push(rig.previousEvent);
    if (rig.recentEvents.length > 2) rig.recentEvents.shift();
    rig.activeSlip = null;
    rig.nextSlipTime = Math.max(rig.time + 3, event.startedAt + LOGO_SUSPENSION.minimumInterval
      + random(rig) * LOGO_SUSPENSION.intervalVariation);
  }
}

function stepIdle(rig, piece, dt) {
  const target = idlePose(piece, rig.time);
  const state = piece.state;
  [state.angle, state.angularVelocity] = spring(state.angle, state.angularVelocity, target.angle, 2.5, 0.78, dt);
  [state.x, state.xVelocity] = spring(state.x, state.xVelocity, target.x, 1.5, 0.94, dt);
  [state.y, state.yVelocity] = spring(state.y, state.yVelocity, target.y, 2, 0.86, dt);
  piece.motionSupports.forEach((support) => {
    support.targetLength = support.anchor.distanceTo(worldPoint(piece, support, target));
  });
}

function applyPose(rig, reducedMotion) {
  rig.pieces.forEach((piece) => {
    const state = piece.state;
    const entrance = reducedMotion ? { x: 0, y: 0, angle: 0 }
      : entrancePose(rig.time - piece.delay, rig.raisedOffset);
    piece.group.position.copy(piece.nominalPosition).add(new THREE.Vector3(
      reducedMotion ? 0 : state.x + entrance.x,
      reducedMotion ? 0 : state.y + entrance.y, 0
    ));
    piece.group.rotation.set(0, 0, reducedMotion ? 0 : state.angle + entrance.angle);
  });
  rig.root.updateMatrixWorld(true);
  updateLogoCables(rig);
}

export function advanceLogoSuspension(rig, delta, { reducedMotion = false } = {}) {
  if (!rig.configured) return;
  if (reducedMotion) {
    rig.wasReduced = true;
    rig.activeSlip = null;
    rig.pieces.forEach((piece) => {
      Object.keys(piece.state).forEach((key) => { piece.state[key] = 0; });
      piece.motionSupports.forEach((support) => { support.targetLength = support.nominalLength; });
    });
    applyPose(rig, true);
    return;
  }
  if (rig.wasReduced) {
    rig.wasReduced = false;
    rig.time = Math.max(rig.time, entranceDuration);
    rig.nextSlipTime = rig.time + LOGO_SUSPENSION.minimumInterval
      + random(rig) * LOGO_SUSPENSION.intervalVariation;
  }
  // Fixed bounded substeps keep damping and seeded events stable, including a
  // tab returning after being throttled. Wall-clock gaps cannot cause a fall.
  let remaining = Math.min(Math.max(delta, 0), 0.1);
  while (remaining > 1e-8) {
    const dt = Math.min(remaining, STEP);
    rig.time += dt;
    if (!rig.activeSlip && rig.time >= rig.nextSlipTime) startSlip(rig);
    rig.pieces.forEach((piece) => {
      if (rig.activeSlip?.pieceId === piece.id) stepSlip(rig, piece, dt);
      else stepIdle(rig, piece, dt);
    });
    remaining -= dt;
  }
  applyPose(rig, false);
}

export function updateLogoCables(rig) {
  rig.root.updateMatrixWorld(true);
  rig.pieces.forEach((piece) => piece.motionSupports.forEach((support) => {
    support.endpoint.copy(piece.group.localToWorld(support.attachment.clone()));
    support.length = support.anchor.distanceTo(support.endpoint);
  }));
  const buffer = rig.lines.geometry.attributes.position.array;
  let cursor = 0;
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  rig.pieces.forEach((piece) => piece.supports.forEach((support) => {
    support.endpoint.copy(piece.group.localToWorld(support.attachment.clone()));
    support.length = support.anchor.distanceTo(support.endpoint);
    support.slack = 0;
    support.paidOutLength = support.length;
    support.tension = 1;
    // The line object belongs to the fixed rig, not to any moving sign. Convert
    // exactly two world endpoints to its local space for Three's model matrix.
    start.copy(support.anchor);
    end.copy(support.endpoint);
    rig.lines.worldToLocal(start);
    rig.lines.worldToLocal(end);
    for (const vertex of [start, end]) {
      buffer[cursor++] = vertex.x;
      buffer[cursor++] = vertex.y;
      buffer[cursor++] = vertex.z;
    }
  }));
  rig.lines.geometry.attributes.position.needsUpdate = true;
}

export function disposeLogoSuspension(rig) {
  rig.lines.geometry.dispose();
  rig.lines.material.dispose();
}
