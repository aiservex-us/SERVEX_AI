// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

//
// =======================
// CONFIGURACIÓN SUPABASE
// =======================
//

const supabaseUrl = 'https://zotgxyupuiifnbuwwjkl.supabase.co';
const supabaseAnonKey = 'sb_publishable_usgTKwhsIpmNIiGa_F4tiw_ah3THCTJ';

/**
 * 💡 SOLUCIÓN PARA SEPARAR SESIONES:
 * Creamos dos clientes con diferentes 'storageKey'. 
 * Esto hace que el navegador guarde los tokens en lugares distintos.
 */

// Cliente para Trabajadores (Microsoft / Azure) - Usará el nombre por defecto o uno específico
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-worker-session', // Llave única para trabajadores
    persistSession: true,
    autoRefreshToken: true,
  }
});

// =============================================================================
// AISLAMIENTO MULTI-USUARIO (TENANT KEY POR USUARIO SIN ALTERAR EL ESQUEMA SQL)
// =============================================================================
let _cachedTenantUserId = null;

if (typeof window !== 'undefined') {
  try {
    supabase.auth.onAuthStateChange((_event, session) => {
      _cachedTenantUserId = session?.user?.id || null;
    });
  } catch (_) {}
}

export function getActiveUserIdSync() {
  if (_cachedTenantUserId) return _cachedTenantUserId;
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sb-worker-session');
    if (raw) {
      const parsed = JSON.parse(raw);
      const uid = parsed?.user?.id || parsed?.currentSession?.user?.id || parsed?.session?.user?.id || null;
      if (uid) {
        _cachedTenantUserId = uid;
        return uid;
      }
    }
  } catch (_) {}
  return null;
}

export function getActiveAccessTokenSync() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sb-worker-session');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.access_token || parsed?.currentSession?.access_token || parsed?.session?.access_token || null;
    }
  } catch (_) {}
  return null;
}

function _getOrCreateGuestTenantId() {
  if (typeof window === 'undefined') return null;
  try {
    let gid = localStorage.getItem('servex_guest_tenant_id');
    if (!gid) {
      gid = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID().slice(0, 12)
        : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('servex_guest_tenant_id', gid);
    }
    return gid;
  } catch (_) {
    return null;
  }
}

export function getActiveTenantKeySync() {
  const uid = getActiveUserIdSync();
  if (uid) return `General_Procces_${uid}`;
  if (typeof window === 'undefined') return 'General_Procces';
  const gid = _getOrCreateGuestTenantId();
  return gid ? `General_Procces_guest_${gid}` : 'General_Procces';
}

export async function getActiveTenantKey() {
  const syncUid = getActiveUserIdSync();
  if (syncUid) return `General_Procces_${syncUid}`;
  try {
    const { data } = await supabase.auth.getSession();
    const uid = data?.session?.user?.id || null;
    if (uid) {
      _cachedTenantUserId = uid;
      return `General_Procces_${uid}`;
    }
  } catch (_) {}
  if (typeof window === 'undefined') return 'General_Procces';
  const gid = _getOrCreateGuestTenantId();
  return gid ? `General_Procces_guest_${gid}` : 'General_Procces';
}

export function resolveTenantKeySync(companyName) {
  const raw = (companyName || '').trim();
  if (!raw || raw === 'General_Procces' || raw === 'General Process') {
    return getActiveTenantKeySync();
  }
  return raw;
}

export async function resolveTenantKey(companyName) {
  const raw = (companyName || '').trim();
  if (!raw || raw === 'General_Procces' || raw === 'General Process') {
    return await getActiveTenantKey();
  }
  return raw;
}

// Cliente para Clientes (Google / Customer Portal)
export const supabaseGoogle = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-customer-session', // Llave única para clientes externos
    persistSession: true,
    autoRefreshToken: true,
  }
});

//
// =======================
// AUTH (SOLO AZURE / TRABAJADORES)
// =======================
//

// 🔐 Login con Microsoft Entra ID (Azure)
export async function signInWithAzure() {
  // Usa la instancia 'supabase' (Trabajadores)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/xml-pipeline` : undefined,
    },
  });

  if (error) {
    console.error('❌ Error login Azure:', error);
    throw error;
  }
}

// 👤 Obtener user autenticado (TRABAJADORES)
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (error.message.includes('Auth session missing')) {
      return null;
    }
    console.error('❌ Error fetching user:', error);
    return null;
  }

  if (!data?.user) return null;

  const user = data.user;
  const email =
    user.email ||
    user.user_metadata?.email ||
    user.user_metadata?.preferred_username ||
    null;

  const provider = user.app_metadata?.provider;

  const isAzure = provider === 'azure';
  
  // Si el email es null (común en Azure si no se configura el scope de email), 
  // asumimos que es del tenant corporativo validado por Azure.
  const isAuthorizedDomain =
    email ? email.toLowerCase().endsWith('@servex-us.com') : true;

  if (!isAzure || !isAuthorizedDomain) {
    console.warn('🚫 Acceso denegado:', { email, provider });
    await supabase.auth.signOut();
    return null;
  }

  return {
    id: user.id,
    email,
    provider,
    raw: user,
  };
}

// 🔁 Escuchar cambios de sesión
export function subscribeToAuthState(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return subscription;
}

// 🚪 Logout (TRABAJADORES)
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('❌ Error al close sesión:', error);
  }
}

//
// =======================
// DATA
// =======================
//

export async function saveAuditToSupabase({ audit_content, user }) {
  if (!user?.id) {
    console.warn('⚠️ Auditoría sin user válido');
    return { data: null, error: 'NO_USER' };
  }

  const { data, error } = await supabase
    .from('auditorias')
    .insert([
      {
        audit_content: JSON.stringify(audit_content),
        user_id: user.id,
        user_email: user.email,
        provider: user.provider,
      },
    ])
    .select();

  if (error) {
    console.error('❌ Error saving audit:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Helper universal y transparente para resolver contenido de archivos pesados (XML, CSV, JSON).
 * Si el contenido inicia con '[STORAGE_URL]:' o 'http://' / 'https://', descargará el archivo del Bucket.
 * Si es texto crudo, lo retorna intacto (100% retrocompatible).
 */
export async function resolveStorageContent(contentOrUrl, fallbackUrl) {
  const target = contentOrUrl || fallbackUrl;
  if (!target) return '';
  const str = String(target).trim();
  if (str.startsWith('[STORAGE_URL]:') || str.startsWith('http://') || str.startsWith('https://')) {
    const cleanUrl = str.replace('[STORAGE_URL]:', '').trim();
    try {
      const res = await fetch(cleanUrl);
      if (res.ok) {
        return await res.text();
      }
    } catch (err) {
      console.warn('⚠️ Error al descargar archivo desde Supabase Storage:', err);
    }
  }
  return str;
}

// Alias de retrocompatibilidad exacta
export const resolveXmlContent = resolveStorageContent;

/**
 * Sube un archivo, Blob o String al bucket 'catalogs-storage' y retorna la URL pública.
 * @param {string|Blob|File} content - Contenido a subir.
 * @param {string} path - Ruta interna (ej: 'csv_matrices/General_Procces/csv_new.csv').
 * @param {string} mimeType - Tipo MIME (ej: 'text/csv', 'application/xml').
 * @returns {Promise<string|null>} - URL pública o null si hubo error.
 */
export async function uploadToCatalogsStorage(content, path, mimeType = 'text/plain') {
  try {
    const fileBody = typeof content === 'string'
      ? new Blob([content], { type: mimeType })
      : content;
    const { error } = await supabase.storage
      .from('catalogs-storage')
      .upload(path, fileBody, {
        upsert: true,
        contentType: mimeType,
      });
    if (error) throw error;
    const { data: pubData } = supabase.storage
      .from('catalogs-storage')
      .getPublicUrl(path);
    return pubData?.publicUrl || null;
  } catch (err) {
    console.error(`❌ Error subiendo archivo a catalogs-storage (${path}):`, err);
    return null;
  }
}

/**
 * Persiste datos en `ClientsSERVEX_General_Procces`:
 * - Si ya existe el registro de `company_name`, ejecuta `.update()` directo (evita 403 en re-subidas).
 * - Si la tabla está vacía (no existe aún el registro), ejecuta `.upsert()` / `.insert()` para crear la fila.
 */
export async function upsertGeneralProcessRecord(payload, companyName = 'General_Procces') {
  try {
    const cleanCompany = await resolveTenantKey(payload?.company_name || companyName);
    const updateFields = { ...payload };
    delete updateFields.company_name;
    delete updateFields.user_id;

    // 1. Localizar exclusivamente la fila perteneciente a este usuario/tenant
    let targetRowId = null;
    const { data: rowMatch } = await supabase
      .from('ClientsSERVEX_General_Procces')
      .select('id, company_name, user_id')
      .eq('company_name', cleanCompany)
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (rowMatch?.id) {
      targetRowId = rowMatch.id;
    }

    if (targetRowId) {
      if (!rowMatch.user_id) {
        const uid = getActiveUserIdSync();
        if (uid) updateFields.user_id = uid;
      }
      let { data, error } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .update(updateFields)
        .eq('id', targetRowId);

      if (error && 'csv_edit_raw' in updateFields) {
        const fallbackFields = { ...updateFields };
        delete fallbackFields.csv_edit_raw;
        if (Object.keys(fallbackFields).length > 0) {
          const retry = await supabase
            .from('ClientsSERVEX_General_Procces')
            .update(fallbackFields)
            .eq('id', targetRowId);
          data = retry.data;
          error = retry.error;
        }
      }

      return { data, error, rlsBypassed: false };
    }

    // 2. Si no existe la fila aún para este usuario/tenant, crearla con upsert
    const fullPayload = { ...payload, company_name: cleanCompany };
    if (!fullPayload.user_id) {
      const { data: sessionData } = await supabase.auth.getSession().catch(() => ({ data: {} }));
      const currentUserId = sessionData?.session?.user?.id || getActiveUserIdSync() || null;
      if (currentUserId) {
        fullPayload.user_id = currentUserId;
      }
    }

    let { data, error } = await supabase
      .from('ClientsSERVEX_General_Procces')
      .upsert(fullPayload, { onConflict: 'company_name' });

    if (error && 'csv_edit_raw' in fullPayload) {
      const fallbackPayload = { ...fullPayload };
      delete fallbackPayload.csv_edit_raw;
      const retry = await supabase
        .from('ClientsSERVEX_General_Procces')
        .upsert(fallbackPayload, { onConflict: 'company_name' });
      data = retry.data;
      error = retry.error;
    }

    return { data, error, rlsBypassed: false };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : String(err) },
      rlsBypassed: false
    };
  }
}

/**
 * Garantiza de forma proactiva e inmediata que la fila base para el usuario/tenant actual
 * exista en 'ClientsSERVEX_General_Procces' con todas sus columnas inicializadas.
 * Evita que la DB aparezca vacía al ingresar o reiniciar el proceso, y previene
 * cualquier retraso de montaje cuando el usuario envía su primera consulta al chat.
 */
export async function ensureGeneralProcessBaseRecord(companyName = 'General_Procces') {
  try {
    const cleanCompany = await resolveTenantKey(companyName);

    // 1. Verificación rápida de la fila existente (< 20ms) exclusiva de este usuario
    const { data: existing } = await supabase
      .from('ClientsSERVEX_General_Procces')
      .select('id, company_name')
      .eq('company_name', cleanCompany)
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      return existing;
    }

    // 2. Si no existe la fila para este usuario, montar de inmediato su estructura base aislada
    let userId = getActiveUserIdSync();
    if (!userId) {
      try {
        const { data: sData } = await supabase.auth.getSession().catch(() => ({ data: {} }));
        userId = sData?.session?.user?.id || null;
      } catch (_) {}
    }

    const baseRow = {
      company_name: cleanCompany,
      general_procces_chat: [],
      file_name: null,
      xml_name: null,
      xml_raw: null,
      XM_CET_import: null,
      csv_raw: null,
      csv_new_raw: null,
      csv_edit_raw: null,
      xml_actualizer_raw: null,
      xml_structure_context: null,
      audit_summary_markdown1: null,
      seguimiento_client: {
        company_name: cleanCompany,
        total_actions: 0,
        session_summary: 'Sesión iniciada. Estructura de base de datos lista.',
        events: [],
        pending_updates: []
      }
    };
    if (userId) {
      baseRow.user_id = userId;
    }

    const { data, error } = await supabase
      .from('ClientsSERVEX_General_Procces')
      .upsert(baseRow, { onConflict: 'company_name' })
      .select('id, company_name')
      .maybeSingle();

    if (error) {
      console.warn('[-] Advertencia en ensureGeneralProcessBaseRecord:', error);
    }
    return data || null;
  } catch (err) {
    console.warn('[-] Advertencia en ensureGeneralProcessBaseRecord:', err);
    return null;
  }
}
