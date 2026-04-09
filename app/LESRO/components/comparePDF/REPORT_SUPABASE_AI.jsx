import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const AgentInfo = () => {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('ClientsSERVEX')
          .select('informa_agent_raw')
          .single();

        if (supabaseError) throw supabaseError;

        setAgentData(data?.informa_agent_raw);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentInfo();
  }, []);

  if (loading) return <div className="p-4 text-gray-500">Cargando información...</div>;
  
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 border-b pb-2 text-slate-800">
        Información del Agente
      </h2>
      <div className="prose max-w-none text-slate-600">
        {agentData ? (
          <pre className="whitespace-pre-wrap font-sans">
            {agentData}
          </pre>
        ) : (
          <p>No hay información disponible.</p>
        )}
      </div>
    </div>
  );
};

export default AgentInfo;