import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ProjectCard } from "./ProjectCard";
import { PROJECTS } from "@/data/projects";

function renderCard(projectId: string) {
  const project = PROJECTS.find((p) => p.id === projectId)!;
  return render(
    <MemoryRouter>
      <ProjectCard project={project} />
    </MemoryRouter>,
  );
}

describe("ProjectCard", () => {
  it("renders project name and description", () => {
    renderCard("data-lake");
    expect(screen.getByText("Data Lake")).toBeInTheDocument();
    expect(screen.getByText(/S3 → Glue → Athena/)).toBeInTheDocument();
  });

  it("renders service tags", () => {
    renderCard("ha-web-service");
    expect(screen.getByText("VPC")).toBeInTheDocument();
    expect(screen.getByText("Fargate")).toBeInTheDocument();
    expect(screen.getByText("DynamoDB")).toBeInTheDocument();
  });

  it("shows DEPLOYED badge for deployed projects", () => {
    renderCard("data-lake");
    expect(screen.getByText("DEPLOYED")).toBeInTheDocument();
  });

  it("shows THIS SITE badge for static-hosting", () => {
    renderCard("static-hosting");
    expect(screen.getByText("THIS SITE")).toBeInTheDocument();
  });

  it("links to the project route", () => {
    renderCard("rag-bedrock");
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/rag-bedrock");
  });
});
