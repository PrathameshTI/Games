import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Haptics from "expo-haptics";
import { DeviceMotion } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const SHAKE_THRESHOLD = 1.5;
const SHAKE_DURATION = 3000; // 3 seconds to shake
const GAME_COST = 20;

const DRINK_INGREDIENTS = ["🍓", "🍌", "🥝", "🍊", "🍇", "🥭", "🍑"];
const DRINK_REWARDS = [
  { name: "Perfect Mix", multiplier: 5, emoji: "🏆", chance: 0.05 },
  { name: "Great Blend", multiplier: 3, emoji: "⭐", chance: 0.15 },
  { name: "Good Shake", multiplier: 2, emoji: "👍", chance: 0.3 },
  { name: "Basic Mix", multiplier: 1, emoji: "🥤", chance: 0.4 },
  { name: "Failed Mix", multiplier: 0, emoji: "💨", chance: 0.1 },
];

export default function ShakeToWinGame() {
  const [coins, setCoins] = useState(1000);
  const [gameActive, setGameActive] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [result, setResult] = useState<(typeof DRINK_REWARDS)[0] | null>(null);
  const [totalShakes, setTotalShakes] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [bestIntensity, setBestIntensity] = useState(0);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const ingredientAnimations = useRef(
    DRINK_INGREDIENTS.map(() => new Animated.Value(0))
  ).current;

  const shakeCount = useRef(0);
  const gameTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let subscription: any;

    if (gameActive) {
      subscription = DeviceMotion.addListener(({ acceleration }) => {
        if (acceleration) {
          const { x, y, z } = acceleration;
          const intensity = Math.sqrt(x * x + y * y + z * z);

          if (intensity > SHAKE_THRESHOLD) {
            handleShake(intensity);
          }
        }
      });

      DeviceMotion.setUpdateInterval(100);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [gameActive]);

  const startGame = () => {
    if (coins < GAME_COST) return;

    setCoins(coins - GAME_COST);
    setGameActive(true);
    setShaking(false);
    setShakeIntensity(0);
    setTimeLeft(SHAKE_DURATION / 1000);
    setIngredients([]);
    setResult(null);
    shakeCount.current = 0;

    // Generate random ingredients for this round
    const roundIngredients = [];
    for (let i = 0; i < 3; i++) {
      roundIngredients.push(
        DRINK_INGREDIENTS[Math.floor(Math.random() * DRINK_INGREDIENTS.length)]
      );
    }
    setIngredients(roundIngredients);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Start countdown
    gameTimer.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleShake = (intensity: number) => {
    if (!gameActive) return;

    setShaking(true);
    setShakeIntensity(Math.max(shakeIntensity, intensity));
    shakeCount.current += 1;

    if (intensity > bestIntensity) {
      setBestIntensity(intensity);
    }

    // Animate shake
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate ingredients
    ingredientAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: Math.random(),
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTimeout(() => setShaking(false), 200);
  };

  const endGame = () => {
    setGameActive(false);
    setTotalShakes(totalShakes + 1);

    if (gameTimer.current) {
      clearInterval(gameTimer.current);
    }

    // Calculate result based on shake intensity and count
    const finalIntensity = shakeIntensity;
    const finalCount = shakeCount.current;

    // Determine reward based on performance
    let rewardIndex = 4; // Default to failed mix

    if (finalIntensity > 3 && finalCount > 20) {
      rewardIndex = 0; // Perfect mix
    } else if (finalIntensity > 2.5 && finalCount > 15) {
      rewardIndex = 1; // Great blend
    } else if (finalIntensity > 2 && finalCount > 10) {
      rewardIndex = 2; // Good shake
    } else if (finalCount > 5) {
      rewardIndex = 3; // Basic mix
    }

    // Add some randomness
    const random = Math.random();
    for (let i = 0; i < DRINK_REWARDS.length; i++) {
      if (
        random <
        DRINK_REWARDS.slice(0, i + 1).reduce((sum, r) => sum + r.chance, 0)
      ) {
        rewardIndex = i;
        break;
      }
    }

    const reward = DRINK_REWARDS[rewardIndex];
    setResult(reward);

    const winAmount = GAME_COST * reward.multiplier;
    if (winAmount > 0) {
      setCoins(coins + winAmount);
      setTotalWins(totalWins + winAmount);

      if (reward.multiplier >= 3) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const resetGame = () => {
    setResult(null);
    setShakeIntensity(0);
    shakeCount.current = 0;
    ingredientAnimations.forEach((anim) => anim.setValue(0));
  };

  const getShakeMessage = () => {
    if (shakeIntensity > 3) return "🔥 INTENSE SHAKING! 🔥";
    if (shakeIntensity > 2.5) return "⚡ GREAT SHAKING! ⚡";
    if (shakeIntensity > 2) return "👍 GOOD SHAKING! 👍";
    if (shakeIntensity > 1.5) return "🥤 SHAKING... 🥤";
    return "Start shaking your phone!";
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title">Shake & Win</ThemedText>
          <ThemedText style={styles.subtitle}>
            Shake your phone to mix drinks and win!
          </ThemedText>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{coins}</ThemedText>
            <ThemedText style={styles.statLabel}>Coins</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{totalShakes}</ThemedText>
            <ThemedText style={styles.statLabel}>Games</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{bestIntensity.toFixed(1)}</ThemedText>
            <ThemedText style={styles.statLabel}>Best Shake</ThemedText>
          </View>
        </View>

        {!gameActive && !result && (
          <View style={styles.startContainer}>
            <ThemedText style={styles.instructionText}>
              Shake your phone to mix the perfect drink!
            </ThemedText>
            <ThemedText style={styles.tipText}>
              Shake harder and longer for better rewards
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.startButton,
                coins < GAME_COST && styles.startButtonDisabled,
              ]}
              onPress={startGame}
              disabled={coins < GAME_COST}
            >
              <ThemedText style={styles.startButtonText}>
                START MIXING ({GAME_COST} coins)
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {gameActive && (
          <View style={styles.gameContainer}>
            <View style={styles.timerContainer}>
              <ThemedText style={styles.timerText}>
                Time: {timeLeft}s
              </ThemedText>
              <ThemedText style={styles.shakeMessage}>
                {getShakeMessage()}
              </ThemedText>
            </View>

            <Animated.View
              style={[
                styles.drinkContainer,
                {
                  transform: [
                    {
                      rotate: shakeAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "10deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.glass}>
                <ThemedText style={styles.glassEmoji}>🥤</ThemedText>

                <View style={styles.ingredientsContainer}>
                  {ingredients.map((ingredient, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.ingredient,
                        {
                          transform: [
                            {
                              translateX: ingredientAnimations[
                                index
                              ].interpolate({
                                inputRange: [0, 1],
                                outputRange: [-10, 10],
                              }),
                            },
                            {
                              translateY: ingredientAnimations[
                                index
                              ].interpolate({
                                inputRange: [0, 1],
                                outputRange: [-5, 5],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <ThemedText style={styles.ingredientEmoji}>
                        {ingredient}
                      </ThemedText>
                    </Animated.View>
                  ))}
                </View>
              </View>
            </Animated.View>

            <View style={styles.shakeStats}>
              <ThemedText style={styles.shakeStatText}>
                Shakes: {shakeCount.current}
              </ThemedText>
              <ThemedText style={styles.shakeStatText}>
                Intensity: {shakeIntensity.toFixed(1)}
              </ThemedText>
            </View>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            <ThemedText style={styles.resultTitle}>Drink Ready!</ThemedText>
            <View style={styles.resultBox}>
              <ThemedText style={styles.resultEmoji}>{result.emoji}</ThemedText>
              <ThemedText style={styles.resultName}>{result.name}</ThemedText>
              <ThemedText style={styles.resultMultiplier}>
                {result.multiplier}x multiplier
              </ThemedText>
              {result.multiplier > 0 && (
                <ThemedText style={styles.resultWin}>
                  Won: {GAME_COST * result.multiplier} coins!
                </ThemedText>
              )}
            </View>

            <TouchableOpacity
              style={styles.playAgainButton}
              onPress={resetGame}
            >
              <ThemedText style={styles.playAgainText}>
                MIX ANOTHER DRINK
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.rewardsTable}>
          <ThemedText style={styles.rewardsTitle}>
            Drink Quality Rewards
          </ThemedText>
          {DRINK_REWARDS.map((reward, index) => (
            <View key={index} style={styles.rewardRow}>
              <ThemedText style={styles.rewardEmoji}>{reward.emoji}</ThemedText>
              <ThemedText style={styles.rewardName}>{reward.name}</ThemedText>
              <ThemedText style={styles.rewardMultiplier}>
                {reward.multiplier}x
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>How to Play</ThemedText>
          <ThemedText style={styles.infoText}>
            • Pay {GAME_COST} coins to start mixing
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Shake your phone for 3 seconds
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Shake harder and more for better results
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Win multipliers based on drink quality
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Total winnings: {totalWins} coins
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
  startContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  instructionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
  },
  startButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  startButtonDisabled: {
    backgroundColor: "#666",
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  gameContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  shakeMessage: {
    fontSize: 16,
    textAlign: "center",
  },
  drinkContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  glass: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  glassEmoji: {
    fontSize: 120,
    lineHeight: 140,
  },
  ingredientsContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ingredient: {
    position: "absolute",
  },
  ingredientEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  shakeStats: {
    flexDirection: "row",
    gap: 20,
  },
  shakeStatText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  resultContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  resultBox: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  resultEmoji: {
    fontSize: 60,
    lineHeight: 66,
    marginBottom: 12,
  },
  resultName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  resultMultiplier: {
    fontSize: 16,
    marginBottom: 8,
  },
  resultWin: {
    fontSize: 18,
    color: "#FFD700",
    fontWeight: "bold",
  },
  playAgainButton: {
    backgroundColor: "#34C759",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  playAgainText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  rewardsTable: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  rewardEmoji: {
    fontSize: 16,
    lineHeight: 21,
    marginRight: 12,
  },
  rewardName: {
    flex: 1,
    fontSize: 12,
  },
  rewardMultiplier: {
    fontSize: 12,
    fontWeight: "bold",
    minWidth: 30,
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
