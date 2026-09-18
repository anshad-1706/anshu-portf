import React from "react";
import styles from "./MainPage.module.css";
import { BackgroundLayer } from "./layers/BackgroundLayer";
import { AmbientLayer } from "./layers/AmbientLayer";
import { HeroLayer } from "./layers/HeroLayer";
import { NavigationLayer } from "./layers/NavigationLayer";
import { SocialLayer } from "./layers/SocialLayer";
import { ProjectLayer } from "./layers/ProjectLayer";
import { CursorLayer } from "./layers/CursorLayer";

export interface MainPageProps {
  className?: string;
}

/**
 * MainPage — Phase 0 Foundation
 * Establishes the clean layered architecture and spatial coordinate system
 * for the main-page experience following the approved cinematic intro and Scene 04.
 */
export const MainPage: React.FC<MainPageProps> = ({ className = "" }) => {
  return (
    <section
      className={`${styles.mainPageContainer} ${className}`.trim()}
      aria-label="Main Portfolio Experience"
    >
      {/* 1. Background Canvas Layer (z-index: 1) */}
      <BackgroundLayer />

      {/* 2. Ambient Atmosphere Layer (z-index: 2) */}
      <AmbientLayer />

      {/* 3. Central Hero & Portrait Layer (z-index: 10) */}
      <HeroLayer />

      {/* 4. Social Layer — Future spatial anchor only (z-index: 20) */}
      <SocialLayer />

      {/* 5. Project Layer — Future project file & constellation hub (z-index: 30) */}
      <ProjectLayer />

      {/* 6. Navigation Layer — Top brand & top-center nav (z-index: 40) */}
      <NavigationLayer />

      {/* 7. Cursor Layer — Overlay for future custom 3D cursor (z-index: 100) */}
      <CursorLayer />
    </section>
  );
};

export default MainPage;
