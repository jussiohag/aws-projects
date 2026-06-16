import { useState } from "react";
import styles from "./CrudDemo.module.css";

const API_BASE = import.meta.env.VITE_HA_WEB_API_URL ?? "";

interface ApiResponse {
  status: number;
  latencyMs: number;
  body: unknown;
}

export function CrudDemo() {
  const [name, setName] = useState("Helsinki Central Library");
  const [category, setCategory] = useState("library");
  const [description, setDescription] = useState(
    "Oodi — award-winning public library",
  );
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function callApi(method: string, path: string, body?: unknown) {
    if (!API_BASE) {
      setError("API URL not configured (set VITE_HA_WEB_API_URL)");
      return;
    }
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      setResponse({
        status: res.status,
        latencyMs: Math.round(performance.now() - start),
        body: data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    callApi("POST", "/items", { name, category, description });
  }

  function handleList() {
    callApi("GET", "/items");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.panels}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Create Item</div>
          <label className={styles.label}>
            Name
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Category
            <input
              className={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Description
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button
            className={styles.button}
            onClick={handleCreate}
            disabled={loading}
          >
            POST /items
          </button>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>Response</div>
          {error && <div className={styles.error}>{error}</div>}
          {response && (
            <div className={styles.response}>
              <div className={styles.responseMeta}>
                <span
                  className={
                    response.status < 300
                      ? styles.statusOk
                      : styles.statusError
                  }
                >
                  {response.status}
                </span>
                <span className={styles.latency}>
                  {response.latencyMs}ms
                </span>
              </div>
              <pre className={styles.json}>
                {JSON.stringify(response.body, null, 2)}
              </pre>
            </div>
          )}
          {!response && !error && (
            <div className={styles.placeholder}>
              Send a request to see the response
            </div>
          )}
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={handleList}
              disabled={loading}
            >
              GET /items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
