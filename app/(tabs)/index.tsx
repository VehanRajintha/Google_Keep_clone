import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Animated, Easing, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/utils/api';
import { AddNoteModal } from '@/components/AddNoteModal';
import { ViewNoteModal } from '@/components/ViewNoteModal';
import { audioToBase64 } from '@/utils/audioUtils';
import { useRouter } from 'expo-router';
import { TabTransition } from '../components/TabTransition';
import { auth } from '@/config/firebase';

interface Note {
  id: string;
  title: string;
  description: string;
  image: string;
  userId: string;
  audioData?: string | null;
  createdAt: string | Date;
}

export default function NotesApp() {
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const router = useRouter();
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const userPhotoURL = auth.currentUser?.photoURL;
  const scrollY = useRef(new Animated.Value(0)).current;
  const ITEM_SIZE = Dimensions.get('window').width * 0.48; // 48% of screen width

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchNotes = async () => {
      try {
        const notesList = await api.getNotes();
        setNotes(notesList);
      } catch (error) {
        console.error("Error fetching notes:", error);
        alert('Error loading notes. Please try again.');
      }
    };

    fetchNotes();
  }, [modalVisible]);

  const handleAddNote = async (
    title: string, 
    description: string, 
    imageUri: string | null, 
    audioUri: string | null
  ) => {
    try {
      if (!auth.currentUser) return;

      let audioBase64 = null;
      if (audioUri) {
        try {
          audioBase64 = await audioToBase64(audioUri);
        } catch (error) {
          console.error('Audio conversion failed:', error);
          alert('Failed to process audio. Please try again.');
          return;
        }
      }

      const noteData = {
        title,
        description,
        image: imageUri || `https://picsum.photos/200/${Math.floor(Math.random() * 1000)}`,
        audioData: audioBase64,
        userId: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
        timestamp: new Date().getTime()
      };

      await api.createNote(noteData);
      setModalVisible(false);
      
      // Refresh notes list
      const updatedNotes = await api.getNotes();
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const filteredNotes = notes.filter(
    note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: string | Date) => {
    const actualDate = typeof date === 'string' ? new Date(date) : date;
    return actualDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderNotes = () => {
    const notesToRender = searchQuery 
      ? notes.filter(note => 
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : notes;

    return notesToRender.map((item, index) => {
      const inputRange = [
        -1,
        0,
        ITEM_SIZE * index * 0.5,
        ITEM_SIZE * (index + 2) * 0.5
      ];

      const scale = scrollY.interpolate({
        inputRange,
        outputRange: [1, 1, 1, 0.85],
        extrapolate: 'clamp'
      });

      const opacity = scrollY.interpolate({
        inputRange,
        outputRange: [1, 1, 1, 0.6],
        extrapolate: 'clamp'
      });

      const translateY = scrollY.interpolate({
        inputRange,
        outputRange: [0, 0, 0, 30],
        extrapolate: 'clamp'
      });

      const rotate = scrollY.interpolate({
        inputRange,
        outputRange: ['0deg', '0deg', '0deg', '-5deg'],
        extrapolate: 'clamp'
      });

      return (
        <Animated.View
          key={item.id}
          style={[
            styles.noteCard,
            {
              transform: [
                { scale },
                { translateY },
                { rotate }
              ],
              opacity,
            }
          ]}
        >
          <TouchableOpacity 
            onPress={() => setSelectedNote(item)}
            style={styles.noteCardInner}
          >
            <Image source={{ uri: item.image }} style={styles.noteImage} />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.noteDescription} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.noteTimestamp}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  const handleProfilePress = () => {
    Animated.sequence([
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      })
    ]).start(() => {
      router.push('/settings');
    });
  };

  return (
    <TabTransition style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <TouchableOpacity>
           
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notes</Text>
          <TouchableOpacity 
            onPress={handleProfilePress}
            style={{
              transform: [{
                translateX: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 100],
                }),
              }],
            }}
          >
            {userPhotoURL ? (
              <Image 
                source={{ uri: userPhotoURL }} 
                style={styles.profileIcon}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={39} color="black" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="gray" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your notes"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity>
              <Ionicons name="mic-outline" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.sectionTitle}>Pinned</Text>
        <Animated.ScrollView
          contentContainerStyle={styles.noteList}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          overScrollMode="never"
        >
          {renderNotes()}
        </Animated.ScrollView>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
        <AddNoteModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleAddNote}
        />
        <ViewNoteModal
          visible={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          note={selectedNote ? { ...selectedNote, createdAt: typeof selectedNote.createdAt === 'object' ? selectedNote.createdAt : new Date(selectedNote.createdAt).toDateString() } : null}
        />
      </SafeAreaView>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 16,
  },
  noteList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    transform: [{ scale: 1 }, { translateY: 0 }, { rotate: '0deg' }],
    backfaceVisibility: 'hidden',
  },
  noteCardInner: {
    flex: 1,
  },
  noteImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  noteContent: {
    padding: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  noteDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  noteTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: '#00BCD4',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});