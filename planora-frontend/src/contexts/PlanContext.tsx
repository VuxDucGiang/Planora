'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ActivePlanResponse } from '@/types/weddingPlan';
import { getActivePlan, deleteActivePlan as apiDeleteActivePlan } from '@/services/weddingPlan';
import { useAuth } from './AuthContext';

interface PlanContextType {
  plan: ActivePlanResponse | null;
  planId: number | null;
  daysLeft: number;
  isLoadingPlan: boolean;
  refreshPlan: () => Promise<ActivePlanResponse | null>;
  setPlan: React.Dispatch<React.SetStateAction<ActivePlanResponse | null>>;
  deletePlan: () => Promise<void>;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [plan, setPlan] = useState<ActivePlanResponse | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);

  const calculateDaysLeft = (weddingDateStr?: string | null): number => {
    if (!weddingDateStr) return 0;
    try {
      const diffTime = new Date(weddingDateStr).getTime() - new Date().getTime();
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch {
      return 0;
    }
  };

  const refreshPlan = useCallback(async (): Promise<ActivePlanResponse | null> => {
    if (!isAuthenticated) {
      setPlan(null);
      setDaysLeft(0);
      setIsLoadingPlan(false);
      return null;
    }

    try {
      if (!hasLoadedOnce) {
        setIsLoadingPlan(true);
      }
      const activePlan = await getActivePlan();
      setPlan(activePlan);
      setDaysLeft(calculateDaysLeft(activePlan?.weddingDate));
      setHasLoadedOnce(true);
      return activePlan;
    } catch (err) {
      console.warn('Plan fetch failed:', err);
      return null;
    } finally {
      setIsLoadingPlan(false);
    }
  }, [isAuthenticated, hasLoadedOnce]);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      refreshPlan();
    } else {
      setPlan(null);
      setDaysLeft(0);
      setIsLoadingPlan(false);
      setHasLoadedOnce(false);
    }
  }, [authLoading, isAuthenticated, refreshPlan]);

  const deletePlan = async () => {
    await apiDeleteActivePlan();
    setPlan(null);
    setDaysLeft(0);
  };

  return (
    <PlanContext.Provider
      value={{
        plan,
        planId: plan?.id ?? null,
        daysLeft,
        isLoadingPlan,
        refreshPlan,
        setPlan,
        deletePlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
