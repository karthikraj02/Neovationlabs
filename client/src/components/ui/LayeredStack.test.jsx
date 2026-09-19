// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LayeredStack from "./LayeredStack";

describe("LayeredStack", () => {
  // Chrome hit-tests perspective-tilted layers far outside where they are drawn,
  // which once blocked clicks on the hero's "Start a Project" button. The 3D
  // drawing is decorative, so it must stay out of pointer hit-testing.
  it("keeps the 3D drawing out of pointer events so it cannot block clicks elsewhere", () => {
    const { container } = render(<LayeredStack />);
    const scene = container.querySelector('[style*="perspective"]');
    expect(scene).not.toBeNull();
    expect(scene).toHaveClass("pointer-events-none");
  });

  it("keeps the legend interactive, one button per layer", () => {
    render(<LayeredStack />);
    expect(screen.getAllByRole("button")).toHaveLength(6);
  });
});
