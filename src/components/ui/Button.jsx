import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MotionLink = motion.create(Link);

export default function Button({ children, onClick, href, to, variant = "primary", className = "", ...props }) {
    const isPrimary = variant === "primary";

    const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold transition-colors duration-300 cursor-pointer";
    const primaryStyles = "bg-brand-accent text-white shadow-md hover:shadow-brand-accent/25";
    const secondaryStyles = "border border-brand-border text-brand-text hover:border-brand-text/50 hover:bg-white/5";

    const styles = `${baseStyles} ${isPrimary ? primaryStyles : secondaryStyles} ${className}`;

    // Determine component type
    let Component = motion.button;
    if (href) {
        Component = motion.a;
    } else if (to) {
        Component = MotionLink;
    }

    return (
        <Component href={href} to={to} onClick={onClick} className={styles} whileHover={{ y: -2, scale: 1.02, filter: "brightness(1.1)" }} whileTap={{ scale: 0.96, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} {...props}>
            {children}
        </Component>
    );
}
