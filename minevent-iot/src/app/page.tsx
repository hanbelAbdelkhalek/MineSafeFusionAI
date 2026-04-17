"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import {
  Activity,
  WifiOff,
  Zap,
  Brain,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Cpu,
  Database,
  Server,
  Smartphone,
  Monitor,
  ArrowRight,
  Layers,
  Eye,
  ExternalLink,
  Globe,
  Send,
} from "lucide-react";

/* ──────────────────────────────────────────── */
/*  ANIMATION VARIANTS                          */
/* ──────────────────────────────────────────── */
import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

/* ──────────────────────────────────────────── */
/*  NAVBAR                                      */
/* ──────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Solution", href: "#solution" },
    { label: "Technologie", href: "#architecture" },
    { label: "Équipe", href: "#team" },
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-slate-950/80 backdrop-blur-xl border-b border-amber-500/10 shadow-lg shadow-black/40"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Activity className="w-8 h-8 text-amber-500 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <div className="absolute inset-0 bg-amber-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">
            Mine<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">Vent</span>{" "}
            <span className="text-slate-500 font-medium text-sm">IoT</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors duration-300 relative after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-[2px] after:bg-amber-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#demo"
            className="ml-4 px-6 py-2.5 bg-amber-500 text-slate-950 text-sm font-bold rounded-lg hover:bg-amber-400 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center gap-2 hover:gap-3"
          >
            Demander une Démo
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-slate-400 hover:text-amber-500 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-6 pb-6 shadow-2xl"
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-4 text-slate-300 hover:text-amber-500 transition-colors border-b border-slate-800/50 font-medium"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#demo"
            className="mt-6 block text-center px-5 py-3 bg-amber-500 text-slate-950 font-bold rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-400"
          >
            Demander une Démo
          </a>
        </motion.div>
      )}
    </motion.nav>
  );
}

/* ──────────────────────────────────────────── */
/*  HERO SECTION                                */
/* ──────────────────────────────────────────── */
function HeroSection() {
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-900 selection:bg-amber-500/30">
      {/* Grid pattern overlay using inline SVG */}
      <div
        className="absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
          backgroundSize: "30px 30px"
        }}
      />

      {/* Floating particles (using framer motion) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
            className="absolute w-1.5 h-1.5 bg-amber-500/40 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute top-[-20%] left-1/4 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Main Hero Content — Split Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-28 pb-12">
        <Card className="w-full bg-slate-950/60 backdrop-blur-sm border-slate-800/50 relative overflow-hidden rounded-2xl shadow-2xl">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="#f59e0b"
          />

          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left content — Text */}
            <div className="flex-1 p-8 sm:p-12 lg:p-16 relative z-10 flex flex-col justify-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold mb-8 shadow-[0_0_15px_rgba(34,197,94,0.15)] w-fit"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                </span>
                Système Actif & Sécurisé
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight mb-6 text-slate-100"
              >
                La Sécurité Minière,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                  Réinventée
                </span>{" "}
                par l&apos;Edge
                <br />
                Computing et l&apos;IA.
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-base sm:text-lg text-slate-300 max-w-lg mb-8 leading-relaxed font-medium"
              >
                Supervision de la ventilation en temps réel, alertes hors ligne et
                rapports automatisés pour{" "}
                <span className="text-amber-400 font-bold">
                  protéger vos équipes sous terre
                </span>
                .
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a
                  href="#demo"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-400 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] text-sm"
                >
                  <Eye className="w-5 h-5" />
                  Voir le Dashboard
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="#architecture"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-slate-700 text-slate-300 font-bold rounded-xl hover:border-amber-500 hover:text-amber-400 transition-all duration-300 hover:bg-amber-500/10 text-sm shadow-lg"
                >
                  <Layers className="w-5 h-5 group-hover:text-amber-500 transition-colors" />
                  Découvrir l&apos;Architecture
                </a>
              </motion.div>
            </div>

            {/* Right content — 3D Spline Scene */}
            <div className="flex-1 relative min-h-[350px] lg:min-h-0">
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-10" />
    </section>
  );
}

/* ──────────────────────────────────────────── */
/*  SOLUTION / WHY US SECTION                   */
/* ──────────────────────────────────────────── */
const solutionCards = [
  {
    icon: WifiOff,
    emoji: "📡",
    title: "Résilience Network (Dual-Mode)",
    description:
      "L'ESP32 maintient une API locale. Fonctionnement 100% garanti même sans internet. Basculement automatique entre Wi-Fi et mode autonome.",
    highlight: "100% garanti",
  },
  {
    icon: Zap,
    emoji: "⚡",
    title: "Alertes Ultra-Faible Latence",
    description:
      "Intégration MQTT et routage asynchrone pour notifications Gmail/Slack en < 2 secondes. Chaque milliseconde compte sous terre.",
    highlight: "< 2 secondes",
  },
  {
    icon: Brain,
    emoji: "🧠",
    title: "Audit IA (Google LLM)",
    description:
      "Synthèses automatisées et corrélations (Température vs Vibrations) propulsées par Google LLM. Rapports intelligents générés en temps réel.",
    highlight: "Google LLM",
  },
  {
    icon: ShieldCheck,
    emoji: "🔒",
    title: "Traçabilité RBAC",
    description:
      "Effet témoin éliminé. Chaque alerte acquittée est signée numériquement par l'opérateur. Audit trail immuable et conforme.",
    highlight: "Signée numériquement",
  },
];

function SolutionSection() {
  return (
    <section id="solution" className="relative py-24 sm:py-32 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={0}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
            Pourquoi notre solution ?
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 mb-6 tracking-tight">
            Conçue pour l&apos;environnement{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              le plus exigeant
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Une architecture pensée pour la résilience extrême, la vitesse fulgurante et la conformité réglementaire totale.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutionCards.map((card, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={i}
              className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-amber-500/50 transition-all duration-500 shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-14 h-14 bg-slate-950 rounded-xl border border-amber-500/30 group-hover:border-amber-500/60 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <card.icon className="w-7 h-7 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                  </div>
                  <span className="text-3xl drop-shadow-md">{card.emoji}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-amber-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-base mb-6 font-medium">
                  {card.description}
                </p>
                <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded shadow-[0_0_5px_rgba(245,158,11,0.2)]">
                  {card.highlight}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────── */
/*  ARCHITECTURE SECTION                        */
/* ──────────────────────────────────────────── */
const techStack = [
  {
    icon: Cpu,
    name: "ESP32",
    lang: "C / C++",
    description: "Microcontrôleur embarqué robuste, API locale.",
    color: "from-emerald-500/20 to-emerald-500/5",
    borderColor: "border-emerald-500/40",
    textColor: "text-emerald-400",
  },
  {
    icon: Database,
    name: "Supabase",
    lang: "PostgreSQL",
    description: "Base de données temps réel, RLS, Auth.",
    color: "from-blue-500/20 to-blue-500/5",
    borderColor: "border-blue-500/40",
    textColor: "text-blue-400",
  },
  {
    icon: Server,
    name: "Node.js",
    lang: "Express / MQTT",
    description: "Broker MQTT, routage & intégration IA.",
    color: "from-amber-500/20 to-amber-500/5",
    borderColor: "border-amber-500/40",
    textColor: "text-amber-400",
  },
  {
    icon: Smartphone,
    name: "Flutter",
    lang: "Dart",
    description: "App native mobile avec mode hors-ligne.",
    color: "from-cyan-500/20 to-cyan-500/5",
    borderColor: "border-cyan-500/40",
    textColor: "text-cyan-400",
  },
  {
    icon: Monitor,
    name: "React.js",
    lang: "Next.js",
    description: "Dashboard Web de supervision, RBAC.",
    color: "from-purple-500/20 to-purple-500/5",
    borderColor: "border-purple-500/40",
    textColor: "text-purple-400",
  },
];

function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-24 sm:py-32 bg-slate-900 border-t border-slate-800">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={0}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
            Architecture Technique
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 mb-6 tracking-tight">
            Un stack hybride <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">hautes performances</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            De l&apos;IoE embarqué au cloud analytique, chaque couche est taillée pour la résilience critique.
          </p>
        </motion.div>

        {/* Architecture flow */}
        <div className="relative mt-20">
          {/* Connection line (desktop) */}
          <div className="hidden lg:block absolute top-[35%] left-[8%] right-[8%] h-0.5 bg-slate-800 -translate-y-1/2" />
          <div className="hidden lg:block absolute top-[35%] left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-500 -translate-y-1/2 opacity-50 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                className={`group relative bg-slate-950 border ${tech.borderColor} rounded-2xl p-6 text-center hover:-translate-y-2 transition-transform duration-500 shadow-xl hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] z-10`}
              >
                {/* Gradient bg */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${tech.color} rounded-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="relative z-10 mt-[-3.5rem]">
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${tech.borderColor} border-2 rounded-2xl bg-slate-900 mb-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500`}>
                    <tech.icon className={`w-10 h-10 ${tech.textColor} drop-shadow-[0_0_8px_currentColor]`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-1">{tech.name}</h3>
                  <span className={`text-xs font-bold font-mono tracking-wider ${tech.textColor} mb-4 block`}>
                    {tech.lang}
                  </span>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    {tech.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────── */
/*  TEAM SECTION                                */
/* ──────────────────────────────────────────── */
const team = [
  {
    name: "Abdelkhalek Hanbel",
    role: "Ingénieur IoT & Syst. Embarqués",
    initials: "AH",
    image: "/img/image.png",
    gradient: "from-amber-400 to-orange-600",
  },
  {
    name: "Amine Sadouk",
    role: "Chef de projet",
    initials: "AS",
    image: "/img/WhatsApp Image 2026-04-17 at 10.19.20.jpeg",
    gradient: "from-amber-500 to-amber-700",
  },
  {
    name: "Mohammed ezzi",
    role: "Responsable Web app Full Stack",
    image: "/img/WhatsApp Image 2026-04-17 at 16.07.33.jpeg",
    initials: "MO",
    gradient: "from-slate-600 to-slate-800",
  },
  {
    name: "Soufiane mechda",
    role: "Responsable data / analyse",
    initials: "SO",
    image: "/img/WhatsApp Image 2026-04-17 at 16.10.29.jpeg",
    gradient: "from-zinc-500 to-zinc-700",
  },
];

function TeamSection() {
  return (
    <section id="team" className="relative py-24 sm:py-32 bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={0}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
            L&apos;Équipe
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 mb-6 tracking-tight">
            Les <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">Générateurs</span> d&apos;Innovation
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Une équipe pluridisciplinaire d&apos;ingénieurs unie par la passion de protéger des vies via la technologie.
          </p>
        </motion.div>

        {/* Team grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              custom={i}
              className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center hover:border-amber-500/50 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
            >
              {/* Subtle hover glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                {/* Avatar */}
                <div className="relative mx-auto mb-6 w-24 h-24">
                  {member.image ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl ring-4 ring-slate-950 group-hover:ring-amber-500/30 transition-all">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-slate-950 group-hover:ring-amber-500/30 transition-all`}
                    >
                      {member.initials}
                    </div>
                  )}
                  {/* Online indicator */}
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-slate-900 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                </div>

                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-amber-400 transition-colors">
                  {member.name}
                </h3>
                <p className="text-sm text-slate-400 mb-6 font-medium bg-slate-800/60 inline-block px-4 py-1.5 rounded-full">{member.role}</p>

                {/* Social links */}
                <div className="flex justify-center gap-3">
                  {[Globe, ExternalLink, Send].map((Icon, j) => (
                    <button
                      key={j}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────── */
/*  FOOTER                                      */
/* ──────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="relative border-t border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 grayscale group-hover:grayscale-0 opacity-60 hover:opacity-100 transition-all cursor-pointer">
            <Activity className="w-6 h-6 text-amber-500" />
            <span className="text-base font-bold text-slate-300 tracking-tight">
              Mine<span className="text-amber-500">Vent</span>{" "}
              <span className="text-slate-500 font-medium text-sm">IoT</span>
            </span>
          </div>

          <p className="text-sm text-slate-500 text-center md:text-right font-medium">
            Fait avec{" "}
            <span className="text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.6)] mx-1">passion</span> pour la sécurité industrielle © 2026
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────── */
/*  MAIN PAGE                                   */
/* ──────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
      <Navbar />
      <main>
        <HeroSection />
        <SolutionSection />
        <ArchitectureSection />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}
