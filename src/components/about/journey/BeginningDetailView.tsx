import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "./BeginningDetailView.module.css";
import type { JourneyStopData } from "./journeyTypes";

export interface BeginningDetailViewProps {
  stop: JourneyStopData;
  originRect: DOMRect | null;
  isOpen: boolean;
  onClose: () => void;
  onReturnHome?: () => void;
}

/**
 * BeginningDetailView — Unified Cinematic Editorial Journey Detail Modal
 * Supports all seven journey stops (The Beginning, The Builder, Internship,
 * The Automation Mind, The Experimenter, The Product Thinker, and What I'm Building Toward)
 * within one shared Genie-inspired shell.
 * Dynamically expands from and collapses back toward the physical screen bounds of the activated stop.
 */
export const BeginningDetailView: React.FC<BeginningDetailViewProps> = ({
  stop,
  originRect,
  isOpen,
  onClose,
  onReturnHome,
}) => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const [viewport, setViewport] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1200,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  // Keep track of viewport size for precise vector origin mapping
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Accessibility: Capture trigger focus on open, move focus inside, restore on close
  useEffect(() => {
    if (isOpen) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;

      // Small delay to allow element mounting before setting focus
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
          return;
        }

        // Trap focus inside modal
        if (e.key === "Tab" && cardRef.current) {
          const focusable = cardRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;

          const firstEl = focusable[0];
          const lastEl = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          } else if (!e.shiftKey && document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else if (restoreFocusRef.current) {
      restoreFocusRef.current.focus();
    }
  }, [isOpen, onClose]);

  const handleReturnHomeAction = useCallback(() => {
    onClose();
    if (onReturnHome) {
      onReturnHome();
    }
  }, [onClose, onReturnHome]);

  if (typeof document === "undefined") return null;

  // Calculate geometric delta from stop visual bounds to center of viewport
  const targetWidth = Math.min(840, viewport.w - 40);
  const targetHeight = Math.min(720, viewport.h - 64);
  const targetCenterX = viewport.w / 2;
  const targetCenterY = viewport.h / 2;

  const originX = originRect ? originRect.left + originRect.width / 2 : targetCenterX;
  const originY = originRect ? originRect.top + originRect.height / 2 : targetCenterY;

  const deltaX = originX - targetCenterX;
  const deltaY = originY - targetCenterY;

  const startScaleX = originRect
    ? Math.max(0.15, Math.min(0.55, originRect.width / targetWidth))
    : 0.35;
  const startScaleY = originRect
    ? Math.max(0.08, Math.min(0.35, originRect.height / targetHeight))
    : 0.2;

  // Genie-inspired variant definitions
  const genieEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const genieCardVariants = {
    initial: shouldReduceMotion
      ? { opacity: 0, scale: 0.96 }
      : {
          x: deltaX,
          y: deltaY,
          scaleX: startScaleX,
          scaleY: startScaleY,
          borderRadius: "8px",
          opacity: 0.2,
          clipPath: "polygon(30% 100%, 70% 100%, 88% 0%, 12% 0%)",
        },
    animate: {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      borderRadius: "18px",
      opacity: 1,
      clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
      transition: {
        duration: shouldReduceMotion ? 0.25 : 0.72,
        ease: genieEase,
      },
    },
    exit: shouldReduceMotion
      ? { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }
      : {
          x: deltaX,
          y: deltaY,
          scaleX: startScaleX,
          scaleY: startScaleY,
          borderRadius: "8px",
          opacity: 0,
          clipPath: "polygon(32% 100%, 68% 100%, 86% 0%, 14% 0%)",
          transition: {
            duration: 0.58,
            ease: genieEase,
          },
        },
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className={styles.portalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="journey-detail-title"
        >
          {/* 1. Backdrop Focus Overlay — darkens & blurs page + navigation controls */}
          <motion.div
            className={styles.backdrop}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.65,
              ease: genieEase,
            }}
          />

          {/* 2. Fluid SVG Genie Beam connecting origin stop to expanding modal */}
          {!shouldReduceMotion && originRect && (
            <motion.svg
              className={styles.genieBeamSvg}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.3, 0] }}
              exit={{ opacity: [0, 0.45, 0.7, 0] }}
              transition={{ duration: 0.72, ease: genieEase }}
            >
              <defs>
                <linearGradient id="genieBeamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.55)" />
                  <stop offset="60%" stopColor="rgba(30, 30, 36, 0.4)" />
                  <stop offset="100%" stopColor="rgba(18, 18, 22, 0)" />
                </linearGradient>
              </defs>
              <path
                d={`M ${originX - 14} ${originY} 
                    C ${originX} ${(originY + targetCenterY) / 2}, 
                      ${targetCenterX - targetWidth / 3} ${targetCenterY + targetHeight / 2 - 20}, 
                      ${targetCenterX} ${targetCenterY + targetHeight / 2}
                    C ${targetCenterX + targetWidth / 3} ${targetCenterY + targetHeight / 2 - 20},
                      ${originX} ${(originY + targetCenterY) / 2},
                      ${originX + 14} ${originY} Z`}
                fill="url(#genieBeamGrad)"
              />
            </motion.svg>
          )}

          {/* 3. Centered Editorial Detail Card Surface */}
          <motion.div
            ref={cardRef}
            className={styles.detailCard}
            variants={genieCardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            tabIndex={-1}
          >
            {/* Header */}
            <div className={styles.cardHeader}>
              <div className={styles.headerMeta}>
                <div className={styles.eyebrowRow}>
                  <span className={styles.tagPill}>{stop.tag}</span>
                  {stop.date && <span className={styles.dateLabel}>{stop.date}</span>}
                  <span className={styles.dateLabel}>// 0{stop.index + 1}</span>
                </div>
                <h2 id="journey-detail-title" className={styles.mainTitle}>
                  {stop.title}
                </h2>
                {stop.teaser && <p className={styles.teaserLine}>"{stop.teaser}"</p>}
              </div>

              {/* Accessible Close Button */}
              <button
                ref={closeButtonRef}
                className={styles.closeButton}
                onClick={onClose}
                aria-label={`Close ${stop.title} details`}
                title="Close (Esc)"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className={styles.cardBody}>
              {/* STOP 01: THE BEGINNING */}
              {stop.contentType === "origins" && (
                <>
                  <section className={styles.sectionBlock} aria-labelledby="origin-heading">
                    <h3 id="origin-heading" className={styles.sectionHeading}>
                      01 // ORIGIN &amp; INCEPTION
                    </h3>
                    <p className={styles.narrativeText}>{stop.narrative}</p>
                  </section>

                  {stop.educationContext && (
                    <section className={styles.sectionBlock} aria-labelledby="education-heading">
                      <h3 id="education-heading" className={styles.sectionHeading}>
                        02 // ACADEMIC FOUNDATIONS
                      </h3>
                      <div className={styles.educationGrid}>
                        {stop.educationContext.school && (
                          <div className={styles.educationCard}>
                            <span className={styles.institutionName}>
                              {stop.educationContext.school}
                            </span>
                            <span className={styles.degreeStatus}>
                              HIGHER SECONDARY EDUCATION
                            </span>
                          </div>
                        )}

                        {stop.educationContext.college && (
                          <div className={styles.educationCard}>
                            <span className={styles.institutionName}>
                              {stop.educationContext.college}
                            </span>
                            <span className={styles.degreeStatus}>
                              {stop.educationContext.status || "INFORMATION TECHNOLOGY"}
                            </span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* STOP 02: THE BUILDER */}
              {stop.contentType === "builder" && (
                <>
                  <section className={styles.sectionBlock} aria-labelledby="builder-intent-heading">
                    <h3 id="builder-intent-heading" className={styles.sectionHeading}>
                      01 // ARCHITECTURAL INTENT
                    </h3>
                    <p className={styles.narrativeText}>{stop.narrative}</p>
                  </section>

                  {stop.projects && (
                    <section className={styles.sectionBlock} aria-labelledby="builder-projects-heading">
                      <h3 id="builder-projects-heading" className={styles.sectionHeading}>
                        02 // CURATED SYSTEMS ARCHIVE
                      </h3>
                      <div className={styles.projectsList}>
                        {stop.projects.map((project) => {
                          const statusBadgeClass =
                            project.statusType === "deployed"
                              ? styles.statusPillDeployed
                              : project.statusType === "released"
                              ? styles.statusPillReleased
                              : project.statusType === "paused"
                              ? styles.statusPillPaused
                              : styles.statusPillPrototype;

                          return (
                            <div key={project.name} className={styles.projectCard}>
                              <div className={styles.projectTopRow}>
                                <div className={styles.projectTitleGroup}>
                                  <span className={styles.projectIndex}>// {project.index}</span>
                                  <h4 className={styles.projectName}>{project.name}</h4>
                                </div>
                                <div className={styles.projectTopRight}>
                                  {project.status && (
                                    <span className={`${styles.statusPill} ${statusBadgeClass}`}>
                                      {project.status}
                                    </span>
                                  )}
                                  <span className={styles.projectCapability}>{project.capability}</span>
                                </div>
                              </div>

                              {project.headline && (
                                <p className={styles.projectHeadline}>"{project.headline}"</p>
                              )}

                              <div className={styles.projectDetails}>
                                <div className={styles.projectField}>
                                  <span className={styles.fieldLabel}>The Problem</span>
                                  <p className={styles.fieldText}>{project.problem}</p>
                                </div>
                                <div className={styles.projectField}>
                                  <span className={styles.fieldLabel}>What I Built</span>
                                  <p className={styles.fieldText}>{project.solution}</p>
                                </div>
                                {project.challenge && (
                                  <div className={styles.projectField}>
                                    <span className={styles.fieldLabel}>The Hardest Part</span>
                                    <p className={styles.fieldText}>{project.challenge}</p>
                                  </div>
                                )}
                                {project.outcome && (
                                  <div className={styles.projectField}>
                                    <span className={styles.fieldLabel}>Current Outcome</span>
                                    <p className={styles.fieldText}>{project.outcome}</p>
                                  </div>
                                )}
                                {project.reflection && (
                                  <div className={styles.projectField}>
                                    <span className={styles.fieldLabel}>Personal Reflection</span>
                                    <p className={styles.fieldText}>{project.reflection}</p>
                                  </div>
                                )}
                                {project.contribution && (
                                  <div className={styles.projectField}>
                                    <span className={styles.fieldLabel}>Implementation Note</span>
                                    <p className={styles.fieldText}>{project.contribution}</p>
                                  </div>
                                )}
                              </div>

                              <div className={styles.techPillsRow}>
                                {project.technologies.map((tech) => (
                                  <span key={tech} className={styles.techPill}>
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* STOP 03: INTERNSHIP */}
              {stop.contentType === "internship" && (
                <>
                  <section className={styles.sectionBlock} aria-labelledby="internship-role-heading">
                    <h3 id="internship-role-heading" className={styles.sectionHeading}>
                      01 // ROLE &amp; OPERATIONAL CONTEXT
                    </h3>
                    {stop.internshipDetails?.role && (
                      <div className={styles.internshipRoleBadge}>
                        <span className={styles.internshipRoleLabel}>CONFIRMED ROLE</span>
                        <h4 className={styles.internshipRoleTitle}>{stop.internshipDetails.role}</h4>
                        {stop.internshipDetails.company && (
                          <span className={styles.internshipCompany}>{stop.internshipDetails.company}</span>
                        )}
                      </div>
                    )}
                    <p className={styles.narrativeText}>{stop.narrative}</p>
                  </section>

                  {stop.internshipDetails?.tasks && (
                    <section className={styles.sectionBlock} aria-labelledby="internship-tasks-heading">
                      <h3 id="internship-tasks-heading" className={styles.sectionHeading}>
                        02 // REAL-WORLD WORKFLOWS &amp; TASKS
                      </h3>
                      <div className={styles.internshipList}>
                        {stop.internshipDetails.tasks.map((task, idx) => (
                          <div key={idx} className={styles.internshipTaskCard}>
                            <span className={styles.taskNumber}>// 0{idx + 1}</span>
                            <p className={styles.taskText}>{task}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {stop.internshipDetails?.learnings && (
                    <section className={styles.sectionBlock} aria-labelledby="internship-learnings-heading">
                      <h3 id="internship-learnings-heading" className={styles.sectionHeading}>
                        03 // PRACTICAL LESSONS GAINED
                      </h3>
                      <div className={styles.internshipLearningsGrid}>
                        {stop.internshipDetails.learnings.map((learning, idx) => (
                          <div key={idx} className={styles.learningCard}>
                            <div className={styles.learningDot} />
                            <p className={styles.learningText}>{learning}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {stop.internshipDetails?.reflection && (
                    <section className={styles.sectionBlock} aria-labelledby="internship-reflection-heading">
                      <h3 id="internship-reflection-heading" className={styles.sectionHeading}>
                        04 // CONNECTING PRACTICE &amp; BUILDING
                      </h3>
                      <div className={styles.reflectionBox}>
                        <p className={styles.reflectionText}>{stop.internshipDetails.reflection}</p>
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* STOP 04: THE AUTOMATION MIND */}
              {stop.contentType === "automation" && (
                <>
                  {stop.automationWorkflow?.question && (
                    <div className={styles.questionBox}>
                      <p className={styles.questionQuote}>"{stop.automationWorkflow.question}"</p>
                    </div>
                  )}

                  <section className={styles.sectionBlock} aria-labelledby="automation-philosophy-heading">
                    <h3 id="automation-philosophy-heading" className={styles.sectionHeading}>
                      01 // AUTOMATION PHILOSOPHY
                    </h3>
                    <p className={styles.narrativeText}>{stop.narrative}</p>
                  </section>

                  {stop.automationWorkflow?.steps && (
                    <section className={styles.sectionBlock} aria-labelledby="automation-flow-heading">
                      <h3 id="automation-flow-heading" className={styles.sectionHeading}>
                        02 // 5-STAGE WORKFLOW SEQUENCE
                      </h3>
                      <div className={styles.workflowGrid}>
                        {stop.automationWorkflow.steps.map((st) => (
                          <div key={st.index} className={styles.workflowStep}>
                            <span className={styles.stepIndex}>// {st.index}</span>
                            <h4 className={styles.stepTitle}>{st.title}</h4>
                            <p className={styles.stepDesc}>{st.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {stop.automationWorkflow?.tools && (
                    <section className={styles.sectionBlock} aria-labelledby="automation-stack-heading">
                      <h3 id="automation-stack-heading" className={styles.sectionHeading}>
                        03 // INTEGRATION &amp; ORCHESTRATION STACK
                      </h3>
                      <div className={styles.toolsList}>
                        {stop.automationWorkflow.tools.map((tool) => (
                          <span key={tool} className={styles.toolBadge}>
                            {tool}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* STOP 05: THE EXPERIMENTER */}
              {stop.contentType === "experimenter" && (
                <>
                  <section className={styles.sectionBlock} aria-labelledby="experimenter-mindset-heading">
                    <h3 id="experimenter-mindset-heading" className={styles.sectionHeading}>
                      01 // THE LAB MINDSET
                    </h3>
                    <p className={styles.narrativeText}>{stop.narrative}</p>
                  </section>

                  {stop.experiments && (
                    <section className={styles.sectionBlock} aria-labelledby="experimenter-spikes-heading">
                      <h3 id="experimenter-spikes-heading" className={styles.sectionHeading}>
                        02 // EXPERIMENTAL SPIKES &amp; RESEARCH AREAS
                      </h3>
                      <div className={styles.experimentsGrid}>
                        {stop.experiments.map((exp) => {
                          const statusClass =
                            exp.status === "BUILT"
                              ? styles.statusBuilt
                              : exp.status === "EXPERIMENT"
                              ? styles.statusExperiment
                              : exp.status === "LEARNING"
                              ? styles.statusLearning
                              : styles.statusExploring;

                          return (
                            <div key={exp.area} className={styles.experimentCard}>
                              <div className={styles.experimentTop}>
                                <h4 className={styles.experimentArea}>{exp.area}</h4>
                                <span className={`${styles.statusPill} ${statusClass}`}>
                                  {exp.status}
                                </span>
                              </div>
                              <span className={styles.experimentFocus}>{exp.focus}</span>
                              <p className={styles.experimentDesc}>{exp.description}</p>
                              {exp.takeaway && (
                                <div className={styles.experimentTakeaway}>
                                  <span className={styles.takeawayLabel}>Lesson Learned</span>
                                  <p className={styles.takeawayText}>{exp.takeaway}</p>
                                </div>
                              )}
                              <div className={styles.techPillsRow}>
                                {exp.tags.map((t) => (
                                  <span key={t} className={styles.techPill}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* STOP 05: THE PRODUCT THINKER */}
              {stop.contentType === "product" && (
                <>
                  <section className={styles.sectionBlock} aria-labelledby="product-approach-heading">
                    <h3 id="product-approach-heading" className={styles.sectionHeading}>
                      01 // INTENT BEFORE TECHNOLOGY
                    </h3>
                    <p className={styles.narrativeText}>{stop.narrative}</p>
                  </section>

                  {stop.productProcess?.stages && (
                    <section className={styles.sectionBlock} aria-labelledby="product-stages-heading">
                      <h3 id="product-stages-heading" className={styles.sectionHeading}>
                        02 // 5-STAGE PROBLEM-SOLVING SEQUENCE
                      </h3>
                      <div className={styles.productStagesList}>
                        {stop.productProcess.stages.map((stage) => (
                          <div key={stage.index} className={styles.stageCard}>
                            <span className={styles.stageNumber}>// {stage.index}</span>
                            <div className={styles.stageContent}>
                              <h4 className={styles.stageTitle}>{stage.title}</h4>
                              <span className={styles.stageSubtitle}>{stage.subtitle}</span>
                              <p className={styles.stageDesc}>{stage.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {stop.productProcess?.takeaway && (
                    <div className={styles.takeawayBox}>
                      <p className={styles.takeawayText}>{stop.productProcess.takeaway}</p>
                    </div>
                  )}
                </>
              )}

              {/* STOP 06: WHAT I'M BUILDING TOWARD */}
              {stop.contentType === "future" && (
                <>
                  <section className={styles.sectionBlock} aria-labelledby="future-foundation-heading">
                    <h3 id="future-foundation-heading" className={styles.sectionHeading}>
                      01 // ACADEMIC &amp; PRESENT TRAJECTORY
                    </h3>
                    <p className={styles.narrativeText}>{stop.narrative}</p>
                  </section>

                  {stop.futureVision && (
                    <>
                      <section className={styles.sectionBlock} aria-labelledby="future-pillars-heading">
                        <h3 id="future-pillars-heading" className={styles.sectionHeading}>
                          02 // CORE HORIZON PILLARS
                        </h3>
                        <div className={styles.futurePillarsList}>
                          {stop.futureVision.focusAreas.map((area) => (
                            <div key={area} className={styles.futurePillarCard}>
                              <div className={styles.pillarDot} />
                              <span className={styles.pillarText}>{area}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <div className={styles.quoteCallout}>
                        <p className={styles.quoteText}>"{stop.futureVision.closingStatement}"</p>
                      </div>

                      {/* Prominent Return Home CTA Block */}
                      <div className={styles.returnHomeBlock}>
                        <span className={styles.returnHomePrompt}>JOURNEY COMPLETE</span>
                        <button
                          type="button"
                          className={styles.returnHomeButtonLarge}
                          onClick={handleReturnHomeAction}
                          aria-label="Return home to main portfolio"
                        >
                          <span>RETURN HOME</span>
                          <svg
                            viewBox="0 0 24 24"
                            className={styles.returnHomeIcon}
                            fill="none"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className={styles.cardFooter}>
              <span className={styles.footerHint}>
                CHAPTER 0{stop.index + 1} OF 07 · PRESS ESC OR CLICK OUTSIDE TO CLOSE
              </span>

              <div className={styles.footerActions}>
                {stop.contentType === "future" && (
                  <button
                    type="button"
                    className={styles.returnHomeButtonSecondary}
                    onClick={handleReturnHomeAction}
                  >
                    RETURN HOME
                  </button>
                )}
                <button
                  type="button"
                  className={styles.closeButtonSecondary}
                  onClick={onClose}
                >
                  CLOSE STORY
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default BeginningDetailView;
