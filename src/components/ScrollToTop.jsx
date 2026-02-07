import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // Handle scroll behavior
        const handleScroll = () => {
            if (hash) {
                const id = hash.replace("#", "");
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            } else {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "instant",
                });
            }
        };

        // Small timeout to ensure DOM is ready and layout is stable
        const timeoutId = setTimeout(handleScroll, 100);

        return () => clearTimeout(timeoutId);
    }, [pathname, hash]);

    return null;
}
