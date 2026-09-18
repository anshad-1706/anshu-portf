import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import styles from "./FloatingContactNav.module.css";

// Configured or placeholder URLs
export const LINKEDIN_URL = "https://www.linkedin.com/in/anshad";
export const GITHUB_URL = "https://github.com/anshad";
export const MAIL_URL = "mailto:contact@anshad.me";

interface ContactButtonConfig {
  id: "linkedin" | "github" | "mail" | "contact";
  label: string;
  ariaLabel: string;
  href?: string;
  expandedWidthDesktop: number;
  icon: React.ReactNode;
}

const EDITORIAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Outline SVG Icons with shared 1.6 stroke weight
const LinkedInIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="9" width="4" height="12" rx="0.5" />
    <circle cx="4" cy="4" r="2" />
    <path d="M10 9v12" />
    <path d="M10 14.5a4.5 4.5 0 0 1 4.5-4.5 4.5 4.5 0 0 1 4.5 4.5V21h-4v-6.5a1.5 1.5 0 0 0-1.5-1.5 1.5 1.5 0 0 0-1.5 1.5V21h-2" />
  </svg>
);

const GitHubIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const MailIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ContactIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BUTTONS_CONFIG: ContactButtonConfig[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    ariaLabel: "LinkedIn",
    href: LINKEDIN_URL,
    expandedWidthDesktop: 130,
    icon: <LinkedInIcon />,
  },
  {
    id: "github",
    label: "GitHub",
    ariaLabel: "GitHub",
    href: GITHUB_URL,
    expandedWidthDesktop: 124,
    icon: <GitHubIcon />,
  },
  {
    id: "mail",
    label: "Mail",
    ariaLabel: "Email",
    href: MAIL_URL,
    expandedWidthDesktop: 106,
    icon: <MailIcon />,
  },
  {
    id: "contact",
    label: "Contact",
    ariaLabel: "Contact",
    expandedWidthDesktop: 126,
    icon: <ContactIcon />,
  },
];

interface FloatingContactNavProps {
  isActive: boolean;
}

export const FloatingContactNav: React.FC<FloatingContactNavProps> = ({
  isActive,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const handleContactClick = () => {
    // Copy contact email to clipboard or display notification
    if (navigator.clipboard) {
      navigator.clipboard.writeText("contact@anshad.me").catch(() => {});
    }
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2400);
  };

  // Entrance variants: triggered automatically once Scene 04 begins
  const buttonVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.76,
      filter: shouldReduceMotion ? "none" : "blur(14px)",
      x: shouldReduceMotion ? 0 : 12,
    },
    visible: (customIndex: number) => ({
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      x: 0,
      transition: {
        duration: 0.52,
        // 320ms intentional pure-white silence + quick 120ms staggered emergence
        delay: 0.32 + customIndex * 0.12,
        ease: EDITORIAL_EASE,
      },
    }),
    exit: {
      opacity: 0,
      filter: "blur(8px)",
      transition: {
        duration: 0.3,
        ease: EDITORIAL_EASE,
      },
    },
  };

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <nav
            className={styles.navContainer}
            aria-label="Floating Contact Navigation"
          >
            {BUTTONS_CONFIG.map((btn, index) => {
              const isHovered = hoveredId === btn.id;

              // Content inside button
              const innerContent = (
                <div className={styles.contentInner}>
                  <span className={styles.iconBox}>{btn.icon}</span>
                  <span className={styles.label}>{btn.label}</span>
                </div>
              );

              // Standard Framer Motion animated pill width for desktop
              const animatedPillWidth = isHovered
                ? btn.expandedWidthDesktop
                : 50;

              if (btn.href) {
                return (
                  <motion.a
                    key={btn.id}
                    href={btn.href}
                    target={btn.id === "mail" ? undefined : "_blank"}
                    rel={btn.id === "mail" ? undefined : "noopener noreferrer"}
                    aria-label={btn.ariaLabel}
                    className={`${styles.glassButton} ${isHovered ? styles.expanded : ""}`}
                    custom={index}
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onMouseEnter={() => setHoveredId(btn.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(btn.id)}
                    onBlur={() => setHoveredId(null)}
                    style={{
                      width: animatedPillWidth,
                    }}
                  >
                    {innerContent}
                  </motion.a>
                );
              }

              return (
                <motion.button
                  key={btn.id}
                  type="button"
                  onClick={handleContactClick}
                  aria-label={btn.ariaLabel}
                  className={`${styles.glassButton} ${isHovered ? styles.expanded : ""}`}
                  custom={index}
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onMouseEnter={() => setHoveredId(btn.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(btn.id)}
                  onBlur={() => setHoveredId(null)}
                  style={{
                    width: animatedPillWidth,
                  }}
                >
                  {innerContent}
                </motion.button>
              );
            })}
          </nav>
        )}
      </AnimatePresence>

      {/* Subtle toast for contact copy confirmation */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EDITORIAL_EASE }}
          >
            Email copied to clipboard (contact@anshad.me)
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingContactNav;
