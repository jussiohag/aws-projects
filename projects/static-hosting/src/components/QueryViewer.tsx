import { useState } from "react";
import { QUERIES } from "@/data/queries";
import styles from "./QueryViewer.module.css";

export function QueryViewer() {
  const [activeQuery, setActiveQuery] = useState(QUERIES[0].id);
  const query = QUERIES.find((q) => q.id === activeQuery) ?? QUERIES[0];

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        {QUERIES.map((q) => (
          <button
            key={q.id}
            className={`${styles.tab} ${q.id === activeQuery ? styles.activeTab : ""}`}
            onClick={() => setActiveQuery(q.id)}
          >
            {q.label}
          </button>
        ))}
      </div>

      <p className={styles.description}>{query.description}</p>

      <pre className={styles.sql}>
        <code>{query.sql}</code>
      </pre>

      <div className={styles.resultLabel}>Results preview (pre-computed):</div>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          {query.result.columns.map((col) => (
            <span key={col}>{col}</span>
          ))}
        </div>
        {query.result.rows.map((row, i) => (
          <div key={i} className={styles.tableRow}>
            {row.map((cell, j) => (
              <span key={j}>{cell}</span>
            ))}
          </div>
        ))}
      </div>

      {query.bytesScanned && (
        <div className={styles.costLine}>
          📊 Bytes scanned:{" "}
          {query.bytesScanned.map((b, i) => (
            <span key={b.format}>
              {i > 0 && " → "}
              <span
                className={
                  b.format === "CSV" ? styles.costHigh : styles.costLow
                }
              >
                {b.bytes} ({b.format})
              </span>
            </span>
          ))}
          {query.bytesScanned.length > 1 && (
            <span className={styles.costSaving}> — 99% reduction</span>
          )}
        </div>
      )}
    </div>
  );
}
