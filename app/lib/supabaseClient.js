// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// =======================
// CONFIGURACIÓN SUPABASE
// =======================

// 🔹 Project URL (TU PROYECTO REAL)
const supabaseUrl = 'https://mdjalirluzzvanrcjead.supabase.co';

// 🔹 Publishable key (SEGURO PARA FRONTEND)
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

// 👤 Obtener usuario autenticado
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('❌ Error fetching user:', error);
    return null;
  }

  return data.user;
}

// 🔁 Escuchar cambios de sesión (login / logout)
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

// 💾 Guardar auditoría
export async function saveAuditToSupabase({ audit_content, user_id }) {
  const { data, error } = await supabase
    .from('auditorias')
    .insert([
      {
        audit_content: JSON.stringify(audit_content),
        user_id,
      },
    ])
    .select();

  if (error) {
    console.error('❌ Error saving audit:', error);
    return { data: null, error };
  }

  return { data, error: null };
}
