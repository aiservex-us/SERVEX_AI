'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export default function UploadClientXML() {
  const [companyName, setCompanyName] = useState('');
  const [xmlContent, setXmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSave = async () => {
    setMessage(null);

    if (!companyName.trim()) {
      setMessage('❌ Company name is required');
      return;
    }

    if (!xmlContent.trim()) {
      setMessage('❌ XML content is required');
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage('❌ Unauthorized user');
        return;
      }

      const { error } = await supabase.from('ClientsSERVEX').insert({
        company_name: companyName,
        xml_raw: xmlContent,
        user_id: user.id,
      });

      if (error) {
        console.error(error);
        setMessage('❌ Error saving XML');
      } else {
        setMessage('✅ XML saved successfully');
        setCompanyName('');
        setXmlContent('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-black">
            Upload CET Catalog XML
          </h2>
          <p className="mt-3 text-sm text-neutral-500">
            Centralize your CET catalog data and enable automated processing
            inside the Servex platform.
          </p>
        </div>

        {/* FORM + INFO */}
        <div className="grid grid-cols-12 gap-6">
          {/* INFO */}
          <div className="col-span-12 md:col-span-5 rounded-3xl border border-white bg-gradient-to-br from-[#f8fafc] via-white to-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-6 md:p-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600 mb-6">
              XML
            </div>

            <h3 className="text-lg font-semibold text-black mb-2">
              Structured Catalog Intake
            </h3>

            <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
              Uploading your CET XML allows Servex to parse, normalize, and
              prepare your catalog for configuration, pricing, and visualization
              workflows.
            </p>

            <div className="mt-8 flex gap-3">
              <span className="px-4 py-1.5 text-xs rounded-full bg-white shadow-sm border">
                Secure
              </span>
              <span className="px-4 py-1.5 text-xs rounded-full bg-white shadow-sm border">
                Automated
              </span>
            </div>
          </div>

          {/* FORM */}
          <div className="col-span-12 md:col-span-7 rounded-3xl border border-white bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-6 md:p-8">
            <div className="space-y-5">
              <input
                className="w-full rounded-xl bg-[#f4f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />

              <textarea
                className="w-full rounded-xl bg-[#f4f6f8] px-4 py-3 text-xs font-mono h-60 resize-none outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Paste full XML here"
                value={xmlContent}
                onChange={(e) => setXmlContent(e.target.value)}
              />

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save XML'}
              </button>

              {message && (
                <p className="text-center text-xs text-neutral-500">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM CARDS */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT CARD */}
          <div className="col-span-12 md:col-span-6 rounded-3xl border border-white bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-6">
            <h4 className="text-sm font-medium text-black mb-1">
              XML Processing Enabled
            </h4>
            <p className="text-xs text-neutral-500">
              Uploaded catalogs are automatically linked to your account and
              prepared for downstream automation.
            </p>
          </div>

          {/* RIGHT CARD */}
          <div className="col-span-12 md:col-span-6 rounded-3xl border border-white bg-gradient-to-br from-white via-white to-[#f8fafc] shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-6">
            <h4 className="text-sm font-medium text-black mb-1">
              Need Assistance?
            </h4>
            <p className="text-xs text-neutral-500">
              Our team can help validate your XML structure and optimize it for
              Servex automation workflows.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
