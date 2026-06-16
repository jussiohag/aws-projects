import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabPanel } from "./TabPanel";

const TABS = [
  { id: "a", label: "Tab A", content: <div>Content A</div> },
  { id: "b", label: "Tab B", content: <div>Content B</div> },
  { id: "c", label: "Tab C", content: <div>Content C</div> },
];

describe("TabPanel", () => {
  it("renders all tab labels", () => {
    render(<TabPanel tabs={TABS} />);
    expect(screen.getByText("Tab A")).toBeInTheDocument();
    expect(screen.getByText("Tab B")).toBeInTheDocument();
    expect(screen.getByText("Tab C")).toBeInTheDocument();
  });

  it("shows first tab content by default", () => {
    render(<TabPanel tabs={TABS} />);
    expect(screen.getByText("Content A")).toBeInTheDocument();
    expect(screen.queryByText("Content B")).not.toBeInTheDocument();
  });

  it("switches content when clicking a tab", async () => {
    const user = userEvent.setup();
    render(<TabPanel tabs={TABS} />);

    await user.click(screen.getByText("Tab B"));
    expect(screen.getByText("Content B")).toBeInTheDocument();
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
  });
});
