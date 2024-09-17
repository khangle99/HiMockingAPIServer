import express from 'express';
import Mock from './mockModel.js';  // Import the Mock model
import { db } from './server.js'

const router = express.Router();

router.get('/mocks', async (req, res) => {
    try {
      // Fetch all mock data from MongoDB
      const mocks = await Mock.find();
  
      if (!mocks.length) {
        return res.status(404).json({ message: 'No mocks found' });
      }
  
      res.status(200).json(mocks);
    } catch (error) {
      console.error('Error retrieving mocks:', error);
      res.status(500).json({ message: 'Error retrieving mocks' });
    }
  });

// POST /mock - Create a new mock endpoint
router.post('/mock', async (req, res) => {
  try {
    const { endpoint, method, headers, params, response } = req.body;

    const mock = new Mock({
      endpoint,
      method: method.toUpperCase(),  // Convert method to uppercase (GET, POST, etc.)
      headers,
      params,
      response
    });

    await mock.save();
    res.status(201).json({ message: 'Mock created successfully', mock });
  } catch (error) {
    console.error('Error creating mock:', error);
    res.status(500).json({ message: 'Error creating mock' });
  }
});

router.delete('/mock/:id', async (req, res) => {
  const mockId = req.params.id;

  try {
    // Find and delete the mock API from MongoDB
    const result = await db.collection('mocks').deleteOne({ _id: ObjectId(mockId) });

    if (result.deletedCount === 1) {
      return res.status(200).json({ message: 'Mock API deleted successfully.' });
    } else {
      return res.status(404).json({ message: 'Mock API not found.' });
    }
  } catch (error) {
    console.error('Error deleting mock API:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

router.all('/*', async (req, res) => {
    try {
      const { method, originalUrl, headers, query, body } = req;
      // Find mock based on endpoint and method
      const mock = await Mock.findOne({
        endpoint: originalUrl,
        method: method.toUpperCase(),
      });
  
      if (!mock) {
        return res.status(404).json({ message: 'No mock found for this endpoint' });
      }
    
      // Optionally match headers and params
      const headersMatch = Object.entries(mock.headers.toJSON()).every(
        ([key, value]) => headers[key] == value
      );
  
      // Match either query parameters (GET) or body parameters (POST, PUT)
      const paramsMatch = Object.entries(mock.params.toJSON()).every(([key, value]) => {
        // For GET, check query parameters
        if (method === 'GET') {
          return query[key] === value;
        }
        // For POST, PUT, PATCH, check the body parameters
        console.log('value from reques', value)
        return body[key] === value;
      });

      if (!headersMatch || !paramsMatch) {
        return res.status(400).json({ message: 'Headers or params do not match' });
      }
  
      // Return the mocked response
      res.json(mock.response);
    } catch (error) {
      console.error('Error returning mock:', error);
      res.status(500).json({ message: 'Error retrieving mock response' });
    }
  });

export default router;