import { useState } from "react";
import styles from "./ChatDemo.module.css";

const API_BASE = import.meta.env.VITE_RAG_API_URL ?? "";
const API_KEY = import.meta.env.VITE_RAG_API_KEY ?? "";

interface Message {
  role: "user" | "assistant";
  content: string;
  meta?: { sourcesUsed: number; model: string; latencyMs: number };
}

export function ChatDemo() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const question = input.trim();
    if (!question) return;

    if (!API_BASE || !API_KEY) {
      setError("RAG API not configured (set VITE_RAG_API_URL and VITE_RAG_API_KEY)");
      return;
    }

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const latencyMs = Math.round(performance.now() - start);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          meta: {
            sourcesUsed: data.sources_used,
            model: data.model,
            latencyMs,
          },
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.chat}>
        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.empty}>
              Ask a question about Helsinki services
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.role === "user" ? styles.userMsg : styles.assistantMsg
              }
            >
              <div className={styles.msgContent}>{msg.content}</div>
              {msg.meta && (
                <div className={styles.meta}>
                  {msg.meta.sourcesUsed} sources · {msg.meta.model.split("/").pop()} ·{" "}
                  {(msg.meta.latencyMs / 1000).toFixed(1)}s
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className={styles.assistantMsg}>
              <div className={styles.msgContent}>Thinking...</div>
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Helsinki services..."
            disabled={loading}
          />
          <button
            className={styles.sendButton}
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
          >
            Ask →
          </button>
        </div>
      </div>
      <div className={styles.rateNote}>
        Rate limited: 10 req/sec, 100 req/day
      </div>
    </div>
  );
}
