import { supabase } from './supabaseClient';

/**
 * Registra una acción del usuario en el seguimiento cronológico (seguimiento_client).
 * Realiza una doble sincronización resiliente:
 * 1. Envía el evento al endpoint MCP del backend (CET_AI_ENGINE / Universal).
 * 2. Si el cliente está autenticado en Supabase, actualiza directamente la columna 'seguimiento_client'
 *    en 'ClientsSERVEX_General_Procces', garantizando persistencia inmediata paso a paso.
 */
export async function recordClientAction({
  companyName = 'General_Procces',
  eventType,
  title,
  description,
  details = {}
}) {
  if (!eventType || !description) return;

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://servex-ai-back.onrender.com';

  const cleanCo = (companyName || 'General_Procces').trim();

  // 1. Envío asíncrono al backend MCP
  try {
    fetch(`${backendUrl}/api/v1/cet-ai-engine/tracking/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: cleanCo,
        event_type: eventType,
        title: title || 'Acción de Usuario',
        description,
        actor: 'user',
        details
      }),
      keepalive: true
    }).catch(() => {});
  } catch (_) {}

  // 2. Persistencia directa en Supabase desde el cliente autenticado
  try {
    const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: {} }));
    const currentUserId = authData?.user?.id;

    const { data: row } = await supabase
      .from('ClientsSERVEX_General_Procces')
      .select('id, seguimiento_client')
      .eq('company_name', cleanCo)
      .maybeSingle();

    const now = new Date();
    const nowIso = now.toISOString();
    const nowTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let existingTracking = row?.seguimiento_client;
    if (!existingTracking || typeof existingTracking !== 'object') {
      existingTracking = {
        company_name: cleanCo,
        created_at: nowIso,
        last_updated: nowIso,
        total_actions: 0,
        session_summary: 'Sesión iniciada.',
        events: []
      };
    }

    const events = Array.isArray(existingTracking.events) ? existingTracking.events : [];

    // Prevenir duplicados consecutivos en corto tiempo
    if (events.length > 0) {
      const last = events[events.length - 1];
      if (last.type === eventType && last.description === description) {
        return;
      }
    }

    const stepNum = events.length + 1;
    const newEvent = {
      step: stepNum,
      timestamp: nowIso,
      time_label: nowTimeStr,
      type: eventType,
      title: title || 'Acción de Catálogo',
      description,
      actor: 'user',
      details
    };

    const updatedEvents = [...events, newEvent].slice(-60);
    const summary = updatedEvents
      .slice(-6)
      .map(e => `${e.step}. ${e.title}`)
      .join(' ⟶ ');

    const updatedTracking = {
      ...existingTracking,
      company_name: cleanCo,
      last_updated: nowIso,
      total_actions: updatedEvents.length,
      session_summary: summary,
      events: updatedEvents
    };

    if (row?.id) {
      await supabase
        .from('ClientsSERVEX_General_Procces')
        .update({ seguimiento_client: updatedTracking })
        .eq('id', row.id);
    } else {
      const payload = {
        company_name: cleanCo,
        seguimiento_client: updatedTracking
      };
      if (currentUserId) payload.user_id = currentUserId;
      await supabase
        .from('ClientsSERVEX_General_Procces')
        .upsert(payload, { onConflict: 'company_name' });
    }
  } catch (err) {
    console.warn('[-] Advertencia en recordClientAction:', err);
  }
}

/**
 * Reinicia la estructura de seguimiento cuando se purga la base de datos.
 */
export async function resetClientTracking(companyName = 'General_Procces') {
  const cleanCo = (companyName || 'General_Procces').trim();
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://servex-ai-back.onrender.com';

  try {
    fetch(`${backendUrl}/api/v1/cet-ai-engine/clear-session`, {
      method: 'POST',
      keepalive: true
    }).catch(() => {});
  } catch (_) {}

  try {
    const emptyTracking = {
      company_name: cleanCo,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      total_actions: 0,
      session_summary: 'Sesión iniciada sin acciones registradas aún.',
      events: []
    };

    await supabase
      .from('ClientsSERVEX_General_Procces')
      .update({ seguimiento_client: emptyTracking })
      .eq('company_name', cleanCo);
  } catch (_) {}
}
