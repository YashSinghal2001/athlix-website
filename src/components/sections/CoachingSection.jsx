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
        "A fully customized training program designed around your goals, fitness level, equipment, and schedule.",
        "A structured cardio plan to enhance fat loss, endurance, and heart health.",
        "A personalized diet plan built around your food preferences, health markers, and daily routine. A flexible food substitution guide so you never feel restricted.",
        "A smart lifestyle plan that optimizes recovery, sleep, and stress management because real fitness goes beyond workouts.",
        "Access to exclusive client-only resources and guides that help you sustain results long-term.",
        "Supplementation Protocols. Note: I don’t generally recommend any supplements if they are not required. I only recommend them if they are absolutely necessary or worth it.",
        "Weekly Progress Check-In. I will analyze your progress on a weekly basis and make changes to diet, training or cardio, etc. if they are needed.",
        "Weekly Exercise Form Review, so you can be independent on the gym floor with the exercise execution.",
        "You wouldn’t depend on someone else to show you how to perform certain exercises every time + you get my direct analysis on performing it the right way.",
        "24/7 Access to me through WhatsApp and Emails.",
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
                            <Card className="h-full flex flex-col">
                                <h2 className="text-xl font-bold uppercase">ONLINE COACHING PROGRAMME</h2>
                                <h3 className="text-sm font-bold mt-2 mb-6 text-brand-muted uppercase">THE TRANSFORMATION PLAN WILL INCLUDE:</h3>

                                <ul className="mt-6 space-y-3 text-brand-muted flex-grow">
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
                                            <span className="mr-2 text-brand-accent flex-shrink-0">•</span>
                                            <span>{feature}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                                <div className="mt-8 pt-6 border-t border-brand-border/50">
                                    <p className="text-brand-accent font-bold uppercase tracking-wide text-sm">AND BONUS!! CHECK THE NEXT PAGE</p>
                                </div>
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
                                    <h2 className="text-xl font-bold uppercase">ONLINE COACHING PROGRAMME</h2>
                                    <h3 className="text-sm font-bold mt-2 mb-6 text-brand-muted uppercase">ACCESS TO THE PRIVATE COACHING APP</h3>

                                    <p className="text-brand-muted leading-relaxed">Once you’re in, you’ll get full access to my private coaching app — your personal command center for everything.</p>

                                    <p className="font-bold mt-6 mb-3">Inside, you’ll find:</p>
                                    <ul className="space-y-2 text-brand-muted">
                                        <li className="flex items-start">
                                            <span className="mr-2 text-brand-accent">•</span>Daily Lifestyle & habit tracker
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-brand-accent">•</span>Body measurements
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-brand-accent">•</span>Progress photo uploads
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-brand-accent">•</span>Your complete diet plan
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-brand-accent">•</span>Your customized workout program
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-brand-accent">•</span>Supplement plan
                                        </li>
                                    </ul>

                                    <p className="text-brand-muted mt-6 leading-relaxed">This app keeps everything in one place — no messy Excel sheets, no Google links.</p>

                                    <p className="text-brand-muted mt-4 leading-relaxed">It saves time, eliminates confusion, and allows me to track your progress in real-time, make faster adjustments, and keep us both accountable.</p>

                                    <div className="mt-8 pt-6 border-t border-brand-border/50">
                                        <p className="text-brand-accent font-bold uppercase tracking-wide text-sm leading-relaxed">THIS ISN’T BASIC ONLINE COACHING THIS IS NEXT-LEVEL COACHING, BUILT FOR SERIOUS TRANSFORMATION.</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </Section>
        </section>
    );
}
