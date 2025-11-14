// src/components/ui/SwipeShell.tsx
// Reusable swipe-to-reveal/snap-back shell with animated background + icons.
// UI-only: invokes callbacks *after* slide-out animation.
// English comments by request.

import type { ReactNode } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import type { PanInfo } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type SwipeShellProps = {
  children: ReactNode;
  /** Fire when user swipes far enough to the LEFT (e.g., delete) */
  onSwipeLeftComplete?: () => void;
  /** Fire when user swipes far enough to the RIGHT (e.g., done/toggle) */
  onSwipeRightComplete?: () => void;
  /** Pixel distance to trigger completion */
  threshold?: number;
  /** Disable drag/swipe (e.g., while loading) */
  disabled?: boolean;
  /** Optional custom icons/labels/colors */
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  leftLabel?: string;
  rightLabel?: string;
};

export default function SwipeShell({
  children,
  onSwipeLeftComplete,
  onSwipeRightComplete,
  threshold = 96,
  disabled = false,
  leftIcon,
  rightIcon,
  leftLabel,
  rightLabel,
}: SwipeShellProps) {
  const { t } = useTranslation("common");

  const reduceMotion = useReducedMotion();
  const controls = useAnimation();
  const x = useMotionValue(0);
  const [locked, setLocked] = useState(false); // prevent double-complete
  const [vibrated, setVibrated] = useState(false); // one-time haptic on passing threshold

  // Localized fallback labels if caller did not provide custom text
  const effectiveLeftLabel =
    leftLabel ??
    t("swipe.leftDelete", {
      defaultValue: "Delete",
    });

  const effectiveRightLabel =
    rightLabel ??
    t("swipe.rightDone", {
      defaultValue: "Done",
    });

  // Progress 0..1 for each side
  const rightProgress = useTransform(x, [0, threshold], [0, 1]);
  const leftProgress = useTransform(x, [0, -threshold], [0, 1]);

  // Haptic (best-effort)
  useEffect(() => {
    const unsub = rightProgress.on("change", (p) => {
      if (p >= 1 && !vibrated) {
        try {
          navigator.vibrate?.(8);
          setVibrated(true);
        } catch {
          /* ignore optional vibration errors */
        }
      }
      if (p < 0.6 && vibrated) setVibrated(false);
    });
    return () => unsub();
  }, [rightProgress, vibrated]);

  const complete = async (dir: "left" | "right") => {
    if (locked) return;
    setLocked(true);
    const target =
      dir === "right" ? window.innerWidth * 1.1 : -window.innerWidth * 1.1;
    await controls.start({
      x: target,
      opacity: 0.85,
      transition: { duration: 0.22, ease: "easeIn" },
    });
    // Callbacks after slide-out:
    if (dir === "left") onSwipeLeftComplete?.();
    if (dir === "right") onSwipeRightComplete?.();
  };

  const handleDragEnd = async (
    _: MouseEvent | TouchEvent | PointerEvent | undefined,
    info: PanInfo
  ) => {
    if (locked) return;
    const distance = info.offset.x;
    const velX = info.velocity.x;

    // Trigger if distance OR velocity exceeds threshold-ish
    if (distance > threshold || velX > 800) return complete("right");
    if (distance < -threshold || velX < -800) return complete("left");

    // Snap back
    await controls.start({
      x: 0,
      transition: { type: "spring", stiffness: 420, damping: 34, mass: 0.6 },
    });
  };

  const canDrag =
    !disabled && !reduceMotion && (onSwipeLeftComplete || onSwipeRightComplete);

  return (
    <div className="relative">
      {/* Background layer with side cues */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid grid-cols-2"
      >
        {/* LEFT (Delete) */}
        <div className="relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 right-0 left-0 flex items-center justify-start pl-4 pr-2"
            style={{ opacity: leftProgress }}
          >
            <div className="flex items-center gap-2 rounded-lg bg-red-50 ring-1 ring-red-100 px-2 py-1">
              <span className="inline-flex h-5 w-5 items-center justify-center">
                {leftIcon ?? <Trash2 className="h-5 w-5" />}
              </span>
              <span className="text-sm text-red-700">{effectiveLeftLabel}</span>
            </div>
          </motion.div>
        </div>
        {/* RIGHT (Done) */}
        <div className="relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 right-0 flex items-center justify-end pr-4 pl-2"
            style={{ opacity: rightProgress }}
          >
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 ring-1 ring-emerald-100 px-2 py-1">
              <span className="text-emerald-700 text-sm">
                {effectiveRightLabel}
              </span>
              <span className="inline-flex h-5 w-5 items-center justify-center">
                {rightIcon ?? <Check className="h-5 w-5" />}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Foreground draggable card */}
      <motion.div
        className="relative will-change-transform"
        style={{ x }}
        animate={controls}
        drag={canDrag ? "x" : false}
        dragElastic={0.18}
        dragMomentum
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: canDrag ? 0.995 : 1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
