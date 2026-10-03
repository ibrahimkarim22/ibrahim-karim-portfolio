import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Progress from "../components/Progress";
import Copyright from "../components/Copyright";
import HomeNavigation from "../components/home/HomeNavigation";
import HomeCenterView from "../components/home/HomeCenterView";
import { getPortfolioRouteState, PORTFOLIO_VIEWS } from "../components/home/portfolioRouteState";
import { getProjectById } from "../components/projects/projectCatalog";
import ProjectModalHost from "../components/projects/ProjectModalHost";

function Home() {
  const [progress, setProgress] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = getPortfolioRouteState(location.pathname);
  const { activeView, selectedProjectId } = routeState || {};
  const initialViewRef = useRef(activeView);
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
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return 100;
        }
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedProjectId && !getProjectById(selectedProjectId)) {
      navigate("/projects", { replace: true });
    }
  }, [selectedProjectId, navigate]);

  useEffect(() => {
    if (previousProjectIdRef.current && selectedProjectId === null) {
      if (projectTriggerRef.current?.isConnected) {
        projectTriggerRef.current.focus();
      }
    }
    previousProjectIdRef.current = selectedProjectId;
  }, [selectedProjectId]);

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

  // Router matches case-insensitively; the route-state parser defines which
  // exact portfolio paths are supported. Keep rejected matches out of the shell.
  if (!routeState) return null;

  return (
    <>
      {initialViewRef.current === PORTFOLIO_VIEWS.HOME && progress < 100 ? (
        <Progress progress={progress} />
      ) : (
        <>
          <div className="menu-div-main" data-active-view={activeView}>
            <div className="bio-div-main-container">
              <div className="bio-div-main">
                <p>
                  Hello! I’m Ibrahim, a full-stack web and mobile developer with
                  a background in fine arts and a strong interest in UI/UX. I
                  enjoy combining development and design to create experiences
                  that are functional, intuitive, and visually engaging.
                </p>
                <p>
                  I work with technologies like JavaScript, CSS, React, React
                  Native, Node.js, APIs, and cloud tools, while also exploring
                  2D/3D design, animation, and visual storytelling. I’m always
                  learning, building, and looking for better ways to turn ideas
                  into useful digital experiences.
                </p>
              </div>
            </div>

            <HomeCenterView
              activeView={activeView}
              onSelectProject={selectProject}
              headingRef={headingRef}
            />
            <HomeNavigation
              activeView={activeView}
              onToggleProjects={() => navigate(activeView === PORTFOLIO_VIEWS.PROJECTS ? "/" : "/projects")}
              onToggleThreeDProfile={() => navigate(activeView === PORTFOLIO_VIEWS.THREE_D_PROFILE ? "/" : "/threeDeeResume")}
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
            <div className="full-stack-div">Full-Stack Developer</div>
            <div className="home-copyright-container">
              <div className="copyright-text">
                <Copyright />
              </div>
            </div>
          </div>
          <ProjectModalHost selectedProjectId={selectedProjectId} onClose={closeProject} />
        </>
      )}
    </>
  );
}

export default Home;
