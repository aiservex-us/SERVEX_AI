'use client';

import React, { useEffect, useState, useMemo } from 'react';
import * as PH from "@phosphor-icons/react";
import { supabase } from '@/app/lib/supabaseClient';

const SidebarRight = () => {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // FETCH CSV
  // ===============================
  useEffect(() => {
    const fetchCSV = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('ClientsSERVEX')
        .select('csv_raw, created_at')
        .order('created_at', { ascending: false })
        .single();

      if (error || !data?.csv_raw) {
        setRows([]);
        setHeaders([]);
        setLoading(false);
        return;
      }

      const parsed = parseCSV(data.csv_raw);
      setRows(parsed.rows);
      setHeaders(parsed.headers);
      setLoading(false);
    };

    fetchCSV();
  }, []);

  // ===============================
  // CSV PARSER
  // ===============================
  const parseCSV = (csv) => {
    const lines = csv.replace(/\r\n/g, '\n').trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());

    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
      return headers.reduce((acc, h, i) => {
        acc[h] = values[i] ?? '';
        return acc;
      }, {});
    });

    return { headers, rows };
  };

  // ===============================
  // INSIGHTS DERIVADOS
  // ===============================
  const insights = useMemo(() => {
    if (!rows.length) return null;

    const totalRows = rows.length;
    const totalFields = headers.length;

    const filledFields = headers.filter(h =>
      rows.some(r => r[h] && r[h].length > 0)
    ).length;

    const avgFieldsPerRow =
      rows.reduce((sum, r) =>
        sum + Object.values(r).filter(v => v).length
      , 0) / totalRows;

    const numericValues = [];
    rows.forEach(r =>
      Object.values(r).forEach(v => {
        const n = parseFloat(v);
        if (!isNaN(n)) numericValues.push(n);
      })
    );

    const priceStats = numericValues.length
      ? {
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          avg: (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2)
        }
      : null;

    return {
      totalRows,
      totalFields,
      filledFields,
      avgFieldsPerRow: avgFieldsPerRow.toFixed(1),
      priceStats
    };
  }, [rows, headers]);

  return (
    <aside className="w-full sm:w-64 lg:w-80 bg-white border-l border-[#EDEBE9] flex flex-col h-full p-4 space-y-4">

      {/* HEADER */}
      <div className="flex items-center gap-2">
        <PH.Brain size={18} className="text-[#464775]" />
        <h3 className="text-[12px] font-bold text-[#242424]">
          Interpretación del Catálogo
        </h3>
      </div>

      {loading || !insights ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <PH.CircleNotch size={20} className="animate-spin text-[#464775]" />
        </div>
      ) : (
        <div className="space-y-4 text-[11px] text-[#242424]">

          {/* ESTRUCTURA */}
          <Section
            icon={<PH.Database size={14} />}
            title="Estructura del Catálogo"
            items={[
              `Registros totales: ${insights.totalRows}`,
              `Campos definidos: ${insights.filledFields} / ${insights.totalFields}`,
              `Promedio de datos por registro: ${insights.avgFieldsPerRow}`
            ]}
          />

          {/* PRECIOS */}
          {insights.priceStats && (
            <Section
              icon={<PH.CurrencyDollar size={14} />}
              title="Estrategia de Precios"
              items={[
                `Precio mínimo detectado: ${insights.priceStats.min}`,
                `Precio máximo detectado: ${insights.priceStats.max}`,
                `Precio promedio: ${insights.priceStats.avg}`
              ]}
            />
          )}

          {/* NEGOCIO */}
          <Section
            icon={<PH.TrendUp size={14} />}
            title="Lectura de Negocio"
            items={[
              insights.avgFieldsPerRow > 6
                ? 'Catálogo con alto nivel de detalle (servicios especializados)'
                : 'Catálogo estandarizado (ideal para volumen)',
              insights.filledFields / insights.totalFields > 0.7
                ? 'Alta madurez operativa'
                : 'Oportunidad de estandarización'
            ]}
          />

          {/* IA */}
          <Section
            icon={<PH.Robot size={14} />}
            title="Potencial para IA"
            items={[
              'Apto para Copilot comercial',
              'Base sólida para RAG',
              'Permite recomendaciones automáticas',
              'Útil para onboarding y soporte interno'
            ]}
          />

        </div>
      )}
    </aside>
  );
};

// ===============================
// SUBCOMPONENTE
// ===============================
const Section = ({ icon, title, items }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-[#464775] font-semibold">
      {icon}
      <span className="text-[11px]">{title}</span>
    </div>
    <ul className="ml-5 list-disc text-[#605E5C] space-y-0.5">
      {items.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  </div>
);

export default SidebarRight;
