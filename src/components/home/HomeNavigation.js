import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Modal } from "reactstrap";
import { PORTFOLIO_VIEWS } from "./portfolioRouteState";
import { SECTION_LIGHTS } from "./portfolioLighting";

const IDLE_MOTION = { kind: null, source: null, phase: "idle" };
const MOTION_FINISH_ANIMATIONS = {
  projects: "navigation-projects-settle",
  resume: "navigation-document-word",
  profile: "navigation-stereo-center",
  racer: "navigation-racer-enchant",
};
const STATIC_MOTION_QUERIES = ["(prefers-reduced-motion: reduce)", "(hover: none), (pointer: coarse)"];

function getStaticMotionMedia() {
  return STATIC_MOTION_QUERIES.map((query) => window.matchMedia?.(query))
    .filter((media, index) => media && (!media.media || media.media === STATIC_MOTION_QUERIES[index]));
}

function NavigationWord({ kind, children, className }) {
  return (
    <span className={`navigation-lettering navigation-lettering--${kind}`}>
      {kind === "profile" && (
        <>
          <span className="navigation-channel navigation-channel--red" aria-hidden="true">{children}</span>
          <span className="navigation-channel navigation-channel--cyan" aria-hidden="true">{children}</span>
        </>
      )}
      <span
        className={`navigation-word ${className}`}
        data-motion-finish={kind}
        style={kind === "projects" ? { "--projects-letter-count": children.length } : undefined}
      >{kind === "projects" ? Array.from(children).map((letter, index) => (
        <span className="navigation-project-letter" aria-hidden="true" style={{ "--project-letter-index": index, "--project-letter-offset": index - (children.length - 1) / 2 }} key={index}>{letter}</span>
      )) : children}</span>
      {kind === "resume" && (
        <span className="navigation-document-assembly" aria-hidden="true">
          <span className="navigation-document-page navigation-document-page--rear" />
          <span className="navigation-document-page navigation-document-page--front" />
          <svg className="navigation-document-rules" viewBox="0 0 240 100" preserveAspectRatio="none" focusable="false"><path d="M12 12h145m-145 17h214M12 48h196M12 68h214M12 88h125" /></svg>
          <svg className="navigation-document-crops" viewBox="0 0 240 100" preserveAspectRatio="none" focusable="false"><path d="M15 0v10M0 15h10m215-15v10m5 5h10M0 85h10m5 5v10m215-15h10m-15 5v10" /></svg>
        </span>
      )}
      {kind === "racer" && (
        <svg className="navigation-racer-spell" viewBox="0 0 280 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path className="navigation-racer-trail" d="M12 82C76 94 189 68 268 79" pathLength="100" />
          <g className="navigation-racer-spark">
            <path d="M12 73l2.5 6.5 6.5 2.5-6.5 2.5-2.5 6.5-2.5-6.5-6.5-2.5 6.5-2.5Z" />
          </g>
          <path className="navigation-racer-rune" d="m52 83 3 4-3 4-3-4Z" />
          <path className="navigation-racer-rune" d="m92 81 2.4 3-2.4 3-2.4-3Z" />
        </svg>
      )}
    </span>
  );
}

function NavigationDestinations({ activeView, onSelect }) {
  const racerTouchRef = useRef(false);
  const [racerPlayback, setRacerPlayback] = useState(0);
  const [motion, setMotion] = useState(IDLE_MOTION);
  const motionRef = useRef(IDLE_MOTION);
  const keyboardModeRef = useRef(true);
  const staticMotionRef = useRef(getStaticMotionMedia().some((media) => media.matches));

  const updateMotion = useCallback((next) => {
    motionRef.current = next;
    setMotion(next);
  }, []);

  const clearMotion = useCallback(() => updateMotion(IDLE_MOTION), [updateMotion]);

  const beginMotion = useCallback((kind, source) => {
    const current = motionRef.current;
    if (current.kind === kind && current.phase !== "idle") {
      if (current.source !== source) updateMotion({ ...current, source });
      return;
    }
    updateMotion({ kind, source, phase: staticMotionRef.current || source === "touch" ? "held" : "playing" });
  }, [updateMotion]);

  function releaseMotion(kind, source) {
    if (motionRef.current.kind === kind && motionRef.current.source === source) clearMotion();
  }

  function enterPointer(kind, event) {
    if (event.relatedTarget?.nodeType && event.currentTarget.contains(event.relatedTarget)) return;
    if (event.pointerType === "touch") return;
    keyboardModeRef.current = false;
    beginMotion(kind, "pointer");
  }

  function leavePointer(kind, event) {
    if (event.relatedTarget?.nodeType && event.currentTarget.contains(event.relatedTarget)) return;
    releaseMotion(kind, "pointer");
  }

  function finishMotion(kind, event) {
    if (event.target.dataset.motionFinish !== kind || event.animationName !== MOTION_FINISH_ANIMATIONS[kind]) return;
    const current = motionRef.current;
    if (current.kind === kind && current.phase === "playing") updateMotion({ ...current, phase: "held" });
  }

  useEffect(() => {
    const media = getStaticMotionMedia();
    const updatePreferences = () => {
      staticMotionRef.current = media.some((query) => query.matches);
      if (staticMotionRef.current && motionRef.current.phase === "playing") updateMotion({ ...motionRef.current, phase: "held" });
    };
    const keyboardInput = () => { keyboardModeRef.current = true; };
    const pointerInput = () => {
      keyboardModeRef.current = false;
      if (motionRef.current.source === "keyboard") clearMotion();
    };
    media.forEach((query) => {
      if (query.addEventListener) query.addEventListener("change", updatePreferences);
      else query.addListener?.(updatePreferences);
    });
    document.addEventListener("keydown", keyboardInput, true);
    document.addEventListener("pointerdown", pointerInput, true);
    window.addEventListener("blur", clearMotion);
    return () => {
      media.forEach((query) => {
        if (query.removeEventListener) query.removeEventListener("change", updatePreferences);
        else query.removeListener?.(updatePreferences);
      });
      document.removeEventListener("keydown", keyboardInput, true);
      document.removeEventListener("pointerdown", pointerInput, true);
      window.removeEventListener("blur", clearMotion);
    };
  }, [clearMotion, updateMotion]);

  function controlMotionProps(kind) {
    return {
      "data-motion-phase": motion.kind === kind ? motion.phase : "idle",
      "data-motion-source": motion.kind === kind ? motion.source : undefined,
      onFocus: () => { if (keyboardModeRef.current) beginMotion(kind, "keyboard"); },
      onBlur: () => releaseMotion(kind, "keyboard"),
      onKeyDown: (event) => { if (event.key === "Enter" || event.key === " ") beginMotion(kind, "keyboard"); },
      onPointerDown: (event) => beginMotion(kind, event.pointerType === "touch" ? "touch" : "pointer"),
      onPointerUp: (event) => { if (event.pointerType === "touch") releaseMotion(kind, "touch"); },
      onPointerCancel: () => { if (motionRef.current.kind === kind) clearMotion(); },
      onAnimationEnd: (event) => finishMotion(kind, event),
    };
  }

  function activateRacer() {
    if (!racerTouchRef.current || keyboardModeRef.current) {
      setRacerPlayback((playback) => playback + 1);
      updateMotion({ kind: "racer", source: keyboardModeRef.current ? "keyboard" : "pointer", phase: staticMotionRef.current ? "held" : "playing" });
    }
    onSelect(PORTFOLIO_VIEWS.MEGARACER);
  }
  const racerMotionProps = controlMotionProps("racer");
  const isRacerActive = activeView === PORTFOLIO_VIEWS.MEGARACER;

  return (
    <>
      {[
        [PORTFOLIO_VIEWS.PROJECTS, "Projects", "projects", "projects-title-div-container", "projects-title-div", "project-selector"],
        [PORTFOLIO_VIEWS.RESUME, "Resume", "resume", "pdfResume-title-div-container", "pdfResume-title-div", "resume-view"],
        [PORTFOLIO_VIEWS.THREE_D_PROFILE, "3D profile", "profile", "threeResume-title-div-container", "threeResume-title-div"],
      ].map(([view, label, kind, containerClass, wordClass, controls], index) => {
        const isActive = activeView === view;
        return (
          <button
            key={view}
            type="button"
            className={`home-navigation-button navigation-destination navigation-destination--${kind}`}
            aria-label={kind === "profile" ? "3D Profile" : kind === "projects" ? label : undefined}
            aria-controls={controls}
            aria-expanded={controls ? isActive : undefined}
            aria-pressed={isActive}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onSelect(view)}
            style={view !== PORTFOLIO_VIEWS.RESUME ? { "--destination-source": SECTION_LIGHTS[view] } : undefined}
            {...controlMotionProps(kind)}
            onPointerEnter={(event) => enterPointer(kind, event)}
            onPointerLeave={(event) => leavePointer(kind, event)}
          >
            <span className="navigation-index" aria-hidden="true">0{index + 1}</span>
            <span className={containerClass}><NavigationWord kind={kind} className={wordClass}>{label}</NavigationWord></span>
            {isActive && <span className="navigation-current" aria-hidden="true">Current</span>}
          </button>
        );
      })}
      <div className="megaracer-container navigation-racer-container">
        <button
          className="home-navigation-button navigation-destination navigation-destination--racer"
          type="button"
          aria-controls="megaracer-view"
          aria-expanded={isRacerActive}
          aria-pressed={isRacerActive}
          aria-current={isRacerActive ? "page" : undefined}
          style={{ "--destination-source": SECTION_LIGHTS.megaracer }}
          onClick={activateRacer}
          {...racerMotionProps}
          onPointerEnter={(event) => enterPointer("racer", event)}
          onPointerLeave={(event) => leavePointer("racer", event)}
          onPointerDown={(event) => { racerTouchRef.current = event.pointerType === "touch"; racerMotionProps.onPointerDown(event); }}
        >
          <span className="navigation-index" aria-hidden="true">04</span>
          <NavigationWord kind="racer" className="megaracer" key={racerPlayback}>Megaracer</NavigationWord>
          {isRacerActive && <span className="navigation-current" aria-hidden="true">Current</span>}
        </button>
      </div>
    </>
  );
}

export default function HomeNavigation({
  activeView,
  routeKey,
  isNarrowLayout = false,
  onToggleProjects,
  onToggleResume,
  onToggleThreeDProfile,
  onToggleMegaracer,
  onBackHome,
  onBack,
  onSheetClosed,
  onLightingSelect,
}) {
  const [isShortLayout, setIsShortLayout] = useState(() => window.innerHeight <= 700);
  const [isOpen, setIsOpen] = useState(false);
  const [wheelAnchor, setWheelAnchor] = useState(null);
  const [homeActivation, setHomeActivation] = useState(0);
  const navRef = useRef(null);
  const triggerRef = useRef(null);
  const homePointerFocusRef = useRef(false);
  const openedViewRef = useRef(null);
  const openedRouteKeyRef = useRef(null);
  const wasWheelOpenRef = useRef(false);
  const closeReasonRef = useRef("cancel");
  const onSheetClosedRef = useRef(onSheetClosed);
  onSheetClosedRef.current = onSheetClosed;

  const isHome = activeView === PORTFOLIO_VIEWS.HOME;
  const isCompact = !isHome && (isNarrowLayout || isShortLayout);
  const navMode = isCompact ? "compact" : isHome && isNarrowLayout ? "artwork" : "desktop";
  // History and resize can invalidate an open wheel before its state effect runs.
  const isWheelVisible = isOpen && isCompact && openedViewRef.current === activeView && openedRouteKeyRef.current === routeKey;

  useEffect(() => {
    const updateHeight = () => {
      setIsShortLayout(window.innerHeight <= 700);
      if (wasWheelOpenRef.current) {
        closeReasonRef.current = "cancel";
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    if (isOpen && !isWheelVisible) setIsOpen(false);
  }, [isOpen, isWheelVisible]);

  useLayoutEffect(() => {
    if (wasWheelOpenRef.current && !isWheelVisible) {
      // The child modal has unmounted. The shell owns its body overflow policy.
      onSheetClosedRef.current?.();
      const changedDestination = openedViewRef.current !== activeView || openedRouteKeyRef.current !== routeKey || closeReasonRef.current === "destination";
      if (!changedDestination) {
        if (isCompact) triggerRef.current?.focus();
        else navRef.current?.querySelector('[aria-current="page"]')?.focus();
      }
    }
    wasWheelOpenRef.current = isWheelVisible;
  }, [isWheelVisible, isCompact, activeView, routeKey]);

  useEffect(() => () => {
    if (wasWheelOpenRef.current) onSheetClosedRef.current?.({ unmount: true });
  }, []);

  function openWheel() {
    const bounds = triggerRef.current?.getBoundingClientRect();
    setWheelAnchor(bounds?.width ? { left: bounds.left, top: bounds.top } : null);
    openedViewRef.current = activeView;
    openedRouteKeyRef.current = routeKey;
    closeReasonRef.current = "cancel";
    setIsOpen(true);
  }

  function closeWheel() {
    closeReasonRef.current = "cancel";
    setIsOpen(false);
  }

  function selectDestination(view) {
    onLightingSelect?.(view);
    if (isWheelVisible) {
      closeReasonRef.current = activeView === view ? "cancel" : "destination";
      setIsOpen(false);
    }
    if (activeView === view) return;
    const select = {
      [PORTFOLIO_VIEWS.HOME]: onBackHome,
      [PORTFOLIO_VIEWS.PROJECTS]: onToggleProjects,
      [PORTFOLIO_VIEWS.RESUME]: onToggleResume,
      [PORTFOLIO_VIEWS.THREE_D_PROFILE]: onToggleThreeDProfile,
      [PORTFOLIO_VIEWS.MEGARACER]: onToggleMegaracer,
    }[view];
    select?.();
  }

  function pulseHome() {
    setHomeActivation((activation) => activation + 1);
  }

  const homeControl = (
      <button
        className="home-navigation-button navigation-home"
        type="button"
        data-home-activation={homeActivation}
        aria-current={isHome ? "page" : undefined}
        onPointerEnter={(event) => { if (event.pointerType !== "touch") pulseHome(); }}
        onPointerDown={() => { homePointerFocusRef.current = true; }}
        onPointerCancel={() => { homePointerFocusRef.current = false; }}
        onBlur={() => { homePointerFocusRef.current = false; }}
        onFocus={(event) => { if (!homePointerFocusRef.current && event.currentTarget.matches(":focus-visible")) pulseHome(); }}
        onClick={() => { pulseHome(); selectDestination(PORTFOLIO_VIEWS.HOME); }}
      ><span className="navigation-home__activation navigation-lettering navigation-lettering--home">
        <span className="navigation-home__label navigation-word" key={homeActivation}>Home</span>
        <span className="navigation-home__moon" aria-hidden="true">
          <span className="navigation-home__moonlight" />
          <span className="navigation-home__moon-float">
            <span className="navigation-home__moon-scale">
              <svg className="navigation-home__moon-icon" viewBox="0 0 24 24" focusable="false">
                <g className="navigation-home__moon-drift">
                  <circle className="navigation-home__moon-disc" cx="12" cy="12" r="9" />
                  <circle className="navigation-home__moon-crater" cx="8" cy="10" r="2.1" />
                  <circle className="navigation-home__moon-crater" cx="15" cy="14" r="1.6" />
                  <circle className="navigation-home__moon-crater" cx="14.5" cy="7.8" r="1" />
                </g>
              </svg>
            </span>
          </span>
        </span>
      </span></button>
  );

  return (
    <nav className="menu-items portfolio-navigation" aria-label="Portfolio navigation" data-nav-mode={navMode} ref={navRef}>
      {!isCompact && homeControl}
      {isCompact ? (
        <>
        <button
          className="navigation-trigger"
          type="button"
          aria-label="Navigate"
          aria-haspopup="dialog"
          aria-controls="portfolio-navigation-dialog"
          aria-expanded={isWheelVisible}
          ref={triggerRef}
          onClick={openWheel}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <button className="navigation-back" type="button" aria-label="Go back" onClick={onBack || (() => selectDestination(PORTFOLIO_VIEWS.HOME))}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 5-7 7 7 7M5 12h15" /></svg>
        </button>
        </>
      ) : <NavigationDestinations activeView={activeView} onSelect={selectDestination} />}
      {isWheelVisible && (
        <Modal
          id="portfolio-navigation-dialog"
          isOpen
          toggle={closeWheel}
          labelledBy="portfolio-navigation-heading"
          modalClassName="navigation-wheel-modal"
          className="navigation-wheel"
          contentClassName="navigation-wheel__content"
          backdropClassName="navigation-wheel-backdrop"
          fade={false}
          autoFocus={false}
          keyboard
          backdrop
          trapFocus
          returnFocusAfterClose={false}
          zIndex={1100}
        >
          <div
            className="navigation-wheel__surface"
            style={wheelAnchor ? { "--wheel-anchor-left": `${wheelAnchor.left}px`, "--wheel-anchor-top": `${wheelAnchor.top}px` } : undefined}
            onClick={(event) => { if (!event.target.closest("button")) closeWheel(); }}
          >
            <h2 id="portfolio-navigation-heading" className="visually-hidden">Choose a destination</h2>
            <button className="navigation-wheel__close" type="button" aria-label="Close navigation" autoFocus onClick={closeWheel}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M6 18 18 6" /></svg>
            </button>
            <nav className="navigation-wheel__destinations" aria-label="Navigation destinations" data-nav-mode="wheel">
              {homeControl}
              <NavigationDestinations activeView={activeView} onSelect={selectDestination} />
            </nav>
            <div className="navigation-wheel__hub" aria-hidden="true"><span>navigate</span><span>choose a page</span></div>
          </div>
        </Modal>
      )}
    </nav>
  );
}
