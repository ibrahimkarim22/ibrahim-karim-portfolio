import { Suspense, useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, PerspectiveCamera } from "@react-three/drei";
import logo from "../models/logo.glb";
import {
  advanceLogoSuspension,
  configureLogoSuspension,
  createLogoSuspension,
  disposeLogoSuspension,
  setLogoCameraViewport,
} from "./home/logoSuspension";
import {
  HOME_MOONLIGHT_FALLBACK,
  HOME_LOGO_GLOW_FALLBACK,
  advanceLogoMoonlight,
  applyLogoMoonlightMaterial,
  createLogoMoonlight,
  disposeLogoMoonlight,
} from "./home/logoMoonlight";
import "../SCSS/App.scss";

const HOME_LOGO_RED_SHELL_COLOR = "#6A1E2D";
const HOME_LOGO_HOLLOW_DEPTH_COLOR = "#14090D";
const HOME_LOGO_MOON_MATERIALS = new Set(["Material.004", "Material.007"]);
const HOME_LOGO_DIRECTIONAL_LIGHT_NAMES = new Set(["Sun", "Sun.001"]);
const HOME_LOGO_DIRECTIONAL_LIGHT_COLOR = "#F2E2C4";

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return undefined;
    const updatePreference = (event) => setReducedMotion(event.matches);
    query.addEventListener?.("change", updatePreference);
    return () => query.removeEventListener?.("change", updatePreference);
  }, []);
  return reducedMotion;
}

function BackgroundColor({ cssVariable, fallback }) {
  const { scene } = useThree();
  useEffect(() => {
    const sharedColor = getComputedStyle(document.documentElement).getPropertyValue(cssVariable).trim();
    scene.background = new THREE.Color(sharedColor || fallback);
  }, [scene, cssVariable, fallback]);
  return null;
}

function useLogoViewport() {
  const slot = useRef();
  const [viewport, setViewport] = useState({ width: 600, height: 300, topExtension: 0, bottomExtension: 0 });
  useLayoutEffect(() => {
    const element = slot.current;
    if (!element) return undefined;
    const stage = element.closest(".home-center-view");
    const measure = () => {
      const rect = element.getBoundingClientRect();
      const stageRect = stage?.getBoundingClientRect();
      const next = {
        width: rect.width || element.clientWidth || 600,
        height: rect.height || element.clientHeight || 300,
        topExtension: Math.max(0, rect.top),
        bottomExtension: stageRect
          ? Math.max(0, Math.min(stageRect.bottom, window.innerHeight) - rect.bottom) : 0,
      };
      setViewport((current) => Object.keys(next).every((key) => current[key] === next[key]) ? current : next);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    if (stage) observer?.observe(stage);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);
  return { slot, viewport };
}

function LogoCamera({ position, viewport }) {
  const camera = useRef();
  useLayoutEffect(() => {
    if (camera.current) setLogoCameraViewport(camera.current, viewport);
  }, [viewport]);
  return <PerspectiveCamera ref={camera} manual makeDefault position={position}
    fov={30} aspect={viewport.width / viewport.height} />;
}

function LogoInit({ path, cameraPosition, viewport, width, onReady, reducedMotion }) {
  const { scene: sourceScene } = useGLTF(path, true);
  const rig = useMemo(() => createLogoSuspension(sourceScene), [sourceScene]);
  const moonlightRef = useRef(null);
  const [cameraX, cameraY, cameraZ] = cameraPosition;
  const layoutCamera = useMemo(() => {
    const camera = new THREE.PerspectiveCamera(30, viewport.width / viewport.height);
    camera.position.set(cameraX, cameraY, cameraZ);
    setLogoCameraViewport(camera, viewport);
    camera.updateMatrixWorld(true);
    return camera;
  }, [cameraX, cameraY, cameraZ, viewport]);

  useLayoutEffect(() => {
    configureLogoSuspension(rig, { camera: layoutCamera, position: [0.5, 0, 0], width });
    advanceLogoSuspension(rig, 0, { reducedMotion });
  }, [rig, layoutCamera, width, reducedMotion]);

  useEffect(() => { onReady(); }, [rig, onReady]);

  useEffect(() => {
    const originalAssignments = [];
    const localizedMaterials = new Map();
    const homeColors = getComputedStyle(document.documentElement);
    const sharedMoonlight = homeColors.getPropertyValue("--home-logo-moonlight").trim();
    const sharedGlow = homeColors.getPropertyValue("--home-logo-glow").trim();
    const moonlight = createLogoMoonlight(rig, new THREE.Color(sharedMoonlight || HOME_MOONLIGHT_FALLBACK), {
      glowColor: sharedGlow || HOME_LOGO_GLOW_FALLBACK,
    });
    moonlightRef.current = moonlight;
    const localizeMaterial = (material, object) => {
      const isShell = material.name === "Material.001";
      const isHollow = material.name === "Material.003";
      if (!isShell && !isHollow && !HOME_LOGO_MOON_MATERIALS.has(material.name)) return material;
      // Filled faces bind to the lamp regions of their own word. Shared GLB
      // materials must not make separate letter groups flicker together.
      const key = HOME_LOGO_MOON_MATERIALS.has(material.name) ? `${material.uuid}/${object.uuid}` : material.uuid;
      if (!localizedMaterials.has(key)) {
        const localizedMaterial = material.clone();
        if (isShell) localizedMaterial.color.set(HOME_LOGO_RED_SHELL_COLOR);
        else if (isHollow) localizedMaterial.color.set(HOME_LOGO_HOLLOW_DEPTH_COLOR);
        else applyLogoMoonlightMaterial(localizedMaterial, moonlight, object);
        localizedMaterial.needsUpdate = true;
        localizedMaterials.set(key, localizedMaterial);
      }
      return localizedMaterials.get(key);
    };
    rig.scene.traverse((object) => {
      if (!object.isMesh || !object.material) return;
      const originalMaterial = object.material;
      const localizedMaterial = Array.isArray(originalMaterial)
        ? originalMaterial.map((material) => localizeMaterial(material, object)) : localizeMaterial(originalMaterial, object);
      if (localizedMaterial === originalMaterial
        || (Array.isArray(originalMaterial) && localizedMaterial.every((material, index) => material === originalMaterial[index]))) return;
      originalAssignments.push([object, originalMaterial]);
      object.material = localizedMaterial;
    });
    return () => {
      originalAssignments.forEach(([object, material]) => { object.material = material; });
      localizedMaterials.forEach((material) => material.dispose());
      disposeLogoMoonlight(moonlight);
      if (moonlightRef.current === moonlight) moonlightRef.current = null;
    };
  }, [rig]);

  useEffect(() => {
    const originalLightColors = [];
    rig.scene.traverse((object) => {
      const authoredName = object.userData?.name ?? object.name;
      if (!object.isDirectionalLight || !HOME_LOGO_DIRECTIONAL_LIGHT_NAMES.has(authoredName)) return;
      originalLightColors.push([object, object.color.clone()]);
      object.color.set(HOME_LOGO_DIRECTIONAL_LIGHT_COLOR);
    });
    return () => {
      originalLightColors.forEach(([light, color]) => { light.color.copy(color); });
    };
  }, [rig]);

  useEffect(() => () => disposeLogoSuspension(rig), [rig]);
  useFrame((_, delta) => {
    advanceLogoSuspension(rig, delta, { reducedMotion });
    if (moonlightRef.current) advanceLogoMoonlight(moonlightRef.current, delta, { reducedMotion });
  });

  return <primitive object={rig.root} dispose={null} />;
}

function Logo() {
  const [sceneReady, setSceneReady] = useState(false);
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const reducedMotion = useReducedMotionPreference();
  const { slot, viewport } = useLogoViewport();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const cameraPosition = windowWidth <= 1250 ? [0.5, 0.5, 4] : [0.45, 0.4, 2];
  const renderHeight = viewport.height + viewport.topExtension + viewport.bottomExtension;

  return (
    <div className="logo-canvas-container">
      <div ref={slot} className="logo-canvas" aria-busy={!sceneReady} style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: -viewport.topExtension, left: 0,
          width: "100%", height: renderHeight, pointerEvents: "none" }}>
          <Canvas className="signature-canvas">
            <BackgroundColor cssVariable="--home-environment-color" fallback="#050505" />
            <Suspense fallback={null}>
              <LogoInit path={logo} cameraPosition={cameraPosition} viewport={viewport}
                width={windowWidth} onReady={onSceneReady} reducedMotion={reducedMotion} />
            </Suspense>
            <LogoCamera position={cameraPosition} viewport={viewport} />
            <ambientLight intensity={0.1} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}

export default Logo;
