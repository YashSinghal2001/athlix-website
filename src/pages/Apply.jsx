import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import Section from "../components/ui/Section";
import useIsMobile from "../hooks/useIsMobile";
import { FormAbstractLines, IconArrowRight, IconCalendarClock, IconProfileId, IconTargetFlag } from "../components/illustrations/PremiumSvgs";

const PaperInput = ({ label, type = "text", placeholder, className = "" }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative group ${className}`}>
            {label && <label className="block text-sm font-medium text-brand-muted mb-1 group-focus-within:text-brand-accent transition-colors duration-300">{label}</label>}
            <div className="relative">
                <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full bg-transparent border-b border-brand-border py-3 text-brand-text placeholder-gray-400 focus:outline-none transition-colors duration-300 caret-brand-accent"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{ textShadow: isFocused ? "0 0 8px rgba(2, 171, 255, 0.3)" : "none" }} // Subtle text glow
                />
                {/* Animated Bottom Line */}
                <motion.div className="absolute bottom-0 left-0 h-[1px] bg-brand-accent w-full" initial={{ scaleX: 0 }} animate={{ scaleX: isFocused ? 1 : 0 }} transition={{ duration: 0.4, ease: "easeOut" }} style={{ originX: 0 }} />
            </div>
        </div>
    );
};

const PaperTextarea = ({ label, placeholder, rows = 4, className = "" }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative group ${className}`}>
            {label && <label className="block text-sm font-medium text-brand-muted mb-1 group-focus-within:text-brand-accent transition-colors duration-300">{label}</label>}
            <div className="relative">
                <textarea
                    rows={rows}
                    placeholder={placeholder}
                    className="w-full bg-transparent border-b border-gray-800 py-3 text-brand-text placeholder-gray-600 focus:outline-none transition-colors duration-300 caret-brand-accent resize-none"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{ textShadow: isFocused ? "0 0 8px rgba(99,102,241,0.3)" : "none" }}
                />
                {/* Animated Bottom Line */}
                <motion.div className="absolute bottom-0 left-0 h-[1px] bg-brand-accent w-full" initial={{ scaleX: 0 }} animate={{ scaleX: isFocused ? 1 : 0 }} transition={{ duration: 0.4, ease: "easeOut" }} style={{ originX: 0 }} />
            </div>
        </div>
    );
};

const FormSection = ({ title, Icon, children }) => {
    return (
        <div className="group space-y-6">
            <div className="flex items-center gap-3">
                {Icon && <Icon className="h-5 w-5 text-brand-muted/70 group-focus-within:text-brand-accent transform-gpu group-focus-within:-translate-y-0.5 transition-all duration-300" />}
                <h2 className="text-xl font-bold text-brand-muted group-focus-within:text-white transition-colors duration-500 ease-out">{title}</h2>
            </div>
            {children}
        </div>
    );
};

export default function Apply() {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const nextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    };

    return (
        <div className="px-4">
            <Section className="max-w-3xl mx-auto">
                {/* Heading */}
                <motion.div initial={{ opacity: 0, y: isMobile ? 10 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                    <h1 className="text-4xl md:text-5xl font-bold text-center">Apply for Coaching</h1>
                    <p className="text-brand-muted text-center mt-6 text-lg">This application helps us understand your goals, lifestyle, and expectations so we can determine if this coaching is the right fit for you.</p>
                </motion.div>

                {/* Form Container */}
                <motion.div
                    className="mt-8 md:mt-16 bg-brand-surface p-8 md:p-12 rounded-xl shadow-2xl relative overflow-hidden"
                    initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    style={{
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)", // Deep shadow + subtle border
                    }}
                >
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-28 -top-24 w-[420px] text-brand-text opacity-[0.03]"
                        animate={prefersReducedMotion || isMobile ? undefined : { y: [0, -6, 0], x: [0, 4, 0] }}
                        transition={prefersReducedMotion || isMobile ? undefined : { duration: 28, ease: "easeInOut", repeat: Infinity }}
                    >
                        <FormAbstractLines className="w-full h-auto" />
                    </motion.div>

                    {isMobile ? (
                        // Mobile Stepper Form
                        <div className="relative">
                            {/* Progress Indicator */}
                            <div className="flex justify-center gap-2 mb-8">
                                {[...Array(totalSteps)].map((_, i) => (
                                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i + 1 === currentStep ? "w-8 bg-brand-accent" : "w-2 bg-gray-300"}`} />
                                ))}
                            </div>

                            <form onSubmit={(e) => e.preventDefault()}>
                                <AnimatePresence mode="wait">
                                    {currentStep === 1 && (
                                        <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                            <FormSection title="Basic Information" Icon={IconProfileId}>
                                                <div className="space-y-6">
                                                    <PaperInput placeholder="Full Name" />
                                                    <PaperInput type="email" placeholder="Email Address" />
                                                </div>
                                            </FormSection>
                                        </motion.div>
                                    )}

                                    {currentStep === 2 && (
                                        <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                            <FormSection title="Your Goals" Icon={IconTargetFlag}>
                                                <PaperTextarea placeholder="Describe your fitness goals... What do you want to achieve in the next 6 months?" />
                                            </FormSection>
                                        </motion.div>
                                    )}

                                    {currentStep === 3 && (
                                        <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                            <FormSection title="Lifestyle & Availability" Icon={IconCalendarClock}>
                                                <PaperTextarea placeholder="Tell us about your daily routine, work schedule, and stress levels..." />
                                            </FormSection>
                                        </motion.div>
                                    )}

                                    {currentStep === 4 && (
                                        <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                            <FormSection title="Review & Submit" Icon={IconProfileId}>
                                                <div className="border-l-2 border-brand-muted/30 pl-6 py-2 mb-6">
                                                    <p className="text-brand-muted text-sm italic">By submitting this application, you confirm that all information provided is accurate and that you understand this is not medical advice. Final acceptance is subject to review.</p>
                                                </div>
                                                <Button type="submit" className="w-full text-lg py-4 group">
                                                    <span className="inline-flex items-center justify-center gap-2">
                                                        <span>Submit Application</span>
                                                        <span className="transform-gpu transition-transform duration-300 group-hover:translate-x-1">
                                                            <IconArrowRight className="h-5 w-5 text-brand-muted/80 group-hover:text-brand-accent transition-colors duration-300" />
                                                        </span>
                                                    </span>
                                                </Button>
                                            </FormSection>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8">
                                    {currentStep > 1 && (
                                        <button type="button" onClick={prevStep} className="px-4 py-2 text-brand-muted hover:text-white transition-colors">
                                            Back
                                        </button>
                                    )}
                                    {currentStep < totalSteps && (
                                        <div className="ml-auto">
                                            <Button type="button" onClick={nextStep} className="px-6 py-2">
                                                Next
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    ) : (
                        // Desktop Full Form
                        <form className="space-y-12">
                            {/* Basic Info */}
                            <FormSection title="Basic Information" Icon={IconProfileId}>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <PaperInput placeholder="Full Name" />
                                    <PaperInput type="email" placeholder="Email Address" />
                                </div>
                            </FormSection>

                            {/* Goals */}
                            <FormSection title="Your Goals" Icon={IconTargetFlag}>
                                <PaperTextarea placeholder="Describe your fitness goals... What do you want to achieve in the next 6 months?" />
                            </FormSection>

                            {/* Lifestyle */}
                            <FormSection title="Lifestyle & Availability" Icon={IconCalendarClock}>
                                <PaperTextarea placeholder="Tell us about your daily routine, work schedule, and stress levels..." />
                            </FormSection>

                            {/* Disclaimer */}
                            <motion.div className="border-l-2 border-brand-muted/30 pl-6 py-2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                                <p className="text-brand-muted text-sm italic">By submitting this application, you confirm that all information provided is accurate and that you understand this is not medical advice. Final acceptance is subject to review.</p>
                            </motion.div>

                            {/* Submit */}
                            <div className="pt-4">
                                <Button type="submit" className="w-full text-lg py-4 group">
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <span>Submit Application</span>
                                        <span className="transform-gpu transition-transform duration-300 group-hover:translate-x-1">
                                            <IconArrowRight className="h-5 w-5 text-brand-muted/80 group-hover:text-brand-accent transition-colors duration-300" />
                                        </span>
                                    </span>
                                </Button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </Section>
        </div>
    );
}
