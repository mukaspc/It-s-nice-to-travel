-- Add estimated_time_remaining column to generated_ai_plans table
alter table generated_ai_plans
add column estimated_time_remaining integer;

-- Add comment to the column
comment on column generated_ai_plans.estimated_time_remaining is 'Estimated time remaining in seconds for plan generation'; 