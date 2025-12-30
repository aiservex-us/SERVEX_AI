"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Database,
  KeyRound,
  Cpu,
  Layers,
  FileText,
  ExternalLink,
  Info,
  ArrowLeft
} from "lucide-react";

import Head from "next/head";
import Link from "next/link";

export default function GLYNNEOverviewComponent() {
  const [activeTab, setActiveTab] = useState("svx-1");
  const contentRef = useRef(null);

  const sections = [
    {
      id: "svx-1",
      title: "Perimeter Infrastructure Concept",
      icon: Layers,
      content:
        "SVX COPILOT is a software architecture designed to act as an efficiency wall surrounding Servex US's core business model. Its purpose is to shield the CET Designer workflow by absorbing and automating all peripheral management tasks that consume operational time."
    },
    {
      id: "svx-2",
      title: "Elimination of the Human Gap",
      icon: Cpu,
      content:
        "The primary technical objective is the systematic reduction of manual intervention in repetitive activities. Through AI microservices, the platform manages data preparation and catalog cleaning, allowing personnel to focus exclusively on core value within CET."
    },
    {
      id: "svx-3",
      title: "Centralization of Isolated Tools",
      icon: Database,
      content:
        "The platform unifies processes that are traditionally scattered across disconnected tools. SVX COPILOT integrates analysis, validation, and data management into a single control panel, enabling previously isolated tools to operate under a unified artificial intelligence logic."
    },
    {
      id: "svx-4",
      title: "Extra-CET Automation",
      icon: FileText,
      content:
        "SVX COPILOT manages the entire technical process outside of catalog development in CET Designer. From specification extraction to database structuring, it ensures that information reaches the designer already filtered and optimized by the software infrastructure."
    },
    {
      id: "svx-5",
      title: "AI-Guided Task Management",
      icon: FileText,
      content:
        "The system implements algorithms that pre-configure tasks based on priority and manufacturer. It acts as an active system that prepares necessary resources before human intervention, reducing operational setup times from hours to just seconds."
    },
    {
      id: "svx-6",
      title: "Intelligent Requirement Interpretation",
      icon: FileText,
      content:
        "Utilizing neural networks and natural language processing, SVX COPILOT interprets complex requirements. This allows the system to make logical decisions regarding data structure, minimizing the human review needed to avoid formatting or drafting errors."
    },
    {
      id: "svx-7",
      title: "Adaptable Data Infrastructure",
      icon: Database,
      content:
        "The architecture supports massive loads of information from multiple international manufacturers. It is an elastic infrastructure that can expand to absorb new data types without compromising the stability of the central system or the primary design flow."
    },
    {
      id: "svx-8",
      title: "Pre-established AI Tools",
      icon: Cpu,
      content:
        "Users access a repository of ready-to-use AI solutions, trained with Servex's specific know-how. Functions such as model filtering or technical documentation generation become one-click processes, eliminating the need for creation from scratch."
    },
    {
      id: "svx-9",
      title: "Business Model Optimization",
      icon: FileText,
      content:
        "By delegating the operational load to the software infrastructure, Servex US achieves unprecedented optimization. The platform accelerates project delivery and improves catalog precision, allowing for a higher volume of clients to be managed with the same staff structure."
    },
    {
      id: "svx-10",
      title: "The Technological Efficiency Wall",
      icon: Layers,
      content:
        "SVX COPILOT functions as an intelligent membrane: all incoming data is cleaned, categorized, and prepared by AI. Likewise, every deliverable is validated by the platform, ensuring consistent quality and maintaining the human focus on technical expertise."
    },
    {
      id: "svx-11",
      title: "Real-Time Analysis and Adjustment",
      icon: Cpu,
      content:
        "The platform analyzes the workflow dynamically. If it detects anomalies in a data pipeline or a recurring automation opportunity, the system automatically implements adjustments, learning from every cataloging cycle performed."
    },
    {
      id: "svx-12",
      title: "Exponential Scalability",
      icon: Database,
      content:
        "Thanks to AI-guided infrastructure, Servex's growth does not rely on linear hiring for administrative tasks. SVX COPILOT enables production scaling while maintaining operational agility through automated processing power."
    },
    {
      id: "svx-13",
      title: "Technical Synergy with Manufacturers",
      icon: FileText,
      content:
        "The platform automates the interpretation of manufacturer product guides, reducing manual technical inquiries. The AI resolves compatibility doubts based on the ecosystem's centralized historical and technical database."
    },
    {
      id: "svx-14",
      title: "Infrastructure Control Dashboard",
      icon: Layers,
      content:
        "Provides total visibility over active automation processes and calculated human time savings. The modern interface allows management to monitor the health of data pipelines and the overall efficiency of the AI wall."
    },
    {
      id: "svx-15",
      title: "Transition to an AI-First Company",
      icon: Cpu,
      content:
        "SVX COPILOT redefines Servex's operational identity, positioning it as a technological powerhouse. The infrastructure ensures that technology handles the heavy lifting, while the human team contributes exclusively with expert and creative judgment."
    },
    {
      id: "svx-16",
      title: "Operational Perimeter Autonomy",
      icon: FileText,
      content:
        "The long-term vision is the total autonomy of the peripheral environment. SVX COPILOT aims to predict project needs before they begin, preparing the necessary data architecture proactively and without intervention."
    },
    {
      id: "svx-17",
      title: "Input Filtering and Preparation",
      icon: FileText,
      content:
        "Every external requirement is processed by AI to ensure it meets Servex's standards before entering the design workflow. This ensures that the CET ecosystem receives only high-quality, ready-to-process information."
    },
    {
      id: "svx-18",
      title: "Architecture and Development by GLYNNE S.A.S.",
      icon: KeyRound,
      content:
        "It is essential to highlight that this entire perimeter infrastructure, the surrounding AI logic, and the automation systems have been developed and created in their entirety by GLYNNE S.A.S., acting as the technological brain behind the ecosystem."
    },
    {
      id: "svx-19",
      title: "Software Engineering Innovation",
      icon: Cpu,
      content:
        "Every module of SVX COPILOT has been designed by GLYNNE S.A.S. with a vision of extreme adaptability. This engineering ensures that Servex US possesses a technological competitive advantage that closes the efficiency gap through world-class software."
    },
    {
      id: "svx-20",
      title: "Conclusion of the Technological Alliance",
      icon: Layers,
      content:
        "SVX COPILOT is the engine of Servex US for the future. Under the technical orchestration of GLYNNE S.A.S., the company consolidates a robust ecosystem where artificial intelligence protects, manages, and empowers every aspect of the business model."
    }
  ];

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Error al copiar");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF] font-sans text-[#242424]">
      <Head>
        <title>SVX Copilot– Documentación Técnica</title>
      </Head>

      {/* HEADER ESTILO TEAMS / LOGO */}
      <header className="h-[48px] bg-[#464775] flex items-center px-4 justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <img src="/logo2.png" alt="Logo" className="h-6 w-auto" />
          <div className="h-4 w-[1px] bg-white/30 hidden md:block" />
          <span className="text-white text-xs font-semibold hidden md:block tracking-tight">Technical Overview</span>
        </Link>
        <div className="flex items-center gap-4 text-white/90 text-xs">
          <span className="cursor-pointer hover:text-white transition">Docs</span>
          <span className="cursor-pointer hover:text-white transition">Support</span>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row gap-0 md:h-[calc(100vh-48px)] overflow-hidden">
        
        {/* SIDEBAR ESTILO TEAMS */}
        <aside className="w-full md:w-[280px] bg-[#FFF] border-r border-[#D1D1D1] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#D1D1D1] bg-[#F0F0F0]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#616161] mb-2">Contenido</h3>
            <div className="flex items-center justify-between bg-white rounded border border-[#D1D1D1] px-2 py-1.5 shadow-sm">
              <span className="text-xs text-[#242424] font-semibold">SVX Architecture</span>
              <Info className="w-3.5 h-3.5 text-[#5b5fc7]" />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar bg-[#FFF]">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveTab(s.id);
                  document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-all duration-150 group ${
                  activeTab === s.id 
                  ? "bg-white text-[#5b5fc7] shadow-sm" 
                  : "text-[#424242] hover:bg-[#E0E0E0]"
                }`}
              >
                <s.icon className={`w-3.5 h-3.5 shrink-0 ${activeTab === s.id ? "text-[#5b5fc7]" : "text-[#616161]"}`} />
                <span className={`text-[12px] truncate leading-tight ${activeTab === s.id ? "font-bold" : "font-medium"}`}>
                  {s.title}
                </span>
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-[#D1D1D1] bg-[#F0F0F0]">
             <button 
              onClick={() => copyToClipboard("https://glynneai.com")}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-[11px] font-bold text-[#5b5fc7] bg-white border border-[#D1D1D1] rounded hover:bg-[#F5F5F5] transition shadow-sm"
            >
              <Copy className="w-3 h-3" /> Copiar Enlace
            </button>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 bg-white overflow-y-auto relative custom-scrollbar scroll-smooth" ref={contentRef}>
          {/* BARRA DE TÍTULO INTERNA */}
          <div className="sticky top-0 z-10 bg-white border-b border-[#EDEBE9] px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <div className="md:hidden p-1 hover:bg-gray-100 rounded">
                  <ArrowLeft className="w-4 h-4" />
               </div>
               <h1 className="text-sm font-bold text-[#242424] flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500" /> Visión Técnica SVX
               </h1>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-6 py-10">
            {sections.map((s) => (
              <section
                key={s.id}
                id={`section-${s.id}`}
                className="mb-10 last:mb-20 scroll-mt-20"
              >
                <div className="flex items-center gap-2 mb-3">
                   <s.icon className="w-4 h-4 text-[#5b5fc7]" />
                   <h2 className="text-sm font-bold text-[#242424] uppercase tracking-wide">
                    {s.title}
                  </h2>
                </div>

                <div className="bg-white border border-[#EDEBE9] p-5 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <p className="text-[#323130] leading-relaxed text-[13px] whitespace-pre-line font-medium">
                    {s.content}
                  </p>
                </div>
              </section>
            ))}

            {/* SECCIÓN FINAL REFINADA */}
            <section className="mt-16 p-6 bg-[#FAF9F8] rounded border border-[#EDEBE9]">
              <h3 className="text-xs font-bold mb-2 flex items-center gap-2 text-[#5b5fc7]">
                <FileText className="w-3.5 h-3.5" /> RECURSOS ADICIONALES
              </h3>
              <p className="text-[12px] text-[#605E5C] mb-4">
                Toda la infraestructura descrita ha sido diseñada bajo estándares ISO de seguridad y escalabilidad elástica.
              </p>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-1.5 bg-white border border-[#D1D1D1] rounded text-[11px] font-bold hover:bg-[#F3F2F1] transition">
                  <ExternalLink className="w-3 h-3" /> Repositorio Técnico
                </button>
              </div>
            </section>
          </div>

          <footer className="py-8 text-center text-[#605E5C] border-t border-[#EDEBE9] bg-[#FAF9F8]">
            <p className="text-[10px] font-bold uppercase tracking-[2px] opacity-60">GLYNNE S.A.S. · SYSTEM ARCHITECTURE · 2024</p>
          </footer>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #C8C8C8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A6A6A6;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}