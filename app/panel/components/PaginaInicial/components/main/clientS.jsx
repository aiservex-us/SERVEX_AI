"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../../../lib/supabaseClient';
import { 
  Trash2, 
  RefreshCw, 
  Search, 
  FileText, 
  Calendar as CalendarIcon, 
  Building2, 
  AlertTriangle,
  CheckSquare,
  Square,
  Info,
  Database,
  Layers
} from 'lucide-react';

const ClientsBatchManager = () => {
  // --- LOGIC (UNCHANGED) ---
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ClientsSERVEX')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error("Data loading error:", err.message);
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  };

  const filteredRecords = Array.isArray(records) ? records.filter(r => 
    r.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} records?`)) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('ClientsSERVEX')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;
      setRecords(records.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- UI CONFIGURATION ---
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full min-h-screen p-6 bg-[#FFF] font-sans text-[#242424]"
    >
      
      {/* MAIN BANNER - Color actualizado a #464775 */}
      <div className="relative overflow-hidden bg-[#464775] rounded-lg p-8 mb-6 text-white shadow-sm">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2 tracking-tight">SERVEX Master Database</h1>
          <p className="text-sm opacity-90 max-w-2xl leading-relaxed font-normal">
            Welcome to the master control center. Here you can analyze, audit, and manage the comprehensive 
            database storing all SERVEX client company information. Use the filtering and batch selection 
            tools to optimize record maintenance.
          </p>
        </div>
        <Database className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-10 rotate-12" />
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Total Clients", val: records.length, icon: Building2, color: "#464775" },
          { title: "PDF Records", val: records.filter(r => !r.csv_raw).length, icon: FileText, color: "#d13438" },
          { title: "CSV Records", val: records.filter(r => r.csv_raw).length, icon: Layers, color: "#27ae60" }
        ].map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-md border border-[#EDEBE9] flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-full bg-[#F3F5F8]" style={{ color: card.color }}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-[#616161] text-xs font-medium uppercase tracking-wider">{card.title}</p>
              <p className="text-xl font-bold tracking-tight">{loading ? "..." : card.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MANAGEMENT AREA */}
      <div className="bg-white rounded-md border border-[#EDEBE9] overflow-hidden shadow-sm">
        
        {/* TOOLBAR */}
        <div className="p-4 border-b border-[#EDEBE9] flex flex-wrap justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-[#464775] w-1 h-6 rounded-full"></div>
            <div>
              <h2 className="text-sm font-semibold text-[#242424] tracking-tight">Batch Management</h2>
              <p className="text-[11px] text-[#616161] font-medium">
                {selectedIds.length > 0 ? `${selectedIds.length} items selected` : "Full record list"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" />
              <input 
                type="text" 
                placeholder="Filter by company or file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm bg-[#F3F5F8] border border-transparent focus:border-[#464775] focus:bg-white rounded-[4px] outline-none w-64 transition-all font-normal"
              />
            </div>

            {/* Actions */}
            <div className="flex border-l border-[#EDEBE9] ml-2 pl-2 gap-2">
              {selectedIds.length > 0 && (
                <button 
                  onClick={handleBatchDelete} 
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#d13438] hover:bg-[#a4262c] text-white rounded-[4px] text-xs font-semibold transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
              
              <button 
                onClick={fetchData}
                title="Refresh data"
                className="p-1.5 text-[#616161] hover:bg-[#F3F5F8] rounded-[4px] border border-[#EDEBE9] transition-colors"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-[#464775]' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* FLUENT DESIGN TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F8] border-b border-[#EDEBE9]">
                <th className="p-3 w-10">
                  <button onClick={toggleSelectAll} className="flex items-center justify-center hover:bg-[#EDEBE9] p-1 rounded transition-colors">
                    {selectedIds.length === filteredRecords.length && filteredRecords.length > 0 
                      ? <CheckSquare size={16} className="text-[#464775]" /> 
                      : <Square size={16} className="text-[#616161]" />
                    }
                  </button>
                </th>
                <th className="p-3 text-xs font-bold text-[#616161] uppercase tracking-widest">Date</th>
                <th className="p-3 text-xs font-bold text-[#616161] uppercase tracking-widest">Company</th>
                <th className="p-3 text-xs font-bold text-[#616161] uppercase tracking-widest">File Name</th>
                <th className="p-3 text-xs font-bold text-[#616161] uppercase tracking-widest">Data Type</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-[#616161] font-semibold">Syncing with database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-xs text-[#616161] font-medium">
                    No records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row) => (
                  <tr 
                    key={row.id} 
                    className={`border-b border-[#F3F5F8] transition-colors ${selectedIds.includes(row.id) ? 'bg-[#F3F2F1]' : 'hover:bg-[#FAF9F8]'}`}
                  >
                    <td className="p-3">
                      <button onClick={() => toggleSelectOne(row.id)} className="flex items-center justify-center p-1">
                        {selectedIds.includes(row.id) 
                          ? <CheckSquare size={16} className="text-[#464775]" /> 
                          : <Square size={16} className="text-[#616161] opacity-40 hover:opacity-100" />
                        }
                      </button>
                    </td>
                    <td className="p-3 text-xs text-[#616161] font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={12} />
                        {new Date(row.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3 text-sm font-semibold text-[#242424] tracking-tight">
                      {row.company_name || 'N/A'}
                    </td>
                    <td className="p-3 text-xs text-[#616161] font-normal">
                      <div className="flex items-center gap-2">
                        <FileText size={12} />
                        {row.file_name || 'unknown_file.pdf'}
                      </div>
                    </td>
                    <td className="p-3">
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                         row.csv_raw 
                          ? 'bg-[#DFF6DD] text-[#107C10]' 
                          : 'bg-[#DEECF9] text-[#0078D4]'
                       }`}>
                        {row.csv_raw ? 'CSV Raw' : 'PDF Parsed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* INFO FOOTER */}
        <div className="bg-[#FAF9F8] p-3 border-t border-[#EDEBE9] flex justify-between items-center">
          <div className="flex items-center gap-2 text-[11px] text-[#616161] font-medium">
            <Info size={14} className="text-[#464775]" />
            <span>Select rows to perform batch actions on the data infrastructure.</span>
          </div>
          <span className="text-[11px] font-bold text-[#616161] tracking-tighter">
            v2.4.0 SERVE-DB
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientsBatchManager;