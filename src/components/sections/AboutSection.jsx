import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import Section from "../ui/Section";
import Card from "../ui/Card";
import useIsMobile from "../../hooks/useIsMobile";
import { ExperienceRingsVector, IconBadge, IconBook, IconCert, IconGlobe, IconInfinity, IconKettlebell, PhilosophyWaveVector } from "../illustrations/PremiumSvgs";

export default function AboutSection({ id = "about", className = "" }) {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const [isCredsHovered, setIsCredsHovered] = useState(false); // Used for future hover effects or tracking
    console.log(isCredsHovered); // Suppress linter error until used

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: isMobile ? 0.08 : 0.15,
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
                duration: isMobile ? 0.3 : 0.4,
                ease: [0.4, 0, 0.2, 1], // ease-out-quad
            },
        },
    };

    // Organized by Year - Latest first
    const credentials = [
        {
            year: "2025",
            items: ["ENU level 1 (Sept 2025)"],
        },
        {
            year: "2022",
            items: ["Team Boss (Harry Sandhu) – 5-Day Workshop on Contest Prep, Bodybuilding & PEDs (2022)"],
        },
        {
            year: "2021",
            items: ["All India Council for Vocational & Paramedical Science – Diploma in Fitness Physical Therapist (Aug 2021)", "JLO Fitness Institute of India – Level 5 Diploma in Weight Management & Exercise Specialist (Aug 2021)"],
        },
        {
            year: "2018",
            items: ["Active IQ (UK) – Level 3 Certificate in Personal Training (Aug 2018)"],
        },
        {
            year: "2016",
            items: ["ACE Continuing Education – IFT Model: Personal Training Program Design (Nov 2016)", "American Council on Exercise (ACE) – Certified Personal Trainer (2016)"],
        },
        {
            year: "2015",
            items: ["EKFA Asia – Certified Kettlebell Instructor (Level 1) & Functional Training (Apr 2015)", "Fitness Matters Pvt. Ltd. – Certified Personal Trainer (Feb 2015)"],
        },
        {
            year: "2013",
            items: ["K11 Fitness Academy – Certified Fitness Trainer (Oct 2013)"],
        },
    ];

    return (
        <section id={id} className={`px-4 ${className}`}>
            <Section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 md:py-20">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={containerVariants}>
                    {/* 1️⃣ Top Section (Full Width) */}
                    <motion.div variants={itemVariants} className="max-w-4xl relative">
                        <div className="hidden md:block pointer-events-none absolute -left-28 -top-24 w-[420px] text-brand-text opacity-[0.03]">
                            <ExperienceRingsVector className="w-full h-auto" />
                        </div>

                        <div className="relative z-10">
                            <h1 className="text-4xl md:text-5xl font-bold text-brand-text leading-tight">
                                18+ Years of Experience.
                                <br />
                                One Proven Method.
                            </h1>

                            <div className="hidden md:block">
                                <p className="text-brand-muted mt-6 text-lg leading-relaxed">
                                    Over the last 18+ years, I've trained, studied, and mentored under the best in the fitness industry to build a science-driven, results-focused coaching system that has helped hundreds of people transform their health for good.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2️⃣ Cards Section (Certificates ONLY) */}
                    <div className="mt-8 md:mt-16">
                        {/* Card: Credentials & Certifications */}
                        <motion.div variants={itemVariants} className="h-full" onHoverStart={() => setIsCredsHovered(true)} onHoverEnd={() => setIsCredsHovered(false)}>
                            <Card
                                className="h-full bg-brand-surface border border-brand-border rounded-xl p-6 lg:p-8 shadow-sm transition-all duration-300 group relative overflow-hidden"
                                hoverEffect={false}
                                whileHover={
                                    !isMobile
                                        ? {
                                              y: -2,
                                              borderColor: "rgba(2, 171, 255, 0.4)",
                                              backgroundColor: "#F9FAFB",
                                          }
                                        : {}
                                }
                            >
                                <div className="relative z-10">
                                    <h2 className="text-brand-text font-semibold text-lg mb-6">Credentials & Certifications</h2>

                                    <div className="space-y-6">
                                        {credentials.map((group, i) => (
                                            <div key={i} className="relative">
                                                <h3 className="text-brand-accent font-bold text-sm mb-2">{group.year}</h3>
                                                <ul className="space-y-2 text-brand-muted leading-relaxed">
                                                    {group.items.map((item, j) => (
                                                        <li key={j} className="flex items-start gap-3 text-sm md:text-base">
                                                            <IconCert className="mt-[3px] h-4 w-4 text-brand-muted/70 group-hover:text-brand-accent transition-colors duration-300 flex-shrink-0" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Subtle Gradient Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </Section>
        </section>
    );
}
