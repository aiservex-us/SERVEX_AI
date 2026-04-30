'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';

/**
 * Este componente es un "HOC Invisible" o Listener.
 * Recibe los datos del componente principal y se encarga de la persistencia
 * en la columna audit_diff_visual_json.
 */
const VisualDiffSaver = ({ data, masterDataRows, matchStatus, isProcessing }) => {
  const lastSavedRef = useRef(null);

  const saveVisualDiffToCloud = async (visualData) => {
    try {
      // Evitar duplicados si la data es idéntica a la última guardada
      const dataString = JSON.stringify(visualData);
      if (lastSavedRef.current === dataString) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('ClientsSERVEX')
        .upsert({
          company_name: 'LESRO', 
          audit_diff_visual_json: visualData, // Columna destino
          user_id: user.id,
          updated_at: new Date()
        }, { 
          onConflict: 'company_name' 
        });

      if (error) throw error;
      lastSavedRef.current = dataString;
      console.log("✅ Visual Audit Diff guardado en Supabase");
    } catch (err) {
      console.error("❌ Error guardando visual_diff:", err);
    }
  };

  useEffect(() => {
    // Solo actuamos si no se está procesando, hay un mismatch y tenemos datos
    if (!isProcessing && matchStatus === 'mismatch' && data.length > 0) {
      
      const header = data[0];
      const visualRows = data.slice(1).map((row, ri) => {
        const masterRow = masterDataRows[ri] || [];
        
        // Mapeamos cada celda buscando diferencias
        const cells = row.map((cell, ci) => {
          const masterCell = masterRow[ci];
          const isDifferent = masterCell !== undefined && cell !== masterCell;

          // Intentar calcular porcentaje si son números
          let diffPercentage = null;
          const oldVal = parseFloat(masterCell);
          const newVal = parseFloat(cell);

          if (isDifferent && !isNaN(oldVal) && !isNaN(newVal) && oldVal !== 0) {
            diffPercentage = (((newVal - oldVal) / oldVal) * 100).toFixed(2) + '%';
          }

          return {
            column: header[ci],
            old_value: masterCell,
            new_value: cell,
            is_different: isDifferent,
            percentage: diffPercentage,
            colors: isDifferent ? { old: 'red', new: 'green' } : null
          };
        });

        return {
          row_index: ri,
          has_changes: cells.some(c => c.is_different),
          changes: cells.filter(c => c.is_different),
          full_row: cells
        };
      });

      const finalPayload = {
        timestamp: new Date().toISOString(),
        summary: {
          total_rows_with_diff: visualRows.length,
        },
        diff_data: visualRows
      };

      saveVisualDiffToCloud(finalPayload);
    }
  }, [data, masterDataRows, matchStatus, isProcessing]);

  return null; // Este componente no renderiza nada visualmente
};

export default VisualDiffSaver;