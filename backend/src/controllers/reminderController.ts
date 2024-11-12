import { Request, Response } from 'express';
import { Reminder } from '../models/Reminder';
import { AuthRequest } from '../middleware/auth';

export const getReminders = async (req: AuthRequest, res: Response) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id })
      .sort({ dateTime: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reminders' });
  }
};

export const createReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { title, message, dateTime } = req.body;
    const reminder = new Reminder({
      userId: req.user._id,
      title,
      message,
      dateTime: new Date(dateTime)
    });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    res.status(400).json({ error: 'Error creating reminder' });
  }
};

export const updateReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    res.status(400).json({ error: 'Error updating reminder' });
  }
};

export const deleteReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findOneAndDelete({ 
      _id: id, 
      userId: req.user._id 
    });
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting reminder' });
  }
};

export const completeReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { completed: true },
      { new: true }
    );
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    res.status(400).json({ error: 'Error completing reminder' });
  }
}; 