
import { createClient } from '@supabase/supabase-js';

// URL e Chave Anonimizada conforme configuração do projeto BRz RP
const supabaseUrl = 'https://zcnkmydaqwwndsbnkkdo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbmtteWRhcXd3bmRzYm5ra2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjk5NTUsImV4cCI6MjA4NTIwNTk1NX0.ebgizrgNrJ35FEyrClw8jQffoKO08xPHWbXcL7yr6pQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
