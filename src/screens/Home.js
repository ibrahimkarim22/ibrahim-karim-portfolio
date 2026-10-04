import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Copyright from "../components/Copyright";
import HomeNavigation from "../components/home/HomeNavigation";
import HomeCenterView from "../components/home/HomeCenterView";
import HomeContextPanel from "../components/home/HomeContextPanel";
import useProjectPreview from "../components/home/useProjectPreview";
import useNarrowLayout from "../components/home/useNarrowLayout";
import AboutMeSheet from "../components/home/AboutMeSheet";
import { getPortfolioRouteState, PORTFOLIO_VIEWS } from "../components/home/portfolioRouteState";
import { getProjectById } from "../components/projects/projectCatalog";
import ProjectModalHost from "../components/projects/ProjectModalHost";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = getPortfolioRouteState(location.pathname);
  const { activeView, selectedProjectId } = routeState || {};
  const isNarrowLayout = useNarrowLayout();
  const projectPreview = useProjectPreview(activeView);
  const { onPreviewEnter } = projectPreview;
  const previousViewRef = useRef(activeView);
  const previousProjectIdRef = useRef(selectedProjectId);
  const projectTriggerRef = useRef(null);
  const headingRef = useRef(null);
  // Capture before child modals mount: Reactstrap replaces inline overflow and
  // later restores a computed value, losing the original value and priority.
  const originalBodyOverflowRef = useRef({
    value: document.body.style.getPropertyValue("overflow"),
    priority: document.body.style.getPropertyPriority("overflow"),
  });

  useEffect(() => {
    const { value, priority } = originalBodyOverflowRef.current;
    return () => {
      document.body.classList.remove("portfolio-bounded-view-open");
      document.body.style.setProperty("overflow", value, priority);
    };
  }, []);

  useEffect(() => {
    if (activeView && activeView !== PORTFOLIO_VIEWS.HOME) {
      document.body.classList.add("portfolio-bounded-view-open");
      // Between modals, let the responsive rule own the lock. Removing the
      // inline value also prevents an existing inline !important from winning.
      if (!selectedProjectId) document.body.style.removeProperty("overflow");
    } else {
      document.body.classList.remove("portfolio-bounded-view-open");
      const { value, priority } = originalBodyOverflowRef.current;
      document.body.style.setProperty("overflow", value, priority);
    }
  }, [activeView, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId && !getProjectById(selectedProjectId)) {
      navigate("/projects", { replace: true });
    }
  }, [selectedProjectId, navigate]);

  useEffect(() => {
    if (previousProjectIdRef.current && selectedProjectId === null) {
      if (projectTriggerRef.current?.isConnected) {
        projectTriggerRef.current.focus();
        // Reactstrap can restore DOM focus during unmount, when React's focus
        // handler is suppressed. Reflect that existing restoration in the caption.
        onPreviewEnter(projectTriggerRef.current.dataset.projectId, "focused");
      }
    }
    previousProjectIdRef.current = selectedProjectId;
  }, [selectedProjectId, onPreviewEnter]);

  useEffect(() => {
    const viewChanged = previousViewRef.current !== activeView;
    previousViewRef.current = activeView;
    if (!viewChanged || selectedProjectId) return;

    const frame = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [activeView, selectedProjectId]);

  function selectProject(id, trigger) {
    projectTriggerRef.current = trigger;
    navigate(`/projects/${id}`, { state: { projectModalOrigin: "/projects" } });
  }

  function closeProject() {
    if (location.state?.projectModalOrigin === "/projects") {
      navigate(-1);
    } else {
      navigate("/projects", { replace: true });
    }
  }

  function selectView(view, path) {
    if (activeView !== view) navigate(path);
  }

  // Router matches case-insensitively; the route-state parser defines which
  // exact portfolio paths are supported. Keep rejected matches out of the shell.
  if (!routeState) return null;

  return (
    <>
      <div
        className={`menu-div-main${activeView === PORTFOLIO_VIEWS.HOME ? " home-entry" : ""}`}
        data-active-view={activeView}
      >
        {!(isNarrowLayout && activeView === PORTFOLIO_VIEWS.HOME) && (
          <HomeContextPanel
            activeView={activeView}
            previewProjectId={projectPreview.previewProjectId}
          />
        )}

        <HomeCenterView
          activeView={activeView}
          onBackHome={() => navigate("/")}
          onSelectProject={selectProject}
          projectPreview={projectPreview}
          headingRef={headingRef}
        />
        <div className="full-stack-div">Full-Stack Developer</div>
        {isNarrowLayout && activeView === PORTFOLIO_VIEWS.HOME && <AboutMeSheet />}
        <HomeNavigation
          activeView={activeView}
          onToggleProjects={() => selectView(PORTFOLIO_VIEWS.PROJECTS, "/projects")}
          onToggleResume={() => selectView(PORTFOLIO_VIEWS.RESUME, "/resume")}
          onToggleThreeDProfile={() => selectView(PORTFOLIO_VIEWS.THREE_D_PROFILE, "/threeDeeResume")}
        />
        <div className="contact-items">
          <a
            href="https://www.linkedin.com/in/ibrahim-karim-abaa952a7/"
            rel="noopener noreferrer"
            target="_blank"
            className="linkedin"
            style={{ textDecoration: "none" }}
          >
            Linkedin
          </a>
          <a
            href="https://github.com/ibrahimkarim22"
            rel="noopener noreferrer"
            target="_blank"
            className="github"
            style={{ textDecoration: "none" }}
          >
            Github
          </a>
          <a
            href="mailto:22ibrahimkarim@gmail.com"
            rel="noopener noreferrer"
            target="_blank"
            className="gmail"
            style={{ textDecoration: "none" }}
          >
            Gmail
          </a>
        </div>
        <div className="home-copyright-container">
          <div className="copyright-text">
            <Copyright />
          </div>
        </div>
      </div>
      <ProjectModalHost selectedProjectId={selectedProjectId} onClose={closeProject} />
    </>
  );
}

export default Home;
