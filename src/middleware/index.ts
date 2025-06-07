import { defineMiddleware } from "astro:middleware";

import { supabase } from "../db/supabase.client";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabase;
  return next();
});
