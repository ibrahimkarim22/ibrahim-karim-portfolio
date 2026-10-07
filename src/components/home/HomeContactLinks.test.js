import { render, screen, within } from "@testing-library/react";
import HomeContactLinks from "./HomeContactLinks";

test("provides named contact links with the existing destinations and external behavior", () => {
  render(<HomeContactLinks />);
  const contacts = within(screen.getByRole("navigation", { name: "Contact links" }));
  expect(contacts.getAllByRole("link")).toHaveLength(3);
  [
    ["LinkedIn", "https://www.linkedin.com/in/ibrahim-karim-abaa952a7/"],
    ["GitHub", "https://github.com/ibrahimkarim22"],
    ["Email", "mailto:22ibrahimkarim@gmail.com"],
  ].forEach(([name, href]) => {
    const link = contacts.getByRole("link", { name, exact: true });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
