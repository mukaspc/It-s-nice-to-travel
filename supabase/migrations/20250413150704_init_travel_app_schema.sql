-- migration: 20250413150704_init_travel_app_schema.sql
-- description: initializes the schema for the "it's nice to travel" application
-- creates tables: travel_preferences, generated_user_plans, places, generated_ai_plans
-- creates security policies and helper functions for all tables

-- helper functions
create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- travel preferences table
create table travel_preferences (
  id uuid primary key default uuid_generate_v4(),
  name varchar(50) not null,
  description text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint travel_preferences_name_unique unique (name)
);

-- automatically update the updated_at field
create trigger set_updated_at
before update on travel_preferences
for each row
execute function trigger_set_updated_at();

-- enable rls
alter table travel_preferences enable row level security;

-- rls policies for travel_preferences - public read-only access
comment on table travel_preferences is 'Pre-defined travel preference tags that users can select for their travel plans';

-- anon users can only view travel preferences
create policy "anon users can view travel preferences" 
on travel_preferences for select 
to anon
using (true);

-- authenticated users can view travel preferences
create policy "authenticated users can view travel preferences" 
on travel_preferences for select 
to authenticated
using (true);

-- plan status enum
create type plan_status as enum ('draft', 'generated');

-- user plans table
create table generated_user_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(100) not null check (char_length(name) <= 100),
  people_count smallint not null check (people_count > 0 and people_count <= 99),
  start_date date not null,
  end_date date not null,
  note text check (char_length(note) <= 2500),
  travel_preferences text,
  status plan_status not null default 'draft',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  deleted_at timestamp with time zone,
  constraint date_range_check check (end_date >= start_date)
);

comment on table generated_user_plans is 'User-created travel plans with basic information';

-- automatically update the updated_at field
create trigger set_updated_at
before update on generated_user_plans
for each row
execute function trigger_set_updated_at();

-- indexes for query optimization
create index idx_generated_user_plans_user_id on generated_user_plans(user_id);
create index idx_generated_user_plans_created_at on generated_user_plans(created_at);
create index idx_generated_user_plans_name on generated_user_plans(name);
create index idx_generated_user_plans_deleted_at on generated_user_plans(deleted_at);

-- enable rls
alter table generated_user_plans enable row level security;

-- rls policies for user plans

-- select policies
create policy "anon users cannot view plans" 
on generated_user_plans for select 
to anon
using (false);

create policy "authenticated users can view their own plans" 
on generated_user_plans for select 
to authenticated
using (auth.uid() = user_id and deleted_at is null);

-- insert policies
create policy "anon users cannot insert plans" 
on generated_user_plans for insert 
to anon
with check (false);

create policy "authenticated users can insert their own plans" 
on generated_user_plans for insert 
to authenticated
with check (auth.uid() = user_id);

-- update policies
create policy "anon users cannot update plans" 
on generated_user_plans for update 
to anon
using (false);

create policy "authenticated users can update their own plans" 
on generated_user_plans for update 
to authenticated
using (auth.uid() = user_id and deleted_at is null);

-- delete policies
create policy "anon users cannot delete plans" 
on generated_user_plans for delete 
to anon
using (false);

create policy "authenticated users can soft delete their own plans" 
on generated_user_plans for update 
to authenticated
using (auth.uid() = user_id and deleted_at is null)
with check (auth.uid() = user_id);

-- places table
create table places (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references generated_user_plans(id) on delete cascade,
  name varchar(100) not null,
  start_date date not null,
  end_date date not null,
  note text check (char_length(note) <= 500),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint date_range_check check (end_date >= start_date)
);

comment on table places is 'Specific destinations within a travel plan';

-- automatically update the updated_at field
create trigger set_updated_at
before update on places
for each row
execute function trigger_set_updated_at();

-- index for plan relationship queries
create index idx_places_plan_id on places(plan_id);

-- enable rls
alter table places enable row level security;

-- place limit constraint function
create or replace function check_places_limit()
returns trigger as $$
begin
  if (select count(*) from places where plan_id = new.plan_id) > 10 then
    raise exception 'limit of 10 places per travel plan has been exceeded';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_places_limit
before insert on places
for each row
execute function check_places_limit();

-- rls policies for places

-- select policies
create policy "anon users cannot view places" 
on places for select 
to anon
using (false);

create policy "authenticated users can view places in their own plans" 
on places for select 
to authenticated
using (
  exists (
    select 1 from generated_user_plans
    where id = places.plan_id
    and user_id = auth.uid()
    and deleted_at is null
  )
);

-- insert policies
create policy "anon users cannot insert places" 
on places for insert 
to anon
with check (false);

create policy "authenticated users can insert places in their own plans" 
on places for insert 
to authenticated
with check (
  exists (
    select 1 from generated_user_plans
    where id = places.plan_id
    and user_id = auth.uid()
    and deleted_at is null
  )
);

-- update policies
create policy "anon users cannot update places" 
on places for update 
to anon
using (false);

create policy "authenticated users can update places in their own plans" 
on places for update 
to authenticated
using (
  exists (
    select 1 from generated_user_plans
    where id = places.plan_id
    and user_id = auth.uid()
    and deleted_at is null
  )
);

-- delete policies
create policy "anon users cannot delete places" 
on places for delete 
to anon
using (false);

create policy "authenticated users can delete places in their own plans" 
on places for delete 
to authenticated
using (
  exists (
    select 1 from generated_user_plans
    where id = places.plan_id
    and user_id = auth.uid()
    and deleted_at is null
  )
);

-- generated ai plans table
create table generated_ai_plans (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references generated_user_plans(id) on delete cascade,
  content jsonb not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint generated_ai_plans_plan_id_unique unique (plan_id)
);

comment on table generated_ai_plans is 'AI-generated detailed travel itineraries linked to user plans';

-- automatically update the updated_at field
create trigger set_updated_at
before update on generated_ai_plans
for each row
execute function trigger_set_updated_at();

-- index for json searching
create index idx_generated_ai_plans_content on generated_ai_plans using gin (content);

-- enable rls
alter table generated_ai_plans enable row level security;

-- rls policies for ai plans

-- select policies
create policy "anon users cannot view ai plans" 
on generated_ai_plans for select 
to anon
using (false);

create policy "authenticated users can view ai plans for their own plans" 
on generated_ai_plans for select 
to authenticated
using (
  exists (
    select 1 from generated_user_plans
    where id = generated_ai_plans.plan_id
    and user_id = auth.uid()
    and deleted_at is null
  )
);

-- insert policies
create policy "anon users cannot insert ai plans" 
on generated_ai_plans for insert 
to anon
with check (false);

create policy "authenticated users can insert ai plans for their own plans" 
on generated_ai_plans for insert 
to authenticated
with check (
  exists (
    select 1 from generated_user_plans
    where id = generated_ai_plans.plan_id
    and user_id = auth.uid()
    and deleted_at is null
  )
);

-- update policies
create policy "anon users cannot update ai plans" 
on generated_ai_plans for update 
to anon
using (false);

create policy "authenticated users can update ai plans for their own plans" 
on generated_ai_plans for update 
to authenticated
using (
  exists (
    select 1 from generated_user_plans
    where id = generated_ai_plans.plan_id
    and user_id = auth.uid()
    and deleted_at is null
  )
);

-- delete policies
create policy "anon users cannot delete ai plans" 
on generated_ai_plans for delete 
to anon
using (false);

create policy "authenticated users can delete ai plans for their own plans" 
on generated_ai_plans for delete 
to authenticated
using (
  exists (
    select 1 from generated_user_plans
    where id = generated_ai_plans.plan_id
    and user_id = auth.uid()
    and deleted_at is null
  )
);

-- soft delete function
create or replace function soft_delete_plan()
returns trigger as $$
begin
  update generated_user_plans set deleted_at = now() where id = old.id;
  return null; -- prevents the actual deletion from happening
end;
$$ language plpgsql;

create trigger trigger_soft_delete
before delete on generated_user_plans
for each row
execute function soft_delete_plan();

-- initial data for travel preferences
insert into travel_preferences (name, description) values
('zwiedzanie_zabytkow', 'Zwiedzanie zabytków i historycznych miejsc'),
('muzea', 'Odwiedzanie muzeów i galerii sztuki'),
('ciekawe_miejsca', 'Odkrywanie nietypowych i unikalnych miejsc'),
('punkty_widokowe', 'Odkrywanie punków widokowych'),
('zaskakujace_miejsca', 'Odwiedzanie zaskakujących miejsc'),
('fotogeniczne_miejsca', 'Odwiedzanie fotogenicznych miejsc'),
('puby', 'Odwiedzanie pubów i barów'),
('restauracje', 'Odkrywanie lokalnej gastronomii'),
('odpoczynek', 'Relaks i odpoczynek'),
('plazowanie', 'Plażowanie'); 