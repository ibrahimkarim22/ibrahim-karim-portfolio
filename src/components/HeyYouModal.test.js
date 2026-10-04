import { fireEvent, render } from "@testing-library/react";
import HeyYouModal from "./HeyYouModal";

it("keeps eight pages in its horizontal scroller and closes from the footer", () => {
  const closeModal = jest.fn();

  render(<HeyYouModal isOpen={true} closeModal={closeModal} />);

  const horizontalScroll = document.querySelector(".hey-you-horizontal-scroll");
  expect(horizontalScroll).toBeInTheDocument();
  expect(horizontalScroll.querySelectorAll(".hey-you-page")).toHaveLength(8);

  fireEvent.click(document.querySelector(".hey-you-modal-close-btn"));
  expect(closeModal).toHaveBeenCalledTimes(1);
});
