import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Landing } from "@/routes/Landing";
import { DataLake } from "@/routes/DataLake";
import { HaWebService } from "@/routes/HaWebService";
import { RagBedrock } from "@/routes/RagBedrock";
import { StaticHosting } from "@/routes/StaticHosting";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="data-lake" element={<DataLake />} />
          <Route path="ha-web-service" element={<HaWebService />} />
          <Route path="rag-bedrock" element={<RagBedrock />} />
          <Route path="static-hosting" element={<StaticHosting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
