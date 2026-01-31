import { Outlet } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useIsMobile from "../hooks/useIsMobile";

export default function MainLayout() {
    const isMobile = useIsMobile();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <div className="min-h-screen flex flex-col bg-black text-white">
            {isMobile && <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-brand-accent origin-left z-[60]" style={{ scaleX }} />}
            <Navbar />

            <main className="flex-grow pt-3 md:pt-6">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
