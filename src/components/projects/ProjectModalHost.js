import { getProjectById } from "./projectCatalog";
import { useLayoutEffect } from "react";
import { preloadProjectImages } from "./projectImageLoading";

export default function ProjectModalHost({ selectedProjectId, onClose }) {
  useLayoutEffect(() => {
    // Covers direct URLs and history navigation as well as card selection.
    preloadProjectImages(selectedProjectId);
  }, [selectedProjectId]);
  const project = getProjectById(selectedProjectId);
  if (!project) return null;

  const { ModalComponent } = project;
  return <ModalComponent isOpen={true} closeModal={onClose} />;
}
