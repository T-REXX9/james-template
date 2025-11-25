
import { createClient } from '@supabase/supabase-js';

// Configuration
// NOTE: For local development, create a .env file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
// The URL provided in the prompt is used as default.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://fevdccbmjejkzyofzwpx.supabase.co';

// Using the provided key as default to ensure the app runs immediately without .env setup
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZldmRjY2JtamVqa3p5b2Z6d3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNzk3OTEsImV4cCI6MjA3OTY1NTc5MX0.FMUbzthMJ1H8325kHcPWPlkAxkdfKTuJkR-_WAUM3t4';

if (!supabaseAnonKey) {
  console.warn("Supabase Anon Key is missing! Check your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
