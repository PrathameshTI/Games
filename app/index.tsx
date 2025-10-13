import { GameCard } from "@/components/GameCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

const games = [
  {
    id: "spin-wheel",
    title: "Spin Wheel",
    description: "Spin the wheel of fortune!",
    icon: "🎡",
    route: "/games/spin-wheel",
  },
  {
    id: "scratch-card",
    title: "Scratch Card",
    description: "Scratch to reveal prizes",
    icon: "🎫",
    route: "/games/scratch-card",
  },
  {
    id: "trivia-quiz",
    title: "Trivia Quiz",
    description: "Test your knowledge",
    icon: "🧠",
    route: "/games/trivia-quiz",
  },
  {
    id: "tap-to-win",
    title: "Tap To Win",
    description: "Tap fast to win big!",
    icon: "⚡",
    route: "/games/tap-to-win",
  },
  {
    id: "memory-match",
    title: "Memory Match",
    description: "Match pairs of cards",
    icon: "🧩",
    route: "/games/memory-match",
  },
  {
    id: "lucky-draw",
    title: "Lucky Draw",
    description: "Draw your lucky number",
    icon: "🎲",
    route: "/games/lucky-draw",
  },
  {
    id: "treasure-hunt",
    title: "Treasure Hunt",
    description: "Find hidden treasures",
    icon: "💎",
    route: "/games/treasure-hunt",
  },
  {
    id: "whack-a-mole",
    title: "Whack-a-Mole",
    description: "Tap the moles quickly!",
    icon: "🔨",
    route: "/games/whack-a-mole",
  },
  {
    id: "bubble-pop",
    title: "Bubble Pop",
    description: "Pop colorful bubbles",
    icon: "🫧",
    route: "/games/bubble-pop",
  },
  {
    id: "slot-machine",
    title: "Slot Machine",
    description: "Spin the 3-reel slots",
    icon: "🎰",
    route: "/games/slot-machine",
  },
  {
    id: "word-scramble",
    title: "Word Scramble",
    description: "Unscramble the words",
    icon: "🔤",
    route: "/games/word-scramble",
  },
  {
    id: "reaction-tester",
    title: "Reaction Tester",
    description: "Test your reflexes",
    icon: "🚦",
    route: "/games/reaction-tester",
  },
  {
    id: "time-capsule",
    title: "Time Capsule",
    description: "One daily try to open capsule",
    icon: "🛸",
    route: "/games/time-capsule",
  },
  {
    id: "predict-win",
    title: "Predict & Win",
    description: "Answer prediction questions",
    icon: "📊",
    route: "/games/predict-win",
  },
  {
    id: "shake-to-win",
    title: "Shake & Win",
    description: "Shake phone to mix and win",
    icon: "🥤",
    route: "/games/shake-to-win",
  },
];

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Mini Games
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Play fun games and earn rewards!
      </ThemedText>

      <ScrollView style={styles.gamesList} showsVerticalScrollIndicator={false}>
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60, // Add top padding for status bar
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  gamesList: {
    flex: 1,
  },
});
