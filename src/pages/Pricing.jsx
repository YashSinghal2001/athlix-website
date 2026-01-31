import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import useIsMobile from "../hooks/useIsMobile";
import { IconArrowRight, IconCheckSmall, IconPlanChecklist, IconPlanCrown, IconPlanLayers } from "../components/illustrations/PremiumSvgs";

const BRAND_ACCENT = "#6366F1";
const BRAND_BORDER = "#1F2937";

export default function Pricing() {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const [hasEntered, setHasEntered] = useState(false);

    // Animation Logic
    const activeRingIndex = hoveredIndex !== null ? hoveredIndex : 1; // Default to 1 (Best Value) when no hover

    const getCardStyle = (index) => {
        const isCenter = index === 1;

        // Base hidden state
        if (!hasEntered) {
            return {
                opacity: 0,
                y: 24,
                scale: 1,
            };
        }

        // Mobile or Reduced Motion: Static state
        if (isMobile || prefersReducedMotion) {
            return {
                opacity: 1,
                y: 0,
                scale: 1,
                borderColor: isCenter ? BRAND_ACCENT : BRAND_BORDER,
                zIndex: isCenter ? 10 : 0,
            };
        }

        // Standard State (Calm & Neutral)
        const isActive = index === activeRingIndex;

        return {
            opacity: 1,
            y: 0,
            scale: 1,
            // Border syncs with active state (purple for active, neutral for others)
            borderColor: isActive ? BRAND_ACCENT : BRAND_BORDER,
            borderWidth: isActive ? "1.5px" : "1px", // Subtle weight increase for active
            boxShadow: "none",
            filter: "none",
            zIndex: isActive ? 10 : 0,
        };
    };

    const getTransition = (index) => {
        const isCenter = index === 1;
        const delay = !hasEntered ? (isCenter ? 0 : 0.2) : 0;
        return { duration: 0.45, ease: [0.25, 1, 0.5, 1], delay }; // Custom cubic-bezier
    };

    const plans = [
        {
            title: "Online Coaching",
            subtitle: "Coach-guided transformation",
            features: ["Personalized workout & diet", "Weekly check-ins", "Form reviews", "Lifestyle guidance"],
            ctaVariant: "secondary",
            Icon: IconPlanChecklist,
        },
        {
            title: "Trained by Junior Trainer",
            subtitle: "High support, structured system",
            features: ["Everything in Online Coaching", "Closer monitoring", "Faster adjustments", "Direct support escalation"],
            ctaVariant: "primary",
            Icon: IconPlanLayers,
        },
        {
            title: "Trained by Abhishek",
            subtitle: "Highest level of personalization",
            features: ["Direct 1-on-1 coaching", "Priority access", "Advanced customization", "Performance optimization"],
            ctaVariant: "secondary",
            Icon: IconPlanCrown,
        },
    ];

    return (
        <div className="px-4">
            <Section className="max-w-7xl mx-auto">
                {/* Heading */}
                <motion.div initial={{ opacity: 0, y: isMobile ? 10 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut" }}>
                    <h1 className="text-4xl md:text-5xl font-bold text-center">Coaching Plans & Investment</h1>
                    <p className="text-brand-muted text-center max-w-3xl mx-auto mt-6 text-lg">Choose the level of coaching that aligns with your goals, commitment, and desired level of support.</p>
                </motion.div>

                {/* Plans */}
                <div className="grid md:grid-cols-3 gap-8 mt-20 relative">
                    {/* Viewport detection for the grid */}
                    <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} onViewportEnter={() => setHasEntered(true)} />

                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className="relative group"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => setHoveredIndex(index)} // Mobile: Tap to activate highlight
                        >
                            <Card className={`flex flex-col h-full relative z-10 overflow-hidden ${index === 1 ? "bg-brand-surface" : ""}`} hoverEffect={false} animate={getCardStyle(index)} transition={getTransition(index)}>
                                <div className="mb-4">
                                    <plan.Icon className={`h-7 w-7 transition-colors duration-300 ${activeRingIndex === index ? "text-brand-accent" : "text-white/55"} group-hover:text-brand-accent/90`} />
                                </div>
                                <h2 className={`text-xl font-bold ${index === 1 ? "text-white" : ""}`}>{plan.title}</h2>
                                <p className="text-brand-muted mt-2">{plan.subtitle}</p>
                                <p className="text-3xl font-bold mt-6">6 / 12 Months</p>
                                <ul className="mt-6 space-y-3 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0.7, x: 0 }}
                                            animate={{
                                                opacity: hoveredIndex === index ? 1 : 0.7,
                                                x: hoveredIndex === index && !prefersReducedMotion && !isMobile ? 6 : 0, // Slide right slightly (cleaner than up)
                                            }}
                                            transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.05 }} // Staggered reveal
                                            className="text-brand-muted"
                                        >
                                            <span className="flex items-start gap-2">
                                                <IconCheckSmall className={`mt-[3px] h-4 w-4 ${activeRingIndex === index ? "text-brand-accent" : "text-white/30"}`} />
                                                <span>{feature}</span>
                                            </span>
                                        </motion.li>
                                    ))}
                                </ul>
                                <div className="mt-8 mb-2">
                                    <Button
                                        to="/apply"
                                        variant={plan.ctaVariant}
                                        className="w-full relative overflow-hidden group"
                                        // Synchronized Button Animation
                                        animate={{
                                            opacity: activeRingIndex === index ? 1 : 0.6, // Active ring determines opacity
                                            scale: 1,
                                            // Only the active card gets the purple button
                                            backgroundColor:
                                                activeRingIndex === index
                                                    ? "#4F46E5" // Premium Muted Purple (Active)
                                                    : "transparent", // Neutral background for inactive

                                            borderColor: activeRingIndex === index ? "transparent" : "rgba(255,255,255,0.2)", // Add border to inactive to maintain shape
                                            borderWidth: "1px",

                                            // Soft ambient shadow + Subtle inset border for polish - ONLY on active
                                            boxShadow: activeRingIndex === index ? "0 8px 25px -5px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.15)" : "none",

                                            // Ensure text contrast
                                            color: activeRingIndex === index ? "#ffffff" : "#9CA3AF", // White text on active, muted on inactive
                                            filter: "none",
                                        }}
                                        whileHover={
                                            !isMobile
                                                ? {
                                                      scale: 1,
                                                      backgroundColor: "#4338CA", // Slightly darker on direct button hover for tactile feel
                                                      borderColor: "transparent",
                                                      opacity: 1,
                                                      color: "#ffffff",
                                                  }
                                                : {}
                                        }
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }} // Smooth luxury feel
                                    >
                                        <span className="inline-flex items-center justify-center gap-2">
                                            <span>Apply Now</span>
                                            <span className="transform-gpu transition-transform duration-300 group-hover:translate-x-1">
                                                <IconArrowRight className="h-5 w-5" />
                                            </span>
                                        </span>
                                    </Button>
                                </div>
                                {/* Progressive Highlight System */}
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-border/30" /> {/* Baseline */}
                                {!isMobile && !prefersReducedMotion && activeRingIndex === index && (
                                    <motion.div
                                        layoutId="progressive-highlight"
                                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-accent z-20"
                                        transition={{
                                            duration: 0.45,
                                            ease: [0.25, 1, 0.5, 1],
                                        }}
                                    />
                                )}
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Note */}
                <motion.p className="text-gray-500 text-center mt-16 text-sm" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.5 }}>
                    All plans are fully customized. Pricing is discussed after application to ensure the right fit.
                </motion.p>
            </Section>
        </div>
    );
}
