import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const GRID_SIZE = 9; // 3x3 grid
const GAME_DURATION = 30; // 30 seconds

interface Mole {
  id: number;
  isVisible: boolean;
  timeoutId?: NodeJS.Timeout;
}

export default function WhackAMoleGame() {
  const [coins, setCoins] = useState(1000);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [bestScore, setBestScore] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [missedMoles, setMissedMoles] = useState(0);

  const gameTimerRef = useRef<NodeJS.Timeout>();
  const moleTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize moles
    const initialMoles: Mole[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      initialMoles.push({ id: i, isVisible: false });
    }
    setMoles(initialMoles);
  }, []);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      gameTimerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }

    return () => {
      if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
    };
  }, [gameActive, timeLeft]);

  useEffect(() => {
    if (gameActive) {
      spawnMole();
    }
    return () => {
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    };
  }, [gameActive]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameActive(true);
    setGameOver(false);
    setMissedMoles(0);

    // Reset all moles
    const resetMoles = moles.map((mole) => ({ ...mole, isVisible: false }));
    setMoles(resetMoles);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);

    if (score > bestScore) {
      setBestScore(score);
    }

    // Calculate reward
    const reward = score * 5; // 5 coins per hit
    setCoins(coins + reward);
    setTotalHits(totalHits + score);

    // Hide all moles
    setMoles((prevMoles) =>
      prevMoles.map((mole) => ({ ...mole, isVisible: false }))
    );

    if (score > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const spawnMole = () => {
    if (!gameActive) return;

    // Random delay between mole spawns (500ms to 2000ms)
    const delay = Math.random() * 1500 + 500;

    moleTimerRef.current = setTimeout(() => {
      // Find available holes (not currently showing moles)
      const availableHoles = moles
        .map((mole, index) => ({ mole, index }))
        .filter(({ mole }) => !mole.isVisible);

      if (availableHoles.length > 0) {
        const randomHole =
          availableHoles[Math.floor(Math.random() * availableHoles.length)];
        const moleIndex = randomHole.index;

        // Show the mole
        setMoles((prevMoles) =>
          prevMoles.map((mole, index) =>
            index === moleIndex ? { ...mole, isVisible: true } : mole
          )
        );

        // Hide the mole after 1-2 seconds
        const hideDelay = Math.random() * 1000 + 1000;
        setTimeout(() => {
          setMoles((prevMoles) =>
            prevMoles.map((mole, index) => {
              if (index === moleIndex && mole.isVisible) {
                setMissedMoles((prev) => prev + 1);
                return { ...mole, isVisible: false };
              }
              return mole;
            })
          );
        }, hideDelay);
      }

      // Schedule next mole spawn
      if (gameActive) {
        spawnMole();
      }
    }, delay);
  };

  const whackMole = (moleIndex: number) => {
    if (!gameActive || !moles[moleIndex].isVisible) return;

    // Hide the mole
    setMoles((prevMoles) =>
      prevMoles.map((mole, index) =>
        index === moleIndex ? { ...mole, isVisible: false } : mole
      )
    );

    setScore(score + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const getAccuracy = () => {
    const totalAttempts = score + missedMoles;
    return totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
  };

  const getPerformanceMessage = () => {
    if (score >= 25) return "🏆 MOLE MASTER! 🏆";
    if (score >= 20) return "🔨 EXCELLENT! 🔨";
    if (score >= 15) return "⚡ GREAT! ⚡";
    if (score >= 10) return "👍 GOOD! 👍";
    return "🐭 Keep practicing! 🐭";
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title">Whack-a-Mole</ThemedText>
          <ThemedText style={styles.subtitle}>
            Tap the moles quickly!
          </ThemedText>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{coins}</ThemedText>
            <ThemedText style={styles.statLabel}>Coins</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{score}</ThemedText>
            <ThemedText style={styles.statLabel}>Score</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{bestScore}</ThemedText>
            <ThemedText style={styles.statLabel}>Best</ThemedText>
          </View>
        </View>

        {gameActive && (
          <View style={styles.gameInfo}>
            <ThemedText style={styles.timeText}>Time: {timeLeft}s</ThemedText>
            <ThemedText style={styles.accuracyText}>
              Accuracy: {getAccuracy()}%
            </ThemedText>
          </View>
        )}

        {!gameActive && !gameOver && (
          <View style={styles.startContainer}>
            <ThemedText style={styles.instructionText}>
              Tap the moles as they pop up!
            </ThemedText>
            <ThemedText style={styles.tipText}>
              Be quick - they don't stay up for long!
            </ThemedText>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <ThemedText style={styles.startButtonText}>START GAME</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {(gameActive || gameOver) && (
          <View style={styles.gameContainer}>
            <View style={styles.moleGrid}>
              {moles.map((mole, index) => (
                <TouchableOpacity
                  key={mole.id}
                  style={[styles.hole, mole.isVisible && styles.holeWithMole]}
                  onPress={() => whackMole(index)}
                  disabled={!gameActive}
                >
                  <ThemedText style={styles.holeText}>
                    {mole.isVisible ? "🐭" : "🕳️"}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {gameOver && (
          <View style={styles.gameOverContainer}>
            <ThemedText style={styles.gameOverTitle}>Time's Up!</ThemedText>
            <ThemedText style={styles.performanceText}>
              {getPerformanceMessage()}
            </ThemedText>

            <View style={styles.resultsContainer}>
              <ThemedText style={styles.resultText}>
                Moles Whacked: {score}
              </ThemedText>
              <ThemedText style={styles.resultText}>
                Accuracy: {getAccuracy()}%
              </ThemedText>
              <ThemedText style={styles.rewardText}>
                Earned: {score * 5} coins! 💰
              </ThemedText>
            </View>

            <TouchableOpacity
              style={styles.playAgainButton}
              onPress={startGame}
            >
              <ThemedText style={styles.playAgainText}>PLAY AGAIN</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>How to Play</ThemedText>
          <ThemedText style={styles.infoText}>
            • Moles will randomly pop up from holes
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Tap them quickly before they disappear
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Earn 5 coins per successful hit
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Game lasts 30 seconds
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Total hits: {totalHits}
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
  gameInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  timeText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 14,
    opacity: 0.8,
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
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  gameContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  moleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    maxWidth: 300,
  },
  hole: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(139, 69, 19, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(101, 67, 33, 1)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  holeWithMole: {
    backgroundColor: "rgba(34, 139, 34, 0.8)",
    borderColor: "rgba(0, 100, 0, 1)",
  },
  holeText: {
    fontSize: 32,
    lineHeight: 38,
  },
  gameOverContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  performanceText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  resultsContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 18,
    color: "#FFD700",
    fontWeight: "bold",
    marginTop: 8,
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
  infoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
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
