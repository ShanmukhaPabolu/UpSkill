"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Heart, BookOpen, Globe, GraduationCap } from "lucide-react";

export default function NgoHomepage({ dashboardUrl, isAuth }: { dashboardUrl: string, isAuth: boolean }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Hero Parallax
  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Fade In Variant
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FDFBF7] text-[#2D332A] font-sans selection:bg-[#2D332A] selection:text-[#FDFBF7] overflow-hidden">
      
      {/* Elegant Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#2D332A]/5">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2D332A] rounded-full flex items-center justify-center text-[#FDFBF7]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-medium tracking-tight text-[#2D332A]">Gyana Prakash</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#5C6659] font-semibold">Foundation</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            {["Our Impact", "Programs", "Stories", "Annual Report"].map((item) => (
              <Link key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-sm font-medium text-[#5C6659] hover:text-[#2D332A] transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#2D332A] transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {!isAuth ? (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-[#C26D5C] transition-colors hidden sm:block">Log In</Link>
                <Link href="/register" className="group flex items-center gap-2 px-6 py-3 bg-[#C26D5C] hover:bg-[#A95C4D] text-[#FDFBF7] rounded-full text-sm font-medium transition-all hover:shadow-lg">
                  Join the Mission <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            ) : (
              <Link href={dashboardUrl} className="group flex items-center gap-2 px-6 py-3 bg-[#2D332A] text-[#FDFBF7] rounded-full text-sm font-medium transition-all hover:bg-[#1A1D18]">
                Partner Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Cinematic Hero */}
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
            <Image src="/ngo_hero.png" alt="A hopeful child in a rural classroom" fill className="object-cover scale-105 origin-center" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1D18]/90 via-[#1A1D18]/40 to-transparent" />
          </motion.div>
          
          <div className="relative z-10 container mx-auto px-6 text-center mt-20">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="text-[#FDFBF7] uppercase tracking-[0.3em] text-sm font-semibold mb-6">
              Empowering Rural Education
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }} className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#FDFBF7] max-w-5xl mx-auto leading-[1.1] mb-8">
              Lighting the path for a <span className="italic font-light text-[#E8DCC3]">million futures.</span>
            </motion.h2>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="px-8 py-4 bg-[#C26D5C] hover:bg-[#A95C4D] text-[#FDFBF7] rounded-full font-medium transition-colors flex items-center gap-2">
                <Heart className="w-4 h-4" /> Donate Now
              </button>
              <Link href="#our-impact" className="px-8 py-4 border border-[#FDFBF7]/30 hover:bg-[#FDFBF7] hover:text-[#2D332A] text-[#FDFBF7] rounded-full font-medium transition-colors">
                Discover Our Impact
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Narrative & Impact Metrics */}
        <section id="our-impact" className="py-32 bg-[#FDFBF7]">
          <div className="container mx-auto px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="max-w-4xl mx-auto text-center mb-24">
              <Globe className="w-8 h-8 text-[#C26D5C] mx-auto mb-6" />
              <h3 className="text-3xl md:text-5xl font-serif leading-tight text-[#2D332A]">
                We believe that every child, regardless of geography, deserves access to world-class education. We transform rural classrooms into hubs of excellence.
              </h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-b border-[#2D332A]/10 py-16">
              {[
                { number: "1.2M+", label: "Children Reached", desc: "Providing quality foundational literacy and numeracy." },
                { number: "45K+", label: "Teachers Empowered", desc: "Through rigorous continuous professional development." },
                { number: "13", label: "Districts Transformed", desc: "Creating systemic, measurable social change." }
              ].map((stat, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.2 } } }} className="text-center md:text-left md:border-r border-[#2D332A]/10 last:border-0 md:pr-12">
                  <p className="text-6xl font-serif text-[#1A1D18] mb-4">{stat.number}</p>
                  <p className="text-xl font-medium text-[#2D332A] mb-2">{stat.label}</p>
                  <p className="text-[#5C6659] leading-relaxed">{stat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Bento Grid */}
        <section id="stories" className="py-24 bg-[#1A1D18] text-[#FDFBF7]">
          <div className="container mx-auto px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <p className="uppercase tracking-[0.2em] text-[#A6AEA2] text-sm font-semibold mb-4">Stories of Change</p>
                <h3 className="text-4xl md:text-6xl font-serif">Transforming the ecosystem, one classroom at a time.</h3>
              </div>
              <Link href="/register" className="flex items-center gap-2 text-[#E8DCC3] hover:text-[#FDFBF7] font-medium group">
                Read the Annual Report <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[400px]">
              {/* Large Image Card */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:col-span-8 relative rounded-2xl overflow-hidden group">
                <Image src="/ngo_impact.png" alt="Teacher inspiring students" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-10">
                  <span className="bg-[#C26D5C] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block">Teacher Development</span>
                  <h4 className="text-3xl font-serif mt-2">Empowering educators to become catalysts of change in rural districts.</h4>
                </div>
              </motion.div>

              {/* Stat/Quote Card */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } } }} className="md:col-span-4 bg-[#21251E] rounded-2xl p-10 flex flex-col justify-between border border-[#343A30]">
                <BookOpen className="w-10 h-10 text-[#E8DCC3]" />
                <div>
                  <p className="text-xl font-serif italic text-[#A6AEA2] mb-6">"Since the Gyana Prakash curriculum was introduced, we've seen a 40% increase in foundational literacy within just six months."</p>
                  <p className="font-medium text-[#FDFBF7]">— Anjali D., Headmistress</p>
                </div>
              </motion.div>

              {/* Smaller Action Card */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:col-span-4 bg-[#E8DCC3] rounded-2xl p-10 flex flex-col justify-between text-[#1A1D18]">
                <GraduationCap className="w-10 h-10 text-[#C26D5C]" />
                <div>
                  <h4 className="text-2xl font-serif mb-4">Partner with us</h4>
                  <p className="text-[#4A5344] mb-6">Join our coalition of CSR partners, government bodies, and global foundations.</p>
                  <Link href="/register" className="font-semibold flex items-center gap-2 hover:text-[#C26D5C] transition-colors">
                    Become a Partner <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>

              {/* Medium Image Card */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } } }} className="md:col-span-8 relative rounded-2xl overflow-hidden group">
                <Image src="/ngo_story.png" alt="Rural school" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-10">
                  <h4 className="text-2xl font-serif">Rebuilding rural infrastructure.</h4>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Global Call to Action */}
        <section className="py-32 bg-[#C26D5C] text-[#FDFBF7] text-center">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-5xl md:text-7xl font-serif mb-8">The future is forged in today's classrooms.</h2>
              <p className="text-xl text-[#FDFBF7]/80 mb-12 max-w-2xl mx-auto">
                Your support enables us to build robust monitoring systems, train thousands of teachers, and fundamentally shift the trajectory of an entire generation.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="px-10 py-5 bg-[#1A1D18] hover:bg-black text-white rounded-full font-medium transition-colors text-lg">
                  Make a Donation
                </button>
                <Link href="/register" className="px-10 py-5 border-2 border-[#FDFBF7] hover:bg-[#FDFBF7] hover:text-[#C26D5C] rounded-full font-medium transition-colors text-lg">
                  Join the Foundation
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="bg-[#1A1D18] text-[#A6AEA2] py-20 border-t border-[#343A30]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-[#FDFBF7]" />
                <h3 className="text-2xl font-serif text-[#FDFBF7]">Gyana Prakash</h3>
              </div>
              <p className="max-w-sm text-sm leading-relaxed mb-8">
                A registered non-profit organization dedicated to the systemic transformation of rural education across India through capacity building and digital infrastructure.
              </p>
              <p className="text-sm">© {new Date().getFullYear()} Gyana Prakash Foundation.</p>
            </div>
            
            <div>
              <h4 className="text-[#FDFBF7] font-medium mb-6 uppercase tracking-wider text-xs">Foundation</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-[#FDFBF7] transition-colors">Our Approach</Link></li>
                <li><Link href="#" className="hover:text-[#FDFBF7] transition-colors">Impact Reports</Link></li>
                <li><Link href="#" className="hover:text-[#FDFBF7] transition-colors">Financials</Link></li>
                <li><Link href="#" className="hover:text-[#FDFBF7] transition-colors">Leadership Team</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#FDFBF7] font-medium mb-6 uppercase tracking-wider text-xs">Get Involved</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-[#FDFBF7] transition-colors">Corporate Partnerships</Link></li>
                <li><Link href="#" className="hover:text-[#FDFBF7] transition-colors">Careers & Fellowships</Link></li>
                <li><Link href="#" className="hover:text-[#FDFBF7] transition-colors">Contact Us</Link></li>
                <li><Link href={dashboardUrl} className="hover:text-[#FDFBF7] transition-colors">Partner Login</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
