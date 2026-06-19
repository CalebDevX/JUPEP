import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import { API_BASE_URL } from '@/src/utils/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'Explain photosynthesis for JUPEB',
  'Quiz me on Government Paper 001',
  'What are essay writing tips?',
  'Explain the Nigerian Constitution',
];

export default function ChatTab() {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hi! I\'m LexBot, your JUPEB AI tutor. Ask me anything about your subjects, exam tips, or any topic you\'re studying. 📚',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const s = makeStyles(C);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const phone = await AsyncStorage.getItem('jupeb_phone');
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, phone, history, stream: false }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply ?? data.content ?? data.message ?? 'Sorry, I couldn\'t get a response.';
        setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', content: reply }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Please try again.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', content: 'Network error. Please check your connection.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerIcon}>
          <Ionicons name="chatbubble-ellipses" size={18} color={C.primary} />
        </View>
        <View>
          <Text style={s.headerTitle}>LexBot</Text>
          <Text style={s.headerSub}>AI Tutor · JUPEB Expert</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.messages}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(m => (
          <View
            key={m.id}
            style={[
              s.bubble,
              m.role === 'user' ? s.userBubble : s.botBubble,
            ]}
          >
            {m.role === 'assistant' && (
              <View style={s.botAvatar}>
                <Ionicons name="school" size={12} color={C.primary} />
              </View>
            )}
            <View style={[s.bubbleInner, m.role === 'user' ? s.userInner : s.botInner]}>
              <Text style={[s.bubbleText, m.role === 'user' ? s.userText : s.botText]}>
                {m.content}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={[s.bubble, s.botBubble]}>
            <View style={s.botAvatar}>
              <Ionicons name="school" size={12} color={C.primary} />
            </View>
            <View style={[s.bubbleInner, s.botInner, s.typingInner]}>
              <ActivityIndicator size="small" color={C.mutedForeground} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.prompts}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {QUICK_PROMPTS.map(p => (
            <TouchableOpacity key={p} style={s.promptChip} onPress={() => send(p)}>
              <Text style={s.promptText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input bar */}
      <View style={[s.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask LexBot anything…"
          placeholderTextColor={C.mutedForeground}
          multiline
          maxLength={1000}
          onSubmitEditing={() => send()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || loading) && s.sendDisabled]}
          onPress={() => send()}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
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
    messages: { flex: 1 },
    bubble: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
    userBubble: { justifyContent: 'flex-end' },
    botBubble: { justifyContent: 'flex-start' },
    botAvatar: {
      width: 28, height: 28, borderRadius: 10,
      backgroundColor: C.primary + '22',
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    bubbleInner: { maxWidth: '78%', borderRadius: 18, padding: 12 },
    userInner: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
    botInner: { backgroundColor: C.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: C.border },
    typingInner: { padding: 10 },
    bubbleText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
    userText: { color: '#fff' },
    botText: { color: C.foreground },
    prompts: { maxHeight: 44, marginBottom: 8 },
    promptChip: {
      backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
      borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
    },
    promptText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: C.mutedForeground },
    inputBar: {
      flexDirection: 'row', alignItems: 'flex-end', gap: 10,
      paddingHorizontal: 16, paddingTop: 10,
      borderTopWidth: 1, borderTopColor: C.border,
      backgroundColor: C.card,
    },
    input: {
      flex: 1, backgroundColor: C.background, borderWidth: 1, borderColor: C.border,
      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10,
      fontFamily: 'Inter_400Regular', fontSize: 14, color: C.foreground,
      maxHeight: 100,
    },
    sendBtn: {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: C.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    sendDisabled: { opacity: 0.4 },
  });
}
