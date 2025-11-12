import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '../theme/ThemeProvider';

export default function ThemeToggle() {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.icon}>{isDark ? '🌙' : '☀️'}</ThemedText>
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={isDark ? '#ffffff' : '#f4f3f4'}
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
});
