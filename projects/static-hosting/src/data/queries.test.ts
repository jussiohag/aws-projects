import { describe, it, expect } from "vitest";
import { QUERIES } from "./queries";

describe("QUERIES", () => {
  it("has 8 queries matching the SQL files", () => {
    expect(QUERIES).toHaveLength(8);
  });

  it("each query has required fields", () => {
    for (const q of QUERIES) {
      expect(q.id).toBeTruthy();
      expect(q.label).toBeTruthy();
      expect(q.sql).toBeTruthy();
      expect(q.result.columns.length).toBeGreaterThan(0);
      expect(q.result.rows.length).toBeGreaterThan(0);
    }
  });

  it("has unique ids", () => {
    const ids = QUERIES.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("query-parquet has both CSV and Parquet bytes scanned", () => {
    const parquet = QUERIES.find((q) => q.id === "query-parquet");
    expect(parquet?.bytesScanned).toHaveLength(2);
    expect(parquet?.bytesScanned?.[0].format).toBe("CSV");
    expect(parquet?.bytesScanned?.[1].format).toBe("Parquet");
  });
});
