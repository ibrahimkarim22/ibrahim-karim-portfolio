import WhackaModal from "../WhackaModal";
import KrispyModal from "../KrispyModal";
import HeyYouModal from "../HeyYouModal";
import BardModal from "../BardModal";
import ThisPortfolioModal from "../ThisPortfolioModal";
import KanbanBoardModal from "../KanbanBoardModal";
import { PROJECTS, getProjectById } from "./projectCatalog";

const expectedProjects = [
  ["heyyou", "HeyYou", "Location & Chat", ["JavaScript", "React Native", "Android Studio", "Socket.io", "MongoDB", "Node.js", "Docker", "Google Cloud"], HeyYouModal],
  ["bard", "BARD", "Online Course", ["JavaScript", "React Native", "Android Studio", "Redux", "Firebase", "Firestore"], BardModal],
  ["thisportfolio", "Portfolio", "This Portfolio", ["JavaScript", "React", "Firebase", "SCSS", "Blender 3D", "React Three Fiber"], ThisPortfolioModal],
  ["krispy", "KRISPY", "Streaming Service", ["JavaScript", "React", "Firebase", "Redux", "Bootstrap", "SCSS"], KrispyModal],
  ["kanban", "Tuh-Doo / Kanban Board", "To Do List", ["JavaScript", "React", "SCSS", "Firebase", "Firestore"], KanbanBoardModal],
  ["whackamole", "Whack a Mole", "Online Game", ["JavaScript", "HTML", "SCSS"], WhackaModal],
];

describe("project catalog", () => {
  it("keeps six unique projects in the approved order with their content and modal associations", () => {
    expect(PROJECTS).toHaveLength(6);
    expect(new Set(PROJECTS.map(({ id }) => id)).size).toBe(6);
    expect(PROJECTS.map(({ id, name, description, technologies, ModalComponent }) => [
      id, name, description, technologies, ModalComponent,
    ])).toEqual(expectedProjects);
  });

  it("looks up known IDs without case sensitivity", () => {
    expect(getProjectById("WHACKAMOLE")).toBe(PROJECTS[5]);
    expect(getProjectById("HeYyOu")).toBe(PROJECTS[0]);
  });

  it.each(["", "not-real", null, undefined, 42, {}])(
    "returns null for empty, unknown, or non-string ID %p",
    (projectId) => {
      expect(getProjectById(projectId)).toBeNull();
    }
  );
});
