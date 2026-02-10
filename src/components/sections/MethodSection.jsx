import { motion, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Section from "../ui/Section";
import useIsMobile from "../../hooks/useIsMobile";
import { IconRebuildStrength, IconResetMetabolism, IconRiseGrowth } from "../illustrations/PremiumSvgs";

export default function MethodSection({ id = "method", className = "" }) {
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
        <section id={id} className={`method-section gpu-accel px-4 ${className}`}>
            <Section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 md:py-20">
                {/* 1️⃣ Top Section (Full Width) */}
                <motion.div initial={{ opacity: 0, y: isMobile ? 10 : 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, ease: "easeOut" }} className="max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-brand-text leading-tight">90-DAY LEAN BODY METHOD</h1>
                    <p className="hidden md:block text-brand-muted mt-6 text-lg leading-relaxed">Break free from stubborn weight gain, rebuild energy, and regain confidence with a science-backed transformation method trusted by hundreds.</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-brand-accent mt-8">TRIPLE R METHOD</h2>
                </motion.div>

                {/* 2️⃣ Cards Section (Grid Layout) */}
                <motion.div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
                    {/* RESET */}
                    <MethodCard
                        Icon={IconResetMetabolism}
                        title="RESET – YOUR METABOLISM"
                        description={
                            <>
                                <span className="hidden md:block">Restore metabolic balance, reduce inflammation, and prime your body for fat loss.</span>
                                <span className="block md:hidden">Restore metabolic balance and prime your body for fat loss.</span>
                            </>
                        }
                        variants={itemVariants}
                    />

                    {/* REBUILD */}
                    <MethodCard
                        Icon={IconRebuildStrength}
                        title="REBUILD – STRENGTH & HABITS"
                        description={
                            <>
                                <span className="hidden md:block">Build strength and sustainable habits using structured training, personalized nutrition, and realistic lifestyle upgrades.</span>
                                <span className="block md:hidden">Build strength using structured training and personalized nutrition.</span>
                            </>
                        }
                        variants={itemVariants}
                    />

                    {/* RISE */}
                    <MethodCard
                        Icon={IconRiseGrowth}
                        title="RISE – WITH ENERGY & CONFIDENCE"
                        description={
                            <>
                                <span className="hidden md:block">Renew your energy and confidence to maintain long-term results and true independence.</span>
                                <span className="block md:hidden">Renew your energy to maintain long-term results.</span>
                            </>
                        }
                        variants={itemVariants}
                    />
                </motion.div>

                {/* Bottom Highlight Text */}
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.5 }} className="hidden md:block mt-10 md:mt-12 max-w-4xl">
                    <p className="text-brand-text text-lg md:text-xl font-medium leading-relaxed">This is the launchpad to long-term success. You’re not just leaner — you’re energized, confident, and in full control of your health.</p>
                </motion.div>
            </Section>
        </section>
    );
}

function MethodCard({ title, description, variants, Icon }) {
    const isMobile = useIsMobile();
    return (
        <motion.div variants={variants} className="h-full">
            <Card
                className="h-full bg-brand-surface border border-brand-border rounded-xl p-6 lg:p-8 shadow-sm transition-all duration-300 group"
                hoverEffect={false}
                whileHover={
                    !isMobile
                        ? {
                              y: -6, // Lift effect
                              boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.05)", // Soft shadow
                          }
                        : {}
                }
            >
                <div className="relative z-10">
                    {Icon && <Icon className="h-7 w-7 text-brand-muted/70 group-hover:text-brand-accent transition-colors duration-300" />}
                    <h2 className="text-brand-text font-semibold text-lg mb-3 uppercase tracking-wider group-hover:text-brand-accent transition-colors duration-300">{title}</h2>
                    <p className="text-brand-muted leading-relaxed group-hover:text-brand-text transition-colors duration-300">{description}</p>
                </div>
                {/* Removed blue hover gradient */}
            </Card>
        </motion.div>
    );
}
