"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Linkedin, Mail, ExternalLink, Github, Code2, ShieldCheck, Activity, Cpu, Layers, Database, Cloud, BookOpen, Loader2, Terminal, Network } from "lucide-react";
import data from "./data.json";

// --- 1. FILM GRAIN TEXTURE ---
const FilmGrain = () => (
  <div className="pointer-events-none fixed inset-0 z-[100] h-full w-full opacity-[0.04] mix-blend-overlay">
    <svg className="absolute inset-0 h-full w-full">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

// --- 2. INTERACTIVE NETWORK (Blue/Cyan Theme) ---
const ColorfulNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', handleMouseMove);

    const particles: { x: number, y: number, vx: number, vy: number }[] =[];
    for(let i=0; i<80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7
      });
    }

    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.fillStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        const distMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (distMouse < 200) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 - distMouse/400})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      });

      for(let i=0; i<particles.length; i++) {
        for(let j=i+1; j<particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if(dist < 120) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 - dist/600})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  },[]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-70 mix-blend-screen" />;
};

// --- 3. 3D TILT SPOTLIGHT CARD ---
function SpotlightCard({ children, className = "", glowColor = "rgba(34, 211, 238, 0.15)" }: { children: React.ReactNode; className?: string; glowColor?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const[spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-3xl glass transition-colors duration-500 hover:bg-white/[0.05] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${spotlightPos.x}px ${spotlightPos.y}px, ${glowColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
}

// --- 4. MAGNETIC BUTTON ---
function Magnetic({ children }: { children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    setPosition({ x: (clientX - (left + width / 2)) * 0.2, y: (clientY - (top + height / 2)) * 0.2 });
  };
  
  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={() => setPosition({ x: 0, y: 0 })} animate={{ x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}>
      {children}
    </motion.div>
  );
}

// --- 5. ANIMATED NUMBER ---
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else setDisplayValue(Math.floor(start));
      }, 16);
      return () => clearInterval(timer);
    }
  },[isInView, value]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

// --- MAIN PAGE ---
export default function Portfolio() {
  const [loading, setLoading] = useState(true);
  const[mousePosition, setMousePosition] = useState({ x: "50vw", y: "50vh" });
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY,[0, 2000],[0, -400]);
  const y2 = useTransform(scrollY,[0, 2000],[0, 400]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2400);
    return () => clearTimeout(timer);
  },[]);

  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: `${e.clientX}px`, y: `${e.clientY}px` });
  };

  const summaryWords = data.basics.summary.split(". ").slice(0,2).join(". ").split(" ");

  // Perfectly balanced 2x2 Grid for Metrics (Blue Theme)
  const detailedMetrics =[
    { 
      metric: 40, suffix: "%", 
      title: "Reduced System Latency", 
      impact: "Significantly faster API response times under high load.", 
      how: "Refactored legacy monolithic components into event-driven microservices using Spring Boot and Apache Kafka, eliminating API bottlenecks.",
      icon: <Cpu className="text-cyan-400 w-8 h-8 group-hover:scale-110 transition-transform duration-500" />,
      colorClass: "text-cyan-400",
      glowColor: "rgba(34, 211, 238, 0.15)"
    },
    { 
      metric: 50, suffix: "%", 
      title: "Faster Reconciliation", 
      impact: "Halved the processing time for critical end-of-day banking reconciliation.", 
      how: "Redesigned the core backend architecture by optimizing PostgreSQL indexing, implementing aggressive query caching, and batching bulk operations.",
      icon: <Database className="text-blue-400 w-8 h-8 group-hover:scale-110 transition-transform duration-500" />,
      colorClass: "text-blue-400",
      glowColor: "rgba(59, 130, 246, 0.15)"
    },
    { 
      metric: 70, suffix: "%", 
      title: "Increased Test Coverage", 
      impact: "Reduced QA cycle time by 40% and prevented critical production bugs.", 
      how: "Architected a suite of high-fidelity, configurable Core Banking simulators using DAPR and GCP, allowing teams to reliably mock complex third-party APIs.",
      icon: <Terminal className="text-sky-400 w-8 h-8 group-hover:scale-110 transition-transform duration-500" />,
      colorClass: "text-sky-400",
      glowColor: "rgba(14, 165, 233, 0.15)"
    },
    { 
      metric: 30, suffix: "%", 
      title: "Higher Success Rate", 
      impact: "Fewer dropped transactions and seamless client network integration.", 
      how: "Developed a highly fault-tolerant banking interface with resilient retry mechanisms and dead-letter queues, connecting internal ledger systems securely.",
      icon: <Network className="text-indigo-400 w-8 h-8 group-hover:scale-110 transition-transform duration-500" />,
      colorClass: "text-indigo-400",
      glowColor: "rgba(99, 102, 241, 0.15)"
    }
  ];

  const skillCategories =[
    { title: "Languages & Frameworks", icon: <Terminal className="text-cyan-400 w-8 h-8" />, skills:["Java", "Spring Boot", "JavaScript", "Angular 8", "Python"], span: "md:col-span-5", bgClass: "bg-gradient-to-br from-cyan-500/5 to-transparent", glow: "rgba(34,211,238,0.15)" },
    { title: "Architecture & Tools", icon: <Layers className="text-blue-400 w-8 h-8" />, skills:["Microservices", "REST APIs", "Apache Kafka", "DAPR", "Temporal", "Kubernetes", "Docker", "Git", "Maven", "Gradle"], span: "md:col-span-7", bgClass: "bg-gradient-to-bl from-blue-500/5 to-transparent", glow: "rgba(59, 130, 246, 0.15)" },
    { title: "Databases", icon: <Database className="text-indigo-400 w-8 h-8" />, skills:["SQL", "MySQL", "MongoDB", "PostgreSQL", "YugabyteDB"], span: "md:col-span-6", bgClass: "bg-gradient-to-tr from-indigo-500/5 to-transparent", glow: "rgba(99, 102, 241, 0.15)" },
    { title: "Cloud & DevOps", icon: <Cloud className="text-sky-400 w-8 h-8" />, skills:["GCP", "AWS", "CI/CD", "Jira"], span: "md:col-span-6", bgClass: "bg-gradient-to-tl from-sky-500/5 to-transparent", glow: "rgba(14, 165, 233, 0.15)" }
  ];

  return (
    <div 
      onMouseMove={handleGlobalMouseMove}
      style={{ "--mouse-x": mousePosition.x, "--mouse-y": mousePosition.y } as React.CSSProperties}
      className="bg-[#0a0a0f] min-h-screen text-gray-200 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden font-sans relative mouse-glow transition-colors duration-300"
    >
      <FilmGrain />
      <ColorfulNetwork />
      
      {/* Ambient Glowing Orbs (Blue Theme) */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[150px] pointer-events-none z-0" />
      
      <div className="fixed inset-0 z-0 bg-dot-pattern pointer-events-none opacity-50" />

      {/* Top scroll progress */}
      <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 origin-left z-50 shadow-[0_0_15px_rgba(34,211,238,0.5)]" style={{ scaleX }} />

      {/* PARALLAX DEV TEXT */}
      <div className="fixed inset-0 flex flex-col justify-center items-center pointer-events-none z-0 overflow-hidden font-mono font-black tracking-tighter uppercase whitespace-nowrap text-[22vw] leading-[0.8] opacity-[0.15]">
        <motion.div style={{ y: y1 }} className="text-stroke -ml-[20vw]">{`//ENGINEER`}</motion.div>
        <motion.div style={{ y: y2 }} className="text-stroke ml-[10vw]">{`<ARCHITECT/>`}</motion.div>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div key="splash" exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }} transition={{ duration: 1, ease:[0.76, 0, 0.24, 1] }} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f]">
            <motion.div animate={{ scale:[0.95, 1.05, 0.95], opacity:[0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
            <motion.h1 initial={{ opacity: 0, scale: 0.8, letterSpacing: "-0.2em" }} animate={{ opacity: 1, scale: 1, letterSpacing: "0em" }} transition={{ duration: 1.5, ease: "easeOut" }} className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]">
              JT.
            </motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="mt-8 flex items-center gap-3 text-cyan-500 font-mono text-sm uppercase tracking-[0.3em] relative z-10">
              <Loader2 className="w-5 h-5 animate-spin" /> System_Initializing...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <main className="relative z-10 px-6 md:px-12 max-w-[1400px] mx-auto">
          
          {/* ================= HERO SECTION ================= */}
          <section id="hero" className="min-h-screen flex flex-col justify-center pt-20 pb-10 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }} className="flex items-center gap-4 mb-8">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span></span>
              <span className="text-xs font-mono uppercase tracking-[0.4em] text-cyan-300 font-semibold mix-blend-plus-lighter">
                {data.basics.title.split(" @ ")[0]}
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="mix-blend-plus-lighter relative z-10">
              <h1 className="text-[14vw] md:text-[11vw] leading-[0.85] font-black tracking-tighter text-white uppercase m-0 p-0 drop-shadow-2xl">Jignesh</h1>
              <h1 className="text-[14vw] md:text-[11vw] leading-[0.85] font-black tracking-tighter uppercase m-0 p-0 text-transparent bg-clip-text animate-gradient bg-[length:200%_auto] bg-gradient-to-r from-white via-cyan-200 to-blue-500">
                Tailor
              </h1>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end mt-16 relative z-10">
              <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-xl border-l-2 border-cyan-500/30 pl-6 flex flex-wrap">
                {summaryWords.map((word, i) => (
                  <motion.span 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 + (i * 0.05) }}
                    className="mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
                .
              </p>
              
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }} className="flex flex-wrap gap-6 md:justify-end">
                <Magnetic>
                  <a href="#experience" className="px-8 py-4 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                    <span className="relative z-10">Explore Work</span>
                    <ArrowRight size={18} className="relative z-10" />
                  </a>
                </Magnetic>
                <Magnetic>
                  <a href={data.basics.links.github} target="_blank" rel="noreferrer" className="px-10 py-4 rounded-full glass hover:bg-white/10 transition-colors flex items-center justify-center gap-3 font-medium text-white font-mono">
                    <Github size={18} /> GITHUB
                  </a>
                </Magnetic>
              </motion.div>
            </div>
          </section>

          {/* ================= PERFECTLY ALIGNED BENTO IMPACT ================= */}
          {data.achievements && data.achievements.length >= 4 && (
            <section className="py-32 relative z-10">
              <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-white/40 mb-16 flex items-center gap-4"><span className="w-12 h-px bg-cyan-500/50"></span> Sys.Metrics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {detailedMetrics.map((metric, idx) => (
                  <SpotlightCard key={idx} glowColor={metric.glowColor} className="p-10 flex flex-col h-full border border-white/5">
                    
                    <div className="flex justify-between items-start mb-10">
                      {metric.icon}
                      <div className="text-6xl font-mono leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                        <AnimatedNumber value={metric.metric} />
                        <span className={metric.colorClass}>{metric.suffix}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-grow">
                      <h4 className="text-2xl font-bold text-white mb-2">{metric.title}</h4>
                      <p className="text-lg text-gray-400 font-light mb-8">{metric.impact}</p>
                      
                      <div className="border-t border-white/10 pt-6 mt-auto">
                        <p className="text-sm text-gray-500 font-mono tracking-wide leading-relaxed">
                          {metric.how}
                        </p>
                      </div>
                    </div>

                  </SpotlightCard>
                ))}
              </div>
            </section>
          )}

          {/* ================= COLORFUL BENTO SKILLS (Blue Theme) ================= */}
          <section className="py-32 relative z-10">
            <div className="mb-16">
              <h2 className="text-[8vw] md:text-[6vw] font-black tracking-tighter leading-none mix-blend-plus-lighter text-white/90">TECH ARSENAL</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {skillCategories.map((category, idx) => (
                <SpotlightCard 
                  key={idx} 
                  glowColor={category.glow}
                  className={`p-10 group border-white/5 ${category.span} ${category.bgClass}`}
                >
                  <div className="flex items-center gap-4 mb-8">
                    {category.icon}
                    <h3 className="text-2xl font-bold text-white tracking-tight leading-none m-0">{category.title}</h3>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-auto">
                    {category.skills.map((skill, sIdx) => (
                      <span 
                        key={sIdx} 
                        className="px-4 py-2 rounded-xl bg-[#0a0a0f]/80 border border-white/10 text-gray-300 font-mono text-sm tracking-wide shadow-lg hover:-translate-y-1 hover:text-white hover:border-white/30 transition-all cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </section>

          {/* ================= CLEAN STACKING EXPERIENCE (No weird side lines) ================= */}
          <section id="experience" className="py-32 relative z-10">
            <h2 className="text-[8vw] md:text-[6vw] font-black tracking-tighter leading-none mb-32 mix-blend-plus-lighter text-white/90">EXPERIENCE</h2>
            
            <div className="space-y-0 pb-32 relative">
              {data.experience.map((exp, expIdx) => (
                <motion.div 
                  key={expIdx} 
                  initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
                  className="sticky pt-12"
                  style={{ top: `${expIdx * 2 + 10}vh`, zIndex: expIdx }}
                >
                  <SpotlightCard className="p-12 md:p-16 min-h-[50vh] shadow-[0_-20px_40px_rgba(0,0,0,0.8)] backdrop-blur-3xl border-t border-cyan-500/20 bg-[#0a0a0f]/95">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
                      <div>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">{exp.company}</h3>
                        {exp.totalDuration && <p className="text-cyan-300 font-mono text-sm border border-cyan-500/20 px-4 py-2 rounded-md w-fit bg-cyan-500/10">[{exp.totalDuration}]</p>}
                      </div>

                      <div className="space-y-16">
                        {exp.roles.map((role, rIdx) => (
                          <div key={rIdx} className="group">
                            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                              <h4 className="text-3xl font-semibold text-gray-200 group-hover:text-cyan-400 transition-colors">{role.title}</h4>
                              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400/50 font-semibold">{role.dates}</span>
                            </div>
                            <div className="space-y-6">
                              {role.bullets.map((b, bIdx) => {
                                const isTechStack = b.toLowerCase().startsWith("tech used:");
                                return (
                                  <div key={bIdx} className="flex items-start gap-5">
                                    {!isTechStack && <div className="w-2 h-2 rounded bg-cyan-500/50 mt-2.5 shrink-0 group-hover:bg-cyan-400 transition-colors" />}
                                    <p className={`text-lg leading-relaxed font-light ${isTechStack ? 'mt-6 text-sm font-mono text-cyan-200/70 bg-[#0a0a0f] p-5 rounded-xl border border-cyan-500/20 w-full tracking-wide shadow-inner' : 'text-gray-300'}`}>
                                      {b}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ================= SPOTLIGHT PROJECTS ================= */}
          <section id="projects" className="py-32 relative z-10">
            <h2 className="text-[8vw] md:text-[6vw] font-black tracking-tighter leading-none mb-24 mix-blend-plus-lighter text-white/90">PROJECTS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.projects.map((project, idx) => (
                <SpotlightCard key={idx} className="p-12 flex flex-col h-full group border-t border-white/10">
                  <div className="relative z-10 flex-grow pointer-events-none">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-4 glass rounded-xl border border-white/10 shadow-inner group-hover:border-cyan-500/50 transition-colors"><Code2 className="text-cyan-400 w-8 h-8"/></div>
                      <h3 className="text-3xl font-bold text-white tracking-tight">{project.title}</h3>
                    </div>
                    <p className="text-gray-400 font-light mb-10 text-xl leading-relaxed group-hover:text-gray-300 transition-colors">{project.description}</p>
                  </div>
                  <div className="relative z-10 flex flex-wrap gap-3 mb-12">
                    {project.tech.map(tech => <span key={tech} className="text-xs px-4 py-2 rounded-md bg-[#050508] border border-white/10 text-cyan-200 font-mono uppercase tracking-wider">{tech}</span>)}
                  </div>
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="relative z-10 inline-flex items-center gap-3 text-white font-mono font-bold group/btn w-fit text-lg border-b border-cyan-500/30 pb-1 hover:border-cyan-400 transition-colors">
                    View Repository <ExternalLink size={20} className="group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform text-cyan-400" />
                  </a>
                </SpotlightCard>
              ))}
            </div>
          </section>

          {/* ================= CERTIFICATIONS & PUBLICATIONS ================= */}
          <section className="py-32 relative z-10 border-t border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* CERTIFICATIONS */}
              {data.certifications && data.certifications.length > 0 && (
                <div>
                  <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400 mb-4">Credentials</h2>
                  <h3 className="text-4xl font-black tracking-tighter text-white mb-10">CERTIFIED</h3>
                  <div className="flex flex-col gap-4">
                    {data.certifications.map((cert, idx) => (
                      <SpotlightCard key={idx} glowColor="rgba(34, 211, 238, 0.15)" className="p-6 group hover:border-cyan-500/40">
                        <div className="flex items-center gap-6 pointer-events-none">
                          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                            <ShieldCheck className="w-6 h-6 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1 leading-tight">{cert.title}</h3>
                            <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">{cert.issuer}</p>
                          </div>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>
              )}

              {/* PUBLICATIONS */}
              {data.publications && data.publications.length > 0 && (
                <div>
                  <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-blue-400 mb-4">Research</h2>
                  <h3 className="text-4xl font-black tracking-tighter text-white mb-10">PUBLICATIONS</h3>
                  <div className="flex flex-col gap-4">
                    {data.publications.map((pub, idx) => (
                      <SpotlightCard key={idx} glowColor="rgba(59, 130, 246, 0.15)" className="p-6 group hover:border-blue-500/40">
                        <div className="flex items-center gap-6">
                          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 pointer-events-none">
                            <BookOpen className="w-6 h-6 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-2 leading-tight pointer-events-none">{pub.title}</h3>
                            <a href={pub.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-xs font-mono font-bold tracking-widest transition-colors flex items-center gap-2 w-fit border-b border-blue-500/30 hover:border-blue-400 pb-0.5 z-10 relative">
                              READ PAPER <ArrowRight size={12} />
                            </a>
                          </div>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* ================= EPIC FOOTER ================= */}
          <footer className="pt-40 pb-10 mt-10 flex flex-col items-center justify-center relative z-10">
            <h2 className="text-[12vw] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-white/50 to-black mb-16 text-center w-full select-none pointer-events-none">
              LET'S CONNECT
            </h2>
            <div className="flex flex-wrap justify-center gap-6 mb-32">
              <Magnetic>
                <a href={`mailto:${data.basics.email}`} className="px-8 py-4 rounded-full bg-cyan-400 text-black font-semibold flex items-center gap-3 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                  <Mail size={20} /> Email Me
                </a>
              </Magnetic>
              <Magnetic>
                <a href={data.basics.links.linkedin} target="_blank" rel="noreferrer" className="px-8 py-4 rounded-full glass text-white flex items-center gap-3 hover:bg-white hover:text-black transition-colors">
                  <Linkedin size={20} /> LinkedIn
                </a>
              </Magnetic>
              <Magnetic>
                <a href={data.basics.links.github} target="_blank" rel="noreferrer" className="px-8 py-4 rounded-full glass text-white flex items-center gap-3 hover:bg-white hover:text-black transition-colors">
                  <Github size={20} /> GitHub
                </a>
              </Magnetic>
            </div>
            <div className="w-full flex flex-col md:flex-row items-center justify-between text-gray-500 font-mono text-xs uppercase tracking-widest border-t border-white/10 pt-8">
              <span>© {new Date().getFullYear()} {data.basics.name}</span>
              <span className="mt-4 md:mt-0">Engineered with precision.</span>
            </div>
          </footer>

        </main>
      )}
    </div>
  );
}