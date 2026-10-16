'use client';

import { useCallback } from 'react';

export type UserAction =
  | 'LOGIN'
  | 'REGISTER'
  | 'ONBOARDING_COMPLETED'
  | 'GENERATE_PLAN'
  | 'SAVE_PLAN'
  | 'VIEW_VENDOR'
  | 'ADD_TO_SHORTLIST'
  | 'SEND_INQUIRY'
  | 'UPDATE_BUDGET'
  | 'COMPLETE_CHECKLIST_ITEM';

export type EntityType =
  | 'USER'
  | 'PLAN'
  | 'VENDOR'
  | 'INQUIRY'
  | 'BUDGET_ITEM'
  | 'CHECKLIST_ITEM'
  | 'PAGE';

export function useTracker() {
  const track = useCallback(
    (
      action: UserAction,
      entityType?: EntityType,
      entityId?: string | number,
      metadata?: Record<string, any>
    ) => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Planora Tracker] ${action}`, { entityType, entityId, metadata });
        }
      } catch (err) {
        console.warn('Tracking error:', err);
      }
    },
    []
  );

  return { track };
}
