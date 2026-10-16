import React from "react";
import styles from "./AboutIdentity.module.css";
import { PortraitFrameSequence } from "../main-page/portrait";

export interface AboutIdentityProps {
  currentFrame: number;
  className?: string;
}

/**
 * AboutIdentity — Phase 03.1
 * Permanent identity panel on the left side of the About world.
 * Contains:
 * 1. "HII! I'M ANSHAD"
 * 2. Permanent sharp Portrait (frame 76)
 * 3. Soft atmospheric black background
 * 4. "WHO AM I?" Section
 */
export const AboutIdentity: React.FC<AboutIdentityProps> = ({
  currentFrame,
  className = "",
}) => {
  return (
    <aside
      className={`${styles.identityPanel} ${className}`.trim()}
      aria-label="Identity and Profile"
    >
      {/* Main Identity Content floating naturally on grand white background */}
      <div className={styles.contentContainer}>
        {/* Heading */}
        <div className={styles.headingWrapper}>
          <span className={styles.eyebrowTag} aria-hidden="true">
            IDENTITY // ARCHIVE
          </span>
          <h1 className={styles.heading}>HII! I'M ANSHAD</h1>
        </div>

        {/* Cinematic Portrait Canvas (Frame 76 held) */}
        <div className={styles.portraitWrapper}>
          <PortraitFrameSequence currentFrame={currentFrame} />
        </div>

        {/* WHO AM I? Structural Section */}
        <section className={styles.whoAmISection} aria-labelledby="who-am-i-heading">
          <h2 id="who-am-i-heading" className={styles.sectionLabel}>
            WHO AM I?
          </h2>
          <p className={styles.statement}>
            A Software Architect and Developer building living computational systems,
            autonomous intelligence pipelines, and tactile editorial digital experiences.
          </p>
          <div className={styles.metaRow} aria-hidden="true">
            <div className={styles.metaItem}>
              <div className={styles.metaDot} />
              <span className={styles.metaText}>COIMBATORE, TAMIL NADU, INDIA</span>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaDot} />
              <span className={styles.metaText}>SYSTEMS &amp; INTERFACES</span>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
};

export default AboutIdentity;
