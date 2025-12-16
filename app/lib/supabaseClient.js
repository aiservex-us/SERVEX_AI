// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zixyjbmaczqsitxubcbp.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHlqYm1hY3pxc2l0eHViY2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTIwNjEsImV4cCI6MjA2NjUyODA2MX0.u4NXFIyuxcCtgN925VfQwYgaPNzdNzfwMkrUkj0CyfI';
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