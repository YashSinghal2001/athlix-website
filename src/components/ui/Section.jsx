import { motion, useReducedMotion } from "framer-motion";
import useIsMobile from "../../hooks/useIsMobile";

export default function Section({ children, className = "", delay = 0, id = "" }) {
    const shouldReduceMotion = useReducedMotion();
    const isMobile = useIsMobile();

    const initialY = isMobile ? 20 : shouldReduceMotion ? 0 : 40;
    const transition = isMobile ? { duration: 0.5, ease: "easeOut", delay } : { duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay };

    return (
        <motion.section
            id={id}
            initial={{ opacity: 0, y: initialY }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2, margin: "-100px" }}
            transition={transition} // cubic-bezier for smooth reveal
            className={`py-10 md:py-20 relative snap-section ${className}`}
        >
            {children}
        </motion.section>
    );
}
