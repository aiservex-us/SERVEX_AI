"use client"; // 1. CRÍTICO: Indica que es un componente de cliente

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { 
  Trash2, 
  RefreshCw, 
  Search, 
  FileText, 
  Calendar as CalendarIcon, // 2. Renombrado para evitar conflictos
  Building2, 
  AlertTriangle,
  CheckSquare,
  Square,
  Info
} from 'lucide-react';

const ClientsBatchManager = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const colors = {
    purple: '#5b5fc7',
    danger: '#d13438',
    bg: '#f5f5f5',
    card: '#ffffff',
    border: '#e1e1e1',
    text: '#242424',
    subtext: '#616161',
    selection: '#f3f2f1'
  };

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
      console.error("Error cargando datos:", err.message);
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  };

  // Lógica de Selección
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
    if (!window.confirm(`¿Eliminar ${selectedIds.length} registros?`)) return;
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

  return (
    // 3. CAMBIO: minHeight 100vh eliminado para que se ajuste al Dashboard
    <div style={{ background: colors.bg, width: '100%', padding: 20, fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16,
        background: colors.card,
        padding: '16px 24px',
        borderRadius: 8,
        border: `1px solid ${colors.border}`
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: colors.purple }}>Gestión de Lotes</h1>
          <p style={{ fontSize: 12, color: colors.subtext, margin: 0 }}>
            {selectedIds.length > 0 ? `${selectedIds.length} seleccionados` : `Total: ${records.length} registros`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {selectedIds.length > 0 && (
            <button onClick={handleBatchDelete} disabled={isDeleting} style={{ background: colors.danger, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>
              <Trash2 size={16} />
            </button>
          )}
          
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: colors.subtext }} />
            <input 
              type="text" 
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px 8px 36px', borderRadius: 6, border: `1px solid ${colors.border}` }}
            />
          </div>

          <button onClick={fetchData} style={{ background: 'none', border: `1px solid ${colors.border}`, borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div style={{ background: colors.card, borderRadius: 8, border: `1px solid ${colors.border}`, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fcfcfc', borderBottom: `2px solid ${colors.border}` }}>
              <th style={{ padding: 12, width: 40 }}>
                <button onClick={toggleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  {selectedIds.length === filteredRecords.length && filteredRecords.length > 0 
                    ? <CheckSquare size={18} color={colors.purple} /> 
                    : <Square size={18} color={colors.subtext} />
                  }
                </button>
              </th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Empresa</th>
              <th style={styles.th}>Archivo</th>
              <th style={styles.th}>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: 40, textAlign: 'center' }}>Cargando base de datos...</td></tr>
            ) : filteredRecords.map((row) => (
              <tr key={row.id} style={{ borderBottom: `1px solid ${colors.border}`, background: selectedIds.includes(row.id) ? colors.selection : 'transparent' }}>
                <td style={{ padding: 12 }}>
                  <button onClick={() => toggleSelectOne(row.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    {selectedIds.includes(row.id) ? <CheckSquare size={18} color={colors.purple} /> : <Square size={18} color={colors.subtext} />}
                  </button>
                </td>
                <td style={styles.td}>{new Date(row.created_at).toLocaleDateString()}</td>
                <td style={{ ...styles.td, fontWeight: 600 }}>{row.company_name || 'N/A'}</td>
                <td style={styles.td}>{row.file_name || '---'}</td>
                <td style={styles.td}>
                   <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: row.csv_raw ? '#dff6dd' : '#deecf9' }}>
                    {row.csv_raw ? 'CSV' : 'PDF'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  th: { padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#616161' },
  td: { padding: '12px 16px', fontSize: 13, color: '#242424' }
};

export default ClientsBatchManager;