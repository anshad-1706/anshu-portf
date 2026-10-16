import React, { useState, useRef } from "react";
import styles from "./JourneyStop.module.css";
import type { JourneyStopData, StopState } from "./journeyTypes";

export interface JourneyStopProps {
  stop: JourneyStopData;
  index: number;
  state: StopState;
  onOpenDetail?: (stop: JourneyStopData, rect: DOMRect) => void;
  className?: string;
}

/**
 * JourneyStop — Reusable Stop Node along the Journey Road
 * - Default state: Clean collapsed marker on the curved road + title badge with connector line.
 * - Desktop hover: Smoothly reveals contextual compact preview to the left (avoiding floating contact nav).
 * - Click / Touch action: Triggers macOS Genie-inspired expansion into centered full detail view.
 */
export const JourneyStop: React.FC<JourneyStopProps> = ({
  stop,
  index,
  state,
  onOpenDetail,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchPreviewOpen, setIsTouchPreviewOpen] = useState(false);
  const titleAreaRef = useRef<HTMLDivElement>(null);

  const isRevealed = isHovered || isTouchPreviewOpen;

  const stateClass =
    state === "active"
      ? styles.isActive
      : state === "approaching"
      ? styles.isApproaching
      : styles.isPassed;

  // Trigger full detail view with physical origin coordinates
  const triggerOpenDetail = () => {
    if (onOpenDetail && titleAreaRef.current) {
      const rect = titleAreaRef.current.getBoundingClientRect();
      onOpenDetail(stop, rect);
    }
  };

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if coarse pointer (touch device)
    const isTouchDevice =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0);

    if (isTouchDevice) {
      if (!isTouchPreviewOpen) {
        setIsTouchPreviewOpen(true);
        return;
      }
    }

    // Direct click opens the full detail view
    triggerOpenDetail();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerOpenDetail();
    } else if (e.key === "Escape" && isTouchPreviewOpen) {
      setIsTouchPreviewOpen(false);
    }
  };

  return (
    <div
      className={[
        styles.stopContainer,
        stateClass,
        isRevealed ? styles.isRevealed : "",
        className,
      ]
        .join(" ")
        .trim()}
      style={{ top: `${stop.yPosition}px` }}
      data-stop-id={stop.id}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") setIsHovered(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") {
          setIsHovered(false);
          setIsTouchPreviewOpen(false);
        }
      }}
    >
      {/* 1. Road Marker Node */}
      <div className={styles.markerWrapper} aria-hidden="true">
        <div className={styles.markerRing} />
        <div className={styles.markerDot} />
      </div>

      {/* Subtle connector link between road marker and title badge */}
      <div className={styles.connectorLine} aria-hidden="true" />

      {/* 2. Interactive Area (Default Visible Title + Expandable Details) */}
      <div className={styles.interactiveWrapper}>
        {/* Default Title Badge */}
        <div
          ref={titleAreaRef}
          className={styles.titleArea}
          onClick={handleBadgeClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-expanded={isRevealed}
          aria-haspopup="dialog"
          aria-label={`${stop.title}. Click to expand full story, or hover for preview.`}
        >
          <div className={styles.metaRow}>
            <span className={styles.dateTag}>{stop.date || stop.tag}</span>
            <span className={styles.nodeIndex}>// 0{index + 1}</span>
          </div>

          <h3 className={styles.title}>{stop.title}</h3>

          <span className={styles.exploreHint} aria-hidden="true">
            {isRevealed ? "• CLICK FOR FULL STORY" : "• HOVER / CLICK TO EXPLORE"}
          </span>
        </div>

        {/* 3. Emerging Compact Detail Information Panel */}
        <div
          className={styles.detailsCard}
          aria-hidden={!isRevealed}
          onClick={(e) => e.stopPropagation()}
        >
          {stop.teaser && (
            <p className={styles.teaserText}>"{stop.teaser}"</p>
          )}

          <p className={styles.narrative}>{stop.narrative.split("\n\n")[0]}</p>

          {/* Stop-specific compact teaser snippets */}
          {stop.contentType === "origins" && stop.educationContext && (
            <div className={styles.previewContext}>
              {stop.educationContext.college && (
                <div className={styles.previewContextItem}>
                  <span className={styles.contextInstitution}>
                    {stop.educationContext.college}
                  </span>
                  <span className={styles.contextStatus}>
                    {stop.educationContext.status || "INFORMATION TECHNOLOGY"}
                  </span>
                </div>
              )}
            </div>
          )}

          {stop.contentType === "builder" && (
            <div className={styles.previewContext}>
              <span className={styles.contextLabel}>FEATURED SYSTEMS</span>
              <span className={styles.contextSummary}>
                Stock Digitizer · PAULT · AttendX · Restaurant Automation
              </span>
            </div>
          )}

          {stop.contentType === "internship" && (
            <div className={styles.previewContext}>
              <span className={styles.contextLabel}>REAL-WORLD WORKFLOW</span>
              <span className={styles.contextSummary}>
                Digital Operations · E-Commerce Cataloging · Workflow Automation
              </span>
            </div>
          )}

          {stop.contentType === "automation" && (
            <div className={styles.previewContext}>
              <span className={styles.contextLabel}>APPROACH</span>
              <span className={styles.contextSummary}>
                Observe Work First → Connect Tools → Keep Human Judgment
              </span>
            </div>
          )}

          {stop.contentType === "experimenter" && (
            <div className={styles.previewContext}>
              <span className={styles.contextLabel}>RESEARCH &amp; SPIKES</span>
              <span className={styles.contextSummary}>
                Jewellery Customizer · 3D Canvas · Generative Staging · Flutter
              </span>
            </div>
          )}

          {stop.contentType === "product" && (
            <div className={styles.previewContext}>
              <span className={styles.contextLabel}>METHODOLOGY</span>
              <span className={styles.contextSummary}>
                Firsthand Problem → Feasibility Check → Commercial Potential
              </span>
            </div>
          )}

          {stop.contentType === "future" && (
            <div className={styles.previewContext}>
              <span className={styles.contextLabel}>LONG-TERM HORIZON</span>
              <span className={styles.contextSummary}>
                Building toward entrepreneurship and financial independence
              </span>
            </div>
          )}

          {/* Action button to open centered full detail view */}
          <button
            type="button"
            className={styles.openDetailAction}
            onClick={(e) => {
              e.stopPropagation();
              triggerOpenDetail();
            }}
            aria-label={`Open full detail view for ${stop.title}`}
          >
            <span>EXPAND FULL STORY</span>
            <svg
              viewBox="0 0 24 24"
              className={styles.openDetailIcon}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JourneyStop;
