import { motion, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";
import useIsMobile from "../../hooks/useIsMobile";

const WHATSAPP_LINK = "https://wa.me/919872028656";

export default function HeroSection({ id = "hero", className = "" }) {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();

    // 1. Hero Animation Variants
    // Disable stagger on desktop to prevent scroll blocking
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: isMobile ? 0.05 : 0, // Only stagger on mobile
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: prefersReducedMotion ? 0 : isMobile ? 10 : 0, // No Y movement on desktop
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: isMobile ? 0.5 : 0, // Instant on desktop
                ease: "easeOut",
            },
        },
    };

    return (
        <section id={id} className={`px-4 ${className}`}>
            <motion.div initial={isMobile ? "hidden" : "visible"} animate="visible" variants={containerVariants} className="max-w-7xl mx-auto min-h-[80vh] flex flex-col justify-center relative overflow-hidden gpu-accel">
                <motion.h1 variants={itemVariants} className="relative z-10 text-4xl md:text-6xl font-bold leading-tight">
                    {isMobile ? (
                        <>
                            Break Free From <br />
                            <motion.span initial={{ color: "#9CA3AF" }} animate={{ color: "#02ABFF" }} transition={{ delay: 0.8, duration: 0.5 }} className="text-brand-accent">
                                Stubborn Fat.
                            </motion.span>
                            <br />
                            <motion.span variants={itemVariants} className="inline-block mt-2 text-3xl">
                                Reclaim Confidence.
                            </motion.span>
                        </>
                    ) : (
                        <>
                            Break Free From{" "}
                            <motion.span
                                initial={{ color: "#9CA3AF" }}
                                animate={{ color: "#02ABFF" }}
                                transition={{ delay: 0.8, duration: 0.5 }} // Subtle highlight reveal
                                className="text-brand-accent"
                            >
                                Stubborn Weight Gain
                            </motion.span>
                            <br />
                            <motion.span variants={itemVariants} className="inline-block mt-2">
                                Rebuild Your Energy. Reclaim Your Confidence.
                            </motion.span>
                        </>
                    )}
                </motion.h1>

                <motion.p variants={itemVariants} className="relative z-10 text-brand-muted mt-6 text-lg max-w-2xl">
                    {isMobile ? "A science-backed 90-Day Method for real results — no gimmicks or crash diets." : "A science-backed 90-Day Lean Body Method trusted by hundreds to deliver real, lasting transformation — without gimmicks, pills, or crash diets."}
                </motion.p>

                <motion.div variants={itemVariants} className="relative z-10 mt-8 flex flex-wrap gap-4">
                    <Button href="/success" variant="secondary">
                        See Transformations
                    </Button>

                    <Button href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
                        Apply on WhatsApp
                    </Button>
                </motion.div>
            </motion.div>
        </section>
    );
}
