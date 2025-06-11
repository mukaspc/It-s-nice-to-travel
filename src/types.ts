import type { Database } from "./db/database.types";

/**
 * Plan status type
 */
export type PlanStatus = "draft" | "generated";

// ===== Plan DTOs =====

/**
 * Plan item as returned in list endpoints
 */
export interface PlanListItemDTO {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  people_count: number;
  note: string | null;
  travel_preferences: string | null;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
  places_count: number; // Computed field
}

/**
 * Response for plan list endpoint with pagination
 */
export interface PlanListResponseDTO {
  data: PlanListItemDTO[];
  meta: {
    total_count: number;
    page_count: number;
  };
}

/**
 * Basic plan data without related entities
 */
export interface PlanDTO {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  people_count: number;
  note: string | null;
  travel_preferences: string | null;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Plan data with related places and generated plan indicator
 */
export interface PlanDetailDTO extends Omit<PlanDTO, "places_count"> {
  places: PlaceDTO[];
  has_generated_plan: boolean; // Indicates if the plan has a generated AI plan
}

// ===== Plan Command Models =====

/**
 * Command for creating a new plan
 */
export interface CreatePlanCommandDTO {
  name: string;
  start_date: string;
  end_date: string;
  people_count: number;
  note?: string | null;
  travel_preferences?: string | null;
}

/**
 * Command for updating an existing plan
 */
export interface UpdatePlanCommandDTO {
  name: string;
  start_date: string;
  end_date: string;
  people_count: number;
  note?: string | null;
  travel_preferences?: string | null;
}

/**
 * Command for generating an AI plan
 */
export interface GeneratePlanCommand {
  planId: string;
  userId: string;
}

// ===== Place DTOs =====

/**
 * Place information
 */
export interface PlaceDTO {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

// ===== Place Command Models =====

/**
 * Command for creating a new place
 */
export interface CreatePlaceCommandDTO {
  name: string;
  start_date: string;
  end_date: string;
  note?: string | null;
}

/**
 * Command for updating an existing place
 */
export interface UpdatePlaceCommandDTO {
  name: string;
  start_date: string;
  end_date: string;
  note?: string | null;
}

// ===== Generated Plan DTOs =====

/**
 * Response when initiating a plan generation
 */
export interface GeneratePlanResponseDTO {
  id: string;
  status: "processing";
  estimated_time: number; // In seconds
}

/**
 * Status of a plan generation process
 */
export interface GeneratedPlanStatusDTO {
  status: "processing" | "completed" | "failed";
  progress: number; // 0-100 percentage
  estimated_time_remaining: number; // In seconds
}

/**
 * Schedule item for a specific time slot in a generated plan
 */
export interface ScheduleItemDTO {
  time: string;
  activity: string;
  address: string;
  description: string;
  image_url: string;
}

/**
 * Dining recommendation in a generated plan
 */
export interface DiningRecommendationDTO {
  type: "breakfast" | "lunch" | "dinner";
  name: string;
  address: string;
  description: string;
  image_url: string;
}

/**
 * Day plan details in a generated plan
 */
export interface DayPlanDTO {
  date: string;
  schedule: ScheduleItemDTO[];
  dining_recommendations: DiningRecommendationDTO[];
}

/**
 * Place-specific plan details in a generated plan
 */
export interface PlacePlanDTO {
  name: string;
  days: DayPlanDTO[];
}

/**
 * Content structure of a generated plan
 */
export interface GeneratedPlanContentDTO {
  version: string;
  places: PlacePlanDTO[];
}

/**
 * Complete generated plan object
 */
export interface GeneratedPlanDTO {
  id: string;
  content: GeneratedPlanContentDTO;
  created_at: string;
  updated_at: string;
}

// ===== Travel Preference DTOs =====

/**
 * Travel preference tag
 */
export interface TravelPreferenceDTO {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

// ===== Utility Types =====

/**
 * Maps database tables to their corresponding DTOs
 */
export interface DatabaseToDTO {
  generated_user_plans: PlanDTO;
  places: PlaceDTO;
  generated_ai_plans: GeneratedPlanDTO;
  travel_preferences: TravelPreferenceDTO;
}

/**
 * Maps each entity to its creation command
 */
export interface EntityToCommandDTO {
  plan: CreatePlanCommandDTO;
  place: CreatePlaceCommandDTO;
}

/**
 * Sort option for plan list
 */
export interface SortOption {
  value: "created_at.desc" | "created_at.asc" | "name.asc" | "name.desc";
  label: string;
}

/**
 * Filter state for plan list
 */
export interface FilterState {
  status?: PlanStatus[];
  search?: string;
}

/**
 * View model for plan list
 */
export interface PlanListViewModel {
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
