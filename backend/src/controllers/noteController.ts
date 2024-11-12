import { Request, Response } from 'express';
import { Note } from '../models/Note';
import { AuthRequest } from '../middleware/auth';

export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
      
    // Format dates before sending to client
    const formattedNotes = notes.map(note => ({
      ...note,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString()
    }));
    
    res.json(formattedNotes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notes' });
  }
};

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, image, audioUrl } = req.body;
    const note = new Note({
      userId: req.user._id,
      title,
      description,
      image,
      audioUrl
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: 'Error creating note' });
  }
};

// Add other controller methods (updateNote, deleteNote, etc.) 