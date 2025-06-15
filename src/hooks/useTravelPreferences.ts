import { useState, useCallback } from "react";
import type { TravelPreferenceDTO } from "../types";

export function useTravelPreferences() {
  const [preferences, setPreferences] = useState<TravelPreferenceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const response = await fetch("/api/travel-preferences");
      if (!response.ok) {
        throw new Error("Failed to fetch travel preferences");
      }
      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    preferences,
    isLoading,
    error,
    fetchPreferences,
  };
}
