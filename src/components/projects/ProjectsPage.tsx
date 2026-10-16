import React from "react";
import styles from "./ProjectsPage.module.css";

export interface ProjectsPageProps {
  onReturnHome?: () => void;
  className?: string;
}

/**
 * ProjectsPage — Clean White Destination Page
 * Establishes the clean, functional destination for the Home project folder interaction.
 */
export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  onReturnHome,
  className = "",
}) => {
  return (
    <div
      className={`${styles.projectsPageContainer} ${className}`.trim()}
      id="projects"
      role="region"
      aria-label="Projects Archive"
    >
      <div className={styles.contentWrapper}>
        {/* 1. Header Metadata Category */}
        <div className={styles.metaRow}>
          <span className={styles.metaIndex}>INDEX // 01</span>
          <span className={styles.statusBadge}>
            <span className={styles.statusDot} aria-hidden="true" />
            ACTIVE ARCHIVE
          </span>
          <span className={styles.metaYear}>2026</span>
        </div>

        {/* 2. Main Architectural Display Heading */}
        <h1 className={styles.title}>PROJECTS</h1>

        {/* 3. Subtitle / Statement */}
        <p className={styles.subtitle}>
          Curated software architecture, generative systems, and creative technology experiments.
        </p>

        {/* 4. Action Area: Navigation back to Home */}
        <div className={styles.actionRow}>
          <button
            type="button"
            onClick={onReturnHome}
            className={styles.returnButton}
            aria-label="Return to Home screen"
          >
            <span className={styles.returnArrow} aria-hidden="true">
              ←
            </span>
            RETURN TO HOME
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
