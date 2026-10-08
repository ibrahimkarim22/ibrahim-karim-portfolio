import * as THREE from "three";

export const HOME_MOONLIGHT_FALLBACK = "#FF3131";
export const HOME_LOGO_GLOW_FALLBACK = "#FF3131";
const FILLED_MATERIAL_NAMES = new Set(["Material.004", "Material.007"]);
const OUTER_HALO_SIZE = 0.75;
const MAIN_HALO_OPACITY = 0.5;
const PRONUNCIATION_HALO_OPACITY = 0.24;

function filledRegions(piece, materialNames = FILLED_MATERIAL_NAMES) {
  // Default regions belong to the immutable source analysis. Return fresh boxes:
  // callers and each moonlight effect may own/mutate their runtime region data.
  if (materialNames === FILLED_MATERIAL_NAMES && piece.filledRegionBounds) {
    return piece.filledRegionBounds.map(({ min, max }) => new THREE.Box3(
      new THREE.Vector3().fromArray(min), new THREE.Vector3().fromArray(max)
    ));
  }
  piece.group.updateWorldMatrix(true, true);
  const inverse = piece.group.matrixWorld.clone().invert();
  const intervals = [];
  piece.group.traverse((mesh) => {
    if (!mesh.isMesh || !mesh.visible || !mesh.geometry?.attributes.position) return;
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const index = geometry.index;
    const count = index?.count ?? position.count;
    const ranges = Array.isArray(mesh.material)
      ? geometry.groups.filter((group) => materialNames.has(mesh.material[group.materialIndex]?.name))
      : materialNames.has(mesh.material?.name) ? [{ start: 0, count }] : [];
    const transform = inverse.clone().multiply(mesh.matrixWorld);
    ranges.forEach((range) => {
      const end = Math.min(count, range.start + range.count);
      for (let start = range.start; start + 2 < end; start += 3) {
        const vertices = [0, 1, 2].map((offset) => index ? index.getX(start + offset) : start + offset);
        // Measure the same actual filled caps as the moonlight shader. Side
        // triangles and the hollow/red materials never create glow regions.
        if (normal && vertices.some((vertex) => Math.abs(normal.getY(vertex)) < 0.99)) continue;
        const bounds = new THREE.Box3();
        vertices.forEach((vertex) => bounds.expandByPoint(
          new THREE.Vector3().fromBufferAttribute(position, vertex).applyMatrix4(transform)
        ));
        intervals.push(bounds);
      }
    });
  });
  intervals.sort((left, right) => left.min.x - right.min.x);
  const gap = Math.max(piece.size.y * 0.1, piece.size.x * 0.008);
  const regions = [];
  intervals.forEach((interval) => {
    const previous = regions[regions.length - 1];
    if (!previous || interval.min.x > previous.max.x + gap) regions.push(interval.clone());
    else previous.union(interval);
  });
  return regions;
}

// Read-only mesh regions also locate suspension attachments on filled letters.
export { filledRegions as getLogoFilledRegions };

function moonlightTexture() {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  const center = (size - 1) / 2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const radius = Math.hypot(x - center, y - center) / center;
      const feather = Math.max(0, 1 - radius);
      const offset = (y * size + x) * 4;
      data[offset] = 255;
      data[offset + 1] = 255;
      data[offset + 2] = 255;
      data[offset + 3] = Math.round(255 * 0.85 * Math.pow(feather, 1.35));
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function random(effect) {
  effect.seed = (Math.imul(1664525, effect.seed) + 1013904223) >>> 0;
  return effect.seed / 4294967296;
}

function eventInterval(effect) {
  return 3 + random(effect) * 3;
}

export function createLogoMoonlight(rig, color = HOME_MOONLIGHT_FALLBACK, {
  seed, glowColor = HOME_LOGO_GLOW_FALLBACK,
} = {}) {
  const uniforms = {
    homeMoonlightColor: { value: new THREE.Color(color) },
    homeMoonlightLevel: { value: 0.97 },
  };
  const texture = moonlightTexture();
  const effect = {
    uniforms, texture, haloGeometry: null, glowColor: new THREE.Color(glowColor),
    halos: [], sources: [], pieceStates: new Map(), time: 0,
    seed: (seed ?? Math.floor(Math.random() * 4294967296)) >>> 0,
    activeEvent: null, nextEventTime: Infinity, lastSourceIndex: -1,
    wasReduced: false, disposed: false,
  };
  rig.pieces.forEach((piece) => {
    const regions = filledRegions(piece);
    const state = {
      levels: { value: new Float32Array(regions.length) },
      bounds: { value: regions.map((region) => new THREE.Vector2(region.min.x - 1e-5, region.max.x + 1e-5)) },
    };
    effect.pieceStates.set(piece.group, state);
    regions.forEach((region, index) => {
      const opacity = piece.id.endsWith("Pronunciation") ? PRONUNCIATION_HALO_OPACITY : MAIN_HALO_OPACITY;
      const material = new THREE.SpriteMaterial({
        color: effect.glowColor,
        map: texture,
        opacity,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
      });
      const halo = new THREE.Sprite(material);
      // Three keeps its default sprite quad globally. Own an identical tiny
      // quad so retired renderer callbacks can be released without touching
      // another live effect that uses the default geometry.
      if (!effect.haloGeometry) effect.haloGeometry = halo.geometry.clone();
      halo.geometry = effect.haloGeometry;
      halo.name = `Moonlight-${piece.id}-${index}`;
      region.getCenter(halo.position);
      halo.position.z = Math.min(piece.bounds.min.z, region.min.z) - 0.01;
      const size = region.getSize(new THREE.Vector3());
      // Tighten the broad halo rather than dimming the red tubing itself.
      // Smaller footprints also keep neighboring lamps from pooling into fog.
      const diameter = Math.min(Math.max(size.y * 3.2, size.x * 1.8), piece.size.y * 3.6) * OUTER_HALO_SIZE;
      halo.scale.set(diameter, diameter, 1);
      halo.userData.moonlightOpacity = opacity;
      // Attach to the same wrapper as the lettering: neither the authored
      // transforms nor the fly-system animation need another animation track.
      piece.group.add(halo);
      effect.halos.push(halo);
      effect.sources.push({ piece, region, halo, localIndex: index, state, baseLevel: 1, level: 1 });
    });
  });
  const baselines = effect.sources.map((_, index) => effect.sources.length === 1
    ? 0.9 : 0.76 + 0.28 * index / (effect.sources.length - 1));
  for (let index = baselines.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random(effect) * (index + 1));
    [baselines[index], baselines[target]] = [baselines[target], baselines[index]];
  }
  effect.sources.forEach((source, index) => {
    source.baseLevel = baselines[index];
    source.level = source.baseLevel;
    source.state.levels.value[source.localIndex] = source.level;
    source.halo.material.opacity = source.halo.userData.moonlightOpacity * source.level;
  });
  if (effect.sources.length) effect.nextEventTime = eventInterval(effect);
  return effect;
}

// Call only on localized clones. The displayed hue is applied after tone
// mapping, then encoded normally with the rest of the Three.js scene. This
// keeps very strong imported lights from washing the moonlight back to white.
export function applyLogoMoonlightMaterial(material, effect, object = null) {
  if (!FILLED_MATERIAL_NAMES.has(material.name)) return;
  let wrapper = object;
  while (wrapper && !effect.pieceStates.has(wrapper)) wrapper = wrapper.parent;
  const state = effect.pieceStates.get(wrapper);
  const sourceCount = state?.levels.value.length ?? 0;
  let toPiece;
  if (sourceCount && object) {
    wrapper.updateWorldMatrix(true, true);
    toPiece = new THREE.Matrix4().copy(wrapper.matrixWorld).invert().multiply(object.matrixWorld);
  }
  material.color.copy(effect.uniforms.homeMoonlightColor.value);
  material.emissive.copy(effect.glowColor);
  material.emissiveIntensity = 0.12;
  const originalCompile = material.onBeforeCompile;
  const originalProgramKey = material.customProgramCacheKey();
  material.onBeforeCompile = function (shader, renderer) {
    originalCompile.call(this, shader, renderer);
    shader.uniforms.homeMoonlightColor = effect.uniforms.homeMoonlightColor;
    shader.uniforms.homeMoonlightLevel = effect.uniforms.homeMoonlightLevel;
    let sourceDeclarations = "";
    let sourceAssignment = "";
    if (sourceCount) {
      shader.uniforms.homeMoonlightSourceLevels = state.levels;
      shader.uniforms.homeMoonlightRegionBounds = state.bounds;
      shader.uniforms.homeMoonlightToPiece = { value: toPiece };
      sourceDeclarations = `uniform mat4 homeMoonlightToPiece;
uniform vec2 homeMoonlightRegionBounds[${sourceCount}];
uniform float homeMoonlightSourceLevels[${sourceCount}];\n`;
      sourceAssignment = `
float homeMoonlightLocalX = (homeMoonlightToPiece * vec4(position, 1.0)).x;
float homeMoonlightNearestDistance = 1e20;`;
      for (let index = 0; index < sourceCount; index += 1) {
        sourceAssignment += `
float homeMoonlightDistance${index} = max(max(homeMoonlightRegionBounds[${index}].x - homeMoonlightLocalX, homeMoonlightLocalX - homeMoonlightRegionBounds[${index}].y), 0.0);
if (homeMoonlightDistance${index} < homeMoonlightNearestDistance) {
  homeMoonlightNearestDistance = homeMoonlightDistance${index};
  homeMoonlightLevelAtFace = homeMoonlightSourceLevels[${index}];
}`;
      }
    }
    shader.vertexShader = `uniform float homeMoonlightLevel;\nvarying float homeMoonlightFace;\nvarying float homeMoonlightLevelAtFace;\n${sourceDeclarations}${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>\nhomeMoonlightFace = step(0.99, abs(normal.y));\nhomeMoonlightLevelAtFace = homeMoonlightLevel;${sourceAssignment}`
    );
    shader.fragmentShader = `uniform vec3 homeMoonlightColor;\nvarying float homeMoonlightFace;\nvarying float homeMoonlightLevelAtFace;\n${shader.fragmentShader}`.replace(
      "#include <tonemapping_fragment>",
      `#include <tonemapping_fragment>
float homeMoonlightLuminance = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
gl_FragColor.rgb = homeMoonlightColor * homeMoonlightLevelAtFace * mix(clamp(homeMoonlightLuminance, 0.12, 0.6), 1.0, homeMoonlightFace);`
    );
  };
  material.customProgramCacheKey = () => `${originalProgramKey}:home-logo-moonlight-nearest-v2:${sourceCount}`;
  material.needsUpdate = true;
}

export function advanceLogoMoonlight(effect, delta, { reducedMotion = false } = {}) {
  if (effect.disposed) return;
  if (reducedMotion) {
    effect.wasReduced = true;
    effect.activeEvent = null;
  } else {
    if (effect.wasReduced) {
      effect.wasReduced = false;
      effect.nextEventTime = effect.sources.length ? effect.time + eventInterval(effect) : Infinity;
    }
    effect.time += Number.isFinite(delta) ? Math.min(Math.max(delta, 0), 0.1) : 0;
    if (effect.activeEvent && effect.time >= effect.activeEvent.startedAt + effect.activeEvent.duration) {
      effect.activeEvent = null;
    }
    if (effect.time >= effect.nextEventTime) {
      const choices = effect.sources.map((_, index) => index)
        .filter((index) => effect.sources.length === 1 || index !== effect.lastSourceIndex);
      const sourceIndex = choices[Math.floor(random(effect) * choices.length)];
      const kind = random(effect) < 0.46 ? "outage" : "fade";
      const startedAt = effect.nextEventTime;
      const event = { sourceIndex, kind, startedAt };
      if (kind === "outage") {
        event.outDuration = 0.1;
        event.holdDuration = 1 + random(effect);
        event.returnDuration = 0.25 + random(effect) * 0.15;
        event.restartPulses = [
          { duration: 0.14 + random(effect) * 0.06, gap: 0.08 + random(effect) * 0.04, peak: 0.55 + random(effect) * 0.15 },
          { duration: 0.18 + random(effect) * 0.06, gap: 0.08 + random(effect) * 0.04, peak: 0.8 + random(effect) * 0.15 },
        ];
        event.restartDuration = event.restartPulses.reduce((duration, pulse) => duration + pulse.duration + pulse.gap, 0);
        event.duration = event.outDuration + event.holdDuration + event.restartDuration + event.returnDuration;
      } else {
        event.duration = 0.6 + random(effect) * 0.4;
        event.minimum = 0.35 + random(effect) * 0.2;
      }
      effect.activeEvent = event;
      effect.lastSourceIndex = sourceIndex;
      // The quiet interval starts after this lamp has fully recovered.
      effect.nextEventTime = startedAt + event.duration + eventInterval(effect);
    }
  }
  effect.sources.forEach((source, index) => {
    let level = source.baseLevel;
    if (!reducedMotion) {
      level += 0.014 * Math.sin(effect.time * (0.45 + index * 0.035) + index * 1.7)
        + 0.006 * Math.sin(effect.time * 0.21 + index * 2.3);
      const event = effect.activeEvent;
      if (event?.sourceIndex === index) {
        const elapsed = effect.time - event.startedAt;
        if (event.kind === "outage") {
          const ease = (value) => {
            const progress = Math.min(1, Math.max(0, value));
            return progress * progress * (3 - 2 * progress);
          };
          if (elapsed < event.outDuration) level *= 1 - ease(elapsed / event.outDuration);
          else if (elapsed < event.outDuration + event.holdDuration) level = 0;
          else if (elapsed < event.outDuration + event.holdDuration + event.restartDuration) {
            let remaining = elapsed - event.outDuration - event.holdDuration;
            let restartLevel = 0;
            for (const pulse of event.restartPulses) {
              if (remaining < pulse.duration) {
                restartLevel = pulse.peak * Math.sin(Math.PI * remaining / pulse.duration) ** 2;
                break;
              }
              remaining -= pulse.duration;
              if (remaining < pulse.gap) break;
              remaining -= pulse.gap;
            }
            level *= restartLevel;
          } else {
            level *= ease((elapsed - event.outDuration - event.holdDuration - event.restartDuration) / event.returnDuration);
          }
        } else {
          const progress = Math.min(1, Math.max(0, elapsed / event.duration));
          const dip = Math.sin(Math.PI * progress) ** 2;
          level = THREE.MathUtils.lerp(level, event.minimum, dip);
        }
      }
    }
    source.level = level;
    source.state.levels.value[source.localIndex] = level;
    source.halo.material.opacity = source.halo.userData.moonlightOpacity * level;
  });
}

export function disposeLogoMoonlight(effect) {
  if (effect.disposed) return;
  effect.disposed = true;
  effect.activeEvent = null;
  effect.nextEventTime = Infinity;
  effect.halos.forEach((halo) => {
    halo.removeFromParent();
    halo.material.dispose();
  });
  effect.haloGeometry?.dispose();
  effect.texture.dispose();
  effect.pieceStates.clear();
}
