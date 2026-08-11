const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'lostfound_plus' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ success: false, error: 'Upload to Cloudinary failed' });
        }
        res.status(200).json({
          success: true,
          imageUrl: result.secure_url
        });
      }
    );

    Readable.from(req.file.buffer).pipe(uploadStream);
  });
});

module.exports = router;
