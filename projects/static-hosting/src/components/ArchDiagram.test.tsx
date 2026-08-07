import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArchDiagram } from "./ArchDiagram";

describe("ArchDiagram", () => {
  it("renders diagram nodes for data-lake", () => {
    render(<ArchDiagram projectId="data-lake" />);
    expect(screen.getByText("Helsinki API")).toBeInTheDocument();
    expect(screen.getByText("Glue Crawler")).toBeInTheDocument();
    expect(screen.getByText("Athena")).toBeInTheDocument();
  });

  it("renders diagram nodes for ha-web-service", () => {
    render(<ArchDiagram projectId="ha-web-service" />);
    expect(screen.getByText("ALB")).toBeInTheDocument();
    expect(screen.getByText("Fargate ×2")).toBeInTheDocument();
    expect(screen.getByText("DynamoDB")).toBeInTheDocument();
  });

  it("renders sublabels", () => {
    render(<ArchDiagram projectId="rag-bedrock" />);
    expect(screen.getByText("API Key + Throttle")).toBeInTheDocument();
    expect(screen.getByText("Claude Haiku")).toBeInTheDocument();
  });

  it("returns null for unknown projectId", () => {
    const { container } = render(<ArchDiagram projectId="nonexistent" />);
    expect(container.innerHTML).toBe("");
  });
});
