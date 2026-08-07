import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { Layout } from "@/components/Layout";
import { Landing } from "@/routes/Landing";

function renderWithRouter(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [{ index: true, element: <Landing /> }],
      },
    ],
    { initialEntries: [initialPath] },
  );
  return render(<RouterProvider router={router} />);
}

describe("App Router", () => {
  it("renders nav with logo", () => {
    renderWithRouter("/");
    expect(screen.getByText("☁ AWS Portfolio")).toBeInTheDocument();
  });

  it("renders landing page at /", () => {
    renderWithRouter("/");
    expect(screen.getByText("AWS Architecture Demos")).toBeInTheDocument();
  });
});
