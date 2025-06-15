# Plan implementacji widoku listy planów podróży

## 1. Przegląd

Widok listy planów podróży to główny interfejs zarządzania planami użytkownika. Umożliwia przeglądanie, sortowanie i zarządzanie planami podróży. Widok jest w pełni responsywny i zapewnia intuicyjny dostęp do wszystkich funkcji zarządzania planami.

## 2. Routing widoku

- Ścieżka podstawowa: `/plans`
- Ścieżka tworzenia: `/plans/new`
- Ścieżka edycji: `/plans/[id]/edit`

## 3. Struktura komponentów

```
PlanListView
├── PlanFilterBar
│   ├── SortSelect
│   └── StatusFilter
├── PlanGrid
│   └── PlanCard
└── DeleteConfirmDialog

PlanForm (osobny widok)
├── BasicInfoSection
├── TravelPreferencesSection
└── PlacesSection
    └── PlaceForm
```

## 4. Szczegóły komponentów

### PlanListView

- Opis: Główny komponent widoku, zarządza stanem listy i organizuje pozostałe komponenty
- Główne elementy:
  - Container z maksymalną szerokością
  - Nagłówek z tytułem i przyciskiem "Nowy plan"
  - Sekcja filtrowania
  - Grid z kartami planów
- Obsługiwane interakcje:
  - Nawigacja do tworzenia nowego planu
  - Odświeżanie listy
- Typy:
  - PlanListResponseDTO
  - PlanListItemDTO
- Propsy: brak (komponent najwyższego poziomu)

### PlanFilterBar

- Opis: Pasek narzędzi z opcjami sortowania i filtrowania
- Główne elementy:
  - Select do sortowania
  - Filtry statusu
  - Pole wyszukiwania
- Obsługiwane interakcje:
  - Zmiana sortowania
  - Zmiana filtrów
  - Wpisywanie tekstu wyszukiwania
- Typy:
  - SortOption
  - FilterState
- Propsy:
  ```typescript
  interface PlanFilterBarProps {
    onSortChange: (sort: SortOption) => void;
    onFilterChange: (filters: FilterState) => void;
    onSearchChange: (search: string) => void;
    currentSort: SortOption;
    currentFilters: FilterState;
    searchQuery: string;
  }
  ```

### PlanGrid

- Opis: Grid responsywny wyświetlający karty planów
- Główne elementy:
  - Grid container z auto-fit minmax
  - Karty planów
- Obsługiwane interakcje:
  - Przekazywanie akcji do kart
- Typy:
  - PlanListItemDTO[]
- Propsy:
  ```typescript
  interface PlanGridProps {
    plans: PlanListItemDTO[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onGenerate: (id: string) => void;
  }
  ```

### PlanCard

- Opis: Karta pojedynczego planu z akcjami
- Główne elementy:
  - Nagłówek z nazwą
  - Sekcja dat
  - Liczba osób
  - Przyciski akcji
- Obsługiwane interakcje:
  - Kliknięcie edycji
  - Kliknięcie usuwania
  - Kliknięcie generowania
- Typy:
  - PlanListItemDTO
- Propsy:
  ```typescript
  interface PlanCardProps {
    plan: PlanListItemDTO;
    onEdit: () => void;
    onDelete: () => void;
    onGenerate: () => void;
  }
  ```

### DeleteConfirmDialog

- Opis: Dialog potwierdzenia usunięcia planu
- Główne elementy:
  - Tekst potwierdzenia
  - Przyciski akcji
- Obsługiwane interakcje:
  - Potwierdzenie
  - Anulowanie
- Typy: brak
- Propsy:
  ```typescript
  interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    planName: string;
  }
  ```

## 5. Typy

```typescript
interface SortOption {
  value: "created_at.desc" | "created_at.asc" | "name.asc" | "name.desc";
  label: string;
}

interface FilterState {
  status?: PlanStatus[];
  search?: string;
}

interface PlanListViewModel {
  plans: PlanListItemDTO[];
  isLoading: boolean;
  error?: string;
  sort: SortOption;
  filters: FilterState;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}
```

## 6. Zarządzanie stanem

```typescript
const usePlanList = () => {
  const [viewModel, setViewModel] = useState<PlanListViewModel>();
  const [selectedPlan, setSelectedPlan] = useState<string>();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Metody zarządzania stanem...

  return {
    viewModel,
    selectedPlan,
    isDeleteDialogOpen,
    // Metody...
  };
};
```

## 7. Integracja API

- Endpoint: GET /api/plans
- Parametry:
  - sort: string
  - limit: number
  - offset: number
  - search: string
- Odpowiedź: PlanListResponseDTO
- Obsługa błędów:

  - 401: Przekierowanie do logowania
  - Inne: Wyświetlenie komunikatu błędu

- Endpoint: POST /api/plans
- Request Body:
  ```typescript
  {
    name: string;
    start_date: string;
    end_date: string;
    people_count: number;
    note?: string | null;
    travel_preferences?: string | null;
  }
  ```
- Response Body:
  ```typescript
  {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    people_count: number;
    note: string | null;
    travel_preferences: string | null;
    status: "draft";
    created_at: string;
    updated_at: string;
  }
  ```
- Obsługa błędów:
  - 400: Nieprawidłowe dane
  - 401: Przekierowanie do logowania
  - 422: Błędy walidacji
  - 500: Błąd serwera

## 8. Interakcje użytkownika

1. Sortowanie:

   - Kliknięcie w select sortowania
   - Wybór opcji sortowania
   - Automatyczne odświeżenie listy

2. Filtrowanie:

   - Wybór statusów
   - Wpisanie tekstu wyszukiwania
   - Automatyczne odświeżenie z debounce

3. Akcje na planach:
   - Kliknięcie "Edytuj" -> Przekierowanie do edycji
   - Kliknięcie "Usuń" -> Otwarcie dialogu potwierdzenia
   - Kliknięcie "Generuj" -> Przekierowanie do generowania

## 9. Warunki i walidacja

- Sortowanie:

  - Dozwolone tylko predefiniowane opcje
  - Domyślnie: created_at.desc

- Filtrowanie:
  - Status: Wielokrotny wybór z predefiniowanej listy
  - Wyszukiwanie: Min. 3 znaki

## 10. Obsługa błędów

1. Błędy API:

   - Wyświetlanie komunikatu błędu
   - Możliwość ponowienia próby
   - Automatyczne odświeżanie po czasie

2. Błędy walidacji:

   - Wyświetlanie komunikatów przy polach
   - Blokowanie niedozwolonych akcji

3. Błędy sieci:
   - Wskaźnik stanu offline
   - Automatyczne ponowienie próby po przywróceniu połączenia

## 11. Kroki implementacji

1. Utworzenie podstawowej struktury komponentów:

   ```
   src/
   ├── pages/
   │   └── plans/
   │       ├── index.astro
   │       ├── new.astro
   │       └── [id]/
   │           └── edit.astro
   ├── components/
   │   └── plans/
   │       ├── PlanListView.tsx
   │       ├── PlanFilterBar.tsx
   │       ├── PlanGrid.tsx
   │       ├── PlanCard.tsx
   │       └── DeleteConfirmDialog.tsx
   └── hooks/
       └── usePlanList.ts
   ```

2. Implementacja typów i modeli:

   - Utworzenie interfejsów
   - Implementacja mapperów DTO -> ViewModel

3. Implementacja hooka usePlanList:

   - Stan widoku
   - Metody zarządzania stanem
   - Integracja z API

4. Implementacja komponentów:

   - PlanListView jako kontener
   - PlanFilterBar z kontrolkami
   - PlanGrid z responsywnym układem
   - PlanCard z akcjami
   - DeleteConfirmDialog

5. Implementacja routingu:

   - Konfiguracja ścieżek w Astro
   - Obsługa parametrów URL
   - Przekierowania

6. Stylowanie:

   - Konfiguracja Tailwind
   - Implementacja responsywności
   - Dostosowanie komponentów Shadcn

7. Implementacja obsługi błędów:

   - Komponenty komunikatów
   - Logika ponownych prób
   - Obsługa offline

8. Testy:

   - Testy jednostkowe komponentów
   - Testy integracyjne
   - Testy E2E podstawowych scenariuszy

9. Optymalizacja:

   - Implementacja debounce dla wyszukiwania
   - Optymalizacja renderowania
   - Lazy loading komponentów

10. Dokumentacja:
    - Dokumentacja komponentów
    - Przykłady użycia
    - Opis API

## 12. Widok tworzenia/edycji planu

### PlanForm

- Opis: Komponent formularza do tworzenia i edycji planu
- Główne elementy:
  - BasicInfoSection:
    - Nazwa planu
    - Data rozpoczęcia
    - Data zakończenia
    - Liczba osób
    - Notatka
  - TravelPreferencesSection:
    - Preferencje podróży (tekst)
  - PlacesSection:
    - Lista miejsc
    - Formularz dodawania/edycji miejsca
- Obsługiwane interakcje:
  - Walidacja pól
  - Zapisywanie formularza
  - Anulowanie edycji
  - Zarządzanie miejscami
- Typy:
  ```typescript
  interface PlanFormProps {
    initialData?: PlanDTO;
    onSubmit: (data: CreatePlanCommandDTO) => Promise<void>;
    onCancel: () => void;
  }
  ```
- Walidacja:
  - Nazwa: wymagana, max 100 znaków
  - Daty: wymagane, data końcowa >= data początkowa
  - Liczba osób: 1-99
  - Notatka: max 2500 znaków
  - Preferencje: opcjonalne

### Routing

- Tworzenie: `/plans/new`
- Edycja: `/plans/[id]/edit`
- Wspólny komponent: `PlanForm`
- Różnice:
  - Tworzenie: pusty formularz
  - Edycja: formularz wypełniony danymi planu

### Obsługa błędów

- Walidacja formularza:
  - Wyświetlanie błędów pod polami
  - Blokada przycisku zapisu
- Błędy API:
  - Wyświetlanie komunikatu błędu
  - Możliwość ponowienia próby
- Anulowanie:
  - Potwierdzenie przy niezapisanych zmianach
