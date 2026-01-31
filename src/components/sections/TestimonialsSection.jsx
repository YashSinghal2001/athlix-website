import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import Card from "../ui/Card";
import Section from "../ui/Section";
import useIsMobile from "../../hooks/useIsMobile";
import { IconPlay, IconQuote } from "../illustrations/PremiumSvgs";

const videoTestimonials = [
    {
        id: 1,
        name: "Rahul S.",
        duration: "12 Weeks",
        thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 2,
        name: "Priya M.",
        duration: "16 Weeks",
        thumbnail: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 3,
        name: "Arjun K.",
        duration: "24 Weeks",
        thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
];

const textTestimonials = [
    {
        id: 1,
        name: "Sarthak D.",
        duration: "12 Weeks",
        highlight: "Lost 10kg & Gained Muscle",
        quote: "I never thought I could eat this much food and still lose fat. The strength gains have been insane.",
    },
    {
        id: 2,
        name: "Neha G.",
        duration: "16 Weeks",
        highlight: "Cured Back Pain",
        quote: "The focus on form and mobility fixed my back issues. I feel stronger than I did in my 20s.",
    },
    {
        id: 3,
        name: "Vikram R.",
        duration: "20 Weeks",
        highlight: "Sustainable Lifestyle",
        quote: "This isn't a diet, it's a lifestyle change. I'm traveling and still staying on track.",
    },
    {
        id: 4,
        name: "Ananya B.",
        duration: "12 Weeks",
        highlight: "Improved Energy",
        quote: "No more afternoon slumps. My energy levels are stable and my workouts are explosive.",
    },
];

export default function TestimonialsSection({ id = "testimonials", className = "" }) {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: isMobile ? 0.08 : 0.12,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const width = scrollRef.current.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setActiveIndex(index);
    };

    return (
        <section id={id} className={`px-4 ${className}`}>
            <Section className="max-w-7xl mx-auto py-10 md:py-20">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={containerVariants}>
                    {/* Heading */}
                    <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold">Real People. Real Results.</h1>
                        <p className="text-brand-muted mt-4 text-lg">Stories from clients who followed the system and stayed consistent.</p>
                    </motion.div>

                    {/* Video Testimonials */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-20">
                        {videoTestimonials.map((video) => (
                            <motion.div key={video.id} variants={itemVariants}>
                                <Card className="group relative overflow-hidden aspect-[9/16] sm:aspect-[4/5] md:aspect-[3/4] p-0 cursor-pointer border-0" hoverEffect={false}>
                                    <img src={video.thumbnail} alt={video.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                                            <IconPlay className="w-8 h-8 text-white ml-1" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 className="text-white font-bold text-lg">{video.name}</h3>
                                        <p className="text-white/80 text-sm">{video.duration}</p>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Text Testimonials */}
                    {isMobile ? (
                        // Mobile Carousel
                        <div className="relative">
                            <div ref={scrollRef} onScroll={handleScroll} className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 scrollbar-hide">
                                {textTestimonials.map((testimonial) => (
                                    <div key={testimonial.id} className="min-w-[85vw] snap-center h-full">
                                        <TestimonialCard testimonial={testimonial} />
                                    </div>
                                ))}
                                <div className="min-w-[4vw]" />
                            </div>
                            <div className="flex justify-center gap-2 mt-2">
                                {textTestimonials.map((_, i) => (
                                    <motion.div key={i} className={`h-1.5 rounded-full transition-colors duration-300 ${i === activeIndex ? "bg-brand-accent" : "bg-gray-300"}`} animate={{ width: i === activeIndex ? 24 : 6 }} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Desktop Grid
                        <div className="grid md:grid-cols-2 gap-8">
                            {textTestimonials.map((testimonial) => (
                                <motion.div key={testimonial.id} variants={itemVariants}>
                                    <TestimonialCard testimonial={testimonial} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </Section>
        </section>
    );
}

function TestimonialCard({ testimonial }) {
    return (
        <Card className="h-full p-8 bg-brand-surface border border-brand-border hover:border-brand-accent/30 transition-colors duration-300 group" hoverEffect={true}>
            <div className="flex flex-col h-full">
                <div className="mb-6">
                    <IconQuote className="w-8 h-8 text-brand-accent/20 group-hover:text-brand-accent/40 transition-colors duration-300" />
                </div>
                <blockquote className="text-lg font-medium text-brand-text mb-6 flex-grow leading-relaxed">"{testimonial.quote}"</blockquote>
                <div className="mt-auto">
                    <div className="flex items-center justify-between border-t border-brand-border pt-4">
                        <div>
                            <div className="font-bold text-brand-text">{testimonial.name}</div>
                            <div className="text-sm text-brand-muted">{testimonial.duration} transformation</div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-wide">{testimonial.highlight}</div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
