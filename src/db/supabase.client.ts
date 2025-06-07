import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

if (!supabaseUrl) throw new Error("Missing SUPABASE_URL");
if (!supabaseAnonKey) throw new Error("Missing SUPABASE_KEY");

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const DEFAULT_USER_ID = "85796a66-b8d6-4d2c-bee8-86f118a946e9";
