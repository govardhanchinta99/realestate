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

module.exports = router;
