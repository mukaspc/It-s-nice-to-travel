import type { PlaceDTO } from "../../../types";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { format } from "date-fns";

interface PlaceListProps {
  places: PlaceDTO[];
  isLoading: boolean;
  error?: string;
  onEdit: (place: PlaceDTO) => (e: React.MouseEvent) => void;
  onDelete: (place: PlaceDTO) => (e: React.MouseEvent) => void;
}

export function PlaceList({ places, isLoading, error, onEdit, onDelete }: PlaceListProps) {
  if (isLoading) {
    return <div>Loading places...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  if (places.length === 0) {
    return <div className="text-muted-foreground">No places added yet.</div>;
  }

  return (
    <div className="space-y-4">
      {places.map((place) => (
        <Card key={place.id}>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">{place.name}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit(place)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={onDelete(place)}>
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent className="py-3">
            <div className="text-sm text-muted-foreground">
              <div>
                {format(new Date(place.start_date), "MMM d, yyyy")} - {format(new Date(place.end_date), "MMM d, yyyy")}
              </div>
              {place.note && <div className="mt-2">{place.note}</div>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
