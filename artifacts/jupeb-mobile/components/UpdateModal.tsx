import { Modal, View, Text, TouchableOpacity, Linking, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import type { UpdateInfo } from '@/hooks/useAppUpdate';

interface Props {
  info: UpdateInfo;
  onDismiss: () => void;
}

export default function UpdateModal({ info, onDismiss }: Props) {
  const handleDownload = () => {
    if (info.downloadUrl) Linking.openURL(info.downloadUrl);
  };

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="rocket-outline" size={32} color="#8b5cf6" />
          </View>

          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.version}>Version {info.version}</Text>

          {!!info.notes && (
            <View style={styles.notesWrap}>
              <Text style={styles.notesLabel}>What's new</Text>
              <Text style={styles.notes}>{info.notes}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.85}>
            <Ionicons name="download-outline" size={18} color="#fff" />
            <Text style={styles.downloadBtnText}>Download Update</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterBtn} onPress={onDismiss} activeOpacity={0.7}>
            <Text style={styles.laterBtnText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: '#18181f',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    padding: 28,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139,92,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  version: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    marginBottom: 16,
  },
  notesWrap: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  notesLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  notes: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 20,
  },
  downloadBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  laterBtn: {
    paddingVertical: 8,
  },
  laterBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
});
