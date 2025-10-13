import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const GAME_WIDTH = screenWidth - 40;
const GAME_HEIGHT = 400;
const BUBBLE_SIZE = 50;
const GAME_DURATION = 45;

const BUBBLE_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB6C1', '#98FB98'];

interface Bubble {
  id: number;
  x: number;
  y: Animated.Value;
  color: string;
  points: number;
  popped: boolean;
}

export default function BubblePopGame() {
  const [coins, setCoins] = useState(1000);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [bestScore, setBestScore] = useState(0);
  const [bubblesPopped, setBubblesPopped] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const bubbleIdRef = useRef(0);
  const comboTimerRef = useRef<NodeJS.Timeout>();

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
      spawnBubble();
    }
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [gameActive]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameActive(true);
    setGameOver(false);
    setBubbles([]);
    setBubblesPopped(0);
    setCombo(0);
    setMaxCombo(0);
    bubbleIdRef.current = 0;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    
    if (score > bestScore) {
      setBestScore(score);
    }
    
    // Calculate reward
    const reward = Math.floor(score / 10); // 1 coin per 10 points
    setCoins(coins + reward);
    
    // Clear all bubbles
    setBubbles([]);
    
    if (score > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const spawnBubble = () => {
    if (!gameActive) return;
    
    const newBubble: Bubble = {
      id: bubbleIdRef.current++,
      x: Math.random() * (GAME_WIDTH - BUBBLE_SIZE),
      y: new Animated.Value(GAME_HEIGHT + BUBBLE_SIZE),
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      points: Math.floor(Math.random() * 3) + 1, // 1-3 points
      popped: false,
    };

    // Animate bubble floating up
    Animated.timing(newBubble.y, {
      toValue: -BUBBLE_SIZE,
      duration: 4000 + Math.random() * 2000, // 4-6 seconds to cross screen
      useNativeDriver: false,
    }).start(() => {
      // Remove bubble if it reaches the top without being popped
      setBubbles(prevBubbles => 
        prevBubbles.filter(bubble => bubble.id !== newBubble.id)
      );
    });

    setBubbles(prevBubbles => [...prevBubbles, newBubble]);
    
    // Schedule next bubble spawn
    const spawnDelay = Math.random() * 1000 + 500; // 0.5-1.5 seconds
    spawnTimerRef.current = setTimeout(() => {
      if (gameActive) {
        spawnBubble();
      }
    }, spawnDelay);
  };

  const popBubble = (bubbleId: number) => {
    if (!gameActive) return;
    
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble || bubble.popped) return;
    
    // Mark bubble as popped
    setBubbles(prevBubbles => 
      prevBubbles.map(b => 
        b.id === bubbleId ? { ...b, popped: true } : b
      )
    );
    
    // Calculate points with combo multiplier
    const comboMultiplier = Math.min(combo + 1, 5); // Max 5x multiplier
    const points = bubble.points * comboMultiplier;
    
    setScore(score + points);
    setBubblesPopped(bubblesPopped + 1);
    setCombo(combo + 1);
    
    if (combo + 1 > maxCombo) {
      setMaxCombo(combo + 1);
    }
    
    // Reset combo timer
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 2000); // Combo resets after 2 seconds of no pops
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Remove bubble after short delay
    setTimeout(() => {
      setBubbles(prevBubbles => 
        prevBubbles.filter(bubble => bubble.id !== bubbleId)
      );
    }, 100);
  };

  const getPerformanceMessage = () => {
    if (score >= 500) return '🫧 BUBBLE MASTER! 🫧';
    if (score >= 400) return '🌟 AMAZING! 🌟';
    if (score >= 300) return '⭐ EXCELLENT! ⭐';
    if (score >= 200) return '👍 GREAT! 👍';
    if (score >= 100) return '💪 GOOD! 💪';
    return '🫧 Keep popping! 🫧';
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title">Bubble Pop</ThemedText>
          <ThemedText style={styles.subtitle}>Pop colorful bubbles!</ThemedText>
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
            {combo > 1 && (
              <ThemedText style={styles.comboText}>
                🔥 {combo}x COMBO! 🔥
              </ThemedText>
            )}
          </View>
        )}

        {!gameActive && !gameOver && (
          <View style={styles.startContainer}>
            <ThemedText style={styles.instructionText}>
              Pop the floating bubbles!
            </ThemedText>
            <ThemedText style={styles.tipText}>
              Chain pops for combo multipliers up to 5x!
            </ThemedText>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <ThemedText style={styles.startButtonText}>START GAME</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {(gameActive || gameOver) && (
          <View style={styles.gameContainer}>
            <View style={[styles.gameArea, { width: GAME_WIDTH, height: GAME_HEIGHT }]}>
              {bubbles.map((bubble) => (
                !bubble.popped && (
                  <Animated.View
                    key={bubble.id}
                    style={[
                      styles.bubble,
                      {
                        left: bubble.x,
                        top: bubble.y,
                        backgroundColor: bubble.color,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.bubbleTouch}
                      onPress={() => popBubble(bubble.id)}
                    >
                      <ThemedText style={styles.bubbleText}>
                        {bubble.points}
                      </ThemedText>
                    </TouchableOpacity>
                  </Animated.View>
                )
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
              <ThemedText style={styles.resultText}>Final Score: {score}</ThemedText>
              <ThemedText style={styles.resultText}>Bubbles Popped: {bubblesPopped}</ThemedText>
              <ThemedText style={styles.resultText}>Max Combo: {maxCombo}x</ThemedText>
              <ThemedText style={styles.rewardText}>
                Earned: {Math.floor(score / 10)} coins! 💰
              </ThemedText>
            </View>
            
            <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
              <ThemedText style={styles.playAgainText}>PLAY AGAIN</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>How to Play</ThemedText>
          <ThemedText style={styles.infoText}>• Tap bubbles as they float up</ThemedText>
          <ThemedText style={styles.infoText}>• Different bubbles give 1-3 points</ThemedText>
          <ThemedText style={styles.infoText}>• Chain pops for combo multipliers</ThemedText>
          <ThemedText style={styles.infoText}>• Earn 1 coin per 10 points</ThemedText>
          <ThemedText style={styles.infoText}>• Game lasts 45 seconds</ThemedText>
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
  gameInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  comboText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
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
  gameContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gameArea: {
    backgroundColor: 'rgba(135, 206, 250, 0.3)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(135, 206, 250, 0.5)',
    position: 'relative',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bubbleTouch: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameOverContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  performanceText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultText: {
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