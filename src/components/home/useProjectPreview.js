import { useCallback, useEffect, useReducer } from "react";
import { PORTFOLIO_VIEWS } from "./portfolioRouteState";

const EMPTY_PREVIEW = { hovered: null, focused: null, source: "hovered" };

function previewReducer(state, { type, source, id }) {
  if (type === "reset") return EMPTY_PREVIEW;
  if (type === "enter") {
    return { ...state, [source]: id, source };
  }
  // Ignore leave events belonging to a card that has already been superseded.
  if (state[source] !== id) return state;
  return {
    ...state,
    [source]: null,
    source: source === "hovered" ? "focused" : "hovered",
  };
}

export default function useProjectPreview(activeView) {
  const [preview, dispatch] = useReducer(previewReducer, EMPTY_PREVIEW);

  useEffect(() => {
    if (activeView !== PORTFOLIO_VIEWS.PROJECTS) dispatch({ type: "reset" });
  }, [activeView]);

  const otherSource = preview.source === "hovered" ? "focused" : "hovered";
  const previewProjectId = activeView === PORTFOLIO_VIEWS.PROJECTS
    ? preview[preview.source] || preview[otherSource]
    : null;

  const onPreviewEnter = useCallback((id, source) => dispatch({ type: "enter", id, source }), []);
  const onPreviewLeave = useCallback((id, source) => dispatch({ type: "leave", id, source }), []);

  return {
    previewProjectId,
    onPreviewEnter,
    onPreviewLeave,
  };
}
