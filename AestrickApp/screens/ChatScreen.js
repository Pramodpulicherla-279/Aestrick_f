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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatMessage from '../components/ChatMessage';
import InputBar from '../components/InputBar';
import DropDownPicker from 'react-native-dropdown-picker';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('general');
  const [open, setOpen] = useState(false);
  const flatListRef = useRef(null);
  const [items, setItems] = useState([
    { label: 'General', value: 'general' },
    { label: 'Textbook', value: 'textbook' },
  ]);
  const handleSend = text => {
    if (text.trim()) {
      // Add user question
      setMessages(prev => [...prev, { text, type: 'question' }]);

      // Here you would typically add logic to get a response
      // For now, we'll just add a dummy response
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { text: 'This is a sample response', type: 'answer' },
        ]);
      }, 500);
    }
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleMenuPress = () => {
    console.log('Menu pressed');
    // Add your navigation drawer toggle here
  };

  const handleAddPress = () => {
    console.log('Add pressed');
    // Add your action here
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
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleMenuPress}>
          <Icon name="menu" size={24} color="#fff" />
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
              backgroundColor: '#caf0f8',
              borderColor: '#caf0f8',
              borderRadius: 14,
            }}
            textStyle={{ color: '#343a40', fontWeight: 'bold' }}
            dropDownContainerStyle={{ backgroundColor: '#caf0f8' }}
            containerStyle={{ width: 140, height: 40 }}
          />
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={handleAddPress}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
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
        <InputBar messages={messages} setMessages={setMessages} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  introContainer: {
    alignItems: 'center',
    justifyContent: 'center', // (optional, for vertical centering if needed)
    marginTop: 40,
    marginBottom: 20,
    width: '100%',
    height: '80%',
    borderRadius: 10,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#caf0f8',
    textAlign: 'center',
  },
  msgcontainer: {
    // flex: 1,
    backgroundColor: '#343a40',
  },
  container: {
    flex: 1,
    backgroundColor: '#343a40',
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
});

