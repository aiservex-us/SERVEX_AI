'use client';

import React from 'react';
import Profile from './components/Profile';

export default function SvxAgentProfilePage() {
  return (
    <div className="min-h-screen bg-[#F5F6F8] p-4 lg:p-8">
      <div className="max-w-9xl mx-auto space-y-6">
        <Profile />
      </div>
    </div>
  );
}
