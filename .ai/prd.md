# Dokument wymagań produktu (PRD) - It's nice to travel

## 1. Przegląd produktu

"It's nice to travel" to aplikacja webowa z responsywnością dla urządzeń mobilnych, która umożliwia użytkownikom łatwe planowanie angażujących i interesujących wycieczek przy pomocy sztucznej inteligencji (AI). Aplikacja pozwala na konwersję prostych notatek o miejscach i celach podróży w szczegółowe plany, uwzględniając preferencje użytkownika, czas, liczbę osób oraz potencjalne miejsca i atrakcje.

Aplikacja oferuje:
- Prosty system kont użytkowników
- Możliwość zapisywania preferencji turystycznych w profilu
- Tworzenie, przeglądanie, edycję i usuwanie planów o planowanych wycieczkach
- Generowanie szczegółowych planów podróży przez AI na podstawie notatek i preferencji
- Harmonogram dzienny z atrakcjami i rekomendacjami gastronomicznymi
- Eksport wygenerowanego planu do PDF

Rozwój MVP zaplanowano na okres jednego miesiąca, a wszystkie funkcje będą dostępne bezpłatnie po rejestracji, zgodnie z modelem freemium bez ograniczeń w wersji MVP.

## 2. Problem użytkownika

Głównym problemem, który rozwiązuje "It's nice to travel", jest trudność w planowaniu angażujących i interesujących wycieczek. Planowanie podróży często wymaga:
- Czasochłonnych badań nad atrakcjami i miejscami wartymi odwiedzenia
- Dostosowania planów do liczby osób, długości podróży i osobistych preferencji
- Koordynacji wielu miejsc i działań w logiczną i wykonalną trasę
- Znalezienia interesujących, ale mniej znanych atrakcji poza standardowymi szlakami turystycznymi

"It's nice to travel" wykorzystuje moc AI, aby szybko tworzyć spersonalizowane plany podróży, które są dobrze zorganizowane i dostosowane do indywidualnych preferencji użytkownika, oszczędzając czas i zwiększając satysfakcję z planowania.

## 3. Wymagania funkcjonalne

### 3.1 System kont użytkowników
- Rejestracja użytkownika wymagająca podania adresu e-mail, hasła
- Logowanie użytkownika
- Przywracanie hasła
- Edycja profilu użytkownika

### 3.2 Zarządzanie listą planów podróży
- Przeglądanie istniejących planów
- Edycja planów
- Usuwanie planów
- Sortowanie planów po dacie utworzenia (od najnowszego do najstarszego)

### 3.2 Tworzenie nowego planu podróży
- Dodawanie nowej notatki o podróży (tekst do 2500 znaków)
- Dodawanie szczegółów podróży: liczba osób, przedział czasowy
- Dodawanie wielu miejsc z datami pobytu (np. Rzym, od 12.04.2025 do 13.04.2025)
- Dodawanie preferencji użytkownika dotyczących podróży:
-- Ustawianie preferencji podróży za pomocą systemu tagów
-- Predefiniowana lista tagów (zwiedzanie zabytków, muzeów, ciekawe miejsca, puby, restauracje, odpoczynek)
-- Możliwość dodawania własnych tagów

### 3.4 Generowanie planów wycieczek przez AI
- Konwersja notatek na szczegółowe plany podróży
- Uwzględnianie preferencji użytkownika przy generowaniu planu
- Wyświetlanie wskaźnika postępu podczas generowania (limit 90 sekund)
- Prezentacja harmonogramu dziennego dla każdego miejsca
- Rekomendacje atrakcji turystycznych z dokładnymi adresami
- Rekomendacje restauracji/kawiarni z dokładnymi adresami
- Rekomendacje miesc będą zawierać zdjęcie poglądowe jeśli jest to możliwe
- Eksport wygenerowanego planu do PDF

### 3.5 Interfejs użytkownika
- Responsywny design z priorytetem dla urządzeń mobilnych
- Nowoczesna, pobudzająca kolorystyka zachęcająca do podróży
- Prosty i czytelny UI z ciekawym UX
- Samouczek dla procesu tworzenia pierwszego planu podróży

## 4. Granice produktu

MVP projektu "It's nice to travel" NIE będzie zawierać następujących funkcjonalności:

- Współdzielenie planów wycieczkowych między kontami użytkowników
- Bogata obsługa i analiza multimediów (np. zdjęć miejsc do odwiedzenia)
- Zaawansowane planowanie czasu i logistyki
- Integracja z systemami rezerwacji hoteli, biletów czy transportu
- Funkcje społecznościowe, takie jak komentowanie planów innych użytkowników
- Wersja mobilna aplikacji (tylko responsywna strona internetowa)
- Płatne subskrypcje lub funkcje premium (wszystkie funkcje dostępne bezpłatnie w MVP)
- Wsparcie dla wielu języków (początkowo tylko język polski)
- Synchronizacja z innymi aplikacjami do planowania podróży

## 5. Historyjki użytkowników

### Landingpage

## US-000:
- Tytuł: Strona głowna
- Opis: Ścieżka główna serwisu ze stroną typu landingpage opisującą możliwości i zalety serwisu. 
- Kryteria akceptacji:
  - Sekcja hero z nagłówkiem zachęcającym do korzystania
  - Sekcja cards z zaletami serwisu
  - Sekcja zdjęcie + opis gdzie wytłumaczymy przewagę wykorzystania AI nad samodzielnym planowaniem podróży
  - Topbar z LOGO serwisu (tekstowa reprezentacja) oraz przyciskami do logowania i rejestracji
  - Strona jest tak samo widoczna po zalogowaniu oraz bez logowania (po zalogowaniu zmieniają się jedynie przyciski w nawigacji)
  - Nawigacja bez logowania to przyciski: "Login" oraz "Signup"
  - Nawigacja po zalogowaniu to ikona usera z dropdownmenu w którym są elementy: "Moje plany" oraz "Wyloguj"

### Rejestracja i zarządzanie kontem

## US-000: Bezpieczny dostęp i uwierzytelnianie

- Tytuł: Bezpieczny dostęp
- Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
- Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - Użytkownik NIE MOŻE korzystać z funkcji tworzenia, przeglądania i generowania planów podróży bez logowania się do systemu.
  - Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.

#### US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę się zarejestrować w aplikacji, aby móc korzystać z funkcji planowania podróży.
- Kryteria akceptacji:
  - Formularz rejestracji zawiera pola: adres e-mail, hasło
  - Walidacja adresu e-mail pod kątem poprawnego formatu
  - Walidacja hasła (minimum 8 znaków, co najmniej 1 duża litera, 1 cyfra)
  - Komunikat o pomyślnej rejestracji
  - Przekierowanie do panelu użytkownika po rejestracji
  - Komunikat błędu w przypadku, gdy adres e-mail jest już zajęty

#### US-002
- Tytuł: Logowanie do aplikacji
- Opis: Jako zarejestrowany użytkownik, chcę się zalogować do aplikacji, aby uzyskać dostęp do moich zapisanych planów podróży i preferencji.
- Kryteria akceptacji:
  - Formularz logowania zawiera pola: adres e-mail i hasło
  - Przycisk "Zapomniałem hasła"
  - Komunikat błędu w przypadku nieprawidłowych danych logowania
  - Przekierowanie do panelu użytkownika po pomyślnym zalogowaniu
  - Opcja "Zapamiętaj mnie" dla utrzymania sesji

#### US-003
- Tytuł: Odzyskiwanie hasła
- Opis: Jako użytkownik, który zapomniał hasła, chcę je zresetować, aby odzyskać dostęp do mojego konta.
- Kryteria akceptacji:
  - Formularz odzyskiwania hasła z polem na adres e-mail
  - Wysłanie e-maila z linkiem do resetowania hasła
  - Link prowadzi do formularza ustawienia nowego hasła
  - Komunikat o pomyślnym zresetowaniu hasła
  - Możliwość zalogowania się przy użyciu nowego hasła

#### US-004
- Tytuł: Edycja profilu użytkownika
- Opis: Jako zalogowany użytkownik, chcę edytować informacje w moim profilu, aby je zaktualizować.
- Kryteria akceptacji:
  - Możliwość zmiany hasła (wymagane podanie starego hasła)
  - Przycisk zapisania zmian
  - Komunikat o pomyślnym zaktualizowaniu profilu


### Zarządzanie planami podróży

#### US-005
- Tytuł: Tworzenie nowego planu podróży
- Opis: Jako użytkownik, chcę stworzyć plan podróży, aby zapisać moje pomysły i cele.
- Kryteria akceptacji:
  - Formularz z polem tekstowym na notatkę (limit 2500 znaków)
  - Pole wyboru liczby osób
  - Pola do określenia przedziału czasowego podróży (data początkowa i końcowa)
  - Pole z listą predefiniowanych tagów preferencji (mi.n. zwiedzanie zabytków, muzeów, ciekawe miejsca, puby, restauracje, odpoczynek). Możliwość wyboru wielu tagów oraz podanie własnego tagu.
  - Możliwość dodania nazwy/tytułu dla planu
  - Przycisk zapisania planu
  - Licznik znaków pokazujący pozostałą liczbę dostępnych znaków
  - Komunikat potwierdzający zapisanie planu

#### US-006
- Tytuł: Dodawanie miejsc do planu podróży
- Opis: Jako użytkownik, chcę dodać konkretne miejsca z datami pobytu do mojego planu podróży.
- Kryteria akceptacji:
  - Możliwość dodania nazwy miejsca
  - Pola do określenia dat pobytu w danym miejscu
  - Opcjonalne pole notatki dla każdego miejsca
  - Możliwość dodania wielu miejsc do jednego plany
  - Walidacja dat (data początkowa musi być wcześniejsza niż końcowa)
  - Walidacja, że daty pobytu w miejscach mieszczą się w przedziale czasowym całej podróży

#### US-007
- Tytuł: Przeglądanie zapisanych planów podróży
- Opis: Jako użytkownik, chcę przeglądać moje zapisane plany o podróżach, aby do nich wrócić.
- Kryteria akceptacji:
  - Lista planów z podstawowymi informacjami (tytuł, daty, liczba miejsc)
  - Sortowanie planów od najnowszej do najstarszej
  - Możliwość wyszukiwania planów po tytule lub miejscu
  - Widok szczegółowy planu po kliknięciu

#### US-008
- Tytuł: Edycja planu podróży
- Opis: Jako użytkownik, chcę edytować istniejący plan podróży, aby zaktualizować informacje.
- Kryteria akceptacji:
  - Możliwość edycji wszystkich pól planu
  - Możliwość edycji, dodawania i usuwania miejsc
  - Przycisk zapisania zmian
  - Komunikat potwierdzający zapisanie zmian
  - Zachowanie oryginalnej daty utworzenia planu

#### US-009
- Tytuł: Usuwanie planu podróży
- Opis: Jako użytkownik, chcę usunąć plan podróży, którego już nie potrzebuję.
- Kryteria akceptacji:
  - Przycisk usuwania planu
  - Okno dialogowe z prośbą o potwierdzenie usunięcia
  - Komunikat potwierdzający usunięcie planu
  - Usunięcie planu z listy zapisanych planów

### Generowanie szczegółowych planów wycieczek

#### US-010
- Tytuł: Generowanie planu podróży na podstawie miejsc, dat, notatek i preferencji
- Opis: Jako użytkownik, chcę wygenerować szczegółowy plan podróży na podstawie dancyh podstawowych mojego planu.
- Kryteria akceptacji:
  - Przycisk "Generuj plan" przy planie
  - Wskaźnik postępu podczas generowania planu
  - Maksymalny czas generowania: 90 sekund
  - Uwzględnienie preferencji użytkownika w wygenerowanym planie
  - Prezentacja wygenerowanego planu po zakończeniu procesu
  - Komunikat błędu w przypadku niepowodzenia generowania

#### US-011
- Tytuł: Przeglądanie wygenerowanego planu podróży
- Opis: Jako użytkownik, chcę przeglądać szczegóły wygenerowanego planu podróży.
- Kryteria akceptacji:
  - Wyświetlenie harmonogramu dziennego dla każdego miejsca
  - Lista atrakcji turystycznych z dokładnymi adresami oraz zdjęciami poglądowymi
  - Lista rekomendacji gastronomicznych z dokładnymi adresami oraz zdjęciami poglądowymi
  - Możliwość przełączania się między dniami podróży
  - Możliwość przełączania się między różnymi miejscami podróży

#### US-012
- Tytuł: Ponowne generowanie planu po edycji planu
- Opis: Jako użytkownik, chcę wygenerować nowy szczegółowy plan po wprowadzeniu zmian w planie o podróży.
- Kryteria akceptacji:
  - Przycisk "Aktualizuj plan" po edycji planu
  - Komunikat informujący o konieczności ponownego wygenerowania planu po edycji
  - Zachowanie poprzedniej wersji planu do momentu wygenerowania nowego
  - Możliwość porównania starej i nowej wersji planu

#### US-013
- Tytuł: Eksport planu podróży
- Opis: Jako użytkownik, chcę wyeksportować wygenerowany plan podróży do formatu PDF.
- Kryteria akceptacji:
  - Przyciski eksportu do PDF.
  - Wygenerowany PDF zawiera wszystkie szczegóły planu
  - Komunikat potwierdzający pomyślny eksport
  - Możliwość otwarcia wyeksportowanego pliku bezpośrednio po eksporcie

### Interfejs użytkownika i UX

#### US-014
- Tytuł: Samouczek dla nowych użytkowników
- Opis: Jako nowy użytkownik, chcę przejść przez samouczek, który pokaże mi, jak korzystać z aplikacji.
- Kryteria akceptacji:
  - Automatyczne uruchomienie samouczka przy pierwszym logowaniu
  - Prezentacja kluczowych funkcji aplikacji krok po kroku
  - Możliwość pominięcia samouczka
  - Możliwość powrotu do samouczka w dowolnym momencie
  - Wyróżnienie elementów interfejsu, o których mowa w samouczku

#### US-015
- Tytuł: Responsywność interfejsu na różnych urządzeniach
- Opis: Jako użytkownik, chcę korzystać z aplikacji na różnych urządzeniach (desktop, tablet, telefon).
- Kryteria akceptacji:
  - Poprawne wyświetlanie na ekranach o różnych rozmiarach
  - Optymalizacja interfejsu dla ekranów dotykowych
  - Zachowanie wszystkich funkcji na wszystkich urządzeniach
  - Szybkie ładowanie strony na urządzeniach mobilnych

#### US-016
- Tytuł: Obsługa błędów w przypadku niedostępności AI
- Opis: Jako użytkownik, chcę otrzymać jasną informację i alternatywne rozwiązanie, gdy usługa AI jest niedostępna.
- Kryteria akceptacji:
  - Komunikat informujący o problemie z dostępnością AI
  - Możliwość zapisania planu mimo niedostępności AI
  - Opcja powiadomienia, gdy usługa AI będzie ponownie dostępna
  - Sugestie alternatywnych działań w międzyczasie

## 6. Metryki sukcesu

### 6.1 Metryki główne
- Liczba wygenerowanych planów podróży (główna metryka sukcesu)
- 90% użytkowników posiada 1 uzupełniony, niekoniecznie wygenerowany plan wycieczki
- 75% użytkowników generuje 3 lub więcej planów wycieczek na rok

### 6.2 Metryki techniczne
- Maksymalny czas odpowiedzi AI: 90 sekund
- Dostępność aplikacji: 99.5%
- Średni czas ładowania strony: poniżej 2 sekund

### 6.3 Metryki użytkownika
- Wskaźnik ukończenia samouczka: minimum 80%
- Wskaźnik ponownego generowania planów po edycji planów: minimum 50%
- Wskaźnik eksportu wygenerowanych planów: minimum 30%
- Współczynnik retencji po 30 dniach: minimum 40%

### 6.4 Metryki zadowolenia
- Średnia ocena użyteczności wygenerowanych planów: minimum 4/5
- Wskaźnik polecenia (NPS): minimum 30
- Wskaźnik zadowolenia z interfejsu użytkownika: minimum 4/5 