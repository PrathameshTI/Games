import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function TapToWinGame() {
  const [coins, setCoins] = useState(1000);
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [powerUpActive, setPowerUpActive] = useState(false);
  const [totalTaps, setTotalTaps] = useState(0);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const powerUpAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameActive, timeLeft, endGame]);

  const startGame = () => {
    setTaps(0);
    setTimeLeft(15);
    setGameActive(true);
    setGameOver(false);
    setMultiplier(1);
    setPowerUpActive(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const endGame = useCallback(() => {
    setGameActive(false);
    setGameOver(true);
    
    if (taps > bestScore) {
      setBestScore(taps);
    }
    
    // Calculate reward based on performance
    const reward = Math.floor(taps * 2);
    setCoins(coins + reward);
    setTotalTaps(totalTaps + taps);
    
    if (taps > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [taps, bestScore, coins, totalTaps]);

  const handleTap = () => {
    if (!gameActive) return;
    
    const tapValue = multiplier;
    setTaps(taps + tapValue);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Random power-up chance (5% chance every 10 taps)
    if ((taps + tapValue) % 10 === 0 && Math.random() < 0.05) {
      activatePowerUp();
    }
  };

  const activatePowerUp = () => {
    if (powerUpActive) return;
    
    setPowerUpActive(true);
    setMultiplier(3);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Animate power-up
    Animated.sequence([
      Animated.timing(powerUpAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(powerUpAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Power-up lasts 3 seconds
    setTimeout(() => {
      setPowerUpActive(false);
      setMultiplier(1);
    }, 3000);
  };

  const getTapsPerSecond = () => {
    const elapsed = 15 - timeLeft;
    return elapsed > 0 ? (taps / elapsed).toFixed(1) : '0.0';
  };

  const getPerformanceMessage = () => {
    if (taps >= 200) return '🚀 INCREDIBLE! 🚀';
    if (taps >= 150) return '🔥 AMAZING! 🔥';
    if (taps >= 100) return '⭐ EXCELLENT! ⭐';
    if (taps >= 75) return '👍 GREAT! 👍';
    if (taps >= 50) return '💪 GOOD! 💪';
    return '📱 Keep practicing! 📱';
  };

  const getReward = () => {
    const reward = Math.floor(taps * 2);
    return reward;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <ThemedText type="title">Tap To Win</ThemedText>
        <ThemedText style={styles.subtitle}>Tap as fast as you can!</ThemedText>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <ThemedText type="subtitle">{coins}</ThemedText>
          <ThemedText style={styles.statLabel}>Coins</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="subtitle">{taps}</ThemedText>
          <ThemedText style={styles.statLabel}>Taps</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="subtitle">{bestScore}</ThemedText>
          <ThemedText style={styles.statLabel}>Best</ThemedText>
        </View>
      </View>

      {gameActive && (
        <View style={styles.gameInfo}>
          <ThemedText style={styles.timeText}>Time: {timeLeft}s</ThemedText>
          <ThemedText style={styles.speedText}>Speed: {getTapsPerSecond()} taps/sec</ThemedText>
          {powerUpActive && (
            <Animated.View 
              style={[
                styles.powerUpIndicator,
                {
                  transform: [{
                    scale: powerUpAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  }],
                },
              ]}
            >
              <ThemedText style={styles.powerUpText}>🔥 3X MULTIPLIER! 🔥</ThemedText>
            </Animated.View>
          )}
        </View>
      )}

      {!gameActive && !gameOver && (
        <View style={styles.startContainer}>
          <ThemedText style={styles.instructionText}>
            Tap the button as fast as possible for 15 seconds!
          </ThemedText>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <ThemedText style={styles.startButtonText}>START GAME</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {gameActive && (
        <View style={styles.tapArea}>
          <Animated.View style={[styles.tapButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity 
              style={[
                styles.tapButton,
                powerUpActive && styles.tapButtonPowerUp
              ]} 
              onPress={handleTap}
            >
              <ThemedText style={styles.tapText}>TAP!</ThemedText>
              {multiplier > 1 && (
                <ThemedText style={styles.multiplierText}>x{multiplier}</ThemedText>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {gameOver && (
        <View style={styles.gameOverContainer}>
          <ThemedText style={styles.gameOverTitle}>Time's Up!</ThemedText>
          <ThemedText style={styles.performanceText}>{getPerformanceMessage()}</ThemedText>
          
          <View style={styles.resultsContainer}>
            <ThemedText style={styles.resultText}>Final Taps: {taps}</ThemedText>
            <ThemedText style={styles.resultText}>Average Speed: {getTapsPerSecond()} taps/sec</ThemedText>
            <ThemedText style={styles.rewardText}>Earned: {getReward()} coins! 💰</ThemedText>
          </View>
          
          <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
            <ThemedText style={styles.playAgainText}>PLAY AGAIN</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoContainer}>
        <ThemedText style={styles.infoTitle}>Game Info</ThemedText>
        <ThemedText style={styles.infoText}>• Tap as fast as possible for 15 seconds</ThemedText>
        <ThemedText style={styles.infoText}>• Earn 2 coins per tap</ThemedText>
        <ThemedText style={styles.infoText}>• Random 3x multiplier power-ups</ThemedText>
        <ThemedText style={styles.infoText}>• Total taps: {totalTaps}</ThemedText>
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
    justifyContent: 'center',
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.7,
    fontSize: 12,
    marginTop: 4,
  },
  gameInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  speedText: {
    fontSize: 16,
    opacity: 0.8,
  },
  powerUpIndicator: {
    marginTop: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  powerUpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  startContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  instructionText: {
    fontSize: 16,
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
  tapArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tapButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tapButtonPowerUp: {
    backgroundColor: '#FFD700',
    borderWidth: 4,
    borderColor: '#FF6B6B',
  },
  tapText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  multiplierText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  gameOverContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  performanceText: {
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  resultsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
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