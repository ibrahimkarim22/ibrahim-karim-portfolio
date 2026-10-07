import WhackaModal from "../WhackaModal";
import KrispyModal from "../KrispyModal";
import HeyYouModal from "../HeyYouModal";
import BardModal from "../BardModal";
import ThisPortfolioModal from "../ThisPortfolioModal";
import KanbanBoardModal from "../KanbanBoardModal";

export const PROJECTS = [
  {
    id: "whackamole",
    name: "Whack a Mole",
    description: "Online Game",
    technologies: ["JavaScript", "HTML", "SCSS"],
    ModalComponent: WhackaModal,
  },
  {
    id: "krispy",
    name: "KRISPY",
    description: "Streaming Service",
    technologies: ["JavaScript", "React", "Firebase", "Redux", "Bootstrap", "SCSS"],
    ModalComponent: KrispyModal,
  },
  {
    id: "heyyou",
    name: "HeyYou",
    description: "Location & Chat",
    technologies: ["JavaScript", "React Native", "Android Studio", "Socket.io", "MongoDB", "Node.js", "Docker", "Google Cloud"],
    ModalComponent: HeyYouModal,
  },
  {
    id: "bard",
    name: "BARD",
    description: "Online Course",
    technologies: ["JavaScript", "React Native", "Android Studio", "Redux", "Firebase", "Firestore"],
    ModalComponent: BardModal,
  },
  {
    id: "kanban",
    name: "Tuh-Doo / Kanban Board",
    description: "To Do List",
    technologies: ["JavaScript", "React", "SCSS", "Firebase", "Firestore"],
    ModalComponent: KanbanBoardModal,
  },
  // Keep this meta-project last; insert future projects before it.
  {
    id: "thisportfolio",
    name: "Portfolio",
    description: "This Portfolio",
    technologies: ["JavaScript", "React", "Firebase", "SCSS", "Blender 3D", "React Three Fiber"],
    ModalComponent: ThisPortfolioModal,
  },
];

export function getProjectById(projectId) {
  if (typeof projectId !== "string" || !projectId) return null;

  return PROJECTS.find(({ id }) => id === projectId.toLowerCase()) || null;
}
