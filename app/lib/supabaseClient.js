// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

//
// =======================
// CONFIGURACIÓN SUPABASE
// =======================
//

// 🔹 Project URL (Tu URL de Supabase)
const supabaseUrl = 'https://mdjalirluzzvanrcjead.supabase.co';

// 🔹 Publishable key (Tu Anon Key)
const supabaseAnonKey =
  'sb_publishable_I8pdJT2l9dXxMFwf0zEfpw_00Yo3vFC';

// 🔹 Cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

//
// =======================
// AUTH (SOLO AZURE)
// =======================
//

// 🔐 Login con Microsoft Entra ID (Azure)
export async function signInWithAzure() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
  });

  if (error) {
    console.error('❌ Error login Azure:', error);
    throw error;
  }
}

// 👤 Obtener usuario autenticado
// 🔒 VALIDADO PARA AZURE + DOMINIO CORPORATIVO
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    console.error('❌ Error fetching user:', error);
    return null;
  }

  const user = data.user;

  // 📧 Azure puede enviar el email en distintos campos
  const email =
    user.email ||
    user.user_metadata?.email ||
    user.user_metadata?.preferred_username ||
    null;

  const provider = user.app_metadata?.provider;

  // 🔐 VALIDACIONES DE SEGURIDAD
  const isAzure = provider === 'azure';
  // >>> REGLA DE DOMINIO: SOLO @servex-us.com
  const isAuthorizedDomain =
    email && email.toLowerCase().endsWith('@servex-us.com');

  if (!isAzure || !isAuthorizedDomain) {
    console.warn(
      '🚫 Acceso denegado:',
      { email, provider }
    );

    // Cerramos sesión inmediatamente si no cumple con la regla de negocio
    await supabase.auth.signOut();
    return null;
  }

  // ✅ Usuario válido
  return {
    id: user.id,
    email,
    provider,
    raw: user, // objeto completo por si se necesita
  };
}

// 🔁 Escuchar cambios de sesión (opcional pero útil)
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