import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // Instant scroll to top on route change (no hash)
        if (!hash) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant",
            });
        } 
        // Smooth scroll to hash anchor
        else {
            const id = hash.replace("#", "");
            const element = document.getElementById(id);
            if (element) {
                // Small timeout to ensure element exists
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }, [pathname, hash]);

    return null;
}
