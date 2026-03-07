import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Vite utiliza import.meta.env en lugar de process.env
const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

// Verificación simple para saber si las variables cargaron
if (!openAIKey || !supabaseUrl || !supabaseKey) {
  console.error("Error: Variables de entorno no encontradas. Revisa tu archivo .env");
}

export const openai = new OpenAI({
    apiKey: openAIKey,
    dangerouslyAllowBrowser: true 
});

export const supabase = createClient(supabaseUrl, supabaseKey);
