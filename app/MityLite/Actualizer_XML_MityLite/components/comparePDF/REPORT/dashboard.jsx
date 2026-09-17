'use client';
import React from 'react';
import AuditReportViewer from './components/Report';

export default function Dashboard() {
  return (
    <div
      className="min-h-[85vh] bg-[#FFF] p-4 lg:p-6"
      style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
        <div className="relative w-full transition-all duration-500 ease-out">
          <div className="w-full h-full overflow-hidden transition-all duration-500 ease-out">
            <div className="bg-white">
              <AuditReportViewer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
