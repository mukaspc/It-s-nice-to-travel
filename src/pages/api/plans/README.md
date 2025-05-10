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
      "id": "uuid",
      "name": "string",
      "start_date": "date",
      "end_date": "date",
      "people_count": "integer",
      "note": "string",
      "travel_preferences": "string",
      "status": "draft|generated",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "places_count": "integer"
    }
  ],
  "meta": {
    "total_count": "integer",
    "page_count": "integer"
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