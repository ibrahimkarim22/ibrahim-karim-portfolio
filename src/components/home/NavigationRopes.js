import { createPortal } from "react-dom";
import { ROPE_DESTINATIONS } from "./navigationRopeGeometry";

// The same five path nodes survive wheel folding, route changes and lamp swaps.
export default function NavigationRopes({ layerRef, color, hidden = false }) {
  return createPortal(<svg ref={layerRef} className="navigation-ropes" aria-hidden="true" focusable="false" style={{ "--rope-cue": color, display: hidden ? "none" : undefined }}>
    {ROPE_DESTINATIONS.map((view, index) => <g key={view} data-rope-line={view} className="navigation-rope">
      <path className="navigation-rope__shadow" />
      <path className="navigation-rope__thread" />
      <path className="navigation-rope__fibre" style={{ strokeDashoffset: index * 3 }} />
      <circle className="navigation-rope__eyelet" r="2.1" />
    </g>)}
    <g data-rope-gather className="navigation-rope__gather">
      <circle r="3.8" /><circle r="1.55" />
      <path data-rope-reel d="M-3.3 0h6.6M0-3.3v6.6" />
    </g>
  </svg>, document.body);
}
