export interface AdminSummaryResponse {
  totalUsers: number;
  totalCouples: number;
  totalVendors: number;
  dailyActiveUsers: number;
  totalPlansGenerated: number;
  totalInquiriesSent: number;
  planConversionRate: number;
}

export interface AdminFunnelResponse {
  registeredUsers: number;
  onboardingCompleted: number;
  planGenerated: number;
  vendorViewed: number;
  inquirySent: number;
}

export interface UserActivityItem {
  id: number;
  userId: number | null;
  userEmail: string | null;
  userFullName: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface PaginatedActivities {
  content: UserActivityItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UserJourneyResponse {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  activities: UserActivityItem[];
}

export interface BudgetBucket {
  rangeName: string;
  count: number;
  percentage: number;
}

export interface StylePopularity {
  styleName: string;
  count: number;
  percentage: number;
}

export interface GuestCountBucket {
  rangeName: string;
  count: number;
  percentage: number;
}

export interface AIPerformance {
  totalGenerations: number;
  averageLatencyMs: number;
  successRate: number;
  estimatedTokens: number;
}

export interface AIInsightResponse {
  budgetDistribution: BudgetBucket[];
  averageBudget: number;
  topStyles: StylePopularity[];
  guestCountDistribution: GuestCountBucket[];
  aiPerformance: AIPerformance;
}

export interface DormantUserItem {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  statusRisk: 'AT_RISK' | 'DORMANT';
  daysInactive: number;
  lastActiveAt: string;
  lastAction: string;
  weddingTitle?: string;
  weddingDate?: string;
  daysUntilWedding?: number;
  budget?: number;
}

export interface DormantAnalysisResponse {
  totalCouples: number;
  activeCount: number;
  atRiskCount: number;
  dormantCount: number;
  healthScore: number;
  dormantUsers: DormantUserItem[];
}
