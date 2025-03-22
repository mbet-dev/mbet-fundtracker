import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project URL and Anon Key
const supabaseUrl = 'https://qfedfbvlqkrhcpafhwtc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZWRmYnZscWtyaGNwYWZod3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTM0NjAsImV4cCI6MjA1NzcyOTQ2MH0.BzaqNnrI8m-CtcJJYF-3XEYiNQqyQPGcs_CSdJrml6I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
