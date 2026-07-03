const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { protect } = require('../middleware/authMiddleware');
const { validateVisit } = require('../validators/visitValidator');

router.use(protect);

router.post('/', validateVisit, visitController.createVisit);
router.get('/patient/:patientId', visitController.getPatientVisits);
router.put('/:id', validateVisit, visitController.updateVisit);
router.delete('/:id', visitController.deleteVisit);

module.exports = router;
