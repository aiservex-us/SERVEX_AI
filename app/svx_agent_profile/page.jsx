'use client';

import React from 'react';
import Profile from './components/Profile';

export default function SvxAgentProfilePage() {
  return (
    <div className="min-h-screen bg-[#FFF] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Profile />
      </div>
    </div>
  );
}
