export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabIconSelected: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontSizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeights: {
      regular: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
    };
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#D9A404',
    secondary: '#BE952E',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: 'rgba(217, 164, 4, 0.3)',
    notification: '#D9A404',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    tint: '#D9A404',
    icon: '#BE952E',
    tabIconDefault: '#BE952E',
    tabIconSelected: '#D9A404',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    fontWeights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#D9A404',
    secondary: '#BE952E',
    background: '#0E0E0E',
    surface: '#1C1C1E',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    border: 'rgba(217, 164, 4, 0.3)',
    notification: '#D9A404',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    tint: '#D9A404',
    icon: '#BE952E',
    tabIconDefault: '#BE952E',
    tabIconSelected: '#D9A404',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    fontWeights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};
