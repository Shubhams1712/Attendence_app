import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables at startup
const missingVars: string[] = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

if (missingVars.length > 0) {
  const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}. ` +
    'Please copy .env.example to .env and fill in your Supabase credentials from Settings > API in your Supabase dashboard.';
  console.error(errorMsg);
  // Show a meaningful error screen instead of crashing
  if (typeof document !== 'undefined') {
    document.getElementById('root')!.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;font-family:system-ui,sans-serif;background:#f9fafb;">
        <div style="max-width:480px;text-align:center;background:white;padding:2rem;border-radius:1rem;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
          <h1 style="font-size:1.25rem;font-weight:700;color:#111827;margin-bottom:0.5rem;">Configuration Error</h1>
          <p style="color:#6b7280;font-size:0.875rem;line-height:1.5;">${errorMsg}</p>
          <div style="margin-top:1.5rem;padding:1rem;background:#fef3c7;border-radius:0.75rem;text-align:left;">
            <p style="font-size:0.75rem;color:#92400e;font-weight:600;margin-bottom:0.5rem;">Setup Steps:</p>
            <ol style="font-size:0.75rem;color:#92400e;padding-left:1.25rem;line-height:2;">
              <li>Go to <a href="https://supabase.com/dashboard" style="color:#2563eb;">Supabase Dashboard</a></li>
              <li>Select your project → Settings → API</li>
              <li>Copy the Project URL and anon key</li>
              <li>Set them in Vercel → Settings → Environment Variables</li>
              <li>Redeploy the application</li>
            </ol>
          </div>
        </div>
      </div>
    `;
  }
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'placeholder-key'
);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
