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
  percentage?: number;
  isPriority?: boolean;
  note?: string;
}

export interface ConceptSummary {
  conceptName: string;
  description?: string;
  estimatedBudget: number;
  colorPalette?: string[];
  floralTheme?: string;
  vibe?: string;
  decorNote?: string;
}

export interface ChecklistStats {
  totalTasks: number;
  completedTasks: number;
}

export interface ChecklistTaskSummary {
  id: number;
  weddingPlanId?: number;
  title: string;
  description?: string;
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  phase?: string;
  categoryName?: string;
}

export interface TimelineEventSummary {
  id: number;
  weddingPlanId?: number;
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  location?: string;
  session?: 'MORNING' | 'EVENING';
}

export interface BudgetAnalytics {
  costPerGuest: number;
  estimatedTables: number;
  tableCostEstimated: number;
  contingencyBuffer: number;
  totalAllocated: number;
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
  checklistTasks?: ChecklistTaskSummary[];
  timelineEvents?: TimelineEventSummary[];
  budgetAnalytics?: BudgetAnalytics;
}
