import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GlobalStateContext = createContext();

export const StateProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Check for existing session on initial load
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsUserAuthenticated(true);
        }
      } catch (e) {
        // handle error if needed
      }
    };
    loadSession();
  }, []);


  // User login/logout
  const loginUser = async (userData) => {
    setUser(userData);
    setIsUserAuthenticated(true);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logoutUser = async () => {
    setUser(null);
    setIsUserAuthenticated(false);
    await AsyncStorage.removeItem('user');
  };

  return (
    <GlobalStateContext.Provider
      value={{
        user,
        isUserAuthenticated,
        loginUser,
        logoutUser,
        setUser
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};