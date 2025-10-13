import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const PREDICTION_QUESTIONS = [
  {
    id: 1,
    question: "Will it rain tomorrow?",
    options: ["Yes", "No"],
    category: "Weather",
    emoji: "🌧️",
    reward: 50,
  },
  {
    id: 2,
    question: "Will the stock market go up today?",
    options: ["Up", "Down", "Same"],
    category: "Finance",
    emoji: "📈",
    reward: 75,
  },
  {
    id: 3,
    question: "Will India win the cricket match?",
    options: ["Win", "Lose", "Draw"],
    category: "Sports",
    emoji: "🏏",
    reward: 100,
  },
  {
    id: 4,
    question: "Will Bitcoin price increase this week?",
    options: ["Increase", "Decrease"],
    category: "Crypto",
    emoji: "₿",
    reward: 80,
  },
  {
    id: 5,
    question: "Will there be a new movie release this weekend?",
    options: ["Yes", "No"],
    category: "Entertainment",
    emoji: "🎬",
    reward: 60,
  },
  {
    id: 6,
    question: "Will the temperature exceed 30°C today?",
    options: ["Yes", "No"],
    category: "Weather",
    emoji: "🌡️",
    reward: 45,
  },
];

interface Prediction {
  questionId: number;
  selectedOption: string;
  timestamp: number;
  resolved: boolean;
  won?: boolean;
}

export default function PredictWinGame() {
  const [coins, setCoins] = useState(1000);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [correctPredictions, setCorrectPredictions] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Simulate resolving old predictions
    checkPendingPredictions();
  }, []);

  const checkPendingPredictions = () => {
    const now = Date.now();
    const updatedPredictions = predictions.map((prediction) => {
      if (!prediction.resolved && now - prediction.timestamp > 60000) {
        // 1 minute for demo
        const won = Math.random() > 0.5; // 50% chance to win
        return { ...prediction, resolved: true, won };
      }
      return prediction;
    });

    setPredictions(updatedPredictions);
  };

  const submitPrediction = () => {
    if (!selectedOption || coins < 25) return;

    setCoins(coins - 25);

    const newPrediction: Prediction = {
      questionId: PREDICTION_QUESTIONS[currentQuestion].id,
      selectedOption,
      timestamp: Date.now(),
      resolved: false,
    };

    setPredictions([...predictions, newPrediction]);
    setTotalPredictions(totalPredictions + 1);
    setSelectedOption(null);

    // Move to next question
    setCurrentQuestion((currentQuestion + 1) % PREDICTION_QUESTIONS.length);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate quick resolution for demo (normally would be resolved later)
    setTimeout(() => {
      resolvePrediction(newPrediction);
    }, 3000);
  };

  const resolvePrediction = (prediction: Prediction) => {
    const won = Math.random() > 0.4; // 60% chance to win
    const question = PREDICTION_QUESTIONS.find(
      (q) => q.id === prediction.questionId
    );

    if (won && question) {
      setCoins(coins + question.reward);
      setTotalWinnings(totalWinnings + question.reward);
      setCorrectPredictions(correctPredictions + 1);
      setStreak(streak + 1);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setStreak(0);
    }

    // Update prediction status
    setPredictions((prev) =>
      prev.map((p) =>
        p.questionId === prediction.questionId &&
        p.timestamp === prediction.timestamp
          ? { ...p, resolved: true, won }
          : p
      )
    );
  };

  const getCurrentQuestion = () => PREDICTION_QUESTIONS[currentQuestion];

  const getPendingPredictions = () => predictions.filter((p) => !p.resolved);
  const getResolvedPredictions = () => predictions.filter((p) => p.resolved);

  const getAccuracy = () => {
    return totalPredictions > 0
      ? Math.round((correctPredictions / totalPredictions) * 100)
      : 0;
  };

  const getStreakMessage = () => {
    if (streak >= 5) return "🔥 PREDICTION MASTER! 🔥";
    if (streak >= 3) return "⚡ HOT STREAK! ⚡";
    if (streak >= 2) return "🎯 ON A ROLL! 🎯";
    return "";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Weather":
        return "#87CEEB";
      case "Finance":
        return "#32CD32";
      case "Sports":
        return "#FF6347";
      case "Crypto":
        return "#FFD700";
      case "Entertainment":
        return "#DA70D6";
      default:
        return "#87CEEB";
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title">Predict & Win</ThemedText>
          <ThemedText style={styles.subtitle}>
            Make predictions and earn rewards!
          </ThemedText>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{coins}</ThemedText>
            <ThemedText style={styles.statLabel}>Coins</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{getAccuracy()}%</ThemedText>
            <ThemedText style={styles.statLabel}>Accuracy</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{streak}</ThemedText>
            <ThemedText style={styles.statLabel}>Streak</ThemedText>
          </View>
        </View>

        {streak > 1 && (
          <View style={styles.streakContainer}>
            <ThemedText style={styles.streakText}>
              {getStreakMessage()}
            </ThemedText>
          </View>
        )}

        <View style={styles.questionContainer}>
          <View
            style={[
              styles.categoryBadge,
              {
                backgroundColor: getCategoryColor(
                  getCurrentQuestion().category
                ),
              },
            ]}
          >
            <ThemedText style={styles.categoryText}>
              {getCurrentQuestion().category}
            </ThemedText>
          </View>

          <ThemedText style={styles.questionEmoji}>
            {getCurrentQuestion().emoji}
          </ThemedText>
          <ThemedText style={styles.questionText}>
            {getCurrentQuestion().question}
          </ThemedText>
          <ThemedText style={styles.rewardText}>
            Reward: {getCurrentQuestion().reward} coins
          </ThemedText>

          <View style={styles.optionsContainer}>
            {getCurrentQuestion().options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === option && styles.selectedOption,
                ]}
                onPress={() => {
                  setSelectedOption(option);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    selectedOption === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedOption || coins < 25) && styles.submitButtonDisabled,
            ]}
            onPress={submitPrediction}
            disabled={!selectedOption || coins < 25}
          >
            <ThemedText style={styles.submitButtonText}>
              SUBMIT PREDICTION (25 coins)
            </ThemedText>
          </TouchableOpacity>
        </View>

        {getPendingPredictions().length > 0 && (
          <View style={styles.pendingContainer}>
            <ThemedText style={styles.pendingTitle}>
              Pending Predictions
            </ThemedText>
            {getPendingPredictions().map((prediction, index) => {
              const question = PREDICTION_QUESTIONS.find(
                (q) => q.id === prediction.questionId
              );
              return (
                <View key={index} style={styles.pendingItem}>
                  <ThemedText style={styles.pendingEmoji}>
                    {question?.emoji}
                  </ThemedText>
                  <View style={styles.pendingContent}>
                    <ThemedText style={styles.pendingQuestion}>
                      {question?.question}
                    </ThemedText>
                    <ThemedText style={styles.pendingAnswer}>
                      Your answer: {prediction.selectedOption}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.pendingStatus}>⏳</ThemedText>
                </View>
              );
            })}
          </View>
        )}

        {getResolvedPredictions().length > 0 && (
          <View style={styles.historyContainer}>
            <ThemedText style={styles.historyTitle}>Recent Results</ThemedText>
            {getResolvedPredictions()
              .slice(-3)
              .map((prediction, index) => {
                const question = PREDICTION_QUESTIONS.find(
                  (q) => q.id === prediction.questionId
                );
                return (
                  <View
                    key={index}
                    style={[
                      styles.historyItem,
                      prediction.won ? styles.wonItem : styles.lostItem,
                    ]}
                  >
                    <ThemedText style={styles.historyEmoji}>
                      {question?.emoji}
                    </ThemedText>
                    <View style={styles.historyContent}>
                      <ThemedText style={styles.historyQuestion}>
                        {question?.question}
                      </ThemedText>
                      <ThemedText style={styles.historyAnswer}>
                        Your answer: {prediction.selectedOption}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.historyResult}>
                      {prediction.won ? "✅" : "❌"}
                    </ThemedText>
                  </View>
                );
              })}
          </View>
        )}

        <View style={styles.statsContainer}>
          <ThemedText style={styles.statsTitle}>Your Statistics</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statBoxValue}>
                {totalPredictions}
              </ThemedText>
              <ThemedText style={styles.statBoxLabel}>
                Total Predictions
              </ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statBoxValue}>
                {correctPredictions}
              </ThemedText>
              <ThemedText style={styles.statBoxLabel}>Correct</ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statBoxValue}>
                {totalWinnings}
              </ThemedText>
              <ThemedText style={styles.statBoxLabel}>
                Total Winnings
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>How to Play</ThemedText>
          <ThemedText style={styles.infoText}>
            • Pay 25 coins to make a prediction
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Choose your answer from the options
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Wait for results to be resolved
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Win coins if your prediction is correct
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Build streaks for recognition
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
  questionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  questionEmoji: {
    fontSize: 40,
    lineHeight: 46,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 14,
    color: "#FFD700",
    marginBottom: 20,
  },
  optionsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: "rgba(0, 122, 255, 0.3)",
    borderColor: "#007AFF",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
  selectedOptionText: {
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  submitButtonDisabled: {
    backgroundColor: "#666",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  pendingContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  pendingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  pendingEmoji: {
    fontSize: 20,
    lineHeight: 24,
    marginRight: 12,
  },
  pendingContent: {
    flex: 1,
  },
  pendingQuestion: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  pendingAnswer: {
    fontSize: 10,
    opacity: 0.7,
  },
  pendingStatus: {
    fontSize: 16,
  },
  historyContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  wonItem: {
    backgroundColor: "rgba(52, 199, 89, 0.2)",
  },
  lostItem: {
    backgroundColor: "rgba(255, 59, 48, 0.2)",
  },
  historyEmoji: {
    fontSize: 20,
    lineHeight: 24,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyQuestion: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  historyAnswer: {
    fontSize: 10,
    opacity: 0.7,
  },
  historyResult: {
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: "bold",
  },
  statBoxLabel: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 4,
    textAlign: "center",
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
