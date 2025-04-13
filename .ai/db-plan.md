# Schemat bazy danych dla aplikacji "It's nice to travel"

## 1. Tabele, kolumny, typy danych i ograniczenia

### auth.users (zarządzane przez Supabase Auth)
Ta tabela jest automatycznie tworzona i zarządzana przez Supabase Auth.

### travel_preferences
Tabela przechowująca predefiniowane tagi preferencji podróży.
```sql
CREATE TABLE travel_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT travel_preferences_name_unique UNIQUE (name)
);

-- Automatyczne aktualizowanie pola updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON travel_preferences
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();
```

### generated_user_plans
Główna tabela przechowująca plany podróży utworzone przez użytkowników.
```sql
CREATE TYPE plan_status AS ENUM ('draft', 'generated');

CREATE TABLE generated_user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL CHECK (char_length(name) <= 100),
  people_count SMALLINT NOT NULL CHECK (people_count > 0 AND people_count <= 99),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  note TEXT CHECK (char_length(note) <= 2500),
  travel_preferences TEXT,
  status plan_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT date_range_check CHECK (end_date >= start_date)
);

-- Automatyczne aktualizowanie pola updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON generated_user_plans
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- Indeksy dla optymalizacji zapytań
CREATE INDEX idx_generated_user_plans_user_id ON generated_user_plans(user_id);
CREATE INDEX idx_generated_user_plans_created_at ON generated_user_plans(created_at);
CREATE INDEX idx_generated_user_plans_name ON generated_user_plans(name);
CREATE INDEX idx_generated_user_plans_deleted_at ON generated_user_plans(deleted_at);
```

### places
Tabela przechowująca miejsca dodane do planów podróży.
```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES generated_user_plans(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  note TEXT CHECK (char_length(note) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT date_range_check CHECK (end_date >= start_date)
);

-- Automatyczne aktualizowanie pola updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON places
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- Indeks dla zapytań związanych z planami
CREATE INDEX idx_places_plan_id ON places(plan_id);

-- Ograniczenie liczby miejsc na plan (maksymalnie 10)
CREATE OR REPLACE FUNCTION check_places_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM places WHERE plan_id = NEW.plan_id) > 10 THEN
    RAISE EXCEPTION 'Limit 10 miejsc na plan podróży został przekroczony';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_places_limit
BEFORE INSERT ON places
FOR EACH ROW
EXECUTE FUNCTION check_places_limit();
```

### generated_ai_plans
Tabela przechowująca wygenerowane przez AI szczegółowe plany podróży.
```sql
CREATE TABLE generated_ai_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES generated_user_plans(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT generated_ai_plans_plan_id_unique UNIQUE (plan_id)
);

-- Automatyczne aktualizowanie pola updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON generated_ai_plans
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- Indeks dla efektywnego wyszukiwania w strukturze JSON
CREATE INDEX idx_generated_ai_plans_content ON generated_ai_plans USING GIN (content);
```

## 2. Relacje między tabelami

1. **auth.users -> generated_user_plans** (jeden-do-wielu)
   - Jeden użytkownik może mieć wiele planów podróży
   - Klucz obcy: `generated_user_plans.user_id` odnosi się do `auth.users.id`

2. **generated_user_plans -> places** (jeden-do-wielu)
   - Jeden plan podróży może zawierać wiele miejsc
   - Klucz obcy: `places.plan_id` odnosi się do `generated_user_plans.id`
   - Ograniczenie liczby miejsc do maksymalnie 10 na plan

3. **generated_user_plans -> generated_ai_plans** (jeden-do-jednego)
   - Jeden plan podróży może mieć jeden wygenerowany plan AI
   - Klucz obcy: `generated_ai_plans.plan_id` odnosi się do `generated_user_plans.id`
   - Ograniczenie unikalności: `generated_ai_plans.plan_id` musi być unikalny

## 3. Indeksy

1. `idx_generated_user_plans_user_id` - optymalizacja zapytań filtrujących plany według użytkownika
2. `idx_generated_user_plans_created_at` - optymalizacja sortowania planów według daty utworzenia
3. `idx_generated_user_plans_name` - optymalizacja wyszukiwania planów po nazwie
4. `idx_generated_user_plans_deleted_at` - optymalizacja filtrowania usuniętych/nieusuwanych planów
5. `idx_places_plan_id` - optymalizacja zapytań dla miejsc związanych z konkretnym planem
6. `idx_generated_ai_plans_content` - indeks GIN dla efektywnego wyszukiwania w strukturze JSON

## 4. Zasady RLS (Row Level Security)

Poniżej znajdują się zasady RLS, które powinny zostać zastosowane w Supabase dla odpowiednich tabel:

### generated_user_plans
```sql
-- Włączenie RLS
ALTER TABLE generated_user_plans ENABLE ROW LEVEL SECURITY;

-- Zasada dla SELECT (odczyt tylko własnych planów)
CREATE POLICY "Users can view their own plans" ON generated_user_plans
FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Zasada dla INSERT (dodawanie tylko własnych planów)
CREATE POLICY "Users can insert their own plans" ON generated_user_plans
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Zasada dla UPDATE (aktualizacja tylko własnych planów)
CREATE POLICY "Users can update their own plans" ON generated_user_plans
FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Zasada dla DELETE (usuwanie tylko własnych planów - soft delete)
CREATE POLICY "Users can delete their own plans" ON generated_user_plans
FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);
```

### places
```sql
-- Włączenie RLS
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Zasada dla SELECT (odczyt miejsc tylko z własnych planów)
CREATE POLICY "Users can view places in their own plans" ON places
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM generated_user_plans
    WHERE id = places.plan_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- Zasada dla INSERT (dodawanie miejsc tylko do własnych planów)
CREATE POLICY "Users can insert places in their own plans" ON places
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM generated_user_plans
    WHERE id = places.plan_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- Zasada dla UPDATE (aktualizacja miejsc tylko w własnych planach)
CREATE POLICY "Users can update places in their own plans" ON places
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM generated_user_plans
    WHERE id = places.plan_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- Zasada dla DELETE (usuwanie miejsc tylko z własnych planów)
CREATE POLICY "Users can delete places in their own plans" ON places
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM generated_user_plans
    WHERE id = places.plan_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
);
```

### generated_ai_plans
```sql
-- Włączenie RLS
ALTER TABLE generated_ai_plans ENABLE ROW LEVEL SECURITY;

-- Zasada dla SELECT (odczyt planów AI tylko dla własnych planów)
CREATE POLICY "Users can view AI plans for their own plans" ON generated_ai_plans
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM generated_user_plans
    WHERE id = generated_ai_plans.plan_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- Zasada dla INSERT (dodawanie planów AI tylko do własnych planów)
CREATE POLICY "Users can insert AI plans for their own plans" ON generated_ai_plans
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM generated_user_plans
    WHERE id = generated_ai_plans.plan_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- Zasada dla UPDATE (aktualizacja planów AI tylko dla własnych planów)
CREATE POLICY "Users can update AI plans for their own plans" ON generated_ai_plans
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM generated_user_plans
    WHERE id = generated_ai_plans.plan_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- Zasada dla DELETE (usuwanie planów AI tylko dla własnych planów)
CREATE POLICY "Users can delete AI plans for their own plans" ON generated_ai_plans
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM generated_user_plans
    WHERE id = generated_ai_plans.plan_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
);
```

## 5. Funkcje pomocnicze

### Funkcja do aktualizacji pola updated_at
```sql
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Funkcja do soft delete
```sql
CREATE OR REPLACE FUNCTION soft_delete_plan()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_soft_delete
INSTEAD OF DELETE ON generated_user_plans
FOR EACH ROW
EXECUTE FUNCTION soft_delete_plan();
```

## 6. Inicjalizacja danych

### Predefiniowane tagi preferencji podróży
```sql
INSERT INTO travel_preferences (name, description) VALUES
('zwiedzanie_zabytkow', 'Zwiedzanie zabytków i historycznych miejsc'),
('muzea', 'Odwiedzanie muzeów i galerii sztuki'),
('ciekawe_miejsca', 'Odkrywanie nietypowych i unikalnych miejsc'),
('punkty_widokowe', 'Odkrywanie punków widokowych'),
('zaskakujace_miejsca', 'Odwiedzanie zaskakujących miejsc'),
('fotogeniczne_miejsca', 'Odwiedzanie fotogenicznych miejsc'),
('puby', 'Odwiedzanie pubów i barów'),
('restauracje', 'Odkrywanie lokalnej gastronomii'),
('odpoczynek', 'Relaks i odpoczynek');
('plazowanie', 'Plażowanie');
```

## 7. Dodatkowe uwagi

1. **Struktura dokumentu JSON dla wygenerowanych planów AI**
   Rekomendowana struktura dokumentu JSON dla pola `content` w tabeli `generated_ai_plans`:
   ```json
   {
     "version": "1.0",
     "places": [
       {
         "name": "Nazwa miejsca",
         "days": [
           {
             "date": "2025-04-12",
             "schedule": [
               {
                 "time": "09:00-11:00",
                 "activity": "Zwiedzanie X",
                 "address": "Adres atrakcji",
                 "description": "Opis atrakcji",
                 "image_url": "https://example.com/image.jpg"
               }
             ],
             "dining_recommendations": [
               {
                 "type": "lunch",
                 "name": "Nazwa restauracji",
                 "address": "Adres restauracji",
                 "description": "Opis restauracji",
                 "image_url": "https://example.com/image.jpg"
               }
             ]
           }
         ]
       }
     ]
   }
   ```

2. **Soft Delete**
   Implementacja soft delete dla `generated_user_plans` poprzez kolumnę `deleted_at`. 
   Wszystkie zasady RLS uwzględniają warunek `deleted_at IS NULL` aby zapewnić, że "usunięte" plany nie są dostępne dla użytkowników.

3. **Validacja dat**
   W tabelach `generated_user_plans` i `places` dodane są ograniczenia CHECK, które zapewniają, że data zakończenia jest późniejsza lub równa dacie rozpoczęcia.

4. **Bezpieczeństwo**
   Wszystkie tabele mają włączone Row Level Security (RLS) z odpowiednimi zasadami, które zapewniają, że użytkownicy mają dostęp tylko do własnych danych.

5. **Optymalizacja**
   - Indeksy na kolumnach używanych w zapytaniach filtrujących i sortujących
   - Indeks GIN dla efektywnego wyszukiwania w strukturze JSON
   - Ograniczenie liczby miejsc na plan do 10, zgodnie z wymaganiami

6. **Skalowanie**
   - Użycie UUID jako kluczy głównych zamiast sekwencyjnych identyfikatorów zapewnia lepszą dystrybucję danych w przypadku dużych ilości rekordów
   - Przechowywanie URL-i dla zdjęć zamiast obrazów bezpośrednio w bazie danych
   - Generowanie PDF na żądanie zamiast przechowywania ich w bazie
</rewritten_file> 