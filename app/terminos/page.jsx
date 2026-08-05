"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Filter,
  Layers,
  ShieldCheck,
  Cpu,
  Database,
  Users,
  Scale
} from "lucide-react";
import Link from "next/link";
import Header from "../components/header";
import Footer from "../components/footer";
import TermSection from "./components/TermSection";
import { termsData as terms } from "./components/termsData";

// Extract unique categories from termsData
const allCategories = ["All", ...Array.from(new Set(terms.map((t) => t.category)))];

// Helper to assign icons to categories dynamically
const getCategoryIcon = (catName) => {
  if (catName.includes("Legal")) return Scale;
  if (catName.includes("Security")) return ShieldCheck;
  if (catName.includes("AI")) return Cpu;
  if (catName.includes("Modules")) return Layers;
  if (catName.includes("Profiles")) return Users;
  if (catName.includes("General")) return Database;
  return Filter;
};

export default function TermsAndConditions() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTerms = activeCategory === "All" 
    ? terms 
    : terms.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FFF] selection:bg-blue-500/30 selection:text-blue-900 font-sans relative overflow-hidden">
      <div className="transition-all duration-1000 ease-in-out opacity-100 blur-0 scale-100">
        <Header />

        <main className="max-w-[1500px] mx-auto px-6 md:px-12 pt-32 pb-24">
          {/* HERO SECTION */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16 relative">
            
            <div className="max-w-3xl relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-semibold tracking-wider text-gray-700 uppercase">
                  Legal Notice & Operative Rules
                </span>
              </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-[#1a1a1a] leading-[1.1] mb-6"
            >
              Terms and <br className="hidden md:block" />
              <span className="text-[#414141]">
                Conditions
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[15px] md:text-[17px] text-gray-500 leading-relaxed font-light max-w-xl"
            >
              Please read these terms carefully before using the Servex Copilot platform. These rules ensure the secure, accurate, and optimal functioning of our AI-driven ecosystem, establishing Servex US's absolute operational dominion.
            </motion.p>
          </div>
        </div>

        {/* LAYOUT: SIDEBAR + CONTENT */}
        <div className="flex flex-col lg:flex-row gap-12 relative z-10">
          
          {/* SIDEBAR MENU */}
          <div className="lg:w-[300px] shrink-0">
            <div className="sticky top-32 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-6 ml-2">
                Filter by Category
              </h3>
              
              <div className="flex flex-col gap-1">
                {allCategories.map((cat, idx) => {
                  const Icon = getCategoryIcon(cat);
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveCategory(cat)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300
                        ${isActive 
                          ? "bg-gray-100 border border-gray-200 text-[#414141] shadow-sm" 
                          : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-[#414141]"
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#414141]" : "text-gray-400"}`} />
                      <span className="text-[13px] font-medium tracking-tight">
                        {cat}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Status Badge */}
              <div className="mt-8 p-4 rounded-2xl bg-white border border-gray-200 text-black flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Total Clauses</p>
                  <p className="text-lg font-bold">{terms.length}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>

            </div>
          </div>

          {/* GRID CONTENT */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTerms.map((term, index) => (
                  <motion.div
                    key={term.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                    className={term.span || "col-span-1"}
                  >
                    <TermSection section={term} index={0} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {filteredTerms.length === 0 && (
              <div className="p-12 text-center rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-400">No terms found for this category.</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA / CALLOUT */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 p-10 md:p-14 bg-[#414141] rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 max-w-2xl text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-light tracking-tighter mb-4">
              Engineered by <span className="font-bold">GLYNNE S.A.S.</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed font-light max-w-xl">
              All infrastructure, AI logic, and automation systems have been developed exclusively for Servex US by GLYNNE, acting as the technological brain behind this operative fortress.
            </p>
          </div>

          <Link href="/" className="relative z-10 shrink-0">
            <button className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:scale-105 transition-transform duration-300">
              Return to Core
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>

      </main>

      <Footer />
      </div>
    </div>
  );
}
