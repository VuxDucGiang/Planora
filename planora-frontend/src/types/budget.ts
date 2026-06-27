export interface BudgetItemResponse {
  itemId: number;
  categoryId: number;
  categoryName: string;
  estimatedCost: number;
  actualCost: number;
  note?: string;
}

export interface BudgetResponse {
  totalBudget: number;
  totalEstimated: number;
  totalActualSpent: number;
  categories: BudgetItemResponse[];
}

export interface UpdateBudgetItemRequest {
  estimatedCost?: number;
  actualCost?: number;
  note?: string;
}
