import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const CAPSULE_PRIZES = [
  { name: "Nothing", value: 0, emoji: "💨", chance: 0.4, type: "nothing" },
  { name: "50 Coins", value: 50, emoji: "🪙", chance: 0.25, type: "coins" },
  { name: "100 Coins", value: 100, emoji: "💰", chance: 0.15, type: "coins" },
  {
    name: "10% Discount",
    value: 10,
    emoji: "🎫",
    chance: 0.1,
    type: "discount",
  },
  { name: "200 Coins", value: 200, emoji: "💎", chance: 0.07, type: "coins" },
  {
    name: "20% Discount",
    value: 20,
    emoji: "🎟️",
    chance: 0.025,
    type: "discount",
  },
  { name: "JACKPOT!", value: 500, emoji: "🏆", chance: 0.005, type: "coins" },
];

export default function TimeCapsuleGame() {
  const [coins, setCoins] = useState(1000);
  const [discounts, setDiscounts] = useState<number[]>([]);
  const [lastOpened, setLastOpened] = useState<string | null>(null);
  const [canOpen, setCanOpen] = useState(true);
  const [opening, setOpening] = useState(false);
  const [lastPrize, setLastPrize] = useState<(typeof CAPSULE_PRIZES)[0] | null>(
    null
  );
  const [totalOpened, setTotalOpened] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [streak, setStreak] = useState(0);

  const capsuleAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkDailyReset();
    startGlowAnimation();
  }, []);

  const startGlowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const checkDailyReset = () => {
    const today = new Date().toDateString();
    const lastOpenedDate = lastOpened;

    if (lastOpenedDate !== today) {
      setCanOpen(true);
    } else {
      setCanOpen(false);
    }
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const openCapsule = () => {
    if (!canOpen || opening) return;

    setOpening(true);
    setLastPrize(null);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Animate capsule opening
    Animated.sequence([
      Animated.timing(capsuleAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(capsuleAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      const prize = drawPrize();
      setLastPrize(prize);
      setTotalOpened(totalOpened + 1);

      // Apply prize
      switch (prize.type) {
        case "coins":
          if (prize.value > 0) {
            setCoins(coins + prize.value);
            setTotalWins(totalWins + prize.value);
            setStreak(streak + 1);
          } else {
            setStreak(0);
          }
          break;
        case "discount":
          setDiscounts([...discounts, prize.value]);
          setStreak(streak + 1);
          break;
        default:
          setStreak(0);
          break;
      }

      // Mark as opened today
      setLastOpened(new Date().toDateString());
      setCanOpen(false);
      setOpening(false);

      if (prize.value > 0 || prize.type === "discount") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 1500);
  };

  const drawPrize = () => {
    const random = Math.random();
    let cumulativeChance = 0;

    for (const prize of CAPSULE_PRIZES) {
      cumulativeChance += prize.chance;
      if (random <= cumulativeChance) {
        return prize;
      }
    }

    return CAPSULE_PRIZES[0]; // Fallback to nothing
  };

  const getPrizeMessage = () => {
    if (!lastPrize) return "";

    if (lastPrize.name === "JACKPOT!") return "🎉 JACKPOT HIT! 🎉";
    if (lastPrize.value >= 200) return "💎 AMAZING FIND! 💎";
    if (lastPrize.type === "discount") return "🎫 DISCOUNT UNLOCKED! 🎫";
    if (lastPrize.value > 0) return "🪙 COINS FOUND! 🪙";
    return "💨 Empty capsule... 💨";
  };

  const getStreakMessage = () => {
    if (streak >= 7) return "🔥 LEGENDARY STREAK! 🔥";
    if (streak >= 5) return "⚡ HOT STREAK! ⚡";
    if (streak >= 3) return "🎯 GOOD STREAK! 🎯";
    return "";
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title">Time Capsule</ThemedText>
          <ThemedText style={styles.subtitle}>
            One daily try to open the mystery capsule!
          </ThemedText>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{coins}</ThemedText>
            <ThemedText style={styles.statLabel}>Coins</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{discounts.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Discounts</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{streak}</ThemedText>
            <ThemedText style={styles.statLabel}>Streak</ThemedText>
          </View>
        </View>

        {streak > 2 && (
          <View style={styles.streakContainer}>
            <ThemedText style={styles.streakText}>
              {getStreakMessage()}
            </ThemedText>
          </View>
        )}

        <View style={styles.capsuleContainer}>
          <Animated.View
            style={[
              styles.capsuleGlow,
              {
                opacity: canOpen
                  ? glowAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.8],
                    })
                  : 0,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.capsule,
              {
                transform: [
                  {
                    scale: capsuleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                  {
                    rotateZ: capsuleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.capsuleButton}
              onPress={openCapsule}
              disabled={!canOpen || opening}
            >
              <ThemedText style={styles.capsuleEmoji}>🛸</ThemedText>
            </TouchableOpacity>
          </Animated.View>

          {opening && (
            <ThemedText style={styles.openingText}>
              Opening capsule...
            </ThemedText>
          )}
        </View>

        {!canOpen && !lastPrize && (
          <View style={styles.waitContainer}>
            <ThemedText style={styles.waitTitle}>
              Capsule Already Opened Today
            </ThemedText>
            <ThemedText style={styles.waitText}>
              Next capsule available in: {getTimeUntilReset()}
            </ThemedText>
          </View>
        )}

        {lastPrize && (
          <View style={styles.prizeContainer}>
            <ThemedText style={styles.prizeMessage}>
              {getPrizeMessage()}
            </ThemedText>
            <View style={styles.prizeBox}>
              <ThemedText style={styles.prizeEmoji}>
                {lastPrize.emoji}
              </ThemedText>
              <ThemedText style={styles.prizeName}>{lastPrize.name}</ThemedText>
              {lastPrize.type === "discount" && (
                <ThemedText style={styles.prizeSubtext}>
                  Use on your next booking!
                </ThemedText>
              )}
            </View>

            <ThemedText style={styles.nextCapsuleText}>
              Next capsule in: {getTimeUntilReset()}
            </ThemedText>
          </View>
        )}

        {discounts.length > 0 && (
          <View style={styles.discountsContainer}>
            <ThemedText style={styles.discountsTitle}>
              Your Discounts
            </ThemedText>
            <View style={styles.discountsList}>
              {discounts.map((discount, index) => (
                <View key={index} style={styles.discountItem}>
                  <ThemedText style={styles.discountEmoji}>🎫</ThemedText>
                  <ThemedText style={styles.discountText}>
                    {discount}% OFF
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.prizeTable}>
          <ThemedText style={styles.prizeTableTitle}>
            Capsule Contents
          </ThemedText>
          {CAPSULE_PRIZES.filter((p) => p.chance > 0.001).map(
            (prize, index) => (
              <View key={index} style={styles.prizeTableRow}>
                <ThemedText style={styles.prizeTableEmoji}>
                  {prize.emoji}
                </ThemedText>
                <ThemedText style={styles.prizeTableName}>
                  {prize.name}
                </ThemedText>
                <ThemedText style={styles.prizeTableChance}>
                  {(prize.chance * 100).toFixed(1)}%
                </ThemedText>
              </View>
            )
          )}
        </View>

        <View style={styles.statsContainer}>
          <ThemedText style={styles.statsTitle}>Your Statistics</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statBoxValue}>{totalOpened}</ThemedText>
              <ThemedText style={styles.statBoxLabel}>
                Capsules Opened
              </ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statBoxValue}>{totalWins}</ThemedText>
              <ThemedText style={styles.statBoxLabel}>
                Total Coins Won
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>
            How Time Capsule Works
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • One free capsule per day
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Contains coins, discounts, or nothing
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Build streaks for recognition
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Resets daily at midnight
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
    textAlign: "center",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    opacity: 0.7,
    fontSize: 12,
    marginTop: 4,
  },
  streakContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  capsuleContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  capsuleGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#00BFFF",
    elevation: 20,
    shadowColor: "#00BFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  capsule: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  capsuleButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  capsuleEmoji: {
    fontSize: 80,
    lineHeight: 86,
  },
  openingText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    color: "#00BFFF",
  },
  waitContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  waitTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  waitText: {
    fontSize: 14,
    opacity: 0.8,
  },
  prizeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  prizeMessage: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  prizeBox: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  prizeEmoji: {
    fontSize: 40,
    lineHeight: 46,
    marginBottom: 8,
  },
  prizeName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  prizeSubtext: {
    fontSize: 12,
    opacity: 0.8,
  },
  nextCapsuleText: {
    fontSize: 14,
    opacity: 0.7,
  },
  discountsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  discountsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  discountsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  discountItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  discountEmoji: {
    fontSize: 16,
    lineHeight: 21,
    marginRight: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "bold",
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
    marginBottom: 12,
    textAlign: "center",
  },
  prizeTableRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  prizeTableEmoji: {
    fontSize: 16,
    lineHeight: 21,
    marginRight: 12,
  },
  prizeTableName: {
    flex: 1,
    fontSize: 12,
  },
  prizeTableChance: {
    fontSize: 12,
    fontWeight: "bold",
    minWidth: 40,
    textAlign: "right",
  },
  statsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statBoxLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
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
