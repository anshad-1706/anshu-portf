import React from "react";
import styles from "./layers.module.css";
import { CentralHero } from "../hero";
import { AboutPage } from "../../about";
import { ProjectsPage } from "../../projects";

export interface HeroLayerProps {
  isHomeVisible?: boolean;
  isAboutActive?: boolean;
  isProjectsActive?: boolean;
  isTransitioningToAbout?: boolean;
  isTransitioningToHome?: boolean;
  isTransitioningToProjects?: boolean;
  isTransitioningFromProjects?: boolean;
  currentFrame?: number;
  exitProgress?: number;
  onReturnHome?: () => void;
  onReturnHomeFromProjects?: () => void;
  children?: React.ReactNode;
}

/**
 * HeroLayer — Phase 03.1 / Phase 08
 * Structural layer for Central Home (ANSHAD), Split-Screen AboutPage, and White ProjectsPage
 */
export const HeroLayer: React.FC<HeroLayerProps> = ({
  isHomeVisible = false,
  isAboutActive = false,
  isProjectsActive = false,
  isTransitioningToAbout = false,
  isTransitioningToHome = false,
  isTransitioningToProjects = false,
  isTransitioningFromProjects = false,
  currentFrame = 1,
  onReturnHome,
  onReturnHomeFromProjects,
  children,
}) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.heroLayer}`}
      data-layer="hero"
    >
      {children || (
        <>
          {/* 1. Central Home visual: ANSHAD in Akira Expanded Demo with coordinated fade */}
          {isHomeVisible && (
            <div
              className={styles.homeFadeWrapper}
              style={{
                opacity:
                  isTransitioningToAbout || isTransitioningToProjects ? 0 : 1,
                transform:
                  isTransitioningToAbout || isTransitioningToProjects
                    ? "scale(0.97)"
                    : "scale(1)",
                pointerEvents:
                  isAboutActive ||
                  isTransitioningToAbout ||
                  isProjectsActive ||
                  isTransitioningToProjects
                    ? "none"
                    : "auto",
              }}
              data-anchor="hero"
            >
              <CentralHero isHomeVisible={true} />
            </div>
          )}

          {/* 2. Full-Viewport Split About Experience with coordinated fade */}
          {isAboutActive && (
            <div
              className={styles.aboutFadeWrapper}
              style={{
                opacity: isTransitioningToHome ? 0 : 1,
                pointerEvents: isTransitioningToHome ? "none" : "auto",
              }}
            >
              <AboutPage currentFrame={currentFrame} onReturnHome={onReturnHome} />
            </div>
          )}

          {/* 3. Full-Viewport Projects Experience with coordinated fade */}
          {isProjectsActive && (
            <div
              className={styles.projectsFadeWrapper}
              style={{
                opacity: isTransitioningFromProjects ? 0 : 1,
                pointerEvents: isTransitioningFromProjects ? "none" : "auto",
              }}
            >
              <ProjectsPage onReturnHome={onReturnHomeFromProjects || onReturnHome} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HeroLayer;
