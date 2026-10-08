import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Modal } from "reactstrap";
import { PORTFOLIO_VIEWS } from "./portfolioRouteState";
import { SECTION_LIGHTS } from "./portfolioLighting";
import { ROPE_ENDS } from "./navigationRopeGeometry";
import NavigationRopes from "./NavigationRopes";
import useNavigationRopes from "./useNavigationRopes";
import "../../SCSS/HomeNavigationRopes.scss";

function NavigationWord({ kind, children, className }) {
  const view = kind === "profile" ? "3d-profile" : kind === "racer" ? "megaracer" : kind;
  const end = ROPE_ENDS[view];
  const glyphIndex = end === "left" ? 0 : children.length - 1;
  const tiedGlyph = <span className="navigation-tied-letter" data-rope-glyph data-rope-end={end}>
    {children[glyphIndex]}<span className="navigation-letter-baseline" data-rope-baseline aria-hidden="true" /><span className="navigation-rope-pin" data-rope-pin aria-hidden="true" />
  </span>;
  return <span className={`navigation-lettering navigation-lettering--${kind}`} data-rope-lever={kind} data-rope-end={end}>
    <span className={`navigation-word ${className}`}>
      {end === "left" ? tiedGlyph : children.slice(0, -1)}{end === "left" ? children.slice(1) : tiedGlyph}
    </span>
  </span>;
}

function NavigationDestinations({ activeView, onSelect }) {
  const isRacerActive = activeView === PORTFOLIO_VIEWS.MEGARACER;
  return <>
    {[
      [PORTFOLIO_VIEWS.PROJECTS, "Projects", "projects", "projects-title-div-container", "projects-title-div", "project-selector"],
      [PORTFOLIO_VIEWS.RESUME, "Resume", "resume", "pdfResume-title-div-container", "pdfResume-title-div", "resume-view"],
      [PORTFOLIO_VIEWS.THREE_D_PROFILE, "3D profile", "profile", "threeResume-title-div-container", "threeResume-title-div"],
    ].map(([view, label, kind, containerClass, wordClass, controls], index) => {
      const isActive = activeView === view;
      return <button key={view} data-rope-control={view} type="button"
        className={`home-navigation-button navigation-destination navigation-destination--${kind}`}
        aria-label={kind === "profile" ? "3D Profile" : label}
        aria-controls={controls} aria-expanded={controls ? isActive : undefined}
        aria-pressed={isActive} aria-current={isActive ? "page" : undefined}
        onClick={() => onSelect(view)}
        style={view !== PORTFOLIO_VIEWS.RESUME ? { "--destination-source": SECTION_LIGHTS[view] } : undefined}>
        <span className="navigation-index" aria-hidden="true">0{index + 1}</span>
        <span className={containerClass}><NavigationWord kind={kind} className={wordClass}>{label}</NavigationWord></span>
        {isActive && <span className="navigation-current" aria-hidden="true">Current</span>}
      </button>;
    })}
    <div className="megaracer-container navigation-racer-container">
      <button className="home-navigation-button navigation-destination navigation-destination--racer" type="button"
        data-rope-control="megaracer" aria-label="Megaracer" aria-controls="megaracer-view" aria-expanded={isRacerActive}
        aria-pressed={isRacerActive} aria-current={isRacerActive ? "page" : undefined}
        style={{ "--destination-source": SECTION_LIGHTS.megaracer }} onClick={() => onSelect(PORTFOLIO_VIEWS.MEGARACER)}>
        <span className="navigation-index" aria-hidden="true">04</span>
        <NavigationWord kind="racer" className="megaracer">Megaracer</NavigationWord>
        {isRacerActive && <span className="navigation-current" aria-hidden="true">Current</span>}
      </button>
    </div>
  </>;
}

export default function HomeNavigation({
  activeView,
  routeKey,
  isNarrowLayout = false,
  isProjectModalOpen = false,
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
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef(null);
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
  const ropes = useNavigationRopes({ navRef, mode: navMode, wheelVisible: isWheelVisible, closing: isClosing, routeKey, activeView, hidden: isProjectModalOpen });

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

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
    window.clearTimeout(closeTimerRef.current);
    setIsClosing(false);
    const bounds = triggerRef.current?.getBoundingClientRect();
    setWheelAnchor(bounds?.width ? { left: bounds.left, top: bounds.top } : null);
    openedViewRef.current = activeView;
    openedRouteKeyRef.current = routeKey;
    closeReasonRef.current = "cancel";
    setIsOpen(true);
  }

  function closeWheel() {
    closeReasonRef.current = "cancel";
    if (isClosing) return;
    ropes.cancelPending();
    if (ropes.canFold()) {
      // Reverse the actual in-flight pose, including the staggered opening.
      // Read all five layers before writing their fold departure variables.
      const departure = Array.from(document.querySelectorAll('.navigation-wheel__destinations > *')).map((element) => {
        const style = window.getComputedStyle(element);
        return { element, transform: style.transform, opacity: style.opacity };
      });
      departure.forEach(({ element, transform, opacity }) => {
        element.style.setProperty('--rope-fold-from', transform);
        element.style.setProperty('--rope-fold-opacity', opacity);
      });
      setIsClosing(true);
      closeTimerRef.current = window.setTimeout(() => { setIsOpen(false); setIsClosing(false); }, 280);
    } else setIsOpen(false);
  }

  function selectDestination(view) {
    ropes.activate(view, () => commitDestination(view));
  }

  function commitDestination(view) {
    window.clearTimeout(closeTimerRef.current);
    setIsClosing(false);
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
        data-rope-control="home"
        aria-current={isHome ? "page" : undefined}
        onPointerEnter={(event) => { if (event.pointerType !== "touch") pulseHome(); }}
        onPointerDown={() => { homePointerFocusRef.current = true; }}
        onPointerCancel={() => { homePointerFocusRef.current = false; }}
        onBlur={() => { homePointerFocusRef.current = false; }}
        onFocus={(event) => { if (!homePointerFocusRef.current && event.currentTarget.matches(":focus-visible")) pulseHome(); }}
        onClick={() => { pulseHome(); selectDestination(PORTFOLIO_VIEWS.HOME); }}
      ><span className="navigation-home__activation navigation-lettering navigation-lettering--home">
        <span className="navigation-home__label navigation-word">Home</span>
        <span className="navigation-home__moon" aria-hidden="true">
          <span className="navigation-home__moon-float">
            <span className="navigation-home__moon-pull">
            <span className="navigation-home__moonlight" />
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
        </span>
      </span></button>
  );

  return (
    <>
    <NavigationRopes layerRef={ropes.layerRef} color={SECTION_LIGHTS[activeView]} hidden={isProjectModalOpen} />
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
            data-rope-closing={isClosing ? "true" : undefined}
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
    </>
  );
}
