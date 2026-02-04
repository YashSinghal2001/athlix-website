import { useRef } from "react";
import Card from "../ui/Card";
import Section from "../ui/Section";
import useIsMobile from "../../hooks/useIsMobile";
import { ProgressStoryVector, IconArrowRight } from "../illustrations/PremiumSvgs";

const transformations = [
    { id: 1, duration: "12 Weeks", focus: "Fat Loss & Muscle Gain" },
    { id: 2, duration: "16 Weeks", focus: "Lifestyle & Strength" },
    { id: 3, duration: "24 Weeks", focus: "Total Body Recomp" },
];

export default function SuccessSection({ id = "success", className = "" }) {
    // eslint-disable-next-line no-unused-vars
    const isMobile = useIsMobile();
    const scrollRef = useRef(null);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -350, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 350, behavior: "smooth" });
        }
    };

    return (
        <section id={id} className={`px-4 ${className}`}>
            <Section className="max-w-7xl mx-auto">
                <div className="relative">
                    <div className="hidden sm:block pointer-events-none absolute right-0 top-0 w-[560px] lg:w-[680px] text-brand-text opacity-[0.03]">
                        <ProgressStoryVector className="w-full h-auto" />
                    </div>

                    <div className="relative z-10">
                        {/* Heading */}
                        <h1 className="text-4xl md:text-5xl font-bold">Real People. Real Transformations.</h1>

                        <p className="text-brand-muted max-w-3xl mt-6 text-lg">Every transformation you see here is the result of consistency, clarity, and coaching — not shortcuts or quick fixes.</p>

                        {/* Slider Container */}
                        <div className="mt-8 md:mt-12 relative group/slider">
                            {/* Left Arrow */}
                            <button
                                onClick={scrollLeft}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover/slider:opacity-100 hover:scale-110"
                                aria-label="Previous slide"
                            >
                                <IconArrowRight className="w-5 h-5 md:w-6 md:h-6 text-brand-accent rotate-180" />
                            </button>

                            {/* Cards Track */}
                            <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-1 w-full justify-center" style={{ scrollBehavior: "smooth" }}>
                                {transformations.map((item) => (
                                    <div key={item.id} className="flex-shrink-0 min-w-[320px] max-w-[360px] w-[85vw] md:w-full md:flex-1">
                                        <Card className="p-0 overflow-hidden border border-brand-border hover:border-brand-accent/30 transition-colors duration-300 group h-full">
                                            <div className="h-64 md:h-72 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 relative">
                                                <span className="relative z-10 font-medium group-hover:text-brand-text transition-colors duration-300">Transformation Preview</span>
                                                {/* Subtle overlay on hover */}
                                                <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                            <div className="p-5 bg-brand-surface">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                                                    <p className="text-xs font-bold text-brand-accent tracking-wide uppercase">{item.duration}</p>
                                                </div>
                                                <p className="text-brand-muted group-hover:text-brand-text transition-colors duration-300">{item.focus}</p>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                            </div>

                            {/* Right Arrow */}
                            <button
                                onClick={scrollRight}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover/slider:opacity-100 hover:scale-110"
                                aria-label="Next slide"
                            >
                                <IconArrowRight className="w-5 h-5 md:w-6 md:h-6 text-brand-accent" />
                            </button>
                        </div>
                    </div>
                </div>
            </Section>
        </section>
    );
}
