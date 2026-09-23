import React from "react";
import styles from "./layers.module.css";
import { CentralHero } from "../hero";
import { PortraitFrameSequence } from "../portrait";
import { AboutSection } from "../about";

export interface HeroLayerProps {
  isHomeVisible?: boolean;
  isAboutActive?: boolean;
  currentFrame?: number;
  exitProgress?: number;
  children?: React.ReactNode;
}

/**
 * HeroLayer — Structural layer for Central Home (ANSHAD), Portrait Frame Sequence, and About Section
 */
export const HeroLayer: React.FC<HeroLayerProps> = ({
  isHomeVisible = false,
  isAboutActive = false,
  currentFrame = 1,
  exitProgress = 0,
  children,
}) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.heroLayer}`}
      data-layer="hero"
    >
      <div className={styles.heroAnchor} data-anchor="hero">
        {children || (
          <>
            {/* 1. Central Home visual: ANSHAD in Akira Expanded Demo */}
            <CentralHero isHomeVisible={isHomeVisible} />

            {/* 2. Cinematic Portrait Sequence (belongs to ABOUT transition) */}
            <div
              className={styles.aboutPortraitWrapper}
              style={{
                opacity: isAboutActive ? 1 : 0,
                pointerEvents: "none",
                visibility: isAboutActive ? "visible" : "hidden",
                transition:
                  "opacity 450ms cubic-bezier(0.16, 1, 0.3, 1), visibility 450ms",
              }}
            >
              <PortraitFrameSequence currentFrame={currentFrame} />
            </div>

            {/* 3. Editorial About Me section */}
            <AboutSection exitProgress={exitProgress} />
          </>
        )}
      </div>
    </div>
  );
};

export default HeroLayer;
