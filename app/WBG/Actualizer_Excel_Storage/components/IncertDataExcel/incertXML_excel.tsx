'use client';

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
        .upsert(payload, { onConflict: 'company_name' })
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
              <h1 className="text-lg font-bold text-[#242424]">{moduleName} Catalog Upload</h1>
              <p className="text-[11px] text-[#616161]">Upload CET master files to the Servex ecosystem</p>
            </div>
          </div>
        </div>

        <div className="bg-[#464775]/10 border-b border-[#464775]/20 px-8 py-3">
          <p className="text-[11px] text-[#464775] leading-relaxed max-w-4xl">
            Aquí podrás almacenar y reemplazar todos los datos crudos y bases del{' '}
            <span className="font-bold">{moduleName}</span> corresponding to the {moduleName} catalogs of this entity. 
            El archivo se guardará en la columna <span className="font-bold">XM_CET_import</span>.
          </p>
        </div>

        <div className="p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="w-full">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2 text-[#464775] border-b border-gray-100 pb-3">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Upload Progress & Specifications</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${xmlContent || existingXml ? 'bg-[#464775]/10 text-[#464775]' : 'bg-gray-100 text-gray-400'}`}>1</div>
                    <span className="text-xs font-bold text-[#464775]">XML — CET Generated Catalog</span>
                  </div>
                  <p className="text-[11px] text-[#616161] leading-relaxed ml-9">
                    This is the catalog generated by CET. It represents the structured version of the catalog required for Excel extraction.
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer h-32 flex flex-col items-center justify-center
                      ${dragActive ? 'border-[#464775] bg-[#464775]/5' : showXmlExistingNotice ? 'border-[#464775]/40 bg-[#464775]/5 hover:bg-[#464775]/10' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                  >
                    {readingXml ? (
                      <RefreshCw className="mx-auto mb-1.5 text-[#464775] animate-spin" size={20} />
                    ) : checkingExisting ? (
                      <RefreshCw className="mx-auto mb-1.5 text-gray-400 animate-spin" size={20} />
                    ) : showXmlExistingNotice ? (
                      <DatabaseZap className="mx-auto mb-1.5 text-[#464775]" size={20} />
                    ) : (
                      <UploadCloud className={`mx-auto mb-1.5 ${dragActive ? 'text-[#464775]' : 'text-gray-400'}`} size={20} />
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
                  {loading ? 'Saving...' : 'Save Catalog Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
