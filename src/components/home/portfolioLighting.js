import { createContext, useCallback, useEffect, useLayoutEffect, useReducer, useState } from "react";

export const SECTION_LIGHTS = Object.freeze({
  home: "#e6dabf",
  projects: "#b92436",
  resume: "#80729b",
  "3d-profile": "#ffb45e",
  megaracer: "#c6ff00",
});

export const PortfolioLightingContext = createContext({
  theme: "home", cycle: 0, changing: false, reduced: false,
});

function lightingReducer(state, action) {
  if (action.type === "activation" || action.type === "routeSync") {
    if (!Object.prototype.hasOwnProperty.call(SECTION_LIGHTS, action.theme)) return state;
    if (action.type === "routeSync" && state.theme === action.theme) return state;
    return { theme: action.theme, cycle: state.cycle + 1, changing: true };
  }
  if (action.type === "settle" && action.cycle === state.cycle && state.changing) {
    return { ...state, changing: false };
  }
  return state;
}

export function usePortfolioLighting(activeView) {
  const [state, dispatch] = useReducer(lightingReducer, {
    theme: Object.prototype.hasOwnProperty.call(SECTION_LIGHTS, activeView) ? activeView : "home", cycle: 0, changing: false,
  });
  const [reduced, setReduced] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  const selectTheme = useCallback((theme) => dispatch({ type: "activation", theme }), []);

  useLayoutEffect(() => { dispatch({ type: "routeSync", theme: activeView }); }, [activeView]);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const update = () => setReduced(media.matches);
    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener?.(update);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", update);
      else media.removeListener?.(update);
    };
  }, []);

  useEffect(() => {
    if (!state.changing) return;
    const timer = window.setTimeout(() => dispatch({ type: "settle", cycle: state.cycle }), reduced ? 240 : 900);
    return () => window.clearTimeout(timer);
  }, [state.changing, state.cycle, reduced]);

  const color = SECTION_LIGHTS[state.theme];
  useLayoutEffect(() => {
    const properties = { "--section-light": color, "--candle-flame-color": color };
    const original = Object.keys(properties).map((name) => ({
      name, value: document.body.style.getPropertyValue(name), priority: document.body.style.getPropertyPriority(name),
    }));
    Object.entries(properties).forEach(([name, value]) => document.body.style.setProperty(name, value));
    return () => original.forEach(({ name, value, priority }) => {
      if (value) document.body.style.setProperty(name, value, priority);
      else document.body.style.removeProperty(name);
    });
  }, [color]);

  return { ...state, reduced, selectTheme, style: {
    "--section-light": color,
    "--candle-flame-color": color,
    "--bulb-pulse-name": state.cycle % 2 ? "portfolio-bulb-change" : "portfolio-bulb-change-replay",
  } };
}
