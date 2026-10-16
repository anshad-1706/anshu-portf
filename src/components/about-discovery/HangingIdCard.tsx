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
  | "at_pull_stop"
  | "centering"
  | "centered"
  | "about_requested";

export interface HangingIdCardProps {
  isHomeStable: boolean;
  isAboutActive: boolean;
  forceTrigger?: boolean;
  onAboutRequested?: () => void;
  onDismiss?: () => void;
  className?: string;
}

// Physical geometry constants
const DESKTOP_RESTING_Y = -196;
const MOBILE_RESTING_Y  = -168;
const DESKTOP_STOP_Y    = 18;
const MOBILE_STOP_Y     = 14;
const HIDDEN_Y          = -320;

// Pendulum physics constants
const NATURAL_FREQ_SQ  = 24.0; // omega_0^2: realistic ~1.28s oscillation cycle
const PENDULUM_DAMPING = 2.8;  // Underdamped: 3-4 natural swings smoothly settling to rest
const MAX_ANGLE_DEG    = 13.5; // Desktop swing envelope
const MAX_ANGLE_MOB    = 9.5;  // Mobile swing envelope
const DRAG_SMOOTHING   = 0.45;

function easeOutExpo(t: number): number {
  return t === 0 ? 0 : t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function cinematicRotation(t: number, fromRot: number): number {
  if (t <= 0.23) return lerp(fromRot, -8, easeOutExpo(t / 0.23));
  if (t <= 0.52) return lerp(-8, -3, easeOutExpo((t - 0.23) / 0.29));
  if (t <= 0.85) return lerp(-3, 0, easeOutExpo((t - 0.52) / 0.33));
  return 0;
}

function cinematicScale(t: number, finalScale: number): number {
  if (t <= 0.23) return lerp(1, 1.08, easeOutExpo(t / 0.23));
  if (t <= 0.52) return lerp(1.08, 1.18, easeOutExpo((t - 0.23) / 0.29));
  return lerp(1.18, finalScale, easeOutExpo((t - 0.52) / 0.48));
}

export const HangingIdCard: React.FC<HangingIdCardProps> = ({
  isHomeStable,
  isAboutActive,
  forceTrigger = false,
  onAboutRequested,
  onDismiss,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const [discoveryState, setDiscoveryState] =
    useState<IdCardDiscoveryState>("idle");

  const [tx,  setTxS]  = useState(0);
  const [ty,  setTyS]  = useState(HIDDEN_Y);
  const [rot, setRotS] = useState(-1.5);
  const [sc,  setScS]  = useState(1);

  const [isDragging,   setIsDragging]   = useState(false);
  const [isNudging,    setIsNudging]    = useState(false);
  const [isCtaVisible, setIsCtaVisible] = useState(false);

  const txRef  = useRef(0);
  const tyRef  = useRef(HIDDEN_Y);
  const rotRef = useRef(-1.5);
  const scRef  = useRef(1);

  const anchorRef       = useRef<HTMLDivElement>(null);
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef          = useRef<number | null>(null);
  const dragStartRef    = useRef<{ x: number; y: number; startY: number; startX: number } | null>(null);
  const lastDeltaYRef   = useRef(0);
  const targetCenterRef = useRef({ x: 0, y: 0 });
  const stateRef        = useRef<IdCardDiscoveryState>("idle");

  // Pendulum physics refs
  const pendulumAngleRef    = useRef(0);
  const pendulumVelRef      = useRef(0);
  const pendulumRafRef      = useRef<number | null>(null);
  const lastPendulumTimeRef = useRef<number>(0);
  const pendulumActiveRef   = useRef(false);

  // Pointer velocity tracking
  const lastPointerXRef    = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const pointerVelXRef     = useRef(0);

  // Assembly ref for direct DOM rotation (avoids React re-renders in physics loop)
  const hangingAssemblyRef = useRef<HTMLDivElement>(null);

  const getMaxAngle = useCallback(() => {
    if (typeof window === "undefined") return MAX_ANGLE_DEG;
    return window.innerWidth <= 768 ? MAX_ANGLE_MOB : MAX_ANGLE_DEG;
  }, []);

  const getCenterScale = useCallback(() => {
    if (shouldReduceMotion) return 1.05;
    if (typeof window === "undefined") return 1.24;
    if (window.innerWidth <= 768)  return 1.15;
    if (window.innerWidth <= 1024) return 1.18;
    return 1.24;
  }, [shouldReduceMotion]);

  // Dynamically set pivot to the exact top of the viewport
  const updateAssemblyPivot = useCallback(() => {
    const el = hangingAssemblyRef.current;
    if (!el || typeof window === "undefined") return;
    const isCentered =
      stateRef.current === "centered" ||
      stateRef.current === "centering" ||
      stateRef.current === "about_requested";
    if (isCentered) {
      const scale = getCenterScale();
      const targetY = targetCenterRef.current.y;
      const hangLength = targetY > 0 ? targetY / scale : 260;
      el.style.transformOrigin = `50% -${hangLength}px`;
    } else {
      el.style.transformOrigin = "50% 0%";
    }
  }, [getCenterScale]);

  useEffect(() => {
    stateRef.current = discoveryState;
    updateAssemblyPivot();
  }, [discoveryState, updateAssemblyPivot]);

  const applyPendulumRotation = useCallback((angleDeg: number) => {
    const el = hangingAssemblyRef.current;
    if (el) {
      el.style.transform = `rotate(${angleDeg}deg)`;
    }
  }, []);

  const stopPendulum = useCallback(() => {
    if (pendulumRafRef.current !== null) {
      cancelAnimationFrame(pendulumRafRef.current);
      pendulumRafRef.current = null;
    }
    pendulumActiveRef.current = false;
  }, []);

  const startPendulum = useCallback(() => {
    if (shouldReduceMotion) {
      pendulumAngleRef.current = 0;
      pendulumVelRef.current   = 0;
      applyPendulumRotation(0);
      return;
    }

    stopPendulum();
    pendulumActiveRef.current = true;
    lastPendulumTimeRef.current = performance.now();

    const loop = (now: number) => {
      if (!pendulumActiveRef.current) return;

      const dtMs = now - lastPendulumTimeRef.current;
      lastPendulumTimeRef.current = now;
      const dt = Math.min(dtMs / 1000, 0.032);

      const angle    = pendulumAngleRef.current;
      const vel      = pendulumVelRef.current;
      const maxAngleRad = getMaxAngle() * (Math.PI / 180);

      // Natural harmonic pendulum dynamics: theta'' = -omega_0^2 * sin(theta) - beta * theta'
      const accel = -NATURAL_FREQ_SQ * Math.sin(angle) - PENDULUM_DAMPING * vel;
      let newVel   = vel + accel * dt;
      let newAngle = angle + newVel * dt;

      // Soft rebound bounce if hitting peak angle threshold
      if (newAngle > maxAngleRad) {
        newAngle = maxAngleRad;
        newVel = -Math.abs(newVel) * 0.25;
      } else if (newAngle < -maxAngleRad) {
        newAngle = -maxAngleRad;
        newVel = Math.abs(newVel) * 0.25;
      }

      pendulumAngleRef.current = newAngle;
      pendulumVelRef.current   = newVel;

      const angleDeg = newAngle * (180 / Math.PI);
      applyPendulumRotation(angleDeg);

      // Settle condition based on kinetic + potential energy
      const totalEnergy = 0.5 * newVel * newVel + NATURAL_FREQ_SQ * (1 - Math.cos(newAngle));
      if (totalEnergy < 0.0004 && Math.abs(angleDeg) < 0.04) {
        pendulumAngleRef.current = 0;
        pendulumVelRef.current   = 0;
        applyPendulumRotation(0);
        pendulumRafRef.current = null;
        pendulumActiveRef.current = false;
        return;
      }

      pendulumRafRef.current = requestAnimationFrame(loop);
    };

    pendulumRafRef.current = requestAnimationFrame(loop);
  }, [shouldReduceMotion, getMaxAngle, applyPendulumRotation, stopPendulum]);

  const applyTransform = useCallback((x: number, y: number, r: number, s: number) => {
    txRef.current  = x; tyRef.current  = y;
    rotRef.current = r; scRef.current  = s;
    setTxS(x); setTyS(y); setRotS(r); setScS(s);
  }, []);

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const getRestingY = useCallback(() =>
    (typeof window !== "undefined" && window.innerWidth <= 768) ? MOBILE_RESTING_Y : DESKTOP_RESTING_Y, []);

  const getStopY = useCallback(() =>
    (typeof window !== "undefined" && window.innerWidth <= 768) ? MOBILE_STOP_Y : DESKTOP_STOP_Y, []);

  const calculateCenterCoordinates = useCallback(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const anchorRect = anchorRef.current?.getBoundingClientRect();
    const anchorLeft = anchorRect ? anchorRect.left : 36;
    const isMobile = window.innerWidth <= 768;
    const cardW = isMobile ? 142 : 170;
    const cardH = isMobile ? 215 : 250;
    const targetX = window.innerWidth  / 2 - anchorLeft - cardW / 2;
    const targetY = window.innerHeight / 2 - cardH / 2 - (isMobile ? 26 : 36);
    return { x: targetX, y: targetY };
  }, []);

  const beginCenterTransition = useCallback(() => {
    cancelRaf();
    stopPendulum();
    setDiscoveryState("centering");
    setIsCtaVisible(false);

    const { x: toX, y: toY } = calculateCenterCoordinates();
    targetCenterRef.current = { x: toX, y: toY };

    const finalScale = getCenterScale();
    const fromX   = txRef.current;
    const fromY   = tyRef.current;
    const fromRot = rotRef.current;

    pendulumAngleRef.current = 0;
    pendulumVelRef.current   = 0;
    applyPendulumRotation(0);

    if (shouldReduceMotion) {
      applyTransform(toX, toY, 0, 1.05);
      setTimeout(() => {
        setDiscoveryState("centered");
        updateAssemblyPivot();
        setTimeout(() => setIsCtaVisible(true), 60);
      }, 120);
      return;
    }

    const DURATION = 350;
    const startTime = performance.now();

    const tick = (now: number) => {
      const rawT = Math.min(1, (now - startTime) / DURATION);

      const tEased = easeOutExpo(rawT);
      const curX = lerp(fromX, toX, tEased);
      const curY = lerp(fromY, toY, tEased);
      const curRot = cinematicRotation(rawT, fromRot);
      const curSc  = cinematicScale(rawT, finalScale);

      txRef.current = curX; tyRef.current = curY;
      rotRef.current = curRot; scRef.current = curSc;
      setTxS(curX); setTyS(curY); setRotS(curRot); setScS(curSc);

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        applyTransform(toX, toY, 0, finalScale);
        rafRef.current = null;
        setDiscoveryState("centered");
        updateAssemblyPivot();
        setTimeout(() => setIsCtaVisible(true), 250);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [
    cancelRaf,
    stopPendulum,
    calculateCenterCoordinates,
    getCenterScale,
    shouldReduceMotion,
    applyTransform,
    applyPendulumRotation,
    updateAssemblyPivot,
  ]);

  // 1. Initial teaser entrance timer (reveals card once Home settles)
  useEffect(() => {
    if (!isHomeStable || isAboutActive) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      return;
    }
    if (discoveryState === "idle") {
      timerRef.current = setTimeout(() => {
        setDiscoveryState("teaser_entering");
        const restY = getRestingY();
        applyTransform(0, restY, -1.5, 1);
        setTimeout(() => {
          setDiscoveryState((prev) => prev === "teaser_entering" ? "teaser_visible" : prev);
        }, shouldReduceMotion ? 50 : 700);
      }, 600);
    }
    return () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  }, [isHomeStable, isAboutActive, discoveryState, getRestingY, shouldReduceMotion, applyTransform]);

  // 2. Force trigger from FloatingNav
  useEffect(() => {
    if (!forceTrigger || isAboutActive) return;
    let settleT: ReturnType<typeof setTimeout> | null = null;
    let nudgeT:  ReturnType<typeof setTimeout> | null = null;

    const rafId = requestAnimationFrame(() => {
      if (discoveryState === "idle") {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        setDiscoveryState("teaser_entering");
        const restY = getRestingY();
        applyTransform(0, restY, -1.5, 1);
        settleT = setTimeout(() => {
          setDiscoveryState((prev) => prev === "teaser_entering" ? "teaser_visible" : prev);
        }, shouldReduceMotion ? 50 : 700);
      } else if (discoveryState === "teaser_visible") {
        setIsNudging(true);
        const restY = getRestingY();
        applyTransform(0, restY + 28, -1.5, 1);
        nudgeT = setTimeout(() => { applyTransform(0, restY, -1.5, 1); setIsNudging(false); }, 350);
      }
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (settleT) clearTimeout(settleT);
      if (nudgeT)  clearTimeout(nudgeT);
    };
  }, [forceTrigger, discoveryState, isAboutActive, getRestingY, shouldReduceMotion, applyTransform]);

  // 3. Handle About active state transitions and return Home restoration
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let rafId: number | null = null;

    if (isAboutActive) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      cancelRaf();
      stopPendulum();
      dragStartRef.current = null;
      lastDeltaYRef.current = 0;
      pendulumAngleRef.current = 0;
      pendulumVelRef.current = 0;
      applyPendulumRotation(0);

      const resetToResting = () => {
        setIsDragging(false);
        setIsNudging(false);
        setIsCtaVisible(false);
        const restY = getRestingY();
        applyTransform(0, restY, -1.5, 1);
        setDiscoveryState("teaser_visible");
        updateAssemblyPivot();
      };

      if (stateRef.current === "about_requested") {
        timer = setTimeout(resetToResting, 450);
      } else {
        rafId = requestAnimationFrame(resetToResting);
      }
    } else if (isHomeStable) {
      if (
        stateRef.current === "about_requested" ||
        stateRef.current === "centering" ||
        stateRef.current === "centered"
      ) {
        rafId = requestAnimationFrame(() => {
          setIsDragging(false);
          setIsNudging(false);
          setIsCtaVisible(false);
          const restY = getRestingY();
          applyTransform(0, restY, -1.5, 1);
          setDiscoveryState("teaser_visible");
          updateAssemblyPivot();
        });
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    isAboutActive,
    isHomeStable,
    cancelRaf,
    stopPendulum,
    applyPendulumRotation,
    getRestingY,
    applyTransform,
    updateAssemblyPivot,
  ]);

  // 4. Resize recenter
  useEffect(() => {
    const handleResize = () => {
      if (stateRef.current === "centered") {
        const { x, y } = calculateCenterCoordinates();
        targetCenterRef.current = { x, y };
        applyTransform(x, y, 0, getCenterScale());
      } else if (stateRef.current === "teaser_visible") {
        const restY = getRestingY();
        applyTransform(0, restY, -1.5, 1);
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateCenterCoordinates, getCenterScale, getRestingY, applyTransform]);

  // Cleanup pendulum on unmount
  useEffect(() => {
    return () => stopPendulum();
  }, [stopPendulum]);

  // Pointer: down
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isAboutActive) return;
    const ds = stateRef.current;
    if (ds !== "teaser_visible" && ds !== "teaser_entering" && ds !== "centered") return;

    cancelRaf();
    if (ds === "centered") stopPendulum();

    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY, startY: tyRef.current, startX: txRef.current };
    lastDeltaYRef.current = 0;

    lastPointerXRef.current    = e.clientX;
    lastPointerTimeRef.current = performance.now();
    pointerVelXRef.current     = 0;

    setIsDragging(true);
    if (ds === "teaser_visible" || ds === "teaser_entering") setDiscoveryState("dragging");
  };

  // Pointer: move
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const ds = stateRef.current;

    const now  = performance.now();
    const dtMs = now - lastPointerTimeRef.current;
    if (dtMs > 0) {
      const rawVel = (e.clientX - lastPointerXRef.current) / dtMs;
      pointerVelXRef.current = lerp(pointerVelXRef.current, rawVel, 0.4);
    }
    lastPointerXRef.current    = e.clientX;
    lastPointerTimeRef.current = now;

    if (ds === "dragging" || ds === "at_pull_stop") {
      const deltaY = e.clientY - dragStartRef.current.y;
      const deltaX = e.clientX - dragStartRef.current.x;
      lastDeltaYRef.current = deltaY;

      const restY = getRestingY();
      const stopY = getStopY();
      const pullToStop = stopY - restY;

      let effY: number;
      if (deltaY < 0) {
        effY = restY + deltaY * 0.12;
      } else if (deltaY <= pullToStop) {
        effY = restY + deltaY;
      } else {
        const excess = deltaY - pullToStop;
        effY = stopY + 5 * (excess / (excess + 40));
      }

      const atStop = deltaY >= pullToStop - 4;
      if (atStop && ds !== "at_pull_stop") setDiscoveryState("at_pull_stop");
      if (!atStop && ds !== "dragging")    setDiscoveryState("dragging");

      const tilt = shouldReduceMotion ? -1.5 : -1.5 + Math.max(-3, Math.min(3, deltaX * 0.05));
      txRef.current = 0; tyRef.current = effY; rotRef.current = tilt; scRef.current = 1;
      setTxS(0); setTyS(effY); setRotS(tilt); setScS(1);

    } else if (ds === "centered") {
      const deltaX = e.clientX - dragStartRef.current.x;
      const scale = getCenterScale();
      const targetY = targetCenterRef.current.y;
      const hangLength = targetY > 0 ? targetY / scale : 260;
      const maxAngleRad = getMaxAngle() * (Math.PI / 180);

      const rawAngleRad = deltaX / hangLength;
      const clampedAngleRad = Math.max(-maxAngleRad * 1.15, Math.min(maxAngleRad * 1.15, rawAngleRad));

      const curAngleRad = pendulumAngleRef.current;
      const nextAngleRad = lerp(curAngleRad, clampedAngleRad, DRAG_SMOOTHING);

      pendulumAngleRef.current = nextAngleRad;
      pendulumVelRef.current   = 0;
      applyPendulumRotation(nextAngleRad * (180 / Math.PI));
    }
  };

  // Pointer: up / cancel
  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    setIsDragging(false);

    const ds = stateRef.current;

    if (ds === "dragging" || ds === "at_pull_stop") {
      const restY = getRestingY();
      const stopY = getStopY();
      const pullToStop = stopY - restY;
      const lastDY = lastDeltaYRef.current;

      if (ds === "at_pull_stop" || lastDY >= pullToStop - 6) {
        beginCenterTransition();
      } else {
        applyTransform(0, restY, -1.5, 1);
        setDiscoveryState("teaser_visible");
      }
    } else if (ds === "centered") {
      const releaseVelPxPerSec = pointerVelXRef.current * 1000;
      const scale = getCenterScale();
      const targetY = targetCenterRef.current.y;
      const hangLength = targetY > 0 ? targetY / scale : 260;
      const angularVel = releaseVelPxPerSec / hangLength;
      const maxAngleRad = getMaxAngle() * (Math.PI / 180);
      const maxAngularVel = maxAngleRad * 5.5;
      const clampedVel = Math.max(-maxAngularVel, Math.min(maxAngularVel, angularVel));

      pendulumVelRef.current = clampedVel;
      startPendulum();
    }

    dragStartRef.current = null;
  };

  // Keyboard
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isAboutActive) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      const ds = stateRef.current;
      if (ds === "teaser_visible" || ds === "at_pull_stop") {
        e.preventDefault();
        beginCenterTransition();
      } else if (ds === "centered") {
        e.preventDefault();
        handleCtaClick();
      }
    }
  };

  const handleCtaClick = () => {
    stopPendulum();
    setDiscoveryState("about_requested");
    setIsCtaVisible(false);
    onAboutRequested?.();
  };

  // FIX 02: Allow users to exit ID card discovery screen without reload
  const dismissDiscovery = useCallback(() => {
    // Prevent dismiss while drag or about transition is active
    if (
      isDragging ||
      stateRef.current === "about_requested" ||
      stateRef.current === "idle" ||
      isAboutActive
    ) {
      return;
    }

    if (stateRef.current === "centered" || stateRef.current === "centering") {
      cancelRaf();
      stopPendulum();
      setIsCtaVisible(false);

      const restY = getRestingY();
      const fromX = txRef.current;
      const fromY = tyRef.current;
      const fromRot = rotRef.current;
      const fromSc = scRef.current;

      if (shouldReduceMotion) {
        applyTransform(0, restY, -1.5, 1);
        setDiscoveryState("teaser_visible");
        updateAssemblyPivot();
        onDismiss?.();
        return;
      }

      const DURATION = 380;
      const startTime = performance.now();

      const tick = (now: number) => {
        const rawT = Math.min(1, (now - startTime) / DURATION);
        const tEased = easeOutExpo(rawT);

        const curX = lerp(fromX, 0, tEased);
        const curY = lerp(fromY, restY, tEased);
        const curRot = lerp(fromRot, -1.5, tEased);
        const curSc = lerp(fromSc, 1, tEased);

        applyTransform(curX, curY, curRot, curSc);

        if (rawT < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          applyTransform(0, restY, -1.5, 1);
          rafRef.current = null;
          setDiscoveryState("teaser_visible");
          updateAssemblyPivot();
          onDismiss?.();
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    }
  }, [
    isDragging,
    cancelRaf,
    stopPendulum,
    getRestingY,
    shouldReduceMotion,
    applyTransform,
    updateAssemblyPivot,
    onDismiss,
    isAboutActive,
  ]);

  // Window listeners for outside clicks and Escape dismissal
  useEffect(() => {
    if (discoveryState !== "centered") return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      if (isDragging || stateRef.current === "about_requested") return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Do not dismiss when clicking on the hanging assembly or CTA button
      if (
        hangingAssemblyRef.current?.contains(target) ||
        target.closest(`.${styles.ctaContainer}`) ||
        target.closest(`.${styles.cardMover}`)
      ) {
        return;
      }

      // Do not dismiss on navbar or social controls
      if (
        target.closest("nav") ||
        target.closest("header") ||
        target.closest(`[data-layer="navigation"]`) ||
        target.closest(`[data-layer="social"]`)
      ) {
        return;
      }

      dismissDiscovery();
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismissDiscovery();
      }
    };

    window.addEventListener("pointerdown", handlePointerDownOutside);
    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDownOutside);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [discoveryState, isDragging, dismissDiscovery]);

  // Derived flags
  const isTeaserActive =
    discoveryState === "teaser_entering" ||
    discoveryState === "teaser_visible"  ||
    discoveryState === "dragging"        ||
    discoveryState === "at_pull_stop"    ||
    discoveryState === "centering"       ||
    discoveryState === "centered";

  const isBackdropVisible =
    discoveryState === "centering" || discoveryState === "centered";

  const isCenteringOrCentered =
    discoveryState === "centering"       ||
    discoveryState === "centered"        ||
    discoveryState === "about_requested";

  const showTeaserInstruction =
    !isCenteringOrCentered &&
    (discoveryState === "teaser_visible" ||
      (discoveryState === "dragging" && ty - getRestingY() < 24));

  const moverTransform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(${sc})`;

  const getMoverTransition = (): string => {
    if (isDragging || discoveryState === "centering") return "none";
    if (isNudging) return "transform 350ms cubic-bezier(0.2, 0.9, 0.4, 1.2)";
    if (discoveryState === "centered") return "transform 380ms cubic-bezier(0.16, 1, 0.3, 1)";
    return shouldReduceMotion
      ? "transform 150ms ease, opacity 450ms ease"
      : "transform 520ms cubic-bezier(0.16, 1, 0.3, 1), opacity 450ms ease";
  };

  return (
    <div
      className={styles.aboutDiscoveryWrapper}
      aria-hidden={!isTeaserActive || isAboutActive}
    >

      {/* 1. Background Focus Backdrop with click-to-dismiss */}
      <div
        className={`${styles.focusBackdrop} ${isBackdropVisible && !isAboutActive ? styles.isVisible : ""}`}
        onClick={dismissDiscovery}
        aria-hidden="true"
      />

      {/* 2. Top-Left Hanging Anchor */}
      <div ref={anchorRef} className={`${styles.hangingAnchor} ${className}`.trim()}>

        {/*
         * cardMover: owns translate + scale (position in viewport).
         * Pendulum rotation lives on hangingAssembly — separate concerns.
         */}
        <div
          className={styles.cardMover}
          style={{
            transform:  moverTransform,
            transition: getMoverTransition(),
            visibility:
              (isTeaserActive && !isAboutActive) ||
              discoveryState === "about_requested"
                ? "visible"
                : "hidden",
            opacity:
              discoveryState === "about_requested" || isAboutActive ? 0 : 1,
            pointerEvents:
              !isAboutActive && isTeaserActive ? "auto" : "none",
          }}
        >
          {/*
           * hangingAssembly: the PENDULUM PIVOT.
           * transform-origin: top center at viewport ceiling.
           * Rotates around top pivot — strap + tag + clasp + card move as ONE physical unit.
           * Physics loop mutates el.style.transform directly for zero-jank RAF.
           */}
          <div
            ref={hangingAssemblyRef}
            className={`${styles.hangingAssembly} ${isCenteringOrCentered ? styles.isCenteredAssembly : ""}`}
          >
            {/* Centered Hanging Strap & Tag Assembly — extends all the way to top of viewport */}
            {isCenteringOrCentered && (
              <div className={styles.hangingConnection} aria-hidden="true">
                <div className={styles.upperStrap} />
                <div className={styles.lanyardTag}>
                  <span className={styles.lanyardTagText}>ARCHIVE</span>
                </div>
                <div className={styles.lowerStrap} />
                <div className={styles.hangingClasp}>
                  <div className={styles.claspRing} />
                  <div className={styles.claspBody} />
                </div>
              </div>
            )}

            {/* Legacy strap / clasp during teaser + drag phases */}
            {!isCenteringOrCentered && (
              <>
                <div className={styles.strap} aria-hidden="true" />
                <div className={styles.clasp} aria-hidden="true" />
              </>
            )}

            {/* ID Card */}
            <div
              className={[
                styles.hangingCard,
                isDragging            ? styles.isDragging    : "",
                isCenteringOrCentered ? styles.isCenteredCard : "",
                discoveryState === "at_pull_stop" ? styles.atPullStop : "",
              ].join(" ").trim()}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              role="button"
              tabIndex={isTeaserActive && !isAboutActive ? 0 : -1}
              aria-label="About me card. Pull down to discover more about me."
              data-state={discoveryState}
            >
              <div className={styles.punchHole} aria-hidden="true" />

              <div className={styles.cardHeader}>
                <span className={styles.cardHeaderTag}>IDENTITY / 2026</span>
                <span className={styles.cardHeaderSerial}>ARCHIVE // 01</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.photoPlaceholder}>
                  <svg className={styles.photoIcon} viewBox="0 0 24 24" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                  </svg>
                  <span className={styles.photoPlaceholderText}>PORTRAIT // READY</span>
                </div>

                <div className={styles.infoGroup}>
                  <h3 className={styles.name}>ANSHAD</h3>
                  <p className={styles.role}>SOFTWARE ARCHITECT &amp; DEV</p>
                </div>

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
                  <span className={styles.footerCode}>&#8470; 0092-26-AGY</span>
                </div>
              </div>
            </div>

            {/* FIX 01: PULL ME DOWN Animated Instruction — mounted directly under the hanging card */}
            {!isCenteringOrCentered && (
              <div
                className={styles.instructionContainer}
                style={{
                  opacity: showTeaserInstruction ? 1 : 0,
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              >
                <span className={styles.instructionText}>PULL ME DOWN</span>
                <svg
                  className={styles.instructionArrow}
                  viewBox="0 0 24 24"
                  strokeWidth="2.4"
                  aria-hidden="true"
                >
                  <polyline points="7 10 12 15 17 10" />
                </svg>
              </div>
            )}
          </div>

          {/* 3. KNOW MORE ABOUT ME CTA */}
          {isCenteringOrCentered && (
            <div className={`${styles.ctaContainer} ${isCtaVisible ? styles.isCtaVisible : ""}`}>
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
