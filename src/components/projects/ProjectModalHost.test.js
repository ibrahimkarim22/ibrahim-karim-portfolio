import React from "react";
import { render, screen } from "@testing-library/react";
import WhackaModal from "../WhackaModal";
import KrispyModal from "../KrispyModal";
import HeyYouModal from "../HeyYouModal";
import BardModal from "../BardModal";
import ThisPortfolioModal from "../ThisPortfolioModal";
import KanbanBoardModal from "../KanbanBoardModal";
import ProjectModalHost from "./ProjectModalHost";

jest.mock("../WhackaModal", () => jest.fn());
jest.mock("../KrispyModal", () => jest.fn());
jest.mock("../HeyYouModal", () => jest.fn());
jest.mock("../BardModal", () => jest.fn());
jest.mock("../ThisPortfolioModal", () => jest.fn());
jest.mock("../KanbanBoardModal", () => jest.fn());

const modalCases = [
  ["whackamole", WhackaModal],
  ["krispy", KrispyModal],
  ["heyyou", HeyYouModal],
  ["bard", BardModal],
  ["thisportfolio", ThisPortfolioModal],
  ["kanban", KanbanBoardModal],
];

beforeEach(() => {
  jest.clearAllMocks();
  modalCases.forEach(([id, ModalComponent]) => {
    ModalComponent.mockImplementation(() => <div data-testid={`modal-${id}`} />);
  });
});

it.each(modalCases)("mounts only the %s modal with its open and close contract", (id, SelectedModal) => {
  const onClose = jest.fn();

  render(<ProjectModalHost selectedProjectId={id} onClose={onClose} />);

  expect(SelectedModal).toHaveBeenCalled();
  expect(screen.getByTestId(`modal-${id}`)).toBeInTheDocument();
  expect(SelectedModal.mock.calls[0][0]).toEqual({ isOpen: true, closeModal: onClose });
  modalCases.forEach(([otherId, OtherModal]) => {
    if (otherId !== id) {
      expect(screen.queryByTestId(`modal-${otherId}`)).not.toBeInTheDocument();
      expect(OtherModal).not.toHaveBeenCalled();
    }
  });
});

it.each([null, "", "unknown"])("renders nothing for invalid project ID %p", (selectedProjectId) => {
  const { container } = render(
    <ProjectModalHost selectedProjectId={selectedProjectId} onClose={jest.fn()} />
  );

  expect(container).toBeEmptyDOMElement();
  modalCases.forEach(([, ModalComponent]) => expect(ModalComponent).not.toHaveBeenCalled());
});
