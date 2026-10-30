import { supabase } from './supabaseClient';

/**
 * Sanitiza y serializa el historial de chat para almacenarlo en formato JSON/JSONB
 * en la columna 'general_procces_chat' de la tabla 'ClientsSERVEX_General_Procces'.
 * Garantiza que cada entrada tenga:
 * - id: Identificador único del mensaje
 * - role: 'user' | 'assistant' | 'system'
 * - from: 'user' | 'bot' | 'tool'
 * - text: Contenido del mensaje en texto plano / markdown
 * - content: Mismo contenido para interoperabilidad LLM estándar
 * - time: Hora legible (ej. '05:41 PM')
 * - timestamp: ISO string UTC
 * - catalog: Nombre del catálogo XML activo en la sesión
 * - Metadatos adicionales (isXmlUpload, staged_result, inspection_report, etc.)
 */
export function formatChatForStorage(messages, catalogName = 'General Process') {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter(m => m && (m.text || m.content || m.isXmlUpload || m.toolId || m.staged_result))
    .map((m, idx) => {
      const isUser = m.from === 'user' || m.role === 'user';
      const role = isUser ? 'user' : (m.from === 'bot' || m.role === 'assistant' ? 'assistant' : (m.role || 'system'));
      const from = isUser ? 'user' : (m.from === 'tool' ? 'tool' : 'bot');
      const text = typeof m.text === 'string' ? m.text : (typeof m.content === 'string' ? m.content : '');

      const entry = {
        id: m.id || `msg-${idx}-${from}-${Date.now()}`,
        from,
        role,
        text,
        content: text,
        time: m.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: m.timestamp || new Date().toISOString(),
        catalog: m.catalog || m.fileName || catalogName || 'General Process.xml'
      };

      if (m.isXmlUpload) {
        entry.isXmlUpload = true;
        entry.fileName = m.fileName;
        entry.fileSizeKb = m.fileSizeKb;
        entry.uploadStatus = m.uploadStatus || 'completed';
      }
      if (m.toolId) entry.toolId = m.toolId;
      if (m.staged_result) entry.staged_result = m.staged_result;
      if (m.inspection_report) entry.inspection_report = m.inspection_report;
      if (m.catalog_data) entry.catalog_data = m.catalog_data;
      if (m.can_commit !== undefined) entry.can_commit = Boolean(m.can_commit);
      if (m.needs_upload !== undefined) entry.needs_upload = Boolean(m.needs_upload);
      if (m.committed !== undefined) entry.committed = Boolean(m.committed);
      if (m.showDownloadCard) entry.showDownloadCard = true;

      return entry;
    });
}

let _cachedUserId = null;

/**
 * Persiste de forma inmediata e inmutable el chat en la columna 'general_procces_chat'
 * de la tabla 'ClientsSERVEX_General_Procces' en Supabase sin bloquear con llamadas de red a Auth.
 */
export async function saveGeneralProcessChat(messages, catalogName = 'General Process') {
  try {
    if (!messages || !Array.isArray(messages)) return;
    const formattedChat = formatChatForStorage(messages, catalogName);

    if (!_cachedUserId) {
      const { data: sessionData } = await supabase.auth.getSession().catch(() => ({ data: {} }));
      _cachedUserId = sessionData?.session?.user?.id || null;
    }

    const payload = {
      company_name: 'General_Procces',
      general_procces_chat: formattedChat
    };
    if (_cachedUserId) payload.user_id = _cachedUserId;
    if (catalogName && catalogName !== 'General Process') {
      payload.file_name = catalogName;
      payload.xml_name = catalogName.replace(/\.xml$/i, '');
    }

    // Upsert directo en una sola operación de red (evita doble viaje UPDATE -> UPSERT)
    const { error: upsertErr } = await supabase
      .from('ClientsSERVEX_General_Procces')
      .upsert(payload, { onConflict: 'company_name' });

    if (upsertErr) {
      await supabase
        .from('ClientsSERVEX_General_Procces')
        .update({ general_procces_chat: formattedChat })
        .eq('company_name', 'General_Procces');
    }
  } catch (err) {
    console.warn('[-] Advertencia persistiendo general_procces_chat en Supabase:', err);
  }
}

/**
 * Obtiene el historial de chat almacenado en 'general_procces_chat'.
 */
export async function loadGeneralProcessChat() {
  try {
    const { data, error } = await supabase
      .from('ClientsSERVEX_General_Procces')
      .select('general_procces_chat, file_name, xml_name')
      .eq('company_name', 'General_Procces')
      .maybeSingle();

    if (error || !data) return { history: [], catalogName: '' };

    let history = [];
    if (Array.isArray(data.general_procces_chat)) {
      history = data.general_procces_chat;
    } else if (data.general_procces_chat && typeof data.general_procces_chat === 'object' && Array.isArray(data.general_procces_chat.messages)) {
      history = data.general_procces_chat.messages;
    }

    const catalogName = data.file_name || data.xml_name || '';
    return { history, catalogName };
  } catch (err) {
    console.warn('[-] Advertencia cargando general_procces_chat:', err);
    return { history: [], catalogName: '' };
  }
}
