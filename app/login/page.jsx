import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdjalirluzzvanrcjead.supabase.co';
const supabaseAnonKey =
  'sb_publishable_I8pdJT2l9dXxMFwf0zEfpw_00Yo3vFC';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// =======================
// AUTH HELPERS
// =======================

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) return null;

  const user = data.user;

  const email =
    user.email ||
    user.user_metadata?.email ||
    user.user_metadata?.preferred_username ||
    null;

  const provider = user.app_metadata?.provider;

  const isAzure = provider === 'azure';
  const isAuthorizedDomain =
    email?.toLowerCase().endsWith('@servex-us.com');

  if (!isAzure || !isAuthorizedDomain) {
    await supabase.auth.signOut();
    return null;
  }

  return {
    id: user.id,
    email,
    provider,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
}
