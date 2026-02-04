import { Outlet } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useIsMobile from "../hooks/useIsMobile";

// Optimized: Only initialize scroll listeners on desktop
function DesktopScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 40,
        restDelta: 0.001,
    });

    return <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-brand-accent origin-left z-[60]" style={{ scaleX }} />;
}

export default function MainLayout() {
    const isMobile = useIsMobile();

    return (
        <div className="min-h-[100svh] flex flex-col bg-brand-bg text-brand-text">
            {/* Show progress bar ONLY on desktop to save main thread on mobile */}
            {!isMobile && <DesktopScrollProgress />}

            <Navbar />

            {/* Added top padding on desktop to account for fixed navbar */}
            <main className="flex-grow pt-3 md:pt-16 min-h-[100svh]">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
