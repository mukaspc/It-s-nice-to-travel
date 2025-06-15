# API Endpoint: GET /api/plans

## Przegląd

Endpoint `GET /api/plans` umożliwia pobieranie listy planów podróży użytkownika. Implementacja zapewnia dostęp użytkownika wyłącznie do jego własnych planów, zgodnie z zasadami RLS zdefiniowanymi w bazie danych.

## Szczegóły żądania

- **Metoda HTTP**: GET
- **URL**: `/api/plans`
- **Parametry zapytania**:
  - `sort` (opcjonalny): Kierunek sortowania wyników
    - Dozwolone wartości: `created_at.desc` (domyślnie), `created_at.asc`, `name.asc`, `name.desc`
  - `limit` (opcjonalny): Liczba wyników na stronę (domyślnie: 10, maksymalnie: 50)
  - `offset` (opcjonalny): Przesunięcie paginacji (domyślnie: 0)
  - `search` (opcjonalny): Wyszukiwanie planów po nazwie

## Odpowiedź

### Sukces (200 OK)

```json
{
  "data": [
    {
      "id": "string (uuid)",
      "name": "string",
      "start_date": "string (format daty)",
      "end_date": "string (format daty)",
      "people_count": 1,
      "note": "string | null",
      "travel_preferences": "string | null",
      "status": "draft|generated",
      "created_at": "string (timestamp)",
      "updated_at": "string (timestamp)",
      "places_count": 0
    }
  ],
  "meta": {
    "total_count": 0,
    "page_count": 0
  }
}
```

### Nieprawidłowe parametry (400 Bad Request)

```json
{
  "error": "Invalid query parameters",
  "details": {
    // Szczegóły błędów walidacji
  }
}
```

### Niepoprawna autoryzacja (401 Unauthorized) - tylko w rzeczywistym środowisku

```json
{
  "error": "Unauthorized"
}
```

### Błąd serwera (500 Internal Server Error)

```json
{
  "error": "Internal server error"
}
```

## Przykłady użycia

### Pobieranie wszystkich planów z domyślnym sortowaniem

```
GET /api/plans
```

### Wyszukiwanie planów zawierających w nazwie "wakacje"

```
GET /api/plans?search=wakacje
```

### Sortowanie planów alfabetycznie według nazwy

```
GET /api/plans?sort=name.asc
```

### Pobieranie drugiej strony wyników (po 5 wyników na stronę)

```
GET /api/plans?limit=5&offset=5
```

## Uwagi implementacyjne

- Endpoint wykorzystuje Supabase jako bazę danych i zapewnia filtrowanie według `user_id` oraz `deleted_at IS NULL`.
- Obsługa paginacji jest zaimplementowana za pomocą parametrów `limit` i `offset`.
- Metadane paginacji zawierają całkowitą liczbę wyników (`total_count`) oraz liczbę stron (`page_count`).
- Pole `places_count` dla każdego planu jest obliczane jako liczba miejsc powiązanych z danym planem.

# API Endpoint: POST /api/plans

## Przegląd

Endpoint `POST /api/plans` umożliwia tworzenie nowego planu podróży przez zalogowanego użytkownika. Plan jest zapisywany w bazie danych Supabase z domyślnym statusem "draft".

## Szczegóły żądania

- **Metoda HTTP**: POST
- **URL**: `/api/plans`
- **Body**:
  ```json
  {
    "name": "string",
    "start_date": "string (format daty)",
    "end_date": "string (format daty)",
    "people_count": 1,
    "note": "string (opcjonalnie)",
    "travel_preferences": "string (opcjonalnie)"
  }
  ```

### Walidacja danych

- `name`: Wymagane, maksymalnie 100 znaków
- `start_date`: Wymagane, prawidłowa data
- `end_date`: Wymagane, prawidłowa data, musi być równa lub późniejsza niż `start_date`
- `people_count`: Wymagane, liczba całkowita między 1 a 99
- `note`: Opcjonalne, maksymalnie 2500 znaków
- `travel_preferences`: Opcjonalne

## Odpowiedź

### Sukces (201 Created)

```json
{
  "id": "string (uuid)",
  "name": "string",
  "start_date": "string (format daty)",
  "end_date": "string (format daty)",
  "people_count": 1,
  "note": "string | null",
  "travel_preferences": "string | null",
  "status": "draft",
  "created_at": "string (timestamp)",
  "updated_at": "string (timestamp)"
}
```

### Nieprawidłowe dane (422 Unprocessable Entity)

```json
{
  "error": "Validation error",
  "details": {
    // Szczegóły błędów walidacji dla poszczególnych pól
  }
}
```

### Konflikt (409 Conflict)

```json
{
  "error": "Plan with this name already exists",
  "details": "string"
}
```

### Niepoprawny format JSON (400 Bad Request)

```json
{
  "error": "Invalid JSON in request body"
}
```

### Niepoprawna autoryzacja (401 Unauthorized)

```json
{
  "error": "Unauthorized - user not authenticated"
}
```

### Błąd serwera (500 Internal Server Error)

```json
{
  "error": "Failed to create plan",
  "code": "string",
  "message": "An error occurred while saving the plan"
}
```

## Przykłady użycia

### Tworzenie nowego planu podróży

```
POST /api/plans
Content-Type: application/json

{
  "name": "Wakacje w Grecji",
  "start_date": "2023-07-15",
  "end_date": "2023-07-25",
  "people_count": 2,
  "note": "Chcemy zwiedzić Ateny i okoliczne wyspy",
  "travel_preferences": "Plaża, zwiedzanie zabytków, lokalna kuchnia"
}
```

## Uwagi implementacyjne

- Endpoint wymaga uwierzytelnienia użytkownika poprzez Supabase Auth.
- Podczas tworzenia planu, status jest automatycznie ustawiany na `draft`.
- Endpoint zwraca pełny obiekt utworzonego planu, zgodnie z typem `PlanDTO`.
- Implementacja obsługuje różne rodzaje błędów bazy danych, zwracając odpowiednie kody HTTP.
