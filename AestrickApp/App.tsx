/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import ChatScreen from './screens/ChatScreen.js';
import Login from './screens/LoginScreen.js';
import { StateProvider } from './GlobalStateContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <StateProvider>
      <NavigationContainer>
        {/* <View style={styles.container}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <ChatScreen />;
        </View> */}
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Stack.Navigator 
          initialRouteName="ChatScreen"
          screenOptions={{
            headerShown: false, // Hide default header since your components have custom headers
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={Login} 
          />
          <Stack.Screen 
            name="ChatScreen" 
            component={ChatScreen} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </StateProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
