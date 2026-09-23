import React from "react";
import styles from "./SocialControls.module.css";
import { DEFAULT_SOCIAL_ITEMS, type SocialControlsProps } from "./types";

/**
 * SocialControls — Phase 04
 * Secondary personal identity / social presence controls in the bottom-left region of MainPage.
 * Editorial, restrained, monochrome, with clear keyboard focus and semantic links.
 */
export const SocialControls: React.FC<SocialControlsProps> = ({
  className = "",
  items = DEFAULT_SOCIAL_ITEMS,
}) => {
  return (
    <nav
      className={`${styles.socialContainer} ${className}`.trim()}
      aria-label="Personal and Social Identity"
    >
      <div className={styles.identityHeader}>
        <span className={styles.indicator} aria-hidden="true" />
        <span className={styles.identityLabel}>IDENTITY / NETWORK</span>
      </div>

      <ul className={styles.socialList}>
        {items.map((item) => (
          <li key={item.id} className={styles.socialItem}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={item.ariaLabel}
            >
              <span className={styles.platformName}>{item.name}</span>
              <span className={styles.platformHandle}>{item.handle}</span>
              <span className={styles.arrowIcon} aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SocialControls;
