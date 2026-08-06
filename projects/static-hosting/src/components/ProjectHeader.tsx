import type { Project } from "@/data/projects";
import styles from "./ProjectHeader.module.css";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const isThisSite = project.status === "this-site";

  return (
    <div className={styles.header}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>
            {project.icon} {project.name}
          </h1>
          <p className={styles.description}>{project.description}</p>
        </div>
        <span
          className={`${styles.badge} ${isThisSite ? styles.badgeThisSite : styles.badgeDeployed}`}
        >
          {isThisSite ? "THIS SITE" : "DEPLOYED"}
        </span>
      </div>
      <div className={styles.tags}>
        {project.services.map((service) => (
          <span key={service} className={styles.tag}>
            {service}
          </span>
        ))}
      </div>
    </div>
  );
}
