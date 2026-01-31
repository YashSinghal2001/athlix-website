import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    // Detect mobile viewport (max-width: 768px) - same as App.jsx
    const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 768px)").matches);

    useEffect(() => {
        // Listen for viewport changes
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const handleChange = (e) => setIsMobile(e.matches);

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return (
        <nav className="sticky top-0 z-50 bg-black border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo - Mobile: links to /home, Desktop: links to / */}
                    <Link to={isMobile ? "/home" : "/"} className="text-white text-2xl font-bold tracking-wide">
                        ATHLIX
                    </Link>

                    {/* Desktop Menu - Unchanged */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/about" className="text-gray-300 transition-colors duration-300 hover:text-white">
                            About
                        </Link>
                        <Link to="/method" className="text-gray-300 transition-colors duration-300 hover:text-white">
                            Method
                        </Link>
                        <Link to="/success" className="text-gray-300 transition-colors duration-300 hover:text-white">
                            Success
                        </Link>
                        <Link to="/process" className="text-gray-300 transition-colors duration-300 hover:text-white">
                            Process
                        </Link>
                        <Link to="/coaching" className="text-gray-300 transition-colors duration-300 hover:text-white">
                            Coaching
                        </Link>
                        <Link to="/pricing" className="text-gray-300 transition-colors duration-300 hover:text-white">
                            Pricing
                        </Link>

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

            {/* Mobile Menu - "Home" replaced with "About" */}
            {open && (
                <div className="md:hidden bg-black border-t border-gray-800 px-4 pb-4">
                    <div className="flex flex-col space-y-4 mt-4">
                        {/* Mobile: Show "About" instead of "Home" */}
                        <Link to="/about" onClick={() => setOpen(false)} className="text-gray-300">
                            About
                        </Link>
                        <Link to="/method" onClick={() => setOpen(false)} className="text-gray-300">
                            Method
                        </Link>
                        <Link to="/success" onClick={() => setOpen(false)} className="text-gray-300">
                            Success
                        </Link>
                        <Link to="/coaching" onClick={() => setOpen(false)} className="text-gray-300">
                            Coaching
                        </Link>
                        <Link to="/pricing" onClick={() => setOpen(false)} className="text-gray-300">
                            Pricing
                        </Link>
                        <Link to="/apply" onClick={() => setOpen(false)} className="bg-brand-accent text-white px-5 py-2 rounded-md font-semibold transition-all duration-300 hover:brightness-110 hover:scale-[1.03] active:scale-[0.97] shadow-md hover:shadow-lg w-fit">
                            Apply Now
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
