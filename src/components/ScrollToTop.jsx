import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Prevent browser's default scroll restoration to avoid "memory" of previous scroll position
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }

        // Force a layout reflow calculation to ensure the browser has updated dimensions
        // This helps prevent the "overlap" issue when navigating back
        // eslint-disable-next-line no-unused-expressions
        document.body.offsetHeight;

        // "instant" behavior ensures we snap to top immediately,
        // overriding any global smooth scroll CSS for page transitions.
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });
    }, [pathname]);

    return null;
}
