import React, { memo } from 'react';
import { GameCard } from './GameCard';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
}

interface LazyGameCardProps {
  game: Game;
}

// Memoize game cards to prevent unnecessary re-renders
export const LazyGameCard = memo<LazyGameCardProps>(({ game }) => {
  return <GameCard game={game} />;
});

LazyGameCard.displayName = 'LazyGameCard';