import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const CARD_SYMBOLS = ["🍎", "🍌", "🍊", "🍇", "🍓", "🥝", "🍑", "🥭"];

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryMatchGame() {
  const [coins, setCoins] = useState(1000);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);


  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameActive && !gameComplete) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameActive, gameComplete]);

  useEffect(() => {
    if (matches === 8) {
      // All pairs matched
      setGameActive(false);
      setGameComplete(true);

      // Calculate reward based on performance
      const timeBonus = Math.max(0, 120 - timeElapsed); // Bonus for completing under 2 minutes
      const moveBonus = Math.max(0, 50 - moves); // Bonus for fewer moves
      const baseReward = 100;
      const totalReward = baseReward + timeBonus + moveBonus;

      setCoins(prev => prev + totalReward);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [matches, timeElapsed, moves]);

  const generateCards = () => {
    const gameCards: Card[] = [];
    let cardId = 0;

    // Create pairs of cards
    CARD_SYMBOLS.forEach((symbol) => {
      // Add two cards for each symbol (a pair)
      gameCards.push({
        id: cardId++,
        symbol,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: cardId++,
        symbol,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle the cards
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }

    return gameCards;
  };

  const startGame = () => {
    const newCards = generateCards();
    setCards(newCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeElapsed(0);
    setGameActive(true);
    setGameComplete(false);
    setGamesPlayed(prev => prev + 1);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const flipCard = (cardId: number) => {
    if (!gameActive || flippedCards.length >= 2) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      checkForMatch(newFlippedCards);
    }
  };

  const checkForMatch = (flippedCardIds: number[]) => {
    const [firstId, secondId] = flippedCardIds;
    const firstCard = cards.find((c) => c.id === firstId);
    const secondCard = cards.find((c) => c.id === secondId);

    if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
      // Match found!
      setTimeout(() => {
        setCards((prevCards) =>
          prevCards.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          )
        );
        setMatches(prev => prev + 1);
        setFlippedCards([]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 500);
    } else {
      // No match - flip cards back
      setTimeout(() => {
        setCards((prevCards) =>
          prevCards.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isFlipped: false }
              : c
          )
        );
        setFlippedCards([]);
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPerformanceMessage = () => {
    if (moves <= 12) return "🏆 PERFECT! 🏆";
    if (moves <= 16) return "⭐ EXCELLENT! ⭐";
    if (moves <= 20) return "👍 GREAT! 👍";
    if (moves <= 25) return "💪 GOOD! 💪";
    return "🧠 Keep practicing! 🧠";
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title">Memory Match</ThemedText>
          <ThemedText style={styles.subtitle}>Match pairs of cards!</ThemedText>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{coins}</ThemedText>
            <ThemedText style={styles.statLabel}>Coins</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{moves}</ThemedText>
            <ThemedText style={styles.statLabel}>Moves</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{matches}/8</ThemedText>
            <ThemedText style={styles.statLabel}>Matches</ThemedText>
          </View>
        </View>

        {gameActive && (
          <View style={styles.gameInfo}>
            <ThemedText style={styles.timeText}>
              Time: {formatTime(timeElapsed)}
            </ThemedText>
          </View>
        )}

        {!gameActive && !gameComplete && (
          <View style={styles.startContainer}>
            <ThemedText style={styles.instructionText}>
              Flip cards to find matching pairs!
            </ThemedText>
            <ThemedText style={styles.tipText}>
              Remember the positions and match all 8 pairs to win
            </ThemedText>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <ThemedText style={styles.startButtonText}>START GAME</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {(gameActive || gameComplete) && (
          <View style={styles.gameContainer}>
            <View style={styles.cardGrid}>
              {cards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.card,
                    card.isFlipped && styles.flippedCard,
                    card.isMatched && styles.matchedCard,
                  ]}
                  onPress={() => flipCard(card.id)}
                  disabled={!gameActive || card.isFlipped || card.isMatched}
                >
                  <ThemedText style={styles.cardText}>
                    {card.isFlipped || card.isMatched ? card.symbol : "❓"}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {gameComplete && (
          <View style={styles.completeContainer}>
            <ThemedText style={styles.completeTitle}>
              Congratulations! 🎉
            </ThemedText>
            <ThemedText style={styles.performanceText}>
              {getPerformanceMessage()}
            </ThemedText>

            <View style={styles.resultsContainer}>
              <ThemedText style={styles.resultText}>
                Completed in {moves} moves
              </ThemedText>
              <ThemedText style={styles.resultText}>
                Time: {formatTime(timeElapsed)}
              </ThemedText>
              <ThemedText style={styles.rewardText}>
                Earned:{" "}
                {100 + Math.max(0, 120 - timeElapsed) + Math.max(0, 50 - moves)}{" "}
                coins! 💰
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
            • Tap cards to flip them over
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Find matching pairs of symbols
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Match all 8 pairs to win
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Fewer moves = more bonus coins
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Games played: {gamesPlayed}
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
    fontSize: 18,
    fontWeight: "bold",
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
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    maxWidth: 320,
  },
  card: {
    width: 70,
    height: 70,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  flippedCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderColor: "#007AFF",
  },
  matchedCard: {
    backgroundColor: "#34C759",
    borderColor: "#30A14E",
  },
  cardText: {
    fontSize: 28,
    lineHeight: 34,
    color: "#000",
  },
  completeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
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
