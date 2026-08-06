import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CostTable } from "./CostTable";
import type { CostItem } from "@/data/projects";

const ITEMS: CostItem[] = [
  { resource: "S3 Storage", unit: "GB/month", monthlyCost: "<$0.01" },
  {
    resource: "CloudFront",
    unit: "per request",
    monthlyCost: "<$1",
    note: "Free tier covers demo traffic",
  },
];

describe("CostTable", () => {
  it("renders all cost items", () => {
    render(<CostTable items={ITEMS} dailyCost="<$0.01" />);
    expect(screen.getByText("S3 Storage")).toBeInTheDocument();
    expect(screen.getByText("CloudFront")).toBeInTheDocument();
  });

  it("renders monthly costs", () => {
    render(<CostTable items={ITEMS} dailyCost="<$0.01" />);
    expect(screen.getAllByText("<$0.01").length).toBeGreaterThan(0);
    expect(screen.getByText("<$1")).toBeInTheDocument();
  });

  it("renders notes when present", () => {
    render(<CostTable items={ITEMS} dailyCost="<$0.01" />);
    expect(screen.getByText("Free tier covers demo traffic")).toBeInTheDocument();
  });

  it("renders daily cost estimate", () => {
    render(<CostTable items={ITEMS} dailyCost="~$1.50" />);
    expect(screen.getByText("~$1.50")).toBeInTheDocument();
  });
});
