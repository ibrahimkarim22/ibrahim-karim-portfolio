import { render, screen } from "@testing-library/react";
import HomeAmbientLight from "./HomeAmbientLight";
import { PortfolioLightingContext } from "./portfolioLighting";

function Light({ theme = "projects", cycle = 0, changing = false, reduced = false }) {
  return <PortfolioLightingContext.Provider value={{ theme, cycle, changing, reduced }}><HomeAmbientLight /></PortfolioLightingContext.Provider>;
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

test("Home keeps the decorative fixture unlit and has no dust or interactive control", () => {
  const view = render(<Light theme="home" />);
  const source = part(view.container, ".portfolio-light");
  expect(source).toHaveAttribute("data-light-enabled", "false");
  expect(source).toHaveAttribute("aria-hidden", "true");
  expect(source).not.toHaveAttribute("tabindex");
  expect(part(view.container, ".portfolio-light__fixture")).toBeInTheDocument();
  expect(part(view.container, ".portfolio-light__emission-envelope")).toBeInTheDocument();
  expect(part(view.container, ".portfolio-light__dust")).toBeNull();
  expect(screen.queryByRole("button", { hidden: true })).toBeNull();
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
  expect(part(view.container, ".portfolio-light__dust").parentElement).toBe(part(view.container, ".portfolio-light__transition"));
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
