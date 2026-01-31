import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  UserCheck,
  ClipboardList,
  Brain,
  LineChart,
  MessageCircle,
} from "lucide-react";
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
  const isMobile = useIsMobile();

  return (
    <section className="relative w-full min-h-[100svh] px-4">
      <Section className="max-w-7xl mx-auto py-10 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold">
          How the Coaching Works
        </h1>

        <p className="text-brand-muted mt-6 text-lg max-w-3xl">
          A clear, structured process designed to fit your real life — not
          disrupt it.
        </p>

        <div className="relative mt-12 space-y-16">
          {steps.map((step) =>
            isMobile ? (
              <MobileStepCard key={step.id} step={step} />
            ) : (
              <DesktopStepCard key={step.id} step={step} />
            )
          )}
        </div>
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
          <span className="text-xs tracking-widest uppercase text-brand-muted">
            Step 0{step.id}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-3">{step.title}</h3>
        <p className="text-brand-muted leading-relaxed">
          {step.description}
        </p>
      </Card>
    </div>
  );
}

/* ---------------- DESKTOP ANIMATED CARD ---------------- */

function DesktopStepCard({ step }) {
  const Icon = step.icon;
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale }}
      className="relative flex gap-10 items-start"
    >
      {/* Timeline Dot */}
      <div className="hidden md:flex flex-col items-center sticky top-32">
        <div className="w-16 h-16 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center">
          <Icon className="w-7 h-7 text-brand-accent" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <Card className="p-10 bg-brand-surface border border-brand-border rounded-2xl">
          <span className="text-xs tracking-widest uppercase text-brand-muted">
            Step 0{step.id}
          </span>

          <h3 className="text-2xl font-bold mt-2 mb-4">{step.title}</h3>
          <p className="text-brand-muted leading-relaxed">
            {step.description}
          </p>
        </Card>
      </div>
    </motion.div>
  );
}
