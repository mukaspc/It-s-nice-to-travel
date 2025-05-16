# API Endpoint Implementation Plan: POST /api/plans

## 1. Przegląd endpointu
Endpoint POST /api/plans umożliwia tworzenie nowego planu podróży przez zalogowanego użytkownika. Plan jest zapisywany w bazie danych Supabase z domyślnym statusem "draft". Implementacja zapewnia poprawną walidację danych wejściowych oraz bezpieczeństwo dostępu.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/plans`
- **Parametry**: Brak parametrów URL
- **Request Body**:
  ```json
  {
    "name": "string",
    "start_date": "date",
    "end_date": "date",
    "people_count": "integer",
    "note": "string",
    "travel_preferences": "string"
  }
  ```
  - **Wymagane pola**: `name`, `start_date`, `end_date`, `people_count`
  - **Opcjonalne pola**: `note`, `travel_preferences`

## 3. Wykorzystywane typy
- **Typy wejściowe**:
  - `CreatePlanCommandDTO`: Reprezentuje dane wejściowe do utworzenia planu
- **Typy wyjściowe**:
  - `PlanDTO`: Reprezentuje utworzony plan zwracany w odpowiedzi

## 4. Szczegóły odpowiedzi
- **Kod sukcesu**: 201 Created
- **Format odpowiedzi**: JSON
- **Struktura odpowiedzi**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "start_date": "date",
    "end_date": "date",
    "people_count": "integer",
    "note": "string",
    "travel_preferences": "string",
    "status": "draft",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Kody błędów**:
  - 400 Bad Request: Nieprawidłowe dane w żądaniu
  - 401 Unauthorized: Użytkownik nie jest zalogowany
  - 422 Unprocessable Entity: Błędy walidacji (np. data zakończenia < data rozpoczęcia)
  - 500 Internal Server Error: Błąd serwera podczas przetwarzania żądania

## 5. Przepływ danych
1. Odebranie żądania HTTP POST na endpoint `/api/plans`
2. Uwierzytelnienie użytkownika za pomocą middleware Supabase
3. Parsowanie i walidacja danych wejściowych za pomocą schematu Zod
4. Zapis nowego planu w bazie danych:
   - Dodanie identyfikatora użytkownika (`user_id`)
   - Ustawienie statusu na `draft`
   - Ustawienie timestampów `created_at` i `updated_at`
5. Zwrócenie utworzonego planu jako odpowiedzi z kodem statusu 201

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wymagane uwierzytelnienie użytkownika poprzez Supabase Auth
- **Autoryzacja**: Wykorzystanie RLS w Supabase do zapewnienia poprawnego zapisania planu
- **Walidacja danych wejściowych**:
  - Pole `name`: Niepuste, maksymalnie 100 znaków
  - Pole `people_count`: Liczba całkowita między 1 a 99
  - Pole `start_date`: Wymagana poprawna data
  - Pole `end_date`: Wymagana poprawna data, musi być >= start_date
  - Pole `note`: Opcjonalne, maksymalnie 2500 znaków
  - Pole `travel_preferences`: Opcjonalne

## 7. Obsługa błędów
- **401 Unauthorized**: Zwracany, gdy użytkownik nie jest zalogowany
- **400 Bad Request**: Zwracany w przypadku nieprawidłowego formatu JSON
- **422 Unprocessable Entity**: Zwracany gdy dane nie przechodzą walidacji (np. nieprawidłowa relacja dat)
- **500 Internal Server Error**: Zwracany w przypadku nieoczekiwanych błędów serwera lub bazy danych

## 8. Rozważania dotyczące wydajności
- **Indeksowanie bazy danych**: Upewnij się, że tabela `generated_user_plans` ma odpowiednie indeksy
- **Walidacja po stronie klienta**: Zaimplementuj dodatkową walidację w formularzu frontendowym
- **Minimalizacja obciążenia bazy danych**: Jednoczesne wykonanie operacji insert i select za pomocą metody `.insert().select().single()`

## 9. Etapy wdrożenia
1. **Rozszerzenie istniejącego pliku endpoint w katalogu `src/pages/api/plans/index.ts`**:
   - Zachowanie istniejącej funkcji GET
   - Dodanie funkcji POST implementującej handler endpointu
   - Wyłączenie prerenderowania za pomocą `export const prerender = false`

2. **Implementacja schematu walidacji danych wejściowych**:
   - Wykorzystanie biblioteki Zod do definiowania schematu
   - Implementacja reguły refinement dla sprawdzenia relacji dat
   - Zdefiniowanie ograniczeń dla poszczególnych pól zgodnie z wymaganiami

3. **Implementacja uwierzytelniania**:
   - Pobranie klienta Supabase z kontekstu żądania
   - Weryfikacja czy użytkownik jest zalogowany (przez wywołanie `supabase.auth.getUser()`)
   - Zwrócenie kodu 401 jeśli użytkownik nie jest zalogowany

4. **Implementacja parsowania i walidacji danych wejściowych**:
   - Wykorzystanie metody `request.json()` do parsowania ciała żądania
   - Obsługa wyjątków przy parsowaniu JSON
   - Walidacja danych wejściowych za pomocą zdefiniowanego schematu Zod
   - Zwrócenie odpowiednich komunikatów błędu dla nieprawidłowych danych

5. **Implementacja zapisania planu w bazie danych**:
   - Wykorzystanie metody `supabase.from("generated_user_plans").insert()`
   - Przygotowanie danych do zapisu z uzupełnieniem ID użytkownika i statusu
   - Pobranie utworzonego planu za pomocą metody `.select().single()`
   - Obsługa błędów bazy danych

6. **Przygotowanie i zwrócenie odpowiedzi**:
   - Mapowanie danych z bazy do obiektu odpowiadającego typowi `PlanDTO`
   - Ustawienie kodu statusu 201 Created
   - Ustawienie właściwego nagłówka Content-Type

7. **Aktualizacja dokumentacji**:
   - Utworzenie dokumentacji w pliku README.md dla endpointu POST /api/plans
   - Dodanie przykładów użycia endpointu
   - Dokumentacja możliwych błędów i odpowiedzi
