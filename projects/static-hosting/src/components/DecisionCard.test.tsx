import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DecisionCards } from "./DecisionCard";
import { DECISIONS } from "@/data/decisions";

describe("DecisionCards", () => {
  it("renders key points for ha-web-service", () => {
    render(<DecisionCards data={DECISIONS["ha-web-service"]} />);
    expect(screen.getByText("No NAT Gateways")).toBeInTheDocument();
    expect(screen.getByText("Multi-AZ")).toBeInTheDocument();
    expect(screen.getByText("Least-Privilege IAM")).toBeInTheDocument();
  });

  it("renders decision records", () => {
    render(<DecisionCards data={DECISIONS["ha-web-service"]} />);
    expect(screen.getByText("VPC endpoints over NAT Gateways")).toBeInTheDocument();
    expect(screen.getByText("Fargate over EC2")).toBeInTheDocument();
  });

  it("renders context, decision, and consequences for each ADR", () => {
    render(<DecisionCards data={DECISIONS["rag-bedrock"]} />);
    expect(screen.getByText("Context")).toBeInTheDocument();
    expect(screen.getByText("Decision")).toBeInTheDocument();
    expect(screen.getByText("Consequences")).toBeInTheDocument();
  });
});
