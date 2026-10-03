# Single-Page Portfolio Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Home the persistent portfolio shell while Projects, project modals, and 3D Profile become route-backed in-shell states that preserve the existing direct URLs, content, and responsive behavior.

**Architecture:** Keep `Home` mounted as the common React Router parent for `/`, `/projects`, `/projects/:projectId`, and `/threeDeeResume`. Derive `activeView` and `selectedProjectId` from the URL, render exactly one center view, and mount at most one selected modal as a sibling overlay. Keep route/history state authoritative; do not introduce context, global state, a second synchronized navigation state, or hidden live canvases.

**Tech Stack:** React 18, React Router DOM 6, React Testing Library/Jest through Create React App, Reactstrap modals, React Three Fiber/Drei, and SCSS. Add no dependency.

**Spec:** `docs/superpowers/specs/2026-10-03-single-page-portfolio-experience-design.md`

## Global Constraints

- Work only on `feat/single-page-portfolio-experience` and confirm that branch before implementation.
- Preserve the existing biography, contacts, title, copyright, Resume URL/target/rel, MegaRacer URL/preview, GLB assets, project content, outbound links, and all modal-specific responsive styling.
- Preserve the current Copyright behavior: `© 2023-<current year>` uses a normal hyphen, while year 2023 renders only `© 2023`.
- Preserve the public paths exactly, including the casing of `/threeDeeResume` and all six current lowercase project IDs.
- Do not add a lowercase 3D alias, dependencies, a global state library, or a second local copy of route state.
- Never keep `Logo` and `ThreeDProfileView` mounted at the same time. Never mount all six project modals and hide five with CSS.
- Do not alter the six modal component contracts or their content. `HeyYouModal` must continue to use `HorizontalScroll` and `.hey-you-horizontal-scroll`.
- Do not change `firebase.json`; its existing SPA rewrite already supports direct links.
- Use semantic buttons for in-page toggles and project choices. Retain Reactstrap's modal focus trap and Escape behavior.
- Follow red-green-refactor for behavior changes. Keep each task's commit boundary independent; do not combine the listed commits.
- Do not push, open a pull request, merge, deploy, or update README as part of this plan.

## Current Baseline

- On 2026-10-03, `$env:CI='true'; npm test -- --watchAll=false` passes `src/App.test.js`: 1 suite, 8 tests.
- Jest prints an existing open-handle notice after passing. Create React App also prints the existing `babel-preset-react-app` undeclared-plugin warning. Neither warning belongs to this feature.
- `docs/` is currently untracked. Preserve the approved spec and do not rewrite it.
- The spec's 6-pass/2-fail Copyright snapshot is historical. The Copyright hyphen correction has since landed and the current green 8-test baseline is authoritative.

## Review Focus

1. **Shell persistence and loading:** Child-route navigation must not remount Home or replay its full-page loader. Protect with DOM-identity and timer assertions in `src/App.test.js`.
2. **Modal history semantics:** Selector-opened modals close with Back, while direct deep links close via replace to `/projects`. Protect with back/forward stack tests.
3. **Route validation:** Known IDs are case-normalized and unknown project IDs cannot leave a blank modal state. Protect at helper, catalog, and integration levels.
4. **Resource lifetime:** Only the active Three Fiber canvas may exist, and timers/body classes must clean up on switch/unmount. Protect with component lifecycle tests and integration assertions.
5. **Responsive containment:** The selector and 3D region must not create document overflow or obscure their exit controls on narrow/short viewports. Protect with the exact manual viewport matrix in Task 7; JSDOM cannot prove layout.

---

## Task 1: Define the route-derived portfolio state

**Minimal goal:** Convert each supported pathname into one deterministic view/selection object without reading global browser state.

**Files:**

- Create: `src/components/home/portfolioRouteState.js`
- Create: `src/components/home/portfolioRouteState.test.js`

**Interfaces:**

```js
export const PORTFOLIO_VIEWS = Object.freeze({
  HOME: "home",
  PROJECTS: "projects",
  THREE_D_PROFILE: "3d-profile",
});

export function getPortfolioRouteState(pathname) {
  // Returns { activeView, selectedProjectId } for a supported path.
  // Returns null for every unsupported path.
}
```

The helper trims trailing slashes, treats `/projects/<id>` as Projects state, lowercases only `<id>`, and does not decide whether that ID exists. Catalog validation remains a separate responsibility in Tasks 2 and 5.

- [ ] **Step 1: Write the failing route-state table test.**

  Add cases for `/`, `/projects`, `/projects/`, `/projects/WHACKAMOLE`, `/projects/not-real`, and `/threeDeeResume`. Expect unsupported paths such as `/about`, `/projects/a/b`, and `/threeDeeResume/extra` to return `null`.

  ```js
  it.each([
    ["/", { activeView: PORTFOLIO_VIEWS.HOME, selectedProjectId: null }],
    ["/projects", { activeView: PORTFOLIO_VIEWS.PROJECTS, selectedProjectId: null }],
    ["/projects/WHACKAMOLE", { activeView: PORTFOLIO_VIEWS.PROJECTS, selectedProjectId: "whackamole" }],
    ["/threeDeeResume", { activeView: PORTFOLIO_VIEWS.THREE_D_PROFILE, selectedProjectId: null }],
  ])("maps %s to route-backed state", (pathname, expected) => {
    expect(getPortfolioRouteState(pathname)).toEqual(expected);
  });
  ```

- [ ] **Step 2: Run the focused test and confirm the expected failure.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false --runTestsByPath src/components/home/portfolioRouteState.test.js
  ```

  Expected: FAIL because `portfolioRouteState.js` and its exports do not exist.

- [ ] **Step 3: Implement the minimal pure helper.**

  Normalize only repeated trailing `/` characters. Match the four supported shapes explicitly; do not inspect `window.location`, import the project catalog, or navigate from this module.

- [ ] **Step 4: Re-run the focused test.**

  Expected: PASS for all mapping and unsupported-path cases.

- [ ] **Step 5: Commit this boundary.**

  ```powershell
  git add src/components/home/portfolioRouteState.js src/components/home/portfolioRouteState.test.js
  git commit -m "feat: define portfolio route view state"
  ```

---

## Task 2: Create the project catalog and bounded semantic selector

**Minimal goal:** Extract the six project choices into one tested registry and render them as an accessible, center-slot-sized control surface.

**Files:**

- Create: `src/components/projects/projectCatalog.js`
- Create: `src/components/projects/projectCatalog.test.js`
- Create: `src/components/projects/ProjectSelector.js`
- Create: `src/components/projects/ProjectSelector.test.js`
- Create: `src/SCSS/ProjectSelector.scss`
- Modify: `src/SCSS/App.scss`

**Interfaces:**

```js
export const PROJECTS = [
  // { id, name, description, technologies, ModalComponent }
];

export function getProjectById(projectId) {
  // Case-normalized lookup; returns a catalog item or null.
}

export default function ProjectSelector({ projects, onSelectProject }) {
  // Calls onSelectProject(project.id, event.currentTarget).
}
```

Use this exact catalog order and content so extraction does not become a copy rewrite:

| ID | Name | Description | Technologies |
| --- | --- | --- | --- |
| `whackamole` | Whack a Mole | Online Game | JavaScript, HTML, SCSS |
| `krispy` | KRISPY | Streaming Service | JavaScript, React, Firebase, Redux, Bootstrap, SCSS |
| `heyyou` | HeyYou | Location & Chat | JavaScript, React Native, Android Studio, Socket.io, MongoDB, Node.js, Docker, Google Cloud |
| `bard` | BARD | Online Course | JavaScript, React Native, Android Studio, Redux, Firebase, Firestore |
| `thisportfolio` | Portfolio | This Portfolio | JavaScript, React, Firebase, SCSS, Blender 3D, React Three Fiber |
| `kanban` | Tuh-Doo / Kanban Board | To Do List | JavaScript, React, SCSS, Firebase, Firestore |

- [ ] **Step 1: Write failing catalog and selector tests.**

  Catalog cases must assert exactly six unique IDs, the order above, case-insensitive known-ID lookup, `null` for empty/unknown IDs, and the correct modal component association for every entry.

  Selector cases must assert a labelled region with `id="project-selector"`, six native buttons, every full project name, every description, and every technology label. Tab to the first button and press Enter; expect `onSelectProject("whackamole", buttonElement)` exactly once.

- [ ] **Step 2: Run the focused tests and confirm the expected failure.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false --runTestsByPath src/components/projects/projectCatalog.test.js src/components/projects/ProjectSelector.test.js
  ```

  Expected: FAIL because neither module exists.

- [ ] **Step 3: Implement the catalog as the only project registry.**

  Import the six existing modal components into `projectCatalog.js`; do not move or copy modal content. Implement `getProjectById` defensively for non-string values and lower-case lookup input.

- [ ] **Step 4: Implement the minimal accessible selector.**

  Render a `<section id="project-selector" aria-labelledby="project-selector-heading">`, a real heading, and a `<ul>` of `<li>` items. Each project uses `<button type="button">`; keep the accessible name complete even if technology copy is visually compacted later. Put the callback on the button, not its descendants.

- [ ] **Step 5: Add selector-only desktop containment styles.**

  Start with `width/height: 100%`, `min-width/min-height: 0`, and a two-column/three-row CSS grid. Style the native buttons with a visible `:focus-visible` state and no new motion. Import `ProjectSelector` from `src/SCSS/App.scss` without removing the old Projects imports yet.

- [ ] **Step 6: Re-run the focused tests.**

  Expected: PASS; six buttons are keyboard-activatable and catalog data is authoritative.

- [ ] **Step 7: Commit this boundary.**

  ```powershell
  git add src/components/projects src/SCSS/ProjectSelector.scss src/SCSS/App.scss
  git commit -m "feat: add in-home project selector"
  ```

---

## Task 3: Mount one selected project modal and preserve HeyYou horizontally

**Minimal goal:** Adapt one validated catalog entry to its unchanged modal contract while keeping every non-selected modal unmounted.

**Files:**

- Create: `src/components/projects/ProjectModalHost.js`
- Create: `src/components/projects/ProjectModalHost.test.js`
- Create: `src/components/HeyYouModal.test.js`
- Reuse unchanged: `src/components/WhackaModal.js`
- Reuse unchanged: `src/components/KrispyModal.js`
- Reuse unchanged: `src/components/HeyYouModal.js`
- Reuse unchanged: `src/components/BardModal.js`
- Reuse unchanged: `src/components/ThisPortfolioModal.js`
- Reuse unchanged: `src/components/KanbanBoardModal.js`
- Reuse unchanged: `src/components/HorizontalScroll.js`
- Reuse unchanged: all `src/SCSS/Projects*Modal.scss`, modal header/footer SCSS, and modal keyframes

**Interface:**

```js
export default function ProjectModalHost({ selectedProjectId, onClose }) {
  // Resolve through getProjectById.
  // Return null for null/invalid IDs.
  // Otherwise render only <ModalComponent isOpen={true} closeModal={onClose} />.
}
```

- [ ] **Step 1: Write the failing host contract tests.**

  Mock all six modal modules with distinct `data-testid` outputs. Use `it.each` over all six IDs and assert that the matching modal receives `isOpen={true}` and the exact `onClose` function while the other five are absent. Add null, empty, and unknown-ID cases that render nothing.

- [ ] **Step 2: Run the host test and confirm the expected failure.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false --runTestsByPath src/components/projects/ProjectModalHost.test.js
  ```

  Expected: FAIL because the host does not exist.

- [ ] **Step 3: Implement the minimal modal adapter.**

  Perform one catalog lookup and instantiate only the returned `ModalComponent`. Do not render six modal elements with six `isOpen` expressions.

- [ ] **Step 4: Add the HeyYou characterization test without changing HeyYou.**

  Render the real `HeyYouModal` with `isOpen={true}`. Assert that `.hey-you-horizontal-scroll` exists and contains exactly eight `.hey-you-page` sections. Trigger one existing close control and assert the supplied `closeModal` callback. This locks the legacy horizontal contract before the old Projects page is removed.

- [ ] **Step 5: Run both focused tests.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false --runTestsByPath src/components/projects/ProjectModalHost.test.js src/components/HeyYouModal.test.js
  ```

  Expected: PASS. If Reactstrap transitions leave timers, disable animation only in the test render; do not change production modal behavior.

- [ ] **Step 6: Commit this boundary.**

  ```powershell
  git add src/components/projects/ProjectModalHost.js src/components/projects/ProjectModalHost.test.js src/components/HeyYouModal.test.js
  git commit -m "feat: host project modals from project catalog"
  ```

---

## Task 4: Make 3D Profile and model progress embeddable

**Minimal goal:** Reuse the current 3D scene inside parent bounds with contained loading and clean timer/canvas teardown.

**Files:**

- Create: `src/components/profile/ThreeDProfileView.js`
- Create: `src/components/profile/ThreeDProfileView.test.js`
- Create: `src/components/Progress.test.js`
- Modify: `src/components/Progress.js`
- Modify: `src/components/Logo.js`
- Modify: `src/components/3dEnvironment.js`
- Modify: `src/SCSS/HomeProgress.scss`
- Modify: `src/SCSS/ThreeDeeResume.scss`

**Interfaces:**

```js
export default function Progress({ progress, contained = false }) {}

export default function ThreeDProfileView() {
  // Owns the existing 0..100 simulated timer, then renders the embedded scene.
}

export default function BlenderEnvironment() {
  // Public signature stays unchanged; its root and Canvas size from the parent.
}
```

- [ ] **Step 1: Write failing Progress sizing tests.**

  Assert that default `<Progress progress={25} />` retains `.progress-container` without the modifier, displays `Loading...` and `25%`, and that `contained={true}` adds `.progress-container--contained` without changing copy.

- [ ] **Step 2: Write the failing ThreeDProfileView lifecycle test.**

  Mock `BlenderEnvironment`, enable fake timers, render `ThreeDProfileView`, and assert contained progress is initially visible while the scene is absent. Advance 5,000 ms and assert the scene and existing orbit-instruction copy appear. Unmount and assert no feature timer remains pending.

- [ ] **Step 3: Run the focused tests and confirm the expected failures.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false --runTestsByPath src/components/Progress.test.js src/components/profile/ThreeDProfileView.test.js
  ```

  Expected: FAIL because `Progress` has no contained mode and `ThreeDProfileView` does not exist.

- [ ] **Step 4: Add the contained Progress variant.**

  Keep `.progress-container` as the full-viewport default. Add `.progress-container--contained` with `width: 100%`, `height: 100%`, and `min-width/min-height: 0`; do not change text, timing, or remove unrelated imports/warnings in this task. Update `Logo` to pass `contained` for its model-load overlay.

- [ ] **Step 5: Extract the embedded profile wrapper.**

  Move the existing simulated timer, `BlenderEnvironment`, and orbit instructions from `screens/ThreeDeeResume.js` into `ThreeDProfileView`. Exclude the old Home button and all `window.location.href` behavior. Keep the timer interval and cleanup semantics otherwise unchanged.

- [ ] **Step 6: Size the Three Fiber environment from its parent.**

  Give the environment an explicit wrapper class and replace the Canvas inline `height: "100vh"` with `height: "100%"`. Keep the landscape GLB, animation mixer, camera, light, and OrbitControls values unchanged. Pass `contained` to the environment's asset `Progress` overlay.

- [ ] **Step 7: Scope 3D SCSS to `.three-dee-profile-view`.**

  Use `width/height: 100%`, `min-width/min-height: 0`, and `overflow: hidden`. Keep `.resume-canvas` at 100% of its parent and preserve the existing rule that hides orbit instructions below 1024px. Remove styling for the obsolete `.home-btn`; do not add visual redesign.

- [ ] **Step 8: Re-run the focused tests and the current App tests.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false --runTestsByPath src/components/Progress.test.js src/components/profile/ThreeDProfileView.test.js src/App.test.js
  ```

  Expected: PASS. Existing Home and separate-screen tests remain green until their deliberate replacement in Task 5.

- [ ] **Step 9: Commit this boundary.**

  ```powershell
  git add src/components/profile src/components/Progress.js src/components/Progress.test.js src/components/Logo.js src/components/3dEnvironment.js src/SCSS/HomeProgress.scss src/SCSS/ThreeDeeResume.scss
  git commit -m "feat: add embeddable 3d profile view"
  ```

---

## Task 5: Make Home the persistent route-backed shell

**Minimal goal:** Route all supported portfolio URLs through one mounted Home shell and implement the approved toggle, history, validation, loading, and focus behavior.

**Files:**

- Create: `src/components/home/HomeNavigation.js`
- Create: `src/components/home/HomeCenterView.js`
- Modify: `src/App.js`
- Modify: `src/screens/Home.js`
- Modify: `src/SCSS/Home.scss`
- Rewrite/expand: `src/App.test.js`

**Interfaces:**

```js
export function PortfolioRoutes() {
  // Route tree exported for MemoryRouter integration tests.
}

export default function HomeNavigation({
  activeView,
  onToggleProjects,
  onToggleThreeDProfile,
}) {}

export default function HomeCenterView({
  activeView,
  onSelectProject,
  headingRef,
}) {}
```

`HomeNavigation` owns the current Projects, Resume, 3D Profile, and MegaRacer markup. Projects and 3D Profile become native buttons. Resume remains exactly:

```html
href="/Ibrahim_Karim_Full_Stack_Resume.pdf"
target="_blank"
rel="noopener noreferrer"
```

`HomeCenterView` renders exactly one of `Logo`, `ProjectSelector`, or `ThreeDProfileView` inside a stable, labelled `#home-center-view` region. The Projects control has `aria-controls="project-selector"`, `aria-expanded`, and `aria-pressed`; 3D Profile has `aria-pressed`.

- [ ] **Step 1: Replace the old direct-screen tests with a failing route integration harness.**

  In `src/App.test.js`, render exported `PortfolioRoutes` inside `MemoryRouter`. Add a small test-only location probe with current pathname and Back/Forward buttons. Mock `Logo`, `ThreeDProfileView`, and the six modal bodies so tests do not require WebGL or full modal documents. Use `userEvent.setup({ advanceTimers: jest.advanceTimersByTime })` where fake timers are active.

- [ ] **Step 2: Add these failing shell/view tests.**

  1. Initial `/` shows the current full-page loader, then the shell and mocked Logo after 5,000 ms.
  2. Initial `/projects` shows the shell and all six choices immediately, without the unrelated Home full-page loader.
  3. Projects toggles `/` → `/projects` → `/`; `aria-pressed`/`aria-expanded` follow the route.
  4. 3D Profile toggles in the same tab `/` → `/threeDeeResume` → `/`; it has no `_blank`, replaces Logo, and restores Logo when closed.
  5. Switching Projects ↔ 3D Profile changes only the center view; exactly one center-view mock is present.
  6. Capture a biography DOM node before navigation and assert the same node object remains after child-route navigation, proving the shell did not remount.
  7. Returning to `/` after the initial loader does not show the full-page loader again.
  8. Biography, contacts, title, copyright, Resume, and MegaRacer remain in the DOM in every active view.
  9. An unsupported path such as `/about` renders no portfolio shell.

- [ ] **Step 3: Add these failing project-route/history tests.**

  1. `it.each` over all six `/projects/:id` URLs: Projects is active and only the corresponding modal mock opens.
  2. Clicking each selector button updates the URL to its exact lowercase ID.
  3. Selector-opened modal Close returns to `/projects`; Forward reopens it, proving Close used `navigate(-1)`.
  4. Browser Back after selection closes the modal and retains the selector.
  5. Starting with `['/sentinel', '/projects/bard']`, direct-deep-link Close replaces with `/projects`; a subsequent Back reaches `/sentinel`, not the modal URL.
  6. `/projects/NOT-REAL` normalizes with replace to `/projects`, opens no modal, and leaves the selector visible.
  7. Closing a selector-opened modal restores focus to the exact project button.

- [ ] **Step 4: Retain and adapt the existing content regressions.**

  Keep assertions for the two-paragraph biography, exact Resume URL/target/rel, supported TypeRacer URL and iframe title, safe MegaRacer new tab, current-year Copyright with a normal hyphen, and the 2023 single-year boundary. Remove only expectations tied to the duplicate Projects page, such as two Projects Resume links and a second Projects copyright.

- [ ] **Step 5: Run `src/App.test.js` and confirm failures describe missing persistent-shell behavior.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false --runTestsByPath src/App.test.js
  ```

  Expected: FAIL because the current app still swaps independent Home, Projects, and ThreeDeeResume screens.

- [ ] **Step 6: Build the common parent route.**

  Export `PortfolioRoutes` from `App.js` and use this route shape:

  ```jsx
  <Routes>
    <Route path="/" element={<Home />}>
      <Route index element={null} />
      <Route path="projects" element={null} />
      <Route path="projects/:projectId" element={null} />
      <Route path="threeDeeResume" element={null} />
    </Route>
  </Routes>
  ```

  `App` continues to own `BrowserRouter` and renders `<PortfolioRoutes />`. `Home` deliberately needs no visual `<Outlet>` because child matches are URL state for the parent shell; document that choice beside the route tree.

- [ ] **Step 7: Extract navigation and center-view components.**

  Move existing markup without rewriting its content. Remove `target="_blank"` from 3D Profile by replacing both internal links with buttons. Keep the existing inner class names where useful, add a button-reset class, and preserve visible keyboard focus. In `HomeCenterView`, import `PROJECTS` and pass them into `ProjectSelector`.

- [ ] **Step 8: Coordinate route state and loading in Home.**

  - Call `getPortfolioRouteState(location.pathname)` and derive both state axes; never mirror them in `useState`.
  - Keep one `initialViewRef`. Show Home's full-page `Progress` only when the initial view was `home` and progress is below 100.
  - Always let the timer advance/clean up, but render direct Projects and 3D Profile shell states immediately.
  - Remove unused `loadLogo` state/effect and stop passing the unused `setProgress` prop into `Logo`.
  - Projects toggle: navigate to `/` when already Projects, otherwise `/projects`.
  - 3D toggle: navigate to `/` when already 3D Profile, otherwise `/threeDeeResume`.
  - Project select: save the invoking button ref and navigate to `/projects/<id>` with `{ state: { projectModalOrigin: "/projects" } }`.
  - Project close: call `navigate(-1)` only when `location.state?.projectModalOrigin === "/projects"`; otherwise call `navigate("/projects", { replace: true })`.
  - Invalid selected ID: replace with `/projects` in an effect.
  - On modal transition from selected ID to `null`, restore focus to the saved button if it is still connected.

- [ ] **Step 9: Render the modal as a shell sibling and manage view focus.**

  Put `ProjectModalHost` after the persistent shell container, not inside a project button. Give the center heading `tabIndex={-1}` and move focus to it after user/history-driven active-view changes, while skipping focus movement on the initial render. Cancel any queued animation frame on cleanup.

- [ ] **Step 10: Add only the Home SCSS needed for the new semantics.**

  Preserve the existing desktop/mobile grid and responsive fixes. Add `.home-center-view` to the old center grid area, reset the new navigation buttons without erasing `:focus-visible`, and use `[data-active-view]` only for state-specific layout hooks. Defer narrow/short overlay composition to Task 7.

- [ ] **Step 11: Run the focused and related tests.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false --runTestsByPath src/App.test.js src/components/home/portfolioRouteState.test.js src/components/projects/projectCatalog.test.js src/components/projects/ProjectSelector.test.js src/components/projects/ProjectModalHost.test.js src/components/profile/ThreeDProfileView.test.js src/components/Progress.test.js src/components/HeyYouModal.test.js
  ```

  Expected: PASS for shell persistence, content preservation, direct links, history, focus, loader behavior, and component contracts.

- [ ] **Step 12: Commit this boundary.**

  ```powershell
  git add src/App.js src/App.test.js src/screens/Home.js src/components/home/HomeNavigation.js src/components/home/HomeCenterView.js src/SCSS/Home.scss
  git commit -m "feat: make home the persistent portfolio shell"
  ```

---

## Task 6: Remove obsolete routed pages and page-only effects

**Minimal goal:** Delete only the now-unreachable multi-page shells/effects after the replacement behavior is green and reference-clean.

**Files:**

- Delete: `src/screens/Projects.js`
- Delete: `src/screens/ThreeDeeResume.js`
- Delete: `src/components/Sky.js`
- Delete: `src/SCSS/Projects.scss`
- Delete: `src/SCSS/KeyframesProjects.scss`
- Delete: `src/images/static1.png`
- Delete: `src/images/static2.png`
- Modify: `src/SCSS/App.scss`
- Modify: `src/SCSS/ScrollBars.scss`

**Deletion boundary:** This is a behavior-preserving cleanup after Task 5's route tests are green. A deliberately failing source-text test would couple Jest to dead filenames without testing user behavior, so the test-first requirement is satisfied here by the already-green public behavior suite, followed by reference-audit failure if anything still imports a deletion target.

- [ ] **Step 1: Establish the green pre-deletion gate.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false
  ```

  Expected: PASS before deleting anything. Stop and fix Task 5 if not green.

- [ ] **Step 2: Audit references before deletion.**

  ```powershell
  rg -n "screens/(Projects|ThreeDeeResume)|components/Sky|static1|static2|projects-div-main|KeyframesProjects|@import \"Projects\"" src
  ```

  Expected: only the obsolete files, the two page-only SCSS imports, and the page-wrapper scrollbar selectors remain. If a modal/shared file appears, do not delete that dependency.

- [ ] **Step 3: Delete only the obsolete files listed above.**

  The removed behavior includes the black Projects page shell, duplicate navigation/social/footer/copyright, rays, noise timer, delayed reset, random `#nav-lights` mutation, long-page card layout, and standalone 3D Back button. Do not delete modal components, modal images, `HorizontalScroll`, modal SCSS, or shared modal keyframes.

- [ ] **Step 4: Remove stale centralized styles.**

  Remove only the `KeyframesProjects` and `Projects` imports from `App.scss`. In `ScrollBars.scss`, remove the top-level and `max-width: 1400px` `.projects-div-main` scrollbar blocks while preserving every HeyYou/Bard/Krispy/Whacka modal scrollbar rule.

- [ ] **Step 5: Prove no stale page reference remains.**

  ```powershell
  rg -n "Projects|ThreeDeeResume|Sky|static1|static2|projects-div-main|nav-lights|KeyframesProjects" src
  ```

  Expected: no old screen/component/image/style imports or page-wrapper selectors. References in the intentional new `ProjectSelector`, `ThreeDProfileView`, route names, test descriptions, and modal prose are acceptable after manual inspection.

- [ ] **Step 6: Re-run all tests.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false
  ```

  Expected: PASS with the same behavior coverage as before deletion.

- [ ] **Step 7: Commit this boundary.**

  ```powershell
  git add -A src/screens src/components/Sky.js src/SCSS src/images/static1.png src/images/static2.png
  git commit -m "refactor: remove obsolete routed page shells"
  ```

---

## Task 7: Finish responsive containment and run final regression checks

**Minimal goal:** Keep alternate views usable without document overflow at the approved viewport classes, then prove the complete migration passes automated, build, whitespace, and manual checks.

**Files:**

- Modify: `src/screens/Home.js`
- Modify: `src/SCSS/Home.scss`
- Modify: `src/SCSS/ProjectSelector.scss`
- Modify: `src/SCSS/ThreeDeeResume.scss`
- Modify: `src/App.test.js`
- Verify unchanged: all modal JS/SCSS and `src/components/Copyright.js`

**Responsive contract:** Desktop uses the bounded center slot and a two-column/three-row selector. At `max-width: 1250px` or a short viewport, Projects and 3D Profile use a `100dvh` (`100vh` fallback) in-shell layer, the navigation/exit control remains above it, and document scrolling is locked only while a bounded alternate view is active. Landscape phones may use a three-column/two-row selector. Modal bodies retain their own intentional scrolling.

- [ ] **Step 1: Add failing global-state cleanup assertions.**

  In `src/App.test.js`, assert that Projects and 3D Profile add `portfolio-bounded-view-open` to `document.body`, returning Home removes it, and unmounting from either alternate view removes it. Also assert the shell root exposes `data-active-view="home|projects|3d-profile"`.

- [ ] **Step 2: Run the focused test and confirm the expected failure.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false --runTestsByPath src/App.test.js
  ```

  Expected: FAIL because Home does not yet manage the bounded-view body class/data attribute.

- [ ] **Step 3: Implement bounded-view class lifecycle.**

  In a Home effect, add `portfolio-bounded-view-open` whenever `activeView !== "home"`; remove it when returning Home and in cleanup. Do not overwrite unrelated body classes. Put the exact route-derived `activeView` on the shell's `data-active-view` attribute.

- [ ] **Step 4: Complete the narrow/short viewport composition.**

  - Keep `.home-center-view`, every intermediate 3D wrapper, and every selector grid at `min-width: 0; min-height: 0`.
  - Under `@media (max-width: 1250px), (max-height: 700px)`, make the active alternate center view a fixed in-shell layer bounded by safe-area insets and the persistent navigation/exit control.
  - Apply `overflow: hidden` to `body.portfolio-bounded-view-open` only inside that media query.
  - Keep the alternate-view control at least 44px and above the layer with an explicit z-index.
  - Keep all six selector buttons visible. Use two columns/three rows for portrait and `@media (orientation: landscape) and (max-height: 500px)` for three columns/two rows.
  - Use `clamp()`, grid fractions, gaps, and safe-area insets; do not introduce per-device pixel offsets.
  - Bound `.resume-canvas` to 100% of its wrapper and preserve the sub-1024px hidden orbit instructions.
  - Add no new animations; add a `prefers-reduced-motion` override only if an existing reused animation would otherwise be newly applied to selector/view transitions.

- [ ] **Step 5: Re-run automated tests.**

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false
  ```

  Expected: PASS for every route, component, accessibility, focus, history, loading, Copyright, and cleanup assertion.

- [ ] **Step 6: Start the app and execute this exact manual viewport matrix.**

  ```powershell
  npm start
  ```

  Test `320×568`, `375×667`, `390×844`, `430×932`, `768×1024`, `1024×768`, `1440×900`, `844×390`, and `667×375`.

  At every size verify:

  - `/` reveals the unchanged Home presentation after its initial loader.
  - `/projects` immediately shows all six choices with no document vertical or horizontal scrollbar.
  - Projects toggles closed from the same persistent control and keyboard focus is visible.
  - Each selector button is reachable by keyboard/touch and opens the correct URL/modal.
  - Header Close, footer Close, Escape, permitted backdrop close, browser Back, and focus restoration behave as specified.
  - Direct `/projects/heyyou` closes to `/projects`; HeyYou still scrolls horizontally by wheel, touch, and native scrollbar.
  - Every other modal retains its internal long-content scrolling, header/footer reachability, and responsive rules.
  - `/threeDeeResume` is bounded, OrbitControls do not intercept input outside the center/layer, and toggling Home leaves no hidden canvas.
  - Resume, MegaRacer, contacts, title, biography, and Copyright remain unchanged.
  - Rotate between portrait and landscape; safe-area/short-height controls remain reachable.

- [ ] **Step 7: Run the production verification gate exactly.**

  Stop the dev server, then run:

  ```powershell
  $env:CI='true'; npm test -- --watchAll=false
  npm run build
  git diff --check
  ```

  Expected: tests pass, the production build succeeds, and `git diff --check` produces no output. Record—but do not fix in this branch—the pre-existing Jest open-handle notice and Create React App/Babel warning if they remain.

- [ ] **Step 8: Run the final scope and status audit.**

  ```powershell
  rg -n "window\.location|target=\"_blank\"|projects-div-main|nav-lights|static1|static2" src/App.js src/screens src/components src/SCSS
  git diff --name-status
  git status --short --branch
  ```

  Inspect every match: Resume/external links may use `_blank`; internal Projects/3D controls must not. Confirm no modal content/SCSS, Copyright implementation, Firebase config, dependencies, README, or unrelated files changed.

- [ ] **Step 9: Commit this boundary.**

  ```powershell
  git add src/screens/Home.js src/SCSS/Home.scss src/SCSS/ProjectSelector.scss src/SCSS/ThreeDeeResume.scss src/App.test.js
  git commit -m "fix: contain portfolio views across viewport sizes"
  ```

---

## Deferred Scope

- Detailed visual redesign or polish for the Projects selector.
- Replacement effects for the retired rays/static/noise presentation.
- Any project modal redesign, content rewrite, link change, or broad legacy-modal accessibility remediation.
- Real/cached progress consolidation, GLB preloading, timer removal, camera/orbit persistence, or other loading optimization.
- Home biography, animated-name, navigation identity, contacts, Copyright, Resume PDF, or Resume behavior redesign.
- New routes/aliases, dependency upgrades, Create React App/Babel/deprecation/open-handle warning cleanup, README changes, Firebase changes, analytics, deployment, or release work.

## Plan Self-Review

- Every approved public path maps to the one Home parent and has an automated direct-link test.
- Both route axes are derived, not synchronized through duplicate state.
- All six catalog entries, buttons, URLs, and modal adapters have table-driven coverage.
- Selector-open, direct-deep-link, Back, Forward, invalid-ID, and focus-return paths are explicit.
- Home initial loading, direct alternate-view loading, contained model loading, timer cleanup, and one-canvas lifetime are covered.
- Existing biography, Resume, MegaRacer, Copyright hyphen/current-year/boundary behavior, and modal contracts stay protected.
- Old screens/effects are deleted only after behavior is green and reference searches prove they are unreachable.
- Responsive behavior has exact manual dimensions and checks that automated DOM tests cannot substitute for.
- Each task has an independent commit boundary; no implementation commit is part of creating this plan.
