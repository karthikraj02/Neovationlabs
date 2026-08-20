import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";

function renderNavbar() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Navbar />
    </MemoryRouter>
  );
}

describe("Navbar", () => {
  it("renders the primary navigation links", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: "NeovationLabs home" })).toBeInTheDocument();
    for (const label of ["Services", "Solutions", "Technology", "About", "Insights"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("renders a 'Let's Build' call to action", () => {
    renderNavbar();
    expect(screen.getAllByText("Let's Build").length).toBeGreaterThan(0);
  });

  it("opens and closes the mobile menu on toggle", async () => {
    const user = userEvent.setup();
    renderNavbar();

    const toggle = screen.getByRole("button", { name: /open menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(screen.getByRole("button", { name: /close menu/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );

    await user.click(screen.getByRole("button", { name: /close menu/i }));
    expect(screen.getByRole("button", { name: /open menu/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });
});
