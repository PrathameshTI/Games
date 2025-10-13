import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type GameState = 'waiting' | 'ready' | 'green' | 'result' | 'tooEarly';

export default function ReactionTesterGame() {
  const [coins, setCoins] = useState(1000);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [round, setRound] = useState(0);
  const [roundTimes, setRoundTimes] = useState<number[]>([]);
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startTest = () => {
    if (round >= 5) {
      // Game complete after 5 rounds
      finishGame();
      return;
    }
    
    setGameState('ready');
    setReactionTime(0);
    
    // Random delay between 2-6 seconds
    const delay = Math.random() * 4000 + 2000;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('green');
      startTimeRef.current = Date.now();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, delay);
  };

  const handleTap = () => {
    if (gameState === 'ready') {
      // Tapped too early
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setGameState('tooEarly');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    if (gameState === 'green') {
      // Calculate reaction time
      const endTime = Date.now();
      const reaction = endTime - startTimeRef.current;
      
      setReactionTime(reaction);
      setGameState('result');
      setAttempts(attempts + 1);
      setTotalTime(totalTime + reaction);
      setRound(round + 1);
      setRoundTimes([...roundTimes, reaction]);
      
      // Update best time
      if (bestTime === 0 || reaction < bestTime) {
        setBestTime(reaction);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Calculate average
      setAverageTime(Math.round((totalTime + reaction) / (attempts + 1)));
    }
  };

  const nextRound = () => {
    if (round < 5) {
      startTest();
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    // Calculate final score and reward
    const avgReaction = roundTimes.reduce((sum, time) => sum + time, 0) / roundTimes.length;
    
    let reward = 0;
    if (avgReaction < 200) reward = 100; // Excellent
    else if (avgReaction < 250) reward = 75; // Great
    else if (avgReaction < 300) reward = 50; // Good
    else if (avgReaction < 400) reward = 25; // Average
    else reward = 10; // Slow
    
    setCoins(coins + reward);
    
    // Reset for new game
    setRound(0);
    setRoundTimes([]);
    setGameState('waiting');
  };

  const resetGame = () => {
    setGameState('waiting');
    setReactionTime(0);
    setRound(0);
    setRoundTimes([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const getReactionRating = (time: number) => {
    if (time < 200) return { rating: 'LIGHTNING FAST! ⚡', color: '#FFD700' };
    if (time < 250) return { rating: 'EXCELLENT! 🔥', color: '#FF6B6B' };
    if (time < 300) return { rating: 'GREAT! ⭐', color: '#4ECDC4' };
    if (time < 400) return { rating: 'GOOD! 👍', color: '#96CEB4' };
    if (time < 500) return { rating: 'AVERAGE 📊', color: '#FFEAA7' };
    return { rating: 'SLOW 🐌', color: '#DDA0DD' };
  };

  const getGameStateColor = () => {
    switch (gameState) {
      case 'ready': return '#FF6B6B';
      case 'green': return '#34C759';
      case 'tooEarly': return '#FF3B30';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const getGameStateText = () => {
    switch (gameState) {
      case 'waiting': return 'Tap "Start Test" to begin';
      case 'ready': return 'Wait for GREEN...';
      case 'green': return 'TAP NOW!';
      case 'tooEarly': return 'Too early! Wait for green.';
      case 'result': return `${reactionTime}ms`;
      default: return '';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title">Reaction Tester</ThemedText>
          <ThemedText style={styles.subtitle}>Test your reflexes!</ThemedText>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{coins}</ThemedText>
            <ThemedText style={styles.statLabel}>Coins</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{bestTime || '---'}</ThemedText>
            <ThemedText style={styles.statLabel}>Best (ms)</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="subtitle">{averageTime || '---'}</ThemedText>
            <ThemedText style={styles.statLabel}>Average (ms)</ThemedText>
          </View>
        </View>

        {round > 0 && round <= 5 && (
          <View style={styles.progressContainer}>
            <ThemedText style={styles.progressText}>Round {round}/5</ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(round / 5) * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}

        <View style={styles.gameContainer}>
          <TouchableOpacity
            style={[
              styles.testArea,
              { backgroundColor: getGameStateColor() }
            ]}
            onPress={handleTap}
            disabled={gameState === 'waiting'}
          >
            <ThemedText style={styles.testText}>
              {getGameStateText()}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {gameState === 'result' && (
          <View style={styles.resultContainer}>
            <ThemedText 
              style={[
                styles.ratingText,
                { color: getReactionRating(reactionTime).color }
              ]}
            >
              {getReactionRating(reactionTime).rating}
            </ThemedText>
            
            {round < 5 ? (
              <TouchableOpacity style={styles.nextButton} onPress={nextRound}>
                <ThemedText style={styles.nextButtonText}>NEXT ROUND</ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={styles.gameCompleteContainer}>
                <ThemedText style={styles.gameCompleteTitle}>Test Complete!</ThemedText>
                <View style={styles.finalResults}>
                  <ThemedText style={styles.finalResultText}>
                    Best: {Math.min(...roundTimes)}ms
                  </ThemedText>
                  <ThemedText style={styles.finalResultText}>
                    Average: {Math.round(roundTimes.reduce((sum, time) => sum + time, 0) / roundTimes.length)}ms
                  </ThemedText>
                  <ThemedText style={styles.rewardText}>
                    Earned: {
                      (() => {
                        const avg = roundTimes.reduce((sum, time) => sum + time, 0) / roundTimes.length;
                        if (avg < 200) return 100;
                        if (avg < 250) return 75;
                        if (avg < 300) return 50;
                        if (avg < 400) return 25;
                        return 10;
                      })()
                    } coins! 💰
                  </ThemedText>
                </View>
                <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
                  <ThemedText style={styles.playAgainText}>PLAY AGAIN</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {gameState === 'tooEarly' && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>Too Early!</ThemedText>
            <ThemedText style={styles.errorSubtext}>Wait for the green signal</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={startTest}>
              <ThemedText style={styles.retryButtonText}>TRY AGAIN</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'waiting' && (
          <View style={styles.startContainer}>
            <ThemedText style={styles.instructionText}>
              Tap the area as soon as it turns GREEN!
            </ThemedText>
            <ThemedText style={styles.tipText}>
              Complete 5 rounds to get your final score
            </ThemedText>
            <TouchableOpacity style={styles.startButton} onPress={startTest}>
              <ThemedText style={styles.startButtonText}>START TEST</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {roundTimes.length > 0 && (
          <View style={styles.historyContainer}>
            <ThemedText style={styles.historyTitle}>Round Times</ThemedText>
            <View style={styles.historyList}>
              {roundTimes.map((time, index) => (
                <View key={index} style={styles.historyItem}>
                  <ThemedText style={styles.historyText}>
                    R{index + 1}: {time}ms
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>Reaction Time Guide</ThemedText>
          <ThemedText style={styles.infoText}>• Under 200ms: Lightning fast ⚡</ThemedText>
          <ThemedText style={styles.infoText}>• 200-250ms: Excellent reflexes 🔥</ThemedText>
          <ThemedText style={styles.infoText}>• 250-300ms: Great reaction time ⭐</ThemedText>
          <ThemedText style={styles.infoText}>• 300-400ms: Good reflexes 👍</ThemedText>
          <ThemedText style={styles.infoText}>• Over 400ms: Room for improvement 📊</ThemedText>
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
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    width: 200,
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
  gameContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  testArea: {
    width: 300,
    height: 200,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  testText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameCompleteContainer: {
    alignItems: 'center',
  },
  gameCompleteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  finalResults: {
    alignItems: 'center',
    marginBottom: 20,
  },
  finalResultText: {
    fontSize: 16,
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
    marginTop: 8,
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
  errorContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  instructionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
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
  historyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  historyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
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