import * as THREE from "three";
import {
  HOME_MOONLIGHT_FALLBACK,
  advanceLogoMoonlight,
  applyLogoMoonlightMaterial,
  createLogoMoonlight,
  disposeLogoMoonlight,
} from "./logoMoonlight";

function suspendedPieces({ filled = true } = {}) {
  const root = new THREE.Group();
  const pieces = ["ibrahim", "karim", "ibrahimPronunciation", "karimPronunciation"]
    .map((id, index) => {
      const group = new THREE.Group();
      group.position.set(0.03 * index, 0.25 - index * 0.1, -0.3);
      root.add(group);
      const size = new THREE.Vector3(index < 2 ? 0.7 : 0.3, index < 2 ? 0.12 : 0.035, 0.025);
      const darkMaterial = new THREE.MeshStandardMaterial({ color: "#14090D" });
      darkMaterial.name = "Material.003";
      const dark = new THREE.Mesh(new THREE.BoxGeometry(size.x, 0.008, size.y), darkMaterial);
      dark.rotation.x = Math.PI / 2;
      group.add(dark);
      if (filled) {
        [["Material.004", -0.39, 0.065], ["Material.007", 0.37, 0.15]]
          .forEach(([name, xRatio, widthRatio]) => {
            const material = new THREE.MeshStandardMaterial({ color: "#FF3131" });
            material.name = name;
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(
              size.x * widthRatio, 0.008, size.y * 0.85
            ), material);
            mesh.rotation.x = Math.PI / 2;
            mesh.position.x = size.x * xRatio;
            group.add(mesh);
          });
      }
      return { id, group, size, bounds: new THREE.Box3(
        size.clone().multiplyScalar(-0.5), size.clone().multiplyScalar(0.5)
      ) };
    });
  return { root, pieces };
}

test("moonlight halos follow each suspended piece without adding lights or moving artwork", () => {
  const rig = suspendedPieces();
  const originalTransforms = rig.pieces.map(({ group }) => ({
    position: group.position.clone(), rotation: group.quaternion.clone(), scale: group.scale.clone(),
  }));
  const effect = createLogoMoonlight(rig, "#FF3131");
  expect(effect.halos).toHaveLength(8);
  expect(effect.uniforms.homeMoonlightColor.value.getHexString()).toBe("ff3131");
  effect.halos.forEach((halo, index) => {
    const pieceIndex = Math.floor(index / 2);
    const piece = rig.pieces[pieceIndex];
    expect(halo.isSprite).toBe(true);
    expect(halo.parent).toBe(piece.group);
    expect(halo.position.z).toBeLessThan(piece.bounds.min.z);
    expect(halo.material.blending).toBe(THREE.AdditiveBlending);
    expect(halo.material.depthWrite).toBe(false);
    expect(halo.material.depthTest).toBe(true);
    expect(halo.material.toneMapped).toBe(false);
    expect(halo.scale.x).toBeLessThan(piece.size.x);
    expect(halo.scale.y).toBeGreaterThan(piece.size.y);
    expect(halo.scale.x).toBe(halo.scale.y);
    expect(Math.abs(halo.position.x)).toBeGreaterThan(piece.size.x * 0.3);
    // Mutating a piece once verifies both its separated lit regions follow it.
    if (index % 2 === 0) {
      expect(piece.group.position.equals(originalTransforms[pieceIndex].position)).toBe(true);
      expect(piece.group.quaternion.equals(originalTransforms[pieceIndex].rotation)).toBe(true);
      expect(piece.group.scale.equals(originalTransforms[pieceIndex].scale)).toBe(true);
    }
    const attachment = halo.position.clone();
    piece.group.position.y -= 0.07;
    piece.group.rotation.z = 0.25;
    rig.root.updateMatrixWorld(true);
    expect(halo.getWorldPosition(new THREE.Vector3())
      .distanceTo(piece.group.localToWorld(attachment))).toBeLessThan(1e-7);
  });
  const lights = [];
  rig.root.traverse((object) => { if (object.isLight) lights.push(object); });
  expect(lights).toHaveLength(0);
  disposeLogoMoonlight(effect);
});

test("one feathered texture provides restrained moonlight with transparent edges", () => {
  const effect = createLogoMoonlight(suspendedPieces(), HOME_MOONLIGHT_FALLBACK);
  expect(effect.halos.every((halo) => halo.material.map === effect.texture)).toBe(true);
  const { data, width, height } = effect.texture.image;
  expect(width).toBe(64);
  expect(height).toBe(64);
  const alpha = (x, y) => data[(y * width + x) * 4 + 3];
  expect(alpha(31, 31)).toBeGreaterThan(200);
  expect(alpha(31, 31)).toBeLessThan(230);
  expect(alpha(24, 31)).toBeGreaterThan(alpha(16, 31));
  expect(alpha(16, 31)).toBeGreaterThan(alpha(1, 31));
  expect(alpha(0, 0)).toBe(0);
  expect(alpha(0, 31)).toBe(0);
  expect(alpha(63, 31)).toBe(0);
  // The smaller halo preserves the bright center and feathered edge.
  const halfRadiusAlpha = alpha(47, 31) / 255 * effect.halos[0].material.opacity;
  expect(halfRadiusAlpha).toBeGreaterThan(0.11);
  expect(halfRadiusAlpha).toBeLessThan(0.2);
  expect(effect.halos.slice(0, 4).every((halo) => halo.material.opacity <= 0.55)).toBe(true);
  expect(effect.halos.slice(4).every((halo) => halo.material.opacity <= 0.25)).toBe(true);
  disposeLogoMoonlight(effect);
});

test("outer halos have 25% less reach while the main neon core stays bright and pronunciation stays subordinate", () => {
  const effect = createLogoMoonlight(suspendedPieces(), HOME_MOONLIGHT_FALLBACK, { seed: 1821 });
  effect.sources.forEach(({ piece, region, halo, level }) => {
    const regionSize = region.getSize(new THREE.Vector3());
    const previousDiameter = Math.min(Math.max(regionSize.y * 3.2, regionSize.x * 1.8), piece.size.y * 3.6);
    expect(halo.scale.x).toBeCloseTo(previousDiameter * 0.75, 10);
    expect(halo.scale.y).toBe(halo.scale.x);
    const pronunciation = piece.id.endsWith("Pronunciation");
    expect(halo.userData.moonlightOpacity).toBe(pronunciation ? 0.24 : 0.5);
    expect(halo.material.opacity).toBeCloseTo((pronunciation ? 0.24 : 0.5) * level, 10);
  });
  expect(effect.uniforms.homeMoonlightLevel.value).toBe(0.97);
  expect(effect.uniforms.homeMoonlightColor.value.getHexString()).toBe("ff3131");
  disposeLogoMoonlight(effect);
});

test.each(["Material.004", "Material.007"])(
  "%s gets the same moonlight on every cap while preserving the source material and physical properties",
  (name) => {
    const original = new THREE.MeshStandardMaterial({
      color: "#C8A25A", emissive: "#000000", roughness: 0.17, metalness: 0.83,
      opacity: 0.84, transparent: true, side: THREE.DoubleSide,
    });
    original.name = name;
    const originalColor = original.color.clone();
    const localized = original.clone();
    const effect = createLogoMoonlight(suspendedPieces(), "#FF3131");
    applyLogoMoonlightMaterial(localized, effect);
    expect(localized.color.getHexString()).toBe("ff3131");
    expect(localized.emissive.getHexString()).toBe("ff3131");
    expect(localized.emissiveIntensity).toBeCloseTo(0.12);
    expect(original.color.equals(originalColor)).toBe(true);
    expect(original.emissive.getHexString()).toBe("000000");
    ["roughness", "metalness", "opacity", "transparent", "side"].forEach((property) => {
      expect(localized[property]).toBe(original[property]);
    });
    const shader = {
      uniforms: {}, vertexShader: THREE.ShaderLib.standard.vertexShader,
      fragmentShader: THREE.ShaderLib.standard.fragmentShader,
    };
    localized.onBeforeCompile(shader, {});
    expect(shader.uniforms.homeMoonlightColor).toBe(effect.uniforms.homeMoonlightColor);
    expect(shader.uniforms.homeMoonlightLevel).toBe(effect.uniforms.homeMoonlightLevel);
    // All filled caps, including the initial i and pronunciation, use the
    // same displayed hue after tone mapping. Lighting retains side depth.
    expect(shader.vertexShader).toContain("step(0.99, abs(normal.y))");
    expect(shader.vertexShader).not.toContain("position.x");
    const toneMapping = shader.fragmentShader.indexOf("#include <tonemapping_fragment>");
    const override = shader.fragmentShader.indexOf("gl_FragColor.rgb = homeMoonlightColor");
    const outputEncoding = shader.fragmentShader.indexOf("#include <colorspace_fragment>");
    expect(override).toBeGreaterThan(toneMapping);
    expect(override).toBeLessThan(outputEncoding);
    expect(shader.fragmentShader).toContain("homeMoonlightLevel");
    expect(localized.customProgramCacheKey()).not.toBe(original.customProgramCacheKey());
    localized.dispose();
    original.dispose();
    disposeLogoMoonlight(effect);
  }
);

test("each filled region starts with a different sign-lamp intensity", () => {
  const effect = createLogoMoonlight(suspendedPieces(), HOME_MOONLIGHT_FALLBACK, { seed: 1821 });
  expect(effect.sources).toHaveLength(effect.halos.length);
  expect(new Set(effect.sources.map((source) => source.baseLevel)).size).toBe(effect.sources.length);
  const levels = effect.sources.map((source) => source.baseLevel);
  expect(Math.min(...levels)).toBeGreaterThanOrEqual(0.76);
  expect(Math.max(...levels)).toBeLessThanOrEqual(1.04);
  expect(Math.max(...levels) - Math.min(...levels)).toBeGreaterThanOrEqual(0.2);
  effect.sources.forEach((source) => {
    expect(source.level).toBe(source.baseLevel);
    expect(source.halo.material.opacity).toBeCloseTo(source.halo.userData.moonlightOpacity * source.level);
  });
  disposeLogoMoonlight(effect);
});

test("the filled sign lettering and its halos use matching neon red", () => {
  const rig = suspendedPieces();
  const effect = createLogoMoonlight(rig, "#FF3131", { seed: 1821, glowColor: "#FF3131" });
  expect(effect.glowColor).toBeDefined();
  expect(effect.glowColor.getHexString()).toBe("ff3131");
  expect(effect.uniforms.homeMoonlightColor.value.getHexString()).toBe("ff3131");
  effect.halos.forEach((halo) => expect(halo.material.color.getHexString()).toBe("ff3131"));
  const original = rig.pieces[0].group.children.find((object) => object.material?.name === "Material.004");
  const localized = original.material.clone();
  applyLogoMoonlightMaterial(localized, effect, original);
  expect(localized.color.getHexString()).toBe("ff3131");
  expect(localized.emissive.getHexString()).toBe("ff3131");
  expect(original.material.emissive.getHexString()).toBe("000000");
  localized.dispose();
  disposeLogoMoonlight(effect);
});

test("irregular sign-lamp dips affect one source at a time and reproduce at different frame rates", () => {
  const slow = createLogoMoonlight(suspendedPieces(), HOME_MOONLIGHT_FALLBACK, { seed: 1821 });
  const fast = createLogoMoonlight(suspendedPieces(), HOME_MOONLIGHT_FALLBACK, { seed: 1821 });
  expect(slow.sources).toBeDefined();
  const events = [];
  const seen = new Set();
  let fullyOffSamples = 0;
  for (let frame = 0; frame < 3600; frame += 1) {
    advanceLogoMoonlight(slow, 1 / 30);
    for (let index = 0; index < 4; index += 1) advanceLogoMoonlight(fast, 1 / 120);
    expect(slow.uniforms.homeMoonlightLevel.value).toBe(0.97);
    let affected = 0;
    slow.sources.forEach((source, index) => {
      expect(source.level).toBeGreaterThanOrEqual(0);
      expect(source.level).toBeLessThanOrEqual(1.08);
      expect(fast.sources[index].level).toBeCloseTo(source.level, 8);
      expect(source.halo.material.opacity)
        .toBeCloseTo(source.halo.userData.moonlightOpacity * source.level, 9);
      if (Math.abs(source.level - source.baseLevel) > 0.025) affected += 1;
      if (source.level === 0) fullyOffSamples += 1;
    });
    expect(affected).toBeLessThanOrEqual(1);
    const event = slow.activeEvent;
    if (event && !seen.has(event.startedAt)) {
      events.push({ ...event });
      seen.add(event.startedAt);
    }
  }
  expect(events.length).toBeGreaterThan(12);
  expect(events.length).toBeLessThan(40);
  expect(new Set(events.map((event) => event.sourceIndex)).size).toBeGreaterThan(4);
  expect(new Set(events.map((event) => event.kind))).toEqual(new Set(["outage", "fade"]));
  expect(fullyOffSamples).toBeGreaterThan(50);
  const intervals = events.slice(1).map((event, index) => (
    event.startedAt - events[index].startedAt - events[index].duration
  ));
  intervals.forEach((interval) => {
    expect(interval).toBeGreaterThanOrEqual(3 - 1e-10);
    expect(interval).toBeLessThanOrEqual(6 + 1e-10);
  });
  expect(Math.max(...intervals) - Math.min(...intervals)).toBeGreaterThan(1);
  expect(events[0].startedAt).toBeGreaterThanOrEqual(3);
  expect(events[0].startedAt).toBeLessThanOrEqual(6);
  events.forEach((event, index) => {
    if (event.kind === "outage") {
      expect(event.outDuration).toBe(0.1);
      expect(event.holdDuration).toBeGreaterThanOrEqual(1);
      expect(event.holdDuration).toBeLessThanOrEqual(2);
      expect(event.returnDuration).toBeGreaterThanOrEqual(0.25);
      expect(event.returnDuration).toBeLessThanOrEqual(0.4);
      expect(event.duration).toBeCloseTo(event.outDuration + event.holdDuration + event.restartDuration + event.returnDuration);
    } else {
      expect(event.duration).toBeGreaterThanOrEqual(0.6);
      expect(event.duration).toBeLessThanOrEqual(1);
    }
    if (index) expect(event.sourceIndex).not.toBe(events[index - 1].sourceIndex);
  });
  disposeLogoMoonlight(slow);
  disposeLogoMoonlight(fast);
});

test("an old neon lamp flashes twice after its blackout before settling back on", () => {
  const effect = createLogoMoonlight(suspendedPieces(), HOME_MOONLIGHT_FALLBACK, { seed: 1821 });
  while (effect.activeEvent?.kind !== "outage" && effect.time < 60) {
    advanceLogoMoonlight(effect, 1 / 120);
  }
  expect(effect.activeEvent?.kind).toBe("outage");
  const event = { ...effect.activeEvent };
  const source = effect.sources[event.sourceIndex];
  const restartAt = event.startedAt + event.outDuration + event.holdDuration;
  let on = false;
  let completedFlashes = 0;
  for (let frame = 0; frame <= 180; frame += 1) {
    effect.time = restartAt + frame / 120;
    advanceLogoMoonlight(effect, 0);
    expect(source.halo.material.opacity).toBeCloseTo(source.halo.userData.moonlightOpacity * source.level, 9);
    if (!on && source.level > source.baseLevel * 0.2) on = true;
    else if (on && source.level < 0.01) {
      completedFlashes += 1;
      on = false;
    }
  }
  expect(completedFlashes).toBe(2);
  expect(source.level).toBeGreaterThan(source.baseLevel - 0.025);
  expect(effect.nextEventTime - event.startedAt - event.duration).toBeGreaterThanOrEqual(3);
  disposeLogoMoonlight(effect);
});

test("reduced motion keeps moonlight and halo steady and does not accumulate animation time", () => {
  const effect = createLogoMoonlight(suspendedPieces(), HOME_MOONLIGHT_FALLBACK);
  advanceLogoMoonlight(effect, 0.05);
  const previousTime = effect.time;
  const previousSeed = effect.seed;
  expect(effect.sources).toBeDefined();
  for (let index = 0; index < 60; index += 1) {
    advanceLogoMoonlight(effect, 1 / 30, { reducedMotion: true });
    expect(effect.uniforms.homeMoonlightLevel.value).toBe(0.97);
    expect(effect.time).toBe(previousTime);
    expect(effect.seed).toBe(previousSeed);
    expect(effect.activeEvent).toBeNull();
    effect.sources.forEach((source) => {
      expect(source.level).toBe(source.baseLevel);
      expect(source.halo.material.opacity)
        .toBeCloseTo(source.halo.userData.moonlightOpacity * source.baseLevel);
    });
  }
  disposeLogoMoonlight(effect);
});

test("two filled islands in one material use independent live shader levels without altering geometry", () => {
  const rig = suspendedPieces();
  const piece = rig.pieces[0];
  piece.group.children.filter((child) => ["Material.004", "Material.007"].includes(child.material?.name))
    .forEach((child) => piece.group.remove(child));
  const positions = [];
  [[-0.295, -0.25], [0.22, 0.3]].forEach(([left, right]) => {
    positions.push(left, 0, -0.045, right, 0, -0.045, right, 0, 0.045,
      left, 0, -0.045, right, 0, 0.045, left, 0, 0.045);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(
    positions.flatMap((_, index) => index % 3 === 0 ? [0, 1, 0] : []), 3
  ));
  const material = new THREE.MeshStandardMaterial();
  material.name = "Material.004";
  const object = new THREE.Mesh(geometry, material);
  object.rotation.x = Math.PI / 2;
  object.position.set(0.012, 0.02, 0);
  piece.group.add(object);
  const originalVertices = geometry.attributes.position.array.slice();
  const effect = createLogoMoonlight(rig, HOME_MOONLIGHT_FALLBACK, { seed: 1821 });
  const localized = material.clone();
  applyLogoMoonlightMaterial(localized, effect, object);
  const shader = {
    uniforms: {}, vertexShader: THREE.ShaderLib.standard.vertexShader,
    fragmentShader: THREE.ShaderLib.standard.fragmentShader,
  };
  localized.onBeforeCompile(shader, {});
  expect(shader.uniforms.homeMoonlightSourceLevels).toBeDefined();
  expect(shader.uniforms.homeMoonlightRegionBounds.value).toHaveLength(2);
  shader.uniforms.homeMoonlightToPiece.value.elements.forEach((element, index) => {
    expect(element).toBeCloseTo(object.matrix.elements[index], 12);
  });
  const sources = effect.sources.filter((source) => source.piece === piece);
  expect(sources).toHaveLength(2);
  expect(shader.uniforms.homeMoonlightSourceLevels.value[0])
    .not.toBe(shader.uniforms.homeMoonlightSourceLevels.value[1]);
  advanceLogoMoonlight(effect, 0.08);
  sources.forEach((source, index) => {
    expect(shader.uniforms.homeMoonlightSourceLevels.value[index]).toBeCloseTo(source.level, 6);
  });
  const boundsBefore = shader.uniforms.homeMoonlightRegionBounds.value.map((value) => value.clone());
  const matrixBefore = shader.uniforms.homeMoonlightToPiece.value.clone();
  piece.group.position.y -= 0.1;
  piece.group.rotation.z = 0.25;
  rig.root.updateMatrixWorld(true);
  advanceLogoMoonlight(effect, 0.08);
  expect(shader.uniforms.homeMoonlightToPiece.value.equals(matrixBefore)).toBe(true);
  shader.uniforms.homeMoonlightRegionBounds.value.forEach((value, index) => {
    expect(value.equals(boundsBefore[index])).toBe(true);
  });
  expect(shader.fragmentShader).toContain("homeMoonlightLevelAtFace");
  expect(shader.vertexShader).toContain("homeMoonlightSourceLevels[0]");
  expect(shader.vertexShader).toContain("homeMoonlightSourceLevels[1]");
  // These cap vertices sit beyond the triangle-derived measurement ranges,
  // as some real GLB border vertices do. Execute the emitted GLSL selection
  // block as equivalent scalar JavaScript to verify they inherit the nearest
  // live lamp rather than falling back to the global brightness.
  const selectionStart = shader.vertexShader.indexOf("float homeMoonlightNearestDistance");
  expect(selectionStart).toBeGreaterThanOrEqual(0);
  const selection = shader.vertexShader.slice(selectionStart).split("#include")[0]
    .replace(/\bfloat\b/g, "let").replace(/\bmax\(/g, "Math.max(");
  const selectLevel = new Function("homeMoonlightLocalX", "homeMoonlightRegionBounds", "homeMoonlightSourceLevels",
    `let homeMoonlightLevelAtFace = 0.97;\n${selection}\nreturn homeMoonlightLevelAtFace;`);
  const regionBounds = shader.uniforms.homeMoonlightRegionBounds.value;
  const sourceLevels = shader.uniforms.homeMoonlightSourceLevels.value;
  expect(selectLevel(regionBounds[0].x - 0.025, regionBounds, sourceLevels)).toBe(sourceLevels[0]);
  expect(selectLevel(regionBounds[1].y + 0.025, regionBounds, sourceLevels)).toBe(sourceLevels[1]);
  expect(geometry.attributes.position.array).toEqual(originalVertices);
  expect(material.color.getHexString()).toBe("ffffff");
  localized.dispose();
  disposeLogoMoonlight(effect);
});

test("disposing moonlight removes and releases only its own resources", () => {
  const rig = suspendedPieces();
  const originalMaterial = new THREE.MeshStandardMaterial();
  const originalGeometry = new THREE.BoxGeometry();
  const originalMesh = new THREE.Mesh(originalGeometry, originalMaterial);
  rig.pieces[0].group.add(originalMesh);
  const materialDispose = jest.spyOn(originalMaterial, "dispose");
  const geometryDispose = jest.spyOn(originalGeometry, "dispose");
  const effect = createLogoMoonlight(rig, HOME_MOONLIGHT_FALLBACK);
  const textureDispose = jest.spyOn(effect.texture, "dispose");
  const haloDisposals = effect.halos.map((halo) => jest.spyOn(halo.material, "dispose"));
  disposeLogoMoonlight(effect);
  expect(effect.halos.every((halo) => halo.parent === null)).toBe(true);
  haloDisposals.forEach((dispose) => expect(dispose).toHaveBeenCalledTimes(1));
  expect(textureDispose).toHaveBeenCalledTimes(1);
  expect(materialDispose).not.toHaveBeenCalled();
  expect(geometryDispose).not.toHaveBeenCalled();
  expect(originalMesh.parent).toBe(rig.pieces[0].group);
  const disposedTime = effect.time;
  const disposedLevels = effect.sources.map((source) => source.level);
  advanceLogoMoonlight(effect, 0.1);
  disposeLogoMoonlight(effect);
  expect(effect.time).toBe(disposedTime);
  expect(effect.sources.map((source) => source.level)).toEqual(disposedLevels);
  expect(effect.activeEvent).toBeNull();
  expect(effect.nextEventTime).toBe(Infinity);
  expect(textureDispose).toHaveBeenCalledTimes(1);
  haloDisposals.forEach((dispose) => expect(dispose).toHaveBeenCalledTimes(1));
  originalGeometry.dispose();
  originalMaterial.dispose();
});

test("hollow and red materials produce no glow without a filled moonlit region", () => {
  const rig = suspendedPieces({ filled: false });
  const red = new THREE.MeshStandardMaterial({ color: "#6A1E2D" });
  red.name = "Material.001";
  rig.pieces.forEach((piece) => piece.group.add(new THREE.Mesh(
    new THREE.BoxGeometry(piece.size.x, 0.008, piece.size.y), red
  )));
  const effect = createLogoMoonlight(rig, HOME_MOONLIGHT_FALLBACK);
  expect(effect.halos).toHaveLength(0);
  disposeLogoMoonlight(effect);
});

test.each(["Material.001", "Material.003"])(
  "%s remains unchanged even if accidentally passed to the moonlight material override",
  (name) => {
    const material = new THREE.MeshStandardMaterial({
      color: name === "Material.003" ? "#14090D" : "#6A1E2D", emissive: "#000000",
    });
    material.name = name;
    const color = material.color.clone();
    const emissive = material.emissive.clone();
    const compile = material.onBeforeCompile;
    const programKey = material.customProgramCacheKey;
    const intensity = material.emissiveIntensity;
    const effect = createLogoMoonlight(suspendedPieces(), HOME_MOONLIGHT_FALLBACK);
    applyLogoMoonlightMaterial(material, effect);
    expect(material.color.equals(color)).toBe(true);
    expect(material.emissive.equals(emissive)).toBe(true);
    expect(material.emissiveIntensity).toBe(intensity);
    expect(material.onBeforeCompile).toBe(compile);
    expect(material.customProgramCacheKey).toBe(programKey);
    disposeLogoMoonlight(effect);
    material.dispose();
  }
);

test("halo measurement transforms filled geometry into its wrapper space without modifying source vertices", () => {
  const rig = suspendedPieces();
  const piece = rig.pieces[0];
  const mesh = piece.group.children.find((child) => child.material?.name === "Material.004");
  const sourceVertices = mesh.geometry.attributes.position.array.slice();
  const originalPosition = mesh.position.clone();
  const originalRotation = mesh.quaternion.clone();
  const authored = new THREE.Group();
  authored.position.set(0.025, 0.03, -0.002);
  piece.group.add(authored);
  authored.add(mesh);
  const effect = createLogoMoonlight(rig, HOME_MOONLIGHT_FALLBACK);
  const halo = effect.halos.find((candidate) => candidate.parent === piece.group && candidate.position.x < 0);
  expect(halo.position.x).toBeCloseTo(originalPosition.x + authored.position.x, 5);
  expect(halo.position.y).toBeCloseTo(authored.position.y, 5);
  expect(mesh.geometry.attributes.position.array).toEqual(sourceVertices);
  expect(mesh.position.equals(originalPosition)).toBe(true);
  expect(mesh.quaternion.equals(originalRotation)).toBe(true);
  expect(mesh.parent).toBe(authored);
  disposeLogoMoonlight(effect);
});


test("halo effects own an identical shared-within-effect quad and release its renderer listeners independently", () => {
  const standard = new THREE.Sprite().geometry;
  const first = createLogoMoonlight(suspendedPieces(), "#FF3131");
  const second = createLogoMoonlight(suspendedPieces(), "#FF3131");
  const firstQuad = first.halos[0].geometry, secondQuad = second.halos[0].geometry;
  expect(firstQuad).not.toBe(standard);
  expect(secondQuad).not.toBe(firstQuad);
  expect(first.halos.every((halo) => halo.geometry === firstQuad)).toBe(true);
  expect(Array.from(firstQuad.attributes.position.data.array)).toEqual(Array.from(standard.attributes.position.data.array));
  expect(Array.from(firstQuad.index.array)).toEqual(Array.from(standard.index.array));
  const releaseBackend = jest.fn(() => firstQuad.removeEventListener("dispose", releaseBackend));
  firstQuad.addEventListener("dispose", releaseBackend);
  const disposeFirst = jest.spyOn(firstQuad, "dispose"), disposeSecond = jest.spyOn(secondQuad, "dispose"), disposeStandard = jest.spyOn(standard, "dispose");
  disposeLogoMoonlight(first);disposeLogoMoonlight(first);
  expect(disposeFirst).toHaveBeenCalledTimes(1);
  expect(releaseBackend).toHaveBeenCalledTimes(1);
  expect(firstQuad.hasEventListener("dispose", releaseBackend)).toBe(false);
  expect(disposeSecond).not.toHaveBeenCalled();
  expect(disposeStandard).not.toHaveBeenCalled();
  disposeLogoMoonlight(second);
  disposeStandard.mockRestore();
});
