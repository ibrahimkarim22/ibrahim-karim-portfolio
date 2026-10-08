/* eslint-disable testing-library/no-node-access */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import HomeNavigation from "./HomeNavigation";
import { useState } from "react";
import { getNavigationMotionSnapshot, subscribeNavigationMotion } from "./navigationMotion";
import { ROPE_TUNING } from "./navigationRopeGeometry";

function Rig({ busy = false }) {
  return <div className="portfolio-light" data-bulb-phase={busy ? "retracting" : "idle"} data-rope-rig-busy={String(busy)}><div className="portfolio-light__sway" data-rope-fixture-sway><svg><g data-rope-pull><rect data-rope-rig x="45" y="109" width="2" height="2" /></g><rect data-rope-master x="45" y="44" width="2" height="2" /></svg></div></div>;
}
function prepareGeometry() {
  return jest.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function () {
    if (this.hasAttribute("data-rope-rig")) return { left: 1100, top: 82 + (parseFloat(this.closest(".portfolio-light").style.getPropertyValue("--bulb-carriage-offset")) || 0), width: 2, height: 2 };
    if (this.hasAttribute("data-rope-master")) return { left: 1100, top: 32, width: 2, height: 2 };
    return { left: 1000, top: 300, width: 120, height: 45 };
  });
}
let rects;
beforeEach(() => { jest.useFakeTimers(); rects = prepareGeometry(); window.innerHeight = 900; });
afterEach(() => { cleanup(); rects.mockRestore(); jest.clearAllTimers(); jest.useRealTimers(); });
function setup(busy = false) {
  const lighting = jest.fn(), projects = jest.fn(), resume = jest.fn(), home = jest.fn();
  const view = render(<><Rig busy={busy} /><HomeNavigation activeView="home" onLightingSelect={lighting} onToggleProjects={projects} onToggleResume={resume} onBackHome={home} /></>);
  return { ...view, lighting, projects, resume, home };
}
test("five physical cords share one rig and Home attaches through a moon layer", () => {
  const { container } = setup();
  expect(document.querySelectorAll('.navigation-rope__thread')).toHaveLength(5);
  const moon = container.querySelector('.navigation-home__moon-pull');
  expect(moon).toContainElement(container.querySelector('.navigation-home__moon-icon'));
  expect(container.querySelector('.navigation-home__label').closest('[data-rope-lever]')).toBeNull();
});
test("the attached end pulls immediately and destination opens at mechanical engagement exactly once", () => {
  const { projects, lighting } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  expect(projects).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(ROPE_TUNING.pullPeak + 10));
  expect(projects).toHaveBeenCalledTimes(1);
  expect(lighting).toHaveBeenCalledWith('projects');
  act(() => jest.advanceTimersByTime(1000));
  expect(projects).toHaveBeenCalledTimes(1);
});
test("a new request replaces an interrupted pull instead of replaying stale navigation", () => {
  const { projects, resume, lighting } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  act(() => jest.advanceTimersByTime(60));
  fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
  act(() => jest.advanceTimersByTime(ROPE_TUNING.pullPeak + 10));
  expect(projects).not.toHaveBeenCalled();
  expect(resume).toHaveBeenCalledTimes(1);
  expect(lighting).toHaveBeenCalledTimes(1);
  expect(lighting).toHaveBeenCalledWith('resume');
});
test("replacement bypasses mechanical delay and accepts the latest Home ON cue", () => {
  const { lighting } = setup(true);
  fireEvent.click(screen.getByRole('button', { name: 'Home', exact: true }));
  expect(lighting).toHaveBeenCalledTimes(1);
  expect(lighting).toHaveBeenCalledWith('home');
});
test("animation cleanup cannot replay a pending route after navigation unmounts", () => {
  const { unmount, projects } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  unmount();
  act(() => jest.advanceTimersByTime(1000));
  expect(projects).not.toHaveBeenCalled();
  expect(document.querySelector('.navigation-ropes')).toBeNull();
});

test("fixture geometry updates its rope endpoints in the same rendered frame", async () => {
  setup(true);
  act(() => jest.advanceTimersByTime(20));
  const source = document.querySelector(".portfolio-light");
  await act(async () => { source.style.setProperty("--bulb-carriage-offset", "-20px"); });
  expect(document.querySelector(".navigation-rope__thread").getAttribute("d")).toMatch(/1101 63$/);
});

test("a request during replacement supersedes a pending pull even before another frame", () => {
 const { projects, resume, lighting } = setup();
 fireEvent.click(screen.getByRole("button", { name: "Projects" }));
 document.querySelector(".portfolio-light").dataset.ropeRigBusy = "true";
 fireEvent.click(screen.getByRole("button", { name: "Resume" }));
 act(() => jest.advanceTimersByTime(1000));
 expect(projects).not.toHaveBeenCalled();
 expect(resume).toHaveBeenCalledTimes(1);
 expect(lighting).toHaveBeenCalledTimes(1);
 expect(lighting).toHaveBeenCalledWith("resume");
});

test("unavailable animation frames leave destination activation usable", () => {
 const frames = jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => { throw new Error("animation unavailable"); });
 try { const { projects } = setup(); fireEvent.click(screen.getByRole("button", { name: "Projects" })); expect(projects).toHaveBeenCalledTimes(1); } finally { frames.mockRestore(); }
});

test("history navigation supersedes an uncommitted pull", () => {
 const { rerender, projects, lighting } = setup();
 fireEvent.click(screen.getByRole("button", { name: "Projects" }));
 rerender(<><Rig /><HomeNavigation activeView="resume" routeKey="history-entry" onToggleProjects={projects} onLightingSelect={lighting} /></>);
 act(() => jest.advanceTimersByTime(1000));
 expect(projects).not.toHaveBeenCalled();
 expect(lighting).not.toHaveBeenCalled();
});

test("visible title anchors follow a responsive relayout on its first frame", () => {
 const { rerender } = setup();
 act(() => jest.advanceTimersByTime(20));
 rects.mockImplementation(function () {
  if (this.hasAttribute("data-rope-rig")) return { left: 1100, top: 82, width: 2, height: 2 };
  if (this.hasAttribute("data-rope-master")) return { left: 1100, top: 32, width: 2, height: 2 };
  return { left: 400, top: 500, width: 2, height: 2 };
 });
 rerender(<><Rig /><HomeNavigation activeView="home" isNarrowLayout /></>);
 act(() => jest.advanceTimersByTime(20));
 expect(document.querySelector('[data-rope-line="projects"] .navigation-rope__thread').getAttribute("d")).toMatch(/^M 401 501 C/);
});

test("resting stored cords stay entirely inside the header viewport", () => {
 rects.mockImplementation(function () {
  if (this.hasAttribute("data-rope-rig")) return { left: 1004, top: 54, width: 2, height: 2 };
  if (this.hasAttribute("data-rope-master")) return { left: 1004, top: 19, width: 2, height: 2 };
  return { left: 8, top: 8, width: 44, height: 44 };
 });
 render(<><Rig /><HomeNavigation activeView="projects" isNarrowLayout /></>);
 act(() => jest.advanceTimersByTime(20));
 document.querySelectorAll(".navigation-rope__thread").forEach(path => {
  const p=path.getAttribute("d").match(/-?\d+(?:\.\d+)?/g).map(Number);
  const ys=Array.from({length:101},(_,index)=>{const t=index/100,u=1-t;return u*u*u*p[1]+3*u*u*t*p[3]+3*u*t*t*p[5]+t*t*t*p[7];});
  expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
 });
});

test("layout or unfurl movement cannot take up an activation's slack", () => {
 let unfoldingY=0;
 rects.mockImplementation(function () {
  if(this.hasAttribute('data-rope-rig')) return {left:1100,top:82,width:2,height:2};
  if(this.hasAttribute('data-rope-master')) return {left:1100,top:32,width:2,height:2};
  if(this.hasAttribute('data-rope-pin')) {
   const angle=parseFloat(this.closest('[data-rope-lever]').style.getPropertyValue('--rope-angle'))||0;
   return {left:1000,top:300+unfoldingY-Math.sin(angle*Math.PI/180)*120,width:2,height:2};
  }
  return {left:1000,top:300+unfoldingY,width:120,height:45};
 });
 setup();
 fireEvent.click(screen.getByRole('button',{name:'Projects'}));
 act(()=>jest.advanceTimersByTime(20));
 unfoldingY=180;
 act(()=>jest.advanceTimersByTime(35));
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-engaged','false');
 act(()=>jest.advanceTimersByTime(170));
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-engaged','true');
});

test("fixture ascent consumes the deeper slack before lifting connected titles", async () => {
 rects.mockImplementation(function () {
  const source=document.querySelector('.portfolio-light');
  const offset=parseFloat(source?.style.getPropertyValue('--bulb-carriage-offset'))||0;
  if(this.hasAttribute('data-rope-rig')) return {left:1100,top:82+offset,width:2,height:2};
  if(this.hasAttribute('data-rope-master')) return {left:1100,top:32+offset,width:2,height:2};
  return {left:1000,top:300,width:120,height:45};
 });
 setup();
 act(()=>jest.advanceTimersByTime(20));
 const source=document.querySelector('.portfolio-light');
 await act(async()=>{source.dataset.ropeRigBusy='true'; source.style.setProperty('--bulb-carriage-offset','-20px');});
 const lever=document.querySelector('[data-rope-control="projects"] [data-rope-lever]');
 expect(parseFloat(lever.style.getPropertyValue('--rope-angle'))||0).toBe(0);
 await act(async()=>{source.style.setProperty('--bulb-carriage-offset','-85px');});
 expect(parseFloat(lever.style.getPropertyValue('--rope-angle'))).toBeGreaterThan(0);
});


test("unrelated hover and focus leave resting rope geometry asleep", () => {
 setup();
 act(() => jest.advanceTimersByTime(1500));
 rects.mockClear();
 const projects = screen.getByRole('button', { name: 'Projects' });
 fireEvent.pointerOver(projects);
 fireEvent.pointerOut(projects);
 fireEvent.focusIn(projects);
 act(() => jest.advanceTimersByTime(900));
 expect(rects).not.toHaveBeenCalled();
});

test("moving between Home descendants does not restart the resting geometry loop", () => {
 const { container } = setup();
 act(() => jest.advanceTimersByTime(1500));
 rects.mockClear();
 const label = container.querySelector('.navigation-home__label');
 const moon = container.querySelector('.navigation-home__moon-icon');
 // JSDOM lacks PointerEvent, so use native events that retain relatedTarget.
 fireEvent(label, new MouseEvent('pointerout', { bubbles: true, relatedTarget: moon }));
 fireEvent(moon, new MouseEvent('pointerover', { bubbles: true, relatedTarget: label }));
 act(() => jest.advanceTimersByTime(900));
 expect(rects).not.toHaveBeenCalled();
});

test("leaving keyboard focus on Home follows the moon's new rim without activation", () => {
 const { lighting, projects } = setup();
 act(() => jest.advanceTimersByTime(1500));
 const cord = document.querySelector('[data-rope-line="home"] .navigation-rope__thread');
 const restingPath = cord.getAttribute('d');
 const originalRect = rects.getMockImplementation();
 rects.mockImplementation(function () {
  if (this.classList.contains('navigation-home__moon-icon')) return { left: 1000, top: 300, width: 60, height: 45 };
  return originalRect.call(this);
 });
 fireEvent.focusOut(screen.getByRole('button', { name: 'Home', exact: true }), { relatedTarget: screen.getByRole('button', { name: 'Projects' }) });
 act(() => jest.advanceTimersByTime(20));
 expect(cord.getAttribute('d')).not.toBe(restingPath);
 expect(cord.getAttribute('d')).toMatch(/1101 83$/);
 expect(lighting).not.toHaveBeenCalled();
 expect(projects).not.toHaveBeenCalled();
});

test("an initially hidden project-modal rope layer performs no geometry reads", () => {
 render(<><Rig /><HomeNavigation activeView="home" isProjectModalOpen /></>);
 act(() => jest.advanceTimersByTime(1500));
 expect(document.querySelector('.navigation-ropes')).not.toBeVisible();
 expect(rects).not.toHaveBeenCalled();
});

test("hidden ropes ignore fixture and hover work and resynchronize on the reveal frame", async () => {
 const { rerender } = setup();
 act(() => jest.advanceTimersByTime(1500));
 rerender(<><Rig /><HomeNavigation activeView="home" isProjectModalOpen /></>);
 rects.mockClear();
 const source = document.querySelector('.portfolio-light');
 await act(async () => { source.dataset.ropeRigBusy = 'true'; source.style.setProperty('--bulb-carriage-offset', '-20px'); });
 fireEvent.pointerOver(screen.getByRole('button', { name: 'Home', exact: true }));
 fireEvent(window, new Event('resize'));
 act(() => jest.advanceTimersByTime(100));
 expect(rects).not.toHaveBeenCalled();
 rerender(<><Rig busy /><HomeNavigation activeView="home" /></>);
 act(() => jest.advanceTimersByTime(20));
 expect(document.querySelector('.navigation-ropes')).toBeVisible();
 document.querySelectorAll('.navigation-rope__thread').forEach(path => expect(path.getAttribute('d')).toMatch(/1101 63$/));
});

test("hidden enhancement never delays or duplicates a destination request", () => {
 const projects = jest.fn();
 render(<><Rig /><HomeNavigation activeView="home" isProjectModalOpen onToggleProjects={projects} /></>);
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 expect(projects).toHaveBeenCalledTimes(1);
 act(() => jest.advanceTimersByTime(1000));
 expect(projects).toHaveBeenCalledTimes(1);
});

test("a frame batches width and attachment reads before control and rope writes", () => {
 setup();
 act(() => jest.advanceTimersByTime(1500));
 let wrotePath = false, wrotePose = false;
 const latePathReads = [], lateWidthReads = [];
 const originalRect = rects.getMockImplementation();
 const originalFrame = window.requestAnimationFrame.bind(window);
 const originalAttribute = Element.prototype.setAttribute;
 const originalProperty = CSSStyleDeclaration.prototype.setProperty;
 const frames = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => originalFrame(time => { wrotePath = false; wrotePose = false; callback(time); }));
 const attributes = jest.spyOn(Element.prototype, 'setAttribute').mockImplementation(function (name, value) {
  if (name === 'd' && this.closest('.navigation-ropes')) wrotePath = true;
  return originalAttribute.call(this, name, value);
 });
 const properties = jest.spyOn(CSSStyleDeclaration.prototype, 'setProperty').mockImplementation(function (name, value, priority) {
  if (['--rope-angle', '--rope-x', '--rope-y'].includes(name)) wrotePose = true;
  return originalProperty.call(this, name, value, priority);
 });
 const widths = jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function () {
  if (wrotePose && this.matches('[data-rope-lever], .navigation-home')) lateWidthReads.push(this);
  return 120;
 });
 rects.mockImplementation(function () {
  if (wrotePath && this.closest('.portfolio-navigation')) latePathReads.push(this);
  return originalRect.call(this);
 });
 try {
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  act(() => jest.advanceTimersByTime(35));
  expect(document.querySelector('[data-rope-line="projects"] .navigation-rope__thread').getAttribute('d')).toMatch(/1101 83$/);
  expect(lateWidthReads).toHaveLength(0);
  expect(latePathReads).toHaveLength(0);
 } finally {
  frames.mockRestore(); attributes.mockRestore(); properties.mockRestore(); widths.mockRestore();
 }
});


test("an ordinary pull never writes neutral poses to its inactive controls", () => {
 setup();
 act(() => jest.advanceTimersByTime(1500));
 const inactive = [
  document.querySelector('.navigation-home__moon-pull'),
  ...['resume', '3d-profile', 'megaracer'].map(view => document.querySelector('[data-rope-control="' + view + '"] [data-rope-lever]')),
 ];
 const declarations = new Set(inactive.map(element => element.style));
 const originalProperty = CSSStyleDeclaration.prototype.setProperty;
 let inactiveWrites = 0;
 const properties = jest.spyOn(CSSStyleDeclaration.prototype, 'setProperty').mockImplementation(function (name, value, priority) {
  if (declarations.has(this) && ['--rope-angle', '--rope-x', '--rope-y'].includes(name)) inactiveWrites += 1;
  return originalProperty.call(this, name, value, priority);
 });
 try {
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  act(() => jest.advanceTimersByTime(80));
  expect(inactiveWrites).toBe(0);
  inactive.forEach(element => ['--rope-angle', '--rope-x', '--rope-y'].forEach(property => expect(element.style.getPropertyValue(property)).toBe('')));
 } finally { properties.mockRestore(); }
});

test("selection survives fresh unpulled baseline measurements between frames", () => {
 let collecting = false;
 const baselineSelections = [];
 const originalRect = rects.getMockImplementation();
 rects.mockImplementation(function () {
  const control = this.closest('[data-rope-control="projects"]');
  if (collecting && this.hasAttribute('data-rope-pin') && control) {
   const angle = parseFloat(control.querySelector('[data-rope-lever]').style.getPropertyValue('--rope-angle')) || 0;
   if (angle === 0) baselineSelections.push(control.hasAttribute('data-rope-selected'));
  }
  return originalRect.call(this);
 });
 setup();
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(20));
 collecting = true;
 act(() => jest.advanceTimersByTime(35));
 expect(baselineSelections.length).toBeGreaterThan(0);
 expect(baselineSelections.every(Boolean)).toBe(true);
});

test("fresh frames with unchanged geometry leave the existing SVG output untouched", async () => {
 setup();
 act(() => jest.advanceTimersByTime(1500));
 const layer = document.querySelector('.navigation-ropes');
 const path = layer.querySelector('[data-rope-line="projects"] .navigation-rope__thread');
 const before = path.getAttribute('d');
 const mutations = [];
 const observer = new MutationObserver(records => mutations.push(...records));
 observer.observe(layer, { attributes: true, subtree: true });
 try {
  await act(async () => {
   fireEvent(screen.getByRole('button', { name: 'Home', exact: true }), new MouseEvent('pointerover', { bubbles: true }));
   jest.advanceTimersByTime(120);
  });
  expect(path.getAttribute('d')).toBe(before);
  expect(path.getAttribute('d')).toMatch(/1101 83$/);
  expect(mutations).toHaveLength(0);
 } finally { observer.disconnect(); }
});

test("the master has no neutral transform while the handle still consumes slack", () => {
 setup();
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(20));
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-engaged', 'false');
 expect(document.querySelector('[data-rope-pull]')).not.toHaveAttribute('transform');
});


function measuredMoonScene(rigLeft = 900) {
 rects.mockImplementation(function () {
  if (this.hasAttribute('data-rope-rig')) return { left: rigLeft, top: 82, width: 2, height: 2 };
  if (this.hasAttribute('data-rope-master')) return { left: rigLeft, top: 32, width: 2, height: 2 };
  if (this.classList.contains('full-stack-div')) return { left: 1100, top: 490, width: 80, height: 20 };
  if (this.classList.contains('navigation-home__moon-icon')) {
   const pose = this.closest('.navigation-home__moon-pull').style;
   return { left: 990 + (parseFloat(pose.getPropertyValue('--rope-x')) || 0), top: 290 + (parseFloat(pose.getPropertyValue('--rope-y')) || 0), width: 20, height: 20 };
  }
  return { left: 1000, top: 300, width: 120, height: 45 };
 });
}

test("stacked Home aims its moon at the measured developer label and engages the same connected rig", () => {
 measuredMoonScene();
 const lighting = jest.fn(), home = jest.fn();
 render(<><Rig /><div className="full-stack-div">Full-Stack Developer</div><HomeNavigation activeView="projects" onLightingSelect={lighting} onBackHome={home} /></>);
 fireEvent.click(screen.getByRole('button', { name: 'Home', exact: true }));
 act(() => jest.advanceTimersByTime(ROPE_TUNING.pullPeak + 10));
 expect(home).toHaveBeenCalledTimes(1);
 act(() => jest.advanceTimersByTime(60));
 const moon = document.querySelector('.navigation-home__moon-pull');
 const x = parseFloat(moon.style.getPropertyValue('--rope-x')) || 0;
 const y = parseFloat(moon.style.getPropertyValue('--rope-y')) || 0;
 expect(x).toBeGreaterThan(0);
 expect(y).toBeGreaterThan(0);
 // Center (1000,300) aims at label center (1140,500): a 140:200 ray.
 expect(y / x).toBeCloseTo(10 / 7, 5);
 expect(Math.hypot(x, y)).toBeGreaterThan(56.5);
 expect(Math.hypot(x, y)).toBeLessThanOrEqual(57);
 const path = document.querySelector('[data-rope-line="home"] .navigation-rope__thread').getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
 expect(Math.hypot(path[0] - (1000 + x), path[1] - (300 + y))).toBeCloseTo(7.5, 2);
 expect(path.slice(-2)).toEqual([901, 83]);
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-engaged', 'true');
 expect(lighting).toHaveBeenCalledTimes(1);
 expect(lighting).toHaveBeenCalledWith('home');
 expect(home).toHaveBeenCalledTimes(1);
});

test.each(['absent', 'hidden'])("Home retains its existing southwest gesture when the developer label is %s", state => {
 measuredMoonScene();
 render(<><Rig />{state === 'hidden' && <div className="full-stack-div" style={{ visibility: 'hidden' }}>Full-Stack Developer</div>}<HomeNavigation activeView="home" /></>);
 fireEvent.click(screen.getByRole('button', { name: 'Home', exact: true }));
 act(() => jest.advanceTimersByTime(100));
 const pose = document.querySelector('.navigation-home__moon-pull').style;
 const x = parseFloat(pose.getPropertyValue('--rope-x')) || 0;
 const y = parseFloat(pose.getPropertyValue('--rope-y')) || 0;
 expect(x).toBeLessThan(0);
 expect(y).toBeGreaterThan(0);
 expect(x / y).toBeCloseTo(-0.72, 5);
});

test("a short wide navigation wheel keeps its existing moon gesture despite a visible right-side label", () => {
 window.innerHeight = 600;
 measuredMoonScene(1100);
 const home = jest.fn();
 render(<><Rig /><div className="full-stack-div">Full-Stack Developer</div><HomeNavigation activeView="projects" onBackHome={home} /></>);
 fireEvent.click(screen.getByRole('button', { name: 'Navigate' }));
 act(() => jest.advanceTimersByTime(1000));
 const moon = document.querySelector('.navigation-wheel__destinations .navigation-home__moon-pull');
 fireEvent.click(screen.getByRole('button', { name: 'Home', exact: true }));
 act(() => jest.advanceTimersByTime(170));
 const x = parseFloat(moon.style.getPropertyValue('--rope-x')) || 0;
 const y = parseFloat(moon.style.getPropertyValue('--rope-y')) || 0;
 expect(x).toBeLessThan(0);
 expect(y).toBeGreaterThan(0);
 expect(x / y).toBeCloseTo(-0.72, 5);
 expect(Math.hypot(x, y)).toBeGreaterThan(0);
 expect(Math.hypot(x, y)).toBeLessThanOrEqual(40);
 expect(home).not.toHaveBeenCalled();
 act(() => jest.advanceTimersByTime(80));
 expect(home).toHaveBeenCalledTimes(1);
});


function HomeHandoffHarness({ onCommit }) {
 const [view, setView] = useState('projects');
 return <><Rig /><div className="full-stack-div">Full-Stack Developer</div><HomeNavigation activeView={view} routeKey={view === 'home' ? 'home-arrived' : 'before-home'} onBackHome={() => { onCommit(); setView('home'); }} /></>;
}

test("Home commits promptly and carries one continuous moon gesture through its own route handoff", () => {
 measuredMoonScene();
 const home = jest.fn();
 render(<HomeHandoffHarness onCommit={home} />);
 const button = screen.getByRole('button', { name: 'Home', exact: true });
 const moon = button.querySelector('.navigation-home__moon-pull');
 const travel = () => Math.hypot(parseFloat(moon.style.getPropertyValue('--rope-x')) || 0, parseFloat(moon.style.getPropertyValue('--rope-y')) || 0);
 fireEvent.click(button);
 act(() => jest.advanceTimersByTime(200));
 const beforeCommit = travel();
 expect(beforeCommit).toBeGreaterThan(0);
 expect(home).not.toHaveBeenCalled();
 act(() => jest.advanceTimersByTime(40));
 expect(home).toHaveBeenCalledTimes(1);
 expect(screen.getByRole('button', { name: 'Home', exact: true })).toBe(button);
 expect(button).toHaveAttribute('aria-current', 'page');
 expect(travel()).toBeGreaterThan(beforeCommit);
 act(() => jest.advanceTimersByTime(120));
 expect(travel()).toBeGreaterThan(30);
 expect(button).toHaveAttribute('data-rope-selected', 'true');
 act(() => jest.advanceTimersByTime(1000));
 expect(travel()).toBe(0);
 expect(button).not.toHaveAttribute('data-rope-selected');
 expect(document.querySelector('[data-rope-line="home"]')).toHaveAttribute('data-active', 'false');
 expect(home).toHaveBeenCalledTimes(1);
});


test("motion stays active after route commit and ends only after the final pose is clear", () => {
 const { projects } = setup();
 const lever = document.querySelector('[data-rope-control="projects"] [data-rope-lever]');
 const endPoses = [];
 const unsubscribe = subscribeNavigationMotion(() => {
  if (!getNavigationMotionSnapshot()) endPoses.push(lever.style.getPropertyValue('--rope-angle'));
 });
 try {
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  expect(getNavigationMotionSnapshot()).toBe(true);
  act(() => jest.advanceTimersByTime(230));
  expect(projects).toHaveBeenCalledTimes(1);
  expect(getNavigationMotionSnapshot()).toBe(true);
  act(() => jest.advanceTimersByTime(600));
  expect(getNavigationMotionSnapshot()).toBe(false);
  expect(endPoses).toEqual(['']);
 } finally { unsubscribe(); }
});

test("replacing a pull begins its new token before releasing the old one", () => {
 setup();
 const changes = [];
 const unsubscribe = subscribeNavigationMotion(() => changes.push(getNavigationMotionSnapshot()));
 try {
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  act(() => jest.advanceTimersByTime(60));
  fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
  expect(changes).toEqual([true]);
  expect(getNavigationMotionSnapshot()).toBe(true);
  act(() => jest.advanceTimersByTime(850));
  expect(changes).toEqual([true, false]);
 } finally { unsubscribe(); }
});

test("fixture interruption releases the visible pulse without losing its pending destination", async () => {
 const { projects } = setup();
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 expect(getNavigationMotionSnapshot()).toBe(true);
 await act(async () => { document.querySelector('.portfolio-light').dataset.ropeRigBusy = 'true'; });
 expect(getNavigationMotionSnapshot()).toBe(false);
 expect(document.querySelector('[data-rope-control="projects"]')).not.toHaveAttribute('data-rope-selected');
 expect(projects).toHaveBeenCalledTimes(1);
});

test("hidden motion releases its token and keeps the independent route deadline", () => {
 const projects = jest.fn();
 const view = render(<><Rig /><HomeNavigation activeView="home" onToggleProjects={projects} /></>);
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(40));
 expect(getNavigationMotionSnapshot()).toBe(true);
 view.rerender(<><Rig /><HomeNavigation activeView="home" isProjectModalOpen onToggleProjects={projects} /></>);
 expect(getNavigationMotionSnapshot()).toBe(false);
 act(() => jest.advanceTimersByTime(200));
 expect(projects).toHaveBeenCalledTimes(1);
 expect(getNavigationMotionSnapshot()).toBe(false);
});

test("revealing a still-live hidden pulse resumes its original clock with a new visible token", () => {
 const { rerender } = setup();
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(40));
 rerender(<><Rig /><HomeNavigation activeView="home" isProjectModalOpen /></>);
 expect(getNavigationMotionSnapshot()).toBe(false);
 act(() => jest.advanceTimersByTime(120));
 rerender(<><Rig /><HomeNavigation activeView="home" /></>);
 act(() => jest.advanceTimersByTime(20));
 expect(getNavigationMotionSnapshot()).toBe(true);
 // The original 760ms deadline wins; reveal does not restart another 760ms.
 act(() => jest.advanceTimersByTime(630));
 expect(getNavigationMotionSnapshot()).toBe(false);
});

test("drawing failure releases motion and still dispatches the pending route", () => {
 const { projects } = setup();
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 expect(getNavigationMotionSnapshot()).toBe(true);
 rects.mockImplementation(() => { throw new Error('geometry unavailable'); });
 act(() => jest.advanceTimersByTime(20));
 expect(getNavigationMotionSnapshot()).toBe(false);
 expect(projects).toHaveBeenCalledTimes(1);
});

test("animation-frame failure releases an established pulse and routes immediately", () => {
 const { projects } = setup();
 act(() => jest.advanceTimersByTime(1500));
 const frames = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => { throw new Error('frames unavailable'); });
 try {
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  expect(getNavigationMotionSnapshot()).toBe(false);
  expect(projects).toHaveBeenCalledTimes(1);
 } finally { frames.mockRestore(); }
});

test("unmount releases its motion token and cannot dispatch the abandoned request", () => {
 const { unmount, projects } = setup();
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 expect(getNavigationMotionSnapshot()).toBe(true);
 unmount();
 expect(getNavigationMotionSnapshot()).toBe(false);
 act(() => jest.advanceTimersByTime(1000));
 expect(projects).not.toHaveBeenCalled();
});

test("immediate busy or hidden fallbacks never begin a new motion token", () => {
 const { rerender, projects, resume } = setup(true);
 const changes = [];
 const unsubscribe = subscribeNavigationMotion(() => changes.push(getNavigationMotionSnapshot()));
 try {
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  expect(projects).toHaveBeenCalledTimes(1);
  rerender(<><Rig /><HomeNavigation activeView="home" isProjectModalOpen onToggleResume={resume} /></>);
  fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
  expect(resume).toHaveBeenCalledTimes(1);
  expect(changes).toEqual([]);
  expect(getNavigationMotionSnapshot()).toBe(false);
 } finally { unsubscribe(); }
});


test.each(['removed', 'unmeasurable'])("a %s fixture ends its motion token and dispatches the pending destination", failure => {
 const { projects } = setup();
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 expect(getNavigationMotionSnapshot()).toBe(true);
 if (failure === 'removed') document.querySelector('.portfolio-light svg').replaceChildren();
 else {
  const originalRect = rects.getMockImplementation();
  rects.mockImplementation(function () {
   if (this.hasAttribute('data-rope-rig')) return { left: 0, top: 0, width: 0, height: 0 };
   return originalRect.call(this);
  });
 }
 act(() => jest.advanceTimersByTime(20));
 expect(getNavigationMotionSnapshot()).toBe(false);
 expect(projects).toHaveBeenCalledTimes(1);
 expect(document.querySelector('[data-rope-control="projects"]')).not.toHaveAttribute('data-rope-selected');
});


function measuredFixtureSway() {
 const originalRect = rects.getMockImplementation();
 rects.mockImplementation(function () {
  if (this.matches('.portfolio-light svg')) return { left: 1066.5, top: 0.5, width: 42, height: 84 };
  if (this.hasAttribute('data-rope-pin')) {
   const lever = this.closest('[data-rope-lever]');
   const angle = parseFloat(lever.style.getPropertyValue('--rope-angle')) || 0;
   const sign = lever.closest('[data-rope-control]').dataset.ropeControl === 'resume' ? 1 : -1;
   return { left: 1000, top: 300 + sign * Math.sin(angle * Math.PI / 180) * 120, width: 2, height: 2 };
  }
  return originalRect.call(this);
 });
 const frame = document.querySelector('[data-rope-fixture-sway]');
 const rig = document.querySelector('[data-rope-rig]');
 const geometry = () => {
  const angle = (parseFloat(frame.style.getPropertyValue('--rope-fixture-angle')) || 0) * Math.PI / 180;
  // Compose the actual master SVG pose and CSS ceiling rotation as the browser does.
  const master = document.querySelector('[data-rope-pull]').getAttribute('transform');
  const values = master?.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const rotation = (values?.[2] || 0) * Math.PI / 180;
  const stretched = 48 * (values?.[4] || 1);
  const pullX = -Math.sin(rotation) * stretched;
  const pullY = Math.cos(rotation) * stretched - 48;
  const x = 1087.5 + (13.5 + pullX) * Math.cos(angle) - (82.5 + pullY) * Math.sin(angle);
  const y = 0.5 + (13.5 + pullX) * Math.sin(angle) + (82.5 + pullY) * Math.cos(angle);
  return { a: 1, b: 0, c: 0, d: 1, e: x - 46, f: y - 110 };
 };
 rig.getScreenCTM = jest.fn(geometry);
 return { frame, rig, geometry, angle: () => parseFloat(frame.style.getPropertyValue('--rope-fixture-angle')) || 0 };
}

test('fixture sway waits for consumed slack, follows tension, and uses the final same-frame rig measurement', () => {
 const { projects } = setup();
 const { frame, rig, geometry, angle } = measuredFixtureSway();
 act(() => jest.advanceTimersByTime(1500));
 expect(angle()).toBe(0);
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(110));
 expect(angle()).toBe(0);
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-engaged', 'false');
 act(() => jest.advanceTimersByTime(98));
 rig.getScreenCTM.mockClear();
 act(() => jest.advanceTimersByTime(16));
 expect(angle()).toBeGreaterThan(3); // Positive rotation moves the bulb toward the left cord.
 expect(angle()).toBeLessThanOrEqual(8);
 expect(projects).toHaveBeenCalledTimes(1);
 expect(rig.getScreenCTM).toHaveBeenCalledTimes(2); // Baseline + final, no extra read phase.
 const final = geometry();
 document.querySelectorAll('.navigation-rope__thread').forEach(path => {
  const points = path.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
  expect(points[6]).toBeCloseTo(final.e + 46, 2);
  expect(points[7]).toBeCloseTo(final.f + 110, 2);
 });
 expect(document.querySelector('.portfolio-light').style.getPropertyValue('--rope-fixture-angle')).toBe('');
 act(() => jest.advanceTimersByTime(576));
 expect(document.querySelector('[data-rope-control="projects"] [data-rope-lever]').style.getPropertyValue('--rope-angle')).toBe('');
 expect(document.querySelector('[data-rope-control="projects"]')).not.toHaveAttribute('data-rope-selected');
 expect(Math.abs(angle())).toBeGreaterThan(0);
 expect(getNavigationMotionSnapshot()).toBe(true);
 act(() => jest.advanceTimersByTime(600));
 expect(frame.style.getPropertyValue('--rope-fixture-angle')).toBe('');
 expect(getNavigationMotionSnapshot()).toBe(false);
});

test.each(['hidden', 'busy', 'error', 'unmount', 'reselection'])('fixture sway clears immediately on %s without a separate animation lifetime', async reason => {
 const { rerender, unmount } = setup();
 const { frame, angle } = measuredFixtureSway();
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(230));
 expect(angle()).toBeGreaterThan(0);
 if (reason === 'hidden') rerender(<><Rig /><HomeNavigation activeView='home' isProjectModalOpen /></>);
 if (reason === 'busy') await act(async () => { document.querySelector('.portfolio-light').dataset.ropeRigBusy = 'true'; });
 if (reason === 'error') { rects.mockImplementation(() => { throw new Error('geometry unavailable'); }); act(() => jest.advanceTimersByTime(20)); }
 if (reason === 'unmount') unmount();
 if (reason === 'reselection') fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
 expect(frame.style.getPropertyValue('--rope-fixture-angle')).toBe('');
});

test('reduced-motion activation never sways the fixture', () => {
 const previousMedia = window.matchMedia;
 window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
 try {
  setup();
  const { frame, angle } = measuredFixtureSway();
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  act(() => jest.advanceTimersByTime(60));
  expect(angle()).toBe(0);
  expect(frame.style.getPropertyValue('--rope-fixture-angle')).toBe('');
  act(() => jest.advanceTimersByTime(200));
  expect(getNavigationMotionSnapshot()).toBe(false);
 } finally { window.matchMedia = previousMedia; }
});


test('the fixture-only tail keeps Profile deferred after title cleanup and releases only from the neutral final pose', () => {
 const { projects } = setup();
 const { frame, angle, geometry } = measuredFixtureSway();
 const control = document.querySelector('[data-rope-control="projects"]');
 const lever = control.querySelector('[data-rope-lever]');
 const stopped = [];
 const unsubscribe = subscribeNavigationMotion(() => {
  if (!getNavigationMotionSnapshot()) stopped.push([lever.style.getPropertyValue('--rope-angle'), frame.style.getPropertyValue('--rope-fixture-angle')]);
 });
 try {
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
  act(() => jest.advanceTimersByTime(230));
  expect(projects).toHaveBeenCalledTimes(1);
  act(() => jest.advanceTimersByTime(540));
  expect(lever.style.getPropertyValue('--rope-angle')).toBe('');
  expect(control).not.toHaveAttribute('data-rope-selected');
  expect(document.querySelector('[data-rope-line="projects"]')).toHaveAttribute('data-active', 'false');
  expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-engaged', 'false');
  expect(getNavigationMotionSnapshot()).toBe(true);
  const samples = [];
  for (let elapsed = 0; elapsed < 560; elapsed += 20) {
   act(() => jest.advanceTimersByTime(20));
   samples.push(angle());
   const final = geometry();
   document.querySelectorAll('.navigation-rope__thread').forEach(path => {
    const values = path.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
    expect(values[6]).toBeCloseTo(final.e + 46, 2);
    expect(values[7]).toBeCloseTo(final.f + 110, 2);
   });
   expect(lever.style.getPropertyValue('--rope-angle')).toBe('');
  }
  const signs = samples.filter(value => Math.abs(value) > 0.00001).map(Math.sign).filter((sign, index, values) => index === 0 || sign !== values[index - 1]);
  expect(signs.length - 1).toBeGreaterThanOrEqual(2);
  act(() => jest.advanceTimersByTime(80));
  expect(getNavigationMotionSnapshot()).toBe(false);
  expect(stopped).toEqual([['', '']]);
  expect(projects).toHaveBeenCalledTimes(1);
 } finally { unsubscribe(); }
});

test('Home clears its moon and selection at 640ms while only the fixture continues to sway', () => {
 measuredMoonScene();
 const home = jest.fn();
 render(<><Rig /><div className='full-stack-div'>Full-Stack Developer</div><HomeNavigation activeView='projects' onBackHome={home} /></>);
 const frame = document.querySelector('[data-rope-fixture-sway]');
 const control = screen.getByRole('button', { name: 'Home', exact: true });
 const moon = control.querySelector('.navigation-home__moon-pull');
 fireEvent.click(control);
 act(() => jest.advanceTimersByTime(230));
 expect(home).toHaveBeenCalledTimes(1);
 act(() => jest.advanceTimersByTime(430));
 expect(moon.style.getPropertyValue('--rope-x')).toBe('');
 expect(moon.style.getPropertyValue('--rope-y')).toBe('');
 expect(control).not.toHaveAttribute('data-rope-selected');
 expect(document.querySelector('[data-rope-line="home"]')).toHaveAttribute('data-active', 'false');
 expect(getNavigationMotionSnapshot()).toBe(true);
 act(() => jest.advanceTimersByTime(60));
 expect(Math.abs(parseFloat(frame.style.getPropertyValue('--rope-fixture-angle')) || 0)).toBeGreaterThan(0.05);
 act(() => jest.advanceTimersByTime(550));
 expect(getNavigationMotionSnapshot()).toBe(false);
 expect(frame.style.getPropertyValue('--rope-fixture-angle')).toBe('');
});

test.each(['hidden', 'busy', 'error', 'unmount', 'reselection'])('the fixture-only tail clears on %s and cannot strand its token', async reason => {
 const { rerender, unmount } = setup();
 const { frame } = measuredFixtureSway();
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(800));
 expect(getNavigationMotionSnapshot()).toBe(true);
 expect(frame.style.getPropertyValue('--rope-fixture-angle')).not.toBe('');
 if (reason === 'hidden') rerender(<><Rig /><HomeNavigation activeView='home' isProjectModalOpen /></>);
 if (reason === 'busy') await act(async () => { document.querySelector('.portfolio-light').dataset.ropeRigBusy = 'true'; });
 if (reason === 'error') { rects.mockImplementation(() => { throw new Error('geometry unavailable'); }); act(() => jest.advanceTimersByTime(20)); }
 if (reason === 'unmount') unmount();
 if (reason === 'reselection') fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
 expect(frame.style.getPropertyValue('--rope-fixture-angle')).toBe('');
 expect(getNavigationMotionSnapshot()).toBe(reason === 'reselection');
});

function renderedRopeLength(path) {
 const [sx, sy, ax, ay, bx, by, ex, ey] = path.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
 let previous = { x: sx, y: sy }, length = 0;
 for (let step = 1; step <= 600; step += 1) {
  const t = step / 600, q = 1 - t;
  const point = { x: q ** 3 * sx + 3 * q ** 2 * t * ax + 3 * q * t ** 2 * bx + t ** 3 * ex, y: q ** 3 * sy + 3 * q ** 2 * t * ay + 3 * q * t ** 2 * by + t ** 3 * ey };
  length += Math.hypot(point.x - previous.x, point.y - previous.y);
  previous = point;
 }
 return { length, extra: length - Math.hypot(ex - sx, ey - sy) };
}

test('desktop renders more actual gravity slack and still pulls its selected cord taut', () => {
 setup();
 measuredFixtureSway();
 act(() => jest.advanceTimersByTime(20));
 const path = document.querySelector('[data-rope-line="projects"] .navigation-rope__thread');
 const resting = renderedRopeLength(path);
 expect(resting.extra).toBeGreaterThan(30.5);
 expect(resting.extra).toBeLessThan(32.5);
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(230));
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-engaged', 'true');
 expect(renderedRopeLength(path).extra).toBeLessThan(0.2);
});

test('target-directed Home renders its increased effective slack and still tightens it', () => {
 measuredMoonScene();
 render(<><Rig /><div className='full-stack-div'>Full-Stack Developer</div><HomeNavigation activeView='projects' /></>);
 act(() => jest.advanceTimersByTime(20));
 const path = document.querySelector('[data-rope-line="home"] .navigation-rope__thread');
 expect(renderedRopeLength(path).extra).toBeGreaterThan(48);
 expect(renderedRopeLength(path).extra).toBeLessThan(52);
 fireEvent.click(screen.getByRole('button', { name: 'Home', exact: true }));
 act(() => jest.advanceTimersByTime(285));
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-engaged', 'true');
 expect(renderedRopeLength(path).extra).toBeLessThan(0.2);
});


test('mobile artwork keeps its added effective slack consumable by a short title pull', () => {
 render(<><Rig /><HomeNavigation activeView='home' isNarrowLayout /></>);
 measuredFixtureSway();
 act(() => jest.advanceTimersByTime(20));
 const path = document.querySelector('[data-rope-line="projects"] .navigation-rope__thread');
 expect(renderedRopeLength(path).extra).toBeGreaterThan(22.5);
 expect(renderedRopeLength(path).extra).toBeLessThan(24);
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(230));
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-engaged', 'true');
 expect(renderedRopeLength(path).extra).toBeLessThan(0.2);
});

test('open wheel cords gain actual slack and still become taut before their normal route cue', () => {
 const originalRect = rects.getMockImplementation();
 rects.mockImplementation(function () {
  if (this.matches('[data-rope-control]') && this.closest('.navigation-wheel__destinations')) {
   return { left: 1000 + (parseFloat(this.style.getPropertyValue('--rope-x')) || 0), top: 300 + (parseFloat(this.style.getPropertyValue('--rope-y')) || 0), width: 120, height: 45 };
  }
  return originalRect.call(this);
 });
 render(<><Rig /><HomeNavigation activeView='projects' isNarrowLayout /></>);
 fireEvent.click(screen.getByRole('button', { name: 'Navigate' }));
 act(() => jest.advanceTimersByTime(1000));
 const path = document.querySelector('[data-rope-line="projects"] .navigation-rope__thread');
 expect(renderedRopeLength(path).extra).toBeGreaterThan(17.5);
 expect(renderedRopeLength(path).extra).toBeLessThan(18.5);
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(208));
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-engaged', 'true');
 expect(renderedRopeLength(path).extra).toBeLessThan(0.2);
});

test('the stored bundle renders its added downward rope length', () => {
 render(<><Rig /><HomeNavigation activeView='projects' isNarrowLayout /></>);
 act(() => jest.advanceTimersByTime(400));
 const home = document.querySelector('[data-rope-line="home"] .navigation-rope__thread');
 const projects = document.querySelector('[data-rope-line="projects"] .navigation-rope__thread');
 expect(renderedRopeLength(home).extra).toBeGreaterThan(19.5);
 expect(renderedRopeLength(home).extra).toBeLessThan(20.5);
 expect(renderedRopeLength(projects).extra).toBeGreaterThan(12.7);
 expect(renderedRopeLength(projects).extra).toBeLessThan(13.7);
});

test('hiding the fixture tail cancels it rather than restarting it when the layer returns', () => {
 const { rerender } = setup();
 const { frame } = measuredFixtureSway();
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(800));
 expect(getNavigationMotionSnapshot()).toBe(true);
 rerender(<><Rig /><HomeNavigation activeView='home' isProjectModalOpen /></>);
 expect(getNavigationMotionSnapshot()).toBe(false);
 rerender(<><Rig /><HomeNavigation activeView='home' /></>);
 act(() => jest.advanceTimersByTime(20));
 expect(frame.style.getPropertyValue('--rope-fixture-angle')).toBe('');
 expect(getNavigationMotionSnapshot()).toBe(false);
});


test('the final tail frame reports resting and stops scheduling geometry work', () => {
 setup();
 measuredFixtureSway();
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(1450));
 expect(getNavigationMotionSnapshot()).toBe(false);
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-phase', 'resting');
 rects.mockClear();
 act(() => jest.advanceTimersByTime(500));
 expect(rects).not.toHaveBeenCalled();
});


test.each([
 ['missing sway frame', -100, false],
 ['vertical cord', 0, true],
 ['negligible angular impulse', 0.002, true],
])('a %s keeps mechanical feedback and finishes without an invisible fixture tail', (_, dx, hasFrame) => {
 const { projects } = setup();
 const { frame, angle } = measuredFixtureSway();
 const originalRect = rects.getMockImplementation();
 rects.mockImplementation(function () {
  if (this.hasAttribute('data-rope-pin') && this.closest('[data-rope-control="projects"]')) {
   const lever = this.closest('[data-rope-lever]');
   const pose = parseFloat(lever.style.getPropertyValue('--rope-angle')) || 0;
   return { left: 1100 + dx, top: 300 - Math.sin(pose * Math.PI / 180) * 120, width: 2, height: 2 };
  }
  return originalRect.call(this);
 });
 if (!hasFrame) frame.removeAttribute('data-rope-fixture-sway');
 fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
 act(() => jest.advanceTimersByTime(230));
 expect(projects).toHaveBeenCalledTimes(1);
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-engaged', 'true');
 expect(angle()).toBe(0);
 act(() => jest.advanceTimersByTime(600));
 expect(getNavigationMotionSnapshot()).toBe(false);
 expect(frame.style.getPropertyValue('--rope-fixture-angle')).toBe('');
 expect(document.querySelector('.navigation-ropes')).toHaveAttribute('data-rope-phase', 'resting');
});
