# Plan Testów - "It's nice to travel"

## 1. Wprowadzenie i Cele Testowania

### 1.1 Cel Dokumentu

Niniejszy plan testów definiuje strategię, zakres i metodologię testowania aplikacji webowej "It's nice to travel" - systemu do planowania podróży z wykorzystaniem sztucznej inteligencji.

### 1.2 Cele Testowania

- Zapewnienie wysokiej jakości i stabilności aplikacji przed wdrożeniem produkcyjnym
- Weryfikacja poprawności działania kluczowych funkcjonalności biznesowych
- Potwierdzenie bezpieczeństwa systemu autentykacji i autoryzacji
- Sprawdzenie wydajności integracji z zewnętrznymi usługami AI
- Weryfikacja responsywności i dostępności interfejsu użytkownika

## 2. Zakres Testów

### 2.1 Funkcjonalności Objęte Testami

- **System autentykacji i autoryzacji**

  - Rejestracja użytkowników
  - Logowanie i wylogowywanie
  - Resetowanie hasła

- **Zarządzanie planami podróży**

  - Tworzenie, edycja, usuwanie planów
  - Zarządzanie miejscami w planach
  - Sortowanie i filtrowanie planów
  - Walidacja dat i danych wejściowych

- **Generator planów AI**

  - Inicjowanie generowania planu
  - Monitoring statusu generowania
  - Obsługa błędów integracji AI
  - Timeout i retry logic
  - Wyświetlanie szczegółów wygenerowanych planów

- **Interfejs użytkownika**
  - Responsywność na urządzeniach mobilnych
  - Dostępność (WCAG guidelines)
  - Nawigacja i UX flow
  - Walidacja formularzy

### 2.2 Funkcjonalności Wyłączone z Testów

- Płatności (nie w zakresie MVP)
- Funkcje społecznościowe (nie w zakresie MVP)
- Integracja z systemami rezerwacji (nie w zakresie MVP)
- Eksport planów do PDF

## 3. Typy Testów do Przeprowadzenia

### 3.1 Testy Jednostkowe

**Narzędzia**: Vitest, @testing-library/react
**Pokrycie**: Minimum 80% pokrycia kodu
**Zakres**:

- Komponenty React
- Utility functions
- Serwisy biznesowe
- Walidacja schematów Zod
- Type guards i helpery TypeScript

### 3.2 Testy Integracyjne

**Narzędzia**: Vitest, Supabase Test Client
**Zakres**:

- Integracja z bazą danych Supabase
- API endpoints Astro
- Przepływ danych między komponentami
- Integracja z usługami zewnętrznymi (mocked)

### 3.3 Testy End-to-End (E2E)

**Narzędzia**: Playwright (do dodania)
**Zakres**:

- Kompletne user journeys
- Cross-browser compatibility
- Responsive design testing
- Performance testing

### 3.4 Testy Bezpieczeństwa

**Zakres**:

- SQL Injection protection
- XSS prevention
- CSRF protection
- Authentication bypass attempts
- Authorization matrix testing

### 3.5 Testy Wydajności

**Narzędzia**: Lighthouse, WebPageTest
**Zakres**:

- Czas ładowania strony
- Core Web Vitals
- Wydajność generowania planów AI
- Stress testing API

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

### 4.1 System Autentykacji

#### TC-AUTH-001: Rejestracja użytkownika

**Kroki**:

1. Przejdź na stronę rejestracji
2. Wypełnij formularz prawidłowymi danymi
3. Zatwierdź rejestrację
4. Sprawdź email weryfikacyjny
   **Oczekiwany rezultat**: Użytkownik zostaje zarejestrowany i przekierowany do dashboard

#### TC-AUTH-002: Logowanie użytkownika

**Kroki**:

1. Przejdź na stronę logowania
2. Wprowadź prawidłowe dane logowania
3. Kliknij "Zaloguj"
   **Oczekiwany rezultat**: Użytkownik zostaje zalogowany i przekierowany do strony z planami

#### TC-AUTH-003: Resetowanie hasła

**Kroki**:

1. Przejdź na stronę logowania
1. Kliknij "Zapomniałem hasła"
1. Wprowadź email
1. Sprawdź email z linkiem resetującym
1. Ustaw nowe hasło
   **Oczekiwany rezultat**: Hasło zostaje zmienione, możliwe logowanie z nowym hasłem

### 4.2 Zarządzanie Planami

#### TC-PLAN-001: Tworzenie nowego planu

**Kroki**:

1. Zaloguj się jako użytkownik
2. Kliknij "Nowy plan"
3. Wypełnij formularz (nazwa, daty, liczba osób, notatki)
4. Zapisz plan
   **Oczekiwany rezultat**: Plan zostaje utworzony i wyświetlony na liście

#### TC-PLAN-002: Edycja istniejącego planu

**Kroki**:

1. Wybierz plan z listy
2. Kliknij "Edytuj"
3. Zmień dane planu
4. Zapisz zmiany
   **Oczekiwany rezultat**: Zmiany zostają zapisane i widoczne

#### TC-PLAN-003: Usuwanie planu

**Kroki**:

1. Wybierz plan z listy
2. Kliknij "Usuń"
3. Potwierdź usunięcie
   **Oczekiwany rezultat**: Plan zostaje usunięty z listy

### 4.3 Generator Planów AI

#### TC-AI-001: Generowanie planu podróży

**Kroki**:

1. Utwórz plan z miejscami i preferencjami
2. Kliknij "Generuj" dla konkretnego planu
3. Monitoruj status generowania
4. Sprawdź wygenerowany plan na dedykowanej stronie
   **Oczekiwany rezultat**: Plan zostaje wygenerowany z harmonogramem i rekomendacjami

#### TC-AI-002: Obsługa błędów generowania

**Kroki**:

1. Rozpocznij generowanie przy braku połączenia internetowego
2. Sprawdź komunikat błędu
3. Spróbuj ponownie po przywróceniu połączenia
   **Oczekiwany rezultat**: Odpowiedni komunikat błędu, możliwość ponowienia

### 4.4 Responsywność UI

#### TC-UI-001: Testowanie na urządzeniach mobilnych

**Kroki**:

1. Otwórz aplikację na urządzeniu mobilnym (iOS/Android)
2. Sprawdź wszystkie główne funkcjonalności
3. Zweryfikuj czytelność tekstu i dostępność przycisków
   **Oczekiwany rezultat**: Wszystkie funkcje działają poprawnie na mobile

## 5. Środowisko Testowe

### 5.1 Środowiska

- **Development**: Lokalne środowisko developerskie
- **Staging**: Środowisko pre-produkcyjne z pełną integracją
- **Production**: Środowisko produkcyjne (tylko smoke tests)

### 5.2 Konfiguracja Testowa

- **Baza danych**: Supabase test instance z test fixtures
- **AI Service**: Mock service dla predictable testing
- **External APIs**: Zastubowane dla kontrolowanych testów

### 5.3 Dane Testowe

- Test users z różnymi rolami i permissions
- Sample travel plans z różnymi scenariuszami
- Mock AI responses dla różnych case'ów

## 6. Narzędzia do Testowania

### 6.1 Narzędzia Automatyzacji

- **Vitest**: Testy jednostkowe i integracyjne
- **@testing-library/react**: Testowanie komponentów React
- **@testing-library/jest-dom**: Dodatkowe matchery dla DOM
- **Playwright**: Testy E2E (do implementacji)
- **ESLint**: Statyczna analiza kodu
- **TypeScript**: Type checking

### 6.2 Narzędzia Wydajności

- **Lighthouse**: Performance audits
- **WebPageTest**: Detailed performance analysis
- **Chrome DevTools**: Debugging i profiling

### 6.3 Narzędzia CI/CD

- **GitHub Actions**: Automatyczne uruchamianie testów
- **Coverage reports**: Raportowanie pokrycia kodu
- **Test results publishing**: Publikowanie wyników testów

## 7. Harmonogram Testów

### 7.1 Faza 1: Testy Podstawowe (Tydzień 1-2)

- Konfiguracja środowiska testowego
- Testy jednostkowe komponentów UI
- Testy walidacji formularzy
- Podstawowe testy integracji z Supabase

### 7.2 Faza 2: Testy Funkcjonalne (Tydzień 3-4)

- Testy systemu autentykacji
- Testy CRUD operacji na planach
- Testy integracji AI (z mockami)
- Testy responsywności

### 7.3 Faza 3: Testy Zaawansowane (Tydzień 5-6)

- Testy End-to-End z Playwright
- Testy wydajności
- Testy bezpieczeństwa
- Testy cross-browser

### 7.4 Faza 4: Finalizacja (Tydzień 7)

- Bug fixing na podstawie wyników testów
- Regression testing
- Final smoke tests
- Dokumentacja wyników

## 8. Kryteria Akceptacji Testów

### 8.1 Kryteria Funkcjonalne

- ✅ Wszystkie testy jednostkowe przechodzą (100%)
- ✅ Pokrycie kodu minimum 80%
- ✅ Wszystkie krytyczne user journeys działają poprawnie
- ✅ Brak critical i high severity bugów

### 8.2 Kryteria Wydajności

- ✅ Czas ładowania strony głównej < 2s
- ✅ First Contentful Paint < 1.2s
- ✅ Lighthouse Performance Score > 90
- ✅ Generowanie planu AI < 30s

### 8.3 Kryteria Bezpieczeństwa

- ✅ Brak podatności związanych z autentykacją
- ✅ Proper input validation na wszystkich formularzach
- ✅ HTTPS enforcement
- ✅ Secure headers implementation

### 8.4 Kryteria Dostępności

- ✅ WCAG 2.1 AA compliance
- ✅ Screen reader compatibility
- ✅ Keyboard navigation support
- ✅ Proper color contrast ratios

## 9. Role i Odpowiedzialności

### 9.1 QA Engineer (Lead)

- Koordynacja działań testowych
- Przygotowanie strategii testów
- Review test cases i results
- Raportowanie do stakeholders

### 9.2 Frontend Developer

- Implementacja testów jednostkowych komponentów
- Fixing bugów znalezionych przez testy
- Code review z perspektywy testability

### 9.3 Backend Developer

- Testy integracji z bazą danych
- API testing
- Performance optimization
- Security testing

### 9.4 DevOps Engineer

- Konfiguracja CI/CD pipelines
- Środowiska testowe
- Automated deployment testing
- Monitoring i alerting

## 10. Procedury Raportowania Błędów

### 10.1 Klasyfikacja Błędów

- **Critical**: Crash aplikacji, security issues, data loss
- **High**: Główne funkcjonalności nie działają
- **Medium**: Funkcjonalności działają z ograniczeniami
- **Low**: Kosmetyczne problemy, minor UX issues

### 10.2 Bug Report Template

```
**ID**: BUG-YYYY-MM-DD-XXX
**Tytuł**: Krótki opis problemu
**Środowisko**: [Dev/Staging/Prod]
**Przeglądarka**: [Chrome/Firefox/Safari + wersja]
**Urządzenie**: [Desktop/Mobile/Tablet]
**Kroki reprodukcji**:
1.
2.
3.
**Oczekiwany rezultat**:
**Aktualny rezultat**:
**Załączniki**: [Screenshots/logs]
**Priorytet**: [Critical/High/Medium/Low]
**Przypisano**: [Developer name]
```

### 10.3 Bug Tracking Process

1. **Discovery**: Znalezienie i dokumentacja buga
2. **Triage**: Przypisanie priorytetu i developera
3. **Development**: Implementacja fix'a
4. **Verification**: Sprawdzenie czy bug został naprawiony
5. **Closure**: Zamknięcie ticket'a po verification

### 10.4 Raportowanie Postępów

- **Daily**: Status update w ramach daily standups
- **Weekly**: Szczegółowy raport z metrykami testów
- **Monthly**: Executive summary z trendami jakości

---

**Uwaga**: Plan testów będzie aktualizowany w miarę rozwoju projektu i pojawiania się nowych wymagań. Wszystkie zmiany będą konsultowane z zespołem developerskim i stakeholders.
