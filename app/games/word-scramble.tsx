import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const WORDS = [
  'APPLE', 'BEACH', 'CHAIR', 'DANCE', 'EAGLE', 'FLAME', 'GRAPE', 'HOUSE',
  'IMAGE', 'JUICE', 'KNIFE', 'LIGHT', 'MUSIC', 'NIGHT', 'OCEAN', 'PEACE',
  'QUEEN', 'RIVER', 'SMILE', 'TIGER', 'UNITY', 'VOICE', 'WATER', 'YOUTH',
  'ZEBRA', 'MAGIC', 'POWER', 'DREAM', 'HAPPY', 'BRAVE', 'SMART', 'QUICK'
];

export default function WordScrambleGame() {
  const [coins, setCoins] = useState(1000);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [hint, setHint] = useState('');

  const timerRef = React.useRef<NodeJS.Timeout>();

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
  }, [gameActive, timeLeft]);

  const scrambleWord = (word: string) => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
  };

  const generateNewWord = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    let scrambled = scrambleWord(word);
    
    // Make sure scrambled word is different from original
    while (scrambled === word) {
      scrambled = scrambleWord(word);
    }
    
    setCurrentWord(word);
    setScrambledWord(scrambled);
    setUserInput('');
    setHint(getHint(word));
  };

  const getHint = (word: string) => {
    const hints: { [key: string]: string } = {
      'APPLE': 'A red or green fruit',
      'BEACH': 'Sandy shore by the ocean',
      'CHAIR': 'Furniture to sit on',
      'DANCE': 'Move to music',
      'EAGLE': 'Large bird of prey',
      'FLAME': 'Fire or burning gas',
      'GRAPE': 'Small round fruit',
      'HOUSE': 'Place where people live',
      'IMAGE': 'Picture or photo',
      'JUICE': 'Liquid from fruits',
      'KNIFE': 'Sharp cutting tool',
      'LIGHT': 'Brightness or illumination',
      'MUSIC': 'Sounds in harmony',
      'NIGHT': 'Dark time of day',
      'OCEAN': 'Large body of salt water',
      'PEACE': 'State of calm',
      'QUEEN': 'Female ruler',
      'RIVER': 'Flowing water',
      'SMILE': 'Happy facial expression',
      'TIGER': 'Large striped cat',
      'UNITY': 'Being together',
      'VOICE': 'Sound from speaking',
      'WATER': 'Clear liquid H2O',
      'YOUTH': 'Young people',
      'ZEBRA': 'Striped horse-like animal',
      'MAGIC': 'Supernatural power',
      'POWER': 'Strength or energy',
      'DREAM': 'Images during sleep',
      'HAPPY': 'Feeling of joy',
      'BRAVE': 'Showing courage',
      'SMART': 'Intelligent',
      'QUICK': 'Fast or rapid'
    };
    return hints[word] || 'No hint available';
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setGameActive(true);
    setGameOver(false);
    generateNewWord();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    
    if (score > bestScore) {
      setBestScore(score);
    }
    
    // Calculate reward
    const reward = score * 10; // 10 coins per word
    setCoins(coins + reward);
    
    if (score > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const checkAnswer = () => {
    if (userInput.toUpperCase() === currentWord) {
      // Correct answer
      const points = 10 + (streak * 2); // Bonus for streak
      setScore(score + points);
      setStreak(streak + 1);
      setTotalSolved(totalSolved + 1);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Generate new word
      setTimeout(() => {
        generateNewWord();
      }, 500);
    } else {
      // Wrong answer
      setStreak(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const skipWord = () => {
    setStreak(0);
    generateNewWord();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getPerformanceMessage = () => {
    if (score >= 200) return '📚 WORD MASTER! 📚';
    if (score >= 150) return '🔤 EXCELLENT! 🔤';
    if (score >= 100) return '⭐ GREAT! ⭐';
    if (score >= 50) return '👍 GOOD! 👍';
    return '📝 Keep practicing! 📝';
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title">Word Scramble</ThemedText>
          <ThemedText style={styles.subtitle}>Unscramble the words!</ThemedText>
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

        {gameActive && (
          <View style={styles.gameInfo}>
            <ThemedText style={styles.timeText}>Time: {timeLeft}s</ThemedText>
          </View>
        )}

        {!gameActive && !gameOver && (
          <View style={styles.startContainer}>
            <ThemedText style={styles.instructionText}>
              Unscramble the letters to form words!
            </ThemedText>
            <ThemedText style={styles.tipText}>
              Use hints to help you solve difficult words
            </ThemedText>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <ThemedText style={styles.startButtonText}>START GAME</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {gameActive && (
          <View style={styles.gameContainer}>
            <View style={styles.wordContainer}>
              <ThemedText style={styles.scrambledWord}>{scrambledWord}</ThemedText>
            </View>
            
            <View style={styles.hintContainer}>
              <ThemedText style={styles.hintLabel}>Hint:</ThemedText>
              <ThemedText style={styles.hintText}>{hint}</ThemedText>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Enter your answer..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={currentWord.length}
              />
            </View>
            
            <View style={styles.gameControls}>
              <TouchableOpacity style={styles.checkButton} onPress={checkAnswer}>
                <ThemedText style={styles.checkButtonText}>CHECK</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipButton} onPress={skipWord}>
                <ThemedText style={styles.skipButtonText}>SKIP</ThemedText>
              </TouchableOpacity>
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
              <ThemedText style={styles.resultText}>Words Solved: {Math.floor(score / 10)}</ThemedText>
              <ThemedText style={styles.resultText}>Best Score: {bestScore}</ThemedText>
              <ThemedText style={styles.rewardText}>
                Earned: {score * 10} coins! 💰
              </ThemedText>
            </View>
            
            <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
              <ThemedText style={styles.playAgainText}>PLAY AGAIN</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>How to Play</ThemedText>
          <ThemedText style={styles.infoText}>• Unscramble letters to form words</ThemedText>
          <ThemedText style={styles.infoText}>• Use hints to help solve words</ThemedText>
          <ThemedText style={styles.infoText}>• Earn 10 coins per word + streak bonus</ThemedText>
          <ThemedText style={styles.infoText}>• Game lasts 60 seconds</ThemedText>
          <ThemedText style={styles.infoText}>• Total solved: {totalSolved}</ThemedText>
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
  wordContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  scrambledWord: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  hintContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    opacity: 0.8,
  },
  hintText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    minWidth: 200,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  gameControls: {
    flexDirection: 'row',
    gap: 15,
  },
  checkButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  checkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  skipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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