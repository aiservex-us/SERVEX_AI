import os
import re

mod_suffixes = {
    "LESRO": "LESRO",
    "WBA": "Accessories",
    "WBD": "Desks",
    "WBG": "Graphics",
    "WBO": "Workstations",
    "WBS": "Seatings",
    "WBT": "Tables"
}

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

incert_xml_content = """'use client';

import { useState, useRef, useTransition, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import {
  FileCode,
  Building2,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  RefreshCw,
  Info,
  DatabaseZap,
  Loader2
} from 'lucide-react';

export default function UploadClientXML({ moduleName }: { moduleName: string }) {
  const [xmlContent, setXmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [readingXml, setReadingXml] = useState(false);

  // --- Estado de verificación de columnas existentes en BD ---
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingXml, setExistingXml] = useState(false);

  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [, startTransition] = useTransition();

  const checkExistingFiles = useCallback(async () => {
    setCheckingExisting(true);
    try {
      const { data, error } = await supabase
        .from(`ClientsSERVEX_${moduleName}`)
        .select('XM_CET_import')
        .eq('company_name', moduleName)
        .maybeSingle();

      if (error) {
        console.error('Error checking existing files:', error);
        setExistingXml(false);
      } else if (data) {
        const hasXml = !!data.XM_CET_import && String(data.XM_CET_import).trim().length > 0;
        setExistingXml(hasXml);
      } else {
        setExistingXml(false);
      }
    } catch (err) {
      console.error('Unexpected error checking existing files:', err);
      setExistingXml(false);
    } finally {
      setCheckingExisting(false);
    }
  }, [moduleName]);

  useEffect(() => {
    checkExistingFiles();
  }, [checkExistingFiles]);

  const readXMLFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setMessage({ text: 'Only XML files are allowed', type: 'error' });
      return;
    }
    setReadingXml(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      startTransition(() => {
        setXmlContent(e.target?.result as string);
        setMessage({ text: 'XML file loaded successfully', type: 'success' });
        setReadingXml(false);
      });
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
    
    if (!xmlContent.trim()) {
      setMessage({ text: 'Please upload an XML file to save', type: 'error' });
      return;
    }
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ text: 'User not authorized', type: 'error' });
        return;
      }

      const payload: any = {
        company_name: moduleName,
        user_id: user.id,
        XM_CET_import: xmlContent
      };

      const { error } = await supabase
        .from(`ClientsSERVEX_${moduleName}`)
        .update(payload)
        .eq('user_id', user.id)
        .select('');

      if (error) {
        console.error('Supabase Full Error:', error);
        setMessage({ text: `DB Error: ${error.message}`, type: 'error' });
      } else {
        setMessage({ text: 'CET XML successfully stored', type: 'success' });
        setXmlContent('');
        await checkExistingFiles();
      }
    } catch (err: unknown) {
      console.error(err);
      setMessage({ text: 'Unexpected client-side error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showXmlExistingNotice = existingXml && !xmlContent && !readingXml;

  return (
    <div className="min-h-[60vh] bg-[#FFF] flex font-sans text-[#242424] relative">
      <div className="flex-1 flex flex-col">
        {loading && (
          <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-6">
            <div className="bg-white border border-gray-200 shadow-2xl rounded-lg sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 sm:space-y-4 transform animate-in zoom-in-95 duration-200">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#5b5fc7]/10 rounded-full animate-ping"></div>
                  <div className="relative bg-white border border-gray-100 p-2 sm:p-3 rounded-full shadow-sm">
                    <DatabaseZap className="text-[#5b5fc7] animate-pulse" size={20} />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-tight">System Base Storage</h3>
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Module ({moduleName})</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 text-left">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={14} />
                <p className="text-[9px] sm:text-[10px] text-amber-800 leading-tight">
                  <strong>IMPORTANT:</strong> Uploading CET XML to Cloud Database. <strong>Do not close</strong> this window.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#5b5fc7]">
                <Loader2 size={12} className="animate-spin" />
                <span className="uppercase tracking-widest">Saving to Cloud Database...</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#464775]/10 rounded-md flex items-center justify-center">
              <FileCode className="text-[#464775]" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#242424]">{moduleName} CET XML Upload</h1>
              <p className="text-[11px] text-[#616161]">Upload CET XML file for processing</p>
            </div>
          </div>
        </div>

        <div className="bg-[#464775]/10 border-b border-[#464775]/20 px-8 py-3">
          <p className="text-[11px] text-[#464775] leading-relaxed max-w-4xl">
            Aquí podrás subir el XML generado por CET para el módulo <span className="font-bold">{moduleName}</span>. 
            Este archivo se almacenará en la columna <span className="font-bold">XM_CET_import</span>.
          </p>
        </div>

        <div className="p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="w-full">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2 text-[#464775] border-b border-gray-100 pb-3">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Upload Specifications</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${xmlContent || existingXml ? 'bg-[#464775]/10 text-[#464775]' : 'bg-gray-100 text-gray-400'}`}>1</div>
                    <span className="text-xs font-bold text-[#464775]">XML — CET Generated Catalog</span>
                  </div>
                  <p className="text-[11px] text-[#616161] leading-relaxed ml-9">
                    Sube el archivo XML generado directamente de CET para este módulo. No subas CSVs aquí.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-6 space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#242424]">Target Entity</label>
                  <div className="relative group w-full max-w-xs">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[#464775]" size={14} />
                    <input
                      className="w-full text-sm rounded border border-gray-100 bg-gray-50 pl-9 pr-4 py-2 outline-none font-bold text-[#464775] cursor-default"
                      value={moduleName}
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer
                      ${dragActive ? 'border-[#464775] bg-[#464775]/5' : showXmlExistingNotice ? 'border-[#464775]/40 bg-[#464775]/5 hover:bg-[#464775]/10' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                  >
                    {readingXml ? (
                      <RefreshCw className="mx-auto mb-2 text-[#464775] animate-spin" size={20} />
                    ) : checkingExisting ? (
                      <RefreshCw className="mx-auto mb-2 text-gray-400 animate-spin" size={20} />
                    ) : showXmlExistingNotice ? (
                      <DatabaseZap className="mx-auto mb-2 text-[#464775]" size={20} />
                    ) : (
                      <UploadCloud className={`mx-auto mb-2 ${dragActive ? 'text-[#464775]' : 'text-gray-400'}`} size={20} />
                    )}
                    <p className={`text-[10px] font-bold ${showXmlExistingNotice ? 'text-[#464775]' : 'text-[#242424]'}`}>
                      {readingXml
                        ? 'Reading...'
                        : checkingExisting
                          ? 'Checking...'
                          : showXmlExistingNotice
                            ? 'File already exists in DB'
                            : 'Upload XML'}
                    </p>
                    <p className="text-[8px] text-[#9CA3AF] mt-0.5">CET XML File</p>
                    {showXmlExistingNotice && (
                      <p className="text-[9px] text-[#464775]/80 mt-1 font-medium">Click or drop to replace</p>
                    )}
                    <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readXMLFile(file); }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">XML Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={xmlContent} readOnly />
                  </div>
                </div>

                {message.type && (
                  <div className={`p-3 rounded flex items-center gap-3 text-xs font-semibold border-l-4
                    ${message.type === 'success' ? 'bg-green-50 border-l-green-600 text-green-800' : 'bg-red-50 border-l-red-600 text-red-800'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                  </div>
                )}
              </div>

              <div className="bg-[#FAF9F8] px-6 py-4 flex justify-end border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-[#464775] text-white px-8 py-2 rounded text-xs font-bold hover:bg-[#36375a] transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save XML Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

incert_data_content = """'use client';

import React, { useState } from 'react';
import InsertXML from './incertXML_excel';

const IncertData = ({ moduleName }) => {
  const [isModalDismissed, setIsModalDismissed] = useState(false);
  const showOverlay = !isModalDismissed;

  return (
    <div className="p-8 max-w-8xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col gap-8">
        
        {/* Sección de Inserción XML (CET) */}
        <section className="relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
          
          {/* Overlay del Logo e Information (Card) */}
          <div
            className={`hidden min-[400px]:block absolute inset-0 z-50 pointer-events-none transition-all duration-500 ease-out ${showOverlay ? 'opacity-100 backdrop-blur-[2px]' : 'opacity-0'
              }`}
          >
            <div className="flex items-center justify-center h-full w-full bg-white/95 p-6">
              <div className={`
                bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] 
                rounded-3xl w-full max-w-4xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16
                transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden relative
                ${showOverlay ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto' : 'translate-y-12 scale-95 opacity-0 pointer-events-none'}
              `}>

                {/* Close Button */}
                <button
                  onClick={() => setIsModalDismissed(true)}
                  className="absolute top-6 right-6 p-2 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors z-20"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Elementos decorativos de fondo de la card */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#464775]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

                {/* Izquierda: Logo y Textos Originales */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                  <img
                    src="/alysa_lg.png"
                    alt="Logo"
                    className="w-72 lg:w-80 h-auto object-contain drop-shadow-2xl mb-8 transition-transform duration-700 hover:scale-105"
                  />
                  <div className="text-center">
                    <h3 className="text-[#464775] text-lg lg:text-xl font-extralight tracking-[0.25em]">
                      CET XML Import Tool
                    </h3>
                    <p className="text-slate-400 text-[9px] mt-3 font-light tracking-widest uppercase">
                      Development of new technologies · Servex transition
                    </p>
                  </div>
                </div>

                {/* Divisor vertical (solo desktop) */}
                <div className="hidden lg:block w-px h-72 bg-gradient-to-b from-transparent via-slate-200 to-transparent relative z-10" />

                {/* Derecha: Information de Impacto y GLYNNE S.A.S */}
                <div className="flex-1 flex flex-col justify-center relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#464775]/5 border border-[#464775]/10 w-fit mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#464775] animate-pulse" />
                    <span className="text-[9px] font-bold tracking-widest text-[#464775] uppercase">Powered by SVX</span>
                  </div>

                  <h2 className="text-2xl lg:text-3xl font-light text-slate-800 tracking-tight mb-5 leading-tight">
                    CET Integration.<br />
                    <strong className="font-semibold text-[#464775]">Direct XML upload.</strong>
                  </h2>

                  <p className="text-sm text-slate-500 leading-relaxed font-light mb-8">
                    Upload your <strong className="font-medium text-slate-700">CET XML files</strong> directly into the 
                    Servex ecosystem. The data is securely stored in the XML CET import column for processing.
                  </p>

                  <div className="flex flex-col gap-1 mt-auto">
                    <p className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold">Proprietary Technology</p>
                    <p className="text-[10px] text-slate-500 font-light tracking-wide">Next-gen intelligence ecosystem.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className={`transition-all duration-500 ease-out ${showOverlay ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
            <InsertXML moduleName={moduleName} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default IncertData;
"""

for mod, suffix in mod_suffixes.items():
    excel_folder = f"Actualizer_Excel_{suffix}"
    incert_dir = os.path.join(base_dir, mod, excel_folder, "components", "IncertDataExcel")
    
    os.makedirs(incert_dir, exist_ok=True)
    
    # Write components
    with open(os.path.join(incert_dir, "incertXML_excel.tsx"), "w") as f:
        f.write(incert_xml_content)
    with open(os.path.join(incert_dir, "Incert_data_excel.jsx"), "w") as f:
        f.write(incert_data_content)
        
    # Update menuLateral.jsx
    menu_path = os.path.join(base_dir, mod, excel_folder, "components", "menuLateral.jsx")
    if os.path.exists(menu_path):
        with open(menu_path, "r") as f:
            content = f.read()
        
        # Add UploadCloud if not present
        if "UploadCloud" not in content:
            content = content.replace("LayoutDashboard,", "LayoutDashboard,\n  UploadCloud,")
            
        pattern = r"const menuItems = \[\s*\{ id: 'reporting', label: '.*?' Home', icon: LayoutDashboard, sub: 'Dashboard' \},\s*\{ id: 'converter', label: 'XML to CSV', icon: FileSpreadsheet, sub: 'Data Converter' \},\s*\];"
        
        new_items = f"""const menuItems = [
  {{ id: 'reporting', label: '{mod} Home', icon: LayoutDashboard, sub: 'Dashboard' }},
  {{ id: 'converter', label: 'XML to CSV', icon: FileSpreadsheet, sub: 'Data Converter' }},
  {{ id: 'incert_delete', label: 'Import CET XML', icon: UploadCloud, sub: 'Ingestion' }},
];"""
        content = re.sub(pattern, new_items, content, flags=re.DOTALL)
        
        with open(menu_path, "w") as f:
            f.write(content)

    # Update page.jsx
    page_path = os.path.join(base_dir, mod, excel_folder, "page.jsx")
    if os.path.exists(page_path):
        with open(page_path, "r") as f:
            page_content = f.read()
            
        if "IncertData" not in page_content:
            page_content = page_content.replace(
                "import AIReporting from './components/presentation_excel.jsx';",
                "import AIReporting from './components/presentation_excel.jsx';\nimport IncertData from './components/IncertDataExcel/Incert_data_excel.jsx';"
            )
            
        # Update renderContent
        old_render = """switch (active) {
      case 'reporting': return <AIReporting />;
      case 'converter': return <XmlToCsvConverter />;
      default:"""
        new_render = f"""switch (active) {{
      case 'reporting': return <AIReporting />;
      case 'converter': return <XmlToCsvConverter />;
      case 'incert_delete': return <IncertData moduleName="{mod}" />;
      default:"""
        page_content = page_content.replace(old_render, new_render)
        
        # Ensure showAiMenu logic excludes incert_delete as well
        page_content = page_content.replace(
            "const showAiMenu = active !== 'reporting';", 
            "const showAiMenu = active !== 'reporting' && active !== 'incert_delete';"
        )
        
        with open(page_path, "w") as f:
            f.write(page_content)
            
    print(f"Added CET XML Ingestion to {mod}")

print("Done propagating IncertDataExcel.")
