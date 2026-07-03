import { createClient } from '@supabase/supabase-js';

// Replace these with the links Jerish sent you
const supabaseUrl = 'https://mhrxiohoiffmrirpwdnd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocnhpb2hvaWZmbXJpcnB3ZG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Nzc5MTksImV4cCI6MjA5ODU1MzkxOX0.RRrfpt1-prTKeXj7IP7yDqdVQet_9HUhKb4SUWKkJug';

export const supabase = createClient(supabaseUrl, supabaseKey);