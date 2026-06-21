import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: IconName;
}

export function ErrorCard({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  icon = 'cloud-offline-outline',
}: ErrorCardProps) {
  const C = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: C.card, borderColor: C.border }]}>
      <View style={[styles.iconBox, { backgroundColor: `${C.destructive}12` }]}>
        <Ionicons name={icon} size={28} color={C.destructive} />
      </View>
      <Text style={[styles.title, { color: C.foreground }]}>{title}</Text>
      <Text style={[styles.msg, { color: C.mutedForeground }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: C.primary }]} onPress={onRetry} activeOpacity={0.85}>
          <Ionicons name="refresh-outline" size={15} color="#fff" />
          <Text style={styles.btnText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface EmptyCardProps {
  emoji?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyCard({ emoji = '📭', title, message, actionLabel, onAction }: EmptyCardProps) {
  const C = useTheme();
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: C.foreground }]}>{title}</Text>
      <Text style={[styles.msg, { color: C.mutedForeground }]}>{message}</Text>
      {onAction && actionLabel && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: C.primary }]} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface LockedCardProps {
  featureName: string;
  description?: string;
  onUnlock: () => void;
}

export function LockedCard({ featureName, description, onUnlock }: LockedCardProps) {
  const C = useTheme();
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.lockCircle}>
        <Ionicons name="lock-closed" size={32} color="#f97316" />
      </View>
      <Text style={[styles.title, { color: C.foreground, marginTop: 16 }]}>{featureName} is Locked</Text>
      <Text style={[styles.msg, { color: C.mutedForeground }]}>
        {description ?? 'Activate your account to unlock this feature and access all study materials.'}
      </Text>
      <TouchableOpacity style={styles.unlockBtn} onPress={onUnlock} activeOpacity={0.85}>
        <Ionicons name="key-outline" size={16} color="#fff" />
        <Text style={styles.btnText}>Activate Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    margin: 20, padding: 24, borderRadius: 20,
    borderWidth: 1, alignItems: 'center', gap: 10,
  },
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 60, paddingHorizontal: 32,
  },
  iconBox: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  lockCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff7ed', borderWidth: 2, borderColor: '#fed7aa',
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 52 },
  title: {
    fontSize: 17, fontFamily: 'Inter_700Bold', textAlign: 'center',
  },
  msg: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    textAlign: 'center', lineHeight: 20, marginTop: 2,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12,
  },
  unlockBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 20, paddingVertical: 13, paddingHorizontal: 28,
    backgroundColor: '#f97316', borderRadius: 14,
  },
  btnText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#fff' },
});
