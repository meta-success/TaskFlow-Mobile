/**
 * Aura visual system — midnight canvas, orchid light, and champagne gold.
 */
export const colors = {
  bg: '#07050F',
  bgElevated: '#100C1C',
  bgCard: 'rgba(28, 20, 48, 0.78)',
  bgInput: 'rgba(18, 14, 32, 0.92)',
  border: 'rgba(243, 199, 122, 0.18)',
  borderStrong: 'rgba(232, 214, 255, 0.16)',
  text: '#F7F1FF',
  textMuted: '#C9B8E4',
  textDim: '#8B7BA6',
  primary: '#C084FC',
  primaryDeep: '#7C3AED',
  primarySoft: 'rgba(192, 132, 252, 0.16)',
  accent: '#F3C77A',
  accentSoft: 'rgba(243, 199, 122, 0.14)',
  rose: '#FF8BA7',
  danger: '#FF6B8A',
  warning: '#F5C16C',
  userBubble: '#7C3AED',
  assistantBubble: 'rgba(22, 16, 40, 0.92)',
  online: '#7EE0B8',
  offline: '#FF8A5B',
  glowPurple: 'rgba(124, 58, 237, 0.38)',
  glowGold: 'rgba(243, 199, 122, 0.22)',
  glowRose: 'rgba(255, 139, 167, 0.18)',
};

export const shadows = {
  card: {
    shadowColor: '#C084FC',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 10},
    elevation: 8,
  },
  gold: {
    shadowColor: '#F3C77A',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 32,
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  pill: 999,
};

export const typography = {
  display: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: colors.text,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textMuted,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.textDim,
    textTransform: 'uppercase',
  },
};
