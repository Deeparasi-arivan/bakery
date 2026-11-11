const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { verifyToken, isOwner } = require('../middleware/auth');

router.get('/', verifyToken, isOwner, getDashboardStats);

module.exports = router;
