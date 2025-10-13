import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const SYMBOLS = ["🍒", "🍋", "🍊", "🔔", "⭐", "💎", "7️⃣"];
const BET_AMOUNTS = [10, 25, 50, 100];

const PAYOUTS = {
  "💎💎💎": 100,
  "7️⃣7️⃣7️⃣": 50,
  "⭐⭐⭐": 25,
  "🔔🔔🔔": 15,
  "🍊🍊🍊": 10,
  "🍋🍋🍋": 8,
  "🍒🍒🍒": 5,
  // Two of a kind
  "💎💎": 10,
  "7️⃣7️⃣": 8,
  "⭐⭐": 5,
  "🔔🔔": 3,
  // Any cherry
  "🍒": 2,
};

export default function SlotMachineGame() {
  const [coins, setCoins] = useState(1000);
  const [bet, setBet] = useState(25);
  const [reels, setReels] = useState(["🍒", "🍋", "🍊"]);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const [jackpotCount, setJackpotCount] = useState(0);

  const reel1Anim = useRef(new Animated.Value(0)).current;
  const reel2Anim = useRef(new Animated.Value(0)).current;
  const reel3Anim = useRef(new Animated.Value(0)).current;

  const spin = () => {
    if (spinning || coins < bet) return;

    setCoins(coins - bet);
    setSpinning(true);
    setLastWin(0);
    setTotalSpins(totalSpins + 1);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Animate reels spinning
    const animations = [
      Animated.timing(reel1Anim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(reel2Anim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(reel3Anim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ];

    Animated.stagger(200, animations).start();

    // Generate results after animation
    setTimeout(() => {
      const newReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ];

      setReels(newReels);
      const winAmount = calculateWin(newReels);

      if (winAmount > 0) {
        setCoins(coins - bet + winAmount);
        setLastWin(winAmount);
        setTotalWins(totalWins + winAmount);

        if (newReels.join("") === "💎💎💎") {
          setJackpotCount(jackpotCount + 1);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }

      setSpinning(false);

      // Reset animations
      reel1Anim.setValue(0);
      reel2Anim.setValue(0);
      reel3Anim.setValue(0);
    }, 2000);
  };

  const calculateWin = (reels: string[]) => {
    const [reel1, reel2, reel3] = reels;

    // Check for three of a kind
    if (reel1 === reel2 && reel2 === reel3) {
      const key = `${reel1}${reel2}${reel3}` as keyof typeof PAYOUTS;
      return ((PAYOUTS[key] || 0) * bet) / 10;
    }

    // Check for two of a kind
    if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      const symbol = reel1 === reel2 ? reel1 : reel2 === reel3 ? reel2 : reel1;
      const key = `${symbol}${symbol}` as keyof typeof PAYOUTS;
      return ((PAYOUTS[key] || 0) * bet) / 10;
    }

    // Check for any cherry
    if (reels.includes("🍒")) {
      return (PAYOUTS["🍒"] * bet) / 10;
    }

    return 0;
  };

  const getWinMessage = () => {
    if (lastWin === 0) return "";

    const multiplier = lastWin / bet;
    if (reels.join("") === "💎💎💎") return "💎 DIAMOND JACKPOT! 💎";
    if (reels.join("") === "7️⃣7️⃣7️⃣") return "🎰 LUCKY SEVENS! 🎰";
    if (multiplier >= 10) return "🔥 BIG WIN! 🔥";
    if (multiplier >= 5) return "⭐ GREAT WIN! ⭐";
    if (multiplier >= 2) return "💰 NICE WIN! 💰";
    return "🍒 Winner! 🍒";
  };

  const getWinRate = () => {
    return totalSpins > 0
      ? Math.round((totalWins / (totalSpins * bet)) * 100)
      : 0;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title">Slot Machine</ThemedText>
          <ThemedText style={styles.subtitle}>
            Spin the 3-reel slots!
          </ThemedText>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{coins}</ThemedText>
            <ThemedText style={styles.statLabel}>Coins</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{bet}</ThemedText>
            <ThemedText style={styles.statLabel}>Bet</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{totalWins}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Wins</ThemedText>
          </View>
        </View>

        <View style={styles.slotMachine}>
          <View style={styles.reelsContainer}>
            {reels.map((symbol, index) => {
              const anim = [reel1Anim, reel2Anim, reel3Anim][index];
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.reel,
                    {
                      transform: [
                        {
                          rotateX: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "1440deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <ThemedText style={styles.symbol}>{symbol}</ThemedText>
                </Animated.View>
              );
            })}
          </View>

          {lastWin > 0 && (
            <View style={styles.winContainer}>
              <ThemedText style={styles.winMessage}>
                {getWinMessage()}
              </ThemedText>
              <ThemedText style={styles.winAmount}>+{lastWin} coins</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.betControls}>
          <ThemedText style={styles.betLabel}>Bet Amount:</ThemedText>
          <View style={styles.betButtons}>
            {BET_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.betButton,
                  bet === amount && styles.selectedBetButton,
                ]}
                onPress={() => setBet(amount)}
                disabled={spinning}
              >
                <ThemedText
                  style={[
                    styles.betButtonText,
                    bet === amount && styles.selectedBetButtonText,
                  ]}
                >
                  {amount}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.spinButton,
              (spinning || coins < bet) && styles.spinButtonDisabled,
            ]}
            onPress={spin}
            disabled={spinning || coins < bet}
          >
            <ThemedText style={styles.spinButtonText}>
              {spinning ? "SPINNING..." : "SPIN"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.payTable}>
          <ThemedText style={styles.payTableTitle}>
            Pay Table (x bet)
          </ThemedText>
          <View style={styles.payTableGrid}>
            <View style={styles.payTableRow}>
              <ThemedText style={styles.payTableSymbol}>💎💎💎</ThemedText>
              <ThemedText style={styles.payTablePayout}>100x</ThemedText>
            </View>
            <View style={styles.payTableRow}>
              <ThemedText style={styles.payTableSymbol}>7️⃣7️⃣7️⃣</ThemedText>
              <ThemedText style={styles.payTablePayout}>50x</ThemedText>
            </View>
            <View style={styles.payTableRow}>
              <ThemedText style={styles.payTableSymbol}>⭐⭐⭐</ThemedText>
              <ThemedText style={styles.payTablePayout}>25x</ThemedText>
            </View>
            <View style={styles.payTableRow}>
              <ThemedText style={styles.payTableSymbol}>🔔🔔🔔</ThemedText>
              <ThemedText style={styles.payTablePayout}>15x</ThemedText>
            </View>
            <View style={styles.payTableRow}>
              <ThemedText style={styles.payTableSymbol}>Any 🍒</ThemedText>
              <ThemedText style={styles.payTablePayout}>2x</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>Game Stats</ThemedText>
          <ThemedText style={styles.infoText}>
            • Total spins: {totalSpins}
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Win rate: {getWinRate()}%
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Jackpots hit: {jackpotCount}
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Higher bets = higher payouts
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
  slotMachine: {
    alignItems: "center",
    marginBottom: 30,
  },
  reelsContainer: {
    flexDirection: "row",
    backgroundColor: "#0E0E0E",
    borderRadius: 20,
    padding: 20,
    gap: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  reel: {
    width: 80,
    height: 80,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#D9A404",
  },
  symbol: {
    fontSize: 40,
    lineHeight: 46,
  },
  winContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  winMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D9A404",
  },
  winAmount: {
    fontSize: 16,
    color: "#BE952E",
    marginTop: 4,
  },
  betControls: {
    alignItems: "center",
    marginBottom: 30,
  },
  betLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  betButtons: {
    flexDirection: "row",
    gap: 10,
  },
  betButton: {
    backgroundColor: "rgba(217, 164, 4, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedBetButton: {
    backgroundColor: "#D9A404",
    borderColor: "#BE952E",
  },
  betButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  selectedBetButtonText: {
    color: "white",
  },
  controls: {
    alignItems: "center",
    marginBottom: 30,
  },
  spinButton: {
    backgroundColor: "#D9A404",
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  spinButtonDisabled: {
    backgroundColor: "#666",
  },
  spinButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  payTable: {
    backgroundColor: "rgba(217, 164, 4, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  payTableTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  payTableGrid: {
    gap: 8,
  },
  payTableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payTableSymbol: {
    fontSize: 16,
  },
  payTablePayout: {
    fontSize: 14,
    fontWeight: "bold",
  },
  infoContainer: {
    backgroundColor: "rgba(217, 164, 4, 0.1)",
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
