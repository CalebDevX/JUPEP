import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/src/utils/api-url';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sourceType?: string;
  sourceRef?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

const QUICK_PROMPTS = [
  'Explain photosynthesis step by step',
  'Quiz me on Government Paper 001',
  'What are essay writing tips for LIT?',
  'Summarise the Nigerian Constitution',
  'Help me with Christian Religious Studies',
  'Key topics for Economics Paper 002',
];

export default function ChatTab() {
  const C = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const s = useMemo(() => makeStyles(C), [C]);
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Attachment state
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [urlInputOpen, setUrlInputOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [processingUrl, setProcessingUrl] = useState(false);
  const [pendingContent, setPendingContent] = useState<{ text: string; label: string; type: string; ref: string } | null>(null);

  // Quiz state
  const [quizModal, setQuizModal] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSource, setQuizSource] = useState('');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const apiUrl = getApiUrl();

  // ── Load history from API ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!profile?.phone) { setLoadingHistory(false); return; }
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/ai/chat-history?phone=${encodeURIComponent(profile.phone)}&limit=30`);
        if (!res.ok) throw new Error('Failed to load');
        const rows: any[] = await res.json();
        if (rows.length) {
          setMessages(rows.map(r => ({
            id: String(r.id),
            role: r.role as 'user' | 'assistant',
            content: r.content,
            sourceType: r.source_type,
            sourceRef: r.source_ref,
          })));
        } else {
          setMessages([{
            id: '0',
            role: 'assistant',
            content: `Hi${profile.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}! 👋 I'm **LexBot**, your JUPEB AI tutor.\n\nAsk me anything — exam topics, past questions, concepts you're struggling with. You can also paste a **YouTube or website URL** and I'll teach you from it, or tap 📎 to upload a photo of your notes or textbook!`,
          }]);
        }
        setHistoryLoaded(true);
      } catch {
        setMessages([{
          id: '0',
          role: 'assistant',
          content: `Hi! I'm LexBot, your JUPEB AI tutor. Ask me anything — tap 📎 to share a URL or image for me to teach from! 📚`,
        }]);
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [profile?.phone]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  // ── Send message ──────────────────────────────────────────────────────────────
  const send = useCallback(async (text?: string, srcType?: string, srcRef?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setPendingContent(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      sourceType: srcType,
      sourceRef: srcRef,
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`${apiUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          phone: profile?.phone,
          studentName: profile?.fullName,
          studentSubjects: Array.isArray(profile?.subjects) ? profile.subjects : [],
          history,
          stream: false,
          sourceType: srcType || null,
          sourceRef: srcRef || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply ?? data.content ?? 'Sorry, I couldn\'t get a response.';
        setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', content: reply }]);
        setQuizSource(reply);
      } else {
        const err = await res.json().catch(() => ({}));
        setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', content: `Sorry, something went wrong: ${err.error || res.statusText}` }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', content: 'Network error. Please check your connection and try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, profile, apiUrl]);

  // ── Process URL (YouTube or website) ─────────────────────────────────────────
  const processUrl = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) return;
    setProcessingUrl(true);
    try {
      const isYT = /youtube\.com|youtu\.be/.test(url);
      const res = await fetch(`${apiUrl}/ai/learn-from-source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isYT ? 'youtube' : 'website',
          content: url,
          studentName: profile?.fullName,
          studentSubjects: Array.isArray(profile?.subjects) ? profile.subjects : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not process URL');

      const label = isYT ? `📺 YouTube: ${url.slice(0, 50)}` : `🌐 Website: ${url.slice(0, 50)}`;
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: label, sourceType: isYT ? 'youtube' : 'website', sourceRef: url };
      const aiMsg: Message = { id: Date.now().toString() + 'a', role: 'assistant', content: data.content || data.title, sourceType: isYT ? 'youtube' : 'website' };
      setMessages(prev => [...prev, userMsg, aiMsg]);
      setQuizSource(data.content || data.title);

      // Save both to DB
      if (profile?.phone) {
        await fetch(`${apiUrl}/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: label, phone: profile.phone, stream: false, sourceType: isYT ? 'youtube' : 'website', sourceRef: url }) }).catch(() => {});
        pool_save(profile.phone, 'assistant', data.content || data.title);
      }

      setUrlInputOpen(false);
      setUrlInput('');
    } catch (e: any) {
      Alert.alert('Could not load URL', e.message || 'Try a different URL');
    } finally {
      setProcessingUrl(false);
    }
  }, [urlInput, apiUrl, profile]);

  // Save assistant message independently (for URL flow)
  const pool_save = async (phone: string, role: string, content: string) => {
    fetch(`${apiUrl}/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content, phone, stream: false }) }).catch(() => {});
  };

  // ── Pick image and send to AI ─────────────────────────────────────────────────
  const pickImage = useCallback(async () => {
    setAttachMenuOpen(false);
    try {
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission needed', 'Allow photo access to upload images.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        base64: true,
        allowsEditing: true,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const base64 = asset.base64;
      const mimeType = asset.mimeType || 'image/jpeg';
      if (!base64) { Alert.alert('Could not read image', 'Try a different image.'); return; }

      setLoading(true);
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: '📷 [Image uploaded — teaching me from this]', sourceType: 'image' };
      setMessages(prev => [...prev, userMsg]);

      const res = await fetch(`${apiUrl}/ai/learn-from-source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'file', fileBase64: base64, fileMimeType: mimeType, studentName: profile?.fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not process image');
      const aiMsg: Message = { id: Date.now().toString() + 'a', role: 'assistant', content: data.content || data.title, sourceType: 'image' };
      setMessages(prev => [...prev, aiMsg]);
      setQuizSource(data.content || data.title);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not process image. Try again.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, profile]);

  const takePhoto = useCallback(async () => {
    setAttachMenuOpen(false);
    try {
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission needed', 'Allow camera access to take photos.'); return; }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        base64: true,
        allowsEditing: true,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const base64 = asset.base64;
      if (!base64) return;

      setLoading(true);
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: '📸 [Photo taken — teaching me from this]', sourceType: 'image' };
      setMessages(prev => [...prev, userMsg]);

      const res = await fetch(`${apiUrl}/ai/learn-from-source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'file', fileBase64: base64, fileMimeType: 'image/jpeg', studentName: profile?.fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not process photo');
      const aiMsg: Message = { id: Date.now().toString() + 'a', role: 'assistant', content: data.content || data.title, sourceType: 'image' };
      setMessages(prev => [...prev, aiMsg]);
      setQuizSource(data.content || data.title);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not process photo. Try again.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, profile]);

  // ── Generate quiz from last AI response ───────────────────────────────────────
  const generateQuiz = useCallback(async () => {
    if (!quizSource) { Alert.alert('No content', 'Have a conversation first, then generate a quiz from what we discussed.'); return; }
    setQuizLoading(true);
    try {
      const res = await fetch(`${apiUrl}/ai/quiz-from-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: quizSource, count: 5 }),
      });
      const data = await res.json();
      if (!res.ok || !data.quiz?.length) throw new Error(data.error || 'No quiz generated');
      setQuizQuestions(data.quiz);
      setQuizIndex(0);
      setQuizAnswer(null);
      setQuizScore(0);
      setQuizDone(false);
      setQuizModal(true);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not generate quiz. Try again.');
    } finally {
      setQuizLoading(false);
    }
  }, [quizSource, apiUrl]);

  // ── Clear history ─────────────────────────────────────────────────────────────
  const clearHistory = useCallback(() => {
    Alert.alert('Clear chat?', 'This will delete all your conversation history with LexBot.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        if (profile?.phone) {
          await fetch(`${apiUrl}/ai/chat-history`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: profile.phone }) }).catch(() => {});
        }
        setMessages([{ id: '0', role: 'assistant', content: 'Chat cleared! Ready to help you study. What shall we tackle today? 📚' }]);
        setQuizSource('');
      }},
    ]);
  }, [profile, apiUrl]);

  // ── Quiz next ─────────────────────────────────────────────────────────────────
  const handleQuizAnswer = (opt: string) => {
    if (quizAnswer) return;
    setQuizAnswer(opt);
    const q = quizQuestions[quizIndex];
    if (opt.startsWith(q.correct)) setQuizScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (quizIndex + 1 >= quizQuestions.length) { setQuizDone(true); return; }
    setQuizIndex(i => i + 1);
    setQuizAnswer(null);
  };

  // ── Render message content (simple markdown-ish) ──────────────────────────────
  const renderContent = (text: string, isUser: boolean) => {
    const color = isUser ? '#fff' : C.foreground;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const key = `line-${i}`;
      if (line.startsWith('## ')) return <Text key={key} style={[s.bubbleText, { color, fontFamily: 'Inter_700Bold', fontSize: 15, marginTop: 6 }]}>{line.slice(3)}</Text>;
      if (line.startsWith('### ')) return <Text key={key} style={[s.bubbleText, { color, fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 4 }]}>{line.slice(4)}</Text>;
      if (line.startsWith('- ') || line.startsWith('• ')) return <Text key={key} style={[s.bubbleText, { color }]}>{'  • '}{line.slice(2)}</Text>;
      if (/^\d+\./.test(line)) return <Text key={key} style={[s.bubbleText, { color }]}>{line}</Text>;
      if (!line.trim()) return <Text key={key} style={{ height: 4 }} />;

      // Inline bold
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <Text key={key} style={[s.bubbleText, { color }]}>
          {parts.map((p, j) => j % 2 === 1
            ? <Text key={j} style={{ fontFamily: 'Inter_700Bold' }}>{p}</Text>
            : p
          )}
        </Text>
      );
    });
  };

  if (loadingHistory) {
    return (
      <View style={[s.container, { alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }]}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={[s.promptText, { marginTop: 12 }]}>Loading your chat history…</Text>
      </View>
    );
  }

  const lastAIContent = [...messages].reverse().find(m => m.role === 'assistant')?.content || '';

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerIcon}>
          <Ionicons name="school" size={18} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>LexBot</Text>
          <Text style={s.headerSub}>AI Tutor · JUPEB Expert</Text>
        </View>
        <TouchableOpacity
          onPress={() => generateQuiz()}
          disabled={quizLoading || !quizSource}
          style={[s.quizBtn, (!quizSource || quizLoading) && { opacity: 0.35 }]}
        >
          {quizLoading
            ? <ActivityIndicator size="small" color={C.primary} />
            : <><Ionicons name="help-circle" size={15} color={C.primary} /><Text style={s.quizBtnText}>Quiz me</Text></>
          }
        </TouchableOpacity>
        <TouchableOpacity onPress={clearHistory} style={s.clearBtn}>
          <Ionicons name="trash-outline" size={18} color={C.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.messages}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(m => (
          <View key={m.id} style={[s.bubble, m.role === 'user' ? s.userBubble : s.botBubble]}>
            {m.role === 'assistant' && (
              <View style={s.botAvatar}>
                <Ionicons name="school" size={12} color={C.primary} />
              </View>
            )}
            <View style={[s.bubbleInner, m.role === 'user' ? s.userInner : s.botInner]}>
              {m.sourceType && m.role === 'user' && (
                <View style={s.sourceTag}>
                  <Ionicons name={m.sourceType === 'youtube' ? 'logo-youtube' : m.sourceType === 'image' ? 'image-outline' : 'globe-outline'} size={11} color={C.primary} />
                  <Text style={s.sourceTagText}>{m.sourceType === 'youtube' ? 'YouTube' : m.sourceType === 'image' ? 'Image' : 'Website'}</Text>
                </View>
              )}
              {renderContent(m.content, m.role === 'user')}
            </View>
          </View>
        ))}
        {loading && (
          <View style={[s.bubble, s.botBubble]}>
            <View style={s.botAvatar}><Ionicons name="school" size={12} color={C.primary} /></View>
            <View style={[s.bubbleInner, s.botInner, s.typingInner]}>
              <ActivityIndicator size="small" color={C.mutedForeground} />
              <Text style={[s.bubbleText, { color: C.mutedForeground, fontSize: 12, marginLeft: 8 }]}>Thinking…</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick prompts (only when no history) */}
      {messages.length <= 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.prompts}
          contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
          {QUICK_PROMPTS.map(p => (
            <TouchableOpacity key={p} style={s.promptChip} onPress={() => send(p)}>
              <Text style={s.promptText} numberOfLines={1}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input bar */}
      <View style={[s.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={s.attachBtn} onPress={() => setAttachMenuOpen(true)}>
          <Ionicons name="attach" size={22} color={C.primary} />
        </TouchableOpacity>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask LexBot anything…"
          placeholderTextColor={C.mutedForeground}
          multiline
          maxLength={2000}
          returnKeyType="default"
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || loading) && s.sendDisabled]}
          onPress={() => send()}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Attachment menu */}
      <Modal visible={attachMenuOpen} transparent animationType="fade" onRequestClose={() => setAttachMenuOpen(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setAttachMenuOpen(false)}>
          <View style={[s.attachMenu, { bottom: insets.bottom + 80 }]}>
            <Text style={s.attachTitle}>Attach Content</Text>
            <TouchableOpacity style={s.attachOption} onPress={() => { setAttachMenuOpen(false); setUrlInputOpen(true); }}>
              <View style={[s.attachIconBox, { backgroundColor: '#3b82f620' }]}>
                <Ionicons name="globe-outline" size={22} color="#3b82f6" />
              </View>
              <View>
                <Text style={s.attachOptionTitle}>Paste URL</Text>
                <Text style={s.attachOptionSub}>YouTube, Wikipedia, any website</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={s.attachOption} onPress={pickImage}>
              <View style={[s.attachIconBox, { backgroundColor: '#10b98120' }]}>
                <Ionicons name="image-outline" size={22} color="#10b981" />
              </View>
              <View>
                <Text style={s.attachOptionTitle}>Upload Image</Text>
                <Text style={s.attachOptionSub}>Textbook page, past paper, notes</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={s.attachOption} onPress={takePhoto}>
              <View style={[s.attachIconBox, { backgroundColor: '#f59e0b20' }]}>
                <Ionicons name="camera-outline" size={22} color="#f59e0b" />
              </View>
              <View>
                <Text style={s.attachOptionTitle}>Take Photo</Text>
                <Text style={s.attachOptionSub}>Capture notes or questions</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* URL input modal */}
      <Modal visible={urlInputOpen} transparent animationType="slide" onRequestClose={() => setUrlInputOpen(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setUrlInputOpen(false)}>
          <Pressable style={[s.urlModal, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
            <Text style={s.urlModalTitle}>Paste a URL to learn from</Text>
            <Text style={s.urlModalSub}>YouTube videos, Wikipedia, or any educational website</Text>
            <TextInput
              style={s.urlInput}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="https://youtube.com/watch?v=... or any URL"
              placeholderTextColor={C.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={[s.urlBtn, s.urlBtnCancel]} onPress={() => { setUrlInputOpen(false); setUrlInput(''); }}>
                <Text style={[s.urlBtnText, { color: C.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.urlBtn, s.urlBtnPrimary, (!urlInput.trim() || processingUrl) && { opacity: 0.5 }]}
                onPress={processUrl}
                disabled={!urlInput.trim() || processingUrl}
              >
                {processingUrl
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={[s.urlBtnText, { color: '#fff' }]}>Teach me from this</Text>
                }
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Quiz Modal */}
      <Modal visible={quizModal} transparent animationType="slide" onRequestClose={() => setQuizModal(false)}>
        <View style={s.quizOverlay}>
          <View style={[s.quizContainer, { paddingBottom: insets.bottom + 16 }]}>
            {quizDone ? (
              <>
                <Text style={s.quizTitle}>Quiz Complete! 🎉</Text>
                <Text style={s.quizScore}>{quizScore}/{quizQuestions.length} correct</Text>
                <Text style={s.quizScoreLabel}>
                  {quizScore === quizQuestions.length ? 'Perfect score! Excellent work! 🌟' :
                   quizScore >= quizQuestions.length * 0.7 ? 'Great job! Keep studying! 💪' :
                   'Keep practising — you\'re getting there! 📚'}
                </Text>
                <TouchableOpacity style={[s.urlBtn, s.urlBtnPrimary, { marginTop: 20 }]} onPress={() => setQuizModal(false)}>
                  <Text style={[s.urlBtnText, { color: '#fff' }]}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={s.quizProgress}>Question {quizIndex + 1}/{quizQuestions.length}</Text>
                  <TouchableOpacity onPress={() => setQuizModal(false)}>
                    <Ionicons name="close" size={22} color={C.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <Text style={s.quizQuestion}>{quizQuestions[quizIndex]?.question}</Text>
                <View style={{ gap: 10, marginTop: 16 }}>
                  {quizQuestions[quizIndex]?.options.map((opt, i) => {
                    const letter = opt.charAt(0);
                    const isCorrect = letter === quizQuestions[quizIndex].correct;
                    const isSelected = quizAnswer === opt;
                    let bg = C.card;
                    let border = C.border;
                    if (quizAnswer) {
                      if (isCorrect) { bg = '#10b98120'; border = '#10b981'; }
                      else if (isSelected) { bg = '#ef444420'; border = '#ef4444'; }
                    }
                    return (
                      <TouchableOpacity key={i} style={[s.quizOption, { backgroundColor: bg, borderColor: border }]}
                        onPress={() => handleQuizAnswer(opt)} disabled={!!quizAnswer}>
                        <Text style={[s.quizOptionText, quizAnswer && isCorrect && { color: '#10b981', fontFamily: 'Inter_700Bold' }]}>{opt}</Text>
                        {quizAnswer && isCorrect && <Ionicons name="checkmark-circle" size={18} color="#10b981" />}
                        {quizAnswer && isSelected && !isCorrect && <Ionicons name="close-circle" size={18} color="#ef4444" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {quizAnswer && (
                  <View style={s.explanationBox}>
                    <Text style={s.explanationText}>{quizQuestions[quizIndex]?.explanation}</Text>
                    <TouchableOpacity style={[s.urlBtn, s.urlBtnPrimary, { marginTop: 12 }]} onPress={nextQuestion}>
                      <Text style={[s.urlBtnText, { color: '#fff' }]}>
                        {quizIndex + 1 >= quizQuestions.length ? 'See Results' : 'Next Question'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: C.border,
      backgroundColor: C.card,
    },
    headerIcon: {
      width: 36, height: 36, borderRadius: 12,
      backgroundColor: C.primary + '22',
      alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: C.foreground },
    headerSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: C.mutedForeground },
    quizBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 10, paddingVertical: 6,
      borderRadius: 12, backgroundColor: C.primary + '15',
    },
    quizBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: C.primary },
    clearBtn: { padding: 6 },
    messages: { flex: 1 },
    bubble: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
    userBubble: { justifyContent: 'flex-end' },
    botBubble: { justifyContent: 'flex-start' },
    botAvatar: {
      width: 28, height: 28, borderRadius: 10,
      backgroundColor: C.primary + '22',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    bubbleInner: { maxWidth: '82%', borderRadius: 18, padding: 12 },
    userInner: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
    botInner: { backgroundColor: C.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: C.border },
    typingInner: { padding: 10, flexDirection: 'row', alignItems: 'center' },
    bubbleText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
    sourceTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6, opacity: 0.8 },
    sourceTagText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: C.primary },
    prompts: { maxHeight: 46, marginBottom: 6 },
    promptChip: {
      backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9,
    },
    promptText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: C.mutedForeground },
    inputBar: {
      flexDirection: 'row', alignItems: 'flex-end', gap: 8,
      paddingHorizontal: 12, paddingTop: 10,
      borderTopWidth: 1, borderTopColor: C.border,
      backgroundColor: C.card,
    },
    attachBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
    input: {
      flex: 1, backgroundColor: C.background, borderWidth: 1, borderColor: C.border,
      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10,
      fontFamily: 'Inter_400Regular', fontSize: 14, color: C.foreground, maxHeight: 100,
    },
    sendBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    },
    sendDisabled: { opacity: 0.4 },
    // Attach menu
    modalOverlay: { flex: 1, backgroundColor: '#00000060', justifyContent: 'flex-end' },
    attachMenu: {
      backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
      padding: 20, gap: 4,
    },
    attachTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: C.foreground, marginBottom: 12 },
    attachOption: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderRadius: 14 },
    attachIconBox: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    attachOptionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: C.foreground },
    attachOptionSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: C.mutedForeground, marginTop: 2 },
    // URL modal
    urlModal: {
      backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
      padding: 20,
    },
    urlModalTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, color: C.foreground, marginBottom: 4 },
    urlModalSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: C.mutedForeground, marginBottom: 16 },
    urlInput: {
      backgroundColor: C.background, borderWidth: 1, borderColor: C.border,
      borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
      fontFamily: 'Inter_400Regular', fontSize: 14, color: C.foreground,
    },
    urlBtn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
    urlBtnCancel: { backgroundColor: C.background, borderWidth: 1, borderColor: C.border },
    urlBtnPrimary: { backgroundColor: C.primary },
    urlBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    // Quiz
    quizOverlay: { flex: 1, backgroundColor: '#00000070', justifyContent: 'flex-end' },
    quizContainer: {
      backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 20, maxHeight: '90%',
    },
    quizTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: C.foreground, textAlign: 'center', marginBottom: 8 },
    quizScore: { fontFamily: 'Inter_700Bold', fontSize: 40, color: C.primary, textAlign: 'center' },
    quizScoreLabel: { fontFamily: 'Inter_400Regular', fontSize: 15, color: C.mutedForeground, textAlign: 'center', marginTop: 8 },
    quizProgress: { fontFamily: 'Inter_500Medium', fontSize: 13, color: C.mutedForeground },
    quizQuestion: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: C.foreground, lineHeight: 24 },
    quizOption: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      borderWidth: 1.5, borderRadius: 14, padding: 14,
    },
    quizOptionText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: C.foreground, flex: 1, lineHeight: 20 },
    explanationBox: {
      backgroundColor: C.background, borderRadius: 14, padding: 14, marginTop: 16,
      borderWidth: 1, borderColor: C.border,
    },
    explanationText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: C.mutedForeground, lineHeight: 20 },
  });
}
