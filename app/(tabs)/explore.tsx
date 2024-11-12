import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { TabTransition } from '../components/TabTransition';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { AddReminderModal } from '../components/AddReminderModal';
import { api } from '@/utils/api';

interface Reminder {
  id: string;
  title: string;
  message: string;
  dateTime: Date;
  userId: string;
}

export default function ReminderScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchReminders = async () => {
      try {
        const remindersList = await api.getReminders();
        if (!Array.isArray(remindersList)) {
          throw new Error('Invalid response format');
        }
        setReminders(remindersList);
      } catch (error) {
        console.error("Error fetching reminders:", error);
        alert('Error loading reminders. Please try again.');
      }
    };

    fetchReminders();
  }, []);

  const scheduleNotification = async (reminder: Reminder) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.message,
      },
      trigger: {
        date: reminder.dateTime,
      },
    });
  };

  const renderReminder = ({ item }: { item: Reminder }) => (
    <View style={styles.reminderCard}>
      <View style={styles.reminderInfo}>
        <Text style={styles.reminderTitle}>{item.title}</Text>
        <Text style={styles.reminderMessage}>{item.message}</Text>
        <Text style={styles.reminderDateTime}>
          {item.dateTime.toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  const handleAddReminder = async (title: string, message: string, dateTime: Date) => {
    try {
      if (!auth.currentUser) return;

      const reminderData = {
        title,
        message,
        dateTime,
        userId: auth.currentUser.uid
      };

      await api.createReminder(reminderData);
      const updatedReminders = await api.getReminders();
      setReminders(updatedReminders);
      setShowAddModal(false);
      
      await scheduleNotification({
        id: 'temp', // The actual ID will come from the server
        ...reminderData
      });
    } catch (error) {
      console.error('Error adding reminder:', error);
      alert('Failed to add reminder. Please try again.');
    }
  };

  return (
    <TabTransition style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reminders</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={reminders}
        renderItem={renderReminder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reminderList}
      />
      <AddReminderModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddReminder}
      />
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
  reminderList: {
    padding: 16,
  },
  reminderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reminderMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reminderDateTime: {
    fontSize: 12,
    color: '#999',
  },
});
