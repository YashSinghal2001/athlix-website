import React, { useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import heroImage from "./assets/1.png";
import coachImage from "./assets/1_14.png";
import storyOne from "./assets/2_1.png";
import storyTwo from "./assets/2_2.png";
import storyThree from "./assets/2_3.png";
import storyFour from "./assets/2_4.png";
import storyFive from "./assets/2_5.png";
import storySix from "./assets/2_6.png";
import storySeven from "./assets/2_7.png";
import storyEight from "./assets/2_8.png";
import storyNine from "./assets/2_9.png";
import storyTen from "./assets/2_10.png";
import storyEleven from "./assets/2_11.png";
import storyTwelve from "./assets/2_12.png";
import storyThirteen from "./assets/2_13.png";
import storyFourteen from "./assets/2_14.png";
import storyFifteen from "./assets/2_15.png";
import reviewOne from "./assets/4_1.png";
import reviewTwo from "./assets/4_2.png";
import reviewThree from "./assets/4_3.png";
import instagramIcon from "./assets/instagram.png";
import blueTick from "./assets/Blue_tick.png";

/* ===================== Data ===================== */

const trustIndicators = [
  { label: "Certified Coaches", icon: "✓" },
  { label: "Personalized Coaching", icon: "★" },
  { label: "Online & Offline Support", icon: "◉" },
  { label: "Proven Transformation System", icon: "↗" },
];

const marqueeItems = [
  "Personalized Coaching",
  "Daily Accountability",
  "Fat Loss Systems",
  "Habit Building",
  "Progress Reviews",
  "RRR Method",
  "International Clients",
  "Sustainable Results",
];

const featuredTransformations = [
  {
    before: storyOne,
    after: storyEight,
    name: "Rohan Mehta",
    result: "18 kg lost",
    timeline: "20 weeks",
    occupation: "Product Manager",
    quote:
      "The biggest change was not just my body. I finally stopped guessing and had a system I could follow even on the busiest weeks.",
  },
  {
    before: storySix,
    after: storyTwelve,
    name: "Meera Kapoor",
    result: "12 kg lost",
    timeline: "16 weeks",
    occupation: "Founder",
    quote:
      "Athlix helped me build structure around a demanding schedule — no crash diets, no panic, just consistent progress.",
  },
  {
    before: storyThree,
    after: storyFifteen,
    name: "Arjun Singh",
    result: "Visible recomposition",
    timeline: "14 weeks",
    occupation: "Consultant",
    quote:
      "Weekly reviews and daily accountability made the process feel clear and sustainable. I trust the system now.",
  },
];

const transformationImages = [
  storyOne, storyTwo, storyThree, storyFour, storyFive,
  storySix, storySeven, storyEight, storyNine, storyTen,
  storyEleven, storyTwelve, storyThirteen, storyFourteen, storyFifteen,
];

const failurePoints = [
  "Random dieting with no strategy",
  "Zero accountability after week two",
  "Workouts that don't match your life",
  "No expert to adjust the plan",
  "Motivation-led, not system-led approach",
];

const differencePoints = [
  "Personalized coaching built around you",
  "Daily accountability touchpoints",
  "Habit and lifestyle design",
  "Weekly progress reviews",
  "Expert guidance at every step",
];

const rrrStages = [
  {
    stage: "01",
    title: "RESET",
    description: "Fix habits, improve awareness, and establish consistency.",
    detail: "We rebuild the foundation: nutrition clarity, baseline tracking, routine design, and early visible wins.",
    features: ["Habit audit", "Baseline tracking", "Routine design", "Nutrition clarity"],
  },
  {
    stage: "02",
    title: "REBUILD",
    description: "Build strength, improve metabolism, and create sustainable routines.",
    detail: "Progressive training, smarter food systems, and weekly performance reviews that compound over time.",
    features: ["Progressive training", "Metabolic reset", "Weekly reviews", "Strength gain"],
  },
  {
    stage: "03",
    title: "RISE",
    description: "Achieve long-term transformation, confidence, and lifestyle mastery.",
    detail: "Identity-level habits, confident maintenance, and the systems to keep results for life.",
    features: ["Identity shift", "Confident maintenance", "Long-term support", "Lifestyle mastery"],
  },
];

const coachingOptions = [
  {
    title: "Online Coaching",
    description: "A structured remote transformation experience for clients who need expert direction from anywhere in the world.",
    items: ["Personalized Workout Plan", "Nutrition Guidance", "Weekly Reviews", "Progress Tracking", "Online Support"],
  },
  {
    title: "Offline Coaching",
    description: "In-person coaching for clients who want hands-on support inside the training environment.",
    items: ["In-Person Guidance", "Personalized Coaching", "Gym Support", "Performance Tracking"],
  },
  {
    title: "Hybrid Coaching",
    badge: "Most Popular",
    highlighted: true,
    description:
      "Designed personally by Coach Abhishek. Daily accountability, follow-ups, progress monitoring, and client support are handled by the Athlix Assistant.",
    items: ["Coach-designed strategy", "Daily accountability", "Follow-up support", "Progress monitoring", "Online + offline structure"],
    meta: "Best results • Personal design",
  },
];

const coachStats = [
  { value: "18+", label: "Years coaching" },
  { value: "ACE", label: "Certified PT" },
  { value: "100+", label: "Transformations" },
  { value: "6", label: "Countries served" },
];

const coachBadges = [
  "Certified Personal Trainer (ACE)",
  "Active IQ Level 3 (UK)",
  "K11 Fitness Academy",
  "REPs UAE & USA",
  "Weight Management Specialist",
];

const testimonials = [
  {
    type: "Video Review",
    name: "Nisha Rao",
    role: "Marketing Lead",
    initials: "NR",
    quote: "I had tried plans before, but this was the first time someone adjusted the process around my work, travel, and real life.",
  },
  {
    type: "Client Review",
    name: "Kabir Khanna",
    role: "Finance Professional",
    initials: "KK",
    quote: "The weekly review system kept me honest. I knew exactly what was working and what needed to change.",
  },
  {
    type: "Success Story",
    name: "Sara Iyer",
    role: "Entrepreneur",
    initials: "SI",
    quote: "I gained confidence in how I looked, how I trained, and how I managed food without fear or restriction.",
  },
  {
    type: "Transformation",
    name: "Vikram Joshi",
    role: "Software Architect",
    initials: "VJ",
    quote: "It wasn't about losing weight. It was about gaining a system that finally worked for someone with my schedule.",
  },
];

const others = ["Generic workout plans", "No accountability", "Temporary results", "One-time guidance", "Motivation based"];
const athlix = ["Personalized coaching", "Daily accountability", "Sustainable transformation", "Continuous support", "System led"];

const faqItems = [
  { question: "How is Athlix different from a normal gym or diet plan?", answer: "Athlix is not a plan you download — it is a coaching relationship. We combine personalized programming, daily accountability, weekly reviews, and lifestyle design to produce results that actually last." },
  { question: "Do I need gym access to start?", answer: "No. Your plan is built around your access — home, hotel, or full gym — based on your training history, equipment, and goals." },
  { question: "Is Athlix beginner friendly?", answer: "Yes. The RESET stage is designed to help beginners build confidence, consistency, and awareness before intensity increases. Every plan is scaled to your starting point." },
  { question: "How does the Hybrid Coaching experience work?", answer: "Coach Abhishek designs the overall strategy and the Athlix Assistant handles daily accountability, follow-ups, progress monitoring, and client communication so nothing falls through the cracks." },
  { question: "How often are reviews and check-ins?", answer: "Reviews happen weekly with structured metrics. Daily accountability touchpoints are also included, depending on the coaching experience you select." },
  { question: "How long does a transformation usually take?", answer: "Every body and schedule is different, but most clients begin seeing meaningful changes within 8 to 16 weeks when execution is consistent. Sustainable transformation is a 6–12 month arc." },
  { question: "Do you work with international clients?", answer: "Yes. Athlix coaches clients across India, UAE, the UK, USA, Canada, and Australia — fully online with optional in-person for hybrid clients." },
];

const formFields = [
  { id: "fullName", label: "Full Name", type: "text" },
  { id: "age", label: "Age", type: "number" },
  { id: "gender", label: "Gender", type: "select", options: ["", "Male", "Female", "Non-binary", "Prefer not to say"] },
  { id: "currentWeight", label: "Current Weight (kg)", type: "text" },
  { id: "goalWeight", label: "Goal Weight (kg)", type: "text" },
  { id: "occupation", label: "Occupation", type: "text" },
  { id: "city", label: "City / Country", type: "text" },
  { id: "phone", label: "Phone Number", type: "tel" },
  { id: "email", label: "Email", type: "email" },
  { id: "goal", label: "What is your primary fitness goal?", type: "text" },
  { id: "challenge", label: "Biggest Challenge Right Now", type: "textarea", wide: true },
  { id: "why", label: "Why do you want to transform now?", type: "textarea", wide: true },
];

/* ===================== Hooks ===================== */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
      setProgress(Math.min(100, Math.max(0, scrolled * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return progress;
}

/* ===================== Icons ===================== */

const Icon = {
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  ArrowsH: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="8 7 3 12 8 17" />
      <polyline points="16 7 21 12 16 17" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  YouTube: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  ),
  Sparkle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v6m0 8v6M4.93 4.93l4.24 4.24m5.66 5.66 4.24 4.24M2 12h6m8 0h6M4.93 19.07l4.24-4.24m5.66-5.66 4.24-4.24" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

/* ===================== Reusable UI ===================== */

function Logo() {
  return (
    <a href="#top" className="logo-mark" aria-label="Athlix home">
      <span>ATH</span>
      <span>LIX</span>
    </a>
  );
}

function SectionHeading({ eyebrow, title, description, align = "center" }) {
  return (
    <div className={`section-heading ${align === "left" ? "section-heading-left" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-lede">{description}</p>}
    </div>
  );
}

function CheckList({ items, variant = "check" }) {
  return (
    <ul className={`check-list ${variant === "x" ? "x-list" : ""}`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function CTAGroup({ primaryHref = "#apply", primaryLabel = "Apply For Coaching", secondaryHref = "#transformations", secondaryLabel = "View Transformations" }) {
  return (
    <div className="cta-row">
      <a href={primaryHref} className="btn btn-primary btn-lg">
        {primaryLabel}
        <Icon.Arrow />
      </a>
      <a href={secondaryHref} className="btn btn-secondary btn-lg">{secondaryLabel}</a>
    </div>
  );
}

/* ===================== Before / After Slider ===================== */

function BeforeAfter({ before, after, alt, hint = "Drag to compare" }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [hideHint, setHideHint] = useState(false);
  const [wrap, setWrap] = useState(null);

  const setFromClientX = useCallback((clientX) => {
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setPos(pct);
    if (!hideHint) setHideHint(true);
  }, [wrap, hideHint]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setFromClientX(clientX);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, setFromClientX]);

  return (
    <div
      className="ba-wrap"
      ref={setWrap}
      onMouseDown={(e) => { setDragging(true); setFromClientX(e.clientX); }}
      onTouchStart={(e) => { setDragging(true); setFromClientX(e.touches[0].clientX); }}
      role="slider"
      aria-label="Drag to compare before and after"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
    >
      <img src={after} alt={`${alt} — after transformation`} className="ba-img after" loading="lazy" draggable="false" />
      <div style={{ position: "absolute", inset: 0, width: `${pos}%`, overflow: "hidden" }}>
        <img src={before} alt={`${alt} — before transformation`} className="ba-img" loading="lazy" draggable="false" style={{ width: wrap ? `${wrap.getBoundingClientRect().width}px` : "100%", maxWidth: "none" }} />
      </div>
      <div className="ba-handle" style={{ left: `calc(${pos}% - 1px)` }} aria-hidden="true">
        <div className="ba-knob"><Icon.ArrowsH /></div>
      </div>
      <span className="ba-label left">Before</span>
      <span className="ba-label right">After</span>
      <span className={`ba-hint ${hideHint ? "hide" : ""}`}>{hint}</span>
    </div>
  );
}

/* ===================== Header ===================== */

function Header() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <Logo />
        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="#transformations">Transformations</a>
          <a href="#method">Method</a>
          <a href="#coaching">Coaching</a>
          <a href="#coach">Coach</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="btn btn-primary header-cta" href="#apply">Apply</a>
        <button className="menu-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </header>
      <div className={`mobile-menu ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <button className="menu-btn" aria-label="Close menu" onClick={close}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <a href="#transformations" onClick={close}>Transformations</a>
        <a href="#method" onClick={close}>Method</a>
        <a href="#coaching" onClick={close}>Coaching</a>
        <a href="#coach" onClick={close}>Coach</a>
        <a href="#faq" onClick={close}>FAQ</a>
        <a className="btn btn-primary btn-lg" style={{ marginTop: 16 }} href="#apply" onClick={close}>Apply For Coaching</a>
      </div>
    </>
  );
}

/* ===================== Hero ===================== */

function Hero() {
  return (
    <section id="top" className="hero section-dark">
      <Header />
      <div className="hero-grid shell">
        <div className="reveal" data-delay="1">
          <span className="hero-eyebrow">
            <span className="dot" />
            Premium transformation coaching
          </span>
          <h1 className="hero-title">
            Stop Starting Over.
            <span className="gradient-text">Start Transforming.</span>
          </h1>
          <p className="hero-subheadline">
            Athlix helps busy professionals lose fat, build confidence, and achieve sustainable results through
            personalized coaching, daily accountability, and our proven transformation system.
          </p>
          <CTAGroup />
          <div className="trust-row" aria-label="Why Athlix">
            {trustIndicators.map((t) => (
              <div key={t.label} className="trust-pill">
                <span className="ico" aria-hidden="true">{t.icon}</span>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual reveal" data-delay="2">
          <div className="hero-image-card">
            <img src={heroImage} alt="Athlix transformation coaching client" />
            <div className="corner-pill top">
              <span className="badge-dot" />
              RRR Method
            </div>
            <div className="corner-pill bottom">
              <strong>100+ transformations</strong>
              <span>Built through coaching and accountability</span>
            </div>
          </div>
          <a className="hero-stat" href="https://www.instagram.com/coachavk" target="_blank" rel="noreferrer" aria-label="Follow Coach Abhishek on Instagram">
            <img src={instagramIcon} alt="" />
            <span>@coachavk</span>
            <img src={blueTick} alt="Verified" className="verified" />
          </a>
        </div>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i}>
              <span className="dot" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== Transformations ===================== */

function Transformations() {
  return (
    <section id="transformations" className="section transformations">
      <div className="shell">
        <SectionHeading
          eyebrow="Client proof"
          title={<>Real Transformations. <span className="gradient-text-blue">Real Results.</span></>}
          description="See how Athlix clients transformed their bodies, confidence, and lifestyles — and kept the results."
        />

        <div className="featured-grid">
          {featuredTransformations.map((client, index) => (
            <article className="transformation-card reveal" data-delay={(index + 1).toString()} key={client.name}>
              <BeforeAfter
                before={client.before}
                after={client.after}
                alt={`${client.name} Athlix client transformation`}
                hint="Drag to compare"
              />
              <div className="transformation-content">
                <h3>{client.name}</h3>
                <p className="role">{client.occupation}</p>
                <div className="result-meta">
                  <span className="dark">
                    <Icon.Arrow /> {client.result}
                  </span>
                  <span>{client.timeline}</span>
                </div>
                <blockquote>“{client.quote}”</blockquote>
              </div>
            </article>
          ))}
        </div>

        <div className="transformation-strip" aria-label="More Athlix transformations">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 2400, disableOnInteraction: false, pauseOnMouseEnter: true }}
            breakpoints={{
              0: { slidesPerView: 1.15, spaceBetween: 14 },
              700: { slidesPerView: 2.3, spaceBetween: 18 },
              1100: { slidesPerView: 4, spaceBetween: 22 },
            }}
            loop
            pagination={{ clickable: true }}
          >
            {transformationImages.map((image, index) => (
              <SwiperSlide key={image}>
                <div className="t-strip-card">
                  <img src={image} alt={`Athlix transformation result ${index + 1}`} loading="lazy" />
                  <span className="t-strip-tag">Result #{index + 1}</span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

/* ===================== Failure / Difference ===================== */

function FailureDifference() {
  return (
    <section className="section split-section">
      <div className="shell split-grid">
        <article className="split-card negative reveal" data-delay="1">
          <SectionHeading
            eyebrow="The real obstacle"
            title={<>Why Most Fat Loss <br />Attempts Fail</>}
            align="left"
          />
          <p className="section-lede" style={{ marginLeft: 0, textAlign: "left" }}>
            Most plans fail not because of effort, but because of structure. The five problems below repeat across almost every client we meet.
          </p>
          <CheckList items={failurePoints} variant="x" />
        </article>

        <article className="split-card solution reveal" data-delay="2">
          <SectionHeading
            eyebrow="The Athlix Difference"
            title={<>Coaching Built Around <br />Your Real Life</>}
            align="left"
          />
          <p className="section-lede" style={{ marginLeft: 0, textAlign: "left" }}>
            Athlix replaces guesswork with structure, feedback, and accountability, so transformation becomes repeatable
            instead of dependent on short bursts of motivation.
          </p>
          <CheckList items={differencePoints} />
          <a className="text-link" href="#apply">
            Apply For Coaching <Icon.Arrow />
          </a>
        </article>
      </div>
    </section>
  );
}

/* ===================== RRR Method ===================== */

function RRRMethod() {
  return (
    <section id="method" className="section method section-dark">
      <span className="orb blue" style={{ width: 360, height: 360, top: -120, left: -120 }} />
      <span className="orb deep" style={{ width: 420, height: 420, bottom: -160, right: -120 }} />
      <div className="shell" style={{ position: "relative" }}>
        <SectionHeading
          eyebrow="Transformation framework"
          title={<>The Athlix <span className="gradient-text">RRR Method</span></>}
          description="The proven framework behind every successful transformation. Three stages, one system, real results."
        />
        <div className="timeline">
          {rrrStages.map((stage, index) => (
            <article className="timeline-card reveal" data-delay={(index + 1).toString()} key={stage.title}>
              <div className="stage-num">STAGE {stage.stage}</div>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
              <span className="detail">{stage.detail}</span>
              <div className="feature-row">
                {stage.features.map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== Coaching Options ===================== */

function CoachingOptions() {
  return (
    <section id="coaching" className="section coaching">
      <div className="shell">
        <SectionHeading
          eyebrow="Personalized paths"
          title={<>Choose Your <span className="gradient-text-blue">Coaching Experience</span></>}
          description="Every experience is designed to move you from uncertainty to execution with the right level of support."
        />
        <div className="coaching-grid">
          {coachingOptions.map((option) => (
            <article className={`coaching-card ${option.highlighted ? "highlighted" : ""} reveal`} key={option.title}>
              {option.badge && <span className="badge">★ {option.badge}</span>}
              <h3>{option.title}</h3>
              <p>{option.description}</p>
              <CheckList items={option.items} />
              {option.meta && (
                <div className="coaching-meta">
                  <Icon.Sparkle />
                  {option.meta}
                </div>
              )}
              <a className={option.highlighted ? "btn btn-dark" : "btn btn-ghost"} href="#apply">
                Apply For Coaching <Icon.Arrow />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== Coach Abhishek ===================== */

function Coach() {
  return (
    <section id="coach" className="section coach-section">
      <div className="shell">
        <SectionHeading
          eyebrow="Founder led coaching"
          title={<>Meet <span className="gradient-text-blue">Coach Abhishek</span></>}
          description="The expert behind every Athlix transformation — leading a premium, system-driven coaching practice for international clients."
        />
        <div className="coach-grid">
          <div className="coach-image reveal" data-delay="1">
            <img src={coachImage} alt="Coach Abhishek, Athlix founder and transformation coach" loading="lazy" />
            <div className="coach-stat top">
              <strong>18+ Years</strong>
              <span>Coaching experience</span>
            </div>
            <div className="coach-stat bot">
              <strong>100+ Clients</strong>
              <span>Transformed globally</span>
            </div>
          </div>

          <div className="coach-copy reveal" data-delay="2">
            <SectionHeading
              eyebrow="The Athlix founder"
              title="Coaching designed for real life"
              align="left"
            />
            <p>
              Coach Abhishek leads Athlix as a premium transformation coaching company for people who want sustainable fat
              loss, stronger bodies, better habits, and higher confidence — without extreme short-term approaches that
              always seem to fail.
            </p>
            <p>
              With 18+ years of coaching, international certifications, and a science-driven framework, he has helped
              professionals, founders, and athletes transform their bodies and their relationship with food, training,
              and discipline.
            </p>

            <div className="credential-grid">
              {coachStats.map((s) => (
                <div key={s.label}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="badge-row">
              {coachBadges.map((b) => (
                <span key={b}>
                  <Icon.Shield /> {b}
                </span>
              ))}
            </div>

            <div className="credentials-strip">
              <h4>Specializations</h4>
              <ul>
                <li>Sustainable fat loss & body recomposition</li>
                <li>Habit-based lifestyle coaching</li>
                <li>Strength training & performance systems</li>
                <li>Accountability and progress review frameworks</li>
              </ul>
            </div>

            <div style={{ marginTop: 22 }}>
              <a className="btn btn-primary btn-lg" href="#apply">
                Work With Coach Abhishek <Icon.Arrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== Testimonials ===================== */

function Testimonials() {
  return (
    <section className="section testimonials section-dark">
      <span className="orb deep" style={{ width: 320, height: 320, top: -100, right: -120 }} />
      <div className="shell" style={{ position: "relative" }}>
        <SectionHeading
          eyebrow="Social proof"
          title={<>Trusted By Clients Who <br />Wanted Real Change</>}
          description="Real reviews, real results, real people. Hear directly from the clients who trusted the Athlix system."
        />
        <div className="testimonial-layout">
          <div className="review-imgs">
            <img src={reviewOne} alt="Athlix client video review screenshot 1" loading="lazy" />
            <img src={reviewTwo} alt="Athlix client video review screenshot 2" loading="lazy" />
            <img src={reviewThree} alt="Athlix client video review screenshot 3" loading="lazy" />
          </div>
          <Swiper
            className="testimonial-carousel"
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 3800, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true }}
            loop
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t.name}>
                <article className="testimonial-card">
                  <span className="tag">{t.type}</span>
                  <div className="stars" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, i) => <Icon.Star key={i} />)}
                  </div>
                  <blockquote>“{t.quote}”</blockquote>
                  <div className="author">
                    <div className="avatar" aria-hidden="true">{t.initials}</div>
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

/* ===================== Comparison ===================== */

function Comparison() {
  return (
    <section className="section comparison-section">
      <div className="shell">
        <SectionHeading
          eyebrow="Side by side"
          title={<>Why Clients <span className="gradient-text-blue">Choose Athlix</span></>}
          description="A side-by-side look at the difference between generic plans and a premium transformation system."
        />
        <div className="comparison-grid">
          <article className="comparison-card reveal" data-delay="1">
            <span className="label">Others</span>
            <h3>The Generic Approach</h3>
            <CheckList items={others} variant="x" />
          </article>
          <article className="comparison-card premium reveal" data-delay="2">
            <span className="label">Athlix</span>
            <h3>The Transformation System</h3>
            <CheckList items={athlix} />
            <a className="btn btn-secondary btn-lg" href="#apply" style={{ marginTop: 22 }}>
              Apply For Coaching <Icon.Arrow />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ===================== FAQ ===================== */

function FAQ() {
  return (
    <section id="faq" className="section faq-section">
      <div className="shell faq-shell">
        <SectionHeading
          eyebrow="Questions"
          title="Frequently Asked"
          description="Clear, honest answers before you apply for coaching."
        />
        <div className="faq-list">
          {faqItems.map((item, i) => (
            <details className="faq-item reveal" data-delay={(((i % 4) + 1)).toString()} key={item.question}>
              <summary>{item.question}</summary>
              <p className="answer">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== Application Form ===================== */

function ApplicationForm() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    setTimeout(() => {
      setSubmitting(false);
      setStatus({ type: "ok", message: "Application received. The Athlix team will personally review and reach out within 48 hours." });
      e.target.reset();
    }, 1100);
  };

  return (
    <section id="apply" className="section application section-dark">
      <span className="orb blue" style={{ width: 360, height: 360, top: -120, right: -120 }} />
      <div className="shell application-grid" style={{ position: "relative" }}>
        <div className="reveal" data-delay="1">
          <SectionHeading
            eyebrow="Start your transformation"
            title={<>Apply For <span className="gradient-text">Coaching</span></>}
            description="Tell us about your goals and our team will personally review your application and reach out within 48 hours."
            align="left"
          />
          <div className="application-proof">
            <strong>Applications are reviewed personally by the Athlix Team.</strong>
            <span>The best-fit clients are invited to a private consultation to align on goals, plan, and the right coaching experience for them.</span>
          </div>
          <div className="application-proof" style={{ marginTop: 14 }}>
            <strong>What happens next?</strong>
            <span>1) We review your application within 48 hours. 2) A short alignment call. 3) You receive your personalized coaching roadmap.</span>
          </div>
        </div>

        <form className="application-form reveal" data-delay="2" onSubmit={onSubmit} noValidate>
          {formFields.map((field) => (
            <label key={field.id} className={`field ${field.wide ? "field-wide" : ""}`}>
              <span>{field.label}</span>
              {field.type === "textarea" ? (
                <textarea id={field.id} name={field.id} rows="4" placeholder={field.label} required />
              ) : field.type === "select" ? (
                <select id={field.id} name={field.id} required defaultValue="">
                  <option value="" disabled>Select</option>
                  {field.options.filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input id={field.id} name={field.id} type={field.type} placeholder={field.label} required />
              )}
            </label>
          ))}
          <button className="btn btn-primary btn-lg field-wide" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"} <Icon.Arrow />
          </button>
          {status.message && (
            <div className={`form-status ${status.type}`} role="status">{status.message}</div>
          )}
        </form>
      </div>
    </section>
  );
}

/* ===================== Footer ===================== */

function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div>
          <Logo />
          <p>
            Athlix is a premium international transformation coaching company. We help ambitious professionals lose fat,
            build confidence, and master their lifestyle through personalized coaching and accountability.
          </p>
          <div className="footer-socials" aria-label="Social media">
            <a href="https://www.instagram.com/coachavk" target="_blank" rel="noreferrer" aria-label="Instagram"><Icon.Instagram /></a>
            <a href="#" aria-label="YouTube"><Icon.YouTube /></a>
            <a href="mailto:hello@athlix.co" aria-label="Email"><Icon.Mail /></a>
            <a href="tel:+910000000000" aria-label="Phone"><Icon.Phone /></a>
          </div>
        </div>
        <div className="footer-links">
          <h3>About</h3>
          <a href="#coach">Coach Abhishek</a>
          <a href="#method">RRR Method</a>
          <a href="#transformations">Success Stories</a>
        </div>
        <div className="footer-links">
          <h3>Coaching</h3>
          <a href="#coaching">Online Coaching</a>
          <a href="#coaching">Offline Coaching</a>
          <a href="#coaching">Hybrid Coaching</a>
          <a href="#apply">Apply Now</a>
        </div>
        <div className="footer-links">
          <h3>Contact</h3>
          <a href="mailto:hello@athlix.co">hello@athlix.co</a>
          <a href="tel:+910000000000">+91 00000 00000</a>
          <a href="https://www.instagram.com/coachavk" target="_blank" rel="noreferrer">@coachavk</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Athlix. All rights reserved.</span>
        <span>Built with intention. Designed for transformation.</span>
      </div>
    </footer>
  );
}

/* ===================== Sticky mobile CTA ===================== */

function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <div className="sticky-cta" role="region" aria-label="Apply for coaching">
      <div className="label">
        <strong>Ready to transform?</strong>
        <span>Get a personalized roadmap</span>
      </div>
      <a className="btn btn-primary btn-sm" href="#apply">Apply Now <Icon.Arrow /></a>
    </div>
  );
}

/* ===================== App ===================== */

function App() {
  useReveal();
  const progress = useScrollProgress();
  return (
    <>
      <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <main>
        <Hero />
        <Transformations />
        <FailureDifference />
        <RRRMethod />
        <CoachingOptions />
        <Coach />
        <Testimonials />
        <Comparison />
        <FAQ />
        <ApplicationForm />
        <Footer />
      </main>
      <StickyMobileCTA />
    </>
  );
}

export default App;
