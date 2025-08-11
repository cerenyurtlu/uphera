// expo-document-picker ve @react-native-async-storage/async-storage paketlerinin
// projenize yüklü olduğundan emin olun. Eğer yüklü değilse, aşağıdaki komutları kullanabilirsiniz:
// expo install expo-document-picker @react-native-async-storage/async-storage
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Appearance,
  ColorSchemeName,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mesaj tipi
export type Message = {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  color?: string; // system mesajı için renk
};

// Props tipi
interface ADAChatWidgetProps {
  userId: string;
  baseUrl: string;
  baseWs: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.88;
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.8;
const ICON_SIZE = 56;
const HEADER_HEIGHT = 56;
const INPUT_MAX_HEIGHT = 96;
const STORAGE_KEY = 'adaChatHistory';

const getColors = (scheme: ColorSchemeName) => ({
  primary: '#0057FF',
  background: scheme === 'dark' ? '#121212' : '#FFFFFF',
  userBubble: '#0057FF',
  aiBubble: '#E0E0E0',
  aiText: '#222',
  system: '#888',
  systemError: '#D32F2F',
});

const ADAChatWidget: React.FC<ADAChatWidgetProps> = ({ userId, baseUrl, baseWs }) => {
  const colorScheme = Appearance.getColorScheme();
  const colors = getColors(colorScheme);

  // Panel animasyonu
  const anim = useRef(new Animated.Value(0)).current; // 0: kapalı, 1: açık
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Panel aç/kapa animasyonu
  useEffect(() => {
    Animated.spring(anim, {
      toValue: open ? 1 : 0,
      useNativeDriver: false,
      speed: 16,
      bounciness: 6,
      // duration: 300, // duration parametresi spring animasyonunda kullanılmaz
    }).start();
  }, [open]);

  // AsyncStorage'dan mesajları yükle
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setMessages(JSON.parse(stored));
      } catch {}
    })();
  }, []);

  // Mesajları kaydet
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // WebSocket bağlantısı
  const connectWs = useCallback(() => {
    setConnecting(true);
    const wsUrl = `wss://${baseWs}/ws/coach?user_id=${userId}`;
    const socket = new WebSocket(wsUrl);
    setWs(socket);

    socket.onopen = () => {
      setConnecting(false);
      socket.send('Merhaba ADA!');
    };
    socket.onmessage = (e) => {
      // Parça parça gelirse birleştir
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + Math.random() + '', sender: 'ai', text: e.data },
      ]);
    };
    socket.onerror = () => {
      socket.close();
    };
    socket.onclose = () => {
      setConnecting(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random() + '',
          sender: 'system',
          text: 'Bağlantı kesildi',
          color: colors.systemError,
        },
      ]);
      // 5 sn sonra tekrar bağlan
      reconnectTimeout.current = setTimeout(connectWs, 5000);
    };
  }, [baseWs, userId, colors.systemError]);

  useEffect(() => {
    connectWs();
    return () => {
      if (ws) ws.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Yeni mesajda otomatik scroll
  useEffect(() => {
    if (open && flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, open]);

  // Mesaj gönder
  const sendMessage = () => {
    if (!input.trim() || !ws || ws.readyState !== 1) return;
    const msg: Message = {
      id: Date.now() + Math.random() + '',
      sender: 'user',
      text: input.trim(),
    };
    ws.send(input.trim());
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  // CV yükle
  const pickAndUploadCV = async () => {
    try {
      setCvUploading(true);
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (res.type === 'success' && res.uri) {
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
          uri: res.uri,
          name: res.name || 'cv.pdf',
          type: 'application/pdf',
        });
        const uploadUrl = `${baseUrl}/upload/cv?user_id=${userId}`;
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.ok) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random() + '',
              sender: 'system',
              text: 'CV’nizi aldım!',
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random() + '',
              sender: 'system',
              text: 'CV yüklenemedi.',
              color: colors.systemError,
            },
          ]);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random() + '',
          sender: 'system',
          text: 'CV yüklenemedi.',
          color: colors.systemError,
        },
      ]);
    } finally {
      setCvUploading(false);
    }
  };

  // Panel boyutları animasyonu
  const panelWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [ICON_SIZE, PANEL_WIDTH],
  });
  const panelHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [ICON_SIZE, PANEL_HEIGHT],
  });
  const panelRadius = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [ICON_SIZE / 2, 12],
  });

  // Render edilen mesaj balonu
  const renderItem = ({ item }: { item: Message }) => {
    if (item.sender === 'system') {
      return (
        <View style={styles.systemMsgWrap}>
          <Text
            style={[
              styles.systemMsg,
              { color: item.color || colors.system, fontStyle: 'italic' },
            ]}
          >
            {item.text}
          </Text>
        </View>
      );
    }
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.bubbleWrap,
          { alignSelf: isUser ? 'flex-end' : 'flex-start' },
        ]}
      >
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser ? colors.userBubble : colors.aiBubble,
              borderTopRightRadius: isUser ? 0 : 16,
              borderTopLeftRadius: isUser ? 16 : 0,
            },
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              {
                color: isUser ? '#fff' : colors.aiText,
              },
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  // Panel açıkken dışarı tıklama ile kapama
  const handleBackdrop = () => {
    if (open) setOpen(false);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Panelin arka planı (panel açıkken tıklayınca kapansın) */}
      {open && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdrop}
        />
      )}
      {/* Panel veya ikon */}
      <Animated.View
        style={[
          styles.panel,
          {
            width: panelWidth,
            height: panelHeight,
            borderRadius: panelRadius,
            backgroundColor: colors.background,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            elevation: 8,
            left: 24,
            bottom: 24,
          },
        ]}
      >
        {/* Panel kapalıysa sadece ikon */}
        {!open ? (
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => setOpen(true)}
          >
            <Text style={styles.iconText}>💬</Text>
          </TouchableOpacity>
        ) : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
          >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
              <Text style={styles.headerTitle}>ADA AI Koçu</Text>
              <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* Mesaj listesi */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              style={{ flex: 1 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              keyboardShouldPersistTaps="handled"
            />
            {/* Input alanı */}
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.cvBtn}
                onPress={pickAndUploadCV}
                disabled={cvUploading}
              >
                {cvUploading ? (
                  <ActivityIndicator size={20} color={colors.primary} />
                ) : (
                  <Text style={styles.cvIcon}>📄</Text>
                )}
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.input,
                  {
                    maxHeight: INPUT_MAX_HEIGHT,
                    height: Math.max(40, inputHeight),
                  },
                ]}
                value={input}
                onChangeText={setInput}
                onContentSizeChange={(e) =>
                  setInputHeight(Math.min(INPUT_MAX_HEIGHT, e.nativeEvent.contentSize.height))
                }
                placeholder="Mesajınızı yazın..."
                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
                multiline
                returnKeyType="send"
                onSubmitEditing={sendMessage}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={sendMessage}
                disabled={!input.trim() || !ws || ws.readyState !== 1}
              >
                <Text style={styles.sendIcon}>▲</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    zIndex: 100,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  iconBtn: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 8,
  },
  iconText: {
    fontSize: 28,
    color: '#fff',
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
  },
  bubbleWrap: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  bubble: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  systemMsgWrap: {
    alignItems: 'center',
    marginVertical: 2,
  },
  systemMsg: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    color: '#222',
    marginHorizontal: 6,
  },
  sendBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 20,
    color: '#0057FF',
    fontWeight: 'bold',
  },
  cvBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cvIcon: {
    fontSize: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
    zIndex: 99,
  },
});

export default ADAChatWidget; 