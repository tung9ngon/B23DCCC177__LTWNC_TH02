import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

/** Context riêng cho theme, không gộp với Context nào khác để đổi theme chỉ ảnh hưởng nơi dùng theme */
export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme phải được dùng bên trong <ThemeProvider>');
  return ctx;
}
