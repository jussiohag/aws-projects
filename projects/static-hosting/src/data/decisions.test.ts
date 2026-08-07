import { describe, it, expect } from "vitest";
import { DECISIONS } from "./decisions";
import { PROJECTS } from "./projects";

describe("DECISIONS", () => {
  it("has decisions for every project", () => {
    for (const p of PROJECTS) {
      expect(DECISIONS[p.id]).toBeDefined();
      expect(DECISIONS[p.id].projectId).toBe(p.id);
    }
  });

  it("each project has at least one key point", () => {
    for (const d of Object.values(DECISIONS)) {
      expect(d.keyPoints.length).toBeGreaterThan(0);
    }
  });

  it("each key point has title and description", () => {
    for (const d of Object.values(DECISIONS)) {
      for (const kp of d.keyPoints) {
        expect(kp.title).toBeTruthy();
        expect(kp.description).toBeTruthy();
      }
    }
  });

  it("each decision has context, decision, and consequences", () => {
    for (const d of Object.values(DECISIONS)) {
      for (const dec of d.decisions) {
        expect(dec.title).toBeTruthy();
        expect(dec.context).toBeTruthy();
        expect(dec.decision).toBeTruthy();
        expect(dec.consequences).toBeTruthy();
      }
    }
  });
});
