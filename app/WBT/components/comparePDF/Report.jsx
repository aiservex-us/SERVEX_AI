'use client';
// Importamos el cliente de trabajadores asignado a la plataforma
import { supabase } from '@/app/lib/supabaseClient';

export default function AuditReportViewer() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  // 1. Fetch de los datos de la tabla ClientsSERVEX_WBT
  useEffect(() => {
    async function fetchAuditData() {
      try {
        setLoading(true);
        
        // Traemos el ID, nombre de empresa y la columna JSONB solicitada
        const { data, error: supabaseError } = await supabase
          .from('ClientsSERVEX_WBT')
          .select('id, company_name, audit_report_jsonP')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;

        setRecords(data || []);
        
        // Seleccionar el primer registro por defecto si existe
        if (data && data.length > 0) {
          setSelectedRecordId(data[0].id);
        }
      } catch (err) {
        console.error('❌ Error fetching ClientsSERVEX_WBT:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAuditData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-medium">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
        Cargando reportes de auditoría de SERVEX_AI...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-4xl mx-auto my-6">
        <p className="font-bold">❌ Error al cargar la información del data pipeline:</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  // Encontrar el registro seleccionado en el estado
  const activeRecord = records.find(r => r.id === selectedRecordId);
  // Parsear o extraer el JSON de la columna "audit_report_jsonP"
  const reportData = activeRecord?.audit_report_jsonP;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* HEADER DE CONTROL */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 space-y-4 md:space-y-0">
       <p className="text-sm text-slate-500 mt-1">
  Tabla: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs font-mono font-bold">
    {`public."ClientsSERVEX_WBT"`}
  </code>
</p>
        
        {/* Selector de registros/compañías si existen múltiples en la tabla */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-semibold text-slate-700">Compañía:</label>
          <select 
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
            value={selectedRecordId || ''} 
            onChange={(e) => setSelectedRecordId(Number(e.target.value))}
          >
            {records.map((rec) => (
              <option key={rec.id} value={rec.id}>
                {rec.company_name} (ID: {rec.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VERIFICACIÓN DE CONTENIDO JSON */}
      {!reportData || Object.keys(reportData).length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center text-amber-800">
          ⚠️ No se encontraron datos válidos o estructurados en la columna <code className="font-bold font-mono">audit_report_jsonP</code> para este registro.
        </div>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          
          {/* SECCIÓN 1: MÉTRICAS CLAVE (KPI CARDS) */}
          {reportData.summary_metrics && (
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Métricas del Reporte</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-400 uppercase">Cambios de Celda</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{reportData.summary_metrics.total_cell_changes}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-400 uppercase">Actualizaciones XML</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{reportData.summary_metrics.xml_successful_updates}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-400 uppercase">Modelos Comunes Evaluados</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{reportData.summary_metrics.evaluated_common_models}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-400 uppercase">Modelos Añadidos</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{reportData.summary_metrics.added_models_count}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-400 uppercase">Modelos Eliminados</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{reportData.summary_metrics.deleted_models_count}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: TABLA DE CAMBIOS DETECTADOS */}
          {reportData.detected_changes && reportData.detected_changes.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Cambios Estructurados en Modelos</h3>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
                  {reportData.detected_changes.length} modificaciones detectadas
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100/50 text-slate-600 font-medium border-b border-slate-200 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">Model ID</th>
                      <th className="p-4 font-semibold">Columna / Nodo</th>
                      <th className="p-4 font-semibold text-red-600">Valor Anterior</th>
                      <th className="p-4 font-semibold text-emerald-600">Valor Inyectado</th>
                      <th className="p-4 font-semibold text-center">Índice Posicional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reportData.detected_changes.map((change, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">{change.model_id}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                            {change.column_name}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-red-600 line-through bg-red-50/30">{change.old_value}</td>
                        <td className="p-4 font-mono text-emerald-600 font-semibold bg-emerald-50/30">✔ {change.new_value}</td>
                        <td className="p-4 text-center font-mono text-slate-400 text-xs">{change.positional_index}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: METADATOS DEL PIPELINE & MANIFIESTO XML */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Metadata Engine */}
            {reportData.pipeline_metadata && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-1">
                <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Metadatos del Pipeline</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Motor de Sistema:</span>
                    <span className="font-mono font-bold text-slate-800">{reportData.pipeline_metadata.system_engine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target de Ejecución:</span>
                    <span className="bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs px-2 py-0.5 rounded">
                      {reportData.pipeline_metadata.execution_target}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Compañía Procesada:</span>
                    <span className="font-semibold text-indigo-600">{reportData.pipeline_metadata.company_processed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Namespace Activo:</span>
                    <span className="text-slate-700 font-medium">{reportData.pipeline_metadata.has_namespace ? 'Sí (True)' : 'No'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Manifiesto XML Resumido */}
            {reportData.xml_injection_manifest && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-3">
                <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Estado de Inyección de Manifiesto XML</h3>
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                  {reportData.xml_injection_manifest.map((manifest, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 sm:space-y-0">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold tracking-tight text-[10px]">
                          {manifest.status}
                        </span>
                        <span className="font-mono font-bold text-slate-700">{manifest.model_id}</span>
                      </div>
                      <div className="text-slate-500 font-mono">
                        Nodo: <span className="text-slate-800 font-medium">{manifest.target_node}</span> ({manifest.injected_value_old} ➔ <span className="text-emerald-600 font-bold">{manifest.injected_value_new}</span>)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}