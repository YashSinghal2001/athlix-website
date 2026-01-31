import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import useIsMobile from "../hooks/useIsMobile";
import {
  IconArrowRight,
  IconCheckSmall,
  IconPlanChecklist,
  IconPlanCrown,
  IconPlanLayers,
} from "../components/illustrations/PremiumSvgs";

const BRAND_ACCENT = "#6366F1";
const BRAND_BORDER = "#1F2937";

export default function Pricing() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [hasEntered, setHasEntered] = useState(false);

  // Default active = Best Value (center)
  const activeRingIndex = hoveredIndex !== null ? hoveredIndex : 1;

  // Mobile should never wait for viewport triggers
  useEffect(() => {
    if (isMobile) {
      setHasEntered(true);
    }
  }, [isMobile]);

  const getCardStyle = (index) => {
    const isCenter = index === 1;

    // Mobile / Reduced Motion → static, always visible
    if (isMobile || prefersReducedMotion) {
      return {
        opacity: 1,
        y: 0,
        scale: 1,
        borderColor: isCenter ? BRAND_ACCENT : BRAND_BORDER,
        borderWidth: isCenter ? "1.5px" : "1px",
        zIndex: isCenter ? 10 : 0,
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
    const isCenter = index === 1;
    const delay = !hasEntered ? (isCenter ? 0 : 0.15) : 0;
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
      features: [
        "Personalized workout & diet",
        "Weekly check-ins",
        "Form reviews",
        "Lifestyle guidance",
      ],
      ctaVariant: "secondary",
      Icon: IconPlanChecklist,
    },
    {
      title: "Trained by Junior Trainer",
      subtitle: "High support, structured system",
      features: [
        "Everything in Online Coaching",
        "Closer monitoring",
        "Faster adjustments",
        "Direct support escalation",
      ],
      ctaVariant: "primary",
      Icon: IconPlanLayers,
    },
    {
      title: "Trained by Abhishek",
      subtitle: "Highest level of personalization",
      features: [
        "Direct 1-on-1 coaching",
        "Priority access",
        "Advanced customization",
        "Performance optimization",
      ],
      ctaVariant: "secondary",
      Icon: IconPlanCrown,
    },
  ];

  return (
    <section className="relative w-full min-h-[100svh] px-4">
      <Section className="max-w-7xl mx-auto py-10 md:py-20">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Coaching Plans & Investment
          </h1>
          <p className="text-brand-muted text-center max-w-3xl mx-auto mt-6 text-lg">
            Choose the level of coaching that aligns with your goals, commitment,
            and desired level of support.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-12 md:mt-20 relative min-h-[60vh]">
          {/* Desktop-only viewport trigger */}
          {!isMobile && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              onViewportEnter={() => setHasEntered(true)}
            />
          )}

          {plans.map((plan, index) => {
            const isActive = activeRingIndex === index;

            return (
              <div
                key={index}
                className="relative group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex(index)} // Mobile tap highlight
              >
                <Card
                  className={`flex flex-col h-full relative z-10 overflow-hidden ${
                    index === 1 ? "bg-brand-surface" : ""
                  }`}
                  hoverEffect={false}
                  animate={getCardStyle(index)}
                  transition={getTransition(index)}
                >
                  {/* Icon */}
                  <div className="mb-4">
                    <plan.Icon
                      className={`h-7 w-7 transition-colors duration-300 ${
                        isActive
                          ? "text-brand-accent"
                          : "text-white/55"
                      }`}
                    />
                  </div>

                  <h2 className="text-xl font-bold">{plan.title}</h2>
                  <p className="text-brand-muted mt-2">{plan.subtitle}</p>

                  <p className="text-3xl font-bold mt-6">6 / 12 Months</p>

                  {/* Features */}
                  <ul className="mt-6 space-y-3 flex-grow">
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        animate={{
                          opacity: isActive ? 1 : 0.7,
                          x:
                            isActive && !prefersReducedMotion && !isMobile
                              ? 6
                              : 0,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: "easeOut",
                          delay: i * 0.05,
                        }}
                        className="text-brand-muted"
                      >
                        <span className="flex items-start gap-2">
                          <IconCheckSmall
                            className={`mt-[3px] h-4 w-4 ${
                              isActive
                                ? "text-brand-accent"
                                : "text-white/30"
                            }`}
                          />
                          <span>{feature}</span>
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-8 mb-2">
                    <Button
                      to="/apply"
                      variant={plan.ctaVariant}
                      className="w-full relative overflow-hidden group justify-center"
                      animate={{
                        opacity: isActive ? 1 : 0.6,
                        backgroundColor: isActive
                          ? "#4F46E5"
                          : "transparent",
                        borderColor: isActive
                          ? "transparent"
                          : "rgba(255,255,255,0.2)",
                        borderWidth: "1px",
                        boxShadow: isActive
                          ? "0 8px 25px -5px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.15)"
                          : "none",
                        color: isActive ? "#ffffff" : "#9CA3AF",
                      }}
                      whileHover={
                        !isMobile
                          ? {
                              backgroundColor: "#4338CA",
                              opacity: 1,
                              color: "#ffffff",
                            }
                          : {}
                      }
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <span className="inline-flex items-center gap-2 justify-center">
                        <span>Apply Now</span>
                        <IconArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
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

        {/* Note */}
        <motion.p
          className="text-gray-500 text-center mt-8 md:mt-16 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          All plans are fully customized. Pricing is discussed after application
          to ensure the right fit.
        </motion.p>
      </Section>
    </section>
  );
}
