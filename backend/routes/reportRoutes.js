const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/export', protect, reportController.exportVisitsExcel);
router.get('/data', protect, reportController.getReportData);

module.exports = router;
