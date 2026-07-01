const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { validatePatient } = require('../validators/patientValidator');

router.use(protect);

router.get('/search', patientController.searchPatients);
router.post('/check-duplicate', patientController.checkDuplicate);
router.post('/', validatePatient, patientController.createPatient);
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.put('/:id', validatePatient, patientController.updatePatient);

module.exports = router;
