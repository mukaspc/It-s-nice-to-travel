import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/dom";
import { render } from "../../test/test-utils";
import { PlanCard } from "./PlanCard";
import type { PlanListItemDTO } from "../../types";

describe("PlanCard", () => {
  const mockPlan: PlanListItemDTO = {
    id: "1",
    name: "Summer Vacation",
    start_date: "2024-07-01",
    end_date: "2024-07-15",
    people_count: 4,
    note: "Family trip to the beach",
    travel_preferences: null,
    status: "draft",
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-03-15T10:00:00Z",
    places_count: 3,
  };

  const defaultProps = {
    plan: mockPlan,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onGenerate: vi.fn(),
  };

  it("renders plan details correctly", () => {
    render(<PlanCard {...defaultProps} />);

    expect(screen.getByText("Summer Vacation")).toBeInTheDocument();
    expect(screen.getByText("4 people")).toBeInTheDocument();
    expect(screen.getByText("Family trip to the beach")).toBeInTheDocument();
    expect(screen.getByText("draft")).toBeInTheDocument();
    expect(screen.getByText("Jul 1, 2024 - Jul 15, 2024")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const { user } = render(<PlanCard {...defaultProps} />);

    await user.click(screen.getByText("Edit"));
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete when delete button is clicked", async () => {
    const { user } = render(<PlanCard {...defaultProps} />);

    await user.click(screen.getByText("Delete"));
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it("shows generate button for non-generated plans", () => {
    render(<PlanCard {...defaultProps} />);
    expect(screen.getByText("Generate")).toBeInTheDocument();
  });

  it("hides generate button for generated plans", () => {
    const generatedPlan = {
      ...mockPlan,
      status: "generated" as const,
    };
    render(<PlanCard {...defaultProps} plan={generatedPlan} />);
    expect(screen.queryByText("Generate")).not.toBeInTheDocument();
  });

  it("calls onGenerate when generate button is clicked", async () => {
    const { user } = render(<PlanCard {...defaultProps} />);

    await user.click(screen.getByText("Generate"));
    expect(defaultProps.onGenerate).toHaveBeenCalledTimes(1);
  });
});
