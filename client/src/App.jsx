import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

import { useTheme } from "./theme/ThemeContext.jsx";
import { Icon } from "./components/icons.jsx";
// No longer used — transformations are single combined images now (no slider).
// import TransformationComparisonCard from "./components/TransformationComparisonCard.jsx";

/* assets */
import heroImage from "./assets/1.webp";
import logoBlack from "./assets/logo-black.png"; // shown on light theme
import logoWhite from "./assets/logo-white.png"; // shown on dark theme
import coachImage from "./assets/images/Coach.webp";
import blueTick from "./assets/Blue_tick.png";

import r1 from "./assets/4_1.webp";
import r2 from "./assets/4_2.webp";
import r3 from "./assets/4_3.webp";

/* Transformation showcase — each image already contains the complete
   Before + After comparison, so no slider logic is needed. WebP derivatives
   of 2_N.png (generated with the repo's sharp pipeline settings). */
import t1 from "./assets/2_1.webp";
import t2 from "./assets/2_2.webp";
import t3 from "./assets/2_3.webp";
import t4 from "./assets/2_4.webp";
import t5 from "./assets/2_5.webp";
import t6 from "./assets/2_6.webp";

const transformationImages = [
  { id: 1, src: t1 },
  { id: 2, src: t2 },
  { id: 3, src: t3 },
  { id: 4, src: t4 },
  { id: 5, src: t5 },
  { id: 6, src: t6 },
];

/* certification logos (flat src/assets location) */
import certAce from "./assets/ace-logo.webp";
import certK11 from "./assets/k11-logo.jpg";
import certEkfa from "./assets/efka-logo.png";
import certFitnessMatters from "./assets/FM-logo.png";
import certActiveIq from "./assets/aiq-logo.png";
import certRepsUae from "./assets/rep-logo.png";
import certUsReps from "./assets/usrep-logo.png";
import certTeamBoss from "./assets/teamboss-logo.webp";
import certJlo from "./assets/jf-logo.avif";
import certMnu from "./assets/mnu-logo.png";
import certAicvps from "./assets/aic-logo.jpeg";
import certEcna from "./assets/ecna-logo.png";

/* =====================================================================
   Data
   ===================================================================== */

const trustMetrics = [
  { num: "18+", lbl: "Years Experience" },
  { num: "100+", lbl: "Transformations" },
  { num: <Icon.Globe aria-hidden="true" />, lbl: "Globally Served", globe: true },
];

const problems = [
  "Random Diets",
  "No Accountability",
  "Temporary Motivation",
  "Generic Programs",
  "Information Overload",
  "Lack Of Structure",
];

const solutions = [
  "Personalized Coaching",
  "Weekly Accountability",
  "Nutrition Strategy",
  "Training Framework",
  "Lifestyle Integration",
  "Sustainable Results",
];

const methodStages = [
  {
    step: "Stage 01",
    title: "RESET",
    accent: "#4F8CFF",
    desc: "Build the foundation. We create awareness, fix daily habits, and establish the consistency every transformation depends on.",
    points: ["Build Awareness", "Fix Habits", "Create Consistency"],
  },
  {
    step: "Stage 02",
    title: "REBUILD",
    accent: "#8B5CF6",
    desc: "Develop the systems. Nutrition and training evolve into a repeatable structure that compounds results over time.",
    points: ["Improve Nutrition", "Develop Systems", "Increase Performance"],
  },
  {
    step: "Stage 03",
    title: "RISE",
    accent: "#10B981",
    desc: "Master the lifestyle. Advanced body composition and long-term sustainability become a permanent part of who you are.",
    points: ["Lifestyle Mastery", "Long-Term Sustainability", "Advanced Body Composition"],
  },
];

/* Comparison matrix: every existing feature (unchanged wording), ordered
   basic → premium. Each pathway includes a prefix of this list, so the tiers
   read as a staircase: Online (4) ⊂ Hybrid (8) ⊂ Offline (all 12). */
const pathwayFeatures = [
  "Personalized Programming",
  "Remote Coaching",
  "Weekly Reviews",
  "App Support",
  "Best of Online + Offline",
  "Faster Communication",
  "Greater Accountability",
  "Continuous Support",
  "Face To Face Coaching",
  "Direct Assessments",
  "In-Gym Guidance",
  "Personal Support",
];

const pathways = [
  {
    icon: <Icon.Monitor />,
    title: "Online Coaching",
    desc: "A structured remote transformation experience with expert direction from anywhere in the world.",
    includes: 4,
  },
  {
    icon: <Icon.Layers />,
    title: "Hybrid Coaching",
    featured: true,
    badge: "Most Recommended",
    desc: "Program designed personally by Coach Abhishek. Daily follow-ups, accountability, and support handled by the Athlix Assistant Team.",
    includes: 8,
  },
  {
    icon: <Icon.MapPin />,
    title: "Offline Coaching",
    desc: "Hands-on, face-to-face coaching for clients who want direct support inside the training environment.",
    includes: pathwayFeatures.length,
  },
];

const coachStats = [
  { num: "18+", lbl: "Years Experience" },
  { num: "100+", lbl: "Transformations" },
  { num: <Icon.Globe aria-hidden="true" />, lbl: "Globally Served", globe: true },
];

const certifications = [
  { logo: certAce, name: "ACE", full: "American Council on Exercise", year: "Certified PT" },
  { logo: certK11, name: "K11", full: "K11 Fitness Academy", year: "Academy", plate: true },
  { logo: certEkfa, name: "EKFA", full: "EKFA Fitness Academy", year: "Certified" },
  { logo: certFitnessMatters, name: "Fitness Matters", full: "Fitness Matters", year: "Certified" },
  { logo: certActiveIq, name: "Active IQ", full: "Active IQ Level 3 (UK)", year: "Level 3" },
  { logo: certRepsUae, name: "REPs UAE", full: "Register of Exercise Professionals", year: "Registered" },
  { logo: certUsReps, name: "US REPs", full: "US Register of Exercise Professionals", year: "Registered" },
  { logo: certTeamBoss, name: "Team Boss", full: "Team Boss Coaching", year: "Member" },
  { logo: certJlo, name: "JLO", full: "JLO Coaching System", year: "Certified" },
  { logo: certMnu, name: "MNU", full: "Mac-Nutrition Uni", year: "Certified" },
  { logo: certAicvps, name: "AICVPS", full: "All India Council (Paramedical Science)", year: "Certified" },
  { logo: certEcna, name: "ECNA", full: "Elite Coaches & Nutrition Academy", year: "Certified" },
];

const testimonials = [
  { name: "Nisha Rao", role: "Marketing Lead", type: "Transformation", photo: r1, quote: "The first time someone adjusted the process around my work, travel, and real life. The results finally stayed." },
  { name: "Kabir Khanna", role: "Finance Professional", type: "Client Review", photo: r2, quote: "The weekly review system kept me honest. I always knew what was working and what to change." },
  { name: "Sara Iyer", role: "Entrepreneur", type: "Success Story", photo: r3, quote: "I gained confidence in how I looked, trained, and managed food — without fear or restriction." },
  { name: "Vikram Joshi", role: "Software Architect", type: "Transformation", initials: "VJ", quote: "It wasn't about losing weight. It was gaining a system that finally worked for my schedule." },
  { name: "Aarti Menon", role: "Consultant", type: "Client Review", initials: "AM", quote: "Sustainable, structured, and genuinely personal. Coaching that respects a demanding life." },
  { name: "Rahul Verma", role: "Founder", type: "Success Story", initials: "RV", quote: "Six months in and the habits are permanent. That's the real transformation." },
];

const faqs = [
  { q: "How is Athlix different from a normal gym or diet plan?", a: "Athlix is not a downloadable plan it is a coaching relationship. We combine personalized programming, weekly accountability, and lifestyle design to produce results that actually last." },
  { q: "What is the Athlix Coaching Method?", a: "A dynamic three stage framework  Reset, Rebuild, Rise  that adapts as your body, lifestyle, and goals evolve. The process is never fixed; it changes with your progress." },
  { q: "Do I need gym access to start?", a: "No. Your program is built around your access  home, hotel, or full gym  based on your training history, equipment, and goals." },
  { q: "How does Hybrid Coaching work?", a: "Coach Abhishek designs your overall strategy personally. The Athlix Assistant Team handles daily follow ups, accountability, and support so nothing falls through the cracks." },
  { q: "Is Athlix beginner friendly?", a: "Yes. The Reset stage is designed to help beginners build awareness and consistency before intensity increases. Every plan is scaled to your starting point." },
  { q: "How long does a transformation take?", a: "Most clients see meaningful change within 8–16 weeks of consistent execution. A complete, sustainable transformation is typically a 6–12 month journey." },
  { q: "Do you work with international clients?", a: "Yes. Athlix coaches clients across 6 countries  fully online, with optional in-person support for hybrid clients." },
  { q: "What happens after I apply?", a: "We personally review your application, invite the best fit applicants to a consultation, and align on goals before building your personalized roadmap." },
];

/* =====================================================================
   Motion helpers
   ===================================================================== */

/* Premium scroll-reveal spec (Apple-like): fade + rise into view once.
   initial: opacity 0, y 40px  →  animate: opacity 1, y 0
   duration 0.8s, easeOut, triggered once. Children stagger by 0.1s. */
const REVEAL_EASE = "easeOut";
const REVEAL_DURATION = 0.8;
const REVEAL_Y = 40;
const REVEAL_STAGGER = 0.1;
const REVEAL_VIEWPORT = { once: true, margin: "0px 0px -80px 0px" };

// Parent variant: orchestrates a 0.1s stagger across its <Reveal group> children.
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: REVEAL_STAGGER } },
};

function Reveal({ children, delay = 0, y = REVEAL_Y, className, as = "div", style, group = false, ...rest }) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  // Inside a <RevealGroup>: inherit the parent's orchestrated stagger via variants.
  if (group) {
    const variants = reduce
      ? undefined
      : {
          hidden: { opacity: 0, y, filter: "blur(8px)" },
          show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: REVEAL_DURATION, ease: REVEAL_EASE },
          },
        };
    return (
      <MotionTag className={className} style={style} variants={variants} {...rest}>
        {children}
      </MotionTag>
    );
  }

  // Standalone: fade + rise when it scrolls into view, once.
  return (
    <MotionTag
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE, delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

// Wraps a set of <Reveal group> children and reveals them with a 0.1s stagger
// when the group scrolls into view (once).
function RevealGroup({ children, className, as = "div", style, ...rest }) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      style={style}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={REVEAL_VIEWPORT}
      variants={staggerContainer}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

function SectionHead({ eyebrow, title, lede, align = "center" }) {
  return (
    <RevealGroup className={`section-head ${align === "left" ? "left" : ""}`}>
      {eyebrow && (
        <Reveal group as="p" className={`eyebrow ${align === "center" ? "center" : ""}`}>
          {eyebrow}
        </Reveal>
      )}
      <Reveal group as="h2" className="section-title">{title}</Reveal>
      {lede && <Reveal group as="p" className="section-lede">{lede}</Reveal>}
    </RevealGroup>
  );
}

/* =====================================================================
   Header + theme toggle
   ===================================================================== */

const navLinks = [
  { href: "#transformations", label: "Transformations" },
  { href: "#method", label: "Method" },
  { href: "#pathways", label: "Pathways" },
  { href: "#coach", label: "Coach" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
];

/* Pick the logo variant that stays visible on the active theme's background. */
function useThemeLogo() {
  const { resolvedTheme } = useTheme();
  // Warm the cache for the other variant so switching themes doesn't flash.
  useEffect(() => {
    const img = new Image();
    img.src = resolvedTheme === "dark" ? logoBlack : logoWhite;
  }, [resolvedTheme]);
  return resolvedTheme === "dark" ? logoWhite : logoBlack;
}

function Logo() {
  const logo = useThemeLogo();
  return (
    <a href="#top" className="logo-mark" aria-label="Athlix home">
      <img src={logo} alt="Athlix" />
    </a>
  );
}

function ThemeToggle() {
  const { preference, setTheme } = useTheme();
  const options = [
    { key: "light", icon: <Icon.Sun />, label: "Light theme" },
    { key: "auto", icon: <Icon.Auto />, label: "Automatic theme" },
    { key: "dark", icon: <Icon.Moon />, label: "Dark theme" },
  ];
  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          className={preference === o.key ? "active" : ""}
          aria-label={o.label}
          aria-pressed={preference === o.key}
          onClick={() => setTheme(o.key)}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <Logo />
        <nav className="nav-center" aria-label="Primary">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <div className="nav-right">
          <ThemeToggle />
          <a className="btn btn-primary btn-sm header-cta" href="#apply">Fill Your Application</a>
          <button className="menu-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <Icon.Menu />
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Menu">
        <div className="mobile-menu-top">
          <Logo />
          <button className="menu-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
            <Icon.X />
          </button>
        </div>
        <nav>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </nav>
        <a className="btn btn-primary btn-lg btn-block" href="#apply" onClick={() => setOpen(false)}>
          Fill Your Application <Icon.Arrow />
        </a>
      </div>
    </>
  );
}

/* =====================================================================
   Hero
   ===================================================================== */

/* Luxury animated mesh: slow-drifting, heavily-blurred low-opacity blue blobs.
   Sits behind a section's content (Linear / Raycast / Stripe feel). */
function MeshBackground() {
  return (
    <div className="mesh-bg" aria-hidden="true">
      <span className="mesh-blob b1" />
      <span className="mesh-blob b2" />
      <span className="mesh-blob b3" />
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  return (
    <section id="top" className="hero has-mesh">
      <MeshBackground />
      <div className="hero-bg" aria-hidden="true" />
      <span className="hero-glow a" aria-hidden="true" />
      <span className="hero-glow b" aria-hidden="true" />

      <div className="shell hero-grid">
        <RevealGroup>
          <Reveal group>
            <h1 className="hero-title">
              <span className="line">Transform Your Body.</span>
              <span className="line">Rebuild Your Lifestyle.</span>
              <span className="line dim">Create Results That Last.</span>
            </h1>
          </Reveal>
          <Reveal group>
            <p className="hero-sub">
              Personalized transformation coaching built around accountability, nutrition,
              training, and sustainable behavior change.
            </p>
          </Reveal>
          <Reveal group>
            <div className="cta-row">
              <a className="btn btn-primary btn-lg" href="#apply">Fill Your Application <Icon.Arrow /></a>
              <a
                className="btn btn-secondary btn-lg"
                href="https://wa.me/919030153337?text=Hi%20Coach%20Abhishek,%0A%0AI%20visited%20the%20Athlix%20website%20and%20would%20like%20to%20book%20a%20consultation%20regarding%20transformation%20coaching.%0A%0APlease%20let%20me%20know%20the%20next%20steps.%0A%0AThank%20you."
                target="_blank"
                rel="noopener noreferrer"
              >
                Book Consultation
              </a>
            </div>
          </Reveal>
        </RevealGroup>

        <motion.div
          className="hero-visual"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="hero-photo">
            <motion.img
              src={heroImage}
              alt="Athlix transformation coaching client"
              fetchPriority="high"
              initial={reduce ? false : { opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <motion.div
            className="hero-float tl"
            initial={reduce ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <span className="pulse" />
            <div>
              <div className="ig">@coachavk</div>
              <div className="stat-label">Verified Coach</div>
            </div>
            <img src={blueTick} alt="" width="18" height="18" />
          </motion.div>
          <motion.div
            className="hero-float br"
            initial={reduce ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.62, duration: 0.6 }}
          >
            <div className="stat-num">100+</div>
            <div className="stat-label">Real transformations<br />globally</div>
          </motion.div>
        </motion.div>
      </div>

      <div className="shell">
        <Reveal delay={0.2}>
          <div className="trust-bar">
            {trustMetrics.map((m) => (
              <div className={m.globe ? "trust-cell trust-cell-globe" : "trust-cell"} key={m.lbl}>
                <div className="num">{m.num}</div>
                <div className="lbl">{m.lbl}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =====================================================================
   Transformations
   ===================================================================== */

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function Transformations() {
  const n = transformationImages.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeRef = useRef(null);
  const swipeRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 680px)");
  const isCompact = useMediaQuery("(max-width: 1024px)");

  const pauseFor = (ms = 6000) => {
    setPaused(true);
    clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => setPaused(false), ms);
  };

  const goTo = (i) => { setActive(((i % n) + n) % n); pauseFor(); };
  const next = () => goTo(active + 1);
  const prev = () => goTo(active - 1);

  // Autoplay every 5s, infinite loop.
  useEffect(() => {
    if (paused || n <= 1) return undefined;
    const id = setInterval(() => setActive((a) => (a + 1) % n), 5000);
    return () => clearInterval(id);
  }, [paused, n]);

  useEffect(() => () => clearTimeout(resumeRef.current), []);

  // Swipe-to-navigate.
  const onStageDownCapture = (e) => {
    swipeRef.current = { x: e.clientX, t: Date.now() };
  };
  const onStageUp = (e) => {
    const s = swipeRef.current;
    swipeRef.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 55 && Date.now() - s.t < 800) (dx < 0 ? next() : prev());
  };

  // Render ONLY three cards: previous, active, next. Explicit role-based
  // transforms + z-index — no hidden cards, no overlap, no ghosting.
  const sideX = isMobile ? 90 : isCompact ? 80 : 104;
  // Side cards ~12% smaller than before and slightly more transparent, so the
  // center transformation reads as the clear primary focus.
  const sideScale = isMobile ? 0.72 : isCompact ? 0.76 : 0.79;
  const sideOpacity = isMobile ? 0.28 : isCompact ? 0.45 : 0.5;
  const ROLE = {
    prev:   { x: `-${sideX}%`, scale: sideScale, opacity: sideOpacity, z: 20 },
    active: { x: "0%",         scale: 1.04,       opacity: 1,           z: 30 },
    next:   { x: `${sideX}%`,  scale: sideScale,  opacity: sideOpacity, z: 20 },
  };

  const prevIndex = (active - 1 + n) % n;
  const nextIndex = (active + 1) % n;
  const visible =
    n <= 1
      ? [{ pair: transformationImages[active], role: "active" }]
      : [
          { pair: transformationImages[prevIndex], role: "prev" },
          { pair: transformationImages[active], role: "active" },
          { pair: transformationImages[nextIndex], role: "next" },
        ];

  return (
    <section id="transformations" className="section">
      <div className="shell">
        <SectionHead
          eyebrow="Real Client Proof"
          title={<>Real People. <span className="accent">Real Transformations.</span></>}
          lede="Every transformation tells a story of consistency, accountability, and sustainable change."
        />

        <div className="show-wrap">
          <button className="show-nav prev" onClick={prev} aria-label="Previous transformation">
            <Icon.ChevronLeft />
          </button>

          <div
            className="cover-stage"
            onPointerDownCapture={onStageDownCapture}
            onPointerUp={onStageUp}
          >
            <AnimatePresence initial={false}>
              {visible.map(({ pair, role }) => {
                const t = ROLE[role];
                return (
                  <motion.div
                    key={pair.id}
                    className={`cover-card is-${role}`}
                    style={{ zIndex: t.z }}
                    initial={{ x: t.x, y: "-50%", scale: t.scale, opacity: 0 }}
                    animate={{ x: t.x, y: "-50%", scale: t.scale, opacity: t.opacity }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="ba-card">
                      <div className="ba-frame">
                        <img
                          className="ba-img"
                          src={pair.src}
                          alt={`Athlix client ${pair.id} transformation — before and after`}
                          loading="lazy"
                          draggable="false"
                        />
                        {/* decorative — the alt text already says before/after */}
                        <span className="ba-pill ba-pill-before" aria-hidden="true">
                          <span className="pip" />BEFORE
                        </span>
                        <span className="ba-pill ba-pill-after" aria-hidden="true">
                          <span className="pip" />AFTER
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <button className="show-nav next" onClick={next} aria-label="Next transformation">
            <Icon.ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   Problem vs Solution
   ===================================================================== */

function ProblemSolution() {
  return (
    <section id="why" className="section bg-subtle">
      <div className="shell">
        <SectionHead
          eyebrow="The Real Difference"
          title={<>Why Most Attempts Fail — <span className="accent">And Why Clients Succeed</span></>}
          lede="Transformation rarely fails from lack of effort. It fails from lack of structure, accountability, and a system built around real life."
        />
        <RevealGroup className="compare-grid">
          <Reveal group className="compare-card problem">
            <span className="compare-glow" aria-hidden="true" />
            <h3>Why Most Fat Loss Attempts Fail</h3>
            <RevealGroup as="ul" className="compare-list">
              {problems.map((p) => (
                <Reveal group as="li" y={14} key={p}>
                  <span className="compare-icon x"><Icon.X /></span>
                  <span className="compare-text">{p}</span>
                </Reveal>
              ))}
            </RevealGroup>
          </Reveal>
          <Reveal group className="compare-card solution">
            <span className="compare-glow" aria-hidden="true" />
            <h3>Why Athlix Clients Succeed</h3>
            <RevealGroup as="ul" className="compare-list">
              {solutions.map((s) => (
                <Reveal group as="li" y={14} key={s}>
                  <span className="compare-icon check"><Icon.Check /></span>
                  <span className="compare-text">{s}</span>
                </Reveal>
              ))}
            </RevealGroup>
          </Reveal>
        </RevealGroup>
      </div>
    </section>
  );
}

/* =====================================================================
   The Athlix Coaching Method
   ===================================================================== */

function CoachingMethod() {
  const logo = useThemeLogo();
  return (
    <section id="method" className="section has-mesh">
      <MeshBackground />
      <div className="shell">
        <SectionHead
          eyebrow="The Framework"
          title={
            <span className="method-title-stack">
              <img src={logo} alt="" className="method-logo" />
              <span>The Athlix <span className="accent">Coaching Method</span></span>
            </span>
          }
          lede="A dynamic coaching framework that adapts as your body, lifestyle, and goals evolve."
        />

        <RevealGroup className="timeline">
          {methodStages.map((stage, i) => (
            <Reveal
              group
              key={stage.title}
              className="stage-card"
              style={{ "--card-accent": stage.accent }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
            >
              <span className="stage-ambient" aria-hidden="true" />
              <div className="stage-badge">Stage {i + 1}</div>
              <h3>{stage.title}</h3>
              <p className="stage-desc">{stage.desc}</p>
              <ul className="stage-points">
                {stage.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </RevealGroup>

        <Reveal className="method-statement">
          <p>
            <span className="hl">The process is not fixed.</span> Every stage evolves based on progress, challenges, lifestyle demands, and long-term transformation goals.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* =====================================================================
   Coaching Pathways
   ===================================================================== */

function Pathways() {
  return (
    <section id="pathways" className="section bg-subtle has-mesh">
      <MeshBackground />
      <div className="shell">
        <SectionHead
          eyebrow="Coaching Pathways"
          title={<>Choose Your <span className="accent">Coaching Pathway</span></>}
          lede="Every pathway is built to move you from uncertainty to execution with the right level of expert support."
        />
        <RevealGroup className="pathway-grid">
          {pathways.map((p) => (
            <Reveal group key={p.title} className={`pathway-card ${p.featured ? "featured" : ""}`}>
              {p.badge && <span className="pathway-badge"><Icon.Star style={{ width: 12, height: 12 }} /> {p.badge}</span>}
              <span className="pathway-icon">{p.icon}</span>
              <h3>{p.title}</h3>
              <p className="pathway-desc">{p.desc}</p>
              <ul className="pathway-list">
                {pathwayFeatures.map((f, fi) => {
                  const included = fi < p.includes;
                  return (
                    <li key={f} className={included ? undefined : "excluded"}>
                      {included ? <Icon.Check /> : <Icon.X />} {f}
                    </li>
                  );
                })}
              </ul>
              <a className="btn btn-lg pathway-cta" href="#apply">
                Fill Your Application <Icon.Arrow />
              </a>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* =====================================================================
   Coach Abhishek
   ===================================================================== */

function Coach() {
  return (
    <section id="coach" className="section">
      <div className="shell">
        <RevealGroup className="coach-grid">
          <Reveal group className="coach-photo">
            <img src={coachImage} alt="Coach Abhishek — Athlix founder and transformation coach" loading="lazy" />
          </Reveal>

          <Reveal group className="coach-copy">
            <p className="eyebrow">Founder-Led Coaching</p>
            <h2 className="section-title">Meet Coach Abhishek</h2>
            <p>
              Coach Abhishek leads Athlix as a premium transformation coaching practice for people
              who want sustainable fat loss, stronger bodies, and higher confidence without the
              extreme, short-term approaches that always fail.
            </p>
            <p>
              With 18+ years of coaching, international certifications, and a science-driven method,
              he has helped professionals, founders, and athletes across 6 countries transform their
              bodies and their relationship with training, food, and discipline.
            </p>

            <div className="coach-stats">
              {coachStats.map((s) => (
                <div key={s.lbl} className={s.globe ? "globe" : undefined}>
                  <div className="num">{s.num}</div>
                  <div className="lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            <a className="btn btn-primary btn-lg" href="#apply">Work With Coach Abhishek <Icon.Arrow /></a>
          </Reveal>
        </RevealGroup>
      </div>
    </section>
  );
}

/* =====================================================================
   Certifications wall
   ===================================================================== */

function Certifications() {
  return (
    <section id="credentials" className="section bg-subtle">
      <div className="shell">
        <SectionHead
          eyebrow="Credentials & Certifications"
          title={<>Backed By <span className="accent">World-Class Credentials</span></>}
          lede="Coaching grounded in internationally recognized education, certification, and accreditation."
        />
        <RevealGroup className="cert-wall">
          {certifications.map((c) => (
            <Reveal group key={c.name} className="cert-tile">
              <div className="cert-logo">
                <img src={c.logo} alt={`${c.full} certification logo`} loading="lazy" />
              </div>
              <div>
                <div className="cert-name">{c.name}</div>
              </div>
              <div className="cert-year">{c.year}</div>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* =====================================================================
   Testimonials (auto-scrolling marquee)
   ===================================================================== */

function TestimonialCard({ t }) {
  const reduce = useReducedMotion();
  // Subtle mouse-follow tilt (±4deg). Writes CSS vars straight onto the
  // element — no state, no re-renders.
  const onMouseMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty("--ry", `${(px * 8).toFixed(2)}deg`);
    e.currentTarget.style.setProperty("--rx", `${(-py * 8).toFixed(2)}deg`);
  };
  const onMouseLeave = (e) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };
  return (
    <div className="tst-card" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <span className="tst-tag">{t.type}</span>
      <div className="tst-stars" aria-label="5 out of 5">
        {Array.from({ length: 5 }).map((_, i) => <Icon.Star key={i} />)}
      </div>
      <blockquote>“{t.quote}”</blockquote>
      <div className="tst-author">
        <div className="tst-avatar">
          {t.photo ? <img src={t.photo} alt={t.name} loading="lazy" /> : t.initials}
        </div>
        <div>
          <strong>{t.name}</strong>
          <span>{t.role}</span>
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  const loop = [...testimonials, ...testimonials];
  return (
    <section id="testimonials" className="section has-mesh">
      <MeshBackground />
      <div className="shell">
        <SectionHead
          eyebrow="Client Voices"
          title={<>Trusted By People Who <span className="accent">Wanted Real Change</span></>}
          lede="Real reviews from real clients who committed to the Athlix system — and changed their lives."
        />
      </div>
      <div className="tst-track-wrap">
        <div className="tst-track">
          {loop.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   FAQ
   ===================================================================== */

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className={`faq-item ${isOpen ? "open" : ""}`}>
      <button className="faq-q" aria-expanded={isOpen} onClick={onToggle}>
        {item.q}
        <span className="faq-icon"><Icon.Plus /></span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            }}
          >
            <motion.div
              className="faq-a-inner"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {item.a}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section bg-subtle">
      <div className="shell faq-shell">
        <SectionHead
          eyebrow="Questions"
          title="Frequently Asked Questions"
          lede="Clear, honest answers before you apply for coaching."
        />
        <RevealGroup>
          {faqs.map((f, i) => (
            <Reveal group key={f.q}>
              <FAQItem item={f} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* =====================================================================
   Application form
   ===================================================================== */

// Submissions go to OUR backend (never a third-party webhook with secrets).
// Same-origin "/api/apply" works in production behind a reverse proxy; in dev
// the Vite proxy (see vite.config.js) forwards /api to the local API server.
// Override the base URL only if the API is hosted on a different origin.
const API_BASE = import.meta.env.VITE_API_URL || "";
const APPLY_ENDPOINT = `${API_BASE}/api/apply`;

// Marketing attribution: first-touch capture. Read once, from the exact URL
// this page load landed on, then persisted so it still applies even if the
// visitor browses/scrolls for a while (e.g. down to #apply) before applying
// — without this, a later read would see whatever the URL looks like at
// submit time, not the campaign that actually brought them here.
const ATTRIBUTION_STORAGE_KEY = "athlix_attribution";

function captureAttribution() {
  try {
    const stored = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — fall through and
    // capture fresh; the submission still works, just without persistence.
  }

  const params = new URLSearchParams(window.location.search);
  const attribution = {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    referrer: document.referrer || "",
  };

  try {
    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // ignore — non-fatal
  }

  return attribution;
}

// Captured once, at script load — the earliest and most accurate point to
// see the URL/referrer the visitor actually arrived on.
const attribution = captureAttribution();

// Cloudflare Turnstile: bot verification for the application form. Rendered
// fully invisibly (size: "invisible") — it never adds any visible UI, so
// the form's design is unaffected. Skipped entirely (resolves to an empty
// token) if no site key is configured, or if the script never loads (e.g.
// blocked by an ad blocker) — the backend is the actual source of truth: it
// verifies the token independently and only enforces this once
// TURNSTILE_SECRET_KEY is set server-side (see server/src/lib/turnstile.js).
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
const TURNSTILE_SCRIPT_WAIT_MS = 5000;
const TURNSTILE_TOKEN_TIMEOUT_MS = 10000;

let turnstileWidgetId = null;
let turnstileContainer = null;

function waitForTurnstile(timeoutMs) {
  return new Promise((resolve) => {
    if (window.turnstile) return resolve(true);
    const start = Date.now();
    const poll = setInterval(() => {
      if (window.turnstile) {
        clearInterval(poll);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(poll);
        resolve(false);
      }
    }, 100);
  });
}

async function getTurnstileToken() {
  if (!TURNSTILE_SITE_KEY) return "";
  if (!(await waitForTurnstile(TURNSTILE_SCRIPT_WAIT_MS))) return "";

  return new Promise((resolve) => {
    let settled = false;
    const finish = (token) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(token || "");
    };
    const timer = setTimeout(() => finish(""), TURNSTILE_TOKEN_TIMEOUT_MS);

    try {
      if (turnstileWidgetId == null) {
        turnstileContainer = document.createElement("div");
        document.body.appendChild(turnstileContainer);
        turnstileWidgetId = window.turnstile.render(turnstileContainer, {
          sitekey: TURNSTILE_SITE_KEY,
          size: "invisible",
          execution: "execute",
          callback: (token) => finish(token),
          "error-callback": () => finish(""),
          "timeout-callback": () => finish(""),
        });
      } else {
        window.turnstile.reset(turnstileWidgetId);
      }
      window.turnstile.execute(turnstileWidgetId);
    } catch {
      finish("");
    }
  });
}

const pathwayOptions = ["Online Coaching", "Offline Coaching", "Hybrid Coaching", "Not Sure Yet"];
const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

const initialForm = {
  name: "", phone: "", email: "", gender: "",
  currentWeight: "", pathway: "", message: "",
  company: "", // honeypot — must stay empty; real users never see this field
};

function validate(values) {
  const e = {};
  if (!values.name.trim()) e.name = "Please enter your name";
  if (!values.phone || !isValidPhoneNumber(values.phone)) e.phone = "Enter a valid phone number";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) e.email = "Enter a valid email";
  if (!values.gender) e.gender = "Please select";
  if (!values.currentWeight.trim()) e.currentWeight = "Required";
  if (!values.pathway) e.pathway = "Please select a pathway";
  return e;
}

function ApplicationForm() {
  const [values, setValues] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  // Guards against duplicate submissions from rapid double-clicks / Enter spam
  // (a synchronous lock that doesn't depend on async state updates).
  const inFlightRef = useRef(false);

  const update = (key) => (ev) => {
    setValues((v) => ({ ...v, [key]: ev.target.value }));
    setErrors((er) => (er[key] ? { ...er, [key]: undefined } : er));
  };

  // PhoneInput's onChange hands back the value directly (E.164 string, or
  // undefined when empty) rather than an input change event.
  const updatePhone = (val) => {
    setValues((v) => ({ ...v, phone: val || "" }));
    setErrors((er) => (er.phone ? { ...er, phone: undefined } : er));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (inFlightRef.current) return; // already sending — ignore duplicate trigger
    setServerError("");
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).some((k) => errs[k])) {
      const first = document.querySelector(".field.error input, .field.error select");
      first?.focus();
      return;
    }
    inFlightRef.current = true;
    setSubmitting(true);
    try {
      const turnstileToken = await getTurnstileToken();
      const res = await fetch(APPLY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          ...attribution,
          turnstileToken,
          source: "athlix-website",
          submittedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setDone(true);
        setValues(initialForm);
        return;
      }

      // Server is the source of truth. Surface its safe, field-level messages.
      let data = null;
      try { data = await res.json(); } catch { /* ignore non-JSON */ }
      if (res.status === 400 && data?.fields && typeof data.fields === "object") {
        setErrors(data.fields);
        const first = document.querySelector(".field.error input, .field.error select");
        first?.focus();
        setServerError(data.error || "Please correct the highlighted fields.");
      } else if (res.status === 429) {
        setServerError("Too many attempts. Please wait a little while and try again.");
      } else {
        setServerError(data?.error || "Something went wrong. Please try again, or reach us on WhatsApp.");
      }
    } catch {
      setServerError("Something went wrong. Please try again, or reach us on WhatsApp.");
    } finally {
      inFlightRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <section id="apply" className="section">
      <RevealGroup className="shell apply-grid">
        <Reveal group>
          <p className="eyebrow">Start Your Transformation</p>
          <h2 className="section-title">Fill Your Application</h2>
          <p className="section-lede" style={{ marginInline: 0 }}>
            Tell us about your goals. Our team personally reviews every application and reaches out
            within 48 hours to the best-fit applicants.
          </p>
          <ul className="apply-points">
            <li><span className="step">1</span><div><strong>We review your application</strong><span>Personally evaluated within 48 hours.</span></div></li>
            <li><span className="step">2</span><div><strong>A short alignment call</strong><span>We align on your goals and the right pathway.</span></div></li>
            <li><span className="step">3</span><div><strong>Your personalized roadmap</strong><span>You receive a coaching plan built around your life.</span></div></li>
          </ul>
        </Reveal>

        <Reveal group as="div">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="success"
                className="apply-form"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="apply-success">
                  <span className="check-circle"><Icon.Check /></span>
                  <h3>Application Received</h3>
                  <p>Thank you. The Athlix team will personally review your application and reach out within 48 hours.</p>
                  <button className="btn btn-ghost" style={{ marginTop: 22 }} onClick={() => setDone(false)}>
                    Submit another application
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="apply-form"
                onSubmit={onSubmit}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Field label="Full Name" id="name" error={errors.name}>
                  <input id="name" type="text" value={values.name} onChange={update("name")} placeholder="Your name" autoComplete="name" />
                </Field>
                <Field label="Phone Number" id="phone" error={errors.phone}>
                  <PhoneInput
                    id="phone"
                    international
                    defaultCountry="IN"
                    flags={flags}
                    countryCallingCodeEditable={false}
                    value={values.phone}
                    onChange={updatePhone}
                    placeholder="98765 43210"
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Email" id="email" error={errors.email}>
                  <input id="email" type="email" value={values.email} onChange={update("email")} placeholder="you@email.com" autoComplete="email" />
                </Field>
                <Field label="Current Weight (kg)" id="currentWeight" error={errors.currentWeight}>
                  <input id="currentWeight" type="text" value={values.currentWeight} onChange={update("currentWeight")} placeholder="e.g. 82" />
                </Field>
                <Field label="Gender" id="gender" error={errors.gender}>
                  <select id="gender" value={values.gender} onChange={update("gender")}>
                    <option value="" disabled>Select</option>
                    {genderOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <p className="field-hint">Women-friendly coaching environment.</p>
                </Field>
                <Field label="Preferred Coaching Pathway" id="pathway" error={errors.pathway}>
                  <select id="pathway" value={values.pathway} onChange={update("pathway")}>
                    <option value="" disabled>Select</option>
                    {pathwayOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="What challenges are you facing?" id="message" wide>
                  <textarea
                    id="message"
                    rows="4"
                    value={values.message}
                    onChange={update("message")}
                    placeholder="Tell us about your current challenges, fitness goals, previous attempts, injuries (if any), lifestyle, or anything you'd like Coach Abhishek to know before reviewing your application."
                  />
                </Field>

                {/* Honeypot: hidden from real users; bots that auto-fill it are dropped server-side. */}
                <div className="hp-field" aria-hidden="true">
                  <label htmlFor="company">Company (leave this empty)</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values.company}
                    onChange={update("company")}
                  />
                </div>

                {serverError && (
                  <div className="form-status err" role="alert"><Icon.X /> {serverError}</div>
                )}

                <button
                  className="btn btn-primary btn-lg btn-block apply-submit-btn"
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting ? (
                    <span className="btn-loading">
                      <span className="spinner" aria-hidden="true" /> Submitting…
                    </span>
                  ) : (
                    "Send Your Application"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </RevealGroup>
    </section>
  );
}

function Field({ label, id, error, wide, children }) {
  return (
    <div className={`field ${wide ? "wide" : ""} ${error ? "error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="err-msg">{error}</span>}
    </div>
  );
}

/* =====================================================================
   Footer
   ===================================================================== */

function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-stack">
        <Logo />
        <nav className="footer-links" aria-label="Footer">
          <a href="#top">Home</a>
          <span className="dot" aria-hidden="true">•</span>
          <a href="#transformations">Transformations</a>
          <span className="dot" aria-hidden="true">•</span>
          <a href="#method">Method</a>
          <span className="dot" aria-hidden="true">•</span>
          <a href="#pathways">Pathways</a>
          <span className="dot" aria-hidden="true">•</span>
          <a href="#coach">Coach</a>
          <span className="dot" aria-hidden="true">•</span>
          <a href="#testimonials">Testimonials</a>
          <span className="dot" aria-hidden="true">•</span>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="footer-links">
          <a href="https://www.instagram.com/coachavk" target="_blank" rel="noreferrer">Instagram</a>
          <span className="dot" aria-hidden="true">•</span>
          <a href="https://wa.me/919030153337" target="_blank" rel="noreferrer">WhatsApp</a>
          <span className="dot" aria-hidden="true">•</span>
          <a href="mailto:info@athlix.in">info@athlix.in</a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Athlix. All rights reserved.</span>
          <span>Built for transformation that lasts.</span>
        </div>
      </div>
    </footer>
  );
}

/* =====================================================================
   Sticky mobile CTA + scroll progress
   ===================================================================== */

function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="sticky-cta"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <strong>Ready to transform?</strong>
            <span>Get your personalized roadmap.</span>
          </div>
          <a className="btn btn-primary btn-sm" href="#apply">Apply <Icon.Arrow /></a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ScrollProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      setW(Math.min(100, Math.max(0, p * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="scroll-progress"
      style={{ width: `${w}%`, opacity: w > 0.3 ? 1 : 0 }}
      aria-hidden="true"
    />
  );
}

/* Global cursor-follow spotlight (Linear.dev feel): a soft, heavily blurred
   low-opacity blue glow that tracks the mouse across the whole site.
   Disabled on touch / reduced-motion. Uses a GPU transform (no re-renders). */
function CursorGlow() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return undefined;
    // Skip on touch-primary devices (no hovering pointer).
    if (window.matchMedia && window.matchMedia("(hover: none)").matches) return undefined;

    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const render = () => {
      raf = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      document.body.classList.add("cursor-active");
      if (!raf) raf = requestAnimationFrame(render);
    };
    const onLeave = () => document.body.classList.remove("cursor-active");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}

/* =====================================================================
   App
   ===================================================================== */

export default function App() {
  // Lenis smooth scrolling (rAF-driven, wheel input). Touch stays native —
  // platform momentum scrolling already feels right, and hijacking it is what
  // makes sites feel floaty. Skipped entirely under prefers-reduced-motion;
  // scroll events still fire normally, so ScrollProgress/StickyMobileCTA and
  // the header work unchanged.
  const lenisRef = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenisRef.current = lenis;
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smooth in-page navigation with a dynamically-measured navbar offset.
  // Scrolls past each section's top padding so the heading lands right under
  // the fixed navbar — consistent on every screen size, no hardcoded values.
  useEffect(() => {
    // Route programmatic scrolls through Lenis when active so anchor
    // navigation uses the same easing as wheel scrolling.
    const smoothTo = (top) => {
      if (lenisRef.current) lenisRef.current.scrollTo(top, { duration: 0.95 });
      else window.scrollTo({ top, behavior: "smooth" });
    };
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;

      e.preventDefault();
      // Release the mobile-menu scroll lock so scrollTo can run immediately.
      document.body.style.overflow = "";

      const header = document.querySelector(".site-header");
      const headerH = header ? header.offsetHeight : 0;
      const GAP = 14; // small breathing space below the navbar

      if (id === "top") {
        smoothTo(0);
        history.replaceState(null, "", window.location.pathname + window.location.search);
        return;
      }

      // Land at the section's content (after its top padding), under the navbar.
      const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0;
      const y = window.scrollY + el.getBoundingClientRect().top + padTop - headerH - GAP;
      smoothTo(Math.max(0, y));
      history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Header />
      <main>
        <Hero />
        <Transformations />
        <ProblemSolution />
        <CoachingMethod />
        <Pathways />
        <Coach />
        <Certifications />
        <Testimonials />
        <FAQ />
        <ApplicationForm />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
