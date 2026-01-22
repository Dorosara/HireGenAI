import { createClient } from '@supabase/supabase-js';

// Configuration for Supabase Project: HireGenAI
const SUPABASE_URL = 'https://hyiyawpvsslmxjpfbiio.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5aXlhd3B2c3NsbXhqcGZiaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNjg5MjcsImV4cCI6MjA4NDY0NDkyN30.9fQ9_LB7m5oiPE9t29LmOBINle58Mvo1Hvn1p8FKOnM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);