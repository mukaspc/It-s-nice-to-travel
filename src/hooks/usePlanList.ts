import { useState, useEffect, useCallback } from "react";
import type { PlanListItemDTO, SortOption, FilterState } from "../types";

const DEFAULT_SORT: SortOption = {
  value: "created_at.desc",
  label: "Newest first",
};

const DEFAULT_FILTERS: FilterState = {
  status: [],
  search: "",
};

export function usePlanList() {
  const [plans, setPlans] = useState<PlanListItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const searchParams = new URLSearchParams();
      searchParams.append("sort", sort.value);
      if (filters.status?.length) {
        searchParams.append("status", filters.status.join(","));
      }
      if (filters.search) {
        searchParams.append("search", filters.search);
      }

      const response = await fetch(`/api/plans?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }

      const data = await response.json();
      setPlans(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [sort, filters]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSort(newSort);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/plans/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete plan");
      }

      setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete plan");
    }
  }, []);

  return {
    plans,
    isLoading,
    error,
    sort,
    filters,
    handleSortChange,
    handleFilterChange,
    handleRetry: fetchPlans,
    handleDelete,
  };
}
