import { Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { Reminder } from '../models/Reminder';
import { Note } from '../models/Note';

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { displayName, photoURL } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { displayName, photoURL },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Error updating user profile' });
  }
};

export const deleteUserAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Delete user's reminders
    await Reminder.deleteMany({ userId: req.user._id });
    // Delete user's notes
    await Note.deleteMany({ userId: req.user._id });
    // Delete user
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting account' });
  }
};

export const updateUserSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { theme, notifications, language } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { 
          'settings.theme': theme,
          'settings.notifications': notifications,
          'settings.language': language
        }
      },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Error updating settings' });
  }
}; 