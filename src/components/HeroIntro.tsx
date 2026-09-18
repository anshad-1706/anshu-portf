import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import styles from "./HeroIntro.module.css";

const HERO_LETTERS = ["A", "N", "S", "H", "A", "D"] as const;

// Exact approved copy
const PARAGRAPH_01 =
  "I'm an Information Technology student building my way from learning technology to creating with it.";
const PARAGRAPH_02 =
  "I work across software, AI, automation, and product design — always looking for ways to turn problems into systems.";
const PARAGRAPH_03 = "I'm building toward something of my own.";

/**
 * Editorial cubic-bezier easing curve:
 * Soft acceleration, long organic deceleration, zero bounce, zero overshoot.
 */
const EDITORIAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const letterVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(14px)",
    x: -40,
    y: 5,
    scale: 1,
  },
  visible: (i: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.15,
      // 0.65s deliberate pure white pause before letter A begins
      delay: 0.65 + i * 0.18,
      ease: EDITORIAL_EASE,
    },
  }),
};

interface CharData {
  char: string;
  idx: number;
  start: number;
  end: number;
}

interface WordData {
  word: string;
  chars: CharData[];
}

function tokenizeStatement(
  text: string,
  startWindow: number,
  endWindow: number,
  charDuration: number
): WordData[] {
  const rawWords = text.split(" ");
  const totalChars = rawWords.reduce((acc, w) => acc + w.length, 0);
  let counter = 0;

  return rawWords.map((word) => {
    const chars: CharData[] = word.split("").map((c) => {
      const idx = counter++;
      const start = startWindow + (idx / totalChars) * (endWindow - startWindow);
      const end = start + charDuration;
      return { char: c, idx, start, end };
    });
    return { word, chars };
  });
}

interface AnimatedCharProps {
  char: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  reducedMotion: boolean;
}

const AnimatedChar: React.FC<AnimatedCharProps> = ({
  char,
  progress,
  start,
  end,
  reducedMotion,
}) => {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const blurPx = useTransform(
    progress,
    [start, end],
    [reducedMotion ? 0 : 12, 0]
  );
  const filter = useTransform(blurPx, (v) =>
    v <= 0.15 ? "none" : `blur(${v.toFixed(1)}px)`
  );
  const y = useTransform(
    progress,
    [start, end],
    [reducedMotion ? 0 : 16, 0]
  );

  return (
    <motion.span
      className={styles.char}
      style={{
        opacity,
        filter,
        y,
      }}
    >
      {char}
    </motion.span>
  );
};

interface HeroIntroProps {
  onScene04Change?: (active: boolean) => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({ onScene04Change }) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isEntranceComplete, setIsEntranceComplete] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  // Guarantee page starts at top and locks scroll during the 2.7s entrance reveal
  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    if (!isEntranceComplete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const fallbackTimer = setTimeout(() => {
      setIsEntranceComplete(true);
    }, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      document.body.style.overflow = "";
    };
  }, [isEntranceComplete]);

  // Track scroll progress along the hero track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Scene 04 trigger: once Paragraph 03 has completely transitioned away (>= 0.98)
  // Reversible if user scrolls back up into P3 (< 0.92)
  useEffect(() => {
    const handleProgress = (latest: number) => {
      if (latest >= 0.98) {
        onScene04Change?.(true);
      } else if (latest < 0.92) {
        onScene04Change?.(false);
      }
    };

    handleProgress(scrollYProgress.get());
    const unsubscribe = scrollYProgress.on("change", handleProgress);
    return () => unsubscribe();
  }, [scrollYProgress, onScene04Change]);

  // ==========================================
  // Layer 1: Atmospheric Typographic Shadow of ANSHAD
  // ==========================================
  const shadowX = useTransform(
    scrollYProgress,
    [0, 0.1, 0.26],
    [0, -10, -22]
  );

  const shadowScale = useTransform(
    scrollYProgress,
    [0, 0.18],
    [1, 1.05]
  );

  const shadowBlurPx = useTransform(
    scrollYProgress,
    [0, 0.05, 0.14, 0.25],
    [0, 12, 55, 105]
  );
  const shadowFilter = useTransform(shadowBlurPx, (v) =>
    v <= 0.15 ? "none" : `blur(${v.toFixed(1)}px)`
  );

  // Shadow remains strong behind P1 (0.16 - 0.32), then dissolves cleanly to 0
  const shadowOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.28, 0.40],
    [1, 0.85, 0.75, 0]
  );

  // ==========================================
  // Layer 2: Paragraph 01 (Tokens & Transitions)
  // ==========================================
  const p1Tokens = useMemo(
    () => tokenizeStatement(PARAGRAPH_01, 0.16, 0.26, 0.08),
    []
  );

  // P1 recede: subtle upward drift, blur, and opacity reduction
  const p1ExitOpacity = useTransform(
    scrollYProgress,
    [0.34, 0.44],
    [1, 0]
  );
  const p1ExitBlurPx = useTransform(
    scrollYProgress,
    [0.34, 0.44],
    [0, shouldReduceMotion ? 0 : 12]
  );
  const p1ExitFilter = useTransform(p1ExitBlurPx, (v) =>
    v <= 0.15 ? "none" : `blur(${v.toFixed(1)}px)`
  );
  const p1ExitY = useTransform(
    scrollYProgress,
    [0.34, 0.44],
    [0, shouldReduceMotion ? 0 : -18]
  );

  // ==========================================
  // Layer 3: Paragraph 02 (Tokens & Transitions)
  // ==========================================
  const p2Tokens = useMemo(
    () => tokenizeStatement(PARAGRAPH_02, 0.42, 0.52, 0.08),
    []
  );

  // P2 recede: subtle upward drift, blur, and opacity reduction
  const p2ExitOpacity = useTransform(
    scrollYProgress,
    [0.60, 0.70],
    [1, 0]
  );
  const p2ExitBlurPx = useTransform(
    scrollYProgress,
    [0.60, 0.70],
    [0, shouldReduceMotion ? 0 : 12]
  );
  const p2ExitFilter = useTransform(p2ExitBlurPx, (v) =>
    v <= 0.15 ? "none" : `blur(${v.toFixed(1)}px)`
  );
  const p2ExitY = useTransform(
    scrollYProgress,
    [0.60, 0.70],
    [0, shouldReduceMotion ? 0 : -18]
  );

  // ==========================================
  // Layer 4: Paragraph 03 — VISUAL CLIMAX
  // Slower, deliberate reveal, subtle scale, settles on "own."
  // Stillness pause from ~0.76 to 1.00
  // ==========================================
  const p3Tokens = useMemo(
    () => tokenizeStatement(PARAGRAPH_03, 0.65, 0.74, 0.08),
    []
  );

  const p3Scale = useTransform(
    scrollYProgress,
    [0.65, 0.78],
    [shouldReduceMotion ? 1 : 0.97, 1]
  );

  // Paragraph 03 Stillness pause: 0.74 -> 0.88
  // Paragraph 03 gentle recede exit: 0.88 -> 0.98
  const p3ExitOpacity = useTransform(
    scrollYProgress,
    [0.88, 0.98],
    [1, 0]
  );
  const p3ExitBlurPx = useTransform(
    scrollYProgress,
    [0.88, 0.98],
    [0, shouldReduceMotion ? 0 : 12]
  );
  const p3ExitFilter = useTransform(p3ExitBlurPx, (v) =>
    v <= 0.15 ? "none" : `blur(${v.toFixed(1)}px)`
  );
  const p3ExitY = useTransform(
    scrollYProgress,
    [0.88, 0.98],
    [0, shouldReduceMotion ? 0 : -18]
  );

  const handleLastLetterComplete = () => {
    setIsEntranceComplete(true);
  };

  return (
    <section
      ref={containerRef}
      className={styles.heroTrack}
      aria-label="Hero Introduction and Identity Statements"
    >
      <div className={styles.stickyViewport}>
        {/* Layer 0: Subtle pale-blue corner atmosphere */}
        <div className={styles.cornerAtmosphere} aria-hidden="true" />

        {/* Layer 1: Atmospheric Typographic Shadow of ANSHAD */}
        <motion.div
          className={styles.shadowLayer}
          style={{
            x: shadowX,
            scale: shadowScale,
            filter: shadowFilter,
            opacity: shadowOpacity,
          }}
        >
          <motion.h1
            className={styles.nameHeading}
            initial="hidden"
            animate="visible"
          >
            {HERO_LETTERS.map((letter, index) => (
              <motion.span
                key={`${letter}-${index}`}
                custom={index}
                variants={letterVariants}
                className={styles.letter}
                onAnimationComplete={
                  index === HERO_LETTERS.length - 1
                    ? handleLastLetterComplete
                    : undefined
                }
              >
                {letter}
              </motion.span>
            ))}
          </motion.h1>
        </motion.div>

        {/* ==================================================== */}
        {/* Paragraph 01: Student journey from learning to creating */}
        {/* ==================================================== */}
        <motion.div
          className={styles.statementLayer}
          style={{
            opacity: p1ExitOpacity,
            filter: p1ExitFilter,
            y: p1ExitY,
          }}
        >
          <p className={`${styles.paragraphBase} ${styles.paragraph01}`}>
            {p1Tokens.map(({ word, chars }, wordIndex) => (
              <React.Fragment key={`p1-${word}-${wordIndex}`}>
                <span className={styles.word}>
                  {chars.map(({ char, idx, start, end }) => (
                    <AnimatedChar
                      key={`p1-c-${idx}`}
                      char={char}
                      progress={scrollYProgress}
                      start={start}
                      end={end}
                      reducedMotion={shouldReduceMotion}
                    />
                  ))}
                </span>
                {wordIndex < p1Tokens.length - 1 && (
                  <span className={styles.char}>&nbsp;</span>
                )}
              </React.Fragment>
            ))}
          </p>
        </motion.div>

        {/* ==================================================== */}
        {/* Paragraph 02: Software, AI, automation & product design */}
        {/* ==================================================== */}
        <motion.div
          className={styles.statementLayer}
          style={{
            opacity: p2ExitOpacity,
            filter: p2ExitFilter,
            y: p2ExitY,
          }}
        >
          <p className={`${styles.paragraphBase} ${styles.paragraph02}`}>
            {p2Tokens.map(({ word, chars }, wordIndex) => (
              <React.Fragment key={`p2-${word}-${wordIndex}`}>
                <span className={styles.word}>
                  {chars.map(({ char, idx, start, end }) => (
                    <AnimatedChar
                      key={`p2-c-${idx}`}
                      char={char}
                      progress={scrollYProgress}
                      start={start}
                      end={end}
                      reducedMotion={shouldReduceMotion}
                    />
                  ))}
                </span>
                {wordIndex < p2Tokens.length - 1 && (
                  <span className={styles.char}>&nbsp;</span>
                )}
              </React.Fragment>
            ))}
          </p>
        </motion.div>

        {/* ==================================================== */}
        {/* Paragraph 03 — VISUAL CLIMAX: Building toward something of my own */}
        {/* ==================================================== */}
        <motion.div
          className={styles.statementLayer}
          style={{
            scale: p3Scale,
            opacity: p3ExitOpacity,
            filter: p3ExitFilter,
            y: p3ExitY,
          }}
        >
          <p className={`${styles.paragraphBase} ${styles.paragraph03}`}>
            {p3Tokens.map(({ word, chars }, wordIndex) => (
              <React.Fragment key={`p3-${word}-${wordIndex}`}>
                <span className={styles.word}>
                  {chars.map(({ char, idx, start, end }) => (
                    <AnimatedChar
                      key={`p3-c-${idx}`}
                      char={char}
                      progress={scrollYProgress}
                      start={start}
                      end={end}
                      reducedMotion={shouldReduceMotion}
                    />
                  ))}
                </span>
                {wordIndex < p3Tokens.length - 1 && (
                  <span className={styles.char}>&nbsp;</span>
                )}
              </React.Fragment>
            ))}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroIntro;
