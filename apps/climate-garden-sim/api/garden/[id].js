/**
 * Vercel API Route for Garden Data Storage
 * Handles GET/POST requests for garden configurations using Vercel Blob
 */

import { put, del, list } from '@vercel/blob';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // Validate garden ID format (should be UUID-like)
  if (!id || typeof id !== 'string' || id.length < 10) {
    return res.status(400).json({ error: 'Invalid garden ID' });
  }

  const gardenKey = `garden-${id}.json`;

  try {
    if (req.method === 'GET') {
      // Retrieve garden data from blob storage
      try {
        // List blobs to find our garden file
        const { blobs } = await list({ prefix: `garden-${id}` });
        
        if (blobs.length === 0) {
          return res.status(404).json({ error: 'Garden not found' });
        }
        
        // Fetch the garden data from the blob URL
        const blob = blobs[0];
        const response = await fetch(blob.url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.status}`);
        }
        
        const gardenData = await response.json();
        
        // Add metadata
        const responseData = {
          ...gardenData,
          lastAccessed: new Date().toISOString(),
          gardenId: id
        };

        return res.status(200).json(responseData);
        
      } catch (error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          return res.status(404).json({ error: 'Garden not found' });
        }
        throw error;
      }

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

      // Store in blob storage
      const blob = await put(gardenKey, JSON.stringify(dataToStore), {
        access: 'public',
        contentType: 'application/json'
      });
      
      return res.status(200).json({ 
        success: true, 
        gardenId: id,
        lastModified: dataToStore.lastModified,
        blobUrl: blob.url
      });

    } else if (req.method === 'DELETE') {
      // Delete garden data from blob storage
      try {
        // List blobs to find our garden file
        const { blobs } = await list({ prefix: `garden-${id}` });
        
        if (blobs.length > 0) {
          await del(blobs[0].url);
        }
        
        return res.status(200).json({ success: true, deleted: id });
      } catch (error) {
        // Even if deletion fails, return success for idempotency
        return res.status(200).json({ success: true, deleted: id });
      }

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