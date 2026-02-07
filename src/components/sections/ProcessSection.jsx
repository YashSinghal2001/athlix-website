import { motion } from "framer-motion";
import { UserCheck, ClipboardList, Brain, LineChart, MessageCircle } from "lucide-react";
import Section from "../ui/Section";
import Card from "../ui/Card";
import useIsMobile from "../../hooks/useIsMobile";
import { OnboardingIllustration, QuestionnaireIllustration } from "../illustrations/PremiumSvgs";

const steps = [
    {
        id: 1,
        title: "ONBOARDING",
        description: "Once your payment is confirmed, I’ll begin crafting your personalized plan built from scratch, not templates. Within three days, you’ll receive your full setup, and we’ll connect for a quick call to align on every detail before your journey officially begins.",
        icon: UserCheck,
    },
    {
        id: 2,
        title: "QUESTIONNAIRE",
        description: "You’ll then fill a detailed client form that helps me understand your goals, health history, lifestyle, and preferences. Every plan is created around your real life — your schedule, your food, your stress patterns — so it’s something you can actually follow and sustain.",
        icon: ClipboardList,
    },
    {
        id: 3,
        title: "MORE ABOUT MY COACHING STYLE",
        description: (
            <ul className="space-y-3 mt-2">
                <li className="flex gap-3">
                    <span className="text-brand-accent">•</span>
                    <span>I don’t promote expensive or unnecessary supplements — only what adds real value.</span>
                </li>
                <li className="flex gap-3">
                    <span className="text-brand-accent">•</span>
                    <span>I won’t force you to eat “clean” foods you hate or cut out everything you enjoy.</span>
                </li>
                <li className="flex gap-3">
                    <span className="text-brand-accent">•</span>
                    <span>My goal is to help you build permanent lifestyle habits that keep you fit long after coaching ends.</span>
                </li>
                <li className="flex gap-3">
                    <span className="text-brand-accent">•</span>
                    <span>You’ll always know why we’re doing something because I believe true results come from understanding and trust.</span>
                </li>
            </ul>
        ),
        icon: Brain,
    },
    {
        id: 4,
        title: "COMMUNICATION & SUPPORT",
        description: (
            <div className="space-y-4 mt-2">
                <div>
                    <strong className="text-brand-text block mb-1">Direct access:</strong>
                    You’ll have 24/7 communication with me through WhatsApp and email.
                </div>
                <div>
                    <strong className="text-brand-text block mb-1">Weekly check-ins:</strong>
                    We’ll review your progress every week and make updates to diet, training, or cardio when needed.
                </div>
                <div>
                    <strong className="text-brand-text block mb-1">Form reviews:</strong>
                    You’ll receive feedback on your exercise form through personalized video assessments.
                </div>
                <div>
                    <strong className="text-brand-text block mb-1">1-on-1 support:</strong>
                    Every discussion, adjustment, and assessment is done personally — no generic feedback, ever.
                </div>
            </div>
        ),
        icon: MessageCircle,
    },
];

export default function ProcessSection({ id = "process", className = "" }) {
    const isMobile = useIsMobile();

    return (
        <section id={id} className={`relative w-full px-4 ${className}`}>
            <Section className="max-w-7xl mx-auto py-10 md:py-20">
                <h1 className="text-4xl md:text-5xl font-bold">How the Coaching Works</h1>

                <p className="text-brand-muted mt-6 text-lg max-w-3xl">A clear, structured process designed to fit your real life — not disrupt it.</p>

                <div className="relative mt-12 space-y-16">{steps.map((step) => (isMobile ? <MobileStepCard key={step.id} step={step} /> : <DesktopStepCard key={step.id} step={step} />))}</div>
            </Section>
        </section>
    );
}

/* ---------------- MOBILE SAFE CARD ---------------- */

function MobileStepCard({ step }) {
    const Icon = step.icon;

    return (
        <div className="flex flex-col gap-6">
            <Card className="p-8 bg-brand-surface border border-brand-border rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-brand-accent" />
                    </div>
                    <span className="text-xs tracking-widest uppercase text-brand-muted">Step 0{step.id}</span>
                </div>

                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <div className="text-brand-muted leading-relaxed">{step.description}</div>
            </Card>
        </div>
    );
}

/* ---------------- DESKTOP STATIC CARD ---------------- */

function DesktopStepCard({ step }) {
    // Step 1: Onboarding (Left)
    if (step.id === 1) {
        return (
            <div className="relative flex justify-start w-full items-center">
                <div className="w-full md:w-3/4 lg:w-2/3 relative z-10">
                    <Card className="p-10 bg-brand-surface border border-brand-border rounded-2xl">
                        <span className="text-xs tracking-widest uppercase text-brand-muted">Step 0{step.id}</span>
                        <h3 className="text-2xl font-bold mt-2 mb-4">{step.title}</h3>
                        <div className="text-brand-muted leading-relaxed">{step.description}</div>
                    </Card>
                </div>
                {/* Illustration - Hidden on Mobile, Visible on Desktop */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block w-[280px] lg:w-[360px] pointer-events-none opacity-90 z-0">
                    <OnboardingIllustration className="w-full h-auto" />
                </div>
            </div>
        );
    }

    // Step 2: Questionnaire (Right)
    if (step.id === 2) {
        return (
            <div className="relative flex justify-end w-full items-center">
                {/* Illustration - Hidden on Mobile, Visible on Desktop */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block w-[280px] lg:w-[360px] pointer-events-none opacity-90 z-0">
                    <QuestionnaireIllustration className="w-full h-auto" />
                </div>
                <div className="w-full md:w-3/4 lg:w-2/3 relative z-10">
                    <Card className="p-10 bg-brand-surface border border-brand-border rounded-2xl">
                        <span className="text-xs tracking-widest uppercase text-brand-muted">Step 0{step.id}</span>
                        <h3 className="text-2xl font-bold mt-2 mb-4">{step.title}</h3>
                        <div className="text-brand-muted leading-relaxed">{step.description}</div>
                    </Card>
                </div>
            </div>
        );
    }

    // Step 3 & 4: Full width / Standard layout (No icon)
    return (
        <div className="relative flex w-full">
            <div className="w-full">
                <Card className="p-10 bg-brand-surface border border-brand-border rounded-2xl">
                    <span className="text-xs tracking-widest uppercase text-brand-muted">Step 0{step.id}</span>
                    <h3 className="text-2xl font-bold mt-2 mb-4">{step.title}</h3>
                    <div className="text-brand-muted leading-relaxed">{step.description}</div>
                </Card>
            </div>
        </div>
    );
}
