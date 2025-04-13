-- migration: 20250413150705_disable_policies.sql
-- description: disables all security policies for the "it's nice to travel" application

-- disable RLS policies for travel_preferences table
drop policy if exists "anon users can view travel preferences" on travel_preferences;
drop policy if exists "authenticated users can view travel preferences" on travel_preferences;

-- disable RLS policies for generated_user_plans table
drop policy if exists "anon users cannot view plans" on generated_user_plans;
drop policy if exists "authenticated users can view their own plans" on generated_user_plans;
drop policy if exists "anon users cannot insert plans" on generated_user_plans;
drop policy if exists "authenticated users can insert their own plans" on generated_user_plans;
drop policy if exists "anon users cannot update plans" on generated_user_plans;
drop policy if exists "authenticated users can update their own plans" on generated_user_plans;
drop policy if exists "anon users cannot delete plans" on generated_user_plans;
drop policy if exists "authenticated users can soft delete their own plans" on generated_user_plans;

-- disable RLS policies for places table
drop policy if exists "anon users cannot view places" on places;
drop policy if exists "authenticated users can view places in their own plans" on places;
drop policy if exists "anon users cannot insert places" on places;
drop policy if exists "authenticated users can insert places in their own plans" on places;
drop policy if exists "anon users cannot update places" on places;
drop policy if exists "authenticated users can update places in their own plans" on places;
drop policy if exists "anon users cannot delete places" on places;
drop policy if exists "authenticated users can delete places in their own plans" on places;

-- disable RLS policies for generated_ai_plans table
drop policy if exists "anon users cannot view ai plans" on generated_ai_plans;
drop policy if exists "authenticated users can view ai plans for their own plans" on generated_ai_plans;
drop policy if exists "anon users cannot insert ai plans" on generated_ai_plans;
drop policy if exists "authenticated users can insert ai plans for their own plans" on generated_ai_plans;
drop policy if exists "anon users cannot update ai plans" on generated_ai_plans;
drop policy if exists "authenticated users can update ai plans for their own plans" on generated_ai_plans;
drop policy if exists "anon users cannot delete ai plans" on generated_ai_plans;
drop policy if exists "authenticated users can delete ai plans for their own plans" on generated_ai_plans;

-- disable RLS on all tables
alter table travel_preferences disable row level security;
alter table generated_user_plans disable row level security;
alter table places disable row level security;
alter table generated_ai_plans disable row level security; 