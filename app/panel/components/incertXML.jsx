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
      // 👤 SOLO sesión, sin reglas de negocio
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage('❌ Unauthorized user');
        return;
      }

      const { error } = await supabase
        .from('ClientsSERVEX')
        .insert({
          company_name: companyName,
          xml_raw: xmlContent, // XML crudo, tal cual
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
    <section className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        Upload CET Catalog XML
      </h2>

      <input
        className="w-full border p-2 mb-3"
        placeholder="Company name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />

      <textarea
        className="w-full border p-2 h-64 font-mono text-xs"
        placeholder="Paste full XML here"
        value={xmlContent}
        onChange={(e) => setXmlContent(e.target.value)}
      />

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded"
      >
        {loading ? 'Saving…' : 'Save XML'}
      </button>

      {message && <p className="mt-3 text-sm">{message}</p>}
    </section>
  );
}
