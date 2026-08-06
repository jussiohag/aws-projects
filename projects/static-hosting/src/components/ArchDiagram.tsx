import styles from "./ArchDiagram.module.css";

interface DiagramNode {
  label: string;
  icon: string;
  sublabel?: string;
}

interface DiagramProps {
  nodes: DiagramNode[];
}

function DiagramFlow({ nodes }: DiagramProps) {
  return (
    <div className={styles.flow}>
      {nodes.map((node, i) => (
        <div key={node.label} className={styles.nodeGroup}>
          {i > 0 && <div className={styles.arrow}>→</div>}
          <div className={styles.node}>
            <span className={styles.nodeIcon}>{node.icon}</span>
            <span className={styles.nodeLabel}>{node.label}</span>
            {node.sublabel && (
              <span className={styles.nodeSub}>{node.sublabel}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const DIAGRAMS: Record<string, DiagramNode[]> = {
  "data-lake": [
    { label: "Helsinki API", icon: "🌍" },
    { label: "S3 raw/", icon: "📦", sublabel: "CSV" },
    { label: "Glue Crawler", icon: "🕷️", sublabel: "Schema Detection" },
    { label: "Athena", icon: "🔍", sublabel: "SQL Queries" },
    { label: "S3 curated/", icon: "📦", sublabel: "Parquet / Iceberg" },
  ],
  "ha-web-service": [
    { label: "Internet", icon: "🌍" },
    { label: "ALB", icon: "⚖️", sublabel: "Public Subnet" },
    { label: "Fargate ×2", icon: "🐳", sublabel: "Private Subnet (2 AZ)" },
    { label: "DynamoDB", icon: "📊", sublabel: "VPC Endpoint" },
  ],
  "rag-bedrock": [
    { label: "Client", icon: "💻" },
    { label: "API Gateway", icon: "🚪", sublabel: "API Key + Throttle" },
    { label: "Lambda", icon: "⚡", sublabel: "Retrieve + Invoke" },
    { label: "Bedrock", icon: "🤖", sublabel: "Claude Haiku" },
  ],
  "static-hosting": [
    { label: "Browser", icon: "💻" },
    { label: "CloudFront", icon: "🌐", sublabel: "CDN + HTTPS" },
    { label: "OAC", icon: "🔑", sublabel: "Access Control" },
    { label: "S3 Bucket", icon: "📦", sublabel: "Static Files" },
  ],
};

interface ArchDiagramProps {
  projectId: string;
}

export function ArchDiagram({ projectId }: ArchDiagramProps) {
  const nodes = DIAGRAMS[projectId];
  if (!nodes) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>Architecture Diagram</div>
      <DiagramFlow nodes={nodes} />
    </div>
  );
}
