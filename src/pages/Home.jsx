import HeroSection from "../components/sections/HeroSection";
import MethodSection from "../components/sections/MethodSection";
import AboutSection from "../components/sections/AboutSection";
import SuccessSection from "../components/sections/SuccessSection";
import ProcessSection from "../components/sections/ProcessSection";
import CoachingSection from "../components/sections/CoachingSection";
import PricingSection from "../components/sections/PricingSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";

export default function Home() {
    return (
        <div className="overflow-x-hidden">
            <HeroSection id="hero" className="scroll-mt-28" />
            <MethodSection id="method" className="scroll-mt-28" />
            <AboutSection id="about" className="scroll-mt-28" />
            <SuccessSection id="success" className="scroll-mt-28" />
            <ProcessSection id="process" className="scroll-mt-28" />
            <CoachingSection id="coaching" className="scroll-mt-28" />
            <PricingSection id="pricing" className="scroll-mt-28" />
            <TestimonialsSection id="testimonials" className="scroll-mt-28" />
        </div>
    );
}
