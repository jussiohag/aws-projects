import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryViewer } from "./QueryViewer";

describe("QueryViewer", () => {
  it("renders query tabs", () => {
    render(<QueryViewer />);
    expect(screen.getByText("Explore Raw")).toBeInTheDocument();
    expect(screen.getByText("CSV → Parquet")).toBeInTheDocument();
    expect(screen.getByText("Time Travel")).toBeInTheDocument();
  });

  it("shows first query SQL by default", () => {
    render(<QueryViewer />);
    expect(screen.getByText(/SELECT municipality, COUNT/)).toBeInTheDocument();
  });

  it("switches query on tab click", async () => {
    const user = userEvent.setup();
    render(<QueryViewer />);

    await user.click(screen.getByText("Iceberg UPDATE"));
    expect(screen.getByText(/UPDATE helsinki_open_data/)).toBeInTheDocument();
  });

  it("shows bytes scanned comparison when available", () => {
    render(<QueryViewer />);
    expect(screen.getByText("2.1 MB (CSV)")).toBeInTheDocument();
  });
});
