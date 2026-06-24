'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, X, Search } from 'lucide-react'; // 🔹 Agregué Search para el input
import InsertXML from './incertXML'; // 🔹 NUEVO IMPORT

export default function Calendar() {
  const router = useRouter();

  // 🔹 estado modal
  const [openModal, setOpenModal] = useState(false);

  // 🔹 Estado para el filtro de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // 🔹 Array de datos idéntico a tus tarjetas para poder filtrar dinámicamente
  const companies = [

    {
      company: "WB Workstations",
      logo: "/logosEmpresas/WB.webp",
      role: "Ergonomic Tech & ESD Workstations",
      description: "Estaciones de trabajo avanzadas con protección antiestática integrada, gestión inteligente de cableado y soluciones de conectividad para laboratorios y electrónica.",
      tags: ['Assembly', 'ESD-Protection', 'Tech-Design'],
      status: "Active contract",
      location: "United States",
      onOpen: () => router.push('/WBO')
    },
    {
      company: "WB Seating",
      logo: "/logosEmpresas/WB.webp",
      role: "Industrial Ergonomics & Lab Seating",
      description: "Sillas, taburetes y asientos técnicos de alta durabilidad con especificaciones certificadas para salas limpias y turnos prolongados en líneas de producción.",
      tags: ['Seating', 'Lab-Spec', 'Comfort'],
      status: "Active contract",
      location: "United States",
      onOpen: () => router.push('/WBS')
    },

    {
      company: "WB Tables",
      logo: "/logosEmpresas/WB.webp",
      role: "Heavy-Duty Production Worksurfaces",
      description: "Mesas de uso rudo y superficies de alta resistencia mecánica, diseñadas específicamente para soportar cargas pesadas en entornos de manufactura y ensamble.",
      tags: ['Manufacturing', 'Heavy-Duty', 'Production'],
      status: "Active contract",
      location: "United States",
      onOpen: () => router.push('/WBT')
    },
 
    {
      company: "WB Desks",
      logo: "/logosEmpresas/WB.webp",
      role: "Corporate Office & Educational Desks",
      description: "Mobiliario versátil y escritorios adaptables orientados a la productividad en entornos administrativos, oficinas ejecutivas y áreas de capacitación.",
      tags: ['Office', 'Educational', 'Facility'],
      status: "Active contract",
      location: "United States",
      onOpen: () => router.push('/WBD')
    },
        {
      company: "WB Accesories",
      logo: "/logosEmpresas/WB.webp",
      role: "Industrial Components & Modular Add-ons",
      description: "Componentes estructurales, brazos articulados, iluminación LED integrada y sistemas de soporte diseñados para optimizar el espacio de trabajo del operador.",
      tags: ['Accessories', 'Ergonomics', 'Customization'],
      status: "Active contract",
      location: "United States",
      onOpen: () => router.push('/WBA')
    },
       {
      company: "WB Storage",
      logo: "/logosEmpresas/WB.webp",
      role: "Modular Cabinets & High-Density Storage",
      description: "Sistemas de almacenamiento industrial robustos, gabinetes modulares y cajoneras de alta capacidad organizativa para herramientas e inventarios bajo metodologías 5S.",
      tags: ['Storage', 'Inventory', 'Lean-5S'],
      status: "Active contract",
      location: "United States",
      onOpen: () => router.push('/WBG')
    },
    {
      company: "LESRO",
      logo: "/logosEmpresas/lesro.png",
      role: "Enterprise Furniture Manufacturing",
      tags: ['Analytics', 'Automation', 'Orders'],
      status: "Active contract",
      location: "United States",
      onOpen: () => router.push('/LESRO')
    },
    {
      company: "Teknion",
      logo: "/logosEmpresas/Teknion_logo_RGB.svg",
      role: "Office Furniture Systems",
      tags: ['Analytics', 'ERP Sync'],
      status: "Active contract",
      location: "Global",
      onOpen: undefined
    },
    {
      company: "Shaw Floors",
      logo: "/logosEmpresas/ShawFloorsLogo_Navy.png",
      role: "Flooring Solutions",
      tags: ['Dashboards', 'Sales'],
      status: "Active contract",
      location: "United States",
      onOpen: undefined
    },
    {
      company: "MityLite",
      logo: "/logosEmpresas/mity-lite-logo.png",
      role: "Event Furniture",
      tags: ['Automation', 'Orders'],
      status: "Active contract",
      location: "United States",
      onOpen: undefined
    },
    {
      company: "H&M",
      logo: "/logosEmpresas/hm-logo-caption.svg",
      role: "Retail & Apparel",
      tags: ['BI', 'Reports'],
      status: "Active contract",
      location: "Global",
      onOpen: undefined
    },
    {
      company: "Metalumen",
      logo: "/logosEmpresas/logo-metalumen.png",
      role: "Lighting Manufacturing",
      tags: ['Analytics'],
      status: "Active contract",
      location: "United States",
      onOpen: undefined
    },
    {
      company: "Via Seating",
      logo: "/logosEmpresas/via_peach-brown-logo.webp",
      role: "Seating Solutions",
      tags: ['Dashboards', 'Orders'],
      status: "Active contract",
      location: "United States",
      onOpen: undefined
    },
    {
      company: "DALS Lighting",
      logo: "/logosEmpresas/cropped-logo-dals.png",
      role: "Architectural Lighting",
      tags: ['Automation', 'Reports'],
      status: "Active contract",
      location: "Canada / US",
      onOpen: undefined
    },
    {
      company: "Header Group",
      logo: "/logosEmpresas/header_logo_hover.svg",
      role: "Manufacturing Group",
      tags: ['BI', 'Integrations'],
      status: "Active contract",
      location: "United States",
      onOpen: undefined
    }
  ];

  // 🔹 Filtrado por nombre de empresa o tags
  const filteredCompanies = companies.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.company.toLowerCase().includes(search) ||
      c.role.toLowerCase().includes(search) ||
      c.tags.some(tag => tag.toLowerCase().includes(search))
    );
  });

  return (
    <div className="bg-white p-6 rounded-xl">

      {/* ===================== */}
      {/* 🔹 HEADER (TEAMS STYLE) */}
      {/* ===================== */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-lg font-semibold text-slate-500 tracking-tight">
  SVX
</h2>

        {/* 🔹 INPUT DE FILTRADO AGREGADO AL HEADER */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Filter clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#6264A7] text-slate-700 placeholder-slate-400"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
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
      {/* 🔹 GRID DINÁMICO FILTRADO */}
      {/* ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompanies.map((item, idx) => (
          <CompanyCard
            key={idx}
            company={item.company}
            logo={item.logo}
            role={item.role}
            tags={item.tags}
            status={item.status}
            location={item.location}
            onOpen={item.onOpen}
          />
        ))}
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