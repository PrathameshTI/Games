import { useTheme } from '../theme/ThemeProvider';

export default function useThemedStyles() {
  const { theme, isDark } = useTheme();

  return {
    theme,
    isDark,
    colors: theme.colors,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    typography: theme.typography,
  };
}
