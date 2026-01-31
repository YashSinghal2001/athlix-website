import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/Button";

const navLinks = [
    { name: "About", path: "/about" },
    { name: "Method", path: "/method" },
    { name: "Success", path: "/success" },
    { name: "Process", path: "/process" },
    { name: "Coaching", path: "/coaching" },
    { name: "Pricing", path: "/pricing" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

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
        <nav className="sticky top-0 z-50 bg-black border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo - Links to / */}
                    <Link to="/" className="text-white text-2xl font-bold tracking-wide">
                        ATHLIX
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link key={link.name} to={link.path} className={`relative text-sm font-medium transition-colors duration-300 ${isActive ? "text-brand-accent" : "text-gray-300 hover:text-white"}`}>
                                    {link.name}
                                    {isActive && <motion.div layoutId="desktop-underline" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-brand-accent rounded-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                                </Link>
                            );
                        })}

                        <Button to="/apply" className="px-5 py-2">
                            Apply Now
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-white text-2xl" onClick={() => setOpen(!open)}>
                        ☰
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden" onClick={() => setOpen(false)} />

                        {/* Bottom Sheet Menu */}
                        <motion.div variants={menuVariants} initial="hidden" animate="visible" exit="exit" className="fixed bottom-0 left-0 right-0 z-[100] bg-[#111] border-t border-gray-800 rounded-t-2xl p-6 md:hidden pb-12 shadow-2xl">
                            <div className="mx-auto w-12 h-1.5 bg-gray-700 rounded-full mb-8 opacity-50" />

                            <div className="flex flex-col space-y-6">
                                {navLinks.map((link) => {
                                    const isActive = location.pathname === link.path;
                                    return (
                                        <motion.div key={link.name} variants={itemVariants}>
                                            <motion.div whileTap={{ scale: 0.98, opacity: 0.8 }}>
                                                <Link to={link.path} onClick={() => setOpen(false)} className={`text-xl block font-medium transition-colors duration-300 ${isActive ? "text-brand-accent" : "text-gray-300 hover:text-white"}`}>
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
                                    <Button to="/apply" onClick={() => setOpen(false)} className="w-full justify-center text-lg">
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
