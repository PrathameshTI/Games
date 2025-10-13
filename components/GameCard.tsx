import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
}

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(game.route as any);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedText style={styles.icon}>{game.icon}</ThemedText>
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>{game.title}</ThemedText>
          <ThemedText style={styles.description}>{game.description}</ThemedText>
        </ThemedView>
        <ThemedText style={styles.arrow}>▶</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 164, 4, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(217, 164, 4, 0.3)',
  },
  icon: {
    fontSize: 32,
    lineHeight: 38,
    marginRight: 16,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    marginBottom: 4,
  },
  description: {
    opacity: 0.7,
    fontSize: 14,
  },
  arrow: {
    fontSize: 16,
    opacity: 0.5,
  },
});