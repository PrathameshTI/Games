import { useTheme } from '@/src/theme/ThemeProvider';
import { Stack } from 'expo-router';

export default function GamesLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="spin-wheel" options={{ title: 'Spin Wheel' }} />
      <Stack.Screen name="scratch-card" options={{ title: 'Scratch Card' }} />
      <Stack.Screen name="trivia-quiz" options={{ title: 'Trivia Quiz' }} />
      <Stack.Screen name="tap-to-win" options={{ title: 'Tap To Win' }} />
      <Stack.Screen name="memory-match" options={{ title: 'Memory Match' }} />
      <Stack.Screen name="lucky-draw" options={{ title: 'Lucky Draw' }} />
      <Stack.Screen name="treasure-hunt" options={{ title: 'Treasure Hunt' }} />
      <Stack.Screen name="whack-a-mole" options={{ title: 'Whack-a-Mole' }} />
      <Stack.Screen name="bubble-pop" options={{ title: 'Bubble Pop' }} />
      <Stack.Screen name="slot-machine" options={{ title: 'Slot Machine' }} />
      <Stack.Screen name="word-scramble" options={{ title: 'Word Scramble' }} />
      <Stack.Screen name="reaction-tester" options={{ title: 'Reaction Tester' }} />
      <Stack.Screen name="time-capsule" options={{ title: 'Time Capsule' }} />
      <Stack.Screen name="predict-win" options={{ title: 'Predict & Win' }} />
      <Stack.Screen name="shake-to-win" options={{ title: 'Shake & Win' }} />
    </Stack>
  );
}