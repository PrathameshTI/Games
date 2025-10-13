import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const PRIZES = [10, 25, 50, 100, 250, 500];
const SCRATCH_AREAS = 9; // 3x3 grid

export default function ScratchCardGame() {
  const [coins, setCoins] = useState(1000);
  const [scratchedAreas, setScratchedAreas] = useState<boolean[]>(new Array(SCRATCH_AREAS).fill(false));
  const [cardPrizes, setCardPrizes] = useState<number[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [totalWin, setTotalWin] = useState(0);
  const [cardsPlayed, setCardsPlayed] = useState(0);
  const [totalWins, setTotalWins] = useState(0);

  const generateNewCard = () => {
    if (coins < 50) return;
    
    setCoins(coins - 50);
    setScratchedAreas(new Array(SCRATCH_AREAS).fill(false));
    setGameActive(true);
    setTotalWin(0);
    
    // Generate random prizes for each area
    const newPrizes = Array.from({ length: SCRATCH_AREAS }, () => {
      const random = Math.random();
      if (random < 0.4) return 0; // 40% chance of no prize
      if (random < 0.7) return PRIZES[0]; // 30% chance of 10
      if (random < 0.85) return PRIZES[1]; // 15% chance of 25
      if (random < 0.93) return PRIZES[2]; // 8% chance of 50
      if (random < 0.97) return PRIZES[3]; // 4% chance of 100
      if (random < 0.99) return PRIZES[4]; // 2% chance of 250
      return PRIZES[5]; // 1% chance of 500
    });
    
    setCardPrizes(newPrizes);
    setCardsPlayed(cardsPlayed + 1);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const scratchArea = (index: number) => {
    if (!gameActive || scratchedAreas[index]) return;
    
    const newScratchedAreas = [...scratchedAreas];
    newScratchedAreas[index] = true;
    setScratchedAreas(newScratchedAreas);
    
    const prize = cardPrizes[index];
    if (prize > 0) {
      setTotalWin(totalWin + prize);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Check if all areas are scratched
    if (newScratchedAreas.every(area => area)) {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameActive(false);
    if (totalWin > 0) {
      setCoins(coins + totalWin);
      setTotalWins(totalWins + totalWin);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const scratchAll = () => {
    if (!gameActive) return;
    
    setScratchedAreas(new Array(SCRATCH_AREAS).fill(true));
    const cardTotal = cardPrizes.reduce((sum, prize) => sum + prize, 0);
    setTotalWin(cardTotal);
    finishGame();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const getWinMessage = () => {
    if (totalWin === 0) return 'Better luck next time!';
    if (totalWin >= 500) return '🎉 JACKPOT! 🎉';
    if (totalWin >= 250) return '🔥 BIG WIN! 🔥';
    if (totalWin >= 100) return '⭐ GREAT WIN! ⭐';
    return '💰 Winner! 💰';
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <ThemedText type="title">Scratch Card</ThemedText>
        <ThemedText style={styles.subtitle}>Scratch to reveal prizes!</ThemedText>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <ThemedText type="subtitle">{coins}</ThemedText>
          <ThemedText style={styles.statLabel}>Coins</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="subtitle">{cardsPlayed}</ThemedText>
          <ThemedText style={styles.statLabel}>Cards Played</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="subtitle">{totalWins}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Wins</ThemedText>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {!gameActive && cardPrizes.length === 0 ? (
          <View style={styles.newCardPrompt}>
            <ThemedText style={styles.promptText}>Buy a scratch card for 50 coins</ThemedText>
            <TouchableOpacity
              style={[styles.buyButton, coins < 50 && styles.buyButtonDisabled]}
              onPress={generateNewCard}
              disabled={coins < 50}
            >
              <ThemedText style={styles.buyButtonText}>BUY CARD (50 coins)</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.scratchCard}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>🎫 SCRATCH CARD 🎫</ThemedText>
                <ThemedText style={styles.cardSubtitle}>Scratch all areas to win!</ThemedText>
              </View>
              
              <View style={styles.scratchGrid}>
                {Array.from({ length: SCRATCH_AREAS }).map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.scratchArea,
                      scratchedAreas[index] && styles.scratchedArea,
                    ]}
                    onPress={() => scratchArea(index)}
                    disabled={!gameActive || scratchedAreas[index]}
                  >
                    {scratchedAreas[index] ? (
                      <View style={styles.revealedContent}>
                        {cardPrizes[index] > 0 ? (
                          <>
                            <ThemedText style={styles.prizeText}>{cardPrizes[index]}</ThemedText>
                            <ThemedText style={styles.coinsText}>coins</ThemedText>
                          </>
                        ) : (
                          <ThemedText style={styles.noWinText}>❌</ThemedText>
                        )}
                      </View>
                    ) : (
                      <View style={styles.scratchSurface}>
                        <ThemedText style={styles.scratchText}>SCRATCH</ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {gameActive && (
              <TouchableOpacity style={styles.scratchAllButton} onPress={scratchAll}>
                <ThemedText style={styles.scratchAllText}>SCRATCH ALL</ThemedText>
              </TouchableOpacity>
            )}

            {!gameActive && cardPrizes.length > 0 && (
              <View style={styles.resultContainer}>
                <ThemedText style={styles.resultMessage}>{getWinMessage()}</ThemedText>
                {totalWin > 0 && (
                  <ThemedText style={styles.winAmount}>Won: {totalWin} coins!</ThemedText>
                )}
                <TouchableOpacity
                  style={[styles.newCardButton, coins < 50 && styles.newCardButtonDisabled]}
                  onPress={generateNewCard}
                  disabled={coins < 50}
                >
                  <ThemedText style={styles.newCardButtonText}>NEW CARD (50 coins)</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.prizeInfo}>
        <ThemedText style={styles.prizeInfoTitle}>Prize Information</ThemedText>
        <ThemedText style={styles.prizeInfoText}>• Card cost: 50 coins</ThemedText>
        <ThemedText style={styles.prizeInfoText}>• Possible prizes: 10, 25, 50, 100, 250, 500 coins</ThemedText>
        <ThemedText style={styles.prizeInfoText}>• Each area has a chance to contain a prize</ThemedText>
        <ThemedText style={styles.prizeInfoText}>• Scratch all areas to collect your winnings</ThemedText>
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
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newCardPrompt: {
    alignItems: 'center',
  },
  promptText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  buyButtonDisabled: {
    backgroundColor: '#666',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scratchCard: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 20,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  scratchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  scratchArea: {
    width: 80,
    height: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scratchedArea: {
    backgroundColor: 'white',
  },
  scratchSurface: {
    width: '100%',
    height: '100%',
    backgroundColor: '#C0C0C0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scratchText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  revealedContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  prizeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00AA00',
  },
  coinsText: {
    fontSize: 10,
    color: '#666',
  },
  noWinText: {
    fontSize: 20,
  },
  scratchAllButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  scratchAllText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  winAmount: {
    fontSize: 16,
    color: '#00AA00',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  newCardButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  newCardButtonDisabled: {
    backgroundColor: '#666',
  },
  newCardButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  prizeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },
  prizeInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  prizeInfoText: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
});