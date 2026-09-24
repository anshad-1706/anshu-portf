import React, { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import styles from "./FloatingNav.module.css";
import { DEFAULT_NAV_ITEMS, type FloatingNavProps } from "./types";

const EDITORIAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * FloatingNav — Dark Liquid-Glass Navigation with Synchronized Cinematic Reveal
 * Appears as part of the unified floating interface reveal following P3's complete exit
 * and the 320ms intentional silence, in tandem with FloatingContactNav.
 */
export const FloatingNav: React.FC<FloatingNavProps> = ({
  items = DEFAULT_NAV_ITEMS,
  activeId: activeIdProp,
  initialActiveId = "home",
  onSelect,
  className = "",
  isRevealed: isRevealedProp,
}) => {
  const [internalActiveId, setInternalActiveId] = useState<string>(initialActiveId);
  const activeId = activeIdProp !== undefined ? activeIdProp : internalActiveId;
  const [internalRevealed, setInternalRevealed] = useState(() => {
    if (typeof document === "undefined") return false;
    const heroTrack = document.querySelector(
      'section[aria-label="Hero Introduction and Identity Statements"]'
    );
    // Standalone or without heroTrack: default to revealed
    if (!heroTrack) return true;
    return Boolean(
      document.querySelector('nav[aria-label="Floating Contact Navigation"]')
    );
  });
  const shouldReduceMotion = useReducedMotion() ?? false;

  const isRevealed =
    isRevealedProp !== undefined ? isRevealedProp : internalRevealed;

  // Synchronize entrance with the cinematic narrative timeline when no prop is passed:
  // Paragraph 03 complete exit (>= 0.98) -> 320ms silence -> interface reveal
  useEffect(() => {
    if (isRevealedProp !== undefined) return;

    const heroTrack = document.querySelector(
      'section[aria-label="Hero Introduction and Identity Statements"]'
    ) as HTMLElement | null;

    if (!heroTrack) {
      return;
    }

    const checkRevealState = () => {
      // 1. Direct synchronization with FloatingContactNav mount state
      const contactNav = document.querySelector(
        'nav[aria-label="Floating Contact Navigation"]'
      );
      if (contactNav) {
        setInternalRevealed(true);
        return;
      }

      // 2. Scroll-based calculation matching Scene 04 threshold (>= 0.98)
      const rect = heroTrack.getBoundingClientRect();
      const scrollableDist = heroTrack.offsetHeight - window.innerHeight;
      if (scrollableDist <= 0) {
        setInternalRevealed(true);
        return;
      }
      const progress = -rect.top / scrollableDist;

      // One-way reveal: once triggered, never reset to false
      if (progress >= 0.98) {
        setInternalRevealed(true);
      }
    };

    // Defer initial check to avoid synchronous cascading renders
    const rafId = requestAnimationFrame(checkRevealState);

    // DOM observer ensures instantaneous microsecond alignment with FloatingContactNav
    const observer = new MutationObserver(() => {
      checkRevealState();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("scroll", checkRevealState, { passive: true });
    window.addEventListener("resize", checkRevealState, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("scroll", checkRevealState);
      window.removeEventListener("resize", checkRevealState);
    };
  }, [isRevealedProp]);

  const handleItemClick = (id: string) => {
    setInternalActiveId(id);
    onSelect?.(id);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    id: string
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      setInternalActiveId(id);
      onSelect?.(id);
    }
  };

  // Direct DOM pointer coordinate tracking for 120fps local radial optical response
  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mx", `${x.toFixed(1)}px`);
    e.currentTarget.style.setProperty("--my", `${y.toFixed(1)}px`);
  };

  // Unified cinematic interface reveal variants matching FloatingContactNav timeline:
  // 320ms intentional silence delay + 0.52s organic emergence curve.
  // STRICT REQUIREMENT: No translateY animation. Position remains fixed at top-center throughout.
  const navVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.96,
      filter: shouldReduceMotion ? "none" : "blur(12px)",
      pointerEvents: "none" as const,
      transition: {
        duration: 0.3,
        ease: EDITORIAL_EASE,
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      pointerEvents: "auto" as const,
      transition: {
        duration: 0.52,
        // T+0ms coordinated Home entrance timeline
        delay: 0,
        ease: EDITORIAL_EASE,
      },
    },
  };

  return (
    <motion.nav
      className={`${styles.navContainer} ${className}`.trim()}
      aria-label="Main Navigation"
      variants={navVariants}
      initial="hidden"
      animate={isRevealed ? "visible" : "hidden"}
    >
      {/* 1. Inner Glass Surface: Directional internal light & subtle upper highlight */}
      <div className={styles.glassInnerSurface} aria-hidden="true" />

      {/* 2. Navigation Items List */}
      <ul role="list" className={styles.navList}>
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <li key={item.id} className={styles.navItem}>
              <a
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                onClick={() => handleItemClick(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                onPointerMove={handlePointerMove}
                aria-current={isActive ? "page" : undefined}
              >
                {/* 3. Single Continuous Shared Moving Liquid Neumorphic Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavGlass"
                    className={styles.activeGlass}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.38,
                            ease: EDITORIAL_EASE,
                          }
                    }
                  >
                    <div
                      className={styles.activeGlassMeniscus}
                      aria-hidden="true"
                    />
                  </motion.div>
                )}
                <span className={styles.navLabel}>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
};

export default FloatingNav;
