import { describe, it, expect } from "vitest";
import { PROJECTS, STATS } from "./projects";

describe("PROJECTS", () => {
  it("has exactly 4 projects", () => {
    expect(PROJECTS).toHaveLength(4);
  });

  it("each project has required fields", () => {
    for (const p of PROJECTS) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.route).toMatch(/^\//);
      expect(p.services.length).toBeGreaterThan(0);
      expect(p.costItems.length).toBeGreaterThan(0);
    }
  });

  it("has unique ids and routes", () => {
    const ids = PROJECTS.map((p) => p.id);
    const routes = PROJECTS.map((p) => p.route);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("static-hosting has this-site status", () => {
    const staticHosting = PROJECTS.find((p) => p.id === "static-hosting");
    expect(staticHosting?.status).toBe("this-site");
  });

  it("all other projects have deployed status", () => {
    const others = PROJECTS.filter((p) => p.id !== "static-hosting");
    for (const p of others) {
      expect(p.status).toBe("deployed");
    }
  });
});

describe("STATS", () => {
  it("project count matches PROJECTS length", () => {
    expect(STATS.projectCount).toBe(PROJECTS.length);
  });

  it("region is eu-north-1", () => {
    expect(STATS.region).toBe("eu-north-1");
  });
});
