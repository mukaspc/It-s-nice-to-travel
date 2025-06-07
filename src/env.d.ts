/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
      };
      supabase: SupabaseClient<Database>;
    }
  }
}

declare module "react" {
  interface Attributes {
    "client:load"?: boolean;
    "client:idle"?: boolean;
    "client:visible"?: boolean;
    "client:media"?: string;
    "client:only"?: boolean | string;
  }
}

type HTMLAttributes = astroHTML.JSX.HTMLAttributes;
type AstroBuiltinAttributes = astroHTML.JSX.AstroBuiltinAttributes;

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
