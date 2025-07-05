import { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function VideoSection({ video }) {
  const { width } = useWindowDimensions();
  const webViewRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  if (!video) return null;

  const getCurrentTime = () => {
    webViewRef.current?.injectJavaScript(`
      window.ReactNativeWebView.postMessage(JSON.stringify({type: "getCurrentTime"}));
      true;
    `);
  };

  const seekTo = (time) => {
    webViewRef.current?.injectJavaScript(`
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: "seekTo",
        time: ${time}
      }));
      true;
    `);
  };

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'currentTime') {
        setCurrentTime(data.time);
      } else if (data.type === 'enterFullscreen') {
        await toggleLandscape();
      } else if (data.type === 'exitFullscreen') {
        await togglePortrait();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLandscape = async () => {
    getCurrentTime();
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    setIsLandscape(true);
  };

  const togglePortrait = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    setIsLandscape(false);
    seekTo(currentTime);
  };

  return (
    <View style={{ margin: 10 }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#e0e0e0',
          borderRadius: 8,
          padding: 10,
        }}
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Hide Video" : "Show Video"}
      >
        <Icon name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} />
        <Text style={{ marginLeft: 8, fontWeight: 'bold' }}>
          {expanded ? 'Hide Video' : 'Show Video'}
        </Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={{ height: 220, marginTop: 10, borderRadius: 8, overflow: 'hidden' }}>
          <WebView 
            ref={webViewRef}
            source={{ html: video }} 
            style={{ flex: 1 }}
            allowsFullscreenVideo={true}
            onMessage={handleMessage}
            injectedJavaScript={`
              window.addEventListener('message', function(e) {
                if (e.data === 'getCurrentTime') {
                  if (player && player.getCurrentTime) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'currentTime',
                      time: player.getCurrentTime()
                    }));
                  }
                }
              });
              true;
            `}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 10,
              top: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 20,
              padding: 5,
            }}
            onPress={isLandscape ? togglePortrait : toggleLandscape}
          >
            <Icon 
              name={isLandscape ? 'fullscreen-exit' : 'fullscreen'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}