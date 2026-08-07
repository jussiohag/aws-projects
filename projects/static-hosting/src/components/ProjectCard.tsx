import { Link } from "react-router-dom";
import type { Project } from "@/data/projects";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isThisSite = project.status === "this-site";

  return (
    <Link
      to={project.route}
      className={`${styles.card} ${isThisSite ? styles.thisSite : ""}`}
    >
      <div className={styles.header}>
        <span className={styles.icon}>{project.icon}</span>
        <span
          className={`${styles.badge} ${isThisSite ? styles.badgeThisSite : styles.badgeDeployed}`}
        >
          {isThisSite ? "THIS SITE" : "DEPLOYED"}
        </span>
      </div>
      <h3 className={styles.name}>{project.name}</h3>
      <p className={styles.description}>{project.description}</p>
      <div className={styles.tags}>
        {project.services.map((service) => (
          <span key={service} className={styles.tag}>
            {service}
          </span>
        ))}
      </div>
    </Link>
  );
}
