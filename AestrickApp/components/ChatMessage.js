import { useState, useRef } from 'react';
import {
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';
import Orientation from 'react-native-orientation-locker';
// import * as Clipboard from 'expo-clipboard';

export default function ChatMessage({ text, type, youtube }) {
  const isQuestion = type === 'question';
  const { width } = useWindowDimensions();
  const maxBubbleWidth = width * 0.8;
  const minBubbleWidth = 40;
  const webViewRef = useRef(null);
  const fullscreenWebViewRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCopyOption, setShowCopyOption] = useState(false);
  const [copyOptionPosition, setCopyOptionPosition] = useState({ x: 0, y: 0 });

  // Helper to extract YouTube video ID from iframe string
  const getYoutubeId = iframe => {
    if (typeof iframe !== 'string') return null;
    const match = iframe.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  // Generate HTML for YouTube player
  const getYoutubeHtml = (videoId, start = 0) => `
    <html>
    <body style="margin:0;padding:0;background:#000;">
      <div id="player"></div>
      <script>
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        var player;
        function onYouTubeIframeAPIReady() {
          player = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: '${videoId}',
            playerVars: { autoplay: 1, start: ${start} },
            events: {
              'onStateChange': onPlayerStateChange
            }
          });
        }

        function onPlayerStateChange(event) {
          if (window.ReactNativeWebView && player) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'state',
              state: event.data
            }));
          }
        }

        document.addEventListener("message", function(event) {
          var data = {};
          try { data = JSON.parse(event.data); } catch {}
          if (data.type === "getCurrentTime") {
            if (player && player.getCurrentTime) {
              var t = player.getCurrentTime();
              window.ReactNativeWebView.postMessage(JSON.stringify({type: "currentTime", time: t}));
            }
          }
          if (data.type === "seekTo") {
            if (player && player.seekTo) {
              player.seekTo(data.time, true);
            }
          }
        });

        window.addEventListener("message", function(event) {
          var data = {};
          try { data = JSON.parse(event.data); } catch {}
          if (data.type === "getCurrentTime") {
            if (player && player.getCurrentTime) {
              var t = player.getCurrentTime();
              window.ReactNativeWebView.postMessage(JSON.stringify({type: "currentTime", time: t}));
            }
          }
          if (data.type === "seekTo") {
            if (player && player.seekTo) {
              player.seekTo(data.time, true);
            }
          }
        });
      </script>
    </body>
    </html>
  `;

  const handleMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'currentTime') {
        setCurrentTime(data.time);
        if (!fullscreen) {
          setFullscreen(true);
          Orientation.lockToLandscape();
        } else {
          // When exiting fullscreen, seek the embedded player to the current time
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              if (player && player.seekTo) {
                player.seekTo(${data.time}, true);
              }
              true;
            `);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openFullscreen = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (player && player.getCurrentTime) {
          var currentTime = player.getCurrentTime();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'currentTime',
            time: currentTime
          }));
        }
        true;
      `);
    }
  };

  const exitFullscreen = () => {
    if (fullscreenWebViewRef.current) {
      fullscreenWebViewRef.current.injectJavaScript(`
        if (player && player.getCurrentTime) {
          var currentTime = player.getCurrentTime();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'currentTime',
            time: currentTime
          }));
        }
        true;
      `);
    }
    setFullscreen(false);
    Orientation.lockToPortrait();
  };

  // Handle long press to show copy option
  const handleLongPress = event => {
    const { pageX, pageY } = event.nativeEvent;
    setCopyOptionPosition({ x: pageX, y: pageY });
    setShowCopyOption(true);
  };

  // Copy text to clipboard
  const copyToClipboard = () => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Message copied to clipboard');
    setShowCopyOption(false);
  };

  const videoId = getYoutubeId(youtube);
  const estimatedWidth = Math.min(
    maxBubbleWidth,
    Math.max(minBubbleWidth, text.length * 8 + 40),
  );

  if (isQuestion) {
    return (
      <View>
        <Pressable
          onLongPress={handleLongPress}
          style={{
            alignSelf: 'flex-end',
            backgroundColor: '#434b52',
            borderRadius: 16,
            marginVertical: 5,
            padding: 14,
            maxWidth: maxBubbleWidth,
            width: estimatedWidth,
          }}
        >
          <Text style={{ color: '#fff' }}>{text}</Text>
        </Pressable>

        {/* Copy option modal */}
        {showCopyOption && (
          <Modal
            transparent={true}
            visible={showCopyOption}
            onRequestClose={() => setShowCopyOption(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowCopyOption(false)}
            >
              <View
                style={[
                  styles.copyOptionContainer,
                  {
                    top: copyOptionPosition.y - 50,
                    left: copyOptionPosition.x - 60,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.copyOptionButton}
                  onPress={copyToClipboard}
                >
                  <Icon name="content-copy" size={20} color="#fff" />
                  <Text style={styles.copyOptionText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    );
  }

  return (
    <View>
      <Pressable
        onLongPress={handleLongPress}
        style={{
          alignSelf: 'flex-start',
          backgroundColor: 'none',
          borderRadius: 16,
          marginVertical: 5,
          padding: 16,
          maxWidth: '100%',
          width: '100%',
          position: 'relative',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, lineHeight: 24 }}>
          {text}
        </Text>
        {videoId && type === 'answer' && (
          <View style={{ marginTop: 10, width: '100%' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: expanded ? 10 : 0,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#e0e0e0',
                  borderRadius: 8,
                  padding: 8,
                  flex: 1,
                }}
                onPress={() => setExpanded(!expanded)}
                accessibilityRole="button"
                accessibilityLabel={expanded ? 'Hide Video' : 'Show Video'}
              >
                <Icon
                  name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={22}
                />
                <Text style={{ marginLeft: 8, fontWeight: 'bold' }}>
                  {expanded ? 'Hide Video' : 'Show Video'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  marginLeft: 10,
                  backgroundColor: '#e0e0e0',
                  borderRadius: 8,
                  padding: 8,
                }}
                onPress={openFullscreen}
                accessibilityRole="button"
                accessibilityLabel="Open Video in Landscape"
              >
                <Icon name="fullscreen" size={22} />
              </TouchableOpacity>
            </View>
            {expanded && (
              <View
                style={{
                  height: 200,
                  borderRadius: 12,
                  overflow: 'hidden',
                  width: '100%',
                }}
              >
                <WebView
                  ref={webViewRef}
                  source={{ html: getYoutubeHtml(videoId, 0) }}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    overflow: 'hidden',
                    width: '100%',
                  }}
                  javaScriptEnabled
                  domStorageEnabled
                  scrollEnabled={false}
                  allowsFullscreenVideo={true}
                  onMessage={handleMessage}
                />
              </View>
            )}
            <Modal
              visible={fullscreen}
              animationType="slide"
              supportedOrientations={['landscape']}
              onRequestClose={exitFullscreen}
              transparent={false}
            >
              <View style={styles.fullscreenContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={exitFullscreen}
                  accessibilityRole="button"
                  accessibilityLabel="Close Fullscreen Video"
                >
                  <Icon name="close" size={32} color="#fff" />
                </TouchableOpacity>
                <WebView
                  ref={fullscreenWebViewRef}
                  source={{
                    html: getYoutubeHtml(videoId, Math.floor(currentTime)),
                  }}
                  style={styles.fullscreenWebview}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsFullscreenVideo={true}
                />
              </View>
            </Modal>
          </View>
        )}
      </Pressable>

      {/* Copy option modal */}
      {showCopyOption && (
        <Modal
          transparent={true}
          visible={showCopyOption}
          onRequestClose={() => setShowCopyOption(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCopyOption(false)}
          >
            <View
              style={[
                styles.copyOptionContainer,
                {
                  top: copyOptionPosition.y - 50,
                  left: copyOptionPosition.x - 60,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.copyOptionButton}
                onPress={copyToClipboard}
              >
                <Icon name="content-copy" size={20} color="#fff" />
                <Text style={styles.copyOptionText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  fullscreenWebview: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 30,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  copyOptionContainer: {
    position: 'absolute',
    backgroundColor: '#434b52',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  copyOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  copyOptionText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
});
