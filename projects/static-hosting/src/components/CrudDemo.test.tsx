import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrudDemo } from "./CrudDemo";

describe("CrudDemo", () => {
  it("renders form with default values", () => {
    render(<CrudDemo />);
    expect(screen.getByDisplayValue("Helsinki Central Library")).toBeInTheDocument();
    expect(screen.getByDisplayValue("library")).toBeInTheDocument();
  });

  it("renders POST and GET buttons", () => {
    render(<CrudDemo />);
    expect(screen.getByText("POST /items")).toBeInTheDocument();
    expect(screen.getByText("GET /items")).toBeInTheDocument();
  });

  it("shows placeholder when no response", () => {
    render(<CrudDemo />);
    expect(screen.getByText("Send a request to see the response")).toBeInTheDocument();
  });

  it("shows error when API URL not configured", async () => {
    const user = userEvent.setup();
    render(<CrudDemo />);

    await user.click(screen.getByText("POST /items"));
    expect(
      screen.getByText("API URL not configured (set VITE_HA_WEB_API_URL)"),
    ).toBeInTheDocument();
  });

  it("allows editing form fields", async () => {
    const user = userEvent.setup();
    render(<CrudDemo />);

    const nameInput = screen.getByDisplayValue("Helsinki Central Library");
    await user.clear(nameInput);
    await user.type(nameInput, "Test Item");
    expect(screen.getByDisplayValue("Test Item")).toBeInTheDocument();
  });
});
