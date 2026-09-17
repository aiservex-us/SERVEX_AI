'use client';

import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { FiCheck, FiCpu, FiServer, FiShield } from 'react-icons/fi';

const PricingPage = () => {
  return (
    <>
      <Header />
      <BackgroundWrapper theme="light">
        <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 relative z-10 w-full overflow-hidden flex flex-col items-center">
          
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-black/10 text-xs font-semibold text-black mb-6">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
              Strategic Pricing
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black tracking-tight mb-6 leading-tight">
              Enterprise-Grade AI,
              <br />
              <span className="text-neutral-400">Priced for Operational Scale.</span>
            </h1>
            <p className="text-neutral-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Servex Copilot pricing is designed to reflect the architectural complexity and deterministic accuracy required for enterprise 3D data governance. Predictable costs, zero hallucination risk.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
            
            {/* TIER 1: Core Automation */}
            <div className="flex flex-col bg-white rounded-3xl p-8 border border-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-black">
                  <FiCpu className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-black">Core Automation</h3>
              </div>
              <p className="text-sm text-neutral-500 mb-6 min-h-[40px]">
                Standard ETL pipelines and deterministic XML parsing for growing teams.
              </p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-black">$499</span>
                <span className="text-neutral-500 text-sm">/mo</span>
              </div>
              <button className="w-full py-3 px-4 rounded-xl border border-black/10 bg-white text-black font-semibold text-sm hover:bg-neutral-50 transition-colors mb-8">
                Start with Core
              </button>
              <div className="flex flex-col gap-4 flex-1">
                <p className="text-xs font-semibold text-black uppercase tracking-wider">Features included</p>
                <ul className="flex flex-col gap-3">
                  {['Automated XML Generation', 'Deterministic Parsing (0% Error)', 'Up to 5 Data Pipelines', 'Standard Support', 'Monthly Architecture Review'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
                      <FiCheck className="w-4 h-4 text-black mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* TIER 2: Enterprise AI (Highlighted) */}
            <div className="flex flex-col bg-black rounded-3xl p-8 border border-neutral-800 shadow-2xl relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm border border-black/10">
                RECOMMENDED
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white">
                  <FiShield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">Enterprise AI</h3>
              </div>
              <p className="text-sm text-neutral-400 mb-6 min-h-[40px]">
                Full access to multi-agent ecosystems and advanced structural integrity validation.
              </p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">$1,299</span>
                <span className="text-neutral-400 text-sm">/mo</span>
              </div>
              <button className="w-full py-3 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors mb-8">
                Upgrade to Enterprise
              </button>
              <div className="flex flex-col gap-4 flex-1">
                <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Everything in Core, plus</p>
                <ul className="flex flex-col gap-3">
                  {['Multi-Agent System Orchestration', 'Unlimited Active Data Pipelines', 'Advanced CET Validation Engine', 'Priority Technical Support', 'Dedicated Cloud Environment'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                      <FiCheck className="w-4 h-4 text-white mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* TIER 3: Dedicated Node */}
            <div className="flex flex-col bg-[#fafafa] rounded-3xl p-8 border border-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-neutral-200 flex items-center justify-center text-black">
                  <FiServer className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-black">Dedicated Node</h3>
              </div>
              <p className="text-sm text-neutral-500 mb-6 min-h-[40px]">
                Customized on-premise integrations and dedicated hardware architecture.
              </p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-black">Custom</span>
              </div>
              <button className="w-full py-3 px-4 rounded-xl border border-black/10 bg-white text-black font-semibold text-sm hover:bg-neutral-50 transition-colors mb-8">
                Contact Engineering
              </button>
              <div className="flex flex-col gap-4 flex-1">
                <p className="text-xs font-semibold text-black uppercase tracking-wider">Everything in Enterprise, plus</p>
                <ul className="flex flex-col gap-3">
                  {['Custom ETL Pipeline Development', 'On-Premise Azure Deployment', 'White-glove SLA Guarantees', 'Bespoke Parser Training', '24/7 Dedicated Engineering Lead'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
                      <FiCheck className="w-4 h-4 text-black mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
          </div>

          {/* Bottom FAQ / Assurance */}
          <div className="mt-24 max-w-3xl text-center">
            <h3 className="text-xl font-semibold text-black mb-4">No hidden compute costs</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Unlike traditional API-based LLMs that charge per token, Servex Copilot pricing is based strictly on operational nodes and architecture capacity. You pay for the structural integrity and automation bandwidth, ensuring your costs scale predictably alongside your catalog complexity.
            </p>
          </div>

        </div>
      </BackgroundWrapper>
      <Footer />
    </>
  );
};

export default PricingPage;
