import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectSelector from "./ProjectSelector";
import { PROJECTS } from "./projectCatalog";

const expectedCopy = [
  ["Whack a Mole", "Online Game", ["JavaScript", "HTML", "SCSS"]],
  ["KRISPY", "Streaming Service", ["JavaScript", "React", "Firebase", "Redux", "Bootstrap", "SCSS"]],
  ["HeyYou", "Location & Chat", ["JavaScript", "React Native", "Android Studio", "Socket.io", "MongoDB", "Node.js", "Docker", "Google Cloud"]],
  ["BARD", "Online Course", ["JavaScript", "React Native", "Android Studio", "Redux", "Firebase", "Firestore"]],
  ["Tuh-Doo / Kanban Board", "To Do List", ["JavaScript", "React", "SCSS", "Firebase", "Firestore"]],
  ["Portfolio", "This Portfolio", ["JavaScript", "React", "Firebase", "SCSS", "Blender 3D", "React Three Fiber"]],
];

describe("ProjectSelector", () => {
  it("renders the labelled project region and complete copy in six native buttons", () => {
    render(
      <ProjectSelector
        projects={PROJECTS}
        onSelectProject={() => {}}
      />
    );

    const region = screen.getByRole("region", { name: /projects/i });
    expect(region).toHaveAttribute("id", "project-selector");
    expect(within(region).queryByRole("heading", { name: /projects/i })).not.toBeInTheDocument();
    expect(within(region).queryByText(/selected worlds/i)).not.toBeInTheDocument();
    const buttons = within(within(region).getByRole("list")).getAllByRole("button");
    expect(buttons).toHaveLength(6);
    expect(within(region).getAllByRole("button")).toHaveLength(6);
    expect(within(region).getAllByRole("listitem")).toHaveLength(6);

    expectedCopy.forEach(([name, description, technologies], index) => {
      const button = buttons[index];
      expect(button).toHaveAttribute("type", "button");
      expect(within(button).getByText(name, { exact: true })).toBeInTheDocument();
      expect(within(button).getByText(description, { exact: true })).toBeInTheDocument();
      expect(button).toHaveAccessibleDescription(`Technologies: ${technologies.join(", ")}`);
      expect(button).toHaveAccessibleName(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    });
  });

  it("sends the selected ID and native button when activated with Enter", async () => {
    const user = userEvent.setup();
    const onSelectProject = jest.fn();
    render(
      <ProjectSelector
        projects={PROJECTS}
        onSelectProject={onSelectProject}
      />
    );

    const button = within(screen.getByRole("list")).getAllByRole("button")[0];
    button.focus();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(onSelectProject).toHaveBeenCalledTimes(1);
    expect(onSelectProject).toHaveBeenCalledWith("whackamole", button);
  });

  it("keeps the complete stack accessible when the visual summary uses +N", () => {
    render(<ProjectSelector projects={PROJECTS} onSelectProject={() => {}} />);
    const heyYou = screen.getByRole("button", { name: "HeyYou Location & Chat" });
    expect(heyYou).toHaveAccessibleDescription(
      "Technologies: JavaScript, React Native, Android Studio, Socket.io, MongoDB, Node.js, Docker, Google Cloud"
    );
    expect(within(heyYou).getByText("+5")).toBeInTheDocument();
    expect(within(heyYou).getByText("JavaScript / React Native / Android Studio", { exact: true }))
      .toHaveAttribute("aria-hidden", "true");
  });

  it("updates indexes when a project is inserted before Portfolio without rendering a collection heading", () => {
    const projects = [...PROJECTS.slice(0, -1), {
      id: "new-project", name: "New project", description: "Web application", technologies: ["JavaScript"],
    }, PROJECTS[PROJECTS.length - 1]];
    render(<ProjectSelector projects={projects} onSelectProject={() => {}} />);
    expect(screen.queryByText(/Selected worlds/i)).not.toBeInTheDocument();
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(within(items[5]).getByRole("button", { name: "New project Web application" })).toBeInTheDocument();
    expect(within(items[5]).getByText("06")).toBeInTheDocument();
    expect(within(items[6]).getByRole("button", { name: "Portfolio This Portfolio" })).toBeInTheDocument();
    expect(within(items[6]).getByText("07")).toBeInTheDocument();
  });

  it.each(PROJECTS.map(({ id, name }) => [id, name]))("activates %s by mouse and Space", async (id, name) => {
    const user = userEvent.setup();
    const onSelectProject = jest.fn();
    render(<ProjectSelector projects={PROJECTS} onSelectProject={onSelectProject} />);
    const button = screen.getByRole("button", { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
    await user.click(button);
    await user.keyboard(" ");
    expect(onSelectProject.mock.calls).toEqual([[id, button], [id, button]]);
  });
});
