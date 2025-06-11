import type { PlanListItemDTO } from "../../types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CalendarDays, Users, Edit, Trash2, Wand2, Map } from "lucide-react";
import { format } from "date-fns";

interface PlanCardProps {
  plan: PlanListItemDTO;
  onEdit: () => void;
  onDelete: () => void;
  onGenerate: () => void;
  onExplore: () => void;
}

const STATUS_COLORS: Record<PlanListItemDTO["status"], "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  generated: "default",
};

export function PlanCard({ plan, onEdit, onDelete, onGenerate, onExplore }: PlanCardProps) {
  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold line-clamp-2">{plan.name}</CardTitle>
          <Badge variant={STATUS_COLORS[plan.status]} className="ml-2">
            {plan.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-2" />
            <span>
              {format(new Date(plan.start_date), "MMM d, yyyy")} - {format(new Date(plan.end_date), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{plan.people_count} people</span>
          </div>
          {plan.note && <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{plan.note}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-1" onClick={onEdit}>
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        <Button variant="outline" size="sm" className="gap-1" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        {plan.status === "generated" ? (
          <Button variant="default" size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={onExplore}>
            <Map className="h-4 w-4" />
            Explore plan
          </Button>
        ) : (
          <Button variant="default" size="sm" className="gap-1" onClick={onGenerate}>
            <Wand2 className="h-4 w-4" />
            Generate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
