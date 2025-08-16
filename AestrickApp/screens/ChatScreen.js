import { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,              // <-- add
  Pressable, 
} from 'react-native';
import { Animated } from 'react-native'; 
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatMessage from '../components/ChatMessage';
import InputBar from '../components/InputBar';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function ChatScreen() {
  const [sessions, setSessions] = useState([]); 
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showSessions, setShowSessions] = useState(false);
  const SIDEBAR_WIDTH = 280;
  const [drawerAnim] = useState(new Animated.Value(-SIDEBAR_WIDTH));
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('general');
  const [open, setOpen] = useState(false);
  const flatListRef = useRef(null);
  const [items, setItems] = useState([
    { label: '🌐 General', value: 'general' },
    { label: '📖 Textbook', value: 'textbook' },
  ]);
  const getMessagesKey = (sessionId, mode) => `session:${sessionId}:mode:${mode}:messages`;

    const openSessions = () => {
    setShowSessions(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

    const closeSessions = () => {
    Animated.timing(drawerAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => finished && setShowSessions(false));
  };

  const handleMenuPress = () => openSessions();

  // const handleSend = text => {
  //   if (text.trim()) {
  //     // Add user question
  //     setMessages(prev => [...prev, { text, type: 'question' }]);

  //     // Here you would typically add logic to get a response
  //     // For now, we'll just add a dummy response
  //     setTimeout(() => {
  //       setMessages(prev => [
  //         ...prev,
  //         { text: 'This is a sample response', type: 'answer' },
  //       ]);
  //     }, 500);
  //   }
  // };

useEffect(() => {
  (async () => {
    const stored = await AsyncStorage.getItem('sessions');
    let parsed = stored ? JSON.parse(stored) : [];
    if (parsed.length === 0) {
      const first = createSessionObject();
      parsed = [first];
      await AsyncStorage.setItem('sessions', JSON.stringify(parsed));
      await AsyncStorage.setItem(getMessagesKey(first.id, mode), JSON.stringify([]));
    }
    setSessions(parsed);
    setCurrentSessionId(parsed[0].id);
    const msgs = await AsyncStorage.getItem(getMessagesKey(parsed[0].id, mode));
    setMessages(msgs ? JSON.parse(msgs) : []);
  })();
}, []);

  //  useEffect(() => {
  //   if (currentSessionId) {
  //     AsyncStorage.setItem(
  //       `session:${currentSessionId}:messages`,
  //       JSON.stringify(messages),
  //     );
  //   }
  // }, [messages, currentSessionId]);
  // When mode or session changes, load correct messages
useEffect(() => {
  if (currentSessionId && mode) {
    (async () => {
      const msgs = await AsyncStorage.getItem(getMessagesKey(currentSessionId, mode));
      setMessages(msgs ? JSON.parse(msgs) : []);
    })();
  }
}, [currentSessionId, mode]);

  
  const createSessionObject = () => ({
    id: Date.now().toString(),
    title: `Session ${new Date().toLocaleTimeString().replace(/:\d+ /,' ')}`,
    createdAt: Date.now(),
  });

  // Save messages when they change
useEffect(() => {
  if (currentSessionId && mode) {
    AsyncStorage.setItem(getMessagesKey(currentSessionId, mode), JSON.stringify(messages));
  }
}, [messages, currentSessionId, mode]);

const createNewSession = async () => {
  const newS = createSessionObject();
  const updated = [newS, ...sessions];
  setSessions(updated);
  setCurrentSessionId(newS.id);
  setMessages([]);
  await AsyncStorage.setItem('sessions', JSON.stringify(updated));
  await AsyncStorage.setItem(getMessagesKey(newS.id, mode), JSON.stringify([]));
  setShowSessions(false);
};

const switchSession = async (id) => {
  setCurrentSessionId(id);
  const msgs = await AsyncStorage.getItem(getMessagesKey(id, mode));
  setMessages(msgs ? JSON.parse(msgs) : []);
  setShowSessions(false);
};

  const renameSession = async (id) => {
    const s = sessions.find(x => x.id === id);
    if (!s) return;
    // Simple prompt substitute:
    Alert.prompt?.(
      'Rename Session',
      'Enter new name',
      async (val) => {
        if (!val) return;
        const updated = sessions.map(x => x.id === id ? {...x, title: val} : x);
        setSessions(updated);
        await AsyncStorage.setItem('sessions', JSON.stringify(updated));
      },
      'plain-text',
      s.title
    ) || Alert.alert('Rename not supported on this platform');
  };

  const deleteSession = async (id) => {
    if (sessions.length === 1) {
      Alert.alert('Cannot delete the only session');
      return;
    }
    const updated = sessions.filter(x => x.id !== id);
    setSessions(updated);
    await AsyncStorage.setItem('sessions', JSON.stringify(updated));
    await AsyncStorage.removeItem(`session:${id}:messages`);
    if (currentSessionId === id) {
      const fallback = updated[0];
      setCurrentSessionId(fallback.id);
      const msgs = await AsyncStorage.getItem(`session:${fallback.id}:messages`);
      setMessages(msgs ? JSON.parse(msgs) : []);
    }
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // const handleMenuPress = () => {
  //   setShowSessions(true);
  // }

  const handleAddPress = () => {
    Alert.alert('Alert', 'Add button pressed');
  };

  const getIntroSubtitle = () => {
    if (mode === 'general') {
      return 'Ask anything to get started 🌐';
    } else if (mode === 'textbook') {
      return 'Ask questions related to your textbooks 📖 ';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        { backgroundColor: mode === 'general' ? '#ffffff' : '#fefff3ff' },
      ]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleMenuPress}>
          <Icon name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerPickerContainer}>
          <DropDownPicker
            open={open}
            value={mode}
            items={items}
            setOpen={setOpen}
            setValue={setMode}
            setItems={setItems}
            style={{
              backgroundColor: mode == 'general' ? '#caf0f8' : '#f0f8ff',
              borderColor: 'transparent',
              borderWidth: 0,
              borderRadius: 20, // Border radius for main button
            }}
            textStyle={{
              color: '#343a40',
              fontWeight: 'bold',
              fontSize: 14,
            }}
            dropDownContainerStyle={{
              backgroundColor: mode == 'general' ? '#caf0f8' : '#f0f8ff',
              borderColor: 'transparent',
              borderRadius: 20, // Border radius for dropdown container
              marginTop: 5,
            }}
            itemSeparatorStyle={{
              backgroundColor: '#adb5bd',
              height: 1,
              marginHorizontal: 5,
            }}
            itemStyle={{
              justifyContent: 'flex-start',
              borderRadius: 20, // Border radius for individual items
              marginHorizontal: 5,
              marginVertical: 2,
            }}
            selectedItemContainerStyle={{
              backgroundColor: mode == 'general' ? '#b8e0f7' : '#e0f0ff',
              borderRadius: 5, // Border radius for selected item
            }}
            selectedItemLabelStyle={{
              fontWeight: 'bold',
            }}
            containerStyle={{
              width: 140,
              height: 40,
            }}
            listItemContainerStyle={{
              height: 50,
            }}
            listItemLabelStyle={{
              color: '#343a40',
            }}
          />
        </View>
        {/* <TouchableOpacity style={styles.headerButton} onPress={handleAddPress}>
          <Icon name="add" size={24} color="#333" />
        </TouchableOpacity> */}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.messagesContainer}>
          {messages.length === 0 && (
            <View style={styles.introContainer}>
              <Text style={styles.introTitle}>Welcome to Aestrick!</Text>
              <Text style={styles.introSubtitle}>{getIntroSubtitle()}</Text>
            </View>
          )}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => (
              <ChatMessage
                text={item.text}
                type={item.type}
                youtube={item.youtube}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.messagesContent}
            inverted={false}
          />
        </View>
        <InputBar messages={messages} setMessages={setMessages} mode={mode} />
      </View>
      {showSessions && (
        <View style={styles.sidebarOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSessions} />
          <Animated.View
            style={[
              styles.sidebarPanel,
              { transform: [{ translateX: drawerAnim }] },
            ]}
          >
            <View style={styles.sessionHeaderRow}>
              <Text style={styles.sessionTitle}>Sessions</Text>
              <TouchableOpacity onPress={closeSessions}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.newSessionBtn}
              onPress={createNewSession}
            >
              <Icon name="add-circle-outline" size={20} color="#0d6efd" />
              <Text style={styles.newSessionBtnText}>New Session</Text>
            </TouchableOpacity>

            <FlatList
              data={sessions}
              keyExtractor={i => i.id}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => {
                const active = item.id === currentSessionId;
                return (
                  <Pressable
                    onPress={() => switchSession(item.id)}
                    style={[
                      styles.sessionItem,
                      active && styles.sessionItemActive,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.sessionItemText,
                          active && { fontWeight: '700' },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.sessionItemSub}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => renameSession(item.id)}
                      style={{ padding: 4 }}
                    >
                      <Icon name="edit" size={18} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteSession(item.id)}
                      style={{ padding: 4, marginLeft: 4 }}
                    >
                      <Icon name="delete" size={18} color="#c00" />
                    </TouchableOpacity>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#555' }}>
                  No sessions
                </Text>
              }
              contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
            />
          </Animated.View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  sidebarOverlay: {
    position: 'absolute',
    top: -30,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 50,
    flexDirection: 'row',
  },
  sidebarPanel: {
    width: 280,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 56,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  sessionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  sessionPanel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  newSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e7f3ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    marginBottom: 12,
  },
  newSessionBtnText: {
    marginLeft: 6,
    color: '#0d6efd',
    fontWeight: '600',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 12,
  },
  sessionItemActive: {
    backgroundColor: '#d8ecff',
  },
  sessionItemText: {
    color: '#222',
    fontSize: 14,
  },
  sessionItemSub: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  introContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    width: '100%',
    height: '80%',
    borderRadius: 10,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#1f8eb6ff',
    textAlign: 'center',
  },
  msgcontainer: {
    backgroundColor: '#ffffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    backgroundColor: '#caf0f8',
    padding: 12,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 10,
    paddingBottom: 20,
  },
  chatContainer: {
    flex: 1,
  },
  headerPickerContainer: {
    zIndex: 1, // Ensure dropdown appears above other elements
  },
});
