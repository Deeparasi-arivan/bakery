const express = require('express');
const router = express.Router();
const { registerShop, getCurrentShop } = require('../controllers/shopController');
const { verifyToken, isOwner } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Shop registration can accept uploads for logo and docs
const cpUpload = upload.fields([
  { name: 'shopLogo', maxCount: 1 },
  { name: 'otherDocuments', maxCount: 5 }
]);

router.post('/', verifyToken, isOwner, cpUpload, registerShop);
router.get('/current', getCurrentShop);
router.get('/', getCurrentShop);

module.exports = router;
