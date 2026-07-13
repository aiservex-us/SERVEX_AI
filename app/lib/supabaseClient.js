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
  const isAuthorizedDomain =
    email && email.toLowerCase().endsWith('@servex-us.com');

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