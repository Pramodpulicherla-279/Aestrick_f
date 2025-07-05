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
    { label: '🌐 General', value: 'general' },
    { label: '📖 Textbook', value: 'textbook' },
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
    Alert.alert('Alert', 'Menu button pressed');
  };

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
        { backgroundColor: mode === 'general' ? '#343a40' : '#1a1f2e' },
      ]}
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
        <InputBar messages={messages} setMessages={setMessages} mode={mode} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    color: '#fff',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#caf0f8',
    textAlign: 'center',
  },
  msgcontainer: {
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
  headerPickerContainer: {
    zIndex: 1, // Ensure dropdown appears above other elements
  },
});
