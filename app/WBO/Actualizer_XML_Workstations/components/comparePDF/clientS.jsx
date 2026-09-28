import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { 
  Trash2, 
  RefreshCw, 
  Search, 
  FileText, 
  Calendar, 
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
  const [selectedIds, setSelectedIds] = useState([]); // Array de IDs seleccionados
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const colors = {
    purple: '#5b5fc7',
    danger: '#d13438',
    bg: 'transparent',
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
    const { data, error } = await supabase
      .from('ClientsSERVEX')
      .select('id, created_at, company_name, file_name, json_data')
      .order('created_at', { ascending: false });

    if (!error) setRecords(data || []);
    setLoading(false);
    setSelectedIds([]); // Limpiar selección al recargar
  };

  // Lógica de Selección
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

  // Borrado Masivo
  const handleBatchDelete = async () => {
    const confirmMessage = `¿Estás seguro de eliminar ${selectedIds.length} registros permanentemente?`;
    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('ClientsSERVEX')
        .delete()
        .in('id', selectedIds); // Filtro "IN" para borrar múltiples

      if (error) throw error;

      setRecords(records.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      alert('Registros deleteds con éxito');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;

  return (
    <div style={{ background: 'transparent', height: '80vh', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px 24px', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* HEADER DINÁMICO */}
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
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: colors.purple }}>Data Explorer</h1>
          {selectedIds.length > 0 ? (
            <span style={{ color: colors.danger, fontSize: 13, fontWeight: 600 }}>
              {selectedIds.length} seleccionados
            </span>
          ) : (
            <p style={{ fontSize: 12, color: colors.subtext, margin: 0 }}>Total: {records.length} filas</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBatchDelete}
              disabled={isDeleting}
              style={{ 
                background: colors.danger, 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6, 
                padding: '0 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 600
              }}
            >
              <Trash2 size={16} />
              {isDeleting ? 'Borrando...' : `Eliminar selección`}
            </button>
          )}
          
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: colors.subtext }} />
            <input 
              type="text" 
              placeholder="Filtrar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px 8px 36px', borderRadius: 6, border: `1px solid ${colors.border}`, outline: 'none' }}
            />
          </div>

          <button onClick={fetchData} style={{ background: 'none', border: `1px solid ${colors.border}`, borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* TABLA CON SELECCIÓN */}
      <div style={{ background: colors.card, borderRadius: 8, border: `1px solid ${colors.border}`, maxHeight: '55vh', overflowY: 'auto', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fcfcfc', borderBottom: `2px solid ${colors.border}` }}>
              <th style={{ ...styles.th, width: 40 }}>
                <button onClick={toggleSelectAll} style={styles.checkBtn}>
                  {selectedIds.length === filteredRecords.length && filteredRecords.length > 0 
                    ? <CheckSquare size={18} color={colors.purple} /> 
                    : <Square size={18} color={colors.subtext} />
                  }
                </button>
              </th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>File Name</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>ID Supabase</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center' }}>Loading data...</td></tr>
            ) : (filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)).map((row) => {
              const isSelected = selectedIds.includes(row.id);
              return (
                <tr key={row.id} style={{ 
                  ...styles.tr, 
                  background: isSelected ? colors.selection : 'transparent' 
                }}>
                  <td style={styles.td}>
                    <button onClick={() => toggleSelectOne(row.id)} style={styles.checkBtn}>
                      {isSelected 
                        ? <CheckSquare size={18} color={colors.purple} /> 
                        : <Square size={18} color={colors.subtext} />
                      }
                    </button>
                  </td>
                  <td style={styles.td}>{new Date(row.created_at).toLocaleDateString()}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{row.company_name || 'Sin empresa'}</td>
                  <td style={styles.td}>{row.file_name}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: row.json_data ? '#dff6dd' : '#deecf9', color: row.json_data ? '#107c10' : '#0078d4' }}>
                      {row.json_data ? 'JSON' : 'XML'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontSize: 11, color: colors.subtext }}>{row.id}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      
      {/* PAGINACIÓN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 13, color: colors.subtext }}>
        <span>Página {currentPage} de {totalPages}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid ' + colors.border, background: colors.card, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid ' + colors.border, background: colors.card, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.5 : 1 }}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* TIP INFORMATIVO */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: colors.subtext, fontSize: 12 }}>
        <Info size={14} />
        <span>Click the checkboxes on the left to select multiple items at once.</span>
      </div>
    </div>
  );
};

const styles = {
  th: { padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#616161' },
  td: { padding: '12px 16px', fontSize: 14, borderBottom: '1px solid #e1e1e1' },
  tr: { transition: 'background 0.1s ease' },
  checkBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 },
  badge: { padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }
};

export default ClientsBatchManager;