const express = require('express');
const router = express.Router();
const { s3, BUCKET } = require('../storage');

// GET /api/files/:key - Redirect to file URL
router.get('/:key', async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const params = {
      Bucket: BUCKET,
      Key: key
    };
    
    // Check if file exists
    await s3.headObject(params).promise();
    
    // Generate signed URL or redirect to public URL
    const url = s3.getSignedUrl('getObject', {
      ...params,
      Expires: 3600 // 1 hour
    });
    
    res.redirect(url);
  } catch (err) {
    console.error('File not found:', err);
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;
