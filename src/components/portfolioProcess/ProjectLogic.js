const presentations = {
  heyyou: {
    title: "How HeyYou’s presentation moves.",
    intro:
      "Measured SVG geometry connects the phones. CSS builds the ocean scene, and the timeline below follows the recorded whale’s own clock.",
    cards: [
      {
        label: "01 / CONNECTION",
        title: "Keep the signal attached.",
        body:
          "HeroConnection measures both transformed phones and updates the SVG routes when the layout changes. CSS moves two signal dots toward the shared center on a 6.4-second cycle, then pulses the group ring when they meet.",
      },
      {
        label: "02 / WHALE CLOCK",
        title: "One source cycle. One clock.",
        body:
          "The live ocean uses an 18-second CSS whale animation with scene dimensions measured in pixels. Here, WhaleLoop reads the recording’s currentTime for both frame callbacks and the timeline marker. Pose controls seek that same video; playback pauses outside the view or in a hidden tab.",
        code:
          "if (!cancelled && !element.paused && element.readyState >= 2)\n  onTime(element.currentTime);",
      },
      {
        label: "03 / WATER & SPLASH",
        title: "Build the splash in layers.",
        body:
          "Two water particles share the whale’s 18-second cycle. Around 20–25%, translation, rotation, scale and skew lift them from the water; opacity fades by 50%. Foreground water covers their lower edges. Reduced motion stops the live choreography and uses a still whale frame here.",
      },
    ],
    sources: [
      "HeyYouModal.js",
      "KeyframesHeyYouModal.scss",
      "WhaleLoop.js / whaleTimeline.js",
    ],
  },
  bard: {
    title: "How BARD’s curtain works.",
    intro:
      "A React state machine directs the performance. Two CSS fabric panels cover the programme and travel into narrow wings at the sides.",
    cards: [
      {
        label: "01 / PERFORMANCE STATE",
        title: "Give every cue a state.",
        body:
          "useBardCurtain tracks opening, open, closing, manualClosed and exiting phases. Draw and Raise act only in their matching states. Animation-end events finish each movement; a 120ms safety margin prevents a stuck curtain. Sequence numbers keep an older callback from finishing a newer cue.",
        code:
          "export const bardCurtainTiming = {\n  opening: 3800,\n  closing: 900,\n  safety: 120\n};",
      },
      {
        label: "02 / FABRIC & EASING",
        title: "Make the fabric feel weighted.",
        body:
          "Gradients form the folds, with separate light and grain overlays. The panels pause for the first 8% of their 3.8-second opening, then ease toward −96% and 96%. Closing takes 0.9 seconds and can start from the panels’ current transforms, so an interrupted movement stays continuous.",
      },
      {
        label: "03 / CONTROLS & ACCESS",
        title: "Keep the programme usable.",
        body:
          "Draw and Raise controls trigger the hook and return focus between the tassel and the raised-curtain control. The open overlay lets pointer input reach the programme. Reduced motion settles each cue immediately, and Escape closes without waiting for the fabric animation.",
      },
    ],
    sources: [
      "BardCurtain.js / BardModal.js",
      "ProjectsBardModal.scss",
      "KeyframesBardModal.scss",
    ],
  },
  tuhdoo: {
    title: "How Tuh-Doo’s boards move.",
    intro:
      "The opening board and the sample workflow are React components built from HTML cards. Their local state supplies the movement you see in this portfolio.",
    cards: [
      {
        label: "01 / OPENING BOARD",
        title: "Organize, then advance.",
        body:
          "TuhDooHeroBoard sorts five cards into place over 2.7 seconds. Once settled, a 3.2-second timer archives, advances and replenishes individual tasks. It runs while the board is visible and the tab is active; reduced motion keeps the organized starting arrangement.",
      },
      {
        label: "02 / TASK FLOW",
        title: "Let each move update the board.",
        body:
          "KanbanDemo sends native drag-and-drop and arrow-button actions through moveTask. That function updates the task’s column in a new array, so React redraws the lists and completion count. Arrow moves restore focus to the moved card and announce its new state.",
      },
      {
        label: "03 / FRESH START",
        title: "Reset the whole interaction.",
        body:
          "Reset board restores the five sample tasks, clears the focus request and ends the active drag. The sample stays in local component state. Closing the project removes its presentation, giving the next opening a fresh board.",
        code: "setTasks(initialTasks);\nsetFocusRequest(null);\nendDrag();",
      },
    ],
    sources: [
      "TuhDooHeroBoard.js",
      "KanbanDemo.js / KanbanBoardModal.js",
      "ProjectsKanbanModal.scss",
    ],
  },
  krispy: {
    title: "How KRISPY sets the viewing mood.",
    intro:
      "A small local light control, direct film links and a native video player carry the cinema idea into the portfolio presentation.",
    cards: [
      {
        label: "01 / HOUSE LIGHTS",
        title: "Change the room with one flag.",
        body:
          "The House lights button toggles a screening state and exposes it with aria-pressed. The krispy-screening class changes CSS color variables for the stage, gallery, text and projection frame. Short color transitions connect the two viewing moods; reduced motion removes those transitions.",
        code: "const [screening, setScreening] = useState(false);",
      },
      {
        label: "02 / FILM LINKS",
        title: "Connect the poster to the film.",
        body:
          "The Chaplin posters and their Watch film captions are native links to Krispy’s individual movie routes. Their images retain their original proportions, and keyboard focus reveals the same clear action as a pointer. Each destination opens in a new tab with its purpose in the link’s accessible name.",
      },
      {
        label: "03 / MEDIA LIFECYCLE",
        title: "Give the screening a clear end.",
        body:
          "The project mounts its video player while the modal is open. The player uses native controls, a poster and metadata preloading. Its cleanup pauses playback when the presentation is removed, and a failed film load offers a link to the original source. House lights reset when the modal closes.",
      },
    ],
    sources: ["KrispyModal.js", "ProjectsKrispyModal.scss", "ProjectModalHost.js"],
  },
  whackamole: {
    title: "How Whack a Mole’s logos play.",
    intro:
      "The technology logos are real buttons. CSS handles their entrance through the holes, while React handles each hit and its brief point feedback.",
    cards: [
      {
        label: "01 / LOGO MOTION",
        title: "Raise the targets through a mask.",
        body:
          "A staggered CSS transform cycle moves each logo through an overflow-clipped window. A second keyframe animation enables pointer input during the visible part of the cycle. The front lip of the hole covers the descent, preserving the sense that the target drops into the stage.",
      },
      {
        label: "02 / HIT & RESET",
        title: "Make every hit readable.",
        body:
          "whackLogo checks the target’s visible geometry and ignores a hit already in progress. A valid hit sets local state, drops the logo and shows +5 for 800ms. The timer clears that state and restarts the CSS cycle from its hidden frame; cleanup clears the timer when the target unmounts.",
        code:
          "hitTimer.current = window.setTimeout(() => {\n  setIsHit(false);\n  hitTimer.current = null;\n}, 800);",
      },
      {
        label: "03 / KEYBOARD & MOTION",
        title: "Keep the target within reach.",
        body:
          "Keyboard focus holds a logo above its hole, so Enter or Space can activate the native button without chasing the animation. Reduced motion holds the logos still and available. Closing and reopening the project resets the targets and their feedback state.",
      },
    ],
    sources: [
      "WhackaModal.js",
      "ProjectsWhackaModal.scss",
      "KeyframesWhackaModal.scss",
    ],
  },
};

export default function ProjectLogic({ project }) {
  const presentation = presentations[project];
  if (!presentation) return null;
  const titleId = `tp-${project}-logic-title`;

  return (
    <section className="tp-project-logic" aria-labelledby={titleId}>
      <h3 id={titleId}>{presentation.title}</h3>
      <p className="tp-logic-intro">{presentation.intro}</p>
      <div className="tp-logic-grid">
        {presentation.cards.map(({ label, title, body, code }) => (
          <article className="tp-logic-card" key={label}>
            <small className="tp-logic-step">{label}</small>
            <h4>{title}</h4>
            <p>{body}</p>
            {code && (
              <pre className="tp-logic-code"><code>{code}</code></pre>
            )}
          </article>
        ))}
      </div>
      <footer className="tp-logic-source">
        <span>IMPLEMENTATION</span>
        {presentation.sources.map((source) => <code key={source}>{source}</code>)}
      </footer>
    </section>
  );
}
