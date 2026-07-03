const visitService = require('../services/visitService');

const createVisit = async (req, res, next) => {
  try {
    const visit = await visitService.createVisit(req.doctor.id, req.body);
    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    if (error.message === 'Patient not found or unauthorized') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const getPatientVisits = async (req, res, next) => {
  try {
    const visits = await visitService.getPatientVisits(req.doctor.id, req.params.patientId);
    res.status(200).json({ success: true, data: visits });
  } catch (error) {
    if (error.message === 'Patient not found or unauthorized') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateVisit = async (req, res, next) => {
  try {
    const visit = await visitService.updateVisit(req.doctor.id, req.params.id, req.body);
    res.status(200).json({ success: true, data: visit });
  } catch (error) {
    if (error.message === 'Visit not found or unauthorized') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const deleteVisit = async (req, res, next) => {
  try {
    await visitService.deleteVisit(req.doctor.id, req.params.id);
    res.status(200).json({ success: true, message: 'Visit deleted successfully' });
  } catch (error) {
    if (error.message === 'Visit not found or unauthorized') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  createVisit,
  getPatientVisits,
  updateVisit,
  deleteVisit
};
