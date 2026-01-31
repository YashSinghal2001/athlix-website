import { motion, useReducedMotion } from "framer-motion";
import Card from "../ui/Card";
import Section from "../ui/Section";
import useIsMobile from "../../hooks/useIsMobile";
import { useState } from "react";
import { FitnessSystemVector } from "../illustrations/PremiumSvgs";

export default function CoachingSection({ id = "coaching", className = "" }) {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const [isLeftHovered, setIsLeftHovered] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: isMobile ? 0.08 : 0.12, // 120ms stagger
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: prefersReducedMotion ? 0 : isMobile ? 10 : 12,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: isMobile ? 0.3 : 0.4, // 400ms
                ease: "easeOut",
            },
        },
    };

    const features = [
        "Fully customized workout program",
        "Personalized diet plan based on your preferences",
        "Structured cardio & recovery plan",
        "Lifestyle & habit optimization guidance",
        "Weekly progress check-ins & plan updates",
        "Exercise form review & technique feedback",
        "24/7 access via WhatsApp & email",
    ];

    return (
        <section id={id} className={`px-4 ${className}`}>
            <Section className="max-w-7xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={containerVariants}>
                    {/* Heading */}
                    <motion.div variants={itemVariants}>
                        <h1 className="text-4xl md:text-5xl font-bold">Online Coaching Program</h1>
                        <p className="text-brand-muted mt-6 text-lg max-w-3xl">This isn't basic online coaching. This is a fully personalized, high-touch transformation system designed for long-term results.</p>
                    </motion.div>

                    {/* What You Get */}
                    <div className="mt-20 grid md:grid-cols-2 gap-12">
                        <motion.div variants={itemVariants} className="h-full" onHoverStart={() => setIsLeftHovered(true)} onHoverEnd={() => setIsLeftHovered(false)}>
                            <Card className="h-full">
                                <h2 className="text-xl font-bold">What's Included</h2>

                                <ul className="mt-6 space-y-3 text-brand-muted">
                                    {features.map((feature, i) => (
                                        <motion.li
                                            key={i}
                                            className="flex items-start"
                                            animate={{
                                                opacity: isLeftHovered ? 1 : 0.7,
                                                color: isLeftHovered ? "#111827" : "#6B7280",
                                                x: isLeftHovered && !prefersReducedMotion && !isMobile ? 4 : 0,
                                            }}
                                            transition={{
                                                duration: 0.3,
                                                delay: isLeftHovered ? i * 0.06 : 0, // 60ms stagger on hover
                                                ease: "easeOut",
                                            }}
                                        >
                                            <span className="mr-2 text-brand-accent">•</span>
                                            {feature}
                                        </motion.li>
                                    ))}
                                </ul>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants} className="h-full">
                            <Card className="h-full">
                                <motion.div
                                    aria-hidden="true"
                                    className="hidden md:block pointer-events-none absolute right-3 top-3 w-[240px] text-brand-text opacity-[0.03]"
                                    animate={prefersReducedMotion || isMobile ? undefined : { y: [0, -5, 0], x: [0, 3, 0] }}
                                    transition={prefersReducedMotion || isMobile ? undefined : { duration: 26, ease: "easeInOut", repeat: Infinity }}
                                >
                                    <FitnessSystemVector className="w-full h-auto" />
                                </motion.div>

                                <div className="relative z-10">
                                    <h2 className="text-xl font-bold">Private Coaching App</h2>

                                    <p className="text-brand-muted mt-4">Once enrolled, you'll get access to a private coaching app that keeps everything in one place — your workouts, diet, habits, progress tracking, and communication.</p>

                                    <p className="text-brand-muted mt-4">This allows faster adjustments, real-time accountability, and a smoother coaching experience without messy spreadsheets or multiple tools.</p>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </Section>
        </section>
    );
}
