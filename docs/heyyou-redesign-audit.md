# HeyYou modal redesign — October 4, 2026

## Scope and evidence

Only HeyYou's component, focused tests, styles, and this report are in scope. No shared modal, routing, selector, resume, profile, or other project changes. No commit, push, PR, or deployment.

The following animation audit was completed **before editing animation code** against portfolio commit `2e98e23`. Technical claims were checked against a temporary, read-only clone of the linked [HeyYou repository](https://github.com/ibrahim-karim-22/fullStackPortfolioProject), commit `67bd00577544a76a63b5ea49d5623512174c287d`.

## A. Existing animation and interaction audit

| Element | Original behavior | Treatment |
| --- | --- | --- |
| Header | `heyYouModalHeaderStartup`, 5s ease-in-out, opacity 0 → 1 | Preserve timing; keep close control visibly available outside the fading title |
| Header title | `heyYouModalTitleStartup`, 5s ease-in-out, translateX 300px → 0 and gray → black | Preserve slide and timing; adapt final ink to off-white |
| Header subtitle | Same title keyframes separately, 5s | Preserve separate animation; smaller contained translation on phones |
| Main title | `heyYouModalMainTitleStartup`, 4s ease-in-out infinite; invisible at 0/100%, visible at 50/80% | Preserve exact original pulse over a steady text base so the name remains readable |
| Direction arrow | `arrow`, 4s ease-in-out infinite, horizontal ±3vw travel | Preserve as a contained gallery direction cue |
| Backend light 1 | `bgLightInfiniteHeyYouModal`, 18s ease-in-out, translated light with opacity changes | Preserve in bounded backend illustration |
| Backend light 2 | `bgLightTwoInfiniteHeyYouModal`, 22s ease-in-out, translating and flickering | Preserve |
| Backend light 3 | `bgLightThreeInfiniteHeyYouModal`, 5s step-start, flickering | Preserve at subdued visual intensity |
| Node logo | Declares `logoUpDownHeyYouInfinite`, 22s; **no matching keyframe exists anywhere in source** | Retain declaration; do not invent motion |
| Express logo | `expressLogoInfiniteHeyYouModal`, 8s step-start, brief opacity flickers and skew | Preserve |
| MongoDB logo | `mongoLogoInfiniteHeyYouModal`, 18s ease-in-out; y 200px → −132px → 200px and 360° rotation | Preserve path within a scaled illustration |
| Socket.IO logo | `socketioLogoHeyYouModal`, 10s linear infinite rotation | Preserve |
| Google Maps logos | `googleApiLogoOne` and `googleApiLogoTwo`, 20s linear, second reverse; rotateY with −250px X / −400px Z offsets | Preserve original orbits within a scaled, clipped decorative stage |
| Safety person | `faUser`, 10s linear infinite opacity pulse | Preserve with restrained SVG icon |
| Safety key | `keyHeyYouModal`, 22s linear infinite with 4s delay; y 800px → −800px plus 360° rotation | Preserve in scaled decorative column |
| Stars | `star`, four 5s linear opacity cycles, delays 0/2/4/6s | Preserve |
| Waves | `waterFurther`, 7s ease-in, +22px bob; `waterCloser`, 11s ease-in, −20px bob | Preserve |
| Whale | `dockerLogo`, 18s linear infinite, staged translation/rotation/skew | See dedicated audit below |
| Splashes | `waterSplashOne` / `waterSplashTwo`, 18s linear infinite, synchronized with whale | Preserve |
| Moon | Declares `moon`, 18s linear infinite; **no matching keyframe exists** | Retain declaration; refine static framing only |
| Cloud Run / Expo / React Native structures | Static deployment scenery and logos | Keep these scene elements |
| Footer | `heyYouModalFooterStartup`, 5s ease-in-out opacity 0 → 1; button hover scale 1.1 | Preserve startup on footer identity and hover on actions, keep functional controls visible |
| Scrolling | `HorizontalScroll`: wheel deltaY × 3 scrolls horizontally, 150ms debounce snaps smoothly to nearest `.hey-you-page`; touch scrolling | Preserve original component unchanged in product gallery; vertical case study around it |
| Close / Escape / focus | Reactstrap close toggle, Escape, auto-focus and restoration; trapFocus not explicitly enabled | Keep Reactstrap mechanics, explicitly enable trapFocus and named dialog |
| APK / GitHub | `window.open`, original destinations | Preserve URLs using semantic anchors and `noopener noreferrer` |
| Video | YouTube iframe, no autoplay query; fullscreen and referrer policy | Preserve media ID, no audio autoplay, responsive frame and direct fallback link |

No phone-image animations, scroll-triggered reveals, or deployment-logo animations exist beyond those listed. No reduced-motion overrides existed for HeyYou.

## B. Docker whale animation audit (before changes)

The whale is the existing `docker.png` image, inside `.docker-logo-container`, anchored to grid columns 10–12 and rows 6–7 in a 12×12 scene. Its width is 30vw. A foreground wave at z-index 8 masks the whale (z-index 7); distant waves use z-index 4/5. Splashes are also at z-index 8. Container-like Cloud Run, Expo, and React Native buildings sit at z-index 10/11.

The **18-second linear repeating choreography** is:

| Progress | Time | Original transform / intent |
| --- | --- | --- |
| 0% | 0s | x +10vw, y +100vh, rotation +90°; submerged start |
| 10% | 1.8s | x −2vw, y −10vh, +90°; breach |
| 15% | 2.7s | x −3vw, y −10vh, +90°; hang in air |
| 29% | 5.22s | x −20vw, y +100vh, 0°; dive / straighten |
| 50% | 9s | x −50vw, y 0, +22°; surface while traveling left |
| 70% | 12.6s | x −60vw, y +5vh, 0°; float above containers |
| 74% | 13.32s | x −65vw, y 0, +15°; prepare to dive |
| 80% | 14.4s | x −67vw, y +5vh, −80°, skewY +10°; nose down |
| 99% | 17.82s | x −68vw, y +70vh, −90°, skewY −10°; submerged |
| 100% | 18s | x 0, y +100vh, +90°; reset |

Both splashes are hidden at 0–15%, emerge at 20% (3.6s), rise at 25% (4.5s) with scale 2.5 and mirrored skew (±20° / ±50°), then fall and fade by 50% (9s). Their cycle remains synchronized with the whale. Original scene has no clipping boundary: viewport-unit travel, a 50vw moon, and 77px splash shadows cause poor containment.

Planned integration: keep image, all percentages, transform order, rotations, skews, opacity curves, 18s duration, linear easing, infinite repeat, and wave/star timing. Replace whale/splash viewport distances with equivalent **scene-relative custom-property units**. Frame the full scene at a responsive height, tune moon/shadows and copy outside the scene. Intentional underwater intervals remain; do not force the whale visible during dives. Reduced motion uses a visible composed whale above the water.

## C. Technical accuracy audit

| Claim | Source evidence | Copy decision |
| --- | --- | --- |
| Nucamp Full-Stack Honors Award | Exact wording present in original modal | Retain as existing project recognition; no invented date, rank, or external verification |
| React Native / Expo / Android | `package.json` React Native 0.74.2, Expo 51, Expo Android script; native screens; existing Android APK asset/link | Retain mobile stack and Android build context |
| Node / Express | `server.js`, package start script and dependencies | Retain |
| MongoDB / Mongoose | Server connection and four data schemas: users, groups, coordinates, communications | Retain data responsibilities; Atlas hosting is described in original modal but connection secret is unavailable, so label database MongoDB rather than asserting Atlas independently |
| Socket.IO | Server and client code; chat explicitly uses WebSocket transport, map uses default Socket.IO transport negotiation | Name Socket.IO, not claim all traffic is pure WebSockets |
| Groups | Server `createGroup`, `joinGroup`, socket rooms keyed by access key; key is `uuidv4().substring(0, 8)` | Say eight-character group access key; do not call it an encrypted or secure token |
| Location delivery | Client `updateLocation`; server stores Location then emits `locationUpdated` to `io.to(accessKey)`; map listener updates marker state | Use exact event names and flow |
| Messages | Client `sendMessage`; server stores Communication then emits `newMessage` to group room | Keep exact event names; no scale or latency guarantees |
| Google Maps | `MapAndChatScreen.js`: `react-native-maps`, `provider="google"`, `CustomMarker`; expo-location permission/current-position/watch | Describe Google Maps through react-native-maps and Expo foreground location |
| Watch frequency | `timeInterval: 1000`, `distanceInterval: 0.1`, high accuracy | Configuration only, not guaranteed one-second delivery; not needed in product copy |
| Consent / foreground | Request foreground permission; watcher mounted in map screen and removed in effect cleanup; stored access key is reused | Say permission + group join + map watcher lifecycle; remove categorical “manual input every time” / “no tracking unless visible” guarantees |
| Logout | Home sends authenticated DELETE; location route uses `$unset: {coordinates: ''}` via `updateMany`, then client clears AsyncStorage | Say coordinate fields are cleared, not records/messages deleted; no blanket privacy/security claims |
| Docker | Existing Dockerfile uses node:18-alpine, installs dependencies, copies source, exposes 8081, runs server | Retain backend containerization |
| Google Cloud Run | Original deployment narrative and Cloud Run scene; client references environment-provided CLOUD_KEY, no cloud deployment config in public source | Attribute Cloud Run hosting to original project deployment; do not imply current uptime or independently verified cloud infrastructure |
| Code screenshots | Four Socket.IO screenshots correspond to group/location/message responsibilities but are visually oversized | Replace with one short verbatim server excerpt for room-based location delivery |

## D–F. Visual problems, direction, and structure

Original eight viewport-wide pages use unrelated blue, yellow, red, white, and purple fields. Fixed grids squeeze copy and shrink the six phones, source screenshots dominate the technical story, and deployment copy competes with moving scenery. Header/footer fade all controls and styles assume large viewport geometry.

Use midnight navy, cyan signals, off-white reading surfaces, restrained green status marks, and the actual phone imagery. Avoid invented coordinates, fake maps, live-service status claims, or synthetic product UI. Vertical sequence: connection hero → mobile gallery → architecture/backend → real-time delivery → location → sharing/safety → code-to-cloud whale → honors demo. Preserve horizontal gallery navigation and all original decorative animation families, with local scaling/containment. Header/footer stay outside the body scroll; controls remain at least 44px.

## G–N. Implementation and validation

### G. Opening signal

At the user's follow-up request, the two scene-specific SVG rings now repeat continuously over 3.6s, with the second staggered by 1.8s. A short dashed connection path still resolves over 850ms, and the location lock resolves over 950ms. The existing 5s header/subtitle slide and exact 4s repeated hero-title opacity cycle remain independent. Closing removes the content; reopening mounts new title/signal elements and restarts the opening. Reduced motion disables the rings along with all other HeyYou motion. A steady underlying title prevents an unreadable first screen during the preserved pulse.

The header uses a location mark and project subtitle. Startup opacity applies to its identity rather than hiding Close. The original 5s footer startup now applies to its identity; all actions are usable immediately. The original action hover enlargement also remains. Header ink and narrow-screen slide distances adapt locally without changing other modal rules.

### H. Whale preservation and integration

The original image, 12×12 anchor grid, z-index relationships, keyframe percentages, 0–80% choreography, splash opacity/scale curves, 18s linear infinite repetition, 7s/11s waves, and delayed 5s stars are preserved. The user's targeted polish explicitly authorizes fixing the terminal dive/reset: 99% now descends to 120% of scene height, and 100% matches the hidden 0% pose. The last 1% return therefore stays below the clipped scene. Scene-relative pixel custom properties, measured before paint and maintained by ResizeObserver (window-resize fallback), replace exclusive container units. The moon is framed at 21% of scene width; wave/splash shadows scale with the scene. Deployment text sits outside the moving illustration. The scene spans the available chapter width, measuring 580px high on desktop and 270–290px on phones. Underwater intervals are deliberate parts of the original animation.

Reduced motion stops every HeyYou animation and presents the whale visibly above the water with both splashes hidden. The gallery uses native scrolling with immediate, functional navigation under that preference; the original shared scroller remains untouched.

### I. Technical content

One five-line verbatim `server.js` excerpt explains sending `locationUpdated` to a group room. Oversized code screenshots are no longer displayed. The system flow explains mobile → Node/Express/Socket.IO → MongoDB/Mongoose. A separate map chapter uses the actual map phone image, not a fabricated map. Safety copy describes the eight-character group key, foreground permission/watcher lifecycle, and clearing coordinate fields on logout without broader security guarantees. Existing honors wording and deployment narrative are retained with the evidence limits in section C.

### J. Mobile and accessibility

The modal uses fixed header/footer rows around its vertically scrolling body. The six original product images are contained as large phone views; the gallery shows three per view on desktop, two on tablets, and one on phones, retaining wheel, touch and snapping plus arrow-button/keyboard navigation. A HeyYou-only capture listener forwards exhausted wheel gestures to the body at either gallery boundary, including fractional snap offsets; the shared scroller is unchanged. Architecture and deployment copy stack on phones. Code wraps within the viewport. Buttons and links have visible focus treatment, external destinations are semantic anchors with `noopener noreferrer`, the dialog has its project heading as an accessible name, and Reactstrap focus trapping is explicitly enabled. Escape and focus restoration are verified in both JSDOM and the browser. Media-query listener detection supports both modern listeners and legacy addListener/removeListener with matching cleanup.

Screenshot review caught a legacy tablet `flex-direction: column` declaration leaking into the header; HeyYou explicitly restores its own header direction and identity width. This was fixed with local selectors and a browser regression assertion. No shared stylesheet edits were needed.

### K. Files changed

- `src/components/HeyYouModal.js` — scoped presentation, original assets/scene, semantic actions, gallery and accessibility.
- `src/SCSS/ProjectsHeyYouModal.scss` — complete HeyYou visual system, responsive framing and reduced motion.
- `src/SCSS/KeyframesHeyYouModal.scss` — local distance/ink variables and new signal keyframes; original choreography retained.
- `src/components/HeyYouModal.test.js` — focused component/integration tests.
- `scripts/heyyou-modal-review.cjs` — repeatable runtime, animation and screenshot review; Playwright can be installed outside this repository via `HEYYOU_PLAYWRIGHT_PATH`.
- `docs/heyyou-redesign-audit.md` — audits, evidence and validation results.

### L. Tests and runtime review

- Test-first: redesign expectations initially failed against the old presentation (8 failed / 2 passed). During polish, both compatibility regressions failed before their fixes, and the gallery boundary regression also failed before its fix. Final focused tests: **13/13 passed**.
- Full suite: **222/222 tests in 13/13 suites passed**.
- Runtime review: **1440×900, 1024×768, 768×1024, 390×844, 320×568**. Body scroll width exactly matched body width at each size; every chapter stayed within its horizontal bounds. Minimum measured action target: **44px**. Header remained 68–72px.
- Whale: **70 timestamp samples** — 1.8s, 2.7s, 4.5s, 9s, 12.6s, 14.4s, 17.82s, 17.91s, 17.982s, 17.999s, 18s, 18.001s, 18.018s, and 18.09s at all five sizes. Runtime checks confirm exact keyframe offsets, duration/easing/repetition, original animated logo/light families, scene-relative path at 50%/70%, visible breach/surface phases, matching start/end poses, and the whole image below the scene at all eight loop-boundary samples. Screenshots cover jumps, splashes, floating, and intentional submerged phases.
- Polish geometry: map phone, exhibit, and supporting logo stage share one center axis; person is 80px and key 76px; three deployment badges retain their gradient frame and contain their content at all five sizes. Actual wheel input moves the body downward at the final gallery screen and upward at its first screen in all five layouts.
- Compatibility runtime simulation: no ResizeObserver, legacy-only MediaQueryList listeners, desktop-to-phone resize, and a live reduced-motion preference change all pass without an application error; resized whale geometry and gallery controls remain functional. Native Safari was not available for testing.
- Reduced motion: **1440×900, 390×844, 320×568**. Zero active HeyYou animations, visible static whale, working gallery buttons and Close.
- Runtime interactions: opening replay, Escape, forward/reverse focus containment, opener focus restoration, gallery arrows/keyboard, safe APK/GitHub popups (`window.opener === null`), loaded YouTube play control, initially paused media, and playback after explicit activation all passed. No application page errors were recorded.
- The original video loaded as **“Nucamp Student Project Portffolio | Hey You”** from Nucamp Bootcamp. A separate playback check observed `paused: true, currentTime: 0` before activation and `paused: false, currentTime: 0.017172, duration: 266.061` after activation. Browser review muted playback; the app does not autoplay.
- Original APK destination opens safely, but an anonymous Google Drive session is redirected to sign-in. **Anonymous APK download was not verified**; the original destination and its access permissions were preserved.

Browser plugin bootstrap reported no available browsers; its documented discovery returned an empty list. Runtime review therefore used local headless Edge through a temporary Playwright installation without adding repository dependencies. Initial redesign artifacts are in `C:\Users\ibrah\AppData\Local\Temp\heyyou-modal-review`; final polish screenshots and machine-readable results are in `C:\Users\ibrah\AppData\Local\Temp\heyyou-modal-polish` (`review-results.json`).

### M. Build, lint, compilation and diff

- Production build: **passed**, with existing warnings in `HorizontalScroll.js`, `KanbanBoardModal.js`, and `ThisPortfolioModal.js`, plus existing dependency notices.
- Changed-file ESLint: **passed**, zero errors/warnings for the two HeyYou JavaScript files and browser review script.
- Full `App.scss` compilation via the installed Sass CLI: **passed**. Compiled CSS was written to a temporary directory.
- `git diff --check`: **passed**. Windows LF/CRLF notices are informational.
- Existing tooling notices include outdated Browserslist data, the CRA Babel dependency notice, Reactstrap Fade defaultProps, Node punycode deprecation, React Router test notices, and a missing MediaPipe source map in the dev server. No unrelated files were changed to silence them.

### N. Git status

```text
 M src/SCSS/KeyframesHeyYouModal.scss
 M src/SCSS/ProjectsHeyYouModal.scss
 M src/components/HeyYouModal.js
 M src/components/HeyYouModal.test.js
?? docs/heyyou-redesign-audit.md
?? scripts/
```

The untracked `scripts/` directory contains only `heyyou-modal-review.cjs`. There were no preexisting working-tree changes. No commit, push, PR, or deployment was performed.

## Targeted polish requested during the active redesign

The existing live-signal identity, dark/light rhythm, title animation, technical story, footer actions, and whale concept remain in place. This pass changes the affected visuals and requested interactions only.

### A–B. Whale reset cause and fix

Before the polish, the 99% pose still intersected the scene at desktop proportions: at 1440×900, the whale image's top was **534.63px** inside a **580px** scene. Its final 180ms then translated from x −68% to x 0 while flipping −90° to +90°; the 100% pose also differed from the 0% x +10% pose. The scene-relative framing exposed this formerly hidden return.

The 99% dive is now y +120% instead of +70%, taking the entire image below the scene before its rapid return. The 100% pose is exactly x +10%, y +100%, rotation +90°, matching 0%. The return and loop boundary are fully clipped. The breach, hang, surface glide, diving personality, image, duration/easing, and synchronized splashes remain. No duplicated whale or generic replacement is used.

### C–E. Affected visual compositions

- Deployment logos now sit inside translucent navy gradient dock badges with soft cyan/slate borders, rounded corners, subtle inset light, and integrated service labels. They support the ocean scene; the abrupt pale rectangles are removed. Labels remain readable and wrap naturally on narrow phones.
- The location section retains text on the left and centers its unchanged phone image within the right exhibit. A restrained signal field frames the phone; Google Maps orbits now belong to that figure and share the phone/caption center axis. Mobile stacks copy before the centered figure without shrinking the original phone.
- The person/key illustration moves into a deliberate framed visual below the safety introduction. Person size increases from 32px to 80px; the key grows from roughly 11px after scaling to 76px. A persistent person outline makes the pulsing visual readable, and a dashed connection explains its relationship to the key. The key retains its 22s rotation/travel cycle and 4s delay, using a local 110px travel distance to remain visible in its stage. No broader safety claims are added.

### Additional follow-up interactions

- Signal circles between the hero phones now pulse continuously, in two staggered 3.6s cycles. The route and lock still resolve once on opening. Reduced-motion presentation remains still.
- At the last screenshot, downward wheel gestures move the modal body; at the first screenshot, upward gestures do the same. Interior wheel gestures retain the existing horizontal ×3 movement and snap. The local capture listener accounts for the one-pixel fractional snap offset found at 1024px and normalizes line/page wheel deltas. Touch, buttons, keyboard navigation, and the shared component stay intact.

Independent read-only review initially found the container-unit and legacy-listener issues. Both were fixed and verified. The final targeted review reported **no Critical, Important, or Minor findings**. Final focused/full tests, production build, changed-file lint, Sass compilation, diff checks, and the five-layout browser review are recorded above. No commit, push, PR, or deployment occurred.
