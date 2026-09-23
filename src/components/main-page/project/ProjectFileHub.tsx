import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./ProjectFileHub.module.css";
import { FileVisual } from "./FileVisual";
import { ProjectCard } from "./ProjectCard";
import {
  DEFAULT_PROJECT_ITEMS,
  type ProjectFileHubProps,
} from "./types";

/**
 * ProjectFileHub — Phase 05 Micro-Revision
 * Physical 3D Project File in the bottom-right region of MainPage.
 * Closed: single compact dark graphite folder with protruding white sheets.
 * Open: folder physically opens, white sheets articulate with rotateX, and ONE large
 * editorial project card emerges upward out of the folder.
 */
export const ProjectFileHub: React.FC<ProjectFileHubProps> = ({
  className = "",
  projects = DEFAULT_PROJECT_ITEMS,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hubRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;

  // Synchronize open state with external focus blur callback
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Mobile / Touch outside click listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (event: PointerEvent) => {
      if (hubRef.current && !hubRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, [isOpen]);

  // Clean up close timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Desktop proximity hover open with hysteresis cancellation
  const handlePointerEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  // 180ms hysteresis buffer prevents accidental collapse while moving between file and cards
  const handlePointerLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  // Touch tap toggle on file button
  const handleFileClick = () => {
    setIsOpen((prev) => !prev);
  };

  // Keyboard accessibility
  const handleFocus = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!hubRef.current?.contains(event.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      fileRef.current?.focus();
    }
  };

  const activeProjects = projects.slice(0, 3);

  return (
    <div
      ref={hubRef}
      className={`${styles.hubContainer} ${isOpen ? `${styles.isOpen} fileOpen` : ""} ${className}`.trim()}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      aria-label="Project File Hub"
    >
      {/* Invisible proximity & complete active interaction area */}
      <div className={styles.hitArea} aria-hidden="true" />

      {/* Physical 3D File Visual Anchor hosting the 3 primary project cards */}
      <FileVisual
        ref={fileRef}
        isOpen={isOpen}
        onClick={handleFileClick}
        shouldReduceMotion={shouldReduceMotion}
      >
        <div className={styles.projectStage} aria-live="polite">
          {activeProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isOpen={isOpen}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      </FileVisual>

      {/* Contextual Interaction Hint: EXPLORE PROJECTS directly below closed file */}
      <span
        className={`${styles.exploreHint} ${
          isOpen ? styles.exploreHintHidden : styles.exploreHintVisible
        }`}
        aria-hidden="true"
      >
        EXPLORE PROJECTS
      </span>
    </div>
  );
};

export default ProjectFileHub;
