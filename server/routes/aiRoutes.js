const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const aiService = require('../services/aiService');
const { getDB } = require('../config/db');

router.post('/ask-policy', async (req, res) => {
  try {
    const { question, history } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const answer = await aiService.answerCustomerQuestion(question, history || []);
    res.json({ answer });
  } catch (error) {
    console.error('Error in /ask-policy:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

router.post('/ask-property', async (req, res) => {
  try {
    const { question, propertyId, propertyContext } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    let context = propertyContext || '';
    if (!context && propertyId && ObjectId.isValid(propertyId)) {
      const property = await getDB().collection('properties').findOne({ _id: new ObjectId(propertyId) });
      if (property) {
        context = [
          `Title: ${property.title}`,
          `Description: ${property.description}`,
          `Location: ${property.location}`,
          `Type: ${property.propertyType}`,
          `Bedrooms: ${property.bedrooms}`,
          `Bathrooms: ${property.bathrooms}`,
          `Amenities: ${(property.amenities || []).join(', ')}`,
        ].join('\n');
      }
    }

    if (!context) return res.status(400).json({ error: 'Property context is required' });

    const answer = await aiService.answerPropertyQuestion({ question, propertyContext: context });
    res.json({ answer });
  } catch (error) {
    console.error('Error in /ask-property:', error);
    res.status(500).json({ error: 'Failed to process property question' });
  }
});

router.post('/summarize-lease', async (req, res) => {
  try {
    const { leaseText } = req.body;
    if (!leaseText || !leaseText.trim()) {
      return res.status(400).json({ error: 'leaseText is required' });
    }

    const summary = await aiService.summarizeLeaseTerms(leaseText);
    res.json(summary);
  } catch (error) {
    console.error('Error in /summarize-lease:', error);
    res.status(500).json({ error: 'Failed to summarize lease' });
  }
});

module.exports = router;
