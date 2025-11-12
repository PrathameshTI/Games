import { useTheme } from '@/src/theme/ThemeProvider';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: string
) {
  const { theme, isDark } = useTheme();
  const colorFromProps = isDark ? props.dark : props.light;

  if (colorFromProps) {
    return colorFromProps;
  }

  if (colorName) {
    return (theme.colors as any)[colorName] || theme.colors.text;
  }

  return theme.colors.text;
}
