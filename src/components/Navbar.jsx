import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/Button";
import useIsMobile from "../hooks/useIsMobile";

const WHATSAPP_LINK = "https://wa.me/919872028656";

const navLinks = [
    { name: "Method", path: "/#method", id: "method" },
    { name: "About", path: "/#about", id: "about" },
    { name: "Success", path: "/#success", id: "success" },
    { name: "Process", path: "/#process", id: "process" },
    { name: "Coaching", path: "/#coaching", id: "coaching" },
    { name: "Pricing", path: "/#pricing", id: "pricing" },
    { name: "Testimonials", path: "/#testimonials", id: "testimonials" },
    { name: "Terms", path: "/terms", id: "terms" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const isMobile = useIsMobile();
    const [activeSection, setActiveSection] = useState("");

    // Desktop: Scroll Spy Logic using IntersectionObserver
    useEffect(() => {
        if (isMobile || location.pathname !== "/") return;

        const observerOptions = {
            root: null,
            // Trigger when the section is near the middle/top of the viewport.
            // Adjust rootMargin to fine-tune when the highlight switches.
            rootMargin: "-40% 0px -40% 0px", 
            threshold: 0
        };

        const handleIntersect = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        const sectionsToObserve = navLinks
            .filter((link) => link.name !== "Terms")
            .map((link) => link.id);
        
        // Add hero section to observer to clear highlights when at the top
        sectionsToObserve.push("hero");

        sectionsToObserve.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [isMobile, location.pathname]);

    const handleNavClick = (e, link) => {
        setOpen(false);

        // If on homepage and not Terms page, scroll to section
        if (location.pathname === "/" && link.name !== "Terms") {
            e.preventDefault();
            // Manually update active section for immediate feedback on desktop
            if (!isMobile) setActiveSection(link.id);
            
            const element = document.getElementById(link.id);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
                window.history.pushState(null, "", link.path);
            }
        }
    };

    const menuVariants = {
        hidden: { y: "100%" },
        visible: {
            y: "0%",
            transition: {
                type: "tween",
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
                staggerChildren: 0.05,
                delayChildren: 0.1,
            },
        },
        exit: {
            y: "100%",
            transition: { duration: 0.25, ease: "easeIn" },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.25, ease: "easeOut" },
        },
    };

    return (
        <nav className="sticky top-0 md:fixed md:top-0 md:left-0 md:right-0 z-50 w-full bg-brand-bg border-b border-brand-border">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo - Links to / */}
                    <Link to="/" className="text-brand-text text-2xl font-bold tracking-wide" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        ATHLIX
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => {
                            const isActive = link.name === "Terms" 
                                ? location.pathname === link.path 
                                : (isMobile ? location.hash === `#${link.id}` : activeSection === link.id);

                            // Special case for Terms link: open in new tab
                            if (link.name === "Terms") {
                                return (
                                    <a key={link.name} href={link.path} target="_blank" rel="noopener noreferrer" className={`relative text-sm font-medium transition-colors duration-300 ${isActive ? "text-brand-accent" : "text-brand-muted hover:text-brand-text"}`}>
                                        {link.name}
                                    </a>
                                );
                            }

                            return (
                                <Link key={link.name} to={link.path} onClick={(e) => handleNavClick(e, link)} className={`relative text-sm font-medium transition-colors duration-300 ${isActive ? "text-brand-accent" : "text-brand-muted hover:text-brand-text"}`}>
                                    {link.name}
                                    {isActive && <motion.div layoutId="desktop-underline" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-brand-accent rounded-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                                </Link>
                            );
                        })}

                        <Button href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="px-5 py-2">
                            Apply Now
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-brand-text text-2xl" onClick={() => setOpen(!open)}>
                        ☰
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden" onClick={() => setOpen(false)} />

                        {/* Bottom Sheet Menu */}
                        <motion.div variants={menuVariants} initial="hidden" animate="visible" exit="exit" className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-brand-border rounded-t-2xl p-6 md:hidden pb-12 shadow-2xl">
                            <div className="mx-auto w-12 h-1.5 bg-gray-300 rounded-full mb-8 opacity-50" />

                            <div className="flex flex-col space-y-6">
                                {navLinks.map((link) => {
                                    const isActive = link.name === "Terms" ? location.pathname === link.path : location.hash === `#${link.id}`;

                                    // Special case for Terms link: open in new tab
                                    if (link.name === "Terms") {
                                        return (
                                            <motion.div key={link.name} variants={itemVariants}>
                                                <motion.div whileTap={{ scale: 0.98, opacity: 0.8 }}>
                                                    <a href={link.path} target="_blank" rel="noopener noreferrer" className={`text-xl block font-medium transition-colors duration-300 ${isActive ? "text-brand-accent" : "text-brand-muted hover:text-brand-text"}`}>
                                                        <span className="flex items-center gap-3">{link.name}</span>
                                                    </a>
                                                </motion.div>
                                            </motion.div>
                                        );
                                    }

                                    return (
                                        <motion.div key={link.name} variants={itemVariants}>
                                            <motion.div whileTap={{ scale: 0.98, opacity: 0.8 }}>
                                                <Link to={link.path} onClick={(e) => handleNavClick(e, link)} className={`text-xl block font-medium transition-colors duration-300 ${isActive ? "text-brand-accent" : "text-brand-muted hover:text-brand-text"}`}>
                                                    <span className="flex items-center gap-3">
                                                        {link.name}
                                                        {isActive && <motion.div layoutId="mobile-indicator" className="w-1.5 h-1.5 rounded-full bg-brand-accent" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} />}
                                                    </span>
                                                </Link>
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}

                                <motion.div variants={itemVariants} className="pt-2">
                                    <Button href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" onClick={() => setOpen(false)} className="w-full justify-center text-lg">
                                        Apply Now
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
