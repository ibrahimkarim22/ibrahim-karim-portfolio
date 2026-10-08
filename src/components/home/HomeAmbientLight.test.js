import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeAmbientLight from "./HomeAmbientLight";
import { PortfolioLightingContext, usePortfolioLighting } from "./portfolioLighting";

function Light({ theme = "projects", cycle = 0, changing = false, reduced = false }) {
  return <PortfolioLightingContext.Provider value={{ theme, cycle, changing, reduced }}><HomeAmbientLight /></PortfolioLightingContext.Provider>;
}

function LightingHarness({ view = "home" }) {
  const lighting = usePortfolioLighting(view);
  return <PortfolioLightingContext.Provider value={lighting}>
    <button type="button" onClick={() => lighting.selectTheme("home")}>Request Home light</button>
    <button type="button" onClick={() => lighting.selectTheme("resume")}>Request Resume light</button>
    <output data-testid="light-theme" data-cycle={lighting.cycle}>{lighting.theme}</output>
    <HomeAmbientLight />
  </PortfolioLightingContext.Provider>;
}

// Decorative sources are hidden from assistive technology. These nodes expose
// the fixture and the independently replayable emission and pull-cord layers.
function part(container, selector) {
  // eslint-disable-next-line testing-library/no-node-access
  return container.querySelector(selector);
}

function dustParticles(container) {
  // eslint-disable-next-line testing-library/no-node-access
  return container.querySelectorAll(".portfolio-light__dust-particle");
}

test("Home keeps the decorative fixture unlit with an accessible action and no dust", () => {
  const view = render(<Light theme="home" />);
  const source = part(view.container, ".portfolio-light");
  expect(source).toHaveAttribute("data-light-enabled", "false");
  expect(source).toHaveAttribute("aria-hidden", "true");
  expect(source).not.toHaveAttribute("tabindex");
  expect(part(view.container, ".portfolio-light__fixture")).toBeInTheDocument();
  expect(part(view.container, ".portfolio-light__emission-envelope")).toBeInTheDocument();
  expect(part(view.container, ".portfolio-light__dust")).toBeNull();
  expect(screen.getByRole("button", { name: "Break hanging light bulb" })).toBeInTheDocument();
});

describe("temporary bulb break interaction", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function shards(container) {
    // eslint-disable-next-line testing-library/no-node-access
    return container.querySelectorAll(".portfolio-light__shard");
  }

  function advance(milliseconds) {
    act(() => { jest.advanceTimersByTime(milliseconds); });
  }

  function reachPhase(container, phase) {
    for (let elapsed = 0; elapsed < 6000; elapsed += 16) {
      if (part(container, ".portfolio-light").getAttribute("data-bulb-phase") === phase) return;
      advance(16);
    }
    throw new Error(`Bulb never reached ${phase}`);
  }

  test("the structural rope attachments stay mounted through source cycles and replacement", () => {
    const view = render(<Light />);
    const rig = part(view.container, "[data-rope-rig]");
    const master = part(view.container, "[data-rope-master]");
    const pull = part(view.container, "[data-rope-pull]");
    expect(rig).toBeInTheDocument();
    expect(master).toBeInTheDocument();
    expect(part(view.container, ".portfolio-light__carriage [data-rope-master]")).toBe(master);
    expect(part(view.container, "[data-rope-pull] [data-rope-rig]")).toBe(rig);
    fireEvent.click(screen.getByRole("button", { name: "Break hanging light bulb" }));
    reachPhase(view.container, "retracting");
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-rope-rig-busy", "true");
    view.rerender(<Light theme="home" cycle={1} changing />);
    reachPhase(view.container, "replacing");
    expect(part(view.container, "[data-rope-rig]")).toBe(rig);
    expect(part(view.container, "[data-rope-master]")).toBe(master);
    expect(part(view.container, "[data-rope-pull]")).toBe(pull);
    reachPhase(view.container, "idle");
    expect(part(view.container, "[data-rope-rig]")).toBe(rig);
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-rope-rig-busy", "false");
  });

  test("the stationary dust field hides while glass is absent and returns with emission", () => {
    const view = render(<Light />);
    const dust = part(view.container, '.portfolio-light__dust');
    const envelope = part(view.container, '.portfolio-light__dust-envelope');
    expect(dust).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Break hanging light bulb' }));
    expect(dust).not.toBeVisible();
    expect(envelope).not.toHaveAttribute('hidden');
    expect(envelope).toHaveStyle({ opacity: 0 });
    reachPhase(view.container, 'replacing');
    expect(dust).not.toBeVisible();
    expect(part(view.container, '.portfolio-light__dust-envelope')).toBe(envelope);
    reachPhase(view.container, 'settling');
    expect(dust).toBeVisible();
    reachPhase(view.container, 'idle');
    expect(dust).toBeVisible();
    expect(jest.getTimerCount()).toBe(0);
  });

  test("Home selection explicitly lights the bulb and repeated Home requests keep it on", () => {
    const view = render(<LightingHarness />);
    const source = part(view.container, ".portfolio-light");
    expect(source).toHaveAttribute("data-light-enabled", "false");
    fireEvent.click(screen.getByRole("button", { name: "Request Home light" }));
    expect(source).toHaveAttribute("data-light-enabled", "true");
    expect(source).toHaveAttribute("data-bulb-emitting", "true");
    expect(screen.getByTestId("light-theme")).toHaveTextContent("home");
    expect(screen.getByTestId("light-theme")).toHaveAttribute("data-cycle", "1");
    fireEvent.click(screen.getByRole("button", { name: "Request Home light" }));
    expect(source).toHaveAttribute("data-light-enabled", "true");
    expect(screen.getByTestId("light-theme")).toHaveAttribute("data-cycle", "2");
    advance(900);
    expect(source).toHaveAttribute("data-bulb-emitting", "true");
  });

  test("a Home request during replacement restores Home light without a duplicate route cycle", () => {
    const view = render(<LightingHarness view="projects" />);
    const source = part(view.container, ".portfolio-light");
    fireEvent.click(screen.getByRole("button", { name: "Break hanging light bulb" }));
    reachPhase(view.container, "replacing");
    fireEvent.click(screen.getByRole("button", { name: "Request Resume light" }));
    fireEvent.click(screen.getByRole("button", { name: "Request Home light" }));
    view.rerender(<LightingHarness view="home" />);
    expect(source).toHaveAttribute("data-bulb-emitting", "false");
    expect(screen.getByTestId("light-theme")).toHaveTextContent("home");
    expect(screen.getByTestId("light-theme")).toHaveAttribute("data-cycle", "2");
    reachPhase(view.container, "idle");
    expect(source).toHaveAttribute("data-light-enabled", "true");
    expect(source).toHaveAttribute("data-bulb-emitting", "true");
    expect(screen.getByTestId("light-theme")).toHaveAttribute("data-cycle", "2");
    expect(jest.getTimerCount()).toBe(0);
  });

  test("click breaks the glass, hides its emitted light, and ignores repeated activation", () => {
    const view = render(<Light />);
    const control = screen.getByRole("button", { name: "Break hanging light bulb" });
    const fixture = part(view.container, ".portfolio-light__fixture");
    const envelope = part(view.container, ".portfolio-light__emission-envelope");
    fireEvent.click(control);
    const source = part(view.container, ".portfolio-light");
    expect(source).toHaveAttribute("data-bulb-phase", "breaking");
    expect(source).toHaveAttribute("data-light-enabled", "true");
    expect(source).toHaveAttribute("data-bulb-emitting", "false");
    expect(control).toHaveAttribute("aria-disabled", "true");
    expect(shards(view.container).length).toBeGreaterThan(3);
    expect(shards(view.container).length).toBeLessThanOrEqual(10);
    expect(part(view.container, ".portfolio-light__debris")).toHaveAttribute("aria-hidden", "true");
    const firstShard = shards(view.container)[0];
    fireEvent.click(control);
    expect(shards(view.container)[0]).toBe(firstShard);
    expect(part(view.container, ".portfolio-light__fixture")).toBe(fixture);
    expect(part(view.container, ".portfolio-light__emission-envelope")).toBe(envelope);
  });

  test.each(["{Enter}", " "])("keyboard %s activates the semantic bulb action", async (key) => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const view = render(<Light theme="home" />);
    const control = screen.getByRole("button", { name: "Break hanging light bulb" });
    control.focus();
    await user.keyboard(key);
    expect(control).toHaveFocus();
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-phase", "breaking");
  });

  test("measured glass fragments accelerate and all leave the viewport before replacement descends", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 300 });
    jest.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function bounds() {
      if (this.classList.contains("portfolio-light__glass--unlit")) {
        return { x: 126, y: 60, left: 126, top: 60, right: 154, bottom: 95, width: 28, height: 35 };
      }
      return { x: 120, y: 24, left: 120, top: 24, right: 162, bottom: 108, width: 42, height: 84 };
    });
    const view = render(<Light />);
    fireEvent.click(screen.getByRole("button", { name: "Break hanging light bulb" }));
    const fragment = shards(view.container)[0];
    function positionY() {
      const position = fragment.style.transform.match(/translate3d\([^,]+,\s*([-\d.]+)px/);
      if (!position) throw new Error(`Invalid falling fragment transform: ${fragment.style.transform}`);
      return Number(position[1]);
    }
    const originY = positionY();
    expect(originY).toBeGreaterThanOrEqual(60);
    expect(originY).toBeLessThanOrEqual(95);
    reachPhase(view.container, "falling");
    advance(96);
    const firstY = positionY();
    advance(96);
    const secondY = positionY();
    advance(96);
    const thirdY = positionY();
    expect(thirdY - secondY).toBeGreaterThan(secondY - firstY);
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-phase", "falling");
    reachPhase(view.container, "replacing");
    expect(shards(view.container)).toHaveLength(0);
    expect(part(view.container, ".portfolio-light__debris")).toBeNull();
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-emitting", "false");
    expect(Number.parseFloat(part(view.container, ".portfolio-light").style.getPropertyValue("--bulb-carriage-offset"))).toBeLessThan(-100);
    reachPhase(view.container, "settling");
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-emitting", "true");
    expect(part(view.container, ".portfolio-light").style.getPropertyValue("--bulb-carriage-offset")).toBe("0px");
    expect(screen.getByRole("button", { name: "Break hanging light bulb" })).toHaveAttribute("aria-disabled", "true");
    reachPhase(view.container, "idle");
    expect(screen.getByRole("button", { name: "Break hanging light bulb" })).toHaveAttribute("aria-disabled", "false");
    expect(jest.getTimerCount()).toBe(0);
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });
  });

  test.each([["home", "false"], ["projects", "true"]])("restores the intended %s lighting without changing the underlying context", (theme, enabled) => {
    const lighting = Object.freeze({ theme, cycle: 4, changing: false, reduced: false });
    const view = render(<PortfolioLightingContext.Provider value={lighting}><HomeAmbientLight /></PortfolioLightingContext.Provider>);
    fireEvent.click(screen.getByRole("button", { name: "Break hanging light bulb" }));
    advance(6000);
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-phase", "idle");
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-enabled", enabled);
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-emitting", enabled);
    expect(lighting).toEqual({ theme, cycle: 4, changing: false, reduced: false });
    expect(shards(view.container)).toHaveLength(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  test("the empty socket and cord retract above the viewport before the replacement arrives", () => {
    const view = render(<Light />);
    const source = part(view.container, ".portfolio-light");
    const carriage = part(view.container, ".portfolio-light__carriage");
    fireEvent.click(screen.getByRole("button", { name: "Break hanging light bulb" }));
    reachPhase(view.container, "retracting");
    expect(shards(view.container)).toHaveLength(0);
    expect(source.style.getPropertyValue("--bulb-carriage-offset")).toBe("0px");
    expect(source.style.getPropertyValue("--bulb-cable-scale")).toBe("1");
    expect(source).toHaveAttribute("data-bulb-emitting", "false");
    advance(120);
    const firstOffset = Number.parseFloat(source.style.getPropertyValue("--bulb-carriage-offset"));
    expect(firstOffset).toBeLessThan(0);
    expect(firstOffset).toBeGreaterThan(-100);
    expect(source).toHaveAttribute("data-bulb-phase", "retracting");
    advance(120);
    const secondOffset = Number.parseFloat(source.style.getPropertyValue("--bulb-carriage-offset"));
    expect(secondOffset).toBeLessThan(firstOffset);
    expect(source).toHaveAttribute("data-bulb-phase", "retracting");
    expect(part(view.container, ".portfolio-light__carriage")).toBe(carriage);
    fireEvent.click(screen.getByRole("button", { name: "Break hanging light bulb" }));
    expect(shards(view.container)).toHaveLength(0);
    expect(Number.parseFloat(source.style.getPropertyValue("--bulb-carriage-offset"))).toBe(secondOffset);
    reachPhase(view.container, "replacing");
    expect(Number.parseFloat(source.style.getPropertyValue("--bulb-carriage-offset"))).toBeLessThan(-100);
    expect(source.style.getPropertyValue("--bulb-cable-scale")).toBe("0");
    expect(source).toHaveAttribute("data-bulb-emitting", "false");
    reachPhase(view.container, "idle");
    expect(source).toHaveAttribute("data-bulb-emitting", "true");
    expect(jest.getTimerCount()).toBe(0);
  });

  test("navigation during a break adopts the latest theme while keeping navigation animation layers independent", () => {
    const view = render(<Light theme="projects" />);
    const fixture = part(view.container, ".portfolio-light__fixture");
    const envelope = part(view.container, ".portfolio-light__emission-envelope");
    const previousEmission = part(view.container, ".portfolio-light__transition");
    fireEvent.click(screen.getByRole("button", { name: "Break hanging light bulb" }));
    view.rerender(<Light theme="home" cycle={1} changing />);
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-phase", "breaking");
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-enabled", "false");
    expect(part(view.container, ".portfolio-light__fixture")).toBe(fixture);
    expect(part(view.container, ".portfolio-light__emission-envelope")).toBe(envelope);
    expect(part(view.container, ".portfolio-light__transition")).not.toBe(previousEmission);
    advance(6000);
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-phase", "idle");
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-emitting", "false");
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-phase", "changing");
  });

  test("reduced motion keeps a brief broken state with no falling fragments and quickly restores the light", () => {
    const view = render(<Light reduced />);
    fireEvent.click(screen.getByRole("button", { name: "Break hanging light bulb" }));
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-phase", "breaking");
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-emitting", "false");
    expect(shards(view.container)).toHaveLength(0);
    advance(700);
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-phase", "idle");
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-emitting", "true");
    expect(jest.getTimerCount()).toBe(0);
  });

  test("changing motion preference during the effect cancels debris and leaves the latest theme intact", () => {
    const view = render(<Light />);
    fireEvent.click(screen.getByRole("button", { name: "Break hanging light bulb" }));
    reachPhase(view.container, "falling");
    view.rerender(<Light theme="home" cycle={1} reduced />);
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-phase", "idle");
    expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-bulb-emitting", "false");
    expect(shards(view.container)).toHaveLength(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  test("unmount clears pending timers and animation frames during the fall", () => {
    const view = render(<Light />);
    fireEvent.click(screen.getByRole("button", { name: "Break hanging light bulb" }));
    reachPhase(view.container, "falling");
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    view.unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});

test("activating a destination enables its bounded dust field without replacing the fixture or envelope", () => {
  const view = render(<Light theme="home" />);
  const fixture = part(view.container, ".portfolio-light__fixture");
  const envelope = part(view.container, ".portfolio-light__emission-envelope");
  view.rerender(<Light theme="projects" cycle={1} changing />);
  expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-enabled", "true");
  expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-phase", "changing");
  expect(part(view.container, ".portfolio-light__fixture")).toBe(fixture);
  expect(part(view.container, ".portfolio-light__emission-envelope")).toBe(envelope);
  expect(part(view.container, ".portfolio-light__dust")).toHaveAttribute("aria-hidden", "true");
  expect(dustParticles(view.container)).toHaveLength(6);
  // eslint-disable-next-line testing-library/no-node-access
  expect(part(view.container, ".portfolio-light__dust").parentElement).toBe(part(view.container, ".portfolio-light__dust-envelope .portfolio-light__transition"));
});

test("returning Home disables emission and removes dust while keeping the fixture and envelope mounted", () => {
  const view = render(<Light />);
  const fixture = part(view.container, ".portfolio-light__fixture");
  const envelope = part(view.container, ".portfolio-light__emission-envelope");
  expect(dustParticles(view.container)).toHaveLength(6);
  view.rerender(<Light theme="home" cycle={1} changing />);
  expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-enabled", "false");
  expect(part(view.container, ".portfolio-light__fixture")).toBe(fixture);
  expect(part(view.container, ".portfolio-light__emission-envelope")).toBe(envelope);
  expect(part(view.container, ".portfolio-light__dust")).toBeNull();
  view.rerender(<Light theme="home" cycle={1} />);
  expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-phase", "settled");
  expect(dustParticles(view.container)).toHaveLength(0);
});

test("replaying light keeps the physical fixture mounted and restarts only emission and cord motion", () => {
  const view = render(<Light />);
  const fixture = part(view.container, ".portfolio-light__fixture");
  expect(fixture).toBeInTheDocument();
  const firstEmission = part(view.container, ".portfolio-light__transition");
  const envelope = part(view.container, ".portfolio-light__emission-envelope");
  const firstDust = part(view.container, ".portfolio-light__dust");
  const firstCord = part(view.container, ".portfolio-light__pull-cord");
  expect(firstCord).toBeInTheDocument();
  view.rerender(<Light cycle={1} changing />);
  expect(part(view.container, ".portfolio-light__fixture")).toBe(fixture);
  expect(part(view.container, ".portfolio-light__emission-envelope")).toBe(envelope);
  expect(part(view.container, ".portfolio-light__transition")).not.toBe(firstEmission);
  expect(part(view.container, ".portfolio-light__dust")).not.toBe(firstDust);
  expect(dustParticles(view.container)).toHaveLength(6);
  expect(part(view.container, ".portfolio-light__pull-cord")).not.toBe(firstCord);
  expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-phase", "changing");
  const emission = part(view.container, ".portfolio-light__transition");
  view.rerender(<Light cycle={2} changing />);
  expect(part(view.container, ".portfolio-light__fixture")).toBe(fixture);
  expect(part(view.container, ".portfolio-light__transition")).not.toBe(emission);
});

test("a source mounted midway through a cycle adopts the theme without replaying the pull or flicker", () => {
  const view = render(<Light cycle={3} changing />);
  expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-phase", "settled");
  expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-enabled", "true");
  expect(dustParticles(view.container)).toHaveLength(6);
  view.rerender(<Light cycle={4} changing reduced />);
  expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-phase", "changing");
  expect(part(view.container, ".portfolio-light")).toHaveAttribute("data-light-motion", "reduced");
  expect(dustParticles(view.container)).toHaveLength(6);
});


test('fixture and emitted light share one stable sway frame without enclosing the bulb action', () => {
  const view = render(<Light />);
  const frame = part(view.container, '[data-rope-fixture-sway]');
  const fixture = part(view.container, '.portfolio-light__fixture');
  const emission = part(view.container, '.portfolio-light__emission-envelope');
  expect(frame).toContainElement(fixture);
  expect(frame).toContainElement(emission);
  expect(frame).not.toContainElement(screen.getByRole('button', { name: 'Break hanging light bulb' }));
  view.rerender(<Light theme='resume' cycle={1} changing />);
  expect(part(view.container, '[data-rope-fixture-sway]')).toBe(frame);
  expect(part(view.container, '.portfolio-light__fixture')).toBe(fixture);
});


test('dust stays anchored outside fixture sway while bulb and local glow remain together', () => {
  const view = render(<Light />);
  const source = part(view.container, '.portfolio-light');
  const frame = part(view.container, '[data-rope-fixture-sway]');
  const dust = part(view.container, '.portfolio-light__dust');
  const envelope = part(view.container, '.portfolio-light__dust-envelope');
  expect(source).toContainElement(envelope);
  expect(frame).not.toContainElement(dust);
  expect(frame).toContainElement(part(view.container, '.portfolio-light__halo'));
  expect(frame).toContainElement(part(view.container, '.portfolio-light__emission'));
  frame.style.setProperty('--rope-fixture-angle', '8deg');
  expect(part(view.container, '.portfolio-light__dust')).toBe(dust);
  expect(envelope.style.transform).toBe('');
  expect(dustParticles(view.container)).toHaveLength(6);
});

test('theme replay synchronizes stationary dust flicker with the moving light without replacing either frame', () => {
  const view = render(<Light />);
  const frame = part(view.container, '[data-rope-fixture-sway]');
  const envelope = part(view.container, '.portfolio-light__dust-envelope');
  const dustTransition = part(view.container, '.portfolio-light__dust-envelope .portfolio-light__transition');
  const lightTransition = part(view.container, '.portfolio-light__emission-envelope .portfolio-light__transition');
  view.rerender(<Light theme='resume' cycle={1} changing />);
  expect(part(view.container, '.portfolio-light')).toHaveAttribute('data-light-phase', 'changing');
  expect(part(view.container, '[data-rope-fixture-sway]')).toBe(frame);
  expect(part(view.container, '.portfolio-light__dust-envelope')).toBe(envelope);
  expect(part(view.container, '.portfolio-light__dust-envelope .portfolio-light__transition')).not.toBe(dustTransition);
  expect(part(view.container, '.portfolio-light__emission-envelope .portfolio-light__transition')).not.toBe(lightTransition);
  expect(dustParticles(view.container)).toHaveLength(6);
});
