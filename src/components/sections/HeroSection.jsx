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
        <section id={id} className={`hero-section px-4 scroll-mt-24 ${className}`}>
            <motion.div initial={isMobile ? "hidden" : "visible"} animate="visible" variants={containerVariants} className="max-w-7xl mx-auto pt-16 pb-12 md:py-0 flex flex-col-reverse md:flex-row items-center relative gpu-accel gap-12" style={{ minHeight: isMobile ? "100svh" : "100vh" }}>
                {/* Left Column: Content */}
                <div className="flex-1 relative z-10">
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold leading-tight">
                        Break Free From <span className="text-brand-accent">Stubborn Weight Gain</span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="hidden md:block text-brand-muted mt-6 text-lg max-w-2xl text-justify md:text-left">
                        You can finally break free from stubborn weight gain, rebuild your energy, and get back the body and confidence you deserve with my 90-Day Lean Body Method, trusted by hundreds and proven to deliver real, Lasting Results.
                    </motion.p>

                    <motion.p variants={itemVariants} className="hidden md:block text-brand-muted mt-4 text-lg max-w-2xl font-medium text-justify md:text-left">
                        No gimmicks. No pills. No crash diets. Just science backed transformation.
                    </motion.p>

                    <motion.p variants={itemVariants} className="text-brand-text mt-6 text-xl font-bold">
                        Powered by Abhishek. Vk
                    </motion.p>

                    <motion.div variants={itemVariants} className="mt-8 flex flex-nowrap md:flex-wrap gap-2 md:gap-4">
                        <Button href="/success" variant="secondary">
                            Transition
                        </Button>

                        <Button href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
                            Apply Now
                        </Button>
                    </motion.div>
                </div>

                {/* Right Column: Image */}
                <motion.div variants={itemVariants} className="flex-1 relative z-10 flex justify-center md:justify-end w-full min-h-[320px]">
                    <img src="/Coach.png" alt="Coach Abhishek" className="w-auto h-auto max-w-full object-contain relative aspect-[3/4] md:aspect-auto min-h-[300px]" style={{ maxHeight: "520px" }} />
                </motion.div>
            </motion.div>
        </section>
    );
}
