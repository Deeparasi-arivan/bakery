const express = require('express');
const router = express.Router();
const { getSales, getSalesSummary } = require('../controllers/salesController');
const { verifyToken, isOwner } = require('../middleware/auth');

router.use(verifyToken, isOwner);

router.get('/', getSales);
router.get('/summary', getSalesSummary);

module.exports = router;
