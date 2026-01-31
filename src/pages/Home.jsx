import { motion, useReducedMotion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import useIsMobile from "../hooks/useIsMobile";
import { IconLongTerm, IconNoGimmicks, IconPersonalized, IconRebuildStrength, IconResetMetabolism, IconRiseGrowth, IconScienceBacked } from "../components/illustrations/PremiumSvgs";

export default function Home() {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();

    // 1. Hero Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: isMobile ? 0.05 : 0.1, // Faster stagger on mobile
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: prefersReducedMotion ? 0 : isMobile ? 10 : 16,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: isMobile ? 0.5 : 0.7,
                ease: isMobile ? "easeOut" : [0.215, 0.61, 0.355, 1], // easeOutCubic
            },
        },
    };

    // 3. Triple R Cards Animation
    const tripleRVariants = {
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : isMobile ? 10 : 12 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: isMobile ? 0.4 : 0.6,
                ease: "easeOut",
            },
        },
    };

    return (
        <div className="px-4">
            {/* HERO SECTION */}
            <motion.section initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto min-h-[80vh] flex flex-col justify-center relative overflow-hidden">
                <motion.h1 variants={itemVariants} className="relative z-10 text-4xl md:text-6xl font-bold leading-tight">
                    {isMobile ? (
                        <>
                            Break Free From <br />
                            <motion.span initial={{ color: "#9CA3AF" }} animate={{ color: "#FFFFFF" }} transition={{ delay: 0.8, duration: 0.5 }} className="text-white">
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
                                animate={{ color: "#FFFFFF" }}
                                transition={{ delay: 0.8, duration: 0.5 }} // Subtle highlight reveal
                                className="text-white"
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
                    <Button href="/apply">Apply for Coaching</Button>

                    <Button href="/success" variant="secondary">
                        See Transformations
                    </Button>
                </motion.div>
            </motion.section>

            {/* TRIPLE R METHOD */}
            <Section className="max-w-7xl mx-auto">
                <motion.h2 initial={{ opacity: 0, y: isMobile ? 10 : 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-bold text-center">
                    The Triple R Method
                </motion.h2>

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ staggerChildren: isMobile ? 0.1 : 0.15 }} className="grid md:grid-cols-3 gap-8 mt-6 md:mt-12">
                    {[
                        { title: "RESET", desc: "Restore metabolic balance, reduce inflammation, and prime your body for sustainable fat loss.", Icon: IconResetMetabolism },
                        { title: "REBUILD", desc: "Build strength, habits, and nutrition around your real lifestyle — not rigid plans.", Icon: IconRebuildStrength },
                        { title: "RISE", desc: "Achieve long-term energy, confidence, and independence with a sustainable system.", Icon: IconRiseGrowth },
                    ].map((card, i) => (
                        <motion.div key={i} variants={tripleRVariants}>
                            <Card
                                className="h-full border border-brand-border hover:border-brand-accent/40 transition-colors duration-300 group"
                                hoverEffect={false}
                                whileHover={!isMobile ? { y: -3 } : {}} // Micro lift only on desktop
                            >
                                <card.Icon className="h-7 w-7 text-white/60 group-hover:text-brand-accent transition-colors duration-300" />
                                <h3 className="text-xl font-bold">{card.title}</h3>
                                <p className="text-brand-muted mt-4 group-hover:text-white transition-colors duration-300">{card.desc}</p>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </Section>

            {/* WHY ATHLIX */}
            <Section className="max-w-7xl mx-auto border-t border-gray-800" delay={0.1}>
                <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-bold text-center">
                    Why Athlix Works
                </motion.h2>

                <div className="grid md:grid-cols-4 gap-8 mt-12 text-center">
                    {[
                        { title: "No Gimmicks", desc: "No pills, no crash diets, no false promises.", Icon: IconNoGimmicks },
                        { title: "Fully Personalized", desc: "Every plan is built around your body and lifestyle.", Icon: IconPersonalized },
                        { title: "Science-Backed", desc: "Decisions based on physiology, not trends.", Icon: IconScienceBacked },
                        { title: "Long-Term Results", desc: "Sustainable transformation, not temporary fixes.", Icon: IconLongTerm },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: isMobile ? i * 0.05 : i * 0.1, ease: "easeOut" }}
                            className="group p-4 rounded-lg hover:bg-brand-surface/30 transition-colors duration-300"
                        >
                            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 + (isMobile ? i * 0.05 : i * 0.1), ease: "easeOut" }} className="mx-auto mb-3 w-fit">
                                <item.Icon className="h-7 w-7 text-white/55 group-hover:text-brand-accent transition-colors duration-300" />
                            </motion.div>
                            <h4 className="font-semibold group-hover:text-brand-accent transition-colors duration-300">{item.title}</h4>
                            <p className="text-brand-muted mt-2 group-hover:text-gray-300 transition-colors duration-300">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* FINAL CTA */}
            <Section className="max-w-7xl mx-auto text-center" delay={0.15}>
                <motion.div initial={{ opacity: 0, scale: isMobile ? 0.95 : 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut" }}>
                    <h2 className="text-3xl md:text-4xl font-bold">Your Transformation Starts Here</h2>
                    <p className="text-brand-muted mt-4">Apply now and take the first step toward a stronger, leaner, healthier you.</p>

                    <div className="mt-8">
                        <Button to="/apply">Apply for Coaching</Button>
                    </div>
                </motion.div>
            </Section>
        </div>
    );
}
