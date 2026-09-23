import React from "react";
import styles from "./ProjectCard.module.css";
import type { ProjectCardProps } from "./types";

/**
 * ProjectCard — Phase 05 Primary Project Card System
 * Single card component with two visual states:
 * - Closed: Compact file-document mock card resting physically inside the folder cavity.
 * - Open: Emerges outward from its mock position, scales up, sharpens, and reveals full editorial content.
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index = 0,
  isOpen = false,
}) => {
  const indexClass =
    index === 0 ? styles.card01 : index === 1 ? styles.card02 : styles.card03;

  const cardInner = (
    <>
      {/* 1. Upper Image Stage */}
      <div className={styles.imageStage}>
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className={styles.projectImage}
            loading="eager"
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        <div className={styles.imageOverlay} />
        <span className={styles.indexBadge} aria-hidden="true">
          {project.index}
        </span>
      </div>

      {/* 2. Lower Editorial Information Section */}
      <div className={styles.infoStage}>
        <div className={styles.metaHeader}>
          <span className={styles.category}>{project.category}</span>
          <span className={styles.arrowIcon} aria-hidden="true">
            ↗
          </span>
        </div>
        <h3 className={styles.title}>{project.title}</h3>
        {project.description && (
          <p className={styles.description}>{project.description}</p>
        )}
      </div>
    </>
  );

  return (
    <div
      className={`${styles.cardWrapper} ${indexClass} ${isOpen ? styles.cardOpen : styles.cardClosed}`}
      aria-hidden={!isOpen}
    >
      {project.href ? (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cardContainer}
          tabIndex={isOpen ? 0 : -1}
          aria-label={`${project.title} — ${project.category || "Project details"} (opens in new tab)`}
        >
          {cardInner}
        </a>
      ) : (
        <div
          className={styles.cardContainer}
          role="article"
          tabIndex={isOpen ? 0 : -1}
          aria-label={`${project.title} — ${project.category || "Project details"}`}
        >
          {cardInner}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
