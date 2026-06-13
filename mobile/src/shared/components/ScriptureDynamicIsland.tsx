import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, typography } from '../../theme';
import { homeColors } from '../../theme/home';
import {
  SCRIPTURES,
  SCRIPTURE_CYCLE_MS,
  SCRIPTURE_ISLAND_BODY_HEIGHT,
} from '../data/scriptures';

type ScriptureDynamicIslandProps = {
  /** In-flow on home screen vs floating overlay (legacy). */
  variant?: 'embedded' | 'overlay';
};

export function ScriptureDynamicIsland({ variant = 'embedded' }: ScriptureDynamicIslandProps) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -6,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          return;
        }

        setIndex((current) => (current + 1) % SCRIPTURES.length);
        translateY.setValue(8);

        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, SCRIPTURE_CYCLE_MS);

    return () => clearInterval(interval);
  }, [opacity, translateY]);

  const scripture = SCRIPTURES[index];

  return (
    <View style={variant === 'overlay' ? styles.overlay : styles.embedded}>
      <Pressable
        accessibilityHint="Tap to expand the current verse"
        accessibilityRole="button"
        onPress={() => setExpanded((value) => !value)}
        style={[styles.pill, expanded && styles.pillExpanded]}
      >
        <View style={styles.dot} />
        <Animated.View
          style={[
            styles.content,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text numberOfLines={expanded ? 4 : 1} style={styles.verse}>
            {scripture.text}
          </Text>
          <Text style={styles.reference}>{scripture.reference}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 8,
    zIndex: 100,
  },
  embedded: {
    width: '100%',
  },
  pill: {
    alignItems: 'center',
    backgroundColor: homeColors.ink,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 10,
    minHeight: SCRIPTURE_ISLAND_BODY_HEIGHT,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 6px 18px rgba(17, 17, 17, 0.12)',
      } as object,
    }),
  },
  pillExpanded: {
    borderRadius: radius.lg,
    minHeight: 96,
  },
  dot: {
    backgroundColor: homeColors.tileGreen,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  verse: {
    ...typography.caption,
    color: colors.white,
    fontFamily: fonts.medium,
    lineHeight: 16,
  },
  reference: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.62)',
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
});
