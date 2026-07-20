"use client";

import { motion } from "framer-motion";
import {
  Database,
  KeyRound,
  Cpu,
  Layers,
  FileText,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import Header from "../components/header";
import Footer from "../components/footer";

const sections = [
  {
    id: "svx-1",
    title: "Perimeter Infrastructure Concept",
    icon: Layers,
    content: "Servex Copilot is a software architecture designed to act as an efficiency wall surrounding Servex US's core business model. Its purpose is to shield the CET Designer workflow by absorbing and automating all peripheral management tasks that consume operational time.",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "svx-2",
    title: "Elimination of the Human Gap",
    icon: Cpu,
    content: "The primary technical objective is the systematic reduction of manual intervention in repetitive activities. Through AI microservices, the platform manages data preparation and catalog cleaning, allowing personnel to focus exclusively on core value within CET.",
    span: "col-span-1"
  },
  {
    id: "svx-3",
    title: "Centralization of Isolated Tools",
    icon: Database,
    content: "The platform unifies processes that are traditionally scattered across disconnected tools. Servex Copilot integrates analysis, validation, and data management into a single control panel, enabling previously isolated tools to operate under a unified artificial intelligence logic.",
    span: "col-span-1"
  },
  {
    id: "svx-4",
    title: "Extra-CET Automation",
    icon: Zap,
    content: "Servex Copilot manages the entire technical process outside of catalog development in CET Designer. From specification extraction to database structuring, it ensures that information reaches the designer already filtered and optimized by the software infrastructure.",
    span: "col-span-1"
  },
  {
    id: "svx-5",
    title: "AI-Guided Task Management",
    icon: FileText,
    content: "The system implements algorithms that pre-configure tasks based on priority and manufacturer. It acts as an active system that prepares necessary resources before human intervention, reducing operational setup times from hours to just seconds.",
    span: "col-span-1"
  },
  {
    id: "svx-6",
    title: "Intelligent Requirement Interpretation",
    icon: ShieldCheck,
    content: "Utilizing neural networks and natural language processing, Servex Copilot interprets complex requirements. This allows the system to make logical decisions regarding data structure, minimizing the human review needed to avoid formatting or drafting errors.",
    span: "col-span-1 md:col-span-2 lg:col-span-3"
  },
  {
    id: "svx-7",
    title: "Adaptable Data Infrastructure",
    icon: Database,
    content: "The architecture supports massive loads of information from multiple international manufacturers. It is an elastic infrastructure that can expand to absorb new data types without compromising the stability of the central system or the primary design flow.",
    span: "col-span-1 md:col-span-2"
  },
  {
    id: "svx-8",
    title: "Pre-established AI Tools",
    icon: Cpu,
    content: "Users access a repository of ready-to-use AI solutions, trained with Servex's specific know-how. Functions such as model filtering or technical documentation generation become one-click processes.",
    span: "col-span-1"
  },
  {
    id: "svx-9",
    title: "Business Model Optimization",
    icon: Layers,
    content: "By delegating the operational load to the software infrastructure, Servex US achieves unprecedented optimization. The platform accelerates project delivery and improves catalog precision, allowing for a higher volume of clients to be managed with the same staff structure.",
    span: "col-span-1 md:col-span-2 lg:col-span-2"
  },
  {
    id: "svx-10",
    title: "The Technological Efficiency Wall",
    icon: Zap,
    content: "Servex Copilot functions as an intelligent membrane: all incoming data is cleaned, categorized, and prepared by AI. Likewise, every deliverable is validated by the platform, ensuring consistent quality and maintaining the human focus on technical expertise.",
    span: "col-span-1"
  },
  {
    id: "svx-11",
    title: "Real-Time Analysis and Adjustment",
    icon: Cpu,
    content: "The platform analyzes the workflow dynamically. If it detects anomalies in a data pipeline or a recurring automation opportunity, the system automatically implements adjustments, learning from every cataloging cycle performed.",
    span: "col-span-1"
  },
  {
    id: "svx-12",
    title: "Exponential Scalability",
    icon: Database,
    content: "Thanks to AI-guided infrastructure, Servex's growth does not rely on linear hiring for administrative tasks. Servex Copilot enables production scaling while maintaining operational agility through automated processing power.",
    span: "col-span-1"
  },
  {
    id: "svx-18",
    title: "Architecture by GLYNNE S.A.S.",
    icon: KeyRound,
    content: "It is essential to highlight that this entire perimeter infrastructure, the surrounding AI logic, and the automation systems have been developed and created in their entirety by GLYNNE S.A.S., acting as the technological brain behind the ecosystem.",
    span: "col-span-1 md:col-span-2 lg:col-span-1"
  }
];

export default function TechnicalOverview() {
  return (
    <div className="min-h-screen bg-[#fff] font-sans text-[#1a1a1a] overflow-hidden flex flex-col relative">
      
      {/* Background Orbs (Premium Aesthetic) */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-50 to-transparent blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-gradient-to-bl from-purple-50 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-gradient-to-tr from-blue-50 to-transparent blur-[120px]" />
      </div>

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-20 mt-10">
        
        {/* HERO SECTION */}
        <div className="text-center md:text-left max-w-3xl mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-indigo-500 uppercase mb-4">
              System Architecture
            </p>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-[1.1] mb-6 text-[#1a1a1a]">
              The Perimeter <br className="hidden md:block" />
              <span className="font-bold">Efficiency Wall.</span>
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed max-w-2xl">
              Discover the engineering principles behind Servex Copilot. A software architecture designed to absorb and automate peripheral management tasks, shielding your core workflow.
            </p>
          </motion.div>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`
                group relative bg-white/60 backdrop-blur-md border border-black/[0.04] 
                rounded-3xl p-8 sm:p-10 flex flex-col justify-between
                shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)]
                hover:-translate-y-1 transition-all duration-500
                ${section.span}
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors duration-500">
                  <section.icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-500" />
                </div>
                
                <h3 className="text-lg md:text-xl font-semibold tracking-tight text-[#1a1a1a] mb-4">
                  {section.title}
                </h3>
                
                <p className="text-[13px] md:text-sm text-gray-500 leading-relaxed font-light">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* GLYNNE CTA / CALLOUT */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 p-10 md:p-14 bg-[#1a1a1a] rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 max-w-2xl text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-light tracking-tighter mb-4">
              Engineered by <span className="font-bold">GLYNNE S.A.S.</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed font-light max-w-xl">
              All infrastructure, AI logic, and automation systems have been developed entirely by GLYNNE, acting as the technological brain behind the SVX ecosystem. Designed under ISO standards of security and elastic scalability.
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
  );
}