'use client';

import React, { useState, useCallback } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export default function CatalogParser({ companyName = 'LESRO' }) {
  const [pdfJson, setPdfJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(null);

  // ============================
  // PDF → JSON (CLIENT ONLY)
  // ============================
  const extractPdfToJson = async (file) => {
    // ⛔ pdf.js SOLO en cliente, build legacy
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');

    // ✅ Worker local servido por Next.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    const pages = [];
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const text = content.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      pages.push({
        page: i,
        content: text
      });

      fullText += text + ' ';
    }

    return {
      meta: {
        company: companyName,
        pages: pdf.numPages,
        extracted_at: new Date().toISOString()
      },
      pages,
      full_text: fullText.trim()
    };
  };

  // ============================
  // Drag & Drop
  // ============================
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragActive(false);
    setMessage(null);

    const file = e.dataTransfer.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setMessage('❌ Please drop a valid PDF');
      return;
    }

    setLoading(true);

    try {
      const json = await extractPdfToJson(file);
      setPdfJson(json);
    } catch (err) {
      console.error('PDF parse error:', err);
      setMessage('❌ Error processing PDF');
    } finally {
      setLoading(false);
    }
  }, [companyName]);

  // ============================
  // Save to Supabase
  // ============================
  const handleSave = async () => {
    if (!pdfJson) return;

    setLoading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('❌ Unauthorized');
        return;
      }

      const { error } = await supabase
        .from('ClientsSERVEX')
        .update({ pdf_raw: pdfJson })
        .eq('company_name', companyName)
        .eq('user_id', user.id);

      if (error) throw error;

      setMessage('✅ PDF content saved successfully');
    } catch (err) {
      console.error('Supabase save error:', err);
      setMessage('❌ Error saving PDF data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-white p-6 rounded-xl border border-[#EDEBE9] space-y-4">

      {/* HEADER */}
      <div>
        <h3 className="text-sm font-semibold text-[#242424]">
          PDF Catalog Intake
        </h3>
        <p className="text-xs text-[#605E5C]">
          Company: <span className="font-bold">{companyName}</span>
        </p>
      </div>

      {/* DROP ZONE */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-xs transition-all
          ${dragActive
            ? 'border-[#6264A7] bg-[#F3F2F1]'
            : 'border-[#E1DFDD] bg-[#FAF9F8]'}`}
      >
        {loading ? (
          <span className="font-semibold text-[#6264A7]">
            Processing PDF…
          </span>
        ) : (
          <>
            <span className="font-semibold text-[#242424]">
              Drag & drop PDF here
            </span>
            <span className="text-[#605E5C]">
              PDF will be converted to JSON
            </span>
          </>
        )}
      </div>

      {/* PREVIEW */}
      {pdfJson && (
        <pre className="max-h-56 overflow-auto text-[10px] bg-[#FAF9F8] border border-[#EDEBE9] p-3 rounded-md">
          {JSON.stringify(pdfJson, null, 2)}
        </pre>
      )}

      {/* ACTIONS */}
      <button
        onClick={handleSave}
        disabled={!pdfJson || loading}
        className="px-4 py-2 text-xs font-semibold rounded-md bg-[#6264A7] text-white hover:bg-[#4B53BC] disabled:opacity-40"
      >
        Save PDF Content
      </button>

      {message && (
        <p className="text-xs text-[#605E5C]">
          {message}
        </p>
      )}
    </section>
  );
}
