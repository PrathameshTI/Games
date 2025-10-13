import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const GRID_SIZE = 5;
const TREASURE_COUNT = 3;
const TRAP_COUNT = 2;
const GAME_COST = 30;

interface Cell {
  id: number;
  revealed: boolean;
  type: 'empty' | 'treasure' | 'trap' | 'bonus';
  value: number;
}

export default function TreasureHuntGame() {
  const [coins, setCoins] = useState(1000);
  const [grid, setGrid] = useState<Cell[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [foundTreasures, setFoundTreasures] = useState(0);
  const [totalWin, setTotalWin] = useState(0);
  const [movesLeft, setMovesLeft] = useState(8);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [totalWins, setTotalWins] = useState(0);

  const generateGrid = () => {
    const newGrid: Cell[] = [];
    
    // Initialize empty grid
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      newGrid.push({
        id: i,
        revealed: false,
        type: 'empty',
        value: 0,
      });
    }
    
    // Place treasures
    const treasurePositions = new Set<number>();
    while (treasurePositions.size < TREASURE_COUNT) {
      const pos = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
      treasurePositions.add(pos);
    }
    
    treasurePositions.forEach(pos => {
      const treasureValue = Math.floor(Math.random() * 3) + 1; // 1-3 multiplier
      newGrid[pos] = {
        ...newGrid[pos],
        type: 'treasure',
        value: 50 * treasureValue,
      };
    });
    
    // Place traps
    const trapPositions = new Set<number>();
    while (trapPositions.size < TRAP_COUNT) {
      const pos = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
      if (!treasurePositions.has(pos)) {
        trapPositions.add(pos);
      }
    }
    
    trapPositions.forEach(pos => {
      newGrid[pos] = {
        ...newGrid[pos],
        type: 'trap',
        value: 0,
      };
    });
    
    // Place one bonus
    let bonusPos;
    do {
      bonusPos = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
    } while (treasurePositions.has(bonusPos) || trapPositions.has(bonusPos));
    
    newGrid[bonusPos] = {
      ...newGrid[bonusPos],
      type: 'bonus',
      value: 100,
    };
    
    return newGrid;
  };

  const startGame = () => {
    if (coins < GAME_COST) return;
    
    setCoins(coins - GAME_COST);
    setGrid(generateGrid());
    setGameActive(true);
    setGameOver(false);
    setFoundTreasures(0);
    setTotalWin(0);
    setMovesLeft(8);
    setGamesPlayed(gamesPlayed + 1);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const revealCell = (cellId: number) => {
    if (!gameActive || movesLeft <= 0) return;
    
    const newGrid = [...grid];
    const cell = newGrid[cellId];
    
    if (cell.revealed) return;
    
    cell.revealed = true;
    setGrid(newGrid);
    setMovesLeft(movesLeft - 1);
    
    switch (cell.type) {
      case 'treasure':
        setFoundTreasures(foundTreasures + 1);
        setTotalWin(totalWin + cell.value);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'bonus':
        setTotalWin(totalWin + cell.value);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'trap':
        // End game immediately
        endGame(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
    
    // Check win conditions
    if (foundTreasures === TREASURE_COUNT || movesLeft <= 1) {
      endGame(false);
    }
  };

  const endGame = (hitTrap: boolean) => {
    setGameActive(false);
    setGameOver(true);
    
    if (!hitTrap && totalWin > 0) {
      setCoins(coins + totalWin);
      setTotalWins(totalWins + totalWin);
    }
    
    // Reveal all cells
    const newGrid = grid.map(cell => ({ ...cell, revealed: true }));
    setGrid(newGrid);
  };

  const getCellContent = (cell: Cell) => {
    if (!cell.revealed) return '❓';
    
    switch (cell.type) {
      case 'treasure':
        return '💎';
      case 'bonus':
        return '⭐';
      case 'trap':
        return '💀';
      default:
        return '🕳️';
    }
  };

  const getCellStyle = (cell: Cell) => {
    if (!cell.revealed) return styles.hiddenCell;
    
    switch (cell.type) {
      case 'treasure':
        return [styles.revealedCell, styles.treasureCell];
      case 'bonus':
        return [styles.revealedCell, styles.bonusCell];
      case 'trap':
        return [styles.revealedCell, styles.trapCell];
      default:
        return [styles.revealedCell, styles.emptyCell];
    }
  };

  const getResultMessage = () => {
    if (foundTreasures === TREASURE_COUNT) {
      return '🏆 ALL TREASURES FOUND! 🏆';
    } else if (totalWin > 0) {
      return '💰 TREASURES COLLECTED! 💰';
    } else {
      return '💀 GAME OVER! 💀';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <ThemedText type="title">Treasure Hunt</ThemedText>
        <ThemedText style={styles.subtitle}>Find hidden treasures!</ThemedText>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <ThemedText type="subtitle">{coins}</ThemedText>
          <ThemedText style={styles.statLabel}>Coins</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="subtitle">{foundTreasures}/{TREASURE_COUNT}</ThemedText>
          <ThemedText style={styles.statLabel}>Treasures</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="subtitle">{totalWins}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Wins</ThemedText>
        </View>
      </View>

      {gameActive && (
        <View style={styles.gameInfo}>
          <ThemedText style={styles.movesText}>Moves Left: {movesLeft}</ThemedText>
          <ThemedText style={styles.winText}>Current Win: {totalWin} coins</ThemedText>
        </View>
      )}

      {!gameActive && !gameOver && (
        <View style={styles.startContainer}>
          <ThemedText style={styles.instructionText}>
            Find {TREASURE_COUNT} treasures hidden in the grid!
          </ThemedText>
          <ThemedText style={styles.warningText}>
            Beware of {TRAP_COUNT} traps that end the game instantly!
          </ThemedText>
          <TouchableOpacity
            style={[styles.startButton, coins < GAME_COST && styles.startButtonDisabled]}
            onPress={startGame}
            disabled={coins < GAME_COST}
          >
            <ThemedText style={styles.startButtonText}>
              START HUNT ({GAME_COST} coins)
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {(gameActive || gameOver) && (
        <View style={styles.gridContainer}>
          <View style={styles.grid}>
            {grid.map((cell, index) => (
              <TouchableOpacity
                key={cell.id}
                style={getCellStyle(cell)}
                onPress={() => revealCell(cell.id)}
                disabled={!gameActive || cell.revealed}
              >
                <ThemedText style={styles.cellText}>
                  {getCellContent(cell)}
                </ThemedText>
                {cell.revealed && cell.value > 0 && (
                  <ThemedText style={styles.cellValue}>
                    {cell.value}
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {gameOver && (
        <View style={styles.resultContainer}>
          <ThemedText style={styles.resultMessage}>{getResultMessage()}</ThemedText>
          <ThemedText style={styles.finalWin}>
            Final Win: {totalWin} coins
          </ThemedText>
          <TouchableOpacity
            style={[styles.playAgainButton, coins < GAME_COST && styles.playAgainButtonDisabled]}
            onPress={startGame}
            disabled={coins < GAME_COST}
          >
            <ThemedText style={styles.playAgainText}>
              HUNT AGAIN ({GAME_COST} coins)
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.legendContainer}>
        <ThemedText style={styles.legendTitle}>Legend</ThemedText>
        <View style={styles.legendGrid}>
          <View style={styles.legendItem}>
            <ThemedText style={styles.legendIcon}>💎</ThemedText>
            <ThemedText style={styles.legendText}>Treasure (50-150)</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <ThemedText style={styles.legendIcon}>⭐</ThemedText>
            <ThemedText style={styles.legendText}>Bonus (100)</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <ThemedText style={styles.legendIcon}>💀</ThemedText>
            <ThemedText style={styles.legendText}>Trap (Game Over)</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <ThemedText style={styles.legendIcon}>🕳️</ThemedText>
            <ThemedText style={styles.legendText}>Empty</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <ThemedText style={styles.infoTitle}>How to Play</ThemedText>
        <ThemedText style={styles.infoText}>• Pay {GAME_COST} coins to start hunting</ThemedText>
        <ThemedText style={styles.infoText}>• Find all {TREASURE_COUNT} treasures to win big</ThemedText>
        <ThemedText style={styles.infoText}>• Avoid {TRAP_COUNT} traps that end the game</ThemedText>
        <ThemedText style={styles.infoText}>• You have 8 moves to find treasures</ThemedText>
        <ThemedText style={styles.infoText}>• Games played: {gamesPlayed}</ThemedText>
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
  movesText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  winText: {
    fontSize: 14,
    color: '#FFD700',
  },
  startContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#FF6B6B',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  startButtonDisabled: {
    backgroundColor: '#666',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: GRID_SIZE * 60,
  },
  hiddenCell: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealedCell: {
    width: 60,
    height: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  treasureCell: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  bonusCell: {
    backgroundColor: '#4ECDC4',
    borderColor: '#45B7D1',
  },
  trapCell: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF3B30',
  },
  emptyCell: {
    backgroundColor: '#666',
    borderColor: '#555',
  },
  cellText: {
    fontSize: 20,
  },
  cellValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 2,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  finalWin: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  playAgainButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  playAgainButtonDisabled: {
    backgroundColor: '#666',
  },
  playAgainText: {
    color: 'white',
    fontWeight: 'bold',
  },
  legendContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  legendIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  legendText: {
    fontSize: 10,
    textAlign: 'center',
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