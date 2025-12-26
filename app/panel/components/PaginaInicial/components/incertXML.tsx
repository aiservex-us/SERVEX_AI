'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  UploadCloud, 
  FileCode, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  FileUp,
  Info,
  MoreHorizontal,
  Settings2,
  HelpCircle,
  Maximize2
} from 'lucide-react';

export default function UploadClientXML() {
  const [companyName, setCompanyName] = useState('');
  const [xmlContent, setXmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const readXMLFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setMessage({ text: 'Solo se permiten archivos XML', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setXmlContent(content);
      setMessage({ text: 'Archivo XML cargado correctamente', type: 'success' });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readXMLFile(file);
  };

  const handleSave = async () => {
    setMessage({ text: '', type: null });
    if (!companyName.trim() || !xmlContent.trim()) {
      setMessage({ text: 'Todos los campos son obligatorios', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMessage({ text: 'Usuario no autorizado', type: 'error' }); return; }
      const { error } = await supabase.from('ClientsSERVEX').insert({
        company_name: companyName, xml_raw: xmlContent, user_id: user.id,
      });
      if (error) setMessage({ text: 'Error al guardar el XML', type: 'error' });
      else {
        setMessage({ text: 'Catálogo guardado exitosamente', type: 'success' });
        setCompanyName(''); setXmlContent('');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FFF] flex font-sans text-[#242424]">
      
      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col">
        
        {/* --- TEAMS TOP BAR --- */}
        <div className="h-12 bg-[#464775] flex items-center justify-between px-4 shadow-sm z-10">
          <div className="flex items-center gap-4 text-white">
            <div className="bg-white p-1 rounded-sm">
              <FileUp size={14} className="text-[#464775]" />
            </div>
            <span className="text-xs font-semibold">Servex Ingest Engine</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <HelpCircle size={16} />
            <Settings2 size={16} />
          </div>
        </div>

        {/* --- PAGE HEADER --- */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8EAF6] rounded-md flex items-center justify-center">
              <FileCode className="text-[#5B5FC7]" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#242424]">Carga de Catálogo CET</h1>
              <p className="text-[11px] text-[#616161]">Procesamiento de datos estructurados para el ecosistema Servex</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-md text-gray-500"><Maximize2 size={16} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-md text-gray-500"><MoreHorizontal size={16} /></button>
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="p-8 grid grid-cols-12 gap-6 max-w-7xl">
          
          {/* Left Panel: Steps/Info */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Estado del Proceso</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${companyName ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>1</div>
                  <span className="text-xs font-medium">Nombre de Entidad</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${xmlContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>2</div>
                  <span className="text-xs font-medium">Validación de XML</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-100 text-gray-400`}>3</div>
                  <span className="text-xs font-medium">Persistencia Cloud</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-[#5B5FC7] mb-3">
                <Info size={16} />
                <span className="text-xs font-bold">Nota de Seguridad</span>
              </div>
              <p className="text-[11px] text-[#616161] leading-relaxed">
                Este canal está cifrado de extremo a extremo (E2EE). Los datos se almacenan en instancias aisladas de Supabase.
              </p>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-6 space-y-6">
                
                {/* Field: Company */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#242424]">Compañía / Cliente</label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5B5FC7]" size={14} />
                    <input
                      className="w-full text-sm rounded border border-gray-300 bg-white pl-9 pr-4 py-2 outline-none border-b-2 focus:border-b-[#5B5FC7] transition-all placeholder:text-gray-300"
                      placeholder="Nombre de la empresa"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Field: Drag & Drop */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-md p-10 text-center transition-all cursor-pointer
                    ${dragActive ? 'border-[#5B5FC7] bg-[#F3F2F1]' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                >
                  <UploadCloud className={`mx-auto mb-2 ${dragActive ? 'text-[#5B5FC7]' : 'text-gray-400'}`} size={28} />
                  <p className="text-xs font-bold text-[#242424]">Cargar archivo XML</p>
                  <p className="text-[10px] text-[#616161] mt-1 italic">Arrastra el archivo o haz clic para buscar</p>
                  <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0]; if (file) readXMLFile(file);
                  }} />
                </div>

                {/* Field: Content */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#242424]">Vista previa del contenido</label>
                  <textarea
                    className="w-full text-[11px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-4 py-3 h-48 resize-none outline-none focus:border-[#5B5FC7] transition-all"
                    placeholder="XML Content..."
                    value={xmlContent}
                    onChange={(e) => setXmlContent(e.target.value)}
                  />
                </div>

                {/* Message Alert */}
                {message.type && (
                  <div className={`p-3 rounded flex items-center gap-3 text-xs font-semibold border-l-4 
                    ${message.type === 'success' ? 'bg-green-50 border-l-green-600 text-green-800' : 'bg-red-50 border-l-red-600 text-red-800'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                  </div>
                )}
              </div>

              {/* Form Footer Actions */}
              <div className="bg-[#FAF9F8] px-6 py-4 flex justify-end border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-[#5B5FC7] text-white px-8 py-2 rounded text-xs font-bold hover:bg-[#4E52B1] transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}