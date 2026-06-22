import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { useTheme } from "./theme/ThemeContext.jsx";
import { Icon } from "./components/icons.jsx";

/* assets */
import heroImage from "./assets/1.webp";
import coachImage from "./assets/images/Coach.webp"; // optimized from Images/Coach.jpg
import blueTick from "./assets/Blue_tick.png";

import s1 from "./assets/2_1.webp";
import s2 from "./assets/2_2.webp";
import s3 from "./assets/2_3.webp";
import s4 from "./assets/2_4.webp";
import s5 from "./assets/2_5.webp";
import s6 from "./assets/2_6.webp";
import s7 from "./assets/2_7.webp";
import s8 from "./assets/2_8.webp";
import s9 from "./assets/2_9.webp";
import s10 from "./assets/2_10.webp";
import s11 from "./assets/2_11.webp";
import s12 from "./assets/2_12.webp";
import s13 from "./assets/2_13.webp";
import s14 from "./assets/2_14.webp";
import s15 from "./assets/2_15.webp";
import r1 from "./assets/4_1.webp";
import r2 from "./assets/4_2.webp";
import r3 from "./assets/4_3.webp";

/* certification logos */
import certAce from "./assets/certs/ace.webp";
import certK11 from "./assets/certs/k11.jpg";
import certEkfa from "./assets/certs/ekfa.png";
import certFitnessMatters from "./assets/certs/fitness-matters.png";
import certActiveIq from "./assets/certs/active-iq.png";
import certRepsUae from "./assets/certs/reps-uae.png";
import certUsReps from "./assets/certs/us-reps.png";
import certTeamBoss from "./assets/certs/team-boss.webp";
import certJlo from "./assets/certs/jlo.avif";
import certMnu from "./assets/certs/mnu.png";
import certAicvps from "./assets/certs/aicvps.jpeg";
import certEcna from "./assets/certs/ecna.png";

/* =====================================================================
   Data
   ===================================================================== */

const trustMetrics = [
  { num: "18+", lbl: "Years Experience" },
  { num: "100+", lbl: "Transformations" },
  { num: "6", lbl: "Countries Served" },
  { num: "ACE", lbl: "Certified Coach" },
];

const allTransformImages = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15];

const transformations = [
  { img: s1, duration: "20 Weeks", goal: "18 kg Fat Loss", quote: "I finally stopped guessing and followed a system that worked around my schedule." },
  { img: s4, duration: "16 Weeks", goal: "Body Recomposition", quote: "Structure replaced motivation. The progress became almost automatic." },
  { img: s2, duration: "14 Weeks", goal: "12 kg Fat Loss", quote: "Weekly accountability kept me consistent even on my hardest weeks." },
  { img: s7, duration: "24 Weeks", goal: "Lifestyle Transformation", quote: "It wasn't a diet — it became the way I live now." },
  { img: s5, duration: "18 Weeks", goal: "Strength + Definition", quote: "The coaching adapted as my body and goals evolved." },
  { img: s9, duration: "22 Weeks", goal: "15 kg Fat Loss", quote: "Daily support made the difference I never had before." },
  { img: s11, duration: "12 Weeks", goal: "Visible Recomposition", quote: "Clear, sustainable, and built entirely around my real life." },
  { img: s12, duration: "26 Weeks", goal: "Confidence + Composition", quote: "I trust the process now because I understand it." },
  { img: s8, duration: "20 Weeks", goal: "Sustainable Fat Loss", quote: "No crash diets — just consistent, coached progress." },
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
    desc: "Build the foundation. We create awareness, fix daily habits, and establish the consistency every transformation depends on.",
    points: ["Build Awareness", "Fix Habits", "Create Consistency"],
  },
  {
    step: "Stage 02",
    title: "REBUILD",
    desc: "Develop the systems. Nutrition and training evolve into a repeatable structure that compounds results over time.",
    points: ["Improve Nutrition", "Develop Systems", "Increase Performance"],
  },
  {
    step: "Stage 03",
    title: "RISE",
    desc: "Master the lifestyle. Advanced body composition and long-term sustainability become a permanent part of who you are.",
    points: ["Lifestyle Mastery", "Long-Term Sustainability", "Advanced Body Composition"],
  },
];

const pathways = [
  {
    icon: <Icon.Monitor />,
    title: "Online Coaching",
    desc: "A structured remote transformation experience with expert direction from anywhere in the world.",
    items: ["Remote Coaching", "Weekly Reviews", "App Support", "Personalized Programming"],
  },
  {
    icon: <Icon.MapPin />,
    title: "Offline Coaching",
    desc: "Hands-on, face-to-face coaching for clients who want direct support inside the training environment.",
    items: ["Face To Face Coaching", "Direct Assessments", "In-Gym Guidance", "Personal Support"],
  },
  {
    icon: <Icon.Layers />,
    title: "Hybrid Coaching",
    featured: true,
    badge: "Most Recommended",
    desc: "Program designed personally by Coach Abhishek. Daily follow-ups, accountability, and support handled by the Athlix Assistant Team.",
    items: ["Best of Online + Offline", "Faster Communication", "Greater Accountability", "Continuous Support"],
  },
];

const coachStats = [
  { num: "18+", lbl: "Years Experience" },
  { num: "100+", lbl: "Transformations" },
  { num: "6", lbl: "Countries Served" },
  { num: "ACE", lbl: "Certified" },
];

const specializations = ["Fat Loss", "Body Recomposition", "Lifestyle Transformation", "Sustainable Coaching"];

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

const socialMetrics = [
  { value: 100, suffix: "+", lbl: "Transformations" },
  { value: 18, suffix: "+", lbl: "Years Experience" },
  { value: 6, suffix: "+", lbl: "Countries Served" },
  { value: 95, suffix: "%", lbl: "Client Satisfaction" },
];

const faqs = [
  { q: "How is Athlix different from a normal gym or diet plan?", a: "Athlix is not a downloadable plan — it is a coaching relationship. We combine personalized programming, weekly accountability, and lifestyle design to produce results that actually last." },
  { q: "What is the Athlix Coaching Method?", a: "A dynamic three-stage framework — Reset, Rebuild, Rise — that adapts as your body, lifestyle, and goals evolve. The process is never fixed; it changes with your progress." },
  { q: "Do I need gym access to start?", a: "No. Your program is built around your access — home, hotel, or full gym — based on your training history, equipment, and goals." },
  { q: "How does Hybrid Coaching work?", a: "Coach Abhishek designs your overall strategy personally. The Athlix Assistant Team handles daily follow-ups, accountability, and support so nothing falls through the cracks." },
  { q: "Is Athlix beginner friendly?", a: "Yes. The Reset stage is designed to help beginners build awareness and consistency before intensity increases. Every plan is scaled to your starting point." },
  { q: "How long does a transformation take?", a: "Most clients see meaningful change within 8–16 weeks of consistent execution. A complete, sustainable transformation is typically a 6–12 month journey." },
  { q: "Do you work with international clients?", a: "Yes. Athlix coaches clients across 6 countries — fully online, with optional in-person support for hybrid clients." },
  { q: "What happens after I apply?", a: "We personally review your application, invite the best-fit applicants to a consultation, and align on goals before building your personalized roadmap." },
];

/* =====================================================================
   Motion helpers
   ===================================================================== */

function Reveal({ children, delay = 0, y = 26, className, as = "div" }) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}

function SectionHead({ eyebrow, title, lede, align = "center" }) {
  return (
    <Reveal className={`section-head ${align === "left" ? "left" : ""}`}>
      {eyebrow && <p className={`eyebrow ${align === "center" ? "center" : ""}`}>{eyebrow}</p>}
      <h2 className="section-title">{title}</h2>
      {lede && <p className="section-lede">{lede}</p>}
    </Reveal>
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

function Logo() {
  return (
    <a href="#top" className="logo-mark" aria-label="Athlix home">
      ATH<span className="accent">LIX</span>
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
          <a className="btn btn-primary btn-sm header-cta" href="#apply">Apply For Coaching</a>
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
          Apply For Coaching <Icon.Arrow />
        </a>
      </div>
    </>
  );
}

/* =====================================================================
   Hero
   ===================================================================== */

function Hero() {
  const reduce = useReducedMotion();
  return (
    <section id="top" className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <span className="hero-glow a" aria-hidden="true" />
      <span className="hero-glow b" aria-hidden="true" />

      <div className="shell hero-grid">
        <div>
          <Reveal>
            <span className="hero-badge">
              <span className="pip" /> Premium Transformation Coaching
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="hero-title">
              <span className="line">Transform Your Body.</span>
              <span className="line">Rebuild Your Lifestyle.</span>
              <span className="line dim">Create Results That Last.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="hero-sub">
              Personalized transformation coaching built around accountability, nutrition,
              training, and sustainable behavior change.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="cta-row">
              <a className="btn btn-primary btn-lg" href="#apply">Apply For Coaching <Icon.Arrow /></a>
              <a className="btn btn-secondary btn-lg" href="#apply">Book Consultation</a>
            </div>
          </Reveal>
        </div>

        <motion.div
          className="hero-visual"
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="hero-photo">
            <img src={heroImage} alt="Athlix transformation coaching client" fetchpriority="high" />
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
            <div className="stat-label">Real transformations<br />across 6 countries</div>
          </motion.div>
        </motion.div>
      </div>

      <div className="shell">
        <Reveal delay={0.2}>
          <div className="trust-bar">
            {trustMetrics.map((m) => (
              <div className="trust-cell" key={m.lbl}>
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

function Transformations() {
  return (
    <section id="transformations" className="section">
      <div className="shell">
        <SectionHead
          eyebrow="Real Client Proof"
          title={<>Real People. <span className="accent">Real Transformations.</span></>}
          lede="See how Athlix clients reshaped their bodies, habits, and confidence — and kept the results for life."
        />

        {/* Desktop / tablet masonry */}
        <div className="transform-masonry">
          {transformations.map((t, i) => (
            <Reveal key={i} delay={(i % 3) * 0.08} className="t-card">
              <div className="t-card-media">
                <img src={t.img} alt={`Athlix client transformation — ${t.goal}`} loading="lazy" />
                <span className="t-tag"><Icon.Star style={{ width: 12, height: 12, color: "#f5a623" }} /> {t.duration}</span>
              </div>
              <div className="t-card-body">
                <div className="t-card-meta">
                  <span className="t-chip">{t.goal}</span>
                  <span className="t-chip neutral">{t.duration}</span>
                </div>
                <blockquote>“{t.quote}”</blockquote>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="t-carousel">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 2600, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            spaceBetween={16}
            slidesPerView={1.15}
            loop
          >
            {allTransformImages.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="t-slide">
                  <img src={img} alt={`Athlix transformation result ${i + 1}`} loading="lazy" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
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
    <section className="section bg-subtle">
      <div className="shell">
        <SectionHead
          eyebrow="The Real Difference"
          title={<>Why Most Attempts Fail — <span className="accent">And Why Clients Succeed</span></>}
          lede="Transformation rarely fails from lack of effort. It fails from lack of structure, accountability, and a system built around real life."
        />
        <div className="compare-grid">
          <Reveal className="compare-card problem">
            <h3>Why Most Fat Loss Attempts Fail</h3>
            <ul className="compare-list">
              {problems.map((p) => (
                <li key={p}>
                  <span className="compare-icon x"><Icon.X /></span>
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="compare-card solution">
            <h3>Why Athlix Clients Succeed</h3>
            <ul className="compare-list">
              {solutions.map((s) => (
                <li key={s}>
                  <span className="compare-icon check"><Icon.Check /></span>
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   The Athlix Coaching Method
   ===================================================================== */

function CoachingMethod() {
  return (
    <section id="method" className="section">
      <div className="shell">
        <SectionHead
          eyebrow="The Framework"
          title={<>The Athlix <span className="accent">Coaching Method</span></>}
          lede="A dynamic coaching framework that adapts as your body, lifestyle, and goals evolve."
        />
        <p className="method-supporting">
          The process is not fixed. Every stage evolves based on progress, challenges, lifestyle
          demands, and long-term transformation goals.
        </p>

        <div className="timeline">
          {methodStages.map((stage, i) => (
            <Reveal key={stage.title} delay={i * 0.12} className="stage-card">
              <div className="stage-node">{String(i + 1).padStart(2, "0")}</div>
              <div className="stage-step">{stage.step}</div>
              <h3>{stage.title}</h3>
              <p className="stage-desc">{stage.desc}</p>
              <ul className="stage-points">
                {stage.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   Coaching Pathways
   ===================================================================== */

function Pathways() {
  return (
    <section id="pathways" className="section bg-subtle">
      <div className="shell">
        <SectionHead
          eyebrow="Coaching Pathways"
          title={<>Choose Your <span className="accent">Coaching Pathway</span></>}
          lede="Every pathway is built to move you from uncertainty to execution with the right level of expert support."
        />
        <div className="pathway-grid">
          {pathways.map((p) => (
            <Reveal key={p.title} className={`pathway-card ${p.featured ? "featured" : ""}`}>
              {p.badge && <span className="pathway-badge"><Icon.Star style={{ width: 12, height: 12 }} /> {p.badge}</span>}
              <span className="pathway-icon">{p.icon}</span>
              <h3>{p.title}</h3>
              <p className="pathway-desc">{p.desc}</p>
              <ul className="pathway-list">
                {p.items.map((it) => (
                  <li key={it}><Icon.Check /> {it}</li>
                ))}
              </ul>
              <a className={`btn btn-lg ${p.featured ? "btn-accent" : "btn-ghost"}`} href="#apply">
                Apply For Coaching <Icon.Arrow />
              </a>
            </Reveal>
          ))}
        </div>
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
        <div className="coach-grid">
          <Reveal className="coach-photo">
            <img src={coachImage} alt="Coach Abhishek — Athlix founder and transformation coach" loading="lazy" />
            <div className="float">
              <div>
                <strong>18+</strong>
                <span>Years coaching</span>
              </div>
              <div>
                <strong>100+</strong>
                <span>Clients transformed</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="coach-copy">
            <p className="eyebrow">Founder-Led Coaching</p>
            <h2 className="section-title">Meet Coach Abhishek</h2>
            <p>
              Coach Abhishek leads Athlix as a premium transformation coaching practice for people
              who want sustainable fat loss, stronger bodies, and higher confidence — without the
              extreme, short-term approaches that always fail.
            </p>
            <p>
              With 18+ years of coaching, international certifications, and a science-driven method,
              he has helped professionals, founders, and athletes across 6 countries transform their
              bodies and their relationship with training, food, and discipline.
            </p>

            <div className="coach-stats">
              {coachStats.map((s) => (
                <div key={s.lbl}>
                  <div className="num">{s.num}</div>
                  <div className="lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            <div className="spec-row">
              {specializations.map((sp) => (
                <span className="spec-chip" key={sp}><Icon.Shield /> {sp}</span>
              ))}
            </div>

            <a className="btn btn-primary btn-lg" href="#apply">Work With Coach Abhishek <Icon.Arrow /></a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   Certifications wall
   ===================================================================== */

function Certifications() {
  return (
    <section className="section bg-subtle">
      <div className="shell">
        <SectionHead
          eyebrow="Credentials & Certifications"
          title={<>Backed By <span className="accent">World-Class Credentials</span></>}
          lede="Coaching grounded in internationally recognized education, certification, and accreditation."
        />
        <div className="cert-wall">
          {certifications.map((c, i) => (
            <Reveal key={c.name} delay={(i % 4) * 0.06} className="cert-tile">
              <div className="cert-logo">
                <img src={c.logo} alt={`${c.full} certification logo`} loading="lazy" />
              </div>
              <div>
                <div className="cert-name">{c.name}</div>
              </div>
              <div className="cert-year">{c.year}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   Testimonials (auto-scrolling marquee)
   ===================================================================== */

function TestimonialCard({ t }) {
  return (
    <div className="tst-card">
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
    <section id="testimonials" className="section">
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
   Social proof (animated counters)
   ===================================================================== */

function useCountUp(target, run, duration = 1600) {
  const [val, setVal] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!run || reduce) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration, reduce]);
  return reduce ? target : val;
}

function Metric({ m, run }) {
  const val = useCountUp(m.value, run);
  return (
    <div className="metric">
      <div className="num">{val}<span className="suffix">{m.suffix}</span></div>
      <div className="lbl">{m.lbl}</div>
    </div>
  );
}

function SocialProof() {
  const ref = useRef(null);
  // If IntersectionObserver is unavailable, run counters immediately.
  const [run, setRun] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window));
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRun(true); io.disconnect(); } },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section className="section bg-subtle">
      <div className="shell" ref={ref}>
        <div className="metrics-grid">
          {socialMetrics.map((m) => (
            <Metric key={m.lbl} m={m} run={run} />
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="faq-a-inner">{item.a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section">
      <div className="shell faq-shell">
        <SectionHead
          eyebrow="Questions"
          title="Frequently Asked Questions"
          lede="Clear, honest answers before you apply for coaching."
        />
        <Reveal>
          <div>
            {faqs.map((f, i) => (
              <FAQItem key={f.q} item={f} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =====================================================================
   Application form
   ===================================================================== */

// Optional CRM / Google Sheets endpoint. Set VITE_FORM_ENDPOINT to enable a
// real POST (e.g. a Google Apps Script Web App, Formspree, or your CRM webhook).
const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || "";

const goalOptions = ["Fat Loss", "Body Recomposition", "Muscle Gain", "Lifestyle Transformation", "General Fitness"];
const pathwayOptions = ["Online Coaching", "Offline Coaching", "Hybrid Coaching", "Not Sure Yet"];
const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

const initialForm = {
  name: "", phone: "", email: "", age: "", gender: "",
  currentWeight: "", goal: "", pathway: "", message: "",
};

function validate(values) {
  const e = {};
  if (!values.name.trim()) e.name = "Please enter your name";
  if (!/^[+\d][\d\s-]{6,}$/.test(values.phone.trim())) e.phone = "Enter a valid phone number";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) e.email = "Enter a valid email";
  if (!values.age || Number(values.age) < 14 || Number(values.age) > 99) e.age = "Enter a valid age";
  if (!values.gender) e.gender = "Please select";
  if (!values.currentWeight.trim()) e.currentWeight = "Required";
  if (!values.goal) e.goal = "Please select a goal";
  if (!values.pathway) e.pathway = "Please select a pathway";
  return e;
}

function ApplicationForm() {
  const [values, setValues] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const update = (key) => (ev) => {
    setValues((v) => ({ ...v, [key]: ev.target.value }));
    setErrors((er) => (er[key] ? { ...er, [key]: undefined } : er));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerError("");
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).some((k) => errs[k])) {
      const first = document.querySelector(".field.error input, .field.error select");
      first?.focus();
      return;
    }
    setSubmitting(true);
    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, source: "athlix-website", submittedAt: new Date().toISOString() }),
        });
        if (!res.ok) throw new Error("Request failed");
      } else {
        // No backend configured yet — simulate the request so the UX is complete.
        await new Promise((r) => setTimeout(r, 1100));
      }
      setDone(true);
      setValues(initialForm);
    } catch {
      setServerError("Something went wrong. Please try again, or reach us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="apply" className="section bg-subtle">
      <div className="shell apply-grid">
        <Reveal>
          <p className="eyebrow">Start Your Transformation</p>
          <h2 className="section-title">Apply For Coaching</h2>
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

        <Reveal delay={0.1} as="div">
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
                <Field label="Phone" id="phone" error={errors.phone}>
                  <input id="phone" type="tel" value={values.phone} onChange={update("phone")} placeholder="+91 00000 00000" autoComplete="tel" />
                </Field>
                <Field label="Email" id="email" error={errors.email}>
                  <input id="email" type="email" value={values.email} onChange={update("email")} placeholder="you@email.com" autoComplete="email" />
                </Field>
                <Field label="Age" id="age" error={errors.age}>
                  <input id="age" type="number" min="14" max="99" value={values.age} onChange={update("age")} placeholder="28" />
                </Field>
                <Field label="Gender" id="gender" error={errors.gender}>
                  <select id="gender" value={values.gender} onChange={update("gender")}>
                    <option value="" disabled>Select</option>
                    {genderOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Current Weight (kg)" id="currentWeight" error={errors.currentWeight}>
                  <input id="currentWeight" type="text" value={values.currentWeight} onChange={update("currentWeight")} placeholder="e.g. 82" />
                </Field>
                <Field label="Primary Goal" id="goal" error={errors.goal}>
                  <select id="goal" value={values.goal} onChange={update("goal")}>
                    <option value="" disabled>Select</option>
                    {goalOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Preferred Coaching Pathway" id="pathway" error={errors.pathway}>
                  <select id="pathway" value={values.pathway} onChange={update("pathway")}>
                    <option value="" disabled>Select</option>
                    {pathwayOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Message (optional)" id="message" wide>
                  <textarea id="message" rows="4" value={values.message} onChange={update("message")} placeholder="Tell us about your goals, challenges, and why you want to transform now." />
                </Field>

                {serverError && (
                  <div className="form-status err" role="alert"><Icon.X /> {serverError}</div>
                )}

                <button className="btn btn-primary btn-lg btn-block field wide" type="submit" disabled={submitting}>
                  {submitting ? <><span className="spinner" /> Submitting…</> : <>Submit Application <Icon.Arrow /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
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
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>
              Athlix is a premium international transformation coaching company helping ambitious
              people transform their bodies, lifestyles, and confidence — built on a proven,
              adaptive coaching method.
            </p>
            <div className="footer-socials">
              <a href="https://www.instagram.com/coachavk" target="_blank" rel="noreferrer" aria-label="Instagram"><Icon.Instagram /></a>
              <a href="https://wa.me/910000000000" target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon.WhatsApp /></a>
              <a href="mailto:hello@athlix.co" aria-label="Email"><Icon.Mail /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <a href="#top">Home</a>
            <a href="#transformations">Transformations</a>
            <a href="#method">Method</a>
            <a href="#coach">Coach</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#apply">Apply</a>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <a href="https://www.instagram.com/coachavk" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://wa.me/910000000000" target="_blank" rel="noreferrer">WhatsApp</a>
            <a href="mailto:hello@athlix.co">hello@athlix.co</a>
          </div>
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
  return <div className="scroll-progress" style={{ width: `${w}%` }} aria-hidden="true" />;
}

/* =====================================================================
   App
   ===================================================================== */

export default function App() {
  return (
    <>
      <ScrollProgress />
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
        <SocialProof />
        <FAQ />
        <ApplicationForm />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
