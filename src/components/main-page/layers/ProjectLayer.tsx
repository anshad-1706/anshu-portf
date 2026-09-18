import React from "react";
import styles from "./layers.module.css";

interface ProjectLayerProps {
  children?: React.ReactNode;
}

/**
 * ProjectLayer — Future project file & radial constellation spatial region anchor only.
 * Non-restrictive overflow allows future radial cards to expand cleanly.
 */
export const ProjectLayer: React.FC<ProjectLayerProps> = ({ children }) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.projectLayer}`}
      data-layer="project"
    >
      <div className={styles.projectAnchor} data-anchor="project">
        {children}
      </div>
    </div>
  );
};

export default ProjectLayer;
