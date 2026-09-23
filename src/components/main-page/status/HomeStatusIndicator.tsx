import React from "react";
import styles from "./HomeStatusIndicator.module.css";

export interface HomeStatusIndicatorProps {
  isVisible: boolean;
  className?: string;
}

/**
 * HomeStatusIndicator — Phase 07.2
 * Small editorial availability/status indicator in the bottom-left of Home.
 * Level 4 Supporting Information:
 * ● CURRENTLY BUILDING
 *   SOFTWARE · AI · AUTOMATION
 */
export const HomeStatusIndicator: React.FC<HomeStatusIndicatorProps> = ({
  isVisible,
  className = "",
}) => {
  return (
    <div
      className={`${styles.statusContainer} ${
        isVisible ? styles.statusVisible : styles.statusHidden
      } ${className}`.trim()}
      aria-label="Current Focus: Software, AI, Automation"
      data-element="home-status-indicator"
    >
      <div className={styles.statusLinePrimary}>
        <span className={styles.statusDot} aria-hidden="true" />
        <span>CURRENTLY BUILDING</span>
      </div>
      <span className={styles.statusLineSecondary}>
        SOFTWARE · AI · AUTOMATION
      </span>
    </div>
  );
};

export default HomeStatusIndicator;
