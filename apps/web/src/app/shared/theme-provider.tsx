import * as React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

// Simple theme provider that just renders children
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
