import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import useIsMobile from "../../hooks/useIsMobile";

export default function Card({ children, className = "", hoverEffect = true, depth = 20, ...props }) {
    const ref = useRef(null);
    const shouldReduceMotion = useReducedMotion();
    const isMobile = useIsMobile();

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 200, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 200, damping: 20 });

    // Max tilt ±5 degrees
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

    const handleMouseMove = (e) => {
        if (!hoverEffect || shouldReduceMotion || isMobile) return;

        // Disable on touch devices (simple check)
        if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;

        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    };

    const handleMouseLeave = () => {
        if (!hoverEffect) return;
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            className={`relative bg-brand-surface border border-brand-border rounded-lg p-6 ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                transformStyle: "preserve-3d",
                rotateX: hoverEffect && !isMobile ? rotateX : 0,
                rotateY: hoverEffect && !isMobile ? rotateY : 0,
            }}
            whileHover={
                hoverEffect && !isMobile
                    ? {
                          y: -5,
                          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                      }
                    : {}
            }
            whileTap={
                isMobile
                    ? {
                          scale: 0.98,
                          filter: "brightness(0.95)",
                      }
                    : {}
            }
            transition={isMobile ? { duration: 0.08, ease: "easeOut" } : { type: "spring", stiffness: 300, damping: 25 }}
            {...props}
        >
            <div style={{ transform: `translateZ(${isMobile ? 0 : depth}px)` }}>{children}</div>
        </motion.div>
    );
}
