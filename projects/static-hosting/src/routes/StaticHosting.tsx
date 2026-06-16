import { Link } from "react-router-dom";
import { PROJECTS } from "@/data/projects";
import { DECISIONS } from "@/data/decisions";
import { ProjectHeader } from "@/components/ProjectHeader";
import { TabPanel } from "@/components/TabPanel";
import { ArchDiagram } from "@/components/ArchDiagram";
import { CostTable } from "@/components/CostTable";
import { DecisionCards } from "@/components/DecisionCard";
import styles from "./ProjectDetail.module.css";

const PROJECT = PROJECTS.find((p) => p.id === "static-hosting")!;
const PROJECT_DECISIONS = DECISIONS["static-hosting"];

function ThisSiteDemo() {
  return (
    <div style={{ maxWidth: 600 }}>
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          padding: 20,
        }}
      >
        <h3
          style={{
            color: "var(--text-heading)",
            margin: "0 0 12px",
            fontSize: 16,
          }}
        >
          You are here
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 13,
            lineHeight: 1.5,
            margin: "0 0 16px",
          }}
        >
          This portfolio is itself an AWS project. It's a React SPA built with
          Vite and TypeScript, deployed to an S3 bucket behind a CloudFront
          distribution with Origin Access Control (OAC).
        </p>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 13,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Every <code style={{ color: "var(--accent)" }}>make deploy-static</code>{" "}
          builds the React app, uploads the dist/ to S3, and invalidates the
          CloudFront cache — all via a CDK BucketDeployment construct.
        </p>
      </div>
    </div>
  );
}

export function StaticHosting() {
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
                <ArchDiagram projectId="static-hosting" />
                <DecisionCards data={PROJECT_DECISIONS} />
              </>
            ),
          },
          {
            id: "try-it",
            label: "Try It",
            content: <ThisSiteDemo />,
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
