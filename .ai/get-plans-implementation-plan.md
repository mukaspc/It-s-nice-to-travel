# API Endpoint Implementation Plan: GET /api/plans

## 1. Przegląd endpointu

Endpoint GET /api/plans umożliwia pobieranie listy planów podróży zalogowanego użytkownika z możliwością sortowania, paginacji i wyszukiwania. Implementacja musi zapewnić, że użytkownik ma dostęp wyłącznie do swoich planów, zgodnie z zasadami RLS zdefiniowanymi w bazie danych.

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/plans`
- **Parametry**:
  - **Opcjonalne**:
    - `sort`: Kierunek sortowania (`created_at.desc` [domyślnie], `created_at.asc`, `name.asc`, `name.desc`)
    - `limit`: Liczba wyników na stronę (domyślnie: 10)
    - `offset`: Przesunięcie paginacji (domyślnie: 0)
    - `search`: Wyszukiwanie po nazwie planu

## 3. Wykorzystywane typy

- **Typy wejściowe**: Nie dotyczy (parametry są przekazywane w URL)
- **Typy wyjściowe**:
  - `PlanListItemDTO`: Reprezentuje pojedynczy plan podróży w liście wyników
  - `PlanListResponseDTO`: Reprezentuje całą odpowiedź z paginacją

## 4. Szczegóły odpowiedzi

- **Kod sukcesu**: 200 OK
- **Format odpowiedzi**: JSON
- **Struktura odpowiedzi**:
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
- **Kody błędów**:
  - 401 Unauthorized: Użytkownik nie jest uwierzytelniony

## 5. Przepływ danych

1. Walidacja parametrów wejściowych
2. Pobranie ID zalogowanego użytkownika z sesji Supabase
3. Wykonanie zapytania do bazy danych:
   - Filtrowanie według `user_id` oraz `deleted_at IS NULL`
   - Zastosowanie parametru `search` (jeśli podany)
   - Zastosowanie parametru `sort` (lub domyślnego sortowania)
   - Policzenie całkowitej liczby wyników dla metadanych paginacji
   - Zastosowanie paginacji (`limit` i `offset`)
   - Policzenie liczby miejsc dla każdego planu (places_count)
4. Transformacja wyników do formatu `PlanListResponseDTO`
5. Zwrócenie odpowiedzi

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Wymagane uwierzytelnienie użytkownika poprzez Supabase Auth
- **Autoryzacja**: Wykorzystanie RLS w Supabase do zapewnienia, że użytkownik ma dostęp tylko do swoich planów
- **Walidacja danych wejściowych**:
  - Parametr `limit` powinien być liczbą naturalną i mieć rozsądne ograniczenie (np. maksymalnie 50)
  - Parametr `offset` powinien być liczbą naturalną
  - Parametr `sort` powinien być jednym z dozwolonych wartości
  - Parametr `search` powinien być zwalidowany pod kątem długości i znaków specjalnych

## 7. Obsługa błędów

- **401 Unauthorized**: Zwracany, gdy użytkownik nie jest zalogowany
- **400 Bad Request**: Zwracany w przypadku nieprawidłowych parametrów (może być zaimplementowany jako dodatkowy poziom walidacji)
- **500 Internal Server Error**: Zwracany w przypadku nieoczekiwanych błędów serwera

## 8. Rozważania dotyczące wydajności

- **Indeksowanie bazy danych**: Upewnij się, że kolumny używane do filtrowania, sortowania i wyszukiwania mają odpowiednie indeksy
- **Paginacja**: Ograniczenie liczby wyników na stronę zapobiega przeciążeniu bazy danych
- **Optymalizacja zapytań**: Użyj COUNT(\*) OVER() w jednym zapytaniu zamiast wykonywania osobnego zapytania dla liczby wyników
- **Buforowanie**: Rozważ buforowanie wyników dla często używanych kombinacji parametrów

## 9. Etapy wdrożenia

1. **Utworzenie pliku endpoint w katalogu `src/pages/api/plans/index.ts`**:

   - Wykorzystanie API Routes z Astro
   - Zaimportowanie niezbędnych typów i funkcji pomocniczych
   - Zdefiniowanie funkcji `get` implementującej handler endpointu

2. **Implementacja uwierzytelniania**:

   - Inicjalizacja klienta Supabase z kontekstu żądania
   - Pobranie sesji użytkownika z Supabase Auth
   - Weryfikacja czy użytkownik jest zalogowany, jeśli nie - zwrócenie kodu 401

3. **Implementacja walidacji parametrów zapytania**:

   - Pobranie parametrów z URL (`search`, `limit`, `offset`, `sort`)
   - Sanityzacja i konwersja wartości liczbowych
   - Walidacja wartości parametru `sort` względem dozwolonych opcji
   - Obsługa błędów walidacji (kod 400)

4. **Implementacja zapytania do bazy danych**:

   - Budowa zapytania do tabeli `generated_user_plans` z wykorzystaniem Supabase SDK
   - Dodanie relacji `places` z funkcją agregującą `count` dla policzenia miejsc
   - Implementacja filtrowania (`deleted_at IS NULL`)
   - Implementacja wyszukiwania (`ilike`) dla parametru `search`
   - Implementacja sortowania zgodnie z parametrem `sort`
   - Implementacja paginacji za pomocą metod `range` i `limit`
   - Obsługa błędów bazy danych

5. **Transformacja danych do odpowiedniego formatu DTO**:

   - Mapowanie wyników zapytania do tablicy obiektów `PlanListItemDTO`
   - Obliczenie metadanych paginacji (`total_count`, `page_count`)
   - Utworzenie obiektu odpowiedzi zgodnego z interfejsem `PlanListResponseDTO`

6. **Zwrócenie odpowiedzi HTTP**:

   - Serializacja obiektu odpowiedzi do formatu JSON
   - Ustawienie nagłówków odpowiedzi (Content-Type)
   - Ustawienie kodu statusu HTTP (200 dla sukcesu)

7. **Aktualizacja dokumentacji**:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia endpointu
   - Dokumentacja możliwych błędów i odpowiedzi
