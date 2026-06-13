import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, layout, radius, spacing, typography, colors } from '../../theme';
import { homeColors } from '../../theme/home';
import { AppCanvas } from './AppCanvas';

type ScreenProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showBrand?: boolean;
  contentStyle?: ViewStyle;
  scroll?: boolean;
  accent?: string;
};

export function Screen({
  title,
  subtitle,
  children,
  footer,
  showBrand = true,
  contentStyle,
  scroll = true,
  accent = homeColors.goldDeep,
}: ScreenProps) {
  const body = (
    <>
      <View style={styles.header}>
        {showBrand ? <Text style={[styles.eyebrow, { color: accent }]}>Mission Team</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.body, contentStyle]}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );

  return (
    <AppCanvas style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          {scroll ? (
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <View style={styles.inner}>{body}</View>
            </ScrollView>
          ) : (
            <View style={[styles.content, styles.inner, styles.flex]}>{body}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppCanvas>
  );
}

type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textSubtle}
        style={[styles.input, style]}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  inner: {
    alignSelf: 'center',
    maxWidth: layout.maxContentWidth,
    width: '100%',
  },
  header: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.eyebrow,
    fontFamily: fonts.extraBold,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.hero,
    color: homeColors.ink,
  },
  subtitle: {
    ...typography.body,
    color: homeColors.muted,
    marginTop: spacing.sm,
  },
  body: {
    flex: 1,
    gap: spacing.md,
  },
  footer: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: homeColors.ink,
    fontFamily: fonts.bold,
  },
  hint: {
    ...typography.caption,
    color: homeColors.muted,
  },
  input: {
    backgroundColor: homeColors.tileWhite,
    borderColor: '#D5DEE8',
    borderRadius: radius.md,
    borderWidth: 1,
    color: homeColors.ink,
    fontFamily: fonts.regular,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
