export type ThemeType = "light" | "dark";

export interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}
