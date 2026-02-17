const express = require('express');
const crypto = require('crypto');
const { getDB } = require('../config/db');

const router = express.Router();
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve({ salt, hash: derivedKey.toString('hex') });
    });
  });
}

function verifyPassword(password, salt, expectedHash) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      const actualHash = derivedKey.toString('hex');
      resolve(crypto.timingSafeEqual(Buffer.from(actualHash, 'hex'), Buffer.from(expectedHash, 'hex')));
    });
  });
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function decodeGoogleCredential(credential) {
  const parts = String(credential).split('.');
  if (parts.length < 2) throw new Error('Invalid Google credential format');

  const payloadRaw = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = payloadRaw + '='.repeat((4 - (payloadRaw.length % 4)) % 4);
  const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));

  if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google token audience mismatch');
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new Error('Google token expired');
  }

  return payload;
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const normalizedEmail = normalizeEmail(email);
    if (!validateEmail(normalizedEmail)) return res.status(400).json({ message: 'Please provide a valid email address' });
    if (String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const users = getDB().collection('users');
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: 'An account with this email already exists' });

    const { hash, salt } = await hashPassword(password);
    const userName = name ? String(name).trim() : 'User';
    const result = await users.insertOne({
      name: userName,
      email: normalizedEmail,
      authProvider: 'email',
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      message: 'Signup successful',
      user: { id: result.insertedId, name: userName, email: normalizedEmail },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Failed to signup user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const normalizedEmail = normalizeEmail(email);
    const users = getDB().collection('users');
    const user = await users.findOne({ email: normalizedEmail });

    if (!user || !user.passwordHash || !user.passwordSalt) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const validPassword = await verifyPassword(String(password), user.passwordSalt, user.passwordHash);
    if (!validPassword) return res.status(401).json({ message: 'Invalid email or password' });

    return res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Failed to login user' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential is required' });
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(500).json({ message: 'GOOGLE_CLIENT_ID is not configured on server' });

    const payload = decodeGoogleCredential(credential);

    if (!payload?.email) return res.status(400).json({ message: 'Google account email not available' });
    if (payload.email_verified === false) return res.status(400).json({ message: 'Google email is not verified' });

    const normalizedEmail = normalizeEmail(payload.email);
    const users = getDB().collection('users');
    let user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      const newUser = {
        name: payload.name || 'Google User',
        email: normalizedEmail,
        authProvider: 'google',
        googleSub: payload.sub,
        avatar: payload.picture || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await users.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            authProvider: user.authProvider || 'google',
            googleSub: payload.sub,
            avatar: payload.picture || user.avatar || '',
            updatedAt: new Date(),
          },
        },
      );
    }

    return res.json({
      message: 'Google authentication successful',
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar || payload.picture || '' },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(401).json({ message: 'Google authentication failed' });
  }
});

module.exports = router;
