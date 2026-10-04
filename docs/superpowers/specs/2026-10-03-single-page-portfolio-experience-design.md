# Single-Page Portfolio Experience Design

**Date:** 2026-10-03  
**Branch:** `feat/single-page-portfolio-experience`  
**Status:** Design only; no feature implementation is authorized by this document

## Intent and constraints

The portfolio should feel like one persistent Home experience. The biography, animated-name area, right-side navigation, contact links, copyright, white visual identity, and current responsive work remain the shell. Projects and 3D Profile become alternate content inside that shell rather than separate page experiences. Resume remains the existing PDF link.

Success means:

- ordinary Projects and 3D Profile navigation never causes a document reload or opens another tab;
- Projects toggles open and closed inside Home, with all project choices available without scrolling down a Projects page;
- a project modal opens over Home and closes back to the same Projects selector;
- 3D Profile replaces the animated-name region and restores the name when closed;
- existing project and 3D direct links still resolve;
- the six existing modal experiences, including HeyYou's horizontal layout, remain intact;
- no new dependency or unrelated refactor is introduced; and
- desktop, tablet, mobile, and landscape-phone behavior remains usable without new page overflow.

This specification is intentionally architectural. Detailed visual design is deferred.

## A. Current architecture

### Application and routing

`src/App.js` uses `BrowserRouter` and renders three independent screen components:

| URL | Current screen | Current behavior |
| --- | --- | --- |
| `/` | `Home` | Biography, animated 3D name, right-side navigation, contacts, copyright |
| `/projects` | `Projects` | Separate black Projects page with six project cards, effects, duplicate navigation/footer |
| `/projects/:projectId` | `Projects` | Same Projects page with one route-selected modal open |
| `/threeDeeResume` | `ThreeDeeResume` | Separate full-viewport 3D scene and a hard navigation back button |

Firebase Hosting already rewrites all requests to `index.html`, so these direct client-side URLs work when loaded or refreshed.

### Home

`src/screens/Home.js` currently owns:

- a five-second simulated progress counter that gates the entire Home screen;
- the biography and permanent visual shell markup;
- the `Logo` React Three Fiber canvas;
- `Link` navigation to Projects and to 3D Profile, with 3D Profile opening in a new tab;
- the Resume PDF anchor, MegaRacer preview, contacts, title, and shared `Copyright` component.

`src/SCSS/Home.scss` is a four-column, three-row, `100vh` desktop grid. At `max-width: 1250px`, it becomes a six-row responsive layout with `height: auto` and `min-height: 100svh`. The responsive branch added width constraints, fluid sizes, wrapped contacts, minimum touch sizes, and safer TypeRacer preview sizing; these rules are regression-sensitive.

### Projects

`src/screens/Projects.js` currently combines several responsibilities:

- route parsing and navigation for project modal state;
- inline markup and metadata for all six project choices;
- mounting all six modal components;
- a separate fixed navigation and separate footer/contact presentation;
- static/noise timing through `static2.png` (`static1.png` is imported but unused);
- random navigation box-shadow mutation through `document.getElementById`;
- the `Sky` ray effect; and
- the black page-level Projects layout.

The project IDs currently used by direct modal routes are:

| Route ID | Displayed project | Modal component |
| --- | --- | --- |
| `whackamole` | Whack a Mole | `WhackaModal` |
| `krispy` | KRISPY | `KrispyModal` |
| `heyyou` | HeyYou | `HeyYouModal` |
| `bard` | BARD | `BardModal` |
| `thisportfolio` | Portfolio / This Portfolio | `ThisPortfolioModal` |
| `kanban` | Tuh-Doo / Kanban Board | `KanbanBoardModal` |

Each modal accepts the same `{ isOpen, closeModal }` contract and uses a fullscreen Reactstrap `Modal`. Each conditionally renders its heavy header, body, and footer only while open. HeyYou wraps its content in `HorizontalScroll`, which converts vertical wheel input to horizontal motion and snaps to `.hey-you-page` offsets. Existing modal SCSS includes recent mobile, short-viewport, touch-target, overflow, header, and footer fixes.

`src/SCSS/Projects.scss` is page-oriented: a tall grid, fixed navigation, large cards, effects, and a duplicate footer. On narrow screens it intentionally becomes a long one-column page. It cannot serve as the new viewport-contained selector without carrying over the old page architecture.

### 3D Profile and loading

`src/screens/ThreeDeeResume.js` owns another five-second simulated progress counter. After the counter finishes, it mounts `BlenderEnvironment`, interaction instructions, and a button that assigns `window.location.href = "/"`.

`src/components/3dEnvironment.js` owns the 3D Profile canvas, GLTF scene, animation mixer, camera, orbit controls, and a second progress overlay based on GLTF loading. The canvas has an inline `height: 100vh`, and `src/SCSS/ThreeDeeResume.scss` assumes a standalone `100vw`/`100vh` page. Those viewport assumptions must be changed before the scene can safely live inside Home's center region.

`src/components/Logo.js` similarly owns its GLTF scene, animation mixer, canvas, responsive camera position, and actual-load progress overlay. The Home-level timer and the model-level loader are distinct. `Home`'s `loadLogo` state and the `setProgress` prop passed to `Logo` are currently unused by `Logo`.

The GLB sizes are approximately 632 KB for `logo.glb` and 5.3 MB for `landscape2.glb`, making simultaneous hidden canvases an unnecessary GPU and memory cost.

### Tests and current baseline

`src/App.test.js` is the only application test file. It directly renders `Home` and `Projects` inside `MemoryRouter`, mocks the logo, ray effect, and all project modals, and verifies biography content, Resume links, TypeRacer behavior, and copyright output. It does not currently test route configuration, project opening/closing, direct project routes, 3D Profile, browser history, view toggling, or accessibility state.

At inspection time, `npm test -- --watchAll=false --runInBand` reports 6 passing and 2 failing tests. Both failures are pre-existing relative to this design work: the uncommitted `src/components/Copyright.js` change renders a hyphen while the tests expect an en dash. This feature must not absorb or obscure that unrelated working-tree change.

## B. Problems with the current multi-page flow

1. Home, Projects, and 3D Profile are separate top-level experiences, so navigating between them replaces the user context instead of changing the focal content.
2. Projects duplicates navigation, contacts, copyright, and page structure that Home already provides.
3. Project metadata, selector markup, routing, effects, and modal ownership are coupled in one 335-line screen.
4. Modal state is encoded by splitting `location.pathname`, with no validation or central project registry.
5. The Projects page requires substantial vertical scrolling, especially below 1400px, which conflicts with the intended in-place selector.
6. The Projects rays, noise, black background, random DOM mutation, and animated footer are page effects rather than project-content dependencies.
7. 3D Profile assumes the whole viewport and uses a document navigation to return Home.
8. Keeping both 3D scenes mounted but visually hidden would continue render loops and retain two WebGL contexts.
9. Current tests exercise content but do not protect the navigation and state transitions this refactor changes.

## C. Proposed single-page architecture

### Recommended approach: route-backed persistent Home shell

Use one persistent `Home` route layout for all supported portfolio URLs. The URL is the compatibility and history layer; Home derives two small, explicit state axes from it:

```text
activeView: "home" | "projects" | "3d-profile"
selectedProjectId: valid project ID | null
```

The route tree keeps `Home` as the common parent so moving among child matches does not replace the shell:

```text
Home shell
├── /                              -> activeView "home"
├── /projects                      -> activeView "projects"
├── /projects/:projectId           -> activeView "projects" + selected project
└── /threeDeeResume                -> activeView "3d-profile"
```

Navigation uses React Router's client-side `navigate`, so the address, browser history, reload behavior, and direct links remain truthful without a document reload. A path change here is a state transition inside the mounted shell, not a transition to another screen.

The center region becomes a single view slot:

```text
Home shell
├── biography (persistent)
├── center view
│   ├── Logo                         when activeView = home
│   ├── ProjectSelector              when activeView = projects
│   └── ThreeDProfileView            when activeView = 3d-profile
├── navigation (persistent)
├── contacts/title/copyright (persistent)
└── ProjectModalHost (overlay, selectedProjectId-controlled)
```

Only the center view changes. The project modal is a sibling overlay owned by the shell, not a child of a project card and not a fourth active view.

### Alternatives considered

1. **Pure local state plus route-only initializers.** This would let `/` stay in the address bar during every toggle, but a direct `/projects` page could display Home after a local toggle while the URL still says Projects. Refresh and browser back/forward would become ambiguous, and synchronization effects would be more complex than route-derived state. Rejected.
2. **Keep separate page routes and share extracted components.** This could reduce duplication, but each route would still replace or remount the page-level experience and would preserve the conceptual multi-page flow. It also invites two competing shell implementations. Rejected.
3. **Hide all views with CSS while leaving them mounted.** This would make switching appear instant, but both React Three Fiber render loops and WebGL contexts would remain live, and focusable hidden content would need additional management. Rejected.

## D. Component responsibilities

### `Home` / Home shell

- Render the existing biography, navigation, contacts, title, copyright, and white shell once.
- Read the supported route match and derive `activeView` and `selectedProjectId`.
- Expose small handlers for toggling Projects, toggling 3D Profile, opening a project, and closing a project.
- Render one center view at a time.
- Render `ProjectModalHost` outside the selector so modal clicks cannot bubble to a selector card.
- Preserve the existing Home loading state, but scope its visible gate to the animated-name view so direct Projects and 3D Profile URLs do not acquire an extra Home-loader delay.

`Home` should coordinate these parts, not contain their detailed markup. Its current navigation and center content should be extracted as focused components as the refactor adds behavior.

### `HomeNavigation`

- Render the current Projects, Resume, 3D Profile, and MegaRacer controls.
- Receive `activeView`, `onToggleProjects`, and `onToggleThreeDProfile`.
- Keep Resume as `/Ibrahim_Karim_Full_Stack_Resume.pdf`, in a safe new tab.
- Render Projects and 3D Profile as semantic buttons because they toggle in-page state; neither should use `target="_blank"`.
- Expose pressed/expanded state for assistive technology.

### `HomeCenterView`

- Choose exactly one of `Logo`, `ProjectSelector`, or `ThreeDProfileView` from `activeView`.
- Provide a stable, size-constrained center-region wrapper.
- Avoid retaining inactive canvases in the DOM.

### `projectCatalog`

- Be the single source of truth for the six route IDs, display labels, descriptions, technology labels, and modal component association.
- Preserve current IDs so existing `/projects/:projectId` bookmarks continue to work.
- Support future selector redesign without changing modal routing or duplicating content.
- Export project lookup/validation used by both selector and modal host.

### `ProjectSelector`

- Render every catalog entry as a native button in a compact grid/list.
- Receive only `projects` and `onSelectProject`.
- Contain no modal markup, route parsing, page footer, duplicated navigation, rays, noise, or 3D code.
- Remain visually replaceable in a later design branch.

### `ProjectModalHost`

- Receive `selectedProjectId` and `onClose`.
- Resolve the selected catalog item and mount only that existing modal component.
- Pass the established `{ isOpen: true, closeModal: onClose }` contract.
- Render nothing for `null` or an invalid ID.
- Preserve every existing modal component and its existing SCSS, including HeyYou and `HorizontalScroll`.

### `ThreeDProfileView`

- Extract the reusable loading-and-scene content from the standalone `ThreeDeeResume` screen.
- Own the 3D Profile's existing simulated load state for now.
- Render `BlenderEnvironment` and its interaction instructions inside the center-region bounds.
- Omit the old standalone "Back to Menu" button; the persistent 3D Profile navigation control performs the toggle.
- Leave the actual GLTF scene, camera, animation, and controls in `3dEnvironment.js`.

### `Progress`

- Preserve the existing loading copy and visual treatment.
- Add a contained sizing mode for progress shown inside the center slot; keep the default full-viewport mode for the initial `/` Home load.
- Prevent embedded Logo or 3D Profile progress from creating `100vw`/`100vh` overflow inside the persistent shell.

## E. State model

The route-derived state has these valid combinations:

| `activeView` | `selectedProjectId` | Meaning |
| --- | --- | --- |
| `home` | `null` | Animated name is visible |
| `projects` | `null` | Project selector is visible |
| `projects` | valid ID | Project selector remains the background state and the selected modal is open |
| `3d-profile` | `null` | Embedded 3D Profile is visible |

Invalid combinations are not representable. A project ID always implies `activeView = "projects"`. Leaving Projects clears modal selection. Existing local loading progress remains separate from these navigation axes. No global state library or context is needed.

An unknown `/projects/:projectId` should be normalized with a replace navigation to `/projects`, leaving the valid selector visible rather than producing a blank or dead page. The six known IDs remain case-normalized to lowercase.

## F. Navigation behavior

- From Home, selecting Projects navigates client-side to `/projects` and changes only the center view.
- While Projects is active and no modal is open, selecting Projects again navigates client-side to `/` and restores the animated name.
- From Home or Projects, selecting 3D Profile navigates client-side to `/threeDeeResume` and changes only the center view.
- While 3D Profile is active, selecting 3D Profile again navigates client-side to `/` and restores the animated name.
- Selecting the other view while Projects or 3D Profile is active switches directly to that view.
- Resume retains its current PDF URL and new-tab behavior.
- Biography, contacts, copyright, title, and shell do not navigate or remount during these transitions.
- Browser back and forward traverse the same states because the URL remains canonical.

## G. Projects toggle behavior

Projects replaces the animated name in the center view; it is never appended below Home. All six choices are rendered at once inside a selector whose height and width are capped by the center slot.

The selector layout must use a finite grid/list with `min-height: 0`, `min-width: 0`, and no document-level vertical overflow. At desktop sizes, a two-column by three-row grid is the default architecture. At narrower widths, the grid can change column count and density, but it must continue to expose all six choices without creating a long page. Text and technology detail may become more compact at constrained sizes; no project choice may disappear.

For narrow or short viewports where the existing stacked Home layout cannot display the biography, navigation, and six choices simultaneously, the Projects center view becomes a viewport-bounded in-shell layer. The Home shell remains mounted behind it, a persistent Projects control remains available to collapse it, and body/document scrolling is locked only while that layer is active. This is responsive composition of the Home shell, not a separate Projects page or a project-detail modal. Exact styling and transition design remain deferred.

The second Projects activation always returns to the prior normal Home presentation. No selector state other than the optional project modal is required.

## H. Project modal behavior

- Selecting a project navigates client-side from `/projects` to `/projects/<id>`, records that the selector is the return location in router location state, and sets only `selectedProjectId`; `activeView` stays `projects`.
- `ProjectModalHost` opens the existing fullscreen modal over the same Home shell and selector state.
- Closing through the header control, footer Close button, Escape, or permitted backdrop behavior calls one close handler.
- For a modal opened from the selector, the close handler navigates back to the recorded `/projects` entry. For a direct `/projects/<id>` load with no in-app return entry, close replaces the URL with `/projects` instead of leaving the site or guessing at browser history.
- Browser Back after opening a modal naturally returns to `/projects` and closes it.
- Focus returns to the project trigger after close when the trigger is still available.
- Existing modal content, outbound actions, internal scrolling, responsive styles, and lazy conditional bodies remain unchanged during the architecture migration.
- HeyYou continues to use `HorizontalScroll` and `.hey-you-horizontal-scroll`; it must not be converted to a vertical project-detail view.

## I. 3D Profile embedding behavior

`ThreeDProfileView` occupies the same center slot as `Logo`. `BlenderEnvironment` must stop sizing its canvas to `100vh`; the wrapper and canvas use `width: 100%`, `height: 100%`, and `min-width/min-height: 0` so React Three Fiber can resize to the parent region.

The existing landscape model, camera values, animations, OrbitControls, and desktop instructions are reused. The current rule that hides instructions below 1024px is preserved unless later visual testing proves a small nonvisual adjustment is necessary. The standalone back button and `window.location.href` transition are removed from the embedded component because the persistent navigation now owns exit behavior.

Only one of `Logo` and `ThreeDProfileView` is mounted. Leaving 3D Profile unmounts its canvas and returns `Logo` to the center slot.

## J. Route/direct-link compatibility

The existing public URLs remain supported; they change destination composition, not meaning:

| Direct URL | Result after refactor |
| --- | --- |
| `/` | Home shell with animated name |
| `/projects` | Home shell with Projects selector active |
| `/projects/whackamole` | Home shell with Projects active and Whack a Mole modal open |
| `/projects/krispy` | Home shell with Projects active and KRISPY modal open |
| `/projects/heyyou` | Home shell with Projects active and HeyYou modal open |
| `/projects/bard` | Home shell with Projects active and BARD modal open |
| `/projects/thisportfolio` | Home shell with Projects active and This Portfolio modal open |
| `/projects/kanban` | Home shell with Projects active and Kanban Board modal open |
| `/threeDeeResume` | Home shell with embedded 3D Profile active |

Keep the current casing of `/threeDeeResume` for compatibility. A lowercase alias is not required by this feature and should not be introduced without a separate URL policy decision. Firebase's existing catch-all rewrite needs no change.

The route implementation should use a common Home layout route rather than four unrelated route elements that happen to render `Home`; this makes shell persistence intentional and testable.

## K. Loading implications

Keep the current Home progress counter, but do not make it a prerequisite for every route now that Home is the route shell. Its visible behavior is route-aware:

- an initial `/` visit may keep the current full-viewport Home progress presentation before revealing the shell and animated name;
- an initial `/projects` or `/projects/:projectId` visit renders the shell and Projects state without showing the unrelated Home loader;
- an initial `/threeDeeResume` visit renders the shell and the 3D Profile's own loader without first showing the Home loader; and
- Home's progress may advance silently while another view is active, so a later return to the animated name does not create a second page-level loading sequence.

Once the shell is available:

- entering Projects mounts no 3D canvas;
- entering 3D Profile unmounts `Logo` and mounts `BlenderEnvironment` after the existing 3D Profile simulated loader, using contained progress sizing;
- leaving 3D Profile disposes that canvas through React Three Fiber unmounting and remounts `Logo`;
- revisiting either GLTF may benefit from Drei's `useGLTF` cache, but local simulated progress state and animation mixers restart on remount; and
- a cached asset may therefore still be preceded by the existing artificial timer.

This remount behavior is preferred for this branch because it avoids simultaneous WebGL contexts, inactive animation loops, hidden OrbitControls, and focus/pointer conflicts. It may cause a visible loader replay and reset the 3D camera/orbit position when a user returns. Those are documented consequences, not reasons to keep both scenes alive.

The current two-layer loading design—simulated screen progress followed by asset progress—is not redesigned here. Loading correctness, cache-aware loading, preload strategy, timer removal, progress accuracy, and transition polish belong to the deferred loading branch.

## L. Responsive strategy

### Desktop

- Preserve the current white Home grid, biography column, center column, right navigation, vertical title, contacts, and copyright.
- Give the center slot a definite bounded size and `min-width/min-height: 0`.
- Render the selector as a compact grid within that slot; render 3D Profile within the same bounds.

### Tablet

- Preserve current fluid widths, typography, contact wrapping, and canvas sizing work from `Home.scss`.
- Keep view controls at least 44px in the relevant dimension.
- Allow the center slot to take the primary available area without introducing horizontal overflow.

### Mobile portrait

- Preserve the existing safe text wrapping, responsive title sizes, TypeRacer bounds, contact wrapping, and modal header/footer fixes.
- Use the viewport-bounded in-shell Projects presentation when six choices cannot fit the normal stacked center position.
- Keep all six project buttons visible and keyboard/touch reachable without document scrolling.
- Scope 3D canvas dimensions to the active region and continue hiding desktop orbit instructions.

### Landscape phone / short viewport

- Size against `100dvh` with `100vh` fallback and safe-area insets.
- Favor a wider, shallower project grid so all choices remain visible.
- Keep the Projects/3D exit control and modal close controls at least 44px.
- Re-run the existing short-height modal breakpoints; do not overwrite them with selector styles.

Modal bodies may keep their intentional internal scrolling. The no-page-scroll requirement applies to finding/selecting a project and to switching Home views, not to reading long project-detail content inside a fullscreen modal.

## M. Accessibility considerations

- Use `<button type="button">` for Projects, 3D Profile, and each project selector item rather than click handlers on generic `div` elements.
- Give Projects and 3D Profile toggles `aria-pressed`; Projects also uses `aria-expanded` and `aria-controls` for the selector region.
- Mark the center view with a stable labelled region and move focus to its heading when a route-backed view changes, without stealing focus on the initial page load.
- Preserve visible focus styles and the recent 44px touch targets.
- Provide a semantic list or grid relationship around project buttons and include the full project name in each accessible name.
- Keep only the active center view focusable by unmounting inactive views.
- Preserve Reactstrap's modal focus trap and Escape handling, and explicitly restore focus to the invoking project button after close.
- Announce an invalid project deep link only if normalization cannot occur immediately; the preferred behavior is a replace navigation to the valid Projects selector.
- Respect `prefers-reduced-motion` for any new selector/view transition. Retrofitting all legacy animations is outside this branch, but no new unavoidable motion should be added.

## N. Files expected to change

The implementation plan should use these boundaries; exact line numbers will be captured in that later plan.

### Existing files

- `src/App.js` — replace independent screen routes with the persistent Home layout and compatible child paths.
- `src/screens/Home.js` — become the shell coordinator and remove direct page links for Projects/3D Profile.
- `src/components/Logo.js` — request contained progress sizing when model progress is shown inside the center slot.
- `src/components/Progress.js` — support full-viewport and contained sizing without changing loading content.
- `src/components/3dEnvironment.js` — replace viewport-sized canvas assumptions with parent-sized embedding.
- `src/SCSS/App.scss` — import the new selector styling and stop importing page-only Projects styling once unused.
- `src/SCSS/Home.scss` — define the center slot, active-view states, bounded viewport behavior, and responsive in-shell presentation while retaining existing fixes.
- `src/SCSS/HomeProgress.scss` — add the contained progress variant while preserving the current full-screen default.
- `src/SCSS/ThreeDeeResume.scss` — scope standalone page rules to the embedded 3D Profile region; this file may be renamed only if imports are updated atomically.
- `src/SCSS/ScrollBars.scss` — retain modal scrollbar rules but remove the obsolete `.projects-div-main` scrollbar block after the page wrapper is removed.
- `src/App.test.js` — replace separate-screen assumptions and add route/view/modal behavior coverage.

### New focused files

- `src/components/home/HomeNavigation.js` — persistent internal/external controls.
- `src/components/home/HomeCenterView.js` — active center-view switch.
- `src/components/projects/projectCatalog.js` — project metadata, stable route IDs, and modal associations.
- `src/components/projects/ProjectSelector.js` — compact accessible project choices.
- `src/components/projects/ProjectModalHost.js` — selected-project modal adapter.
- `src/components/profile/ThreeDProfileView.js` — embedded 3D Profile loading and scene wrapper.
- `src/SCSS/ProjectSelector.scss` — new selector-only responsive layout; no legacy page effects.

These boundaries are deliberate. The implementation must not fold navigation, every project card, every modal adapter, and the embedded 3D wrapper into one enlarged `Home.js`.

## O. Existing files/components that can be reused

- `Logo` and `logo.glb` for the default center view.
- `BlenderEnvironment`, `landscape2.glb`, its GLTF animation mixer, camera, and OrbitControls for 3D Profile.
- `Progress` for the existing loading presentation.
- `WhackaModal`, `KrispyModal`, `HeyYouModal`, `BardModal`, `ThisPortfolioModal`, and `KanbanBoardModal` without duplicating their contents.
- `HorizontalScroll` and all HeyYou horizontal CSS.
- All modal-specific SCSS, keyframes, shared modal headers/footers, and scrollbar styling except selectors tied only to the old Projects page wrapper.
- `Copyright`, the biography content, external links, Resume link, MegaRacer preview, contact links, and title markup from Home.
- Firebase Hosting's existing SPA rewrite.

## P. Old page-level code that may eventually become unnecessary

Once route and regression tests prove parity, these old page-only pieces can be removed rather than retained as dormant architecture:

- `src/screens/Projects.js` after its data, selector, and modal responsibilities are extracted;
- `src/screens/ThreeDeeResume.js` after `ThreeDProfileView` is embedded and all compatible routes target Home;
- `src/components/Sky.js` and its `.base`, `.ray`, and `@keyframes ray` styles;
- `static1.png` and `static2.png` if no other references remain;
- the static/noise interval, delayed reset, and random `#nav-lights` DOM mutation;
- Projects' duplicate fixed navigation, social/profile block, footer, page links, and extra copyright placement;
- `.projects-div-main`, old project card positioning, old Projects responsive long-page rules, page footer animations, and Projects-page scrollbar styling;
- `KeyframesProjects.scss` if no new selector intentionally reuses any of its page startup animations; and
- unused `Home` loading variables/props only if removing them does not redesign visible loading behavior.

Deletion should happen only after reference searches confirm that modal styles or shared keyframes do not depend on a candidate. Modal components and modal styles are not part of this retirement.

## Q. Testing strategy

### Automated component and routing tests

Use React Testing Library with `MemoryRouter` and route definitions matching `App.js`. Mock `Logo` and `ThreeDProfileView` in shell behavior tests so WebGL is not required.

Cover at minimum:

1. `/` loads the Home shell and default animated-name view after the existing timer.
2. Projects activates with one click and returns to Home with a second click.
3. 3D Profile activates in the same tab, replaces the logo, and returns the logo when toggled off.
4. Biography, navigation, contacts, Resume, title, and copyright remain present in each active view.
5. Resume retains the exact PDF `href`, `_blank`, and `noopener noreferrer` behavior.
6. `/projects` directly loads Home with the selector active.
7. `/threeDeeResume` directly loads Home with 3D Profile active.
8. Each of the six `/projects/:projectId` paths activates Projects and opens the correct modal.
9. Selecting each project opens only its corresponding modal; close returns to `/projects` and preserves the selector, including the direct-deep-link fallback.
10. Browser-history navigation closes/reopens view state predictably.
11. Unknown project IDs normalize to `/projects` without opening a modal.
12. Projects/3D controls expose correct button roles and pressed/expanded states.
13. All selector entries are keyboard activatable and focus returns to the trigger after modal close.
14. Existing biography, TypeRacer, copyright, and Resume assertions are retained or deliberately relocated, not silently dropped.

Modal-content tests should not rewrite every project modal. Treat the six existing modals as established components, add adapter contract tests around `ProjectModalHost`, and retain manual regression coverage for their full responsive presentation.

### Manual responsive verification

Verify at representative desktop, tablet, mobile portrait, and landscape-phone dimensions:

- all six project choices are visible without document vertical scrolling;
- Projects collapses from the same persistent control;
- no horizontal document overflow appears;
- 3D Profile remains bounded by its assigned region;
- switching views does not leave a hidden canvas intercepting input;
- modal headers, bodies, footers, Escape/close behavior, and scroll locking still work;
- HeyYou scrolls horizontally by wheel, touch, and native scrollbar;
- long modal bodies retain their own intended scrolling; and
- safe-area and short-height controls remain reachable.

Run the focused test suite and a production build during implementation verification. Compare test results against the documented 6-pass/2-fail baseline until the unrelated Copyright change is resolved; do not present those two existing failures as caused by this feature. Build-warning cleanup remains deferred.

## R. Risks and regression areas

| Risk | Mitigation |
| --- | --- |
| Route changes remount Home and replay its loader | Use one common parent/layout route and test shell persistence across child navigation. |
| URL and visible state diverge | Derive both state axes from supported route matches; do not maintain a second unsynchronized state copy. |
| Modal close duplicates history or leaves the site from a direct deep link | Record selector-origin navigation state; navigate back only for selector-opened modals and otherwise replace with `/projects`. |
| Invalid direct project IDs produce an empty modal state | Validate against `projectCatalog` and replace with `/projects`. |
| Selector inherits old black page/effects | Give it a new scoped stylesheet and do not render `.projects-div-main` or `Sky`. |
| Project choices overflow on narrow/short screens | Use a finite responsive grid and a viewport-bounded in-shell presentation; manually verify all six choices. |
| Embedded 3D canvas still claims `100vh`/`100vw` | Size every 3D wrapper and canvas from the center slot and add `min-width/min-height: 0`. |
| Two WebGL render loops remain active | Conditionally mount one center view; do not hide inactive canvases with CSS. |
| 3D loading visibly restarts after toggling | Accept for this branch, document it, and defer cache-aware loading design. |
| Direct Projects or 3D URLs wait through the unrelated Home timer | Gate only the animated-name view with Home progress; let compatibility views render their own content/loading immediately. |
| OrbitControls capture input outside the intended region | Bound the canvas to its wrapper and verify pointer/touch behavior at all breakpoints. |
| Modal responsiveness regresses under Home CSS | Keep modal selectors scoped and preserve the recent modal media rules. |
| HeyYou loses horizontal behavior | Reuse `HeyYouModal` and `HorizontalScroll` unchanged and manually test wheel/touch. |
| Focus becomes lost after a modal or view closes | Use native buttons, a stable center heading/region, and explicit trigger focus restoration. |
| User's existing Copyright edit is overwritten | Avoid `src/components/Copyright.js`; keep its current dirty status visible throughout implementation. |

## S. Explicitly deferred work

The following work is not part of this architectural migration:

- detailed Projects visual redesign;
- replacement or redesign of Projects rays/static/noise effects—the new selector simply does not mount them;
- project-modal visual redesign;
- changes to project content or outbound project links;
- 3D loading optimization or redesign, including real progress consolidation, preloading, cache-aware timers, or transition polish;
- changes to the Resume PDF, Resume behavior, or Resume content;
- redesign of the Home biography, animated name, navigation identity, contacts, or copyright;
- broad accessibility remediation inside legacy project content beyond preserving current behavior and making the new controls accessible;
- README update;
- unrelated Create React App, Babel, deprecation, lint, or build warning cleanup;
- dependency upgrades or new dependencies; and
- deployment, commit, push, pull request, merge, or release work.

## Design self-review

- The design uses one Home shell and two explicit route-derived state axes.
- Projects replaces the center view, shows all six choices in a bounded selector, and toggles closed again.
- No long Projects section is appended below Home.
- Project modals remain overlays on Home, close back to the Projects selector, and retain HeyYou's horizontal presentation.
- 3D Profile replaces the animated name and unmounts when the animated name returns.
- Resume is unchanged.
- Existing direct URLs remain valid through the same Firebase SPA rewrite.
- Current mobile and modal responsiveness rules are preserved as regression constraints.
- Loading redesign, detailed Projects styling, effects replacement, README work, and unrelated warning cleanup are explicitly deferred.
- This specification changes documentation only and authorizes no production implementation.
