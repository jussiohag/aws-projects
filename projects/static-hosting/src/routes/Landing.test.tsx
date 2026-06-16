import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Landing } from "./Landing";

describe("Landing", () => {
  it("renders hero title", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    expect(screen.getByText("AWS Architecture Demos")).toBeInTheDocument();
  });

  it("renders all 4 project cards", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    expect(screen.getByText("Data Lake")).toBeInTheDocument();
    expect(screen.getByText("HA Web Service")).toBeInTheDocument();
    expect(screen.getByText("RAG on Bedrock")).toBeInTheDocument();
    expect(screen.getByText("Static Hosting")).toBeInTheDocument();
  });

  it("renders stats bar", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("eu-north-1").length).toBeGreaterThan(0);
    expect(screen.getByText("12+")).toBeInTheDocument();
  });

  it("renders tech badges", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    expect(screen.getByText("CDK Python")).toBeInTheDocument();
  });
});
