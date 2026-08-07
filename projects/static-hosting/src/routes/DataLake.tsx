import { Link } from "react-router";
import { PROJECTS } from "@/data/projects";
import { DECISIONS } from "@/data/decisions";
import { ProjectHeader } from "@/components/ProjectHeader";
import { TabPanel } from "@/components/TabPanel";
import { ArchDiagram } from "@/components/ArchDiagram";
import { QueryViewer } from "@/components/QueryViewer";
import { CostTable } from "@/components/CostTable";
import { DecisionCards } from "@/components/DecisionCard";
import styles from "./ProjectDetail.module.css";

const PROJECT = PROJECTS.find((p) => p.id === "data-lake")!;
const PROJECT_DECISIONS = DECISIONS["data-lake"];

export function DataLake() {
  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        ← Back to Projects
      </Link>
      <ProjectHeader project={PROJECT} />
      <TabPanel
        tabs={[
          {
            id: "architecture",
            label: "Architecture",
            content: (
              <>
                <ArchDiagram projectId="data-lake" />
                <DecisionCards data={PROJECT_DECISIONS} />
              </>
            ),
          },
          {
            id: "try-it",
            label: "Try It",
            content: <QueryViewer />,
          },
          {
            id: "cost",
            label: "Cost",
            content: (
              <CostTable
                items={PROJECT.costItems}
                dailyCost={PROJECT.dailyCost}
              />
            ),
          },
          {
            id: "decisions",
            label: "Decisions",
            content: <DecisionCards data={PROJECT_DECISIONS} />,
          },
        ]}
      />
    </div>
  );
}
