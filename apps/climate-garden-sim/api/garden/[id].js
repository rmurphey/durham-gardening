/**
 * Vercel API Route for Garden Data Storage
 * Handles GET/POST requests for garden configurations using Vercel KV
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // Validate garden ID format (should be UUID-like)
  if (!id || typeof id !== 'string' || id.length < 10) {
    return res.status(400).json({ error: 'Invalid garden ID' });
  }

  const gardenKey = `garden:${id}`;

  try {
    if (req.method === 'GET') {
      // Retrieve garden data
      const gardenData = await kv.get(gardenKey);
      
      if (!gardenData) {
        return res.status(404).json({ error: 'Garden not found' });
      }

      // Add metadata
      const response = {
        ...gardenData,
        lastAccessed: new Date().toISOString(),
        gardenId: id
      };

      return res.status(200).json(response);

    } else if (req.method === 'POST') {
      // Store garden data
      const gardenData = req.body;
      
      // Validate required data structure
      if (!gardenData || typeof gardenData !== 'object') {
        return res.status(400).json({ error: 'Invalid garden data' });
      }

      // Add metadata
      const dataToStore = {
        ...gardenData,
        lastModified: new Date().toISOString(),
        gardenId: id
      };

      await kv.set(gardenKey, dataToStore);
      
      return res.status(200).json({ 
        success: true, 
        gardenId: id,
        lastModified: dataToStore.lastModified
      });

    } else if (req.method === 'DELETE') {
      // Delete garden data
      await kv.del(gardenKey);
      return res.status(200).json({ success: true, deleted: id });

    } else {
      // Method not allowed
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Garden API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}