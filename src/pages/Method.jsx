import { motion, useReducedMotion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import useIsMobile from "../hooks/useIsMobile";
import { IconRebuildStrength, IconResetMetabolism, IconRiseGrowth } from "../components/illustrations/PremiumSvgs";

export default function Method() {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();

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
            y: prefersReducedMotion ? 0 : isMobile ? 10 : 10,
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

    return (
        <div className="px-4">
            <Section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
                {/* 1️⃣ Top Section (Full Width) */}
                <motion.div initial={{ opacity: 0, y: isMobile ? 10 : 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, ease: "easeOut" }} className="max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">The Triple R Method</h1>

                    <p className="text-gray-400 mt-6 text-lg leading-relaxed">The Triple R Method is a science-backed system designed to help you break free from stubborn weight gain, rebuild your strength and habits, and rise with long-term energy and confidence.</p>
                </motion.div>

                {/* 2️⃣ Cards Section (Grid Layout) */}
                <motion.div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
                    {/* RESET */}
                    <MethodCard Icon={IconResetMetabolism} title="RESET" description="We start by restoring metabolic balance. This phase focuses on reducing inflammation, improving digestion, regulating stress, and preparing your body for efficient fat loss." variants={itemVariants} />

                    {/* REBUILD */}
                    <MethodCard Icon={IconRebuildStrength} title="REBUILD" description="Once your system is balanced, we rebuild strength, nutrition, and daily habits using structured training, personalized diet strategies, and realistic lifestyle upgrades." variants={itemVariants} />

                    {/* RISE */}
                    <MethodCard Icon={IconRiseGrowth} title="RISE" description="The final phase is about independence. You gain clarity, confidence, and control — so you can maintain results, energy, and performance long after coaching ends." variants={itemVariants} />
                </motion.div>
            </Section>
        </div>
    );
}

function MethodCard({ title, description, variants, Icon }) {
    const isMobile = useIsMobile();
    return (
        <motion.div variants={variants} className="h-full">
            <Card
                className="h-full bg-brand-surface/50 border border-brand-border/50 rounded-xl p-6 lg:p-8 shadow-sm backdrop-blur-sm transition-all duration-300 group"
                hoverEffect={false}
                whileHover={
                    !isMobile
                        ? {
                              y: -3,
                              borderColor: "rgba(99, 102, 241, 0.4)", // Muted accent border
                              backgroundColor: "rgba(17, 20, 26, 0.8)", // Slightly more opaque
                          }
                        : {}
                }
            >
                <div className="relative z-10">
                    {Icon && <Icon className="h-7 w-7 text-white/60 group-hover:text-brand-accent transition-colors duration-300" />}
                    <h2 className="text-white font-semibold text-lg mb-3 uppercase tracking-wider group-hover:text-brand-accent transition-colors duration-300">{title}</h2>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{description}</p>
                </div>
                {/* Subtle Gradient Glow (Visible on Hover) */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
            </Card>
        </motion.div>
    );
}
