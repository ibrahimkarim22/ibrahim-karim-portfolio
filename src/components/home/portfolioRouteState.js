export const PORTFOLIO_VIEWS = Object.freeze({
  HOME: "home",
  PROJECTS: "projects",
  RESUME: "resume",
  THREE_D_PROFILE: "3d-profile",
});

export function getPortfolioRouteState(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/") {
    return { activeView: PORTFOLIO_VIEWS.HOME, selectedProjectId: null };
  }

  if (normalizedPath === "/projects") {
    return { activeView: PORTFOLIO_VIEWS.PROJECTS, selectedProjectId: null };
  }

  if (normalizedPath === "/resume") {
    return { activeView: PORTFOLIO_VIEWS.RESUME, selectedProjectId: null };
  }

  const projectMatch = normalizedPath.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    return {
      activeView: PORTFOLIO_VIEWS.PROJECTS,
      selectedProjectId: projectMatch[1].toLowerCase(),
    };
  }

  if (normalizedPath === "/threeDeeResume") {
    return { activeView: PORTFOLIO_VIEWS.THREE_D_PROFILE, selectedProjectId: null };
  }

  return null;
}
