import { getPortfolioRouteState, PORTFOLIO_VIEWS } from "./portfolioRouteState";

describe("getPortfolioRouteState", () => {
  it("defines Resume and Megaracer as distinct route-backed views", () => {
    expect(PORTFOLIO_VIEWS.RESUME).toBe("resume");
    expect(PORTFOLIO_VIEWS.MEGARACER).toBe("megaracer");
  });

  it.each([
    ["/", { activeView: PORTFOLIO_VIEWS.HOME, selectedProjectId: null }],
    ["/projects", { activeView: PORTFOLIO_VIEWS.PROJECTS, selectedProjectId: null }],
    ["/projects/", { activeView: PORTFOLIO_VIEWS.PROJECTS, selectedProjectId: null }],
    ["/resume", { activeView: PORTFOLIO_VIEWS.RESUME, selectedProjectId: null }],
    ["/resume/", { activeView: PORTFOLIO_VIEWS.RESUME, selectedProjectId: null }],
    ["/megaracer", { activeView: PORTFOLIO_VIEWS.MEGARACER, selectedProjectId: null }],
    ["/megaracer/", { activeView: PORTFOLIO_VIEWS.MEGARACER, selectedProjectId: null }],
    ["/projects/WHACKAMOLE", { activeView: PORTFOLIO_VIEWS.PROJECTS, selectedProjectId: "whackamole" }],
    ["/projects/not-real", { activeView: PORTFOLIO_VIEWS.PROJECTS, selectedProjectId: "not-real" }],
    ["/threeDeeResume", { activeView: PORTFOLIO_VIEWS.THREE_D_PROFILE, selectedProjectId: null }],
  ])("maps %s to route-backed state", (pathname, expected) => {
    expect(getPortfolioRouteState(pathname)).toEqual(expected);
  });

  it.each(["/about", "/projects/a/b", "/threeDeeResume/extra", "/resume/extra", "/RESUME", "/megaracer/extra", "/MEGARACER"]) (
    "returns null for unsupported path %s",
    (pathname) => {
      expect(getPortfolioRouteState(pathname)).toBeNull();
    }
  );

  it("trims repeated trailing slashes before matching", () => {
    expect(getPortfolioRouteState("/projects///")).toEqual({
      activeView: PORTFOLIO_VIEWS.PROJECTS,
      selectedProjectId: null,
    });
    expect(getPortfolioRouteState("/projects/WHACKAMOLE///")).toEqual({
      activeView: PORTFOLIO_VIEWS.PROJECTS,
      selectedProjectId: "whackamole",
    });
  });
});
