import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjzebsuwajuhqbvsjeaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqemVic3V3YWp1aHFidnNqZWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYxODcsImV4cCI6MjA2NDI4MjE4N30.3YWMMvkK_7q7E4ojShmHd5P76HHCgJhL5pYrXyTLC3c';

export const supabase = createClient(supabaseUrl, supabaseKey);
