import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;

if (!supabaseUrl) throw new Error("Missing SUPABASE_URL");
if (!supabaseKey) throw new Error("Missing SUPABASE_KEY");

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const DEFAULT_USER_ID = "22e13af7-1b84-4542-9ecc-d347dbd4bb05";
