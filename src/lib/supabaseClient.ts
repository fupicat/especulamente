import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rqajdbmoinhxkzqtzidd.supabase.co";
const supabaseClientKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxYWpkYm1vaW5oeGt6cXR6aWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM4MTAwOTgsImV4cCI6MTk4OTM4NjA5OH0.FVrcO64NoUCn0r54bPiTvqQDSIOEbH7pk93y_m_kzI0";
export const supabase = createClient(supabaseUrl, supabaseClientKey);
