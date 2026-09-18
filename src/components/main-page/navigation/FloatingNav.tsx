import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./FloatingNav.module.css";

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
}

// Trivially configurable, data-driven navigation items
export const DEFAULT_NAV_ITEMS: NavItemConfig[] = [
  { id: "work", label: "Work", href: "#work" },
  { id: "about", label: "About", href: "#about" },
  { id: "skills", label: "Stack", href: "#skills" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export interface FloatingNavProps {
  items?: NavItemConfig[];
  initialActiveId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

const EDITORIAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * FloatingNav — Phase 02 Implementation
 * Dark graphite liquid-glass floating navigation control positioned strictly at top-center.
 */
export const FloatingNav: React.FC<FloatingNavProps> = ({
  items = DEFAULT_NAV_ITEMS,
  initialActiveId = "work",
  onSelect,
  className = "",
}) => {
  const [activeId, setActiveId] = useState<string>(initialActiveId);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const handleItemClick = (id: string) => {
    // Interaction-driven active state
    setActiveId(id);
    onSelect?.(id);
  };

  return (
    <motion.nav
      className={`${styles.navContainer} ${className}`.trim()}
      aria-label="Main Navigation"
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : -10,
        filter: shouldReduceMotion ? "none" : "blur(4px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      transition={{
        duration: 0.52,
        ease: EDITORIAL_EASE,
        delay: 0.08,
      }}
    >
      <ul role="list" className={styles.navList}>
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <li key={item.id} className={styles.navItem}>
              <a
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                onClick={() => handleItemClick(item.id)}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className={styles.activePill}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 38,
                    }}
                  />
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
