'use client';

import React, { useState, useCallback } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/* ==============================
   🔍 REGEX (IGUAL QUE PYTHON)
================================ */
const SKU_PATTERN = /\b[A-Z]{2,4}\d{3,5}\b/g;
const TOC_LINE_PATTERN = /^(.*?)\.{3,}\s*(\d+)$/;

/* ==============================
   🧠 HELPERS
================================ */
const extractSKUs = (text) => {
  if (!text) return [];
  return [...new Set(text.match(SKU_PATTERN) || [])].sort();
};

export default function CatalogParser({ companyName = 'LESRO' }) {
  const [pdfJson, setPdfJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(null);

  /* ==============================
     📖 PDF → PAGES TEXT
  ================================ */
  const extractPagesText = async (file) => {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    const pages = [];

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
        text
      });
    }

    return pages;
  };

  /* ==============================
     📑 DETECT TOC (FIRST 5 PAGES)
  ================================ */
  const extractTOC = (pages, maxPages = 5) => {
    const toc = [];

    pages.slice(0, maxPages).forEach(p => {
      p.text.split('\n').forEach(line => {
        const match = line.trim().match(TOC_LINE_PATTERN);
        if (match) {
          toc.push({
            title: match[1].trim(),
            page: parseInt(match[2], 10)
          });
        }
      });
    });

    // remove duplicates by page
    const unique = {};
    toc.forEach(item => {
      unique[item.page] = item;
    });

    return Object.values(unique);
  };

  /* ==============================
     🧠 BUILD STRUCTURE (CORE LOGIC)
  ================================ */
  const buildStructure = (pages, toc) => {
    const sections = [];
    const tocSorted = [...toc].sort((a, b) => a.page - b.page);

    tocSorted.forEach((entry, index) => {
      const startPage = entry.page;
      const endPage =
        index + 1 < tocSorted.length
          ? tocSorted[index + 1].page - 1
          : pages[pages.length - 1].page;

      const section = {
        title: entry.title,
        start_page: startPage,
        end_page: endPage,
        products: []
      };

      pages.forEach(p => {
        if (p.page >= startPage && p.page <= endPage) {
          const skus = extractSKUs(p.text);
          if (skus.length > 0) {
            section.products.push({
              page: p.page,
              skus
            });
          }
        }
      });

      sections.push(section);
    });

    return sections;
  };

  /* ==============================
     🚀 FULL PIPELINE
  ================================ */
  const extractPdfToJson = async (file) => {
    const pages = await extractPagesText(file);
    const toc = extractTOC(pages);
    const structure = buildStructure(pages, toc);

    return {
      document: file.name,
      company: companyName,
      total_pages: pages.length,
      toc_detected: toc.length,
      extracted_at: new Date().toISOString(),
      sections: structure
    };
  };

  /* ==============================
     📥 DRAG & DROP
  ================================ */
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
      console.error(err);
      setMessage('❌ Error processing PDF');
    } finally {
      setLoading(false);
    }
  }, [companyName]);

  /* ==============================
     💾 SAVE TO SUPABASE
  ================================ */
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

      setMessage('✅ PDF parsed & saved successfully');
    } catch (err) {
      console.error(err);
      setMessage('❌ Error saving data');
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     🧩 UI
  ================================ */
  return (
    <section className="w-full bg-white p-6 rounded-xl border border-[#EDEBE9] space-y-4">

      <div>
        <h3 className="text-sm font-semibold text-[#242424]">
          Catalog PDF Parser
        </h3>
        <p className="text-xs text-[#605E5C]">
          Company: <b>{companyName}</b>
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-xs
          ${dragActive ? 'border-[#6264A7] bg-[#F3F2F1]' : 'border-[#E1DFDD] bg-[#FAF9F8]'}`}
      >
        {loading ? 'Processing PDF…' : 'Drag & drop PDF here'}
      </div>

      {pdfJson && (
        <pre className="max-h-64 overflow-auto text-[10px] bg-[#FAF9F8] border p-3 rounded">
          {JSON.stringify(pdfJson, null, 2)}
        </pre>
      )}

      <button
        onClick={handleSave}
        disabled={!pdfJson || loading}
        className="px-4 py-2 text-xs font-semibold rounded bg-[#6264A7] text-white disabled:opacity-40"
      >
        Save Parsed JSON
      </button>

      {message && <p className="text-xs">{message}</p>}
    </section>
  );
}
