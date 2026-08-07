import { NavLink, Outlet } from "react-router";
import styles from "./Layout.module.css";

const GITHUB_URL = "https://github.com/jussiohag/aws-projects";

export function Layout() {
  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo}>
          ☁ AWS Portfolio
        </NavLink>
        <div className={styles.links}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            Projects
          </NavLink>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            GitHub ↗
          </a>
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
