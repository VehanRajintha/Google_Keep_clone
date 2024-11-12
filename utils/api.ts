import { auth } from '@/config/firebase';

const API_URL = 'http://localhost:3003/api';

async function getAuthHeader() {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export const api = {
  async getNotes() {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/notes`, { headers });
    return response.json();
  },

  async createNote(noteData: any) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(noteData)
    });
    return response.json();
  },

  async getReminders() {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/reminders`, { headers });
    return response.json();
  },

  async createReminder(reminderData: any) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/reminders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reminderData)
    });
    return response.json();
  },

  async deleteReminder(id: string) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/reminders/${id}`, {
      method: 'DELETE',
      headers
    });
    return response.json();
  },

  async getUserProfile() {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/users/profile`, { headers });
    return response.json();
  },

  async updateUserProfile(profileData: any) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData)
    });
    return response.json();
  },

  async updateReminder(id: string, reminderData: any) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/reminders/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(reminderData)
    });
    return response.json();
  },

  async completeReminder(id: string) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/reminders/${id}/complete`, {
      method: 'PATCH',
      headers
    });
    return response.json();
  }
}; 