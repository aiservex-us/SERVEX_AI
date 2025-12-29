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
  X,
  Check
} from 'lucide-react';

const ClientsTableManager = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null); // Para el modal de confirmación

  const colors = {
    purple: '#5b5fc7',
    danger: '#d13438',
    bg: '#f5f5f5',
    card: '#ffffff',
    border: '#e1e1e1',
    text: '#242424',
    subtext: '#616161'
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
    } catch (error) {
      alert('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('ClientsSERVEX')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Actualizar estado local eliminando el registro
      setRecords(records.filter(r => r.id !== id));
      setDeleteId(null);
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  // Filtrado simple por nombre de empresa o archivo
  const filteredRecords = records.filter(r => 
    r.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', padding: 24, fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* HEADER ESTRATEGICO */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20,
        background: colors.card,
        padding: '16px 24px',
        borderRadius: 8,
        border: `1px solid ${colors.border}`
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: colors.purple }}>Gestión de ClientsSERVEX</h1>
          <p style={{ fontSize: 12, color: colors.subtext, margin: '4px 0 0 0' }}>{records.length} registros encontrados</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: colors.subtext }} />
            <input 
              type="text" 
              placeholder="Buscar empresa o archivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px',
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
                fontSize: 14,
                width: 250,
                outline: 'none'
              }}
            />
          </div>
          <button 
            onClick={fetchData}
            style={{ 
              background: colors.purple, 
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
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Recargar
          </button>
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <div style={{ 
        background: colors.card, 
        borderRadius: 8, 
        border: `1px solid ${colors.border}`,
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fcfcfc', borderBottom: `2px solid ${colors.border}` }}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}><Calendar size={14} /> Fecha</th>
              <th style={styles.th}><Building2 size={14} /> Empresa</th>
              <th style={styles.th}><FileText size={14} /> Archivo</th>
              <th style={styles.th}>Data (JSON/XML)</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center', color: colors.subtext }}>Cargando registros...</td></tr>
            ) : filteredRecords.map((row) => (
              <tr key={row.id} style={styles.tr}>
                <td style={{ ...styles.td, fontSize: 11, color: colors.subtext }}>{row.id.toString().slice(0,8)}...</td>
                <td style={styles.td}>{new Date(row.created_at).toLocaleDateString()}</td>
                <td style={{ ...styles.td, fontWeight: 600 }}>{row.company_name || 'N/A'}</td>
                <td style={styles.td}>{row.file_name}</td>
                <td style={styles.td}>
                   <span style={styles.badge}>{row.json_data ? 'JSON' : 'XML'}</span>
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <button 
                    onClick={() => setDeleteId(row.id)}
                    style={styles.deleteBtn}
                    title="Eliminar fila"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!loading && filteredRecords.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: colors.subtext }}>No hay datos para mostrar.</div>
        )}
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {deleteId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <AlertTriangle size={40} color={colors.danger} />
              <div>
                <h3 style={{ margin: 0 }}>¿Confirmar eliminación?</h3>
                <p style={{ fontSize: 14, color: colors.subtext, marginTop: 4 }}>
                  Esta acción es irreversible. El registro desaparecerá de Supabase.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={styles.btnCancel}>Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} style={styles.btnConfirm}>Eliminar permanentemente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos en objeto para mantener el componente limpio
const styles = {
  th: {
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: '#616161',
    display: 'table-cell',
    verticalAlign: 'middle'
  },
  td: {
    padding: '14px 16px',
    fontSize: 14,
    borderBottom: '1px solid #e1e1e1'
  },
  tr: {
    transition: 'background 0.2s',
    cursor: 'default'
  },
  badge: {
    background: '#e8ebfa',
    color: '#5b5fc7',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#d13438',
    cursor: 'pointer',
    padding: 8,
    borderRadius: 4,
    transition: 'background 0.2s'
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#fff',
    padding: 24,
    borderRadius: 8,
    width: 400,
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },
  btnCancel: {
    padding: '8px 16px',
    borderRadius: 4,
    border: '1px solid #e1e1e1',
    background: '#fff',
    cursor: 'pointer'
  },
  btnConfirm: {
    padding: '8px 16px',
    borderRadius: 4,
    border: 'none',
    background: '#d13438',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer'
  }
};

export default ClientsTableManager;