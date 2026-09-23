import React from "react";
import styles from "./layers.module.css";
import { ProjectFileHub } from "../project";

export interface ProjectLayerProps {
  children?: React.ReactNode;
  className?: string;
  isHomeVisible?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * ProjectLayer — Phase 06.3
 * Project File Hub positioned optically below central ANSHAD heading (+150px downward).
 * Coordinates responsive vertical offset (z-index: 60) with unclipped overflow.
 * Smoothly transitions out when navigating toward About.
 */
export const ProjectLayer: React.FC<ProjectLayerProps> = ({
  children,
  className = "",
  isHomeVisible = true,
  onOpenChange,
}) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.projectLayer} ${className}`.trim()}
      data-layer="project"
      style={{
        opacity: isHomeVisible ? 1 : 0,
        visibility: isHomeVisible ? "visible" : "hidden",
        pointerEvents: isHomeVisible ? "auto" : "none",
        transition:
          "opacity 450ms cubic-bezier(0.16, 1, 0.3, 1), visibility 450ms",
      }}
    >
      <div className={styles.projectAnchor} data-anchor="project">
        {children || <ProjectFileHub onOpenChange={onOpenChange} />}
      </div>
    </div>
  );
};

export default ProjectLayer;
