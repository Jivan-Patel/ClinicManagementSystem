const patientService = require('../services/patientService');

const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.doctor.id, req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

const getPatients = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await patientService.getPatients(req.doctor.id, page, limit);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(req.doctor.id, req.params.id);
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const patient = await patientService.updatePatient(req.doctor.id, req.params.id, req.body);
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};


const searchPatients = async (req, res, next) => {
  try {
    const { q } = req.query;
    const patients = await patientService.searchPatients(req.doctor.id, q);
    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

const checkDuplicate = async (req, res, next) => {
  try {
    const result = await patientService.checkDuplicate(req.doctor.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  searchPatients,
  checkDuplicate
};
