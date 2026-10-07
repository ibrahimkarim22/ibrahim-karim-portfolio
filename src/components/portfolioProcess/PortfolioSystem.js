import { useState } from "react";
import StableAnnotation from "./StableAnnotation";

const nodes = [
  {
    name: "Portfolio shell",
    file: "Home.js",
    title: "A persistent frame.",
    description:
      "Home stays mounted while URL state selects a view. Shared navigation and return behavior belong to this application shell.",
    excerpt: "getPortfolioRouteState(location.pathname)",
    layer: 4,
  },
  {
    name: "Project catalog",
    file: "projectCatalog.js",
    title: "Routes resolve the work.",
    description:
      "The catalog holds project IDs, names, technologies and direct component imports. Route state identifies the selected project.",
    excerpt: "getProjectById(selectedProjectId)",
    layer: 2,
  },
  {
    name: "Modal host",
    file: "ProjectModalHost.js",
    title: "A small contract between worlds.",
    description:
      "The host renders the selected component with isOpen and closeModal. Each world owns its presentation; Home owns its route and return behavior.",
    excerpt: "<ModalComponent isOpen={true} closeModal={onClose} />",
    layer: 1,
  },
  {
    name: "Project worlds",
    file: "HeyYouModal.js / BardModal.js / KanbanBoardModal.js",
    title: "Expression above the structure.",
    description:
      "Project components supply distinct imagery, layout and motion. Reactstrap provides named dialogs, focus containment and Escape handling.",
    excerpt: "isOpen / closeModal → project presentation",
    layer: 0,
  },
];
const layers = [
  {
    name: "Project experience",
    technology: "SCSS / CSS Grid / Flexbox",
    description:
      "Scoped SCSS gives each project its typography, color and composition. Grid and flex layouts recompose the presentation for the viewport.",
    file: "ProjectsHeyYouModal.scss / ProjectsBardModal.scss / ProjectsKanbanModal.scss",
    detail: "Distinct worlds / one shared contract",
    pattern: "worlds",
  },
  {
    name: "Project modals",
    technology: "React / Reactstrap",
    description:
      "Each modal is a self-contained presentation with local interactions, media and accessible actions. Only the route-selected presentation is mounted.",
    file: "ProjectModalHost.js",
    detail: "isOpen + closeModal",
    pattern: "modals",
  },
  {
    name: "Shared UI + routing",
    technology: "React Router / catalog / modal host",
    description:
      "URL state resolves a project from the catalog. The host opens its component; Home handles closing and restores the project trigger.",
    file: "portfolioRouteState.js / projectCatalog.js",
    detail: "/projects/:projectId",
    pattern: "routing",
  },
  {
    name: "Motion + assets",
    technology: "CSS keyframes / Blender / React Three Fiber",
    description:
      "CSS keyframes choreograph the case studies. Blender supplies models and rendered images; React Three Fiber renders the live GLB scenes.",
    file: "Logo.js / 3dEnvironment.js / Keyframes*.scss",
    detail: "CSS + images + GLB",
    pattern: "motion",
  },
  {
    name: "Application shell",
    technology: "Home / shared navigation",
    description:
      "Home is the persistent application frame. It connects the work, resume and 3D Profile with shared navigation and route state.",
    file: "Home.js / App.js",
    detail: "A persistent frame",
    pattern: "shell",
  },
];

export default function PortfolioSystem() {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedNode, setSelectedNode] = useState(0);
  return (
    <>
      <div className="tp-exploded tp-scene" data-selected={selectedLayer}>
        <div className="tp-layer-drawing">
          <div className="tp-drawing-coordinate" aria-hidden="true">
            <span>A—A / EXPLODED SYSTEM</span>
            <span>5 CONNECTED PLANES</span>
          </div>
          <div className="tp-layer-guides" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <ol className="tp-layer-stack" aria-label="Exploded portfolio layers">
            {layers.map((item, index) => (
              <li key={item.name} style={{ "--tp-layer": index }}>
                <button
                  type="button"
                  aria-label={`Inspect ${item.name} layer`}
                  aria-pressed={selectedLayer === index}
                  aria-controls="tp-layer-detail"
                  onClick={() => setSelectedLayer(index)}
                >
                  <span
                    className={`tp-plane-pattern tp-plane-pattern--${item.pattern}`}
                    aria-hidden="true"
                  >
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="tp-layer-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <strong>{item.name}</strong>
                  <span className="tp-layer-pin" aria-hidden="true">
                    +
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="tp-drawing-note">
            SELECT A PLANE / CLICK · TAP · ENTER · SPACE
          </p>
        </div>
        <StableAnnotation
          items={layers}
          selected={selectedLayer}
          className="tp-layer-detail"
          id="tp-layer-detail"
          label="Layer detail"
          render={(layer, index) => (
            <>
              <p className="tp-label">
                LAYER 0{index + 1} / {layer.technology}
              </p>
              <h3>{layer.name}</h3>
              <p>{layer.description}</p>
              <div className="tp-layer-evidence">
                <span>IMPLEMENTATION</span>
                <code>{layer.file}</code>
                <strong>{layer.detail}</strong>
              </div>
              <p className="tp-layer-context">
                The visible surface has a structure.
                <br />
                Every plane contributes to the same experience.
              </p>
            </>
          )}
        />
      </div>
      <div className="tp-system-map">
        <div className="tp-route-trace">
          <p className="tp-label">ROUTE TRACE / FOLLOW A PROJECT</p>
          <ol className="tp-system-nodes" aria-label="Portfolio architecture">
            {nodes.map((item, index) => (
              <li key={item.name}>
                <button
                  type="button"
                  aria-label={`Inspect ${item.name}`}
                  aria-pressed={selectedNode === index}
                  aria-controls="tp-system-detail"
                  onClick={() => {
                    setSelectedNode(index);
                    setSelectedLayer(item.layer);
                  }}
                >
                  <span>0{index + 1}</span>
                  <strong>{item.name}</strong>
                  <i aria-hidden="true">{index === 3 ? "↗" : "→"}</i>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <StableAnnotation
          items={nodes}
          selected={selectedNode}
          className="tp-system-detail"
          id="tp-system-detail"
          label="System detail"
          render={(node) => (
            <>
              <h3>{node.title}</h3>
              <p>{node.description}</p>
              <div className="tp-detail-source">
                <code>{node.file}</code>
                <pre>
                  <code>{node.excerpt}</code>
                </pre>
              </div>
            </>
          )}
        />
      </div>
    </>
  );
}
