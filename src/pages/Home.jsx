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
            <HeroSection id="hero" />
            <MethodSection id="method" />
            <AboutSection id="about" />
            <SuccessSection id="success" />
            <ProcessSection id="process" />
            <CoachingSection id="coaching" />
            <PricingSection id="pricing" />
            <TestimonialsSection id="testimonials" />
        </div>
    );
}
