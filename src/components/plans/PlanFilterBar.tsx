import { useCallback, useMemo } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectOption, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import type { FilterState, PlanStatus, SortOption } from "../../types";

const SORT_OPTIONS: SortOption[] = [
  { value: "created_at.desc", label: "Newest first" },
  { value: "created_at.asc", label: "Oldest first" },
  { value: "name.asc", label: "Name A-Z" },
  { value: "name.desc", label: "Name Z-A" },
];

const STATUS_OPTIONS: PlanStatus[] = ["draft", "in_progress", "completed", "generated"];

const STATUS_LABELS: Record<PlanStatus, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
  generated: "Generated",
};

interface PlanFilterBarProps {
  filters: FilterState;
  sort: SortOption;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sort: SortOption) => void;
}

export function PlanFilterBar({
  filters = { status: [], search: "" },
  sort,
  onFiltersChange,
  onSortChange,
}: PlanFilterBarProps) {
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({
        ...filters,
        search: event.target.value,
      });
    },
    [filters, onFiltersChange]
  );

  const handleStatusToggle = useCallback(
    (status: PlanStatus) => {
      const currentStatuses = filters.status ?? [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter((s) => s !== status)
        : [...currentStatuses, status];

      onFiltersChange({
        ...filters,
        status: newStatuses.length > 0 ? newStatuses : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const newSort = SORT_OPTIONS.find((option) => option.value === value);
      if (newSort) {
        onSortChange(newSort);
      }
    },
    [onSortChange]
  );

  const selectedStatuses = useMemo(() => filters.status ?? [], [filters.status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="search"
          placeholder="Search plans..."
          value={filters.search ?? ""}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <Select value={sort.value} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((status) => {
          const isSelected = selectedStatuses.includes(status);
          return (
            <Badge
              key={status}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent"
              onClick={() => handleStatusToggle(status)}
            >
              {STATUS_LABELS[status]}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
