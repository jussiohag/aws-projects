import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Landing } from "@/routes/Landing";

function Placeholder({ name }: { name: string }) {
  return <div style={{ padding: 24, color: "var(--text-heading)" }}>{name}</div>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="data-lake" element={<Placeholder name="Data Lake" />} />
          <Route
            path="ha-web-service"
            element={<Placeholder name="HA Web Service" />}
          />
          <Route
            path="rag-bedrock"
            element={<Placeholder name="RAG on Bedrock" />}
          />
          <Route
            path="static-hosting"
            element={<Placeholder name="Static Hosting" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
