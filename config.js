// ============================================================
//  LinkVault - Supabase Configuration
// ============================================================

const SUPABASE_URL      = "https://jmldcskcyotoicrlmgui.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbGRjc2tjeW90b2ljcmxtZ3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNDI4MDMsImV4cCI6MjEwODcxODgwM30.nrWBsG7k8-iaMgOWspkqr5BaCner72zmCo1gzp6JcG0";

// Inisialisasi Supabase client
// - persistSession: true  → session tetap ada walau tab ditutup
// - autoRefreshToken: true → token auto-refresh sebelum expired
let supabaseClient = null;

if (typeof supabase !== "undefined") {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession:   true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}
