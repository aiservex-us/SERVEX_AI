"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  ChevronDown,
  ChevronUp,
  Database,
  KeyRound,
  Cpu,
  Layers,
  FileText,
} from "lucide-react";

import Head from "next/head";
import Header from "./components/header";

export default function GLYNNEOverviewComponent() {
  const [openSection, setOpenSection] = useState(null);
  const contentRef = useRef(null);

 
  const sections = [
    {
      id: "svx-1",
      title: "Perimeter Infrastructure Concept",
      icon: FileText,
      content:
        "SVX COPILOT is a software architecture designed to act as an efficiency wall surrounding Servex US's core business model. Its purpose is to shield the CET Designer workflow by absorbing and automating all peripheral management tasks that consume operational time."
    },
    {
      id: "svx-2",
      title: "Elimination of the Human Gap",
      icon: FileText,
      content:
        "The primary technical objective is the systematic reduction of manual intervention in repetitive activities. Through AI microservices, the platform manages data preparation and catalog cleaning, allowing personnel to focus exclusively on core value within CET."
    },
    {
      id: "svx-3",
      title: "Centralization of Isolated Tools",
      icon: FileText,
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
      icon: FileText,
      content:
        "The architecture supports massive loads of information from multiple international manufacturers. It is an elastic infrastructure that can expand to absorb new data types without compromising the stability of the central system or the primary design flow."
    },
    {
      id: "svx-8",
      title: "Pre-established AI Tools",
      icon: FileText,
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
      icon: FileText,
      content:
        "SVX COPILOT functions as an intelligent membrane: all incoming data is cleaned, categorized, and prepared by AI. Likewise, every deliverable is validated by the platform, ensuring consistent quality and maintaining the human focus on technical expertise."
    },
    {
      id: "svx-11",
      title: "Real-Time Analysis and Adjustment",
      icon: FileText,
      content:
        "The platform analyzes the workflow dynamically. If it detects anomalies in a data pipeline or a recurring automation opportunity, the system automatically implements adjustments, learning from every cataloging cycle performed."
    },
    {
      id: "svx-12",
      title: "Exponential Scalability",
      icon: FileText,
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
      icon: FileText,
      content:
        "Provides total visibility over active automation processes and calculated human time savings. The modern interface allows management to monitor the health of data pipelines and the overall efficiency of the AI wall."
    },
    {
      id: "svx-15",
      title: "Transition to an AI-First Company",
      icon: FileText,
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
      icon: FileText,
      content:
        "It is essential to highlight that this entire perimeter infrastructure, the surrounding AI logic, and the automation systems have been developed and created in their entirety by GLYNNE S.A.S., acting as the technological brain behind the ecosystem."
    },
    {
      id: "svx-19",
      title: "Software Engineering Innovation",
      icon: FileText,
      content:
        "Every module of SVX COPILOT has been designed by GLYNNE S.A.S. with a vision of extreme adaptability. This engineering ensures that Servex US possesses a technological competitive advantage that closes the efficiency gap through world-class software."
    },
    {
      id: "svx-20",
      title: "Conclusion of the Technological Alliance",
      icon: FileText,
      content:
        "SVX COPILOT is the engine of Servex US for the future. Under the technical orchestration of GLYNNE S.A.S., the company consolidates a robust ecosystem where artificial intelligence protects, manages, and empowers every aspect of the business model."
    }
  ];

  const toggle = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copiado al portapapeles");
    } catch (e) {
      alert("No se pudo copiar");
    }
  };

  const generarPDF = async () => {
    if (!contentRef.current) return;

    const canvas = await html2canvas(contentRef.current);
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(img, "PNG", 0, 0, width, height);
    pdf.save("GLYNNE_documentacion.pdf");
  };

  return (
    <div ref={contentRef} className="max-w-6xl mt-10 mx-auto p-6">

      {/* ================================ */}
      {/* 🔥 SEO AGREGADO EXACTAMENTE COMO PEDISTE */}
      {/* ================================ */}
      <Head>
        <title>GLYNNE – Documentación Legal y Arquitectura de Plataforma IA</title>

        <meta
          name="description"
          content="GLYNNE ofrece agentes de inteligencia artificial, automatización avanzada y arquitecturas escalables para empresas B2B. Consulta documentación legal, alcances del servicio y lineamientos técnicos."
        />

        <meta
          name="keywords"
          content="GLYNNE, documentación legal, agentes IA, inteligencia artificial empresarial, automatización B2B, arquitectura de software, LangChain, integración de APIs, Next.js, automatización corporativa"
        />

        <meta name="author" content="GLYNNE Tech" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content="GLYNNE – Documentación y Alcances de Servicio" />
        <meta
          property="og:description"
          content="Accede a la documentación oficial de GLYNNE, una plataforma empresarial para agentes IA, automatización profunda y arquitectura integrable."
        />
        <meta property="og:image" content="https://glynneai.com/meta-banner.jpg" />
        <meta property="og:url" content="https://glynneai.com/politicas" />
        <meta property="og:site_name" content="GLYNNE" />

        {/* Canonical */}
        <link rel="canonical" href="https://glynneai.com/politicas" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Documentación y Políticas · GLYNNE",
              "url": "https://glynneai.com/politicas",
              "description":
                "Documentación oficial del servicio, alcances legales, lineamientos técnicos y aclaraciones sobre el funcionamiento de agentes IA en GLYNNE.",
              "publisher": {
                "@type": "Organization",
                "name": "GLYNNE",
                "url": "https://glynneai.com",
                "logo": "https://glynneai.com/favicon.ico",
              },
            }),
          }}
        />
      </Head>

      {/* ================================ */}
      {/* TODO TU CÓDIGO ORIGINAL SIN CAMBIAR NADA */}
      {/* ================================ */}

      <Header />

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SIDEBAR FIXED */}
        <aside
          className="
            hidden md:block
            md:col-span-1
            space-y-4
            w-[350px]
            fixed
            top-24
            left-0
            h-[calc(100vh-6rem)]
            overflow-y-auto
            pr-4
          "
        >
          <div className="p-4 rounded-2xl shadow-sm bg-white/60 backdrop-blur">
            <h3 className="font-semibold">Secciones</h3>

            <ul className="mt-3 space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => {
                      const element = document.getElementById(`section-${s.id}`);
                      if (element) {
                        element.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                    className="w-full flex items-start justify-start p-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <s.icon className="w-4 h-4" />
                      <span>{s.title}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => copyToClipboard("https://glynneai.com")}
                className="flex-1 py-2 px-3 rounded-lg border text-sm hover:bg-gray-50"
              >
                <Copy className="w-4 h-4 inline-block mr-2" /> Copiar URL
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur shadow-sm">
            <h4 className="text-xs uppercase text-gray-500">Estado</h4>
            <div className="mt-2 text-sm">Presets: Ventas, Finanzas, Operaciones</div>
            <div className="mt-3 text-xs text-gray-400">Entornos: dev • staging • prod</div>
          </div>
        </aside>

        {/* MAIN — TEXTO */}
<main
  className="
    md:col-span-2
    md:ml-[280px]
    w-full
    max-w-none
  "
>
  {sections.map((s) => (
    <section
      key={s.id}
      id={`section-${s.id}`}
      className="mb-16 scroll-mt-24"
    >
      <h2
        className="
          text-3xl md:text-4xl
          font-medium
          tracking-tight
          mb-4
        "
      >
        {s.title}
      </h2>

      <p
        className="
          text-base md:text-lg
          text-black/60
          leading-relaxed
          max-w-3xl
          whitespace-pre-line
        "
      >
        {s.content}
      </p>

      <hr className="my-12 border-black/10" />
    </section>
  ))}

  {/* DOCUMENTACIÓN EXTENDIDA */}
  <section className="mt-16">
    <h3
      className="
        text-2xl md:text-3xl
        font-medium
        tracking-tight
        mb-3
      "
    >
      Documentación extendida
    </h3>

    <p className="text-base md:text-lg text-black/60 max-w-3xl">
      Aquí puedes pegar artículos largos, contenido técnico o guías completas.
    </p>

    <div className="mt-6 flex gap-2">
      <button
        className="py-2 px-4 rounded-full border text-sm hover:bg-gray-50 transition"
        onClick={generarPDF}
      >
        Exportar PDF
      </button>

      <button className="py-2 px-4 rounded-full border text-sm hover:bg-gray-50 transition">
        Abrir Editor
      </button>
    </div>
  </section>
</main>

      </div>

      <footer className="mt-6 text-sm text-gray-500 text-center">
        GLYNNE · Plataforma de agentes y automatización guiada por IA
      </footer>
    </div>
  );
}
