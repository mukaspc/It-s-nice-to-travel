import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { usePlaces } from "../../../hooks/usePlaces";
import type { PlaceDTO, CreatePlaceCommandDTO, UpdatePlaceCommandDTO } from "../../../types";
import { PlaceFormDialog } from "./PlaceFormDialog";
import { PlaceList } from "./PlaceList";
import { DeleteConfirmDialog } from "../../ui/delete-confirm-dialog";

interface PlacesSectionProps {
  planId: string;
  planStartDate: string;
  planEndDate: string;
}

export function PlacesSection({ planId, planStartDate, planEndDate }: PlacesSectionProps) {
  const [selectedPlace, setSelectedPlace] = useState<PlaceDTO>();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { places, isLoading, error, fetchPlaces, createPlace, updatePlace, deletePlace } = usePlaces({
    planId,
  });

  useEffect(() => {
    // Fetch places only once on component mount
    fetchPlaces();
  }, [fetchPlaces]);

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPlace(undefined);
    setFormOpen(true);
  };

  const handleEditClick = (place: PlaceDTO) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPlace(place);
    setFormOpen(true);
  };

  const handleDeleteClick = (place: PlaceDTO) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPlace(place);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreatePlaceCommandDTO | UpdatePlaceCommandDTO) => {
    if (selectedPlace) {
      const result = await updatePlace(selectedPlace.id, data);
      if (result.success) {
        setFormOpen(false);
        setSelectedPlace(undefined);
      }
      return result;
    } else {
      const result = await createPlace(data);
      if (result.success) {
        setFormOpen(false);
      }
      return result;
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedPlace(undefined);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPlace) {
      const result = await deletePlace(selectedPlace.id);
      if (result.success) {
        setDeleteDialogOpen(false);
        setSelectedPlace(undefined);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPlace(undefined);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Places</CardTitle>
        <Button type="button" onClick={handleAddClick} disabled={isLoading}>
          Add Place
        </Button>
      </CardHeader>
      <CardContent>
        <PlaceList
          places={places}
          isLoading={isLoading}
          error={error}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

        <PlaceFormDialog
          isOpen={isFormOpen}
          initialData={selectedPlace}
          planStartDate={planStartDate}
          planEndDate={planEndDate}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />

        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          title="Delete Place"
          description={`Are you sure you want to delete ${selectedPlace?.name}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </CardContent>
    </Card>
  );
}
