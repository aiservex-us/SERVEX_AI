"use client";

import { motion } from "framer-motion";

export default function TermSection({ section, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`
        group relative bg-white/60 backdrop-blur-md border border-black/[0.04] 
        rounded-3xl p-8 sm:p-10 flex flex-col justify-start
        shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)]
        hover:-translate-y-1 transition-all duration-500
        ${section.span || "col-span-1"}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors duration-500">
          <section.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-500" />
        </div>
        
        <h3 className="text-lg md:text-xl font-semibold tracking-tight text-[#1a1a1a] mb-4">
          {section.title}
        </h3>
        
        <p className="text-[13px] md:text-sm text-gray-500 leading-relaxed font-light whitespace-pre-line">
          {section.content}
        </p>
      </div>
    </motion.div>
  );
}
