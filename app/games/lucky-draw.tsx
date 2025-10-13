import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const DRAW_COST = 25;
const PRIZES = [
  { name: "Jackpot", value: 1000, chance: 0.01, color: "#FFD700" },
  { name: "Big Win", value: 500, chance: 0.03, color: "#FF6B6B" },
  { name: "Great", value: 200, chance: 0.08, color: "#4ECDC4" },
  { name: "Good", value: 100, chance: 0.15, color: "#45B7D1" },
  { name: "Nice", value: 50, chance: 0.25, color: "#96CEB4" },
  { name: "Small", value: 25, chance: 0.3, color: "#FFEAA7" },
  { name: "Try Again", value: 0, chance: 0.18, color: "#DDA0DD" },
];

export default function LuckyDrawGame() {
  const [coins, setCoins] = useState(1000);
  const [drawing, setDrawing] = useState(false);
  const [lastPrize, setLastPrize] = useState<(typeof PRIZES)[0] | null>(null);
  const [totalDraws, setTotalDraws] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [drawHistory, setDrawHistory] = useState<(typeof PRIZES)[0][]>([]);

  const boxAnimation = useRef(new Animated.Value(0)).current;
  const prizeAnimation = useRef(new Animated.Value(0)).current;

  const performDraw = () => {
    if (coins < DRAW_COST || drawing) return;

    setCoins(coins - DRAW_COST);
    setDrawing(true);
    setLastPrize(null);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Animate the draw box
    Animated.sequence([
      Animated.timing(boxAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(boxAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      const random = Math.random();
      let cumulativeChance = 0;
      let selectedPrize = PRIZES[PRIZES.length - 1]; // Default to last prize

      for (const prize of PRIZES) {
        cumulativeChance += prize.chance;
        if (random <= cumulativeChance) {
          selectedPrize = prize;
          break;
        }
      }

      setLastPrize(selectedPrize);
      setTotalDraws(totalDraws + 1);
      setDrawHistory([selectedPrize, ...drawHistory.slice(0, 9)]); // Keep last 10

      if (selectedPrize.value > 0) {
        setCoins((prevCoins) => prevCoins + selectedPrize.value);
        setTotalWins((prevWins) => prevWins + selectedPrize.value);

        if (selectedPrize.value >= 500) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }

      // Animate prize reveal
      Animated.spring(prizeAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      setDrawing(false);
    }, 1500);
  };

  const resetPrizeAnimation = () => {
    prizeAnimation.setValue(0);
  };

  const getPrizeMessage = () => {
    if (!lastPrize) return "";

    switch (lastPrize.name) {
      case "Jackpot":
        return "🎉 JACKPOT! INCREDIBLE! 🎉";
      case "Big Win":
        return "🔥 BIG WIN! AMAZING! 🔥";
      case "Great":
        return "⭐ GREAT PRIZE! ⭐";
      case "Good":
        return "👍 GOOD WIN! 👍";
      case "Nice":
        return "💰 NICE! 💰";
      case "Small":
        return "🪙 Small Win! 🪙";
      default:
        return "😔 Better luck next time! 😔";
    }
  };

  const getDrawBoxIcon = () => {
    if (drawing) return "📦";
    return "🎁";
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title">Lucky Draw</ThemedText>
          <ThemedText style={styles.subtitle}>
            Draw your lucky prize!
          </ThemedText>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{coins}</ThemedText>
            <ThemedText style={styles.statLabel}>Coins</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{totalDraws}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Draws</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{totalWins}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Wins</ThemedText>
          </View>
        </View>

        <View style={styles.drawContainer}>
          <Animated.View
            style={[
              styles.drawBox,
              {
                transform: [
                  {
                    scale: boxAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                  {
                    rotateZ: boxAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <ThemedText style={styles.drawBoxIcon}>
              {getDrawBoxIcon()}
            </ThemedText>
          </Animated.View>

          <TouchableOpacity
            style={[
              styles.drawButton,
              (drawing || coins < DRAW_COST) && styles.drawButtonDisabled,
            ]}
            onPress={performDraw}
            disabled={drawing || coins < DRAW_COST}
          >
            <ThemedText style={styles.drawButtonText}>
              {drawing ? "DRAWING..." : `DRAW (${DRAW_COST} coins)`}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {lastPrize && (
          <Animated.View
            style={[
              styles.prizeContainer,
              {
                transform: [
                  {
                    scale: prizeAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
                opacity: prizeAnimation,
              },
            ]}
          >
            <View
              style={[styles.prizeBox, { backgroundColor: lastPrize.color }]}
            >
              <ThemedText style={styles.prizeMessage}>
                {getPrizeMessage()}
              </ThemedText>
              <ThemedText style={styles.prizeName}>{lastPrize.name}</ThemedText>
              {lastPrize.value > 0 && (
                <ThemedText style={styles.prizeValue}>
                  +{lastPrize.value} coins
                </ThemedText>
              )}
            </View>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={resetPrizeAnimation}
            >
              <ThemedText style={styles.continueButtonText}>
                CONTINUE
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        )}

        {drawHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <ThemedText style={styles.historyTitle}>Recent Draws</ThemedText>
            <View style={styles.historyList}>
              {drawHistory.slice(0, 5).map((prize, index) => (
                <View
                  key={index}
                  style={[styles.historyItem, { backgroundColor: prize.color }]}
                >
                  <ThemedText style={styles.historyText}>
                    {prize.name} {prize.value > 0 && `(${prize.value})`}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.prizeTable}>
          <ThemedText style={styles.prizeTableTitle}>Prize Table</ThemedText>
          {PRIZES.map((prize, index) => (
            <View key={index} style={styles.prizeTableRow}>
              <View
                style={[
                  styles.prizeTableColor,
                  { backgroundColor: prize.color },
                ]}
              />
              <ThemedText style={styles.prizeTableName}>
                {prize.name}
              </ThemedText>
              <ThemedText style={styles.prizeTableValue}>
                {prize.value > 0 ? `${prize.value} coins` : "No prize"}
              </ThemedText>
              <ThemedText style={styles.prizeTableChance}>
                {(prize.chance * 100).toFixed(1)}%
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>Game Info</ThemedText>
          <ThemedText style={styles.infoText}>
            • Each draw costs {DRAW_COST} coins
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Higher value prizes are rarer
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Jackpot pays 40x your draw cost!
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • 82% chance to win something
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 8,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    opacity: 0.7,
    fontSize: 12,
    marginTop: 4,
  },
  drawContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  drawBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  drawBoxIcon: {
    fontSize: 60,
    lineHeight: 60,
    borderRadius: 60,
  },
  drawButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  drawButtonDisabled: {
    backgroundColor: "#666",
  },
  drawButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  prizeContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  prizeBox: {
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  prizeMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  prizeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  prizeValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  continueButton: {
    backgroundColor: "#34C759",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  continueButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  historyContainer: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  historyList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  historyItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  historyText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  prizeTable: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  prizeTableTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  prizeTableRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  prizeTableColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  prizeTableName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
  },
  prizeTableValue: {
    flex: 1,
    fontSize: 12,
    textAlign: "center",
  },
  prizeTableChance: {
    fontSize: 12,
    fontWeight: "bold",
    minWidth: 40,
    textAlign: "right",
  },
  infoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
});
