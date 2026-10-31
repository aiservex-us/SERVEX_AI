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
 * Persiste datos en `ClientsSERVEX_General_Procces` mediante UPDATE directo por `company_name`,
 * evitando el error HTTP 403 `new row violates row-level security policy (USING expression)`
 * que ocurre cuando se invoca `.upsert()` sobre una fila existente.
 */
export async function upsertGeneralProcessRecord(payload, companyName = 'General_Procces') {
  try {
    const cleanCompany = (payload?.company_name || companyName || 'General_Procces').trim();
    const updateFields = { ...payload };
    delete updateFields.company_name;
    delete updateFields.user_id;

    const { data, error } = await supabase
      .from('ClientsSERVEX_General_Procces')
      .update(updateFields)
      .eq('company_name', cleanCompany);

    return { data, error, rlsBypassed: false };
  } catch (err) {
    return { data: null, error: err, rlsBypassed: false };
  }
}
