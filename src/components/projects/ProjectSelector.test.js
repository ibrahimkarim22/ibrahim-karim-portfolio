import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectSelector from "./ProjectSelector";
import { PROJECTS } from "./projectCatalog";

const expectedCopy = [
  ["Whack a Mole", "Online Game", ["JavaScript", "HTML", "SCSS"]],
  ["KRISPY", "Streaming Service", ["JavaScript", "React", "Firebase", "Redux", "Bootstrap", "SCSS"]],
  ["HeyYou", "Location & Chat", ["JavaScript", "React Native", "Android Studio", "Socket.io", "MongoDB", "Node.js", "Docker", "Google Cloud"]],
  ["BARD", "Online Course", ["JavaScript", "React Native", "Android Studio", "Redux", "Firebase", "Firestore"]],
  ["Portfolio", "This Portfolio", ["JavaScript", "React", "Firebase", "SCSS", "Blender 3D", "React Three Fiber"]],
  ["Tuh-Doo / Kanban Board", "To Do List", ["JavaScript", "React", "SCSS", "Firebase", "Firestore"]],
];

describe("ProjectSelector", () => {
  it("renders the labelled project region and complete copy in six native buttons", () => {
    render(<ProjectSelector projects={PROJECTS} onSelectProject={() => {}} />);

    const region = screen.getByRole("region", { name: /projects/i });
    expect(region).toHaveAttribute("id", "project-selector");
    expect(within(region).getByRole("heading", { name: /projects/i })).toBeInTheDocument();
    const buttons = within(region).getAllByRole("button");
    expect(buttons).toHaveLength(6);
    expect(within(region).getAllByRole("listitem")).toHaveLength(6);

    expectedCopy.forEach(([name, description, technologies], index) => {
      const button = buttons[index];
      expect(button).toHaveAttribute("type", "button");
      expect(within(button).getByText(name, { exact: true })).toBeInTheDocument();
      expect(within(button).getByText(description, { exact: true })).toBeInTheDocument();
      technologies.forEach((technology) => {
        expect(within(button).getByText(technology, { exact: true })).toBeInTheDocument();
      });
      expect(button).toHaveAccessibleName(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    });
  });

  it("sends the selected ID and native button when activated with Enter", async () => {
    const user = userEvent.setup();
    const onSelectProject = jest.fn();
    render(<ProjectSelector projects={PROJECTS} onSelectProject={onSelectProject} />);

    await user.tab();
    const button = screen.getAllByRole("button")[0];
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(onSelectProject).toHaveBeenCalledTimes(1);
    expect(onSelectProject).toHaveBeenCalledWith("whackamole", button);
  });
});
