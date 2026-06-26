import Link from 'next/link';
import { FileCode, FileSpreadsheet, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          SERVEX_AI Dashboard
        </h1>
        <p className="text-slate-400">Seleccione el módulo de procesamiento de catálogos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Card XML */}
        <Link 
          href="/Actualizer_XML"
          className="group relative p-8 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]"
        >
          <div className="mb-6 inline-flex p-4 rounded-xl bg-blue-500/10 text-blue-400">
            <FileCode size={32} />
          </div>
          <h2 className="text-xl font-semibold mb-2">Actualizer XML</h2>
          <p className="text-slate-500 mb-6">Gestión avanzada y parseo de catálogos en formato XML y flujos complejos.</p>
          <div className="flex items-center text-blue-400 font-medium group-hover:translate-x-2 transition-transform">
            Acceder al módulo <ArrowRight className="ml-2" size={16} />
          </div>
        </Link>

        {/* Card Excel/CSV */}
        <Link 
          href="/Actualizer_Excel"
          className="group relative p-8 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]"
        >
          <div className="mb-6 inline-flex p-4 rounded-xl bg-emerald-500/10 text-emerald-400">
            <FileSpreadsheet size={32} />
          </div>
          <h2 className="text-xl font-semibold mb-2">Actualizer CSV/Excel</h2>
          <p className="text-slate-500 mb-6">Procesamiento, transformación y normalización de archivos de datos estructurados.</p>
          <div className="flex items-center text-emerald-400 font-medium group-hover:translate-x-2 transition-transform">
            Acceder al módulo <ArrowRight className="ml-2" size={16} />
          </div>
        </Link>
      </div>
    </main>
  );
}