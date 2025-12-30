'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import Link from 'next/link'; 
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
  Maximize2,
  FileSpreadsheet,
  RefreshCw, 
  FileType 
} from 'lucide-react';

export default function UploadClientXML() {
  const [companyName, setCompanyName] = useState('');
  const [xmlContent, setXmlContent] = useState('');
  const [csvContent, setCsvContent] = useState(''); 
  const [csvPdfContent, setCsvPdfContent] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });
  const [dragActive, setDragActive] = useState(false);
  const [dragActiveCSV, setDragActiveCSV] = useState(false); 
  const [dragActiveCsvPdf, setDragActiveCsvPdf] = useState(false); 

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null); 
  const csvPdfInputRef = useRef<HTMLInputElement | null>(null); 

  const readXMLFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setMessage({ text: 'Only XML files are allowed', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setXmlContent(content);
      setMessage({ text: 'XML file loaded successfully', type: 'success' });
    };
    reader.readAsText(file);
  };

  const readCSVFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage({ text: 'Only CSV files are allowed', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      setMessage({ text: 'CSV file loaded successfully', type: 'success' });
    };
    reader.readAsText(file);
  };

  const readCsvPdfFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage({ text: 'Only CSV files (PDF Transformed) are allowed', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvPdfContent(content);
      setMessage({ text: 'PDF CSV loaded successfully', type: 'success' });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readXMLFile(file);
  };

  const handleDropCSV = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setDragActiveCSV(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readCSVFile(file);
  };

  const handleDropCsvPdf = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setDragActiveCsvPdf(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readCsvPdfFile(file);
  };

  const handleSave = async () => {
    setMessage({ text: '', type: null });
    if (!companyName.trim() || !xmlContent.trim()) {
      setMessage({ text: 'Name and XML are required', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMessage({ text: 'User not authorized', type: 'error' }); return; }
      const { error } = await supabase.from('ClientsSERVEX').insert({
        company_name: companyName, 
        xml_raw: xmlContent, 
        csv_raw: csvContent, 
        csvpdf_raw: csvPdfContent, 
        user_id: user.id,
      });
      if (error) setMessage({ text: 'Error saving data', type: 'error' });
      else {
        setMessage({ text: 'Data saved successfully', type: 'success' });
        setCompanyName(''); setXmlContent(''); setCsvContent(''); setCsvPdfContent('');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FFF] flex font-sans text-[#242424]">
      
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
              <h1 className="text-lg font-bold text-[#242424]">CET Catalog Upload</h1>
              <p className="text-[11px] text-[#616161]">Structured data processing for the Servex ecosystem</p>
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
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Process Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${companyName ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>1</div>
                  <span className="text-xs font-medium">Entity Name</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${xmlContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>2</div>
                  <span className="text-xs font-medium">XML Validation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${csvContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>3</div>
                  <span className="text-xs font-medium">CSV Upload</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${csvPdfContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>4</div>
                  <span className="text-xs font-medium">PDF Synchronization</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-[#5B5FC7] mb-3">
                <Info size={16} />
                <span className="text-xs font-bold">Security Note</span>
              </div>
              <p className="text-[11px] text-[#616161] leading-relaxed">
                This channel is end-to-end encrypted (E2EE). Data is stored in isolated Supabase instances.
              </p>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            
            <div className="bg-[#F3F2F1] rounded-lg border border-[#E1DFDD] p-6 mb-4 shadow-sm flex flex-col items-center text-center">
              <h2 className="text-sm font-black text-[#242424] uppercase tracking-wider mb-1">SYNC YOUR CATALOG</h2>
              <p className="text-[11px] text-[#616161] max-w-md mb-4 leading-normal">
                If the data to be entered comes from a PDF, synchronize the data with the platform format to link them.
              </p>
              <Link href="/synchronizer" className="bg-white border border-[#5B5FC7] text-[#5B5FC7] px-6 py-2 rounded text-[11px] font-bold hover:bg-[#5B5FC7] hover:text-white transition-all flex items-center gap-2 shadow-sm">
                <RefreshCw size={14} />
                Go to Synchronizer
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-6 space-y-6">
                
                {/* Field: Company */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#242424]">Company / Client</label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5B5FC7]" size={14} />
                    <input
                      className="w-full text-sm rounded border border-gray-300 bg-white pl-9 pr-4 py-2 outline-none border-b-2 focus:border-b-[#5B5FC7] transition-all placeholder:text-gray-300"
                      placeholder="Company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Field: Drag & Drop XML */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer
                      ${dragActive ? 'border-[#5B5FC7] bg-[#F3F2F1]' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                  >
                    <UploadCloud className={`mx-auto mb-2 ${dragActive ? 'text-[#5B5FC7]' : 'text-gray-400'}`} size={20} />
                    <p className="text-[10px] font-bold text-[#242424]">Upload XML</p>
                    <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]; if (file) readXMLFile(file);
                    }} />
                  </div>

                  {/* Field: Drag & Drop CSV */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActiveCSV(true); }}
                    onDragLeave={() => setDragActiveCSV(false)}
                    onDrop={handleDropCSV}
                    onClick={() => csvInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer
                      ${dragActiveCSV ? 'border-[#5B5FC7] bg-[#F3F2F1]' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                  >
                    <FileSpreadsheet className={`mx-auto mb-2 ${dragActiveCSV ? 'text-[#5B5FC7]' : 'text-gray-400'}`} size={20} />
                    <p className="text-[10px] font-bold text-[#242424]">Upload CSV</p>
                    <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]; if (file) readCSVFile(file);
                    }} />
                  </div>

                  {/* Field: Drag & Drop CSV PDF */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActiveCsvPdf(true); }}
                    onDragLeave={() => setDragActiveCsvPdf(false)}
                    onDrop={handleDropCsvPdf}
                    onClick={() => csvPdfInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer
                      ${dragActiveCsvPdf ? 'border-[#5B5FC7] bg-[#F3F2F1]' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                  >
                    <FileType className={`mx-auto mb-2 ${dragActiveCsvPdf ? 'text-[#5B5FC7]' : 'text-gray-400'}`} size={20} />
                    <p className="text-[10px] font-bold text-[#242424]">Upload CSV (PDF)</p>
                    <input ref={csvPdfInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]; if (file) readCsvPdfFile(file);
                    }} />
                  </div>
                </div>

                {/* Field: Content Previews */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">XML Preview</label>
                    <textarea
                      className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none focus:border-[#5B5FC7]"
                      placeholder="XML Content..."
                      value={xmlContent}
                      onChange={(e) => setXmlContent(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">CSV Preview</label>
                    <textarea
                      className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none focus:border-[#5B5FC7]"
                      placeholder="CSV Content..."
                      value={csvContent}
                      onChange={(e) => setCsvContent(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">PDF CSV Preview</label>
                    <textarea
                      className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none focus:border-[#5B5FC7]"
                      placeholder="CSV from PDF Content..."
                      value={csvPdfContent}
                      onChange={(e) => setCsvPdfContent(e.target.value)}
                    />
                  </div>
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
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}