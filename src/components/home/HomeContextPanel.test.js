import { render, screen, within } from "@testing-library/react";
import HomeContextPanel from "./HomeContextPanel";

const completeStacks = [
  ["whackamole", "JavaScript · HTML · SCSS"],
  ["krispy", "JavaScript · React · Firebase · Redux · Bootstrap · SCSS"],
  ["heyyou", "JavaScript · React Native · Android Studio · Socket.io · MongoDB · Node.js · Docker · Google Cloud"],
  ["bard", "JavaScript · React Native · Android Studio · Redux · Firebase · Firestore"],
  ["thisportfolio", "JavaScript · React · Firebase · SCSS · Blender 3D · React Three Fiber"],
  ["kanban", "JavaScript · React · SCSS · Firebase · Firestore"],
];

it.each(completeStacks)("shows the complete %s catalog stack in the expanded detail panel", (id, stack) => {
  render(<HomeContextPanel activeView="projects" previewProjectId={id} />);
  const context = within(screen.getByRole("complementary", { name: "Portfolio context" }));
  expect(context.getByText("Built with")).toBeInTheDocument();
  expect(context.getByText(stack, { exact: true })).toBeInTheDocument();
  expect(context.queryByText(/\+\d+|and more/i)).not.toBeInTheDocument();
});
