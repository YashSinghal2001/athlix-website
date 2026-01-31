import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { UserCheck, ClipboardList, Brain, LineChart, MessageCircle } from "lucide-react";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import useIsMobile from "../hooks/useIsMobile";

const steps = [
  {
    id: 1,
    title: "Onboarding",
    description:
      "Once you enroll, you'll complete a detailed onboarding process so I can understand your goals, health background, lifestyle, and expectations.",
    icon: UserCheck,
  },
  {
    id: 2,
    title: "Questionnaire",
    description:
      "You'll fill out an in-depth questionnaire covering nutrition, training history, sleep, stress, and daily routine.",
    icon: ClipboardList,
  },
  {
    id: 3,
    title: "Personalized Plan Creation",
    description:
      "Your training, nutrition, cardio, and lifestyle plan is built completely from scratch — no templates, no guesswork.",
    icon: Brain,
  },
  {
    id: 4,
    title: "Weekly Check-ins",
    description:
      "We review your progress every week and make adjustments based on real data, feedback, and recovery.",
    icon: LineChart,
  },
  {
    id: 5,
    title: "Ongoing Support",
    description:
      "You get direct access to me through WhatsApp and email, along with form reviews and constant guidance.",
    icon: MessageCircle,
  },
];

export default function Process() {
  return (
    <section className="relative w-full min-h-[100svh] px-4">
      <Section className="max-w-7xl mx-auto py-10 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold">
          How the Coaching Works
        </h1>

        <p className="text-brand-muted mt-6 text-lg max-w-3xl">
          A clear, structured process designed to fit your real life — not disrupt it.
          Every step is intentional, personal, and results-driven.
        </p>

        <div className="relative mt-12 space-y-16">
          {steps.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </div>
      </Section>
    </section>
  );
}

function StepCard({ step }) {
  const Icon = step.icon;
  const ref = useRef(null);
  const isMobile = useIsMobile();

  // Scroll tracking (safe because we neutralize its effect on mobile)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Desktop-only focus animation
  const opacity = !isMobile
    ? useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 0.6])
    : undefined;

  const scale = !isMobile
    ? useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98])
    : undefined;

  // Mobile animation
  const mobileVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial={isMobile ? "hidden" : { opacity: 0, y: 30 }}
      whileInView={isMobile ? "visible" : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: isMobile ? "-20px" : "-60px" }}
      variants={isMobile ? mobileVariants : undefined}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative flex flex-col md:flex-row gap-10 md:items-start group"
      style={{
        opacity: isMobile ? 1 : opacity,
        scale: isMobile ? 1 : scale,
      }}
    >
      {/* Desktop Timeline Node */}
      <div className="hidden md:flex flex-col items-center z-10 sticky top-32">
        <motion.div
          className="w-16 h-16 rounded-full bg-brand-surface border border-gray-700 flex items-center justify-center shadow-md relative overflow-hidden"
          whileInView={{
            borderColor: "rgba(99,102,241,0.5)",
            backgroundColor: "#1F1F26",
          }}
          viewport={{ margin: "-120px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute inset-0 rounded-full border border-brand-accent/20 scale-110" />
          <Icon className="w-7 h-7 text-gray-400 group-hover:text-brand-accent transition-colors duration-300" />
        </motion.div>
      </div>

      {/* Card */}
      <div className="flex-1">
        <Card
          className="p-8 md:p-10 border border-brand-border/50 bg-brand-surface/50 backdrop-blur-sm rounded-2xl transition-all duration-500 hover:border-brand-accent/30 hover:bg-brand-surface"
          hoverEffect={false}
        >
          {/* Mobile header */}
          <div className="flex items-center gap-4 mb-4 md:hidden">
            <div className="w-12 h-12 rounded-full bg-brand-surface border border-gray-800 flex items-center justify-center">
              <Icon className="w-6 h-6 text-brand-accent" />
            </div>
            <span className="text-brand-muted text-xs font-bold tracking-[0.2em] uppercase">
              Step 0{step.id}
            </span>
          </div>

          {/* Desktop step label */}
          <div className="hidden md:block mb-3">
            <span className="text-brand-muted/60 text-xs font-bold tracking-[0.2em] uppercase group-hover:text-brand-accent/80 transition-colors duration-300">
              Step 0{step.id}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-brand-accent transition-colors duration-300">
            {step.title}
          </h3>

          <p className="text-brand-muted leading-relaxed text-lg opacity-90">
            {step.description}
          </p>
        </Card>
      </div>
    </motion.div>
  );
}
