const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'djeuycmcu', 
  api_key: '413525475226234', 
  api_secret: 'yb7WLxq84N_-5FgqQkL5GyXQQX4' 
});

module.exports = cloudinary;