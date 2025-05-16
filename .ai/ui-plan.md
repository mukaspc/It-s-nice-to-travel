# Architektura UI dla "It's nice to travel"

## 1. Przegląd struktury UI

Architektura UI dla "It's nice to travel" jest podzielona na dwa główne układy: nawigacja górna dla niezalogowanych użytkowników i nawigacja boczna dla zalogowanych. Wszystkie widoki projektowane są zgodnie z podejściem Mobile First, zapewniając pełną responsywność na wszystkich urządzeniach. Aplikacja wykorzystuje komponenty z biblioteki Shadcn/ui, zachowując spójność wizualną i UX w całym interfejsie. W wersji MVP zaimplementowany będzie wyłącznie jasny motyw oraz podstawowe zasady dostępności WCAG.

## 2. Lista widoków

### Landing Page
- **Ścieżka**: `/`
- **Główny cel**: Zaprezentowanie możliwości aplikacji i zachęcenie do rejestracji
- **Kluczowe informacje**: 
  - Opis funkcjonalności aplikacji
  - Korzyści z używania aplikacji
  - Przyciski CTA do rejestracji i logowania
- **Kluczowe komponenty**:
  - Hero section z grafiką i hasłem przewodnim
  - Sekcje opisujące kluczowe funkcje
  - Przyciski CTA (Call to Action)
  - Nawigacja górna (logo, przycisk logowania, przycisk rejestracji)
- **UX/Dostępność**: Jasne CTA, czytelne nagłówki, odpowiedni kontrast, szybkie ładowanie strony

### Rejestracja
- **Ścieżka**: `/signup`
- **Główny cel**: Umożliwienie utworzenia konta użytkownika
- **Kluczowe informacje**:
  - Formularz rejestracji (e-mail, hasło, imię)
  - Link do logowania
- **Kluczowe komponenty**:
  - Formularz rejestracji z walidacją inline
  - Przyciski akcji (zarejestruj, wróć)
  - Komunikaty o błędach
- **UX/Dostępność**: Walidacja inline, wyraźne komunikaty błędów, możliwość nawigacji klawiaturą

### Logowanie
- **Ścieżka**: `/login`
- **Główny cel**: Umożliwienie zalogowania się do aplikacji
- **Kluczowe informacje**:
  - Formularz logowania (e-mail, hasło)
  - Link do resetowania hasła
  - Link do rejestracji
- **Kluczowe komponenty**:
  - Formularz logowania
  - Przycisk "Zapomniałem hasła"
  - Komunikaty o błędach
- **UX/Bezpieczeństwo**: Maskowanie hasła, informacje o błędach logowania bez ujawniania szczegółów

### Reset hasła
- **Ścieżka**: `/password-reset` i `/password-reset/[token]`
- **Główny cel**: Umożliwienie zresetowania hasła
- **Kluczowe informacje**:
  - Formularz do podania e-maila
  - Po otrzymaniu linku - formularz nowego hasła
  - Komunikaty o statusie operacji
- **Kluczowe komponenty**:
  - Formularz z walidacją
  - Komunikaty informacyjne
- **UX/Bezpieczeństwo**: Jasne komunikaty statusu, zabezpieczenie tokenu resetu

### Dashboard
- **Ścieżka**: `/dashboard`
- **Główny cel**: Centralny punkt dostępu do aplikacji dla zalogowanych użytkowników
- **Kluczowe informacje**:
  - Podsumowanie (liczba planów)
  - Skrócona lista ostatnich planów
  - Przycisk utworzenia nowego planu
- **Kluczowe komponenty**:
  - Nawigacja boczna
  - Karty statystyk
  - Grid z ostatnimi planami
  - Duży przycisk CTA do tworzenia planu
- **UX/Dostępność**: Intuicyjny układ, wyraźne CTA, konsystentna nawigacja

### Lista planów
- **Ścieżka**: `/plans`
- **Główny cel**: Zarządzanie wszystkimi planami użytkownika
- **Kluczowe informacje**:
  - Lista planów z nazwą, datami, liczbą osób
  - Opcje sortowania (data dodania) i filtrowania (status)
  - Akcje dla każdego planu (edycja, usunięcie, generowanie)
- **Kluczowe komponenty**:
  - Filtrowanie i sortowanie
  - Grid responsywnych kart
  - Przyciski akcji na kartach
  - Dialog potwierdzenia usunięcia
- **UX**: Efektywne filtrowanie i sortowanie, wyraźne akcje na kartach

### Tworzenie/edycja planu
- **Ścieżka**: `/plans/new` i `/plans/[id]/edit`
- **Główny cel**: Wprowadzanie i modyfikacja danych planu podróży
- **Kluczowe informacje**:
  - Podstawowe informacje planu (nazwa, daty, liczba osób, notatka)
  - Lista miejsc z datami pobytu
  - Preferencje podróży (tagi)
- **Kluczowe komponenty**:
  - Formularz z sekcjami
  - Komponent dodawania/edycji miejsc (wbudowany)
  - Multiselect z sugestiami dla preferencji
  - Przyciski akcji (zapisz, anuluj)
- **UX/Dostępność**: Walidacja inline, intuicyjne formularze, wyraźne sekcje

### Generowanie planu
- **Ścieżka**: `/plans/[id]/generate`
- **Główny cel**: Informowanie o postępie generowania planu przez AI
- **Kluczowe informacje**:
  - Pasek postępu
  - Szacowany czas ukończenia
  - Status procesu
- **Kluczowe komponenty**:
  - Animowany pasek postępu
  - Licznik czasu
  - Komunikaty statusu
- **UX**: Jasna informacja o postępie, zapobieganie frustracjom podczas oczekiwania

### Widok wygenerowanego planu
- **Ścieżka**: `/plans/[id]/view`
- **Główny cel**: Prezentacja wygenerowanego planu podróży
- **Kluczowe informacje**:
  - Lista z podziałem na dni
  - Harmonogram aktywności dla każdego dnia
  - Rekomendacje gastronomiczne
  - Zdjęcia poglądowe miejsc
- **Kluczowe komponenty**:
  - Lista dni z aktywnościami
  - Karty rekomendacji
  - Komponenty wyświetlania zdjęć
  - Przycisk eksportu do PDF
- **UX/Dostępność**: Czytelna struktura, łatwy dostęp do eksportu, optymalizacja wyświetlania zdjęć

## 3. Mapa podróży użytkownika

### Rejestracja i pierwsze logowanie
1. Użytkownik wchodzi na Landing Page
2. Klika przycisk "Sign up"
3. Wypełnia formularz rejestracji i przesyła go
4. Otrzymuje potwierdzenie rejestracji
5. Jest przekierowywany na Dashboard z pustą listą planów

### Tworzenie i generowanie planu podróży
1. Z Dashboardu użytkownik klika "Create new plan"
2. Wypełnia podstawowe informacje planu
3. Dodaje miejsca z datami pobytu
4. Wybiera preferencje podróży
5. Zapisuje plan i wraca do listy planów
6. Z listy planów klika przycisk "Generuj plan" przy wybranym planie
7. Zostaje przekierowany do widoku generowania z paskiem postępu
8. Po zakończeniu generowania, zostaje przekierowany do widoku wygenerowanego planu
9. Przegląda plan i opcjonalnie klika "Eksportuj do PDF"

### Edycja i ponowne generowanie planu
1. Z listy planów użytkownik klika "Edytuj" przy wybranym planie
2. Modyfikuje dane planu
3. Zapisuje zmiany
4. Status planu zmienia się na "draft"
5. Użytkownik może ponownie wygenerować plan

### Usuwanie planu
1. Z listy planów użytkownik klika "Usuń" przy wybranym planie
2. Wyświetla się dialog potwierdzenia
3. Po potwierdzeniu plan znika z listy

## 4. Układ i struktura nawigacji

### Układ dla niezalogowanych użytkowników
- **Nawigacja górna**:
  - Logo (link do Landing Page)
  - Przycisk "Login in"
  - Przycisk "Sign up"

### Układ dla zalogowanych użytkowników
- **Nawigacja boczna** (rozwijana na urządzeniach mobilnych):
  - Logo
  - Dashboard (ikona domu)
  - Moje plany
  - Utwórz nowy plan
  - Ustawienia konta
  - Wyloguj się

### Nawigacja kontekstowa
- **W widoku listy planów**:
  - Przycisk "Nowy plan"
  - Przyciski akcji przy każdym planie (edytuj, usuń, generuj plan)
  
- **W widoku tworzenia/edycji planu**:
  - Przyciski "Zapisz" i "Anuluj"
  
- **W widoku wygenerowanego planu**:
  - Przycisk "Eksportuj do PDF"
  - Przycisk "Wróć do listy planów"
  - Przycisk "Edytuj plan"

## 5. Kluczowe komponenty

### Card
- Wykorzystywany do wyświetlania planów na liście, miejsc w planie, oraz rekomendacji w wygenerowanym planie
- Zawiera nagłówek, treść i przyciski akcji
- Responsywny, dostosowuje się do różnych rozmiarów ekranu

### Form
- Podstawowy komponent dla wszystkich formularzy w aplikacji
- Zawiera walidację inline
- Obsługuje różne typy pól (tekst, data, liczba, multiselect)

### Button
- Konsystentny styl przycisków w całej aplikacji
- Różne warianty: primary, secondary, destructive
- Stany: default, hover, active, disabled

### Dialog
- Używany do potwierdzenia akcji (np. usunięcia planu)
- Blokuje interakcję z resztą interfejsu
- Zawiera jasne opcje potwierdzenia lub anulowania

### Navbar
- Nawigacja górna dla niezalogowanych użytkowników
- Responsywna, zmienia się w menu hamburgerowe na małych ekranach

### Sidebar
- Nawigacja boczna dla zalogowanych użytkowników
- Składana na urządzeniach mobilnych, dostępna przez przycisk hamburger

### Progress
- Wyświetla postęp generowania planu
- Zawiera animację i procentowy wskaźnik ukończenia

### MultiSelect
- Komponent do wyboru wielu tagów preferencji podróży
- Obsługuje sugestie i własne wpisy użytkownika

### Timeline
- Wyświetla harmonogram dnia w wygenerowanym planie
- Prezentuje aktywności w chronologicznej kolejności

### Alert
- Wyświetla komunikaty informacyjne, ostrzeżenia i błędy
- Różne warianty: info, success, warning, error 