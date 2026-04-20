"use client";

import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { CompareProvider } from './CompareContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CompareProvider>
          {children}
        </CompareProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
