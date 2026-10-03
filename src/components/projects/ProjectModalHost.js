import { getProjectById } from "./projectCatalog";

export default function ProjectModalHost({ selectedProjectId, onClose }) {
  const project = getProjectById(selectedProjectId);
  if (!project) return null;

  const { ModalComponent } = project;
  return <ModalComponent isOpen={true} closeModal={onClose} />;
}
