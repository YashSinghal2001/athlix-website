import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import useIsMobile from "../hooks/useIsMobile";
import { ExperienceRingsVector, IconBadge, IconBook, IconCert, IconGlobe, IconInfinity, IconKettlebell, PhilosophyWaveVector } from "../components/illustrations/PremiumSvgs";

export default function About() {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const [isCredsHovered, setIsCredsHovered] = useState(false);
    const [isPhilHovered, setIsPhilHovered] = useState(false);

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

    const credentials = [
        "Certified Fitness Trainer – K11 Fitness Academy",
        "ACE Certified Personal Trainer (USA)",
        "Active IQ Level 3 Personal Training (UK)",
        "Diploma in Weight Management & Exercise Science",
        "Functional Training & Kettlebell Specialist",
        "Continuous education in nutrition, training & lifestyle design",
    ];

    const credentialIcons = [IconCert, IconBadge, IconGlobe, IconBook, IconKettlebell, IconInfinity];

    return (
        <div className="px-4">
            <Section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 md:py-20">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={containerVariants}>
                    {/* 1️⃣ Top Section (Full Width) */}
                    <motion.div variants={itemVariants} className="max-w-4xl relative">
                        <div className="hidden md:block pointer-events-none absolute -left-28 -top-24 w-[420px] text-white opacity-[0.06]">
                            <ExperienceRingsVector className="w-full h-auto" />
                        </div>

                        <div className="relative z-10">
                            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                18+ Years of Experience.
                                <br />
                                One Proven Method.
                            </h1>

                            <p className="text-gray-400 mt-6 text-lg leading-relaxed">
                                Over the last 18+ years, I've trained, studied, and mentored under the best in the fitness industry to build a science-driven, results-focused coaching system that has helped hundreds of people transform their health for good.
                            </p>
                        </div>
                    </motion.div>

                    {/* 2️⃣ Cards Section (Certificates + Philosophy) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 md:mt-16">
                        {/* Card 1: Credentials & Certifications */}
                        <motion.div variants={itemVariants} className="h-full" onHoverStart={() => setIsCredsHovered(true)} onHoverEnd={() => setIsCredsHovered(false)}>
                            <Card
                                className="h-full bg-brand-surface/50 border border-brand-border/50 rounded-xl p-6 lg:p-8 shadow-sm backdrop-blur-sm transition-all duration-300 group relative overflow-hidden"
                                hoverEffect={false}
                                whileHover={
                                    !isMobile
                                        ? {
                                              y: -2,
                                              borderColor: "rgba(99, 102, 241, 0.4)",
                                              backgroundColor: "rgba(17, 20, 26, 0.8)",
                                          }
                                        : {}
                                }
                            >
                                <div className="relative z-10">
                                    <h2 className="text-white font-semibold text-lg mb-4">Credentials & Certifications</h2>

                                    <ul className="space-y-3 text-gray-400 leading-relaxed">
                                        {credentials.map((cred, i) => {
                                            const Icon = credentialIcons[i % credentialIcons.length];

                                            return (
                                                <motion.li
                                                    key={i}
                                                    className="flex items-start gap-3"
                                                    animate={{
                                                        color: isCredsHovered ? "#E5E7EB" : "#9CA3AF",
                                                        x: isCredsHovered && !prefersReducedMotion && !isMobile ? 4 : 0,
                                                    }}
                                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                                >
                                                    <Icon className="mt-[2px] h-4 w-4 text-brand-muted/70 group-hover:text-brand-accent transition-colors duration-300" />
                                                    <span>{cred}</span>
                                                </motion.li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                {/* Subtle Gradient Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
                            </Card>
                        </motion.div>

                        {/* Card 2: Coaching Philosophy */}
                        <motion.div variants={itemVariants} className="h-full" onHoverStart={() => setIsPhilHovered(true)} onHoverEnd={() => setIsPhilHovered(false)}>
                            <Card
                                className="h-full bg-brand-surface/50 border border-brand-border/50 rounded-xl p-6 lg:p-8 shadow-sm backdrop-blur-sm transition-all duration-300 group relative overflow-hidden flex flex-col justify-center"
                                hoverEffect={false}
                                whileHover={
                                    !isMobile
                                        ? {
                                              y: -2,
                                              borderColor: "rgba(99, 102, 241, 0.4)",
                                              backgroundColor: "rgba(17, 20, 26, 0.8)",
                                          }
                                        : {}
                                }
                            >
                                <div className="relative z-10">
                                    <div className="relative mb-4">
                                        <div className="hidden sm:block pointer-events-none absolute -left-8 -top-4 w-[380px] text-white opacity-[0.06]">
                                            <PhilosophyWaveVector className="w-full h-auto" />
                                        </div>

                                        <div className="relative z-10 flex items-center gap-3">
                                            <h2 className="text-white font-semibold text-lg">Coaching Philosophy</h2>
                                            {/* Animated Accent Line */}
                                            <motion.div
                                                className="h-[1px] bg-brand-border flex-grow origin-left"
                                                animate={{
                                                    backgroundColor: isPhilHovered ? "#6366F1" : "#1F2937",
                                                    scaleX: isPhilHovered ? 1 : 0.5,
                                                }}
                                                transition={{ duration: 0.4 }}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                                        I don't believe in shortcuts, extreme diets, or temporary fixes. My goal is to help you understand your body, build sustainable habits, and become independent — so you can maintain results long after coaching ends.
                                    </p>
                                </div>
                                {/* Subtle Gradient Glow */}
                                <div className="absolute inset-0 bg-gradient-to-bl from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </Section>
        </div>
    );
}
