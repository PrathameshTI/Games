import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const LoadingFallback = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

export const createLazyGame = (importFn: () => Promise<any>) => {
  const LazyComponent = lazy(importFn);
  
  return (props: any) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
