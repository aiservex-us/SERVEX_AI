const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mdjalirluzzvanrcjead.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_I8pdJT2l9dXxMFwf0zEfpw_00Yo3vFC';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Get authenticated user
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('❌ Error fetching user:', error);
    return null;
  }
  return data.user;
}

// Save audit to Supabase
export async function saveAuditToSupabase({ audit_content, user_id }) {
  const { data, error } = await supabase
    .from('auditorias')
    .insert([{ audit_content: JSON.stringify(audit_content), user_id }])
    .select();

  if (error) {
    console.error('❌ Error saving audit:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// Subscribe to auth state changes
export function subscribeToAuthState(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}
