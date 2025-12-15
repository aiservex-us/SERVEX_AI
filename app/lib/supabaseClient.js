// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

//
// =======================
// CONFIGURACIÓN SUPABASE
// =======================
//

// 🔹 Project URL
const supabaseUrl = 'https://mdjalirluzzvanrcjead.supabase.co';

// 🔹 Publishable key (segura para frontend)
const supabaseAnonKey =
  'sb_publishable_I8pdJT2l9dXxMFwf0zEfpw_00Yo3vFC';

// 🔹 Cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

//
// =======================
// AUTH
// =======================
//

// 🔐 Login con Google
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) {
    console.error('❌ Error login Google:', error);
    throw error;
  }
}

// 🔐 Login con Microsoft (Azure)
export async function signInWithAzure() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
  });

  if (error) {
    console.error('❌ Error login Azure:', error);
    throw error;
  }
}

// 👤 Obtener usuario autenticado (CORREGIDO PARA AZURE)
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    console.error('❌ Error fetching user:', error);
    return null;
  }

  const user = data.user;

  // Normalizamos identidad (Google / Azure)
  return {
    id: user.id,
    email:
      user.email ||
      user.user_metadata?.email ||
      user.user_metadata?.preferred_username ||
      null,
    provider: user.app_metadata?.provider || null,
    raw: user, // por si necesitas todo el objeto
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

// 🚪 Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('❌ Error al cerrar sesión:', error);
  }
}

//
// =======================
// DATA
// =======================
//

// 💾 Guardar auditoría (ROBUSTO PARA AZURE)
export async function saveAuditToSupabase({ audit_content, user }) {
  if (!user?.id) {
    console.warn('⚠️ Auditoría sin usuario válido');
    return { data: null, error: 'NO_USER' };
  }

  const { data, error } = await supabase
    .from('auditorias')
    .insert([
      {
        audit_content: JSON.stringify(audit_content),
        user_id: user.id,
        user_email: user.email, // puede ser null (Azure)
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
