import { motion } from "framer-motion";
import useIsMobile from "../../hooks/useIsMobile";

export default function Section({ children, className = "", id = "" }) {
    const isMobile = useIsMobile();

    // DESKTOP: Render static section without animation
    if (!isMobile) {
        return (
            <section id={id} className={`py-16 md:py-20 relative ${className}`}>
                {children}
            </section>
        );
    }

    // MOBILE: Simple fade + up, triggers once
    return (
        <motion.section
            id={id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: 0,
            }}
            className={`py-12 relative snap-section ${className} gpu-accel`}
        >
            {children}
        </motion.section>
    );
}
