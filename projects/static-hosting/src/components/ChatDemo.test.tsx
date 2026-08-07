import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatDemo } from "./ChatDemo";

describe("ChatDemo", () => {
  it("renders empty state", () => {
    render(<ChatDemo />);
    expect(
      screen.getByText("Ask a question about Helsinki services"),
    ).toBeInTheDocument();
  });

  it("renders input and send button", () => {
    render(<ChatDemo />);
    expect(
      screen.getByPlaceholderText("Ask about Helsinki services..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Ask →")).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    render(<ChatDemo />);
    expect(screen.getByText("Ask →")).toBeDisabled();
  });

  it("send button enables when input has text", async () => {
    const user = userEvent.setup();
    render(<ChatDemo />);

    await user.type(
      screen.getByPlaceholderText("Ask about Helsinki services..."),
      "What libraries?",
    );
    expect(screen.getByText("Ask →")).not.toBeDisabled();
  });

  it("shows rate limit note", () => {
    render(<ChatDemo />);
    expect(
      screen.getByText("Rate limited: 10 req/sec, 100 req/day"),
    ).toBeInTheDocument();
  });
});
