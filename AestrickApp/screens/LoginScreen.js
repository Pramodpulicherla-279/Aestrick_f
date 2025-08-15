import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { GlobalStateContext } from '../GlobalStateContext';

// You'll need to update this import path based on your config location
// import BaseUrl from '../../../../config';
const BaseUrl = 'http://192.168.0.147:8000'; // Replace with your actual base URL

const Login = ({ onLogin, onRegister }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const { loginUser } = useContext(GlobalStateContext);

  const handleSubmit = async () => {
    setError('');

    // Example validation
    if (!mobile.match(/^[6-9]\d{9}$/)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    try {
      const response = await axios.post(`${BaseUrl}/login`, {
        mobile_number: mobile,
        password: password,
      });

      const data = response.data;
      // Save token and user data to AsyncStorage (React Native equivalent of localStorage)
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

      await loginUser(data.user);
      navigation.navigate('UserDashboard'); // Make sure this screen exists in your navigation
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleRegisterClick = () => {
    if (onRegister) {
      onRegister();
    } else {
      navigation.navigate('AgentRegistration'); // Make sure this screen exists in your navigation
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={mobile}
                  onChangeText={setMobile}
                  placeholder="Enter mobile number"
                  maxLength={10}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            
            <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegisterClick}
              >
                <Text style={styles.registerButtonText}>Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Dark background similar to your CSS
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#333',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    borderBottomWidth: 2,
    borderBottomColor: '#444',
  },
  input: {
    color: '#333',
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  loginButton: {
    backgroundColor: '#007bff',
    borderRadius: 25,
    paddingVertical: 15,
    marginTop: 20,
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  registerText: {
    color: '#333',
    fontSize: 14,
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  registerButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Login;