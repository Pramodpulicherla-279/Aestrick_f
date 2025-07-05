import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useState } from "react";


export default function InputBar({ messages, setMessages }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (text.trim()) {
      const question = text;
      // Show user question
      setText(""); // Clear input after sending
      setMessages((prev) => [...prev, { text: question, type: "question" }]);
      setLoading(true);
      try {
        const response = await fetch(
        //   "https://aestrick-b.onrender.com/ask?question=" + encodeURIComponent(text)
          "http://192.168.0.147:8000/ask?question=" + encodeURIComponent(text)

        );
        const data = await response.json();
        // Add AI answer to chat
        setMessages((prev) => [...prev, { text: data.answer, type: "answer", youtube: data.youtube }]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { text: "Error fetching response from AI Error fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AIError fetching response from AI.", type: "answer" },
        ]);
        console.error(error);
      }
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        padding: 8,
        borderRadius: 20,
        margin: 10,
        borderColor: "#6c757d",
        elevation: 3,
        shadowColor: "#caf0f8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        backgroundColor: "#343a40",
      }}
    >
      <TextInput
        style={{ flex: 1, borderRadius: 20, padding: 16 }}
        value={text}
        color="#fff"
        onChangeText={setText}
        placeholder="Type your question..."
        placeholderTextColor="#cccccc"
        onSubmitEditing={handleSend}
        editable={!loading}
      />
      <TouchableOpacity
        onPress={handleSend}
        style={{
          backgroundColor: "#6c757d",
          borderRadius: 24,
          width: 48,
          height: 48,
          justifyContent: "center",
          alignItems: "center",
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size={28} />
        ) : (
          <Icon name="arrow-forward" size={28} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}