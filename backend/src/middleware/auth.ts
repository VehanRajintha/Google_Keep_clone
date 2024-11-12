import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      // Create new user if they don't exist in MongoDB
      const newUser = new User({
        email: decodedToken.email,
        firebaseUid: decodedToken.uid,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture
      });
      await newUser.save();
      req.user = newUser;
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
}; 