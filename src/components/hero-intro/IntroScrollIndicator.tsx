import React from "react";
import styles from "./IntroScrollIndicator.module.css";

export interface IntroScrollIndicatorProps {
  isVisible: boolean;
  hasScrolled: boolean;
  className?: string;
}

/**
 * IntroScrollIndicator — Phase 07.4
 * Subtle interaction indicator on the initial HeroIntro screen.
 * Displays "SCROLL DOWN" + animated vertical line after ANSHAD has settled.
 * Fades out quietly as soon as the user starts scrolling down.
 */
export const IntroScrollIndicator: React.FC<IntroScrollIndicatorProps> = ({
  isVisible,
  hasScrolled,
  className = "",
}) => {
  const stateClass = isVisible
    ? styles.scrollVisible
    : hasScrolled
    ? styles.scrollExited
    : styles.scrollHidden;

  return (
    <div
      className={`${styles.scrollContainer} ${stateClass} ${className}`.trim()}
      aria-hidden="true"
      data-element="intro-scroll-indicator"
    >
      <span className={styles.scrollLabel}>SCROLL DOWN</span>
      <div className={styles.scrollLine} />
    </div>
  );
};

export default IntroScrollIndicator;
