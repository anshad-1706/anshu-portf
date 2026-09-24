import React from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./layers.module.css";
import { ProjectFileHub } from "../project";

export interface ProjectLayerProps {
  children?: React.ReactNode;
  className?: string;
  isHomeVisible?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * ProjectLayer — Phase 06.3 / Phase 07.5
 * Project File Hub positioned optically below central ANSHAD heading (+150px downward).
 * Coordinates responsive vertical offset (z-index: 60) with unclipped overflow.
 * Synchronized to enter at T+380ms during the unified first-scroll Home reveal.
 */
export const ProjectLayer: React.FC<ProjectLayerProps> = ({
  children,
  className = "",
  isHomeVisible = true,
  onOpenChange,
}) => {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <div
      className={`${styles.layerBase} ${styles.projectLayer} ${className}`.trim()}
      data-layer="project"
      style={{
        opacity: isHomeVisible ? 1 : 0,
        visibility: isHomeVisible ? "visible" : "hidden",
        pointerEvents: "none",
        transition: shouldReduceMotion
          ? "none"
          : "opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), visibility 500ms",
        transitionDelay: shouldReduceMotion || !isHomeVisible ? "0ms" : "380ms",
      }}
    >
      <div
        className={styles.projectAnchor}
        data-anchor="project"
        style={{ pointerEvents: isHomeVisible ? "auto" : "none" }}
      >
        {children || <ProjectFileHub onOpenChange={onOpenChange} />}
      </div>
    </div>
  );
};

export default ProjectLayer;
