'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import InsertXML from './incertXML'; // 🔹 NUEVO IMPORT

export default function Calendar() {
  const router = useRouter();

  // 🔹 estado modal
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="bg-white p-6 rounded-xl">

      {/* ===================== */}
      {/* 🔹 HEADER (TEAMS STYLE) */}
      {/* ===================== */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
          Dashboard Clients
        </h2>

        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold
          bg-[#6264A7] text-white hover:bg-[#4f52a3] transition"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {/* ===================== */}
      {/* 🔹 MODAL (TEAMS STYLE) */}
      {/* ===================== */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl border border-slate-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">
                Add new client
              </h3>
              <button
                onClick={() => setOpenModal(false)}
                className="text-slate-500 hover:text-slate-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* 🔹 MODAL BODY → COMPONENTE IMPORTADO */}
            <div className="max-h-[80vh] overflow-y-auto">
              <InsertXML />
            </div>

          </div>
        </div>
      )}

      {/* ===================== */}
      {/* 🔹 GRID ORIGINAL */}
      {/* ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        <CompanyCard
          company="LESRO"
          logo="/logosEmpresas/lesro.png"
          role="Enterprise Furniture Manufacturing"
          tags={['Analytics', 'Automation', 'Orders']}
          status="Active contract"
          location="United States"
          onOpen={() => router.push('/LESRO')}
        />

        <CompanyCard
          company="Berner"
          logo="/logosEmpresas/berner-air-curtains-logo-png_seeklogo-351590.png"
          role="Air Curtains & HVAC"
          tags={['Dashboards', 'Sales', 'Reports']}
          status="Active contract"
          location="United States"
        />

        <CompanyCard
          company="Ali Group"
          logo="/logosEmpresas/logo-Ali-Group-ForLightBG.svg"
          role="Foodservice Equipment"
          tags={['BI', 'Integrations']}
          status="Active contract"
          location="Global"
        />

        <CompanyCard
          company="VIRCO"
          logo="/logosEmpresas/VIRCO_75-600x183.png"
          role="Educational Furniture"
          tags={['Orders', 'Automation']}
          status="Active contract"
          location="United States"
        />

        <CompanyCard
          company="Teknion"
          logo="/logosEmpresas/Teknion_logo_RGB.svg"
          role="Office Furniture Systems"
          tags={['Analytics', 'ERP Sync']}
          status="Active contract"
          location="Global"
        />

        <CompanyCard
          company="Shaw Floors"
          logo="/logosEmpresas/ShawFloorsLogo_Navy.png"
          role="Flooring Solutions"
          tags={['Dashboards', 'Sales']}
          status="Active contract"
          location="United States"
        />

        <CompanyCard
          company="MityLite"
          logo="/logosEmpresas/mity-lite-logo.png"
          role="Event Furniture"
          tags={['Automation', 'Orders']}
          status="Active contract"
          location="United States"
        />

        <CompanyCard
          company="H&M"
          logo="/logosEmpresas/hm-logo-caption.svg"
          role="Retail & Apparel"
          tags={['BI', 'Reports']}
          status="Active contract"
          location="Global"
        />

        <CompanyCard
          company="Metalumen"
          logo="/logosEmpresas/logo-metalumen.png"
          role="Lighting Manufacturing"
          tags={['Analytics']}
          status="Active contract"
          location="United States"
        />

        <CompanyCard
          company="Via Seating"
          logo="/logosEmpresas/via_peach-brown-logo.webp"
          role="Seating Solutions"
          tags={['Dashboards', 'Orders']}
          status="Active contract"
          location="United States"
        />

        <CompanyCard
          company="DALS Lighting"
          logo="/logosEmpresas/cropped-logo-dals.png"
          role="Architectural Lighting"
          tags={['Automation', 'Reports']}
          status="Active contract"
          location="Canada / US"
        />

        <CompanyCard
          company="Header Group"
          logo="/logosEmpresas/header_logo_hover.svg"
          role="Manufacturing Group"
          tags={['BI', 'Integrations']}
          status="Active contract"
          location="United States"
        />

      </div>
    </div>
  );
}

/* ===================== */
/* Company Card (SIN TOCAR) */
/* ===================== */

function CompanyCard({
  company,
  logo,
  role,
  tags,
  status,
  location,
  onOpen
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between min-h-[200px] hover:border-[#6264A7] transition">

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center">
            <img src={logo} alt={company} className="max-h-10 max-w-10 object-contain" />
          </div>

          <div className="leading-tight mt-1">
            <p className="text-xs font-medium text-slate-800">{company}</p>
            <h3 className="text-[11px] text-slate-500 mt-0.5">{role}</h3>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#6264A7]/10 text-[#6264A7] border border-[#6264A7]/30">
          Active
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {tags.map((tag, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="leading-tight">
          <p className="text-xs font-medium text-slate-900">{status}</p>
          <p className="text-[10px] text-slate-500">{location}</p>
        </div>

        <button
          onClick={onOpen}
          disabled={!onOpen}
          className={`text-[11px] px-3 py-1 rounded-md transition
            ${onOpen ? 'bg-[#6264A7] text-white hover:bg-[#4f52a3]' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
        >
          Open panel
        </button>
      </div>
    </div>
  );
}
