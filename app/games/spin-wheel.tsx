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
import Svg, { Circle, G, Path, Text } from "react-native-svg";

const WHEEL_SEGMENTS = [
  { label: "100", value: 100, color: "#FF6B6B" },
  { label: "50", value: 50, color: "#4ECDC4" },
  { label: "200", value: 200, color: "#45B7D1" },
  { label: "25", value: 25, color: "#96CEB4" },
  { label: "500", value: 500, color: "#FFEAA7" },
  { label: "10", value: 10, color: "#DDA0DD" },
  { label: "300", value: 300, color: "#FFB6C1" },
  { label: "75", value: 75, color: "#98FB98" },
];

// Function to create SVG path for pie segment
const createPieSlice = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
) => {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    centerX,
    centerY,
    "L",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "Z",
  ].join(" ");
};

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

export default function SpinWheelGame() {
  const [coins, setCoins] = useState(1000);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(3);

  const spinAnimation = useRef(new Animated.Value(0)).current;

  const spinWheel = () => {
    if (spinning || spinsLeft <= 0) return;

    setSpinning(true);
    setSpinsLeft(spinsLeft - 1);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Random rotation between 1440 and 2160 degrees (4-6 full rotations)
    const randomRotation = 1440 + Math.random() * 720;

    Animated.timing(spinAnimation, {
      toValue: randomRotation,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      // Calculate which segment we landed on
      const normalizedRotation = randomRotation % 360;
      const segmentAngle = 360 / WHEEL_SEGMENTS.length;
      const segmentIndex =
        Math.floor(
          (360 - normalizedRotation + segmentAngle / 2) / segmentAngle
        ) % WHEEL_SEGMENTS.length;

      const winningSegment = WHEEL_SEGMENTS[segmentIndex];
      const winAmount = winningSegment.value;

      setCoins(coins + winAmount);
      setLastWin(winAmount);
      setTotalWins(totalWins + winAmount);
      setSpinning(false);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  };

  const resetGame = () => {
    setSpinsLeft(3);
    setLastWin(0);
    spinAnimation.setValue(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getReward = () => {
    if (lastWin >= 500) return "🎉 JACKPOT! 🎉";
    if (lastWin >= 300) return "🔥 BIG WIN! 🔥";
    if (lastWin >= 100) return "⭐ GREAT! ⭐";
    return "💰 Nice! 💰";
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title">Spin Wheel</ThemedText>
          <ThemedText style={styles.subtitle}>
            Spin the wheel of fortune!
          </ThemedText>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{coins}</ThemedText>
            <ThemedText style={styles.statLabel}>Coins</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{spinsLeft}</ThemedText>
            <ThemedText style={styles.statLabel}>Spins Left</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{totalWins}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Wins</ThemedText>
          </View>
        </View>

        <View style={styles.wheelContainer}>
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [
                  {
                    rotate: spinAnimation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <Svg width="260" height="260" viewBox="0 0 260 260">
              <G>
                {WHEEL_SEGMENTS.map((segment, index) => {
                  const segmentAngle = 360 / WHEEL_SEGMENTS.length;
                  const startAngle = index * segmentAngle;
                  const endAngle = (index + 1) * segmentAngle;
                  const centerX = 130;
                  const centerY = 130;
                  const radius = 125;

                  // Calculate text position
                  const textAngle = startAngle + segmentAngle / 2;
                  const textRadius = radius * 0.7;
                  const textPos = polarToCartesian(
                    centerX,
                    centerY,
                    textRadius,
                    textAngle
                  );

                  return (
                    <G key={index}>
                      <Path
                        d={createPieSlice(
                          centerX,
                          centerY,
                          radius,
                          startAngle,
                          endAngle
                        )}
                        fill={segment.color}
                        stroke="#FFF"
                        strokeWidth="2"
                      />
                      <Text
                        x={textPos.x}
                        y={textPos.y}
                        fontSize="16"
                        fontWeight="bold"
                        fill="white"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        stroke="#000"
                        strokeWidth="0.5"
                      >
                        {segment.label}
                      </Text>
                    </G>
                  );
                })}

                {/* Center circle */}
                <Circle
                  cx="130"
                  cy="130"
                  r="25"
                  fill="#FFD700"
                  stroke="#FFF"
                  strokeWidth="3"
                />
                <Text
                  x="130"
                  y="130"
                  fontSize="20"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  🎯
                </Text>
              </G>
            </Svg>
          </Animated.View>

          {/* Pointer */}
          <View style={styles.pointer}>
            <View style={styles.pointerTriangle} />
          </View>
        </View>

        {lastWin > 0 && (
          <View style={styles.winContainer}>
            <ThemedText style={styles.winMessage}>{getReward()}</ThemedText>
            <ThemedText style={styles.winAmount}>+{lastWin} coins</ThemedText>
          </View>
        )}

        <View style={styles.controls}>
          {spinsLeft > 0 ? (
            <TouchableOpacity
              style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
              onPress={spinWheel}
              disabled={spinning}
            >
              <ThemedText style={styles.spinButtonText}>
                {spinning ? "SPINNING..." : "SPIN"}
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
              <ThemedText style={styles.resetButtonText}>
                RESET SPINS
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.prizeTable}>
          <ThemedText style={styles.prizeTableTitle}>Prize Table</ThemedText>
          <View style={styles.prizeGrid}>
            {WHEEL_SEGMENTS.map((segment, index) => (
              <View
                key={index}
                style={[styles.prizeItem, { backgroundColor: segment.color }]}
              >
                <ThemedText style={styles.prizeText}>
                  {segment.label}
                </ThemedText>
              </View>
            ))}
          </View>
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
    justifyContent: "center",
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
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
  wheelContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  wheel: {
    width: 260,
    height: 260,
    borderRadius: 130,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: "#FFF",
  },
  pointer: {
    position: "absolute",
    top: -20,
    zIndex: 15,
    alignItems: "center",
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 25,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FF4444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 10,
  },
  winContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  winMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
  winAmount: {
    fontSize: 16,
    color: "#00FF00",
    marginTop: 4,
  },
  controls: {
    alignItems: "center",
    marginBottom: 30,
  },
  spinButton: {
    backgroundColor: "#FF6B6B",
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
  resetButton: {
    backgroundColor: "#34C759",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  prizeTable: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
  },
  prizeTableTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  prizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  prizeItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 40,
    alignItems: "center",
  },
  prizeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
});
