import { motion, useReducedMotion } from "framer-motion";
import useIsMobile from "../../hooks/useIsMobile";

export default function Section({
  children,
  className = "",
  delay = 0,
  id = "",
}) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // 🚫 No whileInView on mobile
  if (isMobile) {
    return (
      <section
        id={id}
        className={`py-10 md:py-20 relative ${className}`}
      >
        {children}
      </section>
    );
  }

  const initialY = shouldReduceMotion ? 0 : 40;

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: initialY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        ease: [0.215, 0.61, 0.355, 1],
        delay,
      }}
      className={`py-10 md:py-20 relative ${className}`}
    >
      {children}
    </motion.section>
  );
}