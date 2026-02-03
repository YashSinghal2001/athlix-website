import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Section from "../ui/Section";
import useIsMobile from "../../hooks/useIsMobile";
import { IconArrowRight, IconCheckSmall, IconPlanChecklist, IconPlanCrown, IconPlanLayers } from "../illustrations/PremiumSvgs";

const BRAND_ACCENT = "#02ABFF";
const BRAND_BORDER = "#E5E7EB";
const WHATSAPP_LINK = "https://wa.me/919872028656";

export default function PricingSection({ id = "pricing", className = "" }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const [hasEntered, setHasEntered] = useState(false);

    // Default active = Online Coaching (index 0)
    const activeRingIndex = hoveredIndex !== null ? hoveredIndex : 0;

    // Mobile should never wait for viewport triggers
    useEffect(() => {
        if (isMobile) {
            setHasEntered(true);
        }
    }, [isMobile]);

    const getCardStyle = (index) => {
        const isHighlight = index === 0;

        // Mobile / Reduced Motion → static, always visible
        if (isMobile || prefersReducedMotion) {
            return {
                opacity: 1,
                y: 0,
                scale: 1,
                borderColor: isHighlight ? BRAND_ACCENT : BRAND_BORDER,
                borderWidth: isHighlight ? "1.5px" : "1px",
                zIndex: isHighlight ? 10 : 0,
            };
        }

        const isActive = index === activeRingIndex;

        return {
            opacity: 1,
            y: 0,
            scale: 1,
            borderColor: isActive ? BRAND_ACCENT : BRAND_BORDER,
            borderWidth: isActive ? "1.5px" : "1px",
            boxShadow: "none",
            zIndex: isActive ? 10 : 0,
        };
    };

    const getTransition = (index) => {
        const isHighlight = index === 0;
        const delay = !hasEntered ? (isHighlight ? 0 : 0.15) : 0;
        return {
            duration: 0.45,
            ease: [0.25, 1, 0.5, 1],
            delay,
        };
    };

    const plans = [
        {
            title: "Online Coaching",
            subtitle: "Coach-guided transformation",
            features: ["Personalized workout & diet", "Weekly check-ins", "Form reviews", "Lifestyle guidance"],
            ctaVariant: "secondary",
            Icon: IconPlanChecklist,
            priceContent: (
                <div className="mt-6">
                    <p className="text-xl font-bold">6 Month Plan – ₹1,20,000</p>
                    <p className="text-xl font-bold mt-1">12 Month Plan – ₹2,00,000</p>
                </div>
            ),
        },
        {
            title: "Trained by Abhishek",
            subtitle: "Highest level of personalization",
            features: ["Direct 1-on-1 coaching", "Priority access", "Advanced customization", "Performance optimization"],
            ctaVariant: "secondary",
            Icon: IconPlanCrown,
            soldOut: true,
            priceContent: <p className="text-3xl font-bold mt-6">6 / 12 Months</p>,
        },
    ];

    return (
        <section id={id} className={`relative w-full px-4 ${className}`}>
            <Section className="max-w-7xl mx-auto py-10 md:py-20">
                {/* Heading */}
                <motion.div initial={{ opacity: 0, y: isMobile ? 10 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut" }}>
                    <h1 className="text-4xl md:text-5xl font-bold text-center">Coaching Plans & Investment</h1>
                    <p className="text-brand-muted text-center max-w-3xl mx-auto mt-6 text-lg">Choose the level of coaching that aligns with your goals, commitment, and desired level of support.</p>
                </motion.div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8 mt-12 md:mt-20 relative min-h-[60vh] max-w-5xl mx-auto">
                    {/* Desktop-only viewport trigger */}
                    {!isMobile && <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} onViewportEnter={() => setHasEntered(true)} />}

                    {plans.map((plan, index) => {
                        const isActive = activeRingIndex === index;
                        const isSoldOut = plan.soldOut;

                        return (
                            <div
                                key={index}
                                className={`relative group ${isSoldOut ? "pointer-events-none cursor-not-allowed opacity-75 grayscale-[0.5]" : ""}`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => setHoveredIndex(index)} // Mobile tap highlight
                            >
                                <Card
                                    className={`flex flex-col h-full relative z-10 overflow-hidden ${index === 0 ? "bg-brand-surface" : ""}`}
                                    hoverEffect={false}
                                    animate={
                                        isSoldOut
                                            ? {
                                                  opacity: 0.75,
                                                  scale: 1,
                                                  y: 0,
                                                  borderColor: BRAND_BORDER,
                                                  borderWidth: "1px",
                                                  boxShadow: "none",
                                              }
                                            : getCardStyle(index)
                                    }
                                    transition={getTransition(index)}
                                >
                                    {/* Sold Out Overlay */}
                                    {plan.soldOut && (
                                        <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center">
                                            <div className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-lg transform -rotate-12 shadow-lg">SOLD OUT</div>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className="mb-4">
                                        <plan.Icon className={`h-7 w-7 transition-colors duration-300 ${isActive ? "text-brand-accent" : "text-brand-muted"}`} />
                                    </div>

                                    <h2 className="text-xl font-bold">{plan.title}</h2>
                                    <p className="text-brand-muted mt-2">{plan.subtitle}</p>

                                    {plan.priceContent}

                                    {/* Features */}
                                    <ul className="mt-6 space-y-3 flex-grow">
                                        {plan.features.map((feature, i) => (
                                            <motion.li
                                                key={i}
                                                animate={{
                                                    opacity: isActive ? 1 : 0.7,
                                                    x: isActive && !prefersReducedMotion && !isMobile ? 6 : 0,
                                                }}
                                                transition={{
                                                    duration: 0.4,
                                                    ease: "easeOut",
                                                    delay: i * 0.05,
                                                }}
                                                className="text-brand-muted"
                                            >
                                                <span className="flex items-start gap-2">
                                                    <IconCheckSmall className={`mt-[3px] h-4 w-4 ${isActive ? "text-brand-accent" : "text-brand-muted/30"}`} />
                                                    <span>{feature}</span>
                                                </span>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <div className="mt-8 mb-2 flex flex-col items-center">
                                        <Button
                                            href={plan.soldOut ? undefined : WHATSAPP_LINK}
                                            target={plan.soldOut ? undefined : "_blank"}
                                            rel={plan.soldOut ? undefined : "noopener noreferrer"}
                                            aria-label="Apply Now"
                                            variant={plan.ctaVariant}
                                            disabled={plan.soldOut}
                                            className={`w-full relative overflow-hidden group justify-center ${plan.soldOut ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed" : ""}`}
                                            animate={{
                                                opacity: plan.soldOut ? 1 : isActive ? 1 : 0.6,
                                                backgroundColor: plan.soldOut ? "#E5E7EB" : isActive ? "#02ABFF" : "transparent",
                                                borderColor: plan.soldOut ? "transparent" : isActive ? "transparent" : "rgba(0,0,0,0.1)",
                                                borderWidth: "1px",
                                                boxShadow: isActive && !plan.soldOut ? "0 8px 25px -5px rgba(2, 171, 255, 0.3)" : "none",
                                                color: plan.soldOut ? "#9CA3AF" : isActive ? "#ffffff" : "#6B7280",
                                            }}
                                            whileHover={
                                                !isMobile && !plan.soldOut
                                                    ? {
                                                          backgroundColor: "#0288CC",
                                                          opacity: 1,
                                                          color: "#ffffff",
                                                      }
                                                    : {}
                                            }
                                            whileTap={!plan.soldOut ? { scale: 0.98 } : {}}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            {plan.soldOut ? "Sold Out" : "Apply Now"}
                                        </Button>
                                    </div>

                                    {/* Bottom highlight */}
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-border/30" />
                                    {!isMobile && !prefersReducedMotion && isActive && (
                                        <motion.div
                                            layoutId="pricing-active-bar"
                                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-accent"
                                            transition={{
                                                duration: 0.45,
                                                ease: [0.25, 1, 0.5, 1],
                                            }}
                                        />
                                    )}
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </Section>
        </section>
    );
}
