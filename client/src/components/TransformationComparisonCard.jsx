import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "./icons.jsx";

// Assigning the member access keeps ESLint (no react plugin) aware `motion` is used.
const MotionDiv = motion.div;

/**
 * Premium interactive Before/After comparison card.
 *
 * Uses Pointer Events for a single drag code-path across mouse, touch and pen,
 * so it works smoothly on desktop, tablet and mobile. The "before" layer is
 * revealed with clip-path (no width math) so both images keep their exact
 * aspect ratio with no stretching.
 *
 * Props:
 *   before  - URL of the "before" image
 *   after   - URL of the "after" image
 *   alt     - accessible label base
 *   onActiveChange(active) - optional; fires true on drag start, false on end
 *             (used to pause a parent carousel while dragging on mobile)
 */
export default function TransformationComparisonCard({ before, after, alt = "client transformation", onActiveChange, featured = false, dragFromHandleOnly = false }) {
  const reduce = useReducedMotion();
  const frameRef = useRef(null);
  const draggingRef = useRef(false);
  const [pos, setPos] = useState(50);

  const setFromClientX = useCallback((clientX) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = (e) => {
    // In handle-only mode, only start comparing when the grab begins on the
    // handle — so a body-swipe can bubble up to navigate the carousel instead.
    if (dragFromHandleOnly && !(e.target.closest && e.target.closest(".ba-handle"))) return;
    draggingRef.current = true;
    onActiveChange?.(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    setFromClientX(e.clientX);
  };

  const endDrag = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    onActiveChange?.(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); setPos((p) => Math.max(0, p - 4)); }
    else if (e.key === "ArrowRight") { e.preventDefault(); setPos((p) => Math.min(100, p + 4)); }
  };

  return (
    <MotionDiv
      className={`ba-card ${featured ? "ba-card--featured" : ""}`}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="ba-frame"
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        role="slider"
        tabIndex={0}
        aria-label={`${alt}: drag to compare before and after`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
      >
        {/* base layer = after */}
        <img className="ba-img" src={after} alt={`${alt} — after`} loading="lazy" draggable="false" />
        {/* revealed layer = before (clipped from the right) */}
        <div className="ba-before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img className="ba-img" src={before} alt={`${alt} — before`} loading="lazy" draggable="false" />
        </div>

        <span className="ba-tag ba-tag-before">BEFORE</span>
        <span className="ba-tag ba-tag-after">AFTER</span>

        <div className="ba-divider" style={{ left: `${pos}%` }} aria-hidden="true">
          <span className="ba-handle"><Icon.Compare /></span>
        </div>
      </div>
    </MotionDiv>
  );
}
