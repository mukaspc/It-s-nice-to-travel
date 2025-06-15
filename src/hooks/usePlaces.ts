import { useState } from "react";
import type { PlaceDTO, CreatePlaceCommandDTO, UpdatePlaceCommandDTO } from "../types";

interface UsePlacesProps {
  planId: string;
}

export function usePlaces({ planId }: UsePlacesProps) {
  const [places, setPlaces] = useState<PlaceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const fetchPlaces = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const response = await fetch(`/api/plans/${planId}/places`);
      if (!response.ok) {
        throw new Error("Failed to fetch places");
      }
      const data = await response.json();
      setPlaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const createPlace = async (data: CreatePlaceCommandDTO) => {
    try {
      setError(undefined);
      const response = await fetch(`/api/plans/${planId}/places`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create place");
      }

      const place = await response.json();
      setPlaces((current) => [...current, place]);
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return { success: false, error: err instanceof Error ? err.message : "An error occurred" };
    }
  };

  const updatePlace = async (placeId: string, data: UpdatePlaceCommandDTO) => {
    try {
      setError(undefined);
      const response = await fetch(`/api/plans/${planId}/places/${placeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update place");
      }

      const updatedPlace = await response.json();
      setPlaces((current) => current.map((p) => (p.id === placeId ? updatedPlace : p)));
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return { success: false, error: err instanceof Error ? err.message : "An error occurred" };
    }
  };

  const deletePlace = async (placeId: string) => {
    try {
      setError(undefined);
      const response = await fetch(`/api/plans/${planId}/places/${placeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete place");
      }

      setPlaces((current) => current.filter((p) => p.id !== placeId));
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return { success: false, error: err instanceof Error ? err.message : "An error occurred" };
    }
  };

  return {
    places,
    isLoading,
    error,
    fetchPlaces,
    createPlace,
    updatePlace,
    deletePlace,
  };
}
