import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import useIsMobile from "../hooks/useIsMobile";
import { ProgressStoryVector } from "../components/illustrations/PremiumSvgs";

const transformations = [
    { id: 1, duration: "12 Weeks", focus: "Fat Loss & Muscle Gain" },
    { id: 2, duration: "16 Weeks", focus: "Lifestyle & Strength" },
    { id: 3, duration: "24 Weeks", focus: "Total Body Recomp" },
    { id: 4, duration: "12 Weeks", focus: "Metabolic Restoration" },
    { id: 5, duration: "20 Weeks", focus: "Performance & Conditioning" },
    { id: 6, duration: "16 Weeks", focus: "Sustainable Habits" },
];

export default function Success() {
    const isMobile = useIsMobile();
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const width = scrollRef.current.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setActiveIndex(index);
    };

    return (
        <div className="px-4">
            <Section className="max-w-7xl mx-auto">
                <div className="relative">
                    <div className="hidden sm:block pointer-events-none absolute right-0 top-0 w-[560px] lg:w-[680px] text-white opacity-[0.06]">
                        <ProgressStoryVector className="w-full h-auto" />
                    </div>

                    <div className="relative z-10">
                        {/* Heading */}
                        <h1 className="text-4xl md:text-5xl font-bold">Real People. Real Transformations.</h1>

                        <p className="text-brand-muted max-w-3xl mt-6 text-lg">Every transformation you see here is the result of consistency, clarity, and coaching — not shortcuts or quick fixes.</p>

                        {/* Transformations Display */}
                        {isMobile ? (
                            // Mobile Swipe Carousel
                            <div className="mt-12 relative">
                                <div ref={scrollRef} onScroll={handleScroll} className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 scrollbar-hide" style={{ scrollBehavior: "smooth" }}>
                                    {transformations.map((item, i) => (
                                        <div key={i} className="min-w-[85vw] snap-center">
                                            <Card className="p-0 overflow-hidden border border-gray-800 h-full" hoverEffect={false}>
                                                <div className="h-80 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500 relative group">
                                                    <span className="relative z-10 font-medium">Transformation Preview</span>
                                                    {/* Subtle gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                                                </div>
                                                <div className="p-5 bg-brand-surface">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                                                        <p className="text-xs font-bold text-brand-accent tracking-wide uppercase">{item.duration}</p>
                                                    </div>
                                                    <p className="text-white font-medium">{item.focus}</p>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                    {/* Spacer for right edge peek */}
                                    <div className="min-w-[4vw]" />
                                </div>

                                {/* Pagination Dots */}
                                <div className="flex justify-center gap-2 mt-2">
                                    {transformations.map((_, i) => (
                                        <motion.div key={i} className={`h-1.5 rounded-full transition-colors duration-300 ${i === activeIndex ? "bg-brand-accent" : "bg-gray-700"}`} animate={{ width: i === activeIndex ? 24 : 6 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Desktop Grid
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12">
                                {transformations.map((item, i) => (
                                    <Card key={i} className="p-0 overflow-hidden border border-gray-800 hover:border-brand-accent/30 transition-colors duration-300 group">
                                        <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500 relative">
                                            <span className="relative z-10 font-medium group-hover:text-white transition-colors duration-300">Transformation Preview</span>
                                            {/* Subtle overlay on hover */}
                                            <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <div className="p-5 bg-brand-surface">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                                                <p className="text-xs font-bold text-brand-accent tracking-wide uppercase">{item.duration}</p>
                                            </div>
                                            <p className="text-gray-300 group-hover:text-white transition-colors duration-300">{item.focus}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Section>
        </div>
    );
}
