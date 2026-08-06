import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS, STATS } from "@/data/projects";
import styles from "./Landing.module.css";

export function Landing() {
  return (
    <div className={styles.landing}>
      <section className={styles.hero}>
        <h1 className={styles.title}>AWS Architecture Demos</h1>
        <p className={styles.subtitle}>
          Production-grade infrastructure patterns deployed to eu-north-1
        </p>
        <div className={styles.badges}>
          <span className={styles.badge}>CDK Python</span>
          <span className={styles.badge}>eu-north-1</span>
          <span className={styles.badge}>{STATS.projectCount} Projects</span>
        </div>
      </section>

      <section className={styles.grid}>
        {PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </section>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{STATS.projectCount}</span>
          <span className={styles.statLabel}>Projects</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{STATS.serviceCount}</span>
          <span className={styles.statLabel}>AWS Services</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{STATS.dailyCost}</span>
          <span className={styles.statLabel}>Total Cost</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{STATS.region}</span>
          <span className={styles.statLabel}>Region</span>
        </div>
      </section>
    </div>
  );
}
