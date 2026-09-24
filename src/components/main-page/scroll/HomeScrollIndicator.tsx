import React from "react";
import styles from "./HomeScrollIndicator.module.css";

export interface HomeScrollIndicatorProps {
  isVisible: boolean;
  className?: string;
}

/**
 * HomeScrollIndicator — Phase 07.2
 * Minimal scroll exploration indicator near the bottom-center of the Home page.
 * "SCROLL" + thin vertical line + subtle motion pulse.
 * Fades away as soon as user begins leaving the initial Home state.
 */
export const HomeScrollIndicator: React.FC<HomeScrollIndicatorProps> = ({
  isVisible,
  className = "",
}) => {
  return (
    <div
      className={`${styles.scrollContainer} ${
        isVisible ? styles.scrollVisible : styles.scrollHidden
      } ${className}`.trim()}
      aria-hidden="true"
      data-element="home-scroll-indicator"
    >
      <span className={styles.scrollLabel}>SCROLL</span>
      <div className={styles.scrollLine} />
    </div>
  );
};

export default HomeScrollIndicator;
