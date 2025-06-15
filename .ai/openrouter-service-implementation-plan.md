# OpenRouter Service Implementation Plan

## 1. Opis usługi

OpenRouter Service to warstwa abstrakcji zapewniająca ujednolicony dostęp do różnych modeli LLM poprzez standardowe API. Usługa będzie zintegrowana z interfejsem OpenRouter.ai i będzie wykorzystywana do obsługi czatów opartych na LLM w aplikacji.

### Główne funkcjonalności:

- Ujednolicony dostęp do wielu modeli LLM (OpenAI, Anthropic, Google i inne)
- Zarządzanie komunikacją z API OpenRouter
- Obsługa różnych formatów odpowiedzi (tekst, JSON)
- Zarządzanie kontekstem rozmowy
- Obsługa błędów i retry
- Monitorowanie kosztów i limitów

## 2. Opis konstruktora

```typescript
class OpenRouterService {
  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = "https://openrouter.ai/api/v1";
    this.defaultModel = config.defaultModel || "openai/gpt-4o-mini";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "HTTP-Referer": config.siteUrl,
      "X-Title": config.siteName,
    };
  }
}

interface OpenRouterConfig {
  apiKey: string;
  siteUrl: string;
  siteName: string;
  defaultModel?: string;
}
```

## 3. Publiczne metody i pola

### Metody

1. `async chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>`

   - Główna metoda do komunikacji z modelem
   - Obsługuje historię konwersacji
   - Pozwala na konfigurację parametrów modelu

2. `async streamChat(messages: Message[], options?: StreamOptions): AsyncGenerator<ChatResponse>`

   - Wersja strumieniowa metody chat
   - Zwraca odpowiedzi token po tokenie

3. `async getModelsList(): Promise<Model[]>`

   - Pobiera listę dostępnych modeli
   - Zawiera informacje o cenach i limitach

4. `async getCredits(): Promise<CreditInfo>`
   - Sprawdza stan kredytów na koncie
   - Monitoruje zużycie

### Interfejsy

```typescript
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: {
    type: "json_object";
    schema?: object;
  };
  stream?: boolean;
}

interface ChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

## 4. Prywatne metody i pola

```typescript
private async makeRequest(endpoint: string, data: any): Promise<any>
private handleError(error: Error): never
private validateMessages(messages: Message[]): void
private calculateTokenUsage(messages: Message[]): number
private async retryWithExponentialBackoff(fn: () => Promise<any>): Promise<any>
```

## 5. Obsługa błędów

### Scenariusze błędów:

1. Błędy autoryzacji (401, 403)
2. Przekroczenie limitów (429)
3. Błędy serwera (500, 502, 503, 504)
4. Timeout połączenia
5. Nieprawidłowy format danych
6. Przekroczenie limitu tokenów
7. Błędy moderacji treści

### Strategia obsługi:

- Automatyczne retry dla błędów tymczasowych
- Exponential backoff dla limitów rate
- Szczegółowe komunikaty błędów
- Logowanie błędów do monitoringu
- Fallback na alternatywne modele

## 6. Kwestie bezpieczeństwa

1. Bezpieczne przechowywanie kluczy API

   - Wykorzystanie zmiennych środowiskowych

2. Walidacja danych wejściowych
   - Sanityzacja inputu użytkownika
   - Limity długości wiadomości
   - Filtrowanie niebezpiecznych treści

## 7. Plan wdrożenia krok po kroku

### Etap 1: Konfiguracja środowiska

1. Utworzenie konta OpenRouter
2. Wygenerowanie kluczy API
3. Konfiguracja zmiennych środowiskowych
4. Instalacja zależności

### Etap 2: Implementacja podstawowa

1. Utworzenie klasy OpenRouterService
2. Implementacja konstruktora
3. Dodanie podstawowych metod

### Etap 3: Rozszerzenie funkcjonalności

1. Dodanie obsługi strumieni
2. Implementacja response_format
3. Dodanie retry i backoff
4. Rozszerzenie testów

### Etap 4: Integracja z aplikacją

1. Podłączenie do istniejącego kodu
2. Monitoring i logowanie
3. Dokumentacja

### Etap 5: Optymalizacja i skalowanie

1. Analiza wydajności
2. Optymalizacja kosztów
3. Konfiguracja cachowania

### Przykłady implementacji

1. Podstawowe użycie:

```typescript
const openRouter = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  siteUrl: "https://example.com",
  siteName: "Example App",
});

const response = await openRouter.chat([
  {
    role: "user",
    content: "What is the capital of France?",
  },
]);
```

2. Użycie z response_format:

```typescript
const response = await openRouter.chat(
  [
    {
      role: "user",
      content: "Give me information about Paris",
    },
  ],
  {
    response_format: {
      type: "json_object",
      schema: {
        type: "object",
        properties: {
          city: { type: "string" },
          country: { type: "string" },
          population: { type: "number" },
          landmarks: { type: "array", items: { type: "string" } },
        },
      },
    },
  }
);
```

3. Streaming:

```typescript
const stream = openRouter.streamChat([
  {
    role: "user",
    content: "Write a story about a dragon",
  },
]);

for await (const chunk of stream) {
  console.log(chunk.choices[0].message.content);
}
```
