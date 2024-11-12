import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '@/config/firebase';
import { TabTransition } from '../components/TabTransition';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '@/utils/storage';

export default function Settings() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleUpdateProfilePicture = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploading(true);
        const uri = result.assets[0].uri;
        const path = `profile-pictures/${auth.currentUser?.uid}/profile.jpg`;
        
        try {
          const downloadURL = await uploadFile(uri, path);
          
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
              photoURL: downloadURL
            });
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to update profile picture. Please try again.');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image. Please try again.');
    }
  };

  const userPhotoURL = auth.currentUser?.photoURL;

  return (
    <TabTransition style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.profileSection}>
            <TouchableOpacity 
              style={styles.avatar}
              onPress={handleUpdateProfilePicture}
              disabled={uploading}
            >
              {userPhotoURL ? (
                <Image 
                  source={{ uri: userPhotoURL }} 
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="person-circle" size={80} color="#666" />
              )}
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.email}>{auth.currentUser?.email}</Text>
            <Text style={styles.tapToChange}>Tap to change profile picture</Text>
          </View>

          {SETTINGS_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={item.id}
              style={[
                styles.settingItem,
                index === SETTINGS_ITEMS.length - 1 && styles.lastItem
              ]}
            >
              <Ionicons name={item.icon as any} size={24} color="#666" style={{ marginRight: 12 }} />
              <Text style={styles.settingText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={[styles.settingItem, styles.logoutButton]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF4444" style={{ marginRight: 12 }} />
            <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TabTransition>
  );
}

const SETTINGS_ITEMS = [
  { id: 1, title: 'Account', icon: 'person-outline' },
  { id: 2, title: 'Notifications', icon: 'notifications-outline' },
  { id: 3, title: 'Appearance', icon: 'color-palette-outline' },
  { id: 4, title: 'Privacy', icon: 'lock-closed-outline' },
  { id: 5, title: 'Help & Support', icon: 'help-circle-outline' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    marginBottom: 12,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  logoutButton: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutText: {
    color: '#FF4444',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapToChange: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
}); 