import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useState } from 'react';

export default function InputBar({ messages, setMessages, mode }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (text.trim()) {
      const question = text;
      // Show user question
      setText(''); // Clear input after sending
      setMessages(prev => [...prev, { text: question, type: 'question' }]);
      setLoading(true);
      try {
        const name = 'pramod';
        const grade = '8';
        const url = `http://192.168.0.147:8000/ask?question=${encodeURIComponent(
          text,
        )}&mode=${encodeURIComponent(mode)}&name=${encodeURIComponent(
          name,
        )}&grade=${grade}`;
        const response = await fetch(url);
        const data = await response.json();
        // Add AI answer to chat
        setMessages(prev => [
          ...prev,
          { text: data.answer, type: 'answer', youtube: data.youtube },
        ]);
      } catch (error) {
        Alert.alert(error.message);
        setMessages(prev => [
          ...prev,
          {
            text: 'Error fetching response from AI Error fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AI.',
            type: 'answer',
          },
        ]);
        console.error(error);
      }
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        padding: 8,
        borderRadius: 20,
        margin: 10,
        borderColor: '#6c757d',
        elevation: 3,
        shadowColor: '#caf0f8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        backgroundColor: '#ffffffff',
      }}
    >
      <TextInput
        style={{ flex: 1, borderRadius: 20, padding: 16 }}
        value={text}
        color="#333"
        onChangeText={setText}
        placeholder="Type your question..."
        placeholderTextColor="#cccccc"
        onSubmitEditing={handleSend}
        editable={!loading}
      />
      <TouchableOpacity
        onPress={handleSend}
        style={{
          backgroundColor: '#ffffffff',
          borderRadius: 24,
          width: 48,
          height: 48,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#333" size={28} />
        ) : (
          <Icon name="arrow-forward" size={28} color="#333" />
        )}
      </TouchableOpacity>
    </View>
  );
}
