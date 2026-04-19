// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// =======================
// CONFIGURACIÓN SUPABASE (PannelClient)
// =======================

// URL del proyecto jktxlojmqxkitnagljwz
const supabaseUrl = 'https://jktxlojmqxkitnagljwz.supabase.co';
// Tu nueva Anon Key de PannelClient
const supabaseAnonKey = 'sb_publishable_ErJWTHF6NQzrqzKj9HIw2w_68qijBMn';

/**
 * 💡 SOLUCIÓN PARA SEPARAR SESIONES:
 */

// Cliente para Trabajadores (Microsoft / Azure)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-worker-session', 
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Cliente para Clientes (Google / Customer Portal)
export const supabaseGoogle = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-customer-session', 
    persistSession: true,
    autoRefreshToken: true,
  }
});

// =======================
// AUTH (AZURE / TRABAJADORES)
// =======================

export async function signInWithAzure() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
  });
  if (error) {
    console.error('❌ Error login Azure:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;

  const user = data.user;
  const email = user.email || user.user_metadata?.email;
  const provider = user.app_metadata?.provider;

  // Validación para trabajadores de Servex
  const isAzure = provider === 'azure';
  const isAuthorizedDomain = email?.toLowerCase().endsWith('@servex-us.com');

  if (!isAzure || !isAuthorizedDomain) {
    await supabase.auth.signOut();
    return null;
  }

  return { id: user.id, email, provider, raw: user };
}

// =======================
// AUTH (GOOGLE / CLIENTES)
// =======================

export async function signInWithGoogle() {
    const { error } = await supabaseGoogle.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { access_type: 'offline', prompt: 'select_account' },
        redirectTo: `${window.location.origin}/Panel_Client`,
      },
    });
    if (error) throw error;
}

// Escuchar cambios (Usando el cliente de trabajadores por defecto)
export function subscribeToAuthState(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// =======================
// DATA
// =======================

export async function saveAuditToSupabase({ audit_content, user }) {
  if (!user?.id) return { data: null, error: 'NO_USER' };

  const { data, error } = await supabase
    .from('auditorias')
    .insert([{
        audit_content: JSON.stringify(audit_content),
        user_id: user.id,
        user_email: user.email,
        provider: user.provider,
    }])
    .select();

  return { data, error };
}