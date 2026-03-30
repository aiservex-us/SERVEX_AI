import React, { useState, useCallback } from 'react';
import { FiUploadCloud, FiZap, FiCpu, FiArrowRight, FiCheck } from 'react-icons/fi';
import { supabase } from '../../../lib/supabaseClient';

const Step = ({ icon, title, active, isLast }) => (
    <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${active ? 'bg-[#464775] border-[#464775] text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
            {icon}
        </div>
        <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'text-[#464775]' : 'text-gray-300'}`}>{title}</span>
        {!isLast && <div className="w-4 h-[1px] bg-gray-200" />}
    </div>
);

const AuditCSV = ({ onDiscrepancyFound, showAlert, onReset }) => {
    const [data, setData] = useState([]);
    const [masterDataRows, setMasterDataRows] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [matchStatus, setMatchStatus] = useState(null);

    const processCSV = (text) => {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length === 0) return;
        const delimiter = lines[0].includes(';') ? ';' : ',';
        const matrix = lines.map(line => line.split(delimiter).map(cell => cell.trim()));
        setData(matrix);
        setMatchStatus(null);
        setMasterDataRows([]);
        showAlert("Archivo CSV cargado", "success");
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file?.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (ev) => processCSV(ev.target.result);
            reader.readAsText(file);
        }
    }, []);

    const handleAnalyze = async () => {
        if (data.length === 0) return;
        setIsAnalyzing(true);
        try {
            // ✅ CORRECCIÓN: Filtro por LESRO para asegurar integridad de la auditoría
            const { data: dbRows, error } = await supabase
                .from('ClientsSERVEX')
                .select('csv_raw')
                .eq('company_name', 'LESRO') // <--- FILTRO AÑADIDO
                .not('csv_raw', 'is', null)
                .order('created_at', { ascending: false }) // Asegurar que es el último maestro
                .limit(1);

            if (error || !dbRows[0]) throw new Error("No se encontró el archivo Maestro de LESRO");

            const dbLines = dbRows[0].csv_raw.split(/\r?\n/).filter(l => l.trim() !== "");
            const dbDelimiter = dbLines[0].includes(';') ? ';' : ',';
            const dbMatrix = dbLines.map(line => line.split(dbDelimiter).map(c => c.trim()));

            const headerIndex = data.findIndex(row =>
                row.join('').toUpperCase().includes('ID') ||
                row.join('').toUpperCase().includes('PRODUCT') ||
                row.join('').toUpperCase().includes('SKU')
            );
            const header = data[headerIndex] || data[0];

            const skuColIndex = header.findIndex(h =>
                h.toUpperCase() === 'SKU' || h.toUpperCase() === 'ID' || h.toUpperCase() === 'PRODUCT'
            );

            const auditResults = data.slice(headerIndex + 1).map((row, idx) => {
                const mRow = dbMatrix[headerIndex + 1 + idx] || [];
                const isDifferent = JSON.stringify(row) !== JSON.stringify(mRow);
                return { row, mRow, isDifferent };
            });

            const discrepancies = auditResults.filter(item => item.isDifferent);

            if (discrepancies.length === 0) {
                setMatchStatus('match');
                showAlert("Integridad Total Confirmada con LESRO", "success");
            } else {
                setMatchStatus('mismatch');
                setMasterDataRows(discrepancies.map(d => d.mRow));
                setData([header, ...discrepancies.map(d => d.row)]);

                if (skuColIndex !== -1) {
                    discrepancies.forEach(d => {
                        const skuToSearch = d.row[skuColIndex];
                        if (skuToSearch) onDiscrepancyFound(skuToSearch);
                    });
                    showAlert(`LESRO: Detectadas ${discrepancies.length} discrepancias`, "warning");
                }
            }
        } catch (err) { 
            showAlert(err.message || "Error en auditoría", "error"); 
        } finally { 
            setIsAnalyzing(false); 
        }
    };

    const resetLocal = () => {
        setData([]);
        setMatchStatus(null);
        setMasterDataRows([]);
        onReset();
    };

    return (
        <div className="flex flex-col border-r border-[#EDEBE9] overflow-hidden h-full">
            <div className="p-4 border-b bg-[#FAF9F8] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-[#464775] p-1.5 rounded text-white"><FiCpu size={14} /></div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-[#464775]">Auditoría LESRO</h2>
                </div>
                <div className="flex gap-4">
                    <Step icon={<FiCheck size={10} />} title="Data" active={data.length > 0} />
                    <Step icon={<FiZap size={10} />} title="Delta" active={matchStatus} isLast />
                </div>
            </div>

            <div className="flex-grow p-4 overflow-hidden flex flex-col min-h-0">
                {data.length === 0 ? (
                    <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
                        className={`flex-grow border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${isDragging ? "bg-[#F3F2F1] border-[#464775]" : "bg-[#FAF9F8] border-[#EDEBE9]"}`}>
                        <FiUploadCloud size={40} className="text-[#464775] mb-4 opacity-20" />
                        <p className="text-xs font-bold text-gray-400 uppercase">Arrastre CSV de LESRO para auditar</p>
                    </div>
                ) : (
                    <div className="flex-grow overflow-auto border rounded-lg bg-white w-full">
                        <table className="min-w-full text-[10px]">
                            <thead className="bg-[#FAF9F8] sticky top-0 z-10 border-b">
                                <tr>
                                    {data[0].map((h, i) => (
                                        <th key={i} className="p-3 text-left font-black text-[#464775] uppercase whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(1).map((row, ri) => (
                                    <tr key={ri} className="border-b hover:bg-gray-50 transition-colors">
                                        {row.map((cell, ci) => {
                                            const mCell = masterDataRows[ri] ? masterDataRows[ri][ci] : null;
                                            const isDiff = mCell !== null && cell !== mCell;
                                            return (
                                                <td key={ci} className={`p-3 border-r border-[#F3F2F1] whitespace-nowrap ${isDiff ? 'bg-orange-50/50' : ''}`}>
                                                    {isDiff ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-red-400 line-through text-[8px] opacity-70">{mCell || '(vacío)'}</span>
                                                            <span className="text-[#237B4B] font-bold flex items-center gap-1"><FiArrowRight size={8} />{cell}</span>
                                                        </div>
                                                    ) : <span className="text-gray-600">{cell}</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-3 shrink-0">
                <button onClick={resetLocal} className="px-4 py-2 text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase">Reset</button>
                <button onClick={handleAnalyze} disabled={data.length === 0 || isAnalyzing}
                    className={`px-6 py-2 rounded-md text-[10px] font-black flex items-center gap-2 transition-all shadow-lg ${data.length > 0 ? 'bg-[#464775] text-white hover:brightness-110' : 'bg-gray-100 text-gray-300'}`}>
                    {isAnalyzing ? "COMPARANDO..." : "INICIAR AUDITORÍA"} <FiZap size={12} />
                </button>
            </div>
        </div>
    );
};

export default AuditCSV;