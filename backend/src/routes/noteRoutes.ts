import express from 'express';
import { getNotes, createNote } from '../controllers/noteController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getNotes);
router.post('/', auth, createNote);

export default router; 