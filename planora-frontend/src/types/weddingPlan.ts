export interface WeddingStyle {
  id: number;
  name: string;
  description?: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
}

export interface OnboardingRequest {
  title: string;
  weddingDate: string; // YYYY-MM-DD
  location: string;
  guestCount: number;
  budget: number;
  styleIds: number[];
  priorityCategoryIds: number[];
}

export interface BudgetItemSummary {
  categoryName: string;
  estimatedCost: number;
  actualCost: number;
  note?: string;
}

export interface ConceptSummary {
  conceptName: string;
  description?: string;
  estimatedBudget: number;
}

export interface ChecklistStats {
  totalTasks: number;
  completedTasks: number;
}

export interface ActivePlanResponse {
  id: number;
  title: string;
  weddingDate: string; // YYYY-MM-DD
  guestCount: number;
  budget: number;
  location: string;
  status: string;
  budgetItems?: BudgetItemSummary[];
  conceptSuggestions?: ConceptSummary[];
  checklistStats?: ChecklistStats;
}
