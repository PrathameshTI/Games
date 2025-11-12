import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '../theme/ThemeProvider';

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  icon?: string;
}

export default function ThemedButton({
  title,
  variant = 'primary',
  loading = false,
  icon,
  style,
  disabled,
  ...props
}: ThemedButtonProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#000000';
      case 'outline':
        return theme.colors.primary;
      default:
        return '#000000';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'outline' ? theme.colors.primary : 'transparent',
          borderWidth: variant === 'outline' ? 2 : 0,
        },
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
          <ThemedText style={[styles.text, { color: getTextColor() }]}>{title}</ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    fontSize: 20,
  },
});
