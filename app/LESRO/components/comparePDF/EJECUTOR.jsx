import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Package, 
  Info,
  ChevronRight,
  DownloadCloud,
  X,
  Zap
} from 'lucide-react';

const AuditUploader = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  // Estado para el Popup Tutorial
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Lógica para mostrar solo una vez por pestaña/sesión
    const hasSeenTutorial = sessionStorage.getItem('servex_audit_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    sessionStorage.setItem('servex_audit_tutorial_seen', 'true');
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file to continue.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/audit-process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'SERVEX_AI Server Error');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SERVEX_AI_PACK_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[92vh] bg-[#fff] p-4 md:p-8 font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] relative">
      
      {/* Pop-up Tutorial COMPACTO (Único elemento editado) */}
      {showTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-[380px] rounded shadow-xl border border-[#d1d1d1] overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="bg-[#444791] px-4 py-2 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Optimization Module</span>
              </div>
              <button onClick={closeTutorial} className="hover:bg-white/20 p-0.5 rounded transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <h2 className="text-sm font-bold text-[#242424] mb-2">LESRO Catalog Audit</h2>
              <p className="text-[12px] text-[#424242] leading-snug mb-4">
                Section optimized for the <strong>analysis and comparison</strong> of <strong>LESRO</strong> catalog updates.
              </p>
              <div className="space-y-2">
                <div className="flex gap-3 p-2.5 bg-[#f3f2f1] rounded border-l-2 border-[#444791]">
                  <FileText className="text-[#444791] shrink-0" size={16} />
                  <p className="text-[11px] text-[#424242]">
                    Updated XML for <strong>CET Designer</strong> and <strong>Catalog Creator</strong> integration.
                  </p>
                </div>
                <div className="flex gap-3 p-2.5 bg-[#f3f2f1] rounded border-l-2 border-[#444791]">
                  <CheckCircle className="text-[#237b4b] shrink-0" size={16} />
                  <p className="text-[11px] text-[#424242]">
                    Automatic generation of changes detected during catalog comparison.
                  </p>
                </div>
              </div>
              <button 
                onClick={closeTutorial}
                className="w-full mt-5 bg-[#444791] text-white py-1.5 rounded text-xs font-semibold hover:bg-[#3b3e7a] transition-all active:scale-[0.98]"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTO DEL COMPONENTE EXACTAMENTE IGUAL */}
      <div className="max-w-5xl mx-auto bg-white rounded-md shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13),0_0.6px_1.8px_0_rgba(0,0,0,0.11)] overflow-hidden">
        
        {/* Teams Header Tab Style */}
        <div className="bg-white border-b border-[#e1e1e1] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#444791] rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              S
            </div>
            <div>
              <h1 className="text-[#242424] text-lg font-semibold leading-tight">SERVEX_AI Data Engine</h1>
              <div className="flex items-center gap-2 text-xs text-[#444791]">
                <span className="hover:underline cursor-pointer">Files</span>
                <ChevronRight size={12} />
                <span className="font-semibold text-[#444791]]">Lesro Audit</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => setShowTutorial(true)} 
              className="p-2 hover:bg-[#f0f0f0] rounded-full text-[#616161]"
            >
              <Info size={20}/>
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Main Upload Area */}
          <div className="relative border-2 border-dashed border-[#d1d1d1] rounded-lg bg-[#fafafa] p-12 flex flex-col items-center justify-center transition-colors hover:bg-[#f0f0f0] group">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-16 h-16 bg-white border border-[#e1e1e1] rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:text-[#5B5FC7] transition-colors">
              <DownloadCloud size={30} className="text-[#616161] group-hover:text-[#5B5FC7]" />
            </div>
            <h3 className="text-base font-semibold text-[#242424]">Drag your catalog here or click to browse</h3>
            <p className="text-sm text-[#616161] mt-1 text-center">Supports CSV files with LESRO pricing structure</p>
            
            {file && (
              <div className="mt-6 flex items-center gap-3 bg-[#e8ebfa] text-[#5B5FC7] px-4 py-2 rounded-md font-medium border border-[#c5cbef] animate-in fade-in zoom-in-95">
                <FileText size={18} />
                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col items-center border-t border-[#f0f0f0] pt-8">
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className={`min-w-[240px] py-2.5 px-6 rounded-sm font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                loading 
                  ? 'bg-[#f0f0f0] text-[#bdbdbd] cursor-not-allowed' 
                  : 'bg-[#444791] text-white hover:bg-[#444791] active:bg-[#444791]'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Package size={18} />}
              {loading ? "Processing..." : "Sync and Export"}
            </button>

            {success && (
              <div className="mt-4 flex items-center gap-2 text-[#237b4b] text-sm font-semibold animate-in fade-in slide-in-from-top-1">
                <CheckCircle size={16} /> Package generated successfully
              </div>
            )}

            {error && (
              <div className="mt-4 w-full max-w-md p-3 bg-[#fde7e9] border border-[#f8d7da] text-[#a4262c] flex items-center gap-3 rounded-sm text-sm font-medium animate-in shake-100">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Package details cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
            {[
              { title: "Audit JSON", color: "#5B5FC7" },
              { title: "Master XML", color: "#5B5FC7" },
              { title: "CSV Backup", color: "#5B5FC7" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#f5f5f5] rounded-sm border-l-4 border-[#444791] hover:bg-[#edebe9] transition-colors cursor-default">
                <FileText size={16} className="text-[#616161]" />
                <span className="text-xs font-semibold text-[#424242] uppercase tracking-wider">{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Teams Bottom Bar Area */}
        <div className="bg-[#f0f0f0] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-[#616161] font-medium tracking-tight">SERVEX_AI © 2026 | Enterprise Data Solutions</p>
            <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuditUploader;