'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationContextType {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
  openMobileNav: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();

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

  const toggleMobileNav = () => setIsMobileNavOpen(prev => !prev);
  const closeMobileNav = () => setIsMobileNavOpen(false);
  const openMobileNav = () => setIsMobileNavOpen(true);

  return (
    <NavigationContext.Provider
      value={{
        isMobileNavOpen,
        setIsMobileNavOpen,
        toggleMobileNav,
        closeMobileNav,
        openMobileNav,
      }}
    >
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
    };
  }
  return context;
}
