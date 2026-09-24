import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./HangingIdCard.module.css";

export type IdCardDiscoveryState =
  | "idle"
  | "teaser_entering"
  | "teaser_visible"
  | "dragging"
  | "centering"
  | "centered"
  | "about_requested";

export interface HangingIdCardProps {
  isHomeStable: boolean;
  isAboutActive: boolean;
  forceTrigger?: boolean;
  onAboutRequested?: () => void;
  className?: string;
}

// Geometry constants
const DESKTOP_RESTING_Y = -196; // ~54px of 250px card visible
const MOBILE_RESTING_Y = -168; // ~47px of 215px card visible
const DESKTOP_MAX_REVEAL_Y = 18; // Full card visible + 18px of strap
const MOBILE_MAX_REVEAL_Y = 14; // Full card visible + 14px of strap
const HIDDEN_Y = -320;

export const HangingIdCard: React.FC<HangingIdCardProps> = ({
  isHomeStable,
  isAboutActive,
  forceTrigger = false,
  onAboutRequested,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const [discoveryState, setDiscoveryState] =
    useState<IdCardDiscoveryState>("idle");
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(HIDDEN_Y);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(-1.5);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isNudging, setIsNudging] = useState<boolean>(false);
  const [isCtaVisible, setIsCtaVisible] = useState<boolean>(false);

  const anchorRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    startY: number;
    startX: number;
  } | null>(null);
  const lastDeltaYRef = useRef<number>(0);
  const targetCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Helpers to get screen-specific resting and max reveal bounds
  const getRestingY = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      return MOBILE_RESTING_Y;
    }
    return DESKTOP_RESTING_Y;
  }, []);

  const getMaxRevealY = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      return MOBILE_MAX_REVEAL_Y;
    }
    return DESKTOP_MAX_REVEAL_Y;
  }, []);

  // Compute center target coordinates relative to the top-left anchor
  const calculateCenterCoordinates = useCallback(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const anchorRect = anchorRef.current?.getBoundingClientRect();
    const anchorLeft = anchorRect ? anchorRect.left : 36;
    const isMobile = window.innerWidth <= 768;
    const cardW = isMobile ? 142 : 170;
    const cardH = isMobile ? 215 : 250;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const targetX = centerX - anchorLeft - cardW / 2;
    // Optical vertical centering with slight upward offset for CTA balance
    const targetY = centerY - cardH / 2 - (isMobile ? 24 : 32);

    return { x: targetX, y: targetY };
  }, []);

  // Helper to determine centered scale based on device viewport
  const getCenterScale = useCallback(() => {
    if (typeof window === "undefined") return 1.22;
    if (window.innerWidth <= 768) {
      return 1.14; // Mobile target: 1.12–1.16
    }
    if (window.innerWidth <= 1024) {
      return 1.18; // Tablet intermediate
    }
    return 1.22; // Desktop target: 1.20–1.24
  }, []);

  // Transition the card from top-left into viewport center
  const beginCenterTransition = useCallback(() => {
    setDiscoveryState("centering");
    const { x, y } = calculateCenterCoordinates();
    targetCenterRef.current = { x, y };

    setTranslateX(x);
    setTranslateY(y);
    setScale(getCenterScale());
    setRotation(0);

    const centeringDuration = shouldReduceMotion ? 100 : 740;

    setTimeout(() => {
      setDiscoveryState("centered");
      // Short pause (~260ms) before CTA emerges
      setTimeout(() => {
        setIsCtaVisible(true);
      }, shouldReduceMotion ? 50 : 260);
    }, centeringDuration);
  }, [calculateCenterCoordinates, getCenterScale, shouldReduceMotion]);

  // 1. 5000ms delay after Home becomes stable
  useEffect(() => {
    if (!isHomeStable || isAboutActive) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (discoveryState === "idle") {
      timerRef.current = setTimeout(() => {
        setDiscoveryState("teaser_entering");
        const restY = getRestingY();
        setTranslateY(restY);
        setRotation(-1.5);

        setTimeout(() => {
          setDiscoveryState((prev) =>
            prev === "teaser_entering" ? "teaser_visible" : prev
          );
        }, shouldReduceMotion ? 50 : 700);
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isHomeStable, isAboutActive, discoveryState, getRestingY, shouldReduceMotion]);

  // 2. Direct trigger from navigation (e.g. user clicked ABOUT in FloatingNav)
  useEffect(() => {
    if (!forceTrigger || isAboutActive) return;

    let settleTimeout: ReturnType<typeof setTimeout> | null = null;
    let nudgeTimeout: ReturnType<typeof setTimeout> | null = null;

    const rafId = requestAnimationFrame(() => {
      if (discoveryState === "idle") {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setDiscoveryState("teaser_entering");
        const restY = getRestingY();
        setTranslateY(restY);
        setRotation(-1.5);

        settleTimeout = setTimeout(() => {
          setDiscoveryState((prev) =>
            prev === "teaser_entering" ? "teaser_visible" : prev
          );
        }, shouldReduceMotion ? 50 : 700);
      } else if (discoveryState === "teaser_visible") {
        // Nudge to draw attention
        setIsNudging(true);
        const restY = getRestingY();
        setTranslateY(restY + 28);
        nudgeTimeout = setTimeout(() => {
          setTranslateY(restY);
          setIsNudging(false);
        }, 350);
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (settleTimeout) clearTimeout(settleTimeout);
      if (nudgeTimeout) clearTimeout(nudgeTimeout);
    };
  }, [forceTrigger, discoveryState, isAboutActive, getRestingY, shouldReduceMotion]);

  // Window resize handler: update center target and scale if already centered
  useEffect(() => {
    const handleResize = () => {
      if (discoveryState === "centered") {
        const { x, y } = calculateCenterCoordinates();
        targetCenterRef.current = { x, y };
        setTranslateX(x);
        setTranslateY(y);
        setScale(getCenterScale());
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [discoveryState, calculateCenterCoordinates, getCenterScale]);

  // Handle pointer down (mouse or touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      discoveryState !== "teaser_visible" &&
      discoveryState !== "teaser_entering" &&
      discoveryState !== "centered"
    ) {
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startY: translateY,
      startX: translateX,
    };
    lastDeltaYRef.current = 0;
    setIsDragging(true);

    if (discoveryState === "teaser_visible" || discoveryState === "teaser_entering") {
      setDiscoveryState("dragging");
    }
  };

  // Handle pointer move during drag
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;

    if (discoveryState === "dragging") {
      // VERTICAL PULL (Phase 01 & Correction)
      const deltaY = e.clientY - dragStartRef.current.y;
      const deltaX = e.clientX - dragStartRef.current.x;
      lastDeltaYRef.current = deltaY;

      const restY = getRestingY();
      const maxRevealY = getMaxRevealY();
      const maxPullDelta = maxRevealY - restY;

      let effectiveY: number;

      if (deltaY < 0) {
        // Resistance when pushing upward into ceiling
        effectiveY = restY + deltaY * 0.12;
      } else if (deltaY <= maxPullDelta) {
        // Direct 1:1 smooth downward tracking
        effectiveY = restY + deltaY;
      } else {
        // ELASTIC OVERSCROLL: Asymptotic resistance beyond max reveal position
        const excess = deltaY - maxPullDelta;
        const elasticDisplacement = 22 * (1 - Math.exp(-excess / 70));
        effectiveY = maxRevealY + elasticDisplacement;
      }

      const tilt = shouldReduceMotion
        ? -1.5
        : -1.5 + Math.max(-5, Math.min(5, deltaX * 0.08));

      setTranslateY(effectiveY);
      setRotation(tilt);
    } else if (discoveryState === "centered") {
      // HORIZONTAL DRAG (Phase 02 Centered State)
      const deltaX = e.clientX - dragStartRef.current.x;
      const clampedDeltaX = Math.max(-75, Math.min(75, deltaX * 0.7));
      const tilt = shouldReduceMotion
        ? 0
        : Math.max(-4, Math.min(4, clampedDeltaX * 0.06));

      setTranslateX(targetCenterRef.current.x + clampedDeltaX);
      setRotation(tilt);
    }
  };

  // Handle pointer release
  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }

    setIsDragging(false);

    if (discoveryState === "dragging") {
      const restY = getRestingY();
      const maxRevealY = getMaxRevealY();
      const maxPullDelta = maxRevealY - restY;
      const lastDeltaY = lastDeltaYRef.current;
      const excess = lastDeltaY - maxPullDelta;

      // 1. Overscroll Release: Pulled beyond maximum -> restrained elastic snap-back to teaser
      if (excess > 12) {
        setTranslateY(restY);
        setRotation(-1.5);
        setScale(1);
        setDiscoveryState("teaser_visible");
      }
      // 2. Valid Reveal Release: Released in the intended reveal zone -> proceed to Phase 02 centering
      else if (lastDeltaY >= maxPullDelta - 40) {
        beginCenterTransition();
      }
      // 3. Early Release: Pulled too little -> return to teaser
      else {
        setTranslateY(restY);
        setRotation(-1.5);
        setScale(1);
        setDiscoveryState("teaser_visible");
      }
    } else if (discoveryState === "centered") {
      // Centered horizontal release: naturally settle back to optical center
      setTranslateX(targetCenterRef.current.x);
      setRotation(0);
    }

    dragStartRef.current = null;
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      if (discoveryState === "teaser_visible") {
        e.preventDefault();
        // Keyboard pull-down directly triggers valid reveal to center
        beginCenterTransition();
      } else if (discoveryState === "centered") {
        e.preventDefault();
        handleCtaClick();
      }
    }
  };

  // CTA button click -> trigger About page formation
  const handleCtaClick = () => {
    setDiscoveryState("about_requested");
    setIsCtaVisible(false);
    onAboutRequested?.();
  };

  const isTeaserActive =
    discoveryState === "teaser_entering" ||
    discoveryState === "teaser_visible" ||
    discoveryState === "dragging" ||
    discoveryState === "centering" ||
    discoveryState === "centered";

  const isBackdropVisible =
    discoveryState === "centering" || discoveryState === "centered";

  const showTeaserInstruction =
    discoveryState === "teaser_visible" ||
    (discoveryState === "dragging" && translateY - getRestingY() < 35);

  const isCenteringOrCentered =
    discoveryState === "centering" ||
    discoveryState === "centered" ||
    discoveryState === "about_requested";

  return (
    <div className={styles.aboutDiscoveryWrapper} aria-hidden={!isTeaserActive}>
      {/* 1. Background Focus Layer — Dimmed & blurred backdrop for centered card */}
      <div
        className={`${styles.focusBackdrop} ${isBackdropVisible ? styles.isVisible : ""}`}
        aria-hidden="true"
      />

      {/* 2. Top-Left Hanging Anchor */}
      <div
        ref={anchorRef}
        className={`${styles.hangingAnchor} ${className}`.trim()}
      >
        <div
          className={styles.cardMover}
          style={{
            transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotation}deg) scale(${scale})`,
            transition:
              isDragging
                ? "none"
                : isNudging
                  ? "transform 350ms cubic-bezier(0.2, 0.9, 0.4, 1.2), opacity 450ms ease"
                  : discoveryState === "centering"
                    ? shouldReduceMotion
                      ? "transform 150ms ease, opacity 450ms ease"
                      : "transform 740ms cubic-bezier(0.16, 1, 0.3, 1), opacity 450ms ease"
                    : shouldReduceMotion
                      ? "transform 150ms ease, opacity 450ms ease"
                      : "transform 580ms cubic-bezier(0.16, 1, 0.3, 1), opacity 450ms ease",
            visibility: isTeaserActive ? "visible" : "hidden",
            opacity: discoveryState === "about_requested" ? 0 : 1,
          }}
        >
          {/* Physical Lanyard Strap (fades out gracefully upon centering) */}
          <div
            className={`${styles.strap} ${isCenteringOrCentered ? styles.isCentering : ""}`}
            aria-hidden="true"
          />

          {/* Metallic Clasp */}
          <div
            className={`${styles.clasp} ${isCenteringOrCentered ? styles.isCentering : ""}`}
            aria-hidden="true"
          />

          {/* Tactile ID Card Container */}
          <div
            className={`${styles.hangingCard} ${isDragging ? styles.isDragging : ""} ${
              isCenteringOrCentered ? styles.isCenteredCard : ""
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={isTeaserActive ? 0 : -1}
            aria-label="About me card. Pull down to discover more about me."
            data-state={discoveryState}
          >
            {/* Lanyard Punch Hole */}
            <div className={styles.punchHole} aria-hidden="true" />

            {/* Header Band */}
            <div className={styles.cardHeader}>
              <span className={styles.cardHeaderTag}>IDENTITY / 2026</span>
              <span className={styles.cardHeaderSerial}>ARCHIVE // 01</span>
            </div>

            {/* Card Body */}
            <div className={styles.cardBody}>
              {/* Portrait Placeholder */}
              <div className={styles.photoPlaceholder}>
                <svg
                  className={styles.photoIcon}
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                </svg>
                <span className={styles.photoPlaceholderText}>
                  PORTRAIT // READY
                </span>
              </div>

              {/* Identity Info */}
              <div className={styles.infoGroup}>
                <h3 className={styles.name}>ANSHAD</h3>
                <p className={styles.role}>SOFTWARE ARCHITECT &amp; DEV</p>
              </div>

              {/* Technical Barcode Footer */}
              <div className={styles.cardFooter}>
                <div className={styles.barcodeStripes} aria-hidden="true">
                  <span className={styles.stripe} style={{ width: "2px" }} />
                  <span className={styles.stripe} style={{ width: "1px" }} />
                  <span className={styles.stripe} style={{ width: "3px" }} />
                  <span className={styles.stripe} style={{ width: "1.5px" }} />
                  <span className={styles.stripe} style={{ width: "2.5px" }} />
                  <span className={styles.stripe} style={{ width: "1px" }} />
                  <span className={styles.stripe} style={{ width: "4px" }} />
                  <span className={styles.stripe} style={{ width: "1px" }} />
                  <span className={styles.stripe} style={{ width: "2px" }} />
                  <span className={styles.stripe} style={{ width: "3px" }} />
                </div>
                <span className={styles.footerCode}>№ 0092-26-AGY</span>
              </div>
            </div>

            {/* Subtle Teaser Instruction Prompt */}
            {!isCenteringOrCentered && (
              <div
                className={styles.instructionContainer}
                style={{
                  opacity: showTeaserInstruction ? 1 : 0,
                }}
                aria-hidden="true"
              >
                <span className={styles.instructionText}>PULL DOWN</span>
                <svg
                  className={styles.instructionArrow}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <polyline points="7 10 12 15 17 10" />
                </svg>
              </div>
            )}
          </div>

          {/* 3. KNOW MORE ABOUT ME — Call to Action Button */}
          {isCenteringOrCentered && (
            <div
              className={`${styles.ctaContainer} ${isCtaVisible ? styles.isCtaVisible : ""}`}
            >
              <button
                type="button"
                className={styles.ctaButton}
                onClick={handleCtaClick}
                tabIndex={isCtaVisible ? 0 : -1}
                aria-label="Know more about me"
              >
                KNOW MORE ABOUT ME
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HangingIdCard;
