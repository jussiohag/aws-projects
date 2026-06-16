import type { ProjectDecisions } from "@/data/decisions";
import styles from "./DecisionCard.module.css";

interface DecisionCardProps {
  data: ProjectDecisions;
}

export function DecisionCards({ data }: DecisionCardProps) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>Key Architecture Decisions</h3>
      <div className={styles.keyPoints}>
        {data.keyPoints.map((point) => (
          <div key={point.title} className={styles.point}>
            <div className={styles.pointTitle}>{point.title}</div>
            <div className={styles.pointDesc}>{point.description}</div>
          </div>
        ))}
      </div>

      {data.decisions.length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>Decision Records</h3>
          {data.decisions.map((decision) => (
            <div key={decision.title} className={styles.adr}>
              <h4 className={styles.adrTitle}>{decision.title}</h4>
              <div className={styles.adrSection}>
                <span className={styles.adrLabel}>Context</span>
                <p>{decision.context}</p>
              </div>
              <div className={styles.adrSection}>
                <span className={styles.adrLabel}>Decision</span>
                <p>{decision.decision}</p>
              </div>
              <div className={styles.adrSection}>
                <span className={styles.adrLabel}>Consequences</span>
                <p>{decision.consequences}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
