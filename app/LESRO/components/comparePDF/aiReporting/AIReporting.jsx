'use client';
import React from 'react';
import Header from './compnents/Header';
import Sidebar from './compnents/Sidebar';
import DashboardContent from './compnents/DashboardContent';

export default function AIReporting() {
  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] text-[#242424] font-sans overflow-hidden rounded-2xl border border-[#E1E1E1]">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col bg-[#F5F5F5] p-6 overflow-y-auto custom-scrollbar">
          <DashboardContent />
        </main>
      </div>
    </div>
  );
}