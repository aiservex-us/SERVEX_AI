'use client';

import { useState } from 'react';
import { supabase, getCurrentUser } from '@/app/lib/supabaseClient';

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
      // 🔐 Usuario autenticado (usa TU lógica actual)
      const user = await getCurrentUser();

      if (!user?.id) {
        setMessage('❌ Unauthorized user');
        setLoading(false);
        return;
      }

      // 💾 Insert directo (sin procesar el XML)
      const { error } = await supabase
        .from('ClientsSERVEX')
        .insert([
          {
            company_name: companyName,
            file_name: null, // No guardamos archivo
            xml_raw: xmlContent, // XML COMPLETO COMO TEXTO
            json_data: null,
            user_id: user.id,
          },
        ]);

      if (error) {
        console.error(error);
        setMessage('❌ Error saving XML to database');
      } else {
        setMessage('✅ XML saved successfully');
        setCompanyName('');
        setXmlContent('');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        Upload CET Catalog XML
      </h2>

      {/* Company Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Company Name
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full border rounded-lg p-2"
          placeholder="Ashford Furniture"
        />
      </div>

      {/* XML Content */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          XML Content (raw)
        </label>
        <textarea
          value={xmlContent}
          onChange={(e) => setXmlContent(e.target.value)}
          rows={10}
          className="w-full border rounded-lg p-2 font-mono text-xs"
          placeholder="Paste full CET XML here..."
        />
        <p className="text-xs text-gray-500 mt-1">
          The XML will be stored as raw text. No parsing or validation is applied.
        </p>
      </div>

      {/* Action */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save XML'}
      </button>

      {/* Message */}
      {message && (
        <p className="mt-4 text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
