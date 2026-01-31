import { motion, useReducedMotion } from "framer-motion";

export default function Section({ children, className = "", delay = 0, id = "" }) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.section
            id={id}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay }} // cubic-bezier for smooth reveal
            className={`py-20 relative ${className}`}
        >
            {children}
        </motion.section>
    );
}
