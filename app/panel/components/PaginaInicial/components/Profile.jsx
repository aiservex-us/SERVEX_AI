'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';

const InfoItem = ({ label, value }) => (
  <div className="flex flex-col py-2 border-b border-slate-50 last:border-0">
    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
      {label}
    </span>
    <span className="text-[12px] text-slate-700 font-medium">
      {value || '—'}
    </span>
  </div>
);

export default function EmployeeProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  if (!user) return null;

  // 🔐 DATOS REALES DESDE AZURE
  const identity = user.identities?.[0]?.identity_data || {};
  const metadata = user.user_metadata || {};

  const name =
    metadata.name ||
    metadata.full_name ||
    identity.name ||
    identity.display_name ||
    'Usuario';

  const email =
    user.email ||
    identity.email ||
    identity.preferred_username ||
    null;

  const username =
    metadata.preferred_username ||
    identity.preferred_username ||
    null;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#6264A7]/5 rounded-bl-full -mr-10 -mt-10" />

      <div className="relative flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-2xl bg-[#6264A7]/10 border-4 border-slate-50 shadow-sm flex items-center justify-center">
            <span className="text-xl font-bold text-[#6264A7]">
              {name.charAt(0)}
            </span>
          </div>

          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#6264A7] rounded-lg border-2 border-white flex items-center justify-center shadow-sm">
            <AlertCircle className="text-white w-3 h-3" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-[16px] font-bold text-slate-800">
            {name}
          </h2>
          <span className="text-[11px] font-bold text-[#6264A7] bg-[#6264A7]/5 px-2 py-0.5 rounded-full uppercase">
            ID: {user.id.slice(0, 8)}
          </span>
        </div>

        <div className="w-full space-y-1">
          <InfoItem label="Correo Corporativo" value={email} />
          <InfoItem label="Usuario" value={username} />
          <InfoItem label="Proveedor Auth" value="Microsoft Azure" />
        </div>
      </div>
    </div>
  );
}
