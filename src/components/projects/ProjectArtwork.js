import { useId } from "react";

// Original geometric scenes for the six project worlds; all artwork is decorative.
function MoleArtwork() {
  return <>
    <path d="m24 126 105-28 92 35-104 33Z" fill="#3b3342" stroke="#796579" strokeWidth="1.5" />
    <path d="m24 126 93 30 104-23v8l-104 29-93-35Z" fill="#1a1822" stroke="#655566" strokeWidth="1.5" />
    <path d="m37 124 87-23 81 29-87 25Z" fill="none" stroke="#655566" strokeWidth="1" />
    <ellipse cx="66" cy="123" rx="25" ry="8" fill="#090b12" stroke="#a78c77" strokeWidth="1.5" />
    <path d="M45 124q21 9 42 0" fill="none" stroke="#5f505a" strokeWidth="1.5" />
    <ellipse cx="179" cy="129" rx="26" ry="8" fill="#090b12" stroke="#a78c77" strokeWidth="1.5" />
    <ellipse cx="128" cy="145" rx="44" ry="13" fill="#090b12" stroke="#d1aa72" strokeWidth="1.5" />
    <g className="project-art__target">
      <path d="M109 145v-21a20 20 0 0 1 40 0v21q-20 9-40 0Z" fill="#b57e3d" />
      <path d="M111 142v-18a17 17 0 0 1 34 0v18q-17 8-34 0Z" fill="#e6b664" />
      <path d="M117 120q3-7 10-8m-10 14v10" fill="none" stroke="#ffe1a0" strokeWidth="2" />
    </g>
    <path d="M88 148q40 17 80 0" fill="none" stroke="#d1aa72" strokeWidth="1.5" />
    <g className="project-art__swing-arcs" fill="none" stroke="#e6b664" strokeWidth="1.5"><path d="M45 42c3 29 26 51 59 61m-51-65c4 24 25 41 54 49" /></g>
    <g className="project-art__impact">
      <path d="m130 103 5 10 12-4-7 12 13 7-15 2 1 15-11-10-11 10-1-15-15-3 13-8-6-11 12 5Z" fill="#ff7668" />
      <path d="M148 122q10 2 18 10m-14-20q17 4 27 16" fill="none" stroke="#e6b664" strokeWidth="1.5" />
      <path d="m162 132 11 6m-34 9 3 11m20-31 10 2" fill="none" stroke="#e6b664" strokeWidth="2" />
    </g>
    <g className="project-art__mallet">
      <path d="m60 45 9-6 55 47-7 8Z" fill="#a8653c" stroke="#3b2931" strokeWidth="1.5" />
      <path d="m69 47 48 41" stroke="#e6b664" strokeWidth="3" />
      <path d="m101 89 29-8 28 10-28 9Z" fill="#f3cf83" stroke="#fff0bb" strokeWidth="1.5" />
      <path d="m101 89 29 11v17l-29-11Z" fill="#ce974d" stroke="#efc374" strokeWidth="1.5" />
      <path d="m130 100 28-9v17l-28 9Z" fill="#93623a" stroke="#e6b664" strokeWidth="1.5" />
      <path d="m109 89 20 7m-20 0 13 5" stroke="#ffe6ab" strokeWidth="2" />
    </g>
    <g fill="#ff7668"><rect x="183" y="35" width="5" height="5" /><rect x="192" y="35" width="5" height="5" /><rect x="201" y="35" width="5" height="5" /></g>
    <path d="M95 164h64" stroke="#ff7668" strokeWidth="1.5" />
  </>;
}

function CinemaArtwork() {
  const sceneClipId = `krispy-scene-${useId().replaceAll(":", "")}`;
  return <>
    <defs><clipPath id={sceneClipId}><rect x="82" y="44" width="105" height="73" /></clipPath></defs>
    <path d="m45 40 154-16 15 122-154 17Z" fill="#070d0a" />
    <path d="m42 35 153-17 15 123-153 17Z" fill="#33362a" stroke="#797965" strokeWidth="1.5" />
    <path d="M30 120 80 62l98 30-112 39Z" fill="#edb868" opacity="0.17" />
    <g className="project-art__film">
      <path d="M61 25h146v125H61Z" fill="#171b18" stroke="#d8d1b9" strokeWidth="1.5" />
      <path d="M68 31h132v112H68Z" fill="#3c3425" />
      {[35, 55, 75, 95, 115, 135].map(y => <g key={y}><rect x="65" y={y} width="6" height="10" fill="#d8d1b9" /><rect x="197" y={y} width="6" height="10" fill="#d8d1b9" /></g>)}
      <path d="M77 39h115v84H77Z" fill="#a56839" />
      <g clipPath={`url(#${sceneClipId})`}>
        <rect className="project-art__cinema-sky" x="82" y="44" width="105" height="73" fill="#d3a259" />
        <g className="project-art__cinema-stars" fill="#f4e9cf"><path d="m97 53 1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5Z" /><circle cx="115" cy="50" r="1.5" /><circle cx="180" cy="80" r="1.2" /></g>
        <g className="project-art__sun"><circle cx="164" cy="60" r="9" fill="#edc78a" /></g>
        <g className="project-art__moon"><path d="M168 51a9 9 0 1 0 5 15c-10 2-15-7-5-15Z" fill="#f4e9cf" /></g>
        <path className="project-art__cinema-landscape" d="m82 94 24-29 29 17 22-24 30 39v20H82Z" fill="#664b2c" />
      </g>
      <g className="project-art__play"><path d="m124 59 32 21-32 21Z" fill="#f4e9cf" stroke="#171b18" strokeWidth="2" /><path d="m129 70 17 10-17 10Z" fill="#171b18" /></g>
      <path d="M79 132h108" stroke="#797965" strokeWidth="2" /><path d="M79 132h59" stroke="#edb868" strokeWidth="2" /><circle cx="138" cy="132" r="3" fill="#edb868" />
    </g>
    <path d="m40 149 164 4-5 10-154-4Z" fill="#b78a4b" /><path d="M28 109v-17h22v17m-16-11h10" fill="none" stroke="#edb868" strokeWidth="2" />
  </>;
}

function SignalArtwork() {
  const mapClipId = `heyyou-map-${useId().replaceAll(":", "")}`;
  const route = "M60 61 92 55l31 37 49 39 26-44";
  return <>
    <defs><clipPath id={mapClipId}><rect x="29" y="22" width="188" height="133" /></clipPath></defs>
    <path d="M23 28h194v133H23Z" fill="#62bdc9" stroke="#267486" strokeWidth="1.5" />
    <path d="M29 22h188v133H29Z" fill="#92e0e1" stroke="#267486" strokeWidth="1.5" />
    <g clipPath={`url(#${mapClipId})`}>
      <g fill="none" stroke="#4d9aaa" strokeWidth="1"><path d="M40 35h166M40 68h166M40 101h166M40 134h166M55 30v112M88 30v112M121 30v112M154 30v112M187 30v112" /></g>
      <g fill="none" stroke="#145669" strokeWidth="1.5"><circle cx="123" cy="92" r="22" /><circle cx="123" cy="92" r="43" /><circle cx="123" cy="92" r="62" strokeDasharray="3 5" /><path d="M58 92h130M123 28v128" strokeWidth="1" /></g>
      <g className="project-art__sweep"><path d="M123 92 204 73a83 83 0 0 1-30 84Z" fill="#145669" opacity="0.22" /><path d="m123 92 51 65" stroke="#145669" strokeWidth="2" /></g>
      <circle className="project-art__signal-ping" cx="123" cy="92" r="16" fill="none" stroke="#267486" strokeWidth="2" />
      <circle className="project-art__signal-ping project-art__signal-ping--echo" cx="123" cy="92" r="16" fill="none" stroke="#dcfffa" strokeWidth="2" />
      <path d={route} fill="none" stroke="#072d38" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.45" />
      <path className="project-art__signal-route" d={route} pathLength="1" fill="none" stroke="#072d38" strokeWidth="2.5" />
      {[{ name: "east", x: 198, y: 87 }, { name: "south", x: 172, y: 131 }, { name: "west", x: 60, y: 61 }].map(({ name, x, y }) => <g className={`project-art__signal-node project-art__signal-node--${name}`} key={name}>
        <circle className="project-art__node-halo" cx={x} cy={y} r="8" fill="none" stroke="#145669" strokeWidth="1.5" />
        <circle cx={x} cy={y} r="5" fill="#d9ffed" stroke="#072d38" strokeWidth="2" />
      </g>)}
      <circle className="project-art__message-packet" cx="123" cy="92" r="3.5" fill="#dcfffa" stroke="#072d38" strokeWidth="1.5" />
      <g className="project-art__location-pin"><path d="M111 77a12 12 0 1 1 24 0c0 10-12 22-12 22s-12-12-12-22Z" fill="#072d38" /><circle cx="123" cy="77" r="4" fill="#92e0e1" /></g>
      <g className="project-art__chat">
        <path d="M169 32h42v29h-18l-8 7v-7h-16Z" fill="#dcfffa" stroke="#267486" strokeWidth="1.5" />
        <g className="project-art__typing-dots" fill="#267486"><circle className="project-art__typing-dot project-art__typing-dot--one" cx="179" cy="46" r="2.5" /><circle className="project-art__typing-dot project-art__typing-dot--two" cx="190" cy="46" r="2.5" /><circle className="project-art__typing-dot project-art__typing-dot--three" cx="201" cy="46" r="2.5" /></g>
        <path className="project-art__chat-lines" d="M177 42h25m-25 9h18" fill="none" stroke="#267486" strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
    <path d="M21 20h13m-13 0v13m185 124h13v-13" fill="none" stroke="#072d38" strokeWidth="2" />
  </>;
}

export function BardAudience() {
  const audienceId = `bard-audience-${useId().replaceAll(":", "")}`;
  return <svg className="project-art__audience-frame" viewBox="0 135 240 45" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
    <defs>
      <g id={`${audienceId}-round`}>
        <circle cx="0" cy="146" r="6" />
        <path d="M-9 157q2-3 7-3v-4h4v4q5 0 7 3l4 29h-26Z" />
      </g>
      <g id={`${audienceId}-tall`}>
        <circle cx="0" cy="145" r="6.5" />
        <path d="M-10 156q3-3 7.5-3v-5h5v5q4.5 0 7.5 3l4 30h-28Z" />
      </g>
      <g id={`${audienceId}-short`}>
        <circle cx="0" cy="148" r="6" />
        <path d="M-9 159q2-3 7-3v-4h4v4q5 0 7 3l4 27h-26Z" />
      </g>
    </defs>
    <g className="project-art__audience">
      <path className="project-art__audience-floor" d="M28 175q46-9 92 0 46-9 92 0v9H28Z" />
      {[
        [43, 1, "short"], [69, 0, "round"], [95, 2, "tall"], [121, 0, "round"],
        [147, 2, "short"], [173, 1, "tall"], [199, 0, "round"],
      ].map(([x, y, pose], index) => <use className="project-art__audience-member" href={`#${audienceId}-${pose}`} x={x} y={y} key={index} />)}
    </g>
  </svg>;
}

function StageArtwork() {
  const stageId = `bard-stage-${useId().replaceAll(":", "")}`;
  return <>
    <defs><clipPath id={`${stageId}-opening`}><path d="M48 73q73-37 146 0v96H48Z" /></clipPath></defs>
    <path d="m27 173 91-23 95 23-92 20Z" fill="#250d1c" /><path d="m27 173 94 11 92-11v7l-92 16-94-16Z" fill="#a47966" />
    <path d="M35 169V72a86 58 0 0 1 172 0v97" fill="#220e1a" stroke="#d9b980" strokeWidth="2" />
    <path d="M46 169V73a75 47 0 0 1 150 0v96" fill="#361329" stroke="#976b64" strokeWidth="1.5" />
    <path className="project-art__spotlight" d="m88 42 65 128H77l9-128Zm66 0-8 128h45L155 42Z" fill="#d9b980" opacity="0.08" />
    <g clipPath={`url(#${stageId}-opening)`}>
      <g className="project-art__stage-drop project-art__stage-drop--sun">
        <g className="project-art__stage-sun">
          <path className="project-art__stage-cord" d="M96 54v31" fill="none" stroke="#d9b980" strokeWidth="1.25" />
          <path d="M96 78v-4m0 48v-4m-20-20h-4m48 0h-4m-34-14-3-3m34 34-3-3m0-28 3-3m-34 34 3-3" fill="none" stroke="#edcfa4" strokeWidth="2" strokeLinecap="round" />
          <circle cx="96" cy="98" r="13" fill="#edcfa4" stroke="#bd8c56" strokeWidth="1.5" />
        </g>
      </g>
      <g className="project-art__stage-drop project-art__stage-drop--cloud">
        <g className="project-art__stage-cloud">
          <path className="project-art__stage-cord" d="M140 54v35" fill="none" stroke="#d9b980" strokeWidth="1.25" />
          <path d="M129 115a8 8 0 1 1 1-16 11 11 0 0 1 21-5 9 9 0 0 1 16 8 7 7 0 0 1-3 13Z" fill="#f5e8cf" stroke="#a47966" strokeWidth="1.5" />
          <path d="M132 110h27" fill="none" stroke="#d9b980" strokeWidth="1.25" opacity="0.7" />
        </g>
      </g>
    </g>
    <g className="project-art__curtain-left"><path d="M48 64q18 13 36 6l-12 102-24-9Z" fill="#8a344e" /><path d="m54 72 4 92 6-85 3 90 9-84" fill="none" stroke="#bc6575" strokeWidth="2" /><path d="m77 83-7 89 7 0 9-98Z" fill="#551c35" /></g>
    <g className="project-art__curtain-right"><path d="M194 64q-18 13-36 6l12 102 24-9Z" fill="#8a344e" /><path d="m188 72-4 92-6-85-3 90-9-84" fill="none" stroke="#bc6575" strokeWidth="2" /><path d="m165 83 7 89-7 0-9-98Z" fill="#551c35" /></g>
    <path d="M48 64q73-52 146 0l-3 9q-70-37-140 0Z" fill="#782d3e" stroke="#d9b980" strokeWidth="1.5" />
    <path d="M34 171h174M44 178h153" stroke="#d9b980" strokeWidth="1.5" /><path d="M28 167V92m186 75V92" stroke="#d9b980" strokeWidth="2" />
    <path d="m116 23 5-5 5 5-5 5Z" fill="#d9b980" />
  </>;
}

function ArchitectureArtwork() {
  return <>
    <g fill="none" stroke="#7097ef" strokeWidth="1.25"><path d="m16 124 116-62 94 48-112 60Zm0 0v9l98 41 112-55v-9" /><path d="m41 137 115-62m-91 73 115-62m-91 73 115-62m-164 6 96 44m-73-57 96 44m-72-57 94 44" /></g>
    <g className="project-art__crane-frame" stroke="#cbdfff" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M211 23h10v129h-10Z" fill="#193684" />
      <path d="m212 34 8 14-8 14 8 14-8 14 8 14-8 14 8 14-8 14" fill="none" />
      <path d="M26 23h202v8H26Z" fill="#193684" />
      <path d="m28 30 13-7 13 7 13-7 13 7 13-7 13 7 13-7 13 7 13-7 13 7 13-7 13 7 13-7" fill="none" stroke="#8fb3ff" strokeWidth="1" />
      <path d="m202 152 13-5 13 5v5h-26Z" fill="#5485ee" />
      <path d="M222 25h11v11h-11Z" fill="#a8c6ff" />
      <path d="M209 32h14v10h-14Z" fill="#5485ee" />
      <path d="M212 35h8v4h-8Z" fill="#d8e6ff" stroke="none" />
    </g>
    <path d="m63 109 45-25 38 22-44 25Z" fill="#c4d9ff" stroke="#e4ecff" strokeWidth="1.5" /><path d="m63 109 39 22v32l-39-22Z" fill="#5485ee" stroke="#9bbcff" strokeWidth="1.5" /><path d="m102 131 44-25v32l-44 25Z" fill="#193684" stroke="#9bbcff" strokeWidth="1.5" />
    <path d="m118 64 40-23 39 21-41 24Z" fill="#c4d9ff" stroke="#e4ecff" strokeWidth="1.5" /><path d="m118 64 38 22v69l-38-23Z" fill="#5485ee" stroke="#9bbcff" strokeWidth="1.5" /><path d="m156 86 41-24v69l-41 24Z" fill="#193684" stroke="#9bbcff" strokeWidth="1.5" />
    <g fill="none" stroke="#a8c6ff" strokeWidth="1.25"><path d="m125 81 24 14v43l-24-14Zm0 19 24 14m-24-4 24 14m-17-39v43m9-38v43m23-37 24-14v43l-24 14Zm0 18 24-14m-24 24 24-14m-17-10v43m9-48v43" /></g>
    <g className="project-art__construction" fill="none" stroke="#e2edff" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.4"><path d="M108 83V23l50-7 49 26v89M53 141V91l55-32m48-43v23" /></g>
    <g className="project-art__crane-load" stroke="#d8e6ff" strokeWidth="1.25" strokeLinejoin="round">
      <g className="project-art__crane-sling"><path d="m42 125 12-12 12 12" fill="none" stroke="#e2edff" /></g>
      <path d="m42 125 12-7 12 7-12 7Z" fill="#e0ebff" />
      <path d="m42 125 12 7v14l-12-7Z" fill="#82a9fb" />
      <path d="m54 132 12-7v14l-12 7Z" fill="#3058be" />
    </g>
    <g className="project-art__crane-trolley">
      <path d="M48 24h12v8H48Z" fill="#5485ee" stroke="#d8e6ff" strokeWidth="1.25" />
      <g fill="#e2edff"><circle cx="50" cy="24" r="1.75" /><circle cx="58" cy="24" r="1.75" /></g>
      <path className="project-art__crane-cable" d="M54 31v74" fill="none" stroke="#e2edff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <g className="project-art__crane-hook"><path d="M54 105a4 4 0 1 0 4 4" fill="none" stroke="#e2edff" strokeWidth="2" strokeLinecap="round" /></g>
    </g>
    <path d="M28 63V26h52M205 146h22v-23M45 16h7m-3-3v6m157 143h7m-3-3v6" fill="none" stroke="#d8e6ff" strokeWidth="1.5" />
  </>;
}

function WorkflowArtwork() {
  return <>
    <path d="M26 43h189v112H26Z" fill="#91a387" /><path d="M20 37h189v112H20Z" fill="#f2efde" stroke="#536b50" strokeWidth="1.5" />
    <g fill="#d2d8be"><path d="M28 58h52v82H28Zm59 0h52v82H87Zm59 0h55v82h-55Z" /></g>
    <path d="M84 59v78m59-78v78" fill="none" stroke="#536b50" strokeWidth="1.5" opacity="0.35" />
    <path d="M28 51h52m7 0h52m7 0h55" stroke="#263c2c" strokeWidth="2" />
    <g fill="#263c2c" fontFamily="monospace" fontSize="7" fontWeight="700"><text x="28" y="47">TO DO</text><text x="87" y="47">DOING</text><text x="146" y="47">DONE</text></g>
    <path d="M34 67h42v27H34Z" fill="#a5ad97" /><path d="M32 64h42v27H32Z" fill="#fff9e5" stroke="#75876a" strokeWidth="1.5" /><path d="M38 72h24m-24 6h17m-17 6h9" stroke="#7e9278" strokeWidth="2" />
    <path d="M93 67h42v27H93Z" fill="#a5ad97" /><path d="M91 64h42v27H91Z" fill="#f9f7e8" stroke="#75876a" strokeWidth="1.5" /><path d="M97 72h23m-23 6h15" stroke="#7e9278" strokeWidth="2" /><path d="M97 84h29" stroke="#536b50" strokeWidth="2" opacity="0.25" /><path d="M97 84h12" stroke="#536b50" strokeWidth="2" />
    <path d="M152 67h43v27h-43Z" fill="#acbba0" /><path d="M150 64h43v27h-43Z" fill="#f9f7e8" stroke="#536b50" strokeWidth="1.5" /><path d="M156 72h13m-13 6h9" stroke="#7e9278" strokeWidth="2" /><circle cx="181" cy="78" r="6" fill="#263c2c" /><path d="m178 78 2 2 4-5" fill="none" stroke="#f9f7e8" strokeWidth="1.5" />
    <path d="M53 117h118" stroke="#658466" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" /><path d="m166 113 6 4-6 4" fill="none" stroke="#536b50" strokeWidth="1.5" />
    <g className="project-art__workflow-card">
      <path className="project-art__workflow-shadow" d="M35 103h40v33H35Z" fill="#9e6743" opacity="0.25" />
      <path d="M33 100h40v33H33Z" fill="#e6b27c" stroke="#943b26" strokeWidth="1.5" />
      <path d="M39 108h16m-16 7h13" stroke="#943b26" strokeWidth="2" strokeLinecap="round" />
      <path d="M39 124h27" stroke="#943b26" strokeWidth="2.5" strokeLinecap="round" opacity="0.22" />
      <path className="project-art__workflow-progress" d="M39 124h27" stroke="#263c2c" strokeWidth="2.5" strokeLinecap="round" />
      <g className="project-art__workflow-complete">
        <circle cx="65" cy="110" r="6" fill="#263c2c" />
        <path className="project-art__workflow-check" d="m62 110 2 2 4-5" pathLength="1" fill="none" stroke="#fff9e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
    <path d="M31 162h67m8 0h27" stroke="#536b50" strokeWidth="1.5" />
  </>;
}

const ARTWORK = { whackamole: MoleArtwork, krispy: CinemaArtwork, heyyou: SignalArtwork, bard: StageArtwork, thisportfolio: ArchitectureArtwork, kanban: WorkflowArtwork };

export default function ProjectArtwork({ projectId }) {
  const Artwork = ARTWORK[projectId];
  if (!Artwork) return null;
  return <div className="project-selector__artwork" aria-hidden="true"><svg viewBox={projectId === "bard" ? "0 0 240 200" : "0 0 240 180"} focusable="false"><Artwork /></svg></div>;
}
