# API Endpoint Implementation Plan: POST /api/plans/{planId}/generate

## 1. Przegląd punktu końcowego

Endpoint inicjuje asynchroniczny proces generowania szczegółowego planu podróży przez AI na podstawie istniejącego planu użytkownika. Proces jest asynchroniczny ze względu na potencjalnie długi czas generowania i zwraca natychmiastowe potwierdzenie rozpoczęcia procesu wraz z szacowanym czasem ukończenia.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: `/api/plans/{planId}/generate`
- Parametry:
  - Wymagane: `planId` (UUID w ścieżce URL)
  - Opcjonalne: brak
- Request Body: brak

## 3. Wykorzystywane typy

```typescript
// Response DTOs
interface GeneratePlanResponseDTO {
  id: string;
  status: "processing";
  estimated_time: number;
}

// Internal DTOs
interface GeneratedPlanContentDTO {
  version: string;
  places: PlacePlanDTO[];
}

interface GeneratedPlanDTO {
  id: string;
  content: GeneratedPlanContentDTO;
  created_at: string;
  updated_at: string;
}

// Command Models
interface GeneratePlanCommand {
  planId: string;
  userId: string;
}
```

## 4. Szczegóły odpowiedzi

Sukces (202 Accepted):

```json
{
  "id": "uuid",
  "status": "processing",
  "estimated_time": 90 // seconds
}
```

Kody błędów:

- 400 Bad Request: Brak wymaganych danych w planie
- 401 Unauthorized: Brak autentykacji
- 403 Forbidden: Brak dostępu do planu
- 404 Not Found: Plan nie istnieje
- 409 Conflict: Generowanie już w toku
- 500 Internal Server Error: Błąd wewnętrzny

## 5. Przepływ danych

1. Walidacja żądania i autoryzacja
2. Pobranie planu z bazy danych
3. Sprawdzenie czy plan ma wszystkie wymagane dane
4. Sprawdzenie czy nie trwa już generowanie
5. Utworzenie wpisu w tabeli `generated_ai_plans` ze statusem "processing"
6. Uruchomienie asynchronicznego procesu generowania
7. Zwrócenie odpowiedzi z ID procesu i szacowanym czasem

## 6. Względy bezpieczeństwa

1. Autentykacja:

   - Wykorzystanie Supabase Auth do weryfikacji JWT
   - Walidacja tokena w każdym żądaniu

2. Autoryzacja:

   - RLS policies na poziomie bazy danych
   - Sprawdzanie czy użytkownik jest właścicielem planu

3. Walidacja danych:

   - Sanityzacja parametru planId
   - Sprawdzanie integralności danych planu

4. Rate Limiting:
   - Ograniczenie liczby żądań na użytkownika
   - Monitoring nadużyć API

## 7. Obsługa błędów

1. Walidacja wejścia:

   ```typescript
   if (!plan.places || plan.places.length === 0) {
     throw new ValidationError("Plan must have at least one place");
   }
   ```

2. Obsługa konfliktów:

   ```typescript
   if (await isGenerationInProgress(planId)) {
     throw new ConflictError("Generation already in progress");
   }
   ```

3. Logowanie błędów:
   - Szczegółowe logi dla debugowania
   - Monitoring statusu generowania
   - Alerty dla krytycznych błędów

## 8. Rozważania dotyczące wydajności

1. Asynchroniczne przetwarzanie:

   - Wykorzystanie kolejki zadań dla długotrwałych operacji
   - Mechanizm statusu do śledzenia postępu

2. Optymalizacja bazy danych:

   - Indeksy na często używanych polach
   - Efektywne zapytania z wykorzystaniem RLS

3. Caching:
   - Cache dla częstych sprawdzeń statusu
   - Buforowanie częściowych wyników generowania

## 9. Etapy wdrożenia

1. Przygotowanie struktury:

   ```typescript
   // src/services/ai-plan-generation.service.ts
   class AIPlanGenerationService {
     async initializeGeneration(command: GeneratePlanCommand): Promise<GeneratePlanResponseDTO>;
     private async validatePlan(planId: string, userId: string): Promise<void>;
     private async startGenerationProcess(planId: string): Promise<void>;
   }
   ```

2. Implementacja endpointu:

   ```typescript
   // src/routes/api/plans/[planId]/generate.ts
   export const POST: APIRoute = async ({ params, request }) => {
     const { planId } = params;
     const userId = await getUserIdFromRequest(request);

     const service = new AIPlanGenerationService();
     const result = await service.initializeGeneration({ planId, userId });

     return new Response(JSON.stringify(result), {
       status: 202,
       headers: { "Content-Type": "application/json" },
     });
   };
   ```

3. Implementacja walidacji:

   - Utworzenie walidatorów danych wejściowych
   - Implementacja sprawdzania uprawnień
   - Dodanie obsługi błędów

4. Implementacja generatora AI:

   - Integracja z OpenRouter.ai - Na etapie developmentu skorzystamy z mocków zamiast wywoływania serwisu AI.
   - Implementacja logiki generowania planu
   - Obsługa aktualizacji statusu

5. Testy:

   - Testy jednostkowe dla walidacji
   - Testy integracyjne dla endpointu
   - Testy wydajnościowe

6. Dokumentacja:

   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Dokumentacja wewnętrzna kodu

7. Monitoring:

   - Konfiguracja logowania
   - Ustawienie alertów
   - Metryki wydajności

8. Wdrożenie:
   - Code review
   - Testy na środowisku staging
   - Wdrożenie na produkcję
