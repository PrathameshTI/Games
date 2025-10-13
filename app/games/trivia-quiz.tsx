import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const QUESTIONS = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct: 2
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1
  },
  {
    question: "What is 15 + 27?",
    options: ["41", "42", "43", "44"],
    correct: 1
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"],
    correct: 2
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correct: 3
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correct: 1
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correct: 2
  },
  {
    question: "Which year did World War II end?",
    options: ["1944", "1945", "1946", "1947"],
    correct: 1
  },
  {
    question: "What is the smallest country in the world?",
    options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
    correct: 1
  },
  {
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correct: 2
  }
];

export default function TriviaQuizGame() {
  const [coins, setCoins] = useState(1000);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<typeof QUESTIONS>([]);
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const startGame = () => {
    // Shuffle questions
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setCurrentQuestion(0);
    setScore(0);
    setGameActive(true);
    setSelectedAnswer(null);
    setShowResult(false);
    setStreak(0);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !gameActive) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    
    if (isCorrect) {
      const points = 20 + (streak * 5); // Bonus for streak
      setScore(score + points);
      setStreak(streak + 1);
      setTotalCorrect(totalCorrect + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setStreak(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    // Auto advance after 2 seconds
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameActive(false);
    const reward = score;
    setCoins(coins + reward);
    
    if (score > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const getResultMessage = () => {
    const percentage = (totalCorrect / questions.length) * 100;
    if (percentage === 100) return '🏆 Perfect Score! 🏆';
    if (percentage >= 80) return '🌟 Excellent! 🌟';
    if (percentage >= 60) return '👍 Good Job! 👍';
    if (percentage >= 40) return '📚 Keep Learning! 📚';
    return '💪 Try Again! 💪';
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) return styles.option;
    
    if (index === questions[currentQuestion].correct) {
      return [styles.option, styles.correctOption];
    }
    
    if (index === selectedAnswer && index !== questions[currentQuestion].correct) {
      return [styles.option, styles.wrongOption];
    }
    
    return [styles.option, styles.disabledOption];
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <ThemedText type="title">Trivia Quiz</ThemedText>
        <ThemedText style={styles.subtitle}>Test your knowledge!</ThemedText>
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
          <ThemedText type="subtitle">{streak}</ThemedText>
          <ThemedText style={styles.statLabel}>Streak</ThemedText>
        </View>
      </View>

      {!gameActive && questions.length === 0 ? (
        <View style={styles.startContainer}>
          <ThemedText style={styles.startText}>Ready to test your knowledge?</ThemedText>
          <ThemedText style={styles.startSubtext}>Answer 5 random questions correctly to earn coins!</ThemedText>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <ThemedText style={styles.startButtonText}>START QUIZ</ThemedText>
          </TouchableOpacity>
        </View>
      ) : gameActive ? (
        <View style={styles.gameContainer}>
          <View style={styles.progressContainer}>
            <ThemedText style={styles.progressText}>
              Question {currentQuestion + 1} of {questions.length}
            </ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
                ]} 
              />
            </View>
          </View>

          <View style={styles.questionContainer}>
            <ThemedText style={styles.questionText}>
              {questions[currentQuestion]?.question}
            </ThemedText>
          </View>

          <View style={styles.optionsContainer}>
            {questions[currentQuestion]?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getOptionStyle(index)}
                onPress={() => selectAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <ThemedText style={styles.optionText}>{option}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {showResult && (
            <View style={styles.resultContainer}>
              <ThemedText style={styles.resultText}>
                {selectedAnswer === questions[currentQuestion].correct ? 
                  '✅ Correct!' : '❌ Wrong!'}
              </ThemedText>
              {selectedAnswer === questions[currentQuestion].correct && streak > 1 && (
                <ThemedText style={styles.streakText}>
                  🔥 {streak} in a row! +{5 * (streak - 1)} bonus points
                </ThemedText>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.endContainer}>
          <ThemedText style={styles.endTitle}>Quiz Complete!</ThemedText>
          <ThemedText style={styles.endMessage}>{getResultMessage()}</ThemedText>
          <ThemedText style={styles.finalScore}>
            Final Score: {score} points
          </ThemedText>
          <ThemedText style={styles.correctCount}>
            Correct Answers: {totalCorrect}/{questions.length}
          </ThemedText>
          <ThemedText style={styles.rewardText}>
            Earned: {score} coins! 💰
          </ThemedText>
          <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
            <ThemedText style={styles.playAgainText}>PLAY AGAIN</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoContainer}>
        <ThemedText style={styles.infoTitle}>How to Play</ThemedText>
        <ThemedText style={styles.infoText}>• Answer 5 random trivia questions</ThemedText>
        <ThemedText style={styles.infoText}>• Earn 20 coins per correct answer</ThemedText>
        <ThemedText style={styles.infoText}>• Get bonus points for answer streaks</ThemedText>
        <ThemedText style={styles.infoText}>• No penalty for wrong answers</ThemedText>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.7,
    fontSize: 12,
    marginTop: 4,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  startSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 30,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  correctOption: {
    backgroundColor: 'rgba(52, 199, 89, 0.3)',
    borderColor: '#34C759',
  },
  wrongOption: {
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    borderColor: '#FF3B30',
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakText: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 4,
  },
  endContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  endMessage: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  finalScore: {
    fontSize: 16,
    marginBottom: 8,
  },
  correctCount: {
    fontSize: 16,
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  playAgainButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  playAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
});