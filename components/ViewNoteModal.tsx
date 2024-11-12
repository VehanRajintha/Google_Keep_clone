import React, { useRef, useEffect, useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Animated,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface ViewNoteModalProps {
  visible: boolean;
  onClose: () => void;
  note: {
    title: string;
    description: string;
    image: string;
    audioUrl?: string | null;
    createdAt: string | Date;
  } | null;
}

export function ViewNoteModal({ visible, onClose, note }: ViewNoteModalProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      stopSound();
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const formatDate = (date: string | Date) => {
    const actualDate = typeof date === 'string' ? new Date(date) : date;
    return actualDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const playSound = async () => {
    if (!note?.audioUrl) return;

    try {
      setIsLoading(true);
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: note.audioUrl },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const playAudio = async (audioData: string) => {
    try {
      const base64Audio = `data:audio/m4a;base64,${audioData}`;
      const { sound } = await Audio.Sound.createAsync(
        { uri: base64Audio },
        { shouldPlay: true }
      );
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Failed to play audio');
    }
  };

  if (!note) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [800, 0],
                }),
              }],
            },
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          <Image 
            source={{ uri: note.image }} 
            style={styles.noteImage}
            resizeMode="cover"
          />
          
          <View style={styles.content}>
            <Text style={styles.title}>{note.title}</Text>
            <Text style={styles.description}>{note.description}</Text>
            
            {note.audioUrl && (
              <View style={styles.audioPlayer}>
                <TouchableOpacity 
                  style={styles.playButton} 
                  onPress={playSound}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#666" />
                  ) : (
                    <Ionicons 
                      name={isPlaying ? "pause" : "play"} 
                      size={24} 
                      color="#666" 
                    />
                  )}
                </TouchableOpacity>
                <Text style={styles.audioText}>Voice Note</Text>
              </View>
            )}

            <Text style={styles.timestamp}>
              Created on {formatDate(note.createdAt)}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  noteImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  audioText: {
    fontSize: 16,
    color: '#666',
  }
}); 