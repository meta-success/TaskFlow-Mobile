/**
 * Aura visual system — luminous twilight, orchid light, and bright gold.
 */
export const colors = {
  bg: '#16083A',
  bgElevated: '#2A1460',
  bgCard: 'rgba(255, 255, 255, 0.16)',
  bgInput: 'rgba(255, 255, 255, 0.22)',
  border: 'rgba(255, 236, 170, 0.45)',
  borderStrong: 'rgba(255, 255, 255, 0.42)',
  text: '#FFFFFF',
  textMuted: '#F0E4FF',
  textDim: '#D7C6F5',
  primary: '#E879F9',
  primaryDeep: '#C026D3',
  primarySoft: 'rgba(232, 121, 249, 0.28)',
  accent: '#FFD54A',
  accentSoft: 'rgba(255, 213, 74, 0.28)',
  rose: '#FF8EC8',
  danger: '#FF6B8A',
  warning: '#FFD54A',
  userBubble: '#A855F7',
  assistantBubble: 'rgba(255, 255, 255, 0.14)',
  online: '#5CFFC8',
  offline: '#FF8A5B',
  glowPurple: 'rgba(192, 38, 211, 0.55)',
  glowGold: 'rgba(255, 213, 74, 0.42)',
  glowRose: 'rgba(255, 142, 200, 0.38)',
  glowCyan: 'rgba(56, 189, 248, 0.42)',
};

export const shadows = {
  card: {
    shadowColor: '#E879F9',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
    elevation: 10,
  },
  gold: {
    shadowColor: '#FFD54A',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
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
    fontSize: 36,
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
    fontWeight: '700',
    letterSpacing: 1.4,
    color: colors.accent,
    textTransform: 'uppercase',
  },
};
