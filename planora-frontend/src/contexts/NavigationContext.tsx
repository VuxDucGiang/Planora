'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationContextType {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
  openMobileNav: () => void;

  // Desktop sidebar collapse state
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapse: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState(false);
  const pathname = usePathname();

  // Restore saved collapse preference on mount (avoid hydration mismatch)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('planora_user_sidebar_collapsed');
      if (saved !== null) {
        setIsSidebarCollapsedState(saved === 'true');
      }
    }
  }, []);

  // Automatically close mobile nav drawer when navigating to a new route
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Lock background body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileNavOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isMobileNavOpen]);

  const toggleMobileNav = useCallback(() => setIsMobileNavOpen(prev => !prev), []);
  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);
  const openMobileNav = useCallback(() => setIsMobileNavOpen(true), []);

  const setIsSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsedState(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('planora_user_sidebar_collapsed', String(collapsed));
    }
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsedState((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('planora_user_sidebar_collapsed', String(next));
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isMobileNavOpen,
      setIsMobileNavOpen,
      toggleMobileNav,
      closeMobileNav,
      openMobileNav,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      toggleSidebarCollapse,
    }),
    [
      isMobileNavOpen,
      toggleMobileNav,
      closeMobileNav,
      openMobileNav,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      toggleSidebarCollapse,
    ]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      isMobileNavOpen: false,
      setIsMobileNavOpen: () => {},
      toggleMobileNav: () => {},
      closeMobileNav: () => {},
      openMobileNav: () => {},
      isSidebarCollapsed: false,
      setIsSidebarCollapsed: () => {},
      toggleSidebarCollapse: () => {},
    };
  }
  return context;
}
