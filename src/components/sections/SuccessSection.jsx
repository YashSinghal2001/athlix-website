import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Card from "../ui/Card";
import Section from "../ui/Section";
import useIsMobile from "../../hooks/useIsMobile";
import { ProgressStoryVector } from "../illustrations/PremiumSvgs";

const transformations = [
    { id: 1, duration: "12 Weeks", focus: "Fat Loss & Muscle Gain" },
    { id: 2, duration: "16 Weeks", focus: "Lifestyle & Strength" },
    { id: 3, duration: "24 Weeks", focus: "Total Body Recomp" },
];

export default function SuccessSection({ id = "success", className = "" }) {
    const isMobile = useIsMobile();
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const width = scrollRef.current.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setActiveIndex(index);
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

                        <div className="hidden md:block">
                            <p className="text-brand-muted max-w-3xl mt-6 text-lg">Every transformation you see here is the result of consistency, clarity, and coaching — not shortcuts or quick fixes.</p>
                        </div>

                        {/* Content */}
                        <div className="mt-8 md:mt-12">
                            {isMobile ? (
                                // Mobile Slider
                                <div className="relative">
                                    <div
                                        ref={scrollRef}
                                        onScroll={handleScroll}
                                        className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 scrollbar-hide"
                                    >
                                        {transformations.map((item) => (
                                            <div key={item.id} className="min-w-[85vw] snap-center h-full">
                                                <SuccessCard item={item} />
                                            </div>
                                        ))}
                                        <div className="min-w-[4vw]" />
                                    </div>
                                    {/* Dots */}
                                    <div className="flex justify-center gap-2 mt-2">
                                        {transformations.map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className={`h-1.5 rounded-full transition-colors duration-300 ${i === activeIndex ? "bg-brand-accent" : "bg-gray-300"}`}
                                                animate={{ width: i === activeIndex ? 24 : 6 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Desktop Grid
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {transformations.map((item) => (
                                        <div key={item.id} className="h-full">
                                            <SuccessCard item={item} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Section>
        </section>
    );
}

function SuccessCard({ item }) {
    return (
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
    );
}
